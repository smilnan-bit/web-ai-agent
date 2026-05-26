// src/pages/CardEditor/index.tsx

import React, { useCallback, useRef, useState } from 'react';
import { Button, message } from 'antd';
import { useRequest } from 'ahooks';
import { nanoid } from 'nanoid';
import { useRouter } from '@ysf/ys-router';
import Breadcrumbs from '@/components/Breadcrumbs';
import ContentWrapper from '@/components/ContenWrapper';
import { useQueryLocationSearch, useQueryLocationState } from '@/utils';
import { getCardDetail, saveCard, updateCard } from '@/api/card';
import SpecPreview from './components/SpecPreview';
import StructurePanel from './components/StructurePanel';
import ChatPanel from './components/ChatPanel';
import { emptySpec, starterMessages, THINKING_MESSAGE_ID } from './constants';
// 本期不支持模板，暂时不引入：getPresetSpec, presetTemplates
import { cloneRuntimeData, defaultRuntimeData } from './utils/runtime-data';
import { normalizeSpec } from './utils/normalize-spec';
import { useCotUIStream } from './hooks/useCotUIStream';
import { IconPanelCollapseArrow } from '@/assets/icons';
import type { ChatMessage, PreviewSpec, RuntimeData } from './types';

type JsonExpandMode = 'default' | 'all' | 'collapsed';
type SaveStatus = 'saved' | 'unsaved' | 'saving';

/** 吸附在面板右边缘的折叠/展开触发按钮（对应 Figma 132778:5847） */
const PanelToggleButton: React.FC<{ collapsed: boolean; onClick: () => void }> = ({ collapsed, onClick }) => (
  <span
    tw="absolute flex items-center justify-center cursor-pointer z-10 bg-white hover:bg-[#f7f7f8] transition-colors"
    style={{
      width: 16,
      height: 40,
      right: -1,
      top: '50%',
      transform: `translateY(-50%)`,
      borderRadius: '6px 0 0 6px',
      border: '1px solid #eaeaef',
    }}
    onClick={onClick}
  >
    <IconPanelCollapseArrow width={6} height={24} style={{ transform: `${collapsed ? ' scaleX(-1)' : ''}` }} />
  </span>
);

// ========== Demo 商品卡片 Spec（从需求页跳转时展示） ==========

const DEMO_PRODUCT_SINGLE: PreviewSpec = {
  version: '0.2.0',
  theme: { primary: '#505EFA', bg: '#ffffff', text: '#1A1A1A', textMinor: '#767580' },
  root: {
    type: 'card',
    id: 'demo-headphone-card',
    style: { width: '100%', maxWidth: '400px', padding: '20px', radius: '20px', background: '#ffffff', shadow: '0 12px 32px rgba(80,94,250,0.12)' },
    children: [
      {
        type: 'column',
        id: 'demo-headphone-col',
        style: { gap: '12px' },
        children: [
          { type: 'text', id: 'demo-h-badge', text: '换货推荐', as: 'p', style: { color: '#505EFA', fontSize: '12px', fontWeight: '700' } },
          {
            type: 'card',
            id: 'demo-h-img',
            style: { padding: '20px', radius: '16px', background: 'linear-gradient(135deg, #EEF0FF 0%, #C7CFF9 100%)' },
            children: [
              {
                type: 'column',
                id: 'demo-h-img-col',
                style: { gap: '6px' },
                children: [
                  { type: 'text', id: 'demo-h-name', text: '蓝牙降噪耳机 Pro Max', as: 'h2', style: { fontSize: '22px', fontWeight: '700' } },
                  { type: 'text', id: 'demo-h-sub', text: '主动降噪 · 30h续航 · Hi-Fi 音质', as: 'p', style: { color: '#767580', fontSize: '13px' } },
                ],
              },
            ],
          },
          {
            type: 'row',
            id: 'demo-h-price',
            style: { justify: 'between', gap: '8px' },
            children: [
              { type: 'text', id: 'demo-h-p', text: '¥599', as: 'h2', style: { fontSize: '26px', fontWeight: '700', color: '#F5222D' } },
              { type: 'text', id: 'demo-h-op', text: '¥799', as: 'p', style: { color: '#AEADB8', fontSize: '13px' } },
            ],
          },
          { type: 'text', id: 'demo-h-rating', text: '⭐ 4.8 分 · 2,341 条评价', as: 'p', style: { color: '#767580', fontSize: '12px' } },
          {
            type: 'row',
            id: 'demo-h-cta',
            style: { gap: '10px', justify: 'between' },
            children: [
              { type: 'button', id: 'demo-h-buy', label: '立即购买', variant: 'primary', style: { padding: '10px 16px' } },
              { type: 'button', id: 'demo-h-cart', label: '加入购物车', variant: 'secondary', style: { padding: '10px 16px' } },
            ],
          },
        ],
      },
    ],
  },
};

