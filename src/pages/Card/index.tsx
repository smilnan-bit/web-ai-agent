import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Modal, Spin, Tooltip, message } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { nanoid } from 'nanoid';
import { useRequest } from 'ahooks';
import { useRouter } from '@ysf/ys-router';
import { IconFasong, IconXingxing } from '@/assets/icons';
import { deleteCard, getCardList } from '@/api/card';
import type { CardItem } from '@/api/card';
import { useCotUIStream } from '@/pages/CardEditor/hooks/useCotUIStream';
import SpecPreview from '@/pages/CardEditor/components/SpecPreview';
import { defaultSpec } from '@/pages/CardEditor/constants';
import { defaultRuntimeData } from '@/pages/CardEditor/utils/runtime-data';
import type { ChatMessage, PreviewSpec } from '@/pages/CardEditor/types';
import ViewCardModal from './components/ViewCardModal';
import { mockCardList } from './mockData';
import './index.less';

const ModuleName = 'CardManagement';
const MIN_COL_WIDTH = 340; // 每列最小宽度（px）
const MAX_COLS = 3;

const TOOLTIP_TEXT = `您可通过下方文本框输入想要生成的卡片样式/使用场景等方面的要求，AI将自动为您生成。\n生成后，如需调整，您可通过指令进一步要求AI进行调整，或通过直接更改Json的方式改变卡片样式。\n生成的卡片可在【工作流-对话节点-卡片】中进行选择使用。`;

