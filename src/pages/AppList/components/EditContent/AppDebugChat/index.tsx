import React, { useState } from 'react';
import type { FC } from 'react';
import ChatPanel from '@/components/ChatPanel';
import { useRecoilValue } from 'recoil';
import { CurrentAppState } from '@/model';
import { DEFAULT_AVATAR_URL, nosConfig } from '@/constants';
import { asrApi, fetchDocLink } from '@/api';
import { nodeRegistries } from '@/pages/Workflow/NewGraph/nodes';
import SimulateSessionPanel from '@/components/SimulateSessionPanel';

const workflowIconMap = nodeRegistries.reduce<Record<number, FC>>((acc, registry) => {
  const Icon = registry.info?.icon;
  if (Icon) {
    acc[registry.type] = Icon;
  }
  return acc;
}, {});

const AI_CHAT_URL = '/agent/api/app/configuration/debug';
const AppDebugChat = ({
  showSimulateSession,
  setShowSimulateSession,
}: {
  showSimulateSession: boolean;
  setShowSimulateSession: (show: boolean) => void;
}) => {
  const { appId, avatarUrl, version } = useRecoilValue(CurrentAppState);
  const [simulateInfo, setSimulateInfo] = useState<{ sessionId?: string }>({ sessionId: '' });

  const onSubmit = async (info) => {
    setSimulateInfo(info);
    setShowSimulateSession(false);
  };

  return (
    <>
      {showSimulateSession && (
        <SimulateSessionPanel
          onSave={onSubmit}
          onCancel={() => setShowSimulateSession(false)}
          simulateSessionInfo={{ sessionId: simulateInfo.sessionId }}
        />
      )}
      <ChatPanel
        appId={appId}
        requestUrl={AI_CHAT_URL}
        style={{ border: 'none', height: 'calc(100% - 56px)' }}
        askAvatar={avatarUrl || DEFAULT_AVATAR_URL}
        answerAvatar={'https://res.qiyukf.net/storage/4b6136b1-5129-4226-92ae-b25848b27707.png'}
        fetchDocLinkRequest={fetchDocLink}
        nosConfig={nosConfig}
        asrRequest={asrApi}
        sessionId={simulateInfo?.sessionId}
        iconMap={workflowIconMap}
        versionId={version}
      />
    </>
  );
};

export default AppDebugChat;
