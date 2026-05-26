import ChatPanel, { DebugTypeEnum } from '@/components/ChatPanel';
import type { ChatInstance, IMsg } from '@ysf/ai-chat/es/type';
import React, { useContext, useRef, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { BasicInfoState } from '../../../model';
import { SidebarContext } from '../../../context';
import { workflowGlobalRegister, workflowGlobalUnregister, WorkflowEventNameEnum } from '../../../event';
import isEmpty from 'lodash/isEmpty';

interface TestChatPanelProps {
  onListChange: (data: { loading: boolean; list: IMsg[] }) => void;
  simulateInfo: { sessionId?: string; startNodeParams?: Record<string, any> };
}

const TestChatPanel = ({ onListChange, simulateInfo }: TestChatPanelProps) => {
  const { workflowId } = useRecoilValue(BasicInfoState) || {};
  const { isHistoryMode, currentVersion } = useContext(SidebarContext);
  const chatRef = useRef<ChatInstance | null>(null);

  // 监听版本切换事件，清除聊天记录
  useEffect(() => {
    const handleVersionSwitch = () => {
      chatRef.current?.clearChat?.();
    };
    workflowGlobalRegister(WorkflowEventNameEnum.VERSION_SWITCH, handleVersionSwitch);
    return () => {
      workflowGlobalUnregister(WorkflowEventNameEnum.VERSION_SWITCH, handleVersionSwitch);
    };
  }, []);

  return (
    <ChatPanel
      onListChange={onListChange}
      sessionId={simulateInfo?.sessionId}
      requestBody={{
        workflowId,
        debugType: DebugTypeEnum.agentWorkflowDebug,
        ...(!isEmpty(simulateInfo.startNodeParams) ? { startNodeParams: simulateInfo.startNodeParams } : {}),
        ...(isHistoryMode && currentVersion ? { version: currentVersion } : {}),
      }}
      ref={(el) => {
        chatRef.current = el;
      }}
    />
  );
};

export default TestChatPanel;
