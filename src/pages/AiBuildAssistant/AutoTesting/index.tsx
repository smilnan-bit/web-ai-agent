import React from 'react';
import { useRouter } from '@ysf/ys-router';
import AutoTesting from '../pages/AutoTesting';
import '../ai-build.css';

const AutoTestingPage: React.FC = () => {
  const { currentRoute } = useRouter();
  return (
    <div className="ai-build-root" style={{ height: '100%' }}>
      <div className="layout-breadcrumb" style={{ padding: '12px 0' }}>
        <span style={{ fontSize: 18, fontWeight: 600 }}>{currentRoute.title}</span>
      </div>
      <AutoTesting />
    </div>
  );
};

export default AutoTestingPage;
