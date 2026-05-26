import React from 'react';
import { useRouter } from '@ysf/ys-router';
import SceneMining from '../pages/SceneMining';
import '../ai-build.css';

const SceneMiningPage: React.FC = () => {
  const { navigate, currentRoute } = useRouter();

  const handleCreateScene = (msg: string) => {
    navigate('/ai-build/build', { state: { initialMessage: msg } });
  };

  return (
    <div className="ai-build-root" style={{ height: '100%' }}>
      <div className="layout-breadcrumb" style={{ padding: '12px 0' }}>
        <span style={{ fontSize: 18, fontWeight: 600 }}>{currentRoute.title}</span>
      </div>
      <SceneMining onCreateScene={handleCreateScene} />
    </div>
  );
};

export default SceneMiningPage;
