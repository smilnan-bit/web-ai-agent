import React, { useState } from 'react';
import type { FC } from 'react';
import AIChat, { type ChatInstance } from '@ysf/ai-chat';
import type { Props } from '@ysf/ai-chat/es/type';
import { DEFAULT_AVATAR_URL, nosConfig } from '@/constants';
import { asrApi, fetchDocLink } from '@/api';
import { nodeRegistries } from '@/pages/Workflow/NewGraph/nodes';

const workflowIconMap = nodeRegistries.reduce<Record<number, FC>>((acc, registry) => {
  const Icon = registry.info?.icon;
  if (Icon) {
    acc[registry.type] = Icon;
  }
  return acc;
}, {});

export enum DebugTypeEnum {
  agentWorkflowDebug = 'AGENT_WORKFLOW_DEBUG',
}

const AI_CHAT_URL = '/agent/api/app/configuration/debug';
const ChatPanel = React.forwardRef<ChatInstance, Props>((props, ref) => {
  return (
    <AIChat
      ref={ref}
      requestUrl={AI_CHAT_URL}
      style={{ border: 'none', height: 'calc(100% - 56px)' }}
      askAvatar={DEFAULT_AVATAR_URL}
      answerAvatar={'https://res.qiyukf.net/storage/4b6136b1-5129-4226-92ae-b25848b27707.png'}
      fetchDocLinkRequest={fetchDocLink}
      nosConfig={nosConfig}
      asrRequest={asrApi}
      iconMap={workflowIconMap}
      {...props}
    />
  );
});

export default ChatPanel;