// 截图对应的3张美妆商品数据，用于 fromRequirement 视图的 HTML 直接渲染
const REQ_CARDS = [
  { emoji: '🧴', bg: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)', name: '兰蔻小黑瓶精粹肌底液 30ml', subtitle: '深度保湿 · 修护屏障', price: '188', originalPrice: '220', rating: 4.8, reviewCount: '2,341' },
  { emoji: '🫙', bg: 'linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 100%)', name: '兰蔻菁纯面霜 50ml', subtitle: '抗老锁水 · 滋润修护', price: '180', originalPrice: '240', rating: 4.7, reviewCount: '1,876' },
  { emoji: '💚', bg: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)', name: '科颜氏高保湿霜 50ml', subtitle: '高效补水 · 24h保湿', price: '199', originalPrice: '258', rating: 4.9, reviewCount: '3,102' },
] as const;

const CardEditor: React.FC = () => {
  const { navigate, routesMap } = useRouter();
  const { id } = useQueryLocationSearch() as { id?: string };
  const locationState = useQueryLocationState() as {
    prompt?: string;
    templateSpec?: PreviewSpec;
    initialSpec?: PreviewSpec;
    initialMessages?: ChatMessage[];
    /** 由列表页透传，保证新建首次生成与后续编辑对话使用同一 sessionId */
    sessionId?: string;
    /** 从"输入诉求"流程跳转过来，展示 3 张商品卡片预览 */
    fromRequirement?: boolean;
  } | null;

  const isEdit = Boolean(id);

  // Spec & template state
  const [spec, setSpec] = useState<PreviewSpec>(
    () => locationState?.initialSpec ?? locationState?.templateSpec ?? emptySpec,
  );
  // const [activePreset, setActivePreset] = useState('login');

  // Panel collapse state
  const [isStructurePanelCollapsed, setIsStructurePanelCollapsed] = useState(false);
  const [isJsonPanelCollapsed, setIsJsonPanelCollapsed] = useState(false);
  const [isRuntimePanelCollapsed, setIsRuntimePanelCollapsed] = useState(false);
  // const [isPresetCollapsed, setIsPresetCollapsed] = useState(false);
  const [jsonExpandMode, setJsonExpandMode] = useState<JsonExpandMode>('default');

  // Runtime data state
  const [runtimeData, setRuntimeData] = useState<RuntimeData>(() => cloneRuntimeData(defaultRuntimeData));

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(() => locationState?.initialMessages ?? starterMessages);
  const [chatInput, setChatInput] = useState('');

  // Session ID：优先使用列表页透传的值（保证新建首次生成与后续对话同属一个会话），
  // 否则自行生成（编辑已有卡片、直接进入编辑页等场景）。
  // 组件卸载（刷新/路由切换）后自然重置。
  const [sessionId, setSessionId] = useState<string>(() => locationState?.sessionId ?? nanoid());

  // Save state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('unsaved');

  // 卡片名称（新建时为空，编辑时从接口加载）
  const [specName, setSpecName] = useState('');

  // fromRequirement 模式：竖向/横向切换 + 右侧对话状态
  const [isVertical, setIsVertical] = useState(false);
  const [reqInput, setReqInput] = useState('');
  const [reqMessages, setReqMessages] = useState<ChatMessage[]>([
    { id: 'req-assistant-init', role: 'assistant', content: '你好！我已为你生成了 3 张商品卡片，横向并排展示。你可以试试：「请帮我竖向展示多张商品卡片」' },
  ]);

  // --- 编辑模式：加载卡片数据 ---
  const { loading: detailLoading } = useRequest(() => getCardDetail({ id: id! }), {
    ready: isEdit,
    onSuccess: (res) => {
      const card = res?.data;
      if (card?.uiJson) {
        try {
          setSpec(normalizeSpec(JSON.parse(card.uiJson)));
        } catch {
          // uiJson 解析失败时保持默认 spec
        }
      }
      if (card?.specName) {
        setSpecName(card.specName);
      }
    },
  });

  // --- Clear chat logic ---
  const handleClearChat = useCallback(() => {
    setMessages(starterMessages);
    setChatInput('');
    setSessionId(nanoid());
  }, []);

  // assistantId ref：onChunk / onResolved 共享同一条气泡 id
  const assistantIdRef = useRef('');

  const { sendStream, loading: chatLoading } = useCotUIStream({
    onChunk: useCallback((accumulated) => {
      setMessages((prev) => {
        // 已有该条 assistant 气泡 → 直接替换 content
        if (prev.some((m) => m.id === assistantIdRef.current)) {
          return prev.map((m) => (m.id === assistantIdRef.current ? { ...m, content: accumulated } : m));
        }
        // 首次：把 THINKING 占位消息替换成真实气泡
        return prev.map((m) =>
          m.id === THINKING_MESSAGE_ID
            ? { id: assistantIdRef.current, role: 'assistant' as const, content: accumulated }
            : m,
        );
      });
    }, []),
    onResolved: useCallback((resolved) => {
      console.log('full sse res', resolved);
      setSpec(resolved.nextSpec);
      setSaveStatus('unsaved');
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantIdRef.current ? { ...m, content: resolved.reply, log: resolved.log } : m)),
      );
    }, []),
    onError: useCallback((errMsg) => {
      if (errMsg?.startsWith('__LOGIN_REQUIRED__')) return;
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== THINKING_MESSAGE_ID && m.id !== assistantIdRef.current),
        { id: `assistant-error-${Date.now()}`, role: 'assistant', content: errMsg },
      ]);
    }, []),
  });

  // --- Chat logic (SSE) ---
  const handleSendChat = useCallback(async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || chatLoading) return;

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: trimmed };
    const nextHistory = [...messages, userMessage];
    assistantIdRef.current = `assistant-${Date.now()}`;

    setMessages([...nextHistory, { id: THINKING_MESSAGE_ID, role: 'assistant', content: '正在思考你的页面改动...' }]);
    setChatInput('');

    await sendStream({ message: trimmed, currentSpec: spec, messages: nextHistory, sessionId });
  }, [chatInput, chatLoading, messages, spec, sessionId, sendStream]);

  // --- fromRequirement 模式：右侧对话处理 ---
  const handleRequirementSend = useCallback(() => {
    const trimmed = reqInput.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: `req-user-${Date.now()}`, role: 'user', content: trimmed };
    if (trimmed.includes('竖向') || trimmed.includes('多张')) {
      const assistantMsg: ChatMessage = {
        id: `req-assistant-${Date.now()}`,
        role: 'assistant',
        content: '好的，已为你竖向展示 3 张商品卡片样式，可以继续告诉我需要什么调整。',
      };
      setReqMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsVertical(true);
    } else {
      const assistantMsg: ChatMessage = {
        id: `req-assistant-${Date.now()}`,
        role: 'assistant',
        content: '收到！你可以继续输入需求，比如「请帮我竖向展示多张商品卡片」。',
      };
      setReqMessages((prev) => [...prev, userMsg, assistantMsg]);
    }
    setReqInput('');
  }, [reqInput]);

  // --- Save logic ---
  const handleSave = useCallback(async () => {
    // 校验：card 根节点下没有任何子节点，说明卡片内容为空，不允许保存
    const root = spec.root;
    if (root.type === 'card' && (!('children' in root) || root.children.length === 0)) {
      message.warning('卡片内容为空，请先通过对话生成卡片内容后再保存');
      return;
    }

    setSaveStatus('saving');
    try {
      const normalizedSpec = normalizeSpec(spec);
      const uiJson = JSON.stringify(normalizedSpec);
      // 名称兜底：截取最近一条用户消息内容的前 20 个字符
      const fallbackName = messages.findLast((m) => m.role === 'user')?.content?.slice(0, 20) || '未命名卡片';
      const name = specName.trim() || fallbackName;

      const res = isEdit
        ? await updateCard({ id: id!, specName: name, uiJson })
        : await saveCard({ specName: name, uiJson });

      if (res.code === 200) {
        setSaveStatus('saved');
        message.success(isEdit ? '保存成功！' : '创建成功！');
        navigate(routesMap.card.path);
      } else {
        setSaveStatus('unsaved');
        message.error(res.message ?? '保存失败');
      }
    } catch {
      setSaveStatus('unsaved');
      message.error('保存失败');
    }
  }, [spec, id, isEdit, specName, messages, navigate]);

  // 本期不支持选择模板，handlePresetSwitch 暂时注释
  // const handlePresetSwitch = useCallback((presetId: string) => {
  //   const preset = presetTemplates.find((p) => p.id === presetId);
  //   if (!preset) return;
  //   setActivePreset(presetId);
  //   setSpec(getPresetSpec(presetId));
  //   setMessages([
  //     { id: `assistant-preset-${presetId}`, role: 'assistant', content: `已切换到"${preset.name}"模板，你可以继续通过聊天细化这个页面。` },
  //   ]);
  //   setSaveStatus('unsaved');
  //   setRuntimeData(cloneRuntimeData(defaultRuntimeData));
  // }, []);

  // --- Layout ---
  const gridCols = isStructurePanelCollapsed
    ? '24px minmax(360px, 1.35fr) minmax(320px, 1fr)'
    : 'minmax(280px, 1fr) minmax(360px, 1.35fr) minmax(320px, 1fr)';

  // 从"输入诉求"流程跳转：3 列布局（左侧JSON面板 + 中间卡片预览 + 右侧 AI 对话）
  if (locationState?.fromRequirement) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#F5F5FA' }}>
        {/* 顶部标题栏 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 56, background: '#fff', borderBottom: '1px solid #EBEBF2', flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>新建卡片</span>
          <Button type="primary" onClick={handleSave} loading={saveStatus === 'saving'} style={{ background: '#505EFA', borderColor: '#505EFA' }}>
            保存
          </Button>
        </div>

        {/* 主体：三栏布局 */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左栏：JSON 结构面板 */}
          <div style={{ width: 280, borderRight: '1px solid #EBEBF2', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <StructurePanel
              spec={DEMO_PRODUCT_SINGLE}
              runtimeData={runtimeData}
              onRuntimeDataChange={setRuntimeData}
              isJsonPanelCollapsed={isJsonPanelCollapsed}
              onJsonPanelToggle={() => setIsJsonPanelCollapsed((v) => !v)}
              isRuntimePanelCollapsed={isRuntimePanelCollapsed}
              onRuntimePanelToggle={() => setIsRuntimePanelCollapsed((v) => !v)}
              jsonExpandMode={jsonExpandMode}
              onJsonExpandModeChange={setJsonExpandMode}
              onResetRuntimeData={() => setRuntimeData(cloneRuntimeData(defaultRuntimeData))}
            />
          </div>

          {/* 中栏：商品卡片预览 */}
          <div style={{ flex: 1, overflow: 'auto', padding: '28px 20px', minWidth: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', marginBottom: 4 }}>AI 为您生成了 3 张商品卡片</div>
              <div style={{ fontSize: 12, color: '#767580' }}>基于您的诉求智能生成，可在右侧继续调整样式</div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isVertical ? 'minmax(0,480px)' : 'repeat(3, minmax(0,1fr))',
              gap: 16,
              justifyContent: isVertical ? 'center' : undefined,
              justifyItems: isVertical ? 'center' : undefined,
            }}>
              {REQ_CARDS.map((card, idx) => (
                <div key={idx} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', width: '100%' }}>
                  {/* 图片区 */}
                  <div style={{ height: 130, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
                    {card.emoji}
                  </div>
                  {/* 信息区 */}
                  <div style={{ padding: '14px 16px 16px' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', marginBottom: 4, lineHeight: 1.4 }}>{card.name}</div>
                    <div style={{ fontSize: 12, color: '#767580', marginBottom: 10 }}>{card.subtitle}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#F5222D' }}>¥{card.price}</span>
                      <span style={{ fontSize: 12, color: '#AEADB8', textDecoration: 'line-through' }}>¥{card.originalPrice}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#767580', marginBottom: 14 }}>
                      {'★'.repeat(Math.floor(card.rating))}{'☆'.repeat(5 - Math.floor(card.rating))}{' '}{card.rating}{' '}({card.reviewCount}条)
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ flex: 1, height: 34, background: '#505EFA', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>立即购买</button>
                      <button style={{ flex: 1, height: 34, background: '#fff', color: '#505EFA', border: '1.5px solid #505EFA', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>加入购物车</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右栏：AI 对话区 */}
          <div style={{ width: 320, borderLeft: '1px solid #EBEBF2', display: 'flex', flexDirection: 'column', background: '#fff', flexShrink: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #EBEBF2', fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
              AI对话窗口
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
              {reqMessages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '8px 12px',
                    borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: msg.role === 'user' ? '#505EFA' : '#F5F5FA',
                    color: msg.role === 'user' ? '#fff' : '#1A1A1A',
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid #EBEBF2' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea
                  value={reqInput}
                  onChange={(e) => setReqInput(e.target.value)}
                  placeholder="继续输入需求，如：请帮我竖向展示多张商品卡片"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRequirementSend(); } }}
                  rows={2}
                  style={{ flex: 1, resize: 'none', border: '1px solid #EBEBF2', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', background: '#F5F5FA', fontFamily: 'inherit' }}
                />
                <button
                  onClick={handleRequirementSend}
                  disabled={!reqInput.trim()}
                  style={{ width: 36, height: 36, borderRadius: 8, background: reqInput.trim() ? '#505EFA' : '#EBEBF2', border: 'none', cursor: reqInput.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M7 2l5 5-5 5" stroke={reqInput.trim() ? '#fff' : '#AEADB8'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEdit && detailLoading) {    return (
      <>
        <Breadcrumbs currentText="编辑卡片" />
        <ContentWrapper>
          <div tw="flex items-center justify-center h-full text-[#8f959e]">加载中...</div>
        </ContentWrapper>
      </>
    );
  }

  return (
    <>
      <Breadcrumbs
        currentText={isEdit ? '编辑卡片' : '新建卡片'}
        extra={
          <Button
            type="primary"
            onClick={handleSave}
            loading={saveStatus === 'saving'}
            style={{ background: 'var(--color-ysf-primary)' }}
          >
            保存
          </Button>
        }
        style={{ padding: '16px 20px' }}
      />
      <ContentWrapper tw="rounded-ysf-l p-[0]">
        <div tw="h-full" style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 0 }}>
          {/* 左栏：结构数据 */}
          <div tw="border-r border-[rgba(0,0,0,0.06)] overflow-hidden relative">
            {isStructurePanelCollapsed ? (
              /* 收起态 */
              <div tw="h-full relative">
                <PanelToggleButton collapsed onClick={() => setIsStructurePanelCollapsed(false)} />
              </div>
            ) : (
              <div tw="h-full flex flex-col">
                {/* 展开态：收起按钮吸附右边缘 */}
                <PanelToggleButton collapsed={false} onClick={() => setIsStructurePanelCollapsed(true)} />
                <div tw="flex-1" style={{ minHeight: 0 }}>
                  <StructurePanel
                    spec={spec}
                    runtimeData={runtimeData}
                    onRuntimeDataChange={setRuntimeData}
                    isJsonPanelCollapsed={isJsonPanelCollapsed}
                    onJsonPanelToggle={() => setIsJsonPanelCollapsed((v) => !v)}
                    isRuntimePanelCollapsed={isRuntimePanelCollapsed}
                    onRuntimePanelToggle={() => setIsRuntimePanelCollapsed((v) => !v)}
                    jsonExpandMode={jsonExpandMode}
                    onJsonExpandModeChange={setJsonExpandMode}
                    onResetRuntimeData={() => setRuntimeData(cloneRuntimeData(defaultRuntimeData))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 中栏：预览效果 */}
          <div tw="flex flex-col overflow-hidden border-0 border-r  border-l border-solid border-[rgba(0,0,0,0.06)] px-[20px]">
            <div tw="flex items-center px-3 py-2 border-b border-[rgba(0,0,0,0.06)]">
              <span tw="text-[16px] font-semibold">预览效果</span>
            </div>
            {/* 本期不支持选择模板，模板切换区域暂时隐藏 */}
            {/* {!isPresetCollapsed && (
              <div tw="flex gap-2 px-3 py-2 border-b border-[rgba(0,0,0,0.06)] overflow-x-auto flex-shrink-0">
                {presetTemplates.map((preset) => (
                  <Button key={preset.id} type={activePreset === preset.id ? 'primary' : 'default'} size="small" onClick={() => handlePresetSwitch(preset.id)}>
                    {preset.name}
                  </Button>
                ))}
              </div>
            )} */}
            <div tw="flex-1 overflow-auto p-3 bg-[#f5f5f5]" style={{ minHeight: 0 }}>
              <SpecPreview spec={spec} runtimeData={runtimeData} />
            </div>
          </div>

          {/* 右栏：聊天 */}
          <div tw="flex flex-col overflow-hidden">
            <div tw="flex items-center px-3 py-2 border-b border-[rgba(0,0,0,0.06)]">
              <span tw="text-[16px] font-semibold">AI对话窗口</span>
            </div>
            <div tw="flex-1" style={{ minHeight: 0 }}>
              <ChatPanel
                messages={messages}
                input={chatInput}
                onInputChange={setChatInput}
                onSend={handleSendChat}
                onClear={handleClearChat}
                loading={chatLoading}
              />
            </div>
          </div>
        </div>
      </ContentWrapper>
    </>
  );
};

export default CardEditor;