const Card: React.FC = () => {
  const { navigate, routesMap } = useRouter();
  const pageSize = 20;
  const [page, setPage] = useState(1);
  const [allList, setAllList] = useState<CardItem[]>([]);
  const [total, setTotal] = useState(0);
  const hasMore = allList.length < total;

  // 查看弹窗
  const [viewCardId, setViewCardId] = useState<string | null>(null);
  const [viewVisible, setViewVisible] = useState(false);

  const [emptyPrompt, setEmptyPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 下拉加载更多的哨兵 div
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 列表数据（累积追加）
  const { loading, run: loadPage } = useRequest(() => getCardList({ pageNo: page, pageSize }), {
    manual: true,
    onSuccess: (res) => {
      const apiList = res?.data?.list ?? [];
      const apiTotal = res?.data?.total ?? 0;
      if (apiTotal === 0 && page === 1) {
        setTotal(mockCardList.length);
        setAllList(mockCardList);
      } else {
        setTotal(apiTotal);
        setAllList((prev) => (page === 1 ? apiList : [...prev, ...apiList]));
      }
    },
  });

  // 初始加载 & page 变化时加载
  useEffect(() => {
    loadPage();
  }, [page]);

  const refresh = useCallback(() => {
    setPage(1);
    setAllList([]);
    // page 已是 1 时 useEffect 不会重新触发，手动调一次
    loadPage();
  }, [loadPage]);

  const isEmpty = !loading && total === 0 && page === 1;

  // IntersectionObserver：滚动到底部时加载下一页
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // 删除逻辑（供列表和查看弹窗共用）
  const handleDelete = useCallback(
    (id: string) => {
      Modal.confirm({
        title: '删除',
        content: '删除后，将不可恢复，请谨慎选择。',
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          const res = await deleteCard({ id });
          if (res.code === 200) {
            message.success('删除成功');
            refresh();
          } else {
            message.error(res.message ?? '删除失败');
          }
        },
      });
    },
    [refresh],
  );

  // 空状态：用 useCotUIStream 驱动 SSE，end 时跳转到编辑页
  // pendingSessionRef 用于在 onResolved 闭包中拿到本次发送时生成的 sessionId
  const pendingSessionRef = useRef('');
  const pendingHistoryRef = useRef<ChatMessage[]>([]);

  const { sendStream, loading: generating } = useCotUIStream({
    onResolved: useCallback(
      (resolved, _history) => {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: resolved.reply,
          log: resolved.log,
        };
        navigate(routesMap.cardEditor.path, {
          state: {
            initialSpec: resolved.nextSpec,
            initialMessages: [...pendingHistoryRef.current, assistantMessage],
            sessionId: pendingSessionRef.current,
            fromRequirement: true,
          },
        });
      },
      [navigate, routesMap],
    ),
    onError: useCallback((errMsg) => {
      if (errMsg?.startsWith('__LOGIN_REQUIRED__')) {
        navigate(routesMap.cardEditor.path, {
          state: {
            initialSpec: defaultSpec,
            initialMessages: pendingHistoryRef.current,
            sessionId: pendingSessionRef.current,
          },
        });
        return;
      }
      message.error(errMsg || '生成失败，请稍后重试');
    }, [navigate, routesMap]),
  });

  const handleEmptySend = useCallback(async () => {
    const prompt = emptyPrompt.trim();
    if (!prompt || generating) return;

    // 关键词检测：「商品卡片」直接跳转编辑页，不发 SSE
    if (prompt.includes('商品卡片')) {
      navigate(routesMap.cardEditor.path, {
        state: { sessionId: nanoid(), fromRequirement: true },
      });
      return;
    }

    // 在发起请求前生成 sessionId，后续跳转到编辑页时透传，
    // 确保首次生成请求与编辑页的后续对话属于同一会话
    const sessionId = nanoid();
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: prompt };
    const nextHistory: ChatMessage[] = [userMessage];

    pendingSessionRef.current = sessionId;
    pendingHistoryRef.current = nextHistory;

    await sendStream({ message: prompt, currentSpec: defaultSpec, messages: nextHistory, sessionId });
  }, [emptyPrompt, generating, sendStream, navigate, routesMap]);

  const MAX_PROMPT_LENGTH = 2000;

  // textarea 自动增高 + 字符数限制
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > MAX_PROMPT_LENGTH) return;
    setEmptyPrompt(val);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }, []);

  // —— 瀑布流：JS 动态计算列数 ——

  const [masonryWidth, setMasonryWidth] = useState(0);
  const masonryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = masonryRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setMasonryWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isEmpty]); // isEmpty 变化时重新挂载 observer

  const columnCount = useMemo(() => {
    if (masonryWidth <= 0 || allList.length === 0) return 1;
    const fitCols = Math.floor(masonryWidth / MIN_COL_WIDTH);
    // 不超过 MAX_COLS，不超过实际卡片数，至少 1 列
    return Math.max(1, Math.min(fitCols, MAX_COLS, allList.length));
  }, [masonryWidth, allList.length]);

  // 将卡片 round-robin 分配到各列，确保每列数量均匀
  const columns = useMemo(() => {
    const cols: CardItem[][] = Array.from({ length: columnCount }, () => []);
    allList.forEach((card, idx) => {
      cols[idx % columnCount].push(card);
    });
    return cols;
  }, [allList, columnCount]);

  // 渲染单个卡片
  const renderCardItem = useCallback(
    (card: CardItem) => {
      // uiJson 是后端返回的 JSON 字符串，需要 parse 后传给 SpecPreview
      let spec: PreviewSpec | null = null;
      try {
        spec = JSON.parse(card.uiJson);
      } catch {
        // 解析失败时不渲染缩略图
      }
      return (
        <div key={card.id} className={`${ModuleName}-card`}>
          {/* 缩略图：按实际 spec 高度自适应 */}
          {spec && (
            <div className={`${ModuleName}-thumbnail`}>
              <SpecPreview spec={spec} runtimeData={defaultRuntimeData} fitContainer />
            </div>
          )}
          {!spec && (
            <div style={{ height: 110, background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box' }}>
              <div style={{ fontSize: 13, color: '#8f959e', textAlign: 'center', lineHeight: 1.5 }}>{card.specName}</div>
            </div>
          )}

          {/* hover 遮罩 */}
          <div className={`${ModuleName}-card-overlay`}>
            <span
              className={`${ModuleName}-card-overlay-action`}
              onClick={() => {
                setViewCardId(card.id);
                setViewVisible(true);
              }}
            >
              查看
            </span>
            <span
              className={`${ModuleName}-card-overlay-action`}
              onClick={() => navigate(routesMap.cardEditor.path, { query: { id: card.id } })}
            >
              编辑
            </span>
            <span
              className={`${ModuleName}-card-overlay-action ${ModuleName}-card-overlay-action--danger`}
              onClick={() => handleDelete(card.id)}
            >
              删除
            </span>
          </div>
        </div>
      );
    },
    [navigate, handleDelete],
  );

  return (
    <Spin spinning={loading} wrapperClassName={`${ModuleName}-spin-wrapper`}>
      {/* 空状态 */}
      {isEmpty && (
        <div className={`${ModuleName}-empty`}>
          <div className={`${ModuleName}-empty-content`}>
            <div className={`${ModuleName}-empty-title`}>
              <IconXingxing />
              AI生成卡片
              <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{TOOLTIP_TEXT}</span>}>
                <InfoCircleOutlined style={{ fontSize: 18, cursor: 'pointer', color: 'var(--color-ysf-third)' }} />
              </Tooltip>
            </div>
            <div className={`${ModuleName}-empty-subtitle`}>
              欢迎使用AI生成卡片功能，请在下方输入您需要生成的卡片要求。
            </div>

            {/* 输入框 */}
            <div className={`${ModuleName}-empty-input-wrap`}>
              <textarea
                ref={textareaRef}
                placeholder="可以在此处输入您的要求"
                value={emptyPrompt}
                maxLength={MAX_PROMPT_LENGTH}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEmptySend();
                  }
                }}
              />
              {emptyPrompt.length > 0 && (
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--color-ysf-third)',
                    alignSelf: 'flex-end',
                    margin: '8px 0',
                  }}
                >
                  {emptyPrompt.length} / {MAX_PROMPT_LENGTH}
                </span>
              )}
              <button
                className={`${ModuleName}-empty-send-btn`}
                disabled={!emptyPrompt.trim() || generating}
                onClick={handleEmptySend}
              >
                {generating ? (
                  <span className={`${ModuleName}-empty-send-loading`} />
                ) : (
                  <IconFasong size={16} color="#FFF" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 有数据状态 */}
      {!isEmpty && (
        <div tw="p-[24px 20px]">
          <div className={`${ModuleName}-header`}>
            <span className={`${ModuleName}-header-title`}>卡片管理</span>
            <Button
              type="primary"
              onClick={() => navigate(routesMap.cardEditor.path, { state: { sessionId: nanoid() } })}
            >
              新建卡片
            </Button>
          </div>

          {/* 瀑布流：Flex 多列布局，JS round-robin 分配卡片 */}
          <div ref={masonryRef} className={`${ModuleName}-masonry`}>
            {columns.map((colItems, colIdx) => (
              <div key={colIdx} className={`${ModuleName}-masonry-col`}>
                {colItems.map(renderCardItem)}
              </div>
            ))}
          </div>

          {/* 下拉加载更多哨兵 */}
          <div ref={sentinelRef} className={`${ModuleName}-sentinel`}>
            {loading && <span className={`${ModuleName}-load-more-text`}>加载中...</span>}
            {!hasMore && allList.length > 0 && <span className={`${ModuleName}-load-more-text`}>已加载全部</span>}
          </div>
        </div>
      )}

      {/* 查看弹窗 */}
      <ViewCardModal
        visible={viewVisible}
        cardId={viewCardId}
        onClose={() => setViewVisible(false)}
        onDelete={handleDelete}
      />
    </Spin>
  );
};

export default Card;
