import { NodeStatusRender } from './render';
import React from 'react';
import { useNodeTestRunReport } from '../use-node-testrun-report';
import { useRefreshLineStyle } from '../use-refresh-line-style';

export const NodeStatusBar = () => {
  const report = useNodeTestRunReport();
  useRefreshLineStyle();

  if (!report) {
    return null;
  }

  return <NodeStatusRender report={report} />;
};
