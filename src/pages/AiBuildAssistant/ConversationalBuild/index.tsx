import React from 'react';
import { useRouter } from '@ysf/ys-router';
import { useQueryLocationState } from '@/utils';
import ConversationalBuild from '../pages/ConversationalBuild';
import '../ai-build.css';

const ConversationalBuildPage: React.FC = () => {
  const { navigate, routesMap, currentRoute } = useRouter();
  const locationState = useQueryLocationState() as { initialMessage?: string } | null;

  const handleCreated = (agentData: { appId: number; appName: string; appDesc: string }) => {
    navigate(routesMap.apps?.path || '/apps', { state: { newAgent: agentData } });
  };

  return (
    <div className="ai-build-root" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="layout-breadcrumb" style={{ padding: '12px 0' }}>
        <span style={{ fontSize: 18, fontWeight: 600 }}>{currentRoute.title}</span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ConversationalBuild initialMessage={locationState?.initialMessage ?? null} onCreated={handleCreated} />
      </div>
    </div>
  );
};

export default ConversationalBuildPage;
