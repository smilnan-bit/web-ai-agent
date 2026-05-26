import type { ForwardRefRenderFunction } from 'react';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Input, Modal, Spin, message } from 'antd';
import { useRecoilValue } from 'recoil';
import { useMemoizedFn, useThrottleFn } from 'ahooks';
import { v4 as uuid } from 'uuid';
import { IconAIfuzhu, IconAIkongtai, IconFasong, IconFuzhi } from '@/assets/icons';
import { CurrentAppState } from '@/model';

import {
  AIPromptType,
  DEFAUlT_PLACEHOLDER,
} from '@/pages/AppList/components/EditContent/TipWord/AiPromptModal/constants';
import { useQueryLocationSearch } from '@/utils';
import { AppEventBus } from '@/pages/AppList/event';
import { EventTypeEnum } from '@/constants/eventType';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useSteamMsg } from '@/utils';
import './index.less';

export interface AiPromptModalRef {
  open: () => void;
  close: () => void;
}

const Index: ForwardRefRenderFunction<AiPromptModalRef> = (props, ref) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AIPromptType>(AIPromptType.OPTIMIZE);
  const [value, setValue] = useState('');

  const [_, copyToClipboard] = useCopyToClipboard();
  const [viewPrompt, setViewPrompt] = useState('');
  const { appId } = useQueryLocationSearch();

  const currentapp = useRecoilValue(CurrentAppState);

  const textareaRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);

  const { prompt } = currentapp;

  const [isFocused, setIsFocused] = useState(false);

  const wrapperRef = useRef(null);

  const boxRef = useRef<HTMLDivElement>(null);

  const [modeUId, setModeUId] = useState<string>('');

  const { msg, requestMsg, finish, clear } = useSteamMsg({
    loading,
    setLoading,
    uuid: modeUId,
    requestUrl: '/agent/api/app/prompt/optimize',
  });

  const { run: handleScrollToBottom } = useThrottleFn(
    () => {
      if (boxRef.current) {
        boxRef.current.scrollTo({
          top: boxRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    },
    {
      wait: 50,
    },
  );

  useEffect(() => {
    handleScrollToBottom();
    setViewPrompt(msg);
  }, [msg]);

  useEffect(() => {
    if (!open) {
      clear();
      setViewPrompt('');
      setValue('');
      setIsFocused(false);
      setLoading(false);
      setModeUId('');
    } else {
      if (!prompt) {
        setActiveTab(AIPromptType.GENERATE);
      } else {
        setActiveTab(AIPromptType.OPTIMIZE);
      }
      setModeUId(uuid());
    }
  }, [open]);

  useImperativeHandle(ref, () => {
    return {
      open: () => setOpen(true),
      close: () => setOpen(false),
    };
  });

  const handleChangeActiveTab = useMemoizedFn((key: AIPromptType) => {
    if (!finish) return message.info('请等待当前请求完成');
    if (activeTab === AIPromptType.GENERATE && !prompt && key === AIPromptType.OPTIMIZE)
      return message.info('当前应用暂无提示词');
    setViewPrompt('');
    setActiveTab(key);
  });

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleIconClick = useMemoizedFn((e) => {
    if (!finish) return message.info('请等待当前请求完成');
    if (!value) return message.info('请输入内容');
    let params: {
      hint: string;
      appId: number;
      type: AIPromptType;
      oldPrompt?: string;
    } = {
      hint: value || '',
      appId,
      type: activeTab,
    };
    if (activeTab === AIPromptType.OPTIMIZE) params = { ...params, oldPrompt: prompt };
    e.stopPropagation();
    requestMsg(params);
    textareaRef?.current?.blur();
    setIsFocused(false);
  });

  const handleClickItem = useCallback(
    (e) => {
      if (e.target !== textareaRef.current?.resizableTextArea?.textArea) {
        textareaRef.current?.focus();
      }
    },
    [textareaRef],
  );

  const handleWrapperClick = useCallback((e) => {
    if (wrapperRef.current && !wrapperRef.current?.contains(e.target)) {
      setIsFocused(false);
    }
  }, []);

  const handleCopyClick = useMemoizedFn(() => {
    if (!viewPrompt) return;
    copyToClipboard(viewPrompt, () => {
      message.success('复制成功');
    });
  });

  const handleUseClick = useMemoizedFn((prompt) => {
    Modal.confirm({
      title: '确认使用该提示词？',
      content: '使用后将替换当前提示词，是否继续？',
      okText: '确 定',
      cancelText: '取 消',
      onOk: () => {
        AppEventBus.emit(EventTypeEnum.saveAppData, { prompt }, true, true);
        setOpen(false);
      },
    });
  });

  const hasViewPrompt = useMemo(() => !!viewPrompt, [viewPrompt]);

  const RenderContet = useMemoizedFn(() => {
    let Comp = (
      <div className={'ai-prompt-content-default'}>
        <div className={'apcd-innner'}>
          <IconAIkongtai size={48} />
          <span>请在下方描述您的需求</span>
          <span>提示词结果将在此处显示</span>
        </div>
      </div>
    );

    if (hasViewPrompt) {
      Comp = (
        <div className={`ai-prompt-content-prompt ${hasViewPrompt ? 'apcp-noPadding' : ''}`}>
          <div className={`apcp-inner ${hasViewPrompt ? 'apcp-inner-padding' : ''}`} ref={boxRef}>
            <pre>{viewPrompt}</pre>
          </div>
          {finish ? (
            <div className={'apcp-operate'}>
              <div className={'apcp-operate-use'} onClick={() => handleUseClick(viewPrompt)}>
                使 用
              </div>
              <div className={'apcp-operate-copy'} onClick={handleCopyClick}>
                <IconFuzhi color={'#337eff'} />
                复制
              </div>
            </div>
          ) : null}
        </div>
      );
    }
    if (loading) Comp = null;
    return <Spin spinning={loading}>{Comp}</Spin>;
  });

  return open ? (
    <Modal
      width={800}
      open={open}
      className={'ai-prompt-modal'}
      footer={null}
      maskClosable={false}
      onCancel={() => setOpen(false)}
      title={
        <div className={'ai-prompt-modal-title'}>
          <IconAIfuzhu size={18} />
          <span>提示词AI辅助</span>
        </div>
      }
    >
      <div onClick={handleWrapperClick} id={'ai-prompt-modal-box'}>
        <div className={'ai-prompt-modal-tab'}>
          <div className={`tab-slider ${activeTab === AIPromptType.GENERATE ? 'slide-right' : 'slide-left'}`} />
          <span
            className={`tab-item ${activeTab === AIPromptType.OPTIMIZE ? 'active' : ''}`}
            onClick={() => handleChangeActiveTab(AIPromptType.OPTIMIZE)}
          >
            优化提示词
          </span>
          <span
            className={`tab-item ${activeTab === AIPromptType.GENERATE ? 'active' : ''}`}
            onClick={() => handleChangeActiveTab(AIPromptType.GENERATE)}
          >
            生成提示词
          </span>
        </div>
        <div className={`ai-prompt-content ${hasViewPrompt ? 'ai-prompt-content-noPadding ' : ''}`}>
          {RenderContet()}
        </div>
        <div
          className={`ai-prompt-textarea-wrapper ${isFocused ? 'wrapper-focused' : ''}`}
          onClick={handleClickItem}
          ref={wrapperRef}
        >
          <Input.TextArea
            placeholder={DEFAUlT_PLACEHOLDER[activeTab]}
            rows={4}
            value={value}
            ref={textareaRef}
            onChange={(e) => setValue(e.target.value)}
            onFocus={handleFocus}
            autoSize={true}
            className="aptw-textarea"
            bordered={false}
          />
          <div className={`aptw-textarea-icon ${isFocused ? 'focused' : 'unfocused'}`} onClick={handleIconClick}>
            <IconFasong size={16} color={'#FFFFFF'} />
          </div>
        </div>
        <p className={'ai-prompt-alert'}>内容由AI生成，无法确保真实准确，仅供参考</p>
      </div>
    </Modal>
  ) : null;
};

export default React.forwardRef(Index);
