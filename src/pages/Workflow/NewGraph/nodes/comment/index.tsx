import { WorkflowNodeType } from '../constants';
import type { FlowNodeRegistry } from '../../typings';
import React from 'react';

export const CommentNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.Comment,
  meta: {
    type: WorkflowNodeType.Comment,
    sidebarDisabled: true,
    nodePanelVisible: false,
    defaultPorts: [],
    renderKey: `${WorkflowNodeType.Comment}`,
    skipCheck: true,
    size: {
      width: 240,
      height: 150,
    },
  },
  formMeta: {
    render: () => <></>,
  },
  getInputPoints: () => [], // Comment 节点没有输入
  getOutputPoints: () => [], // Comment 节点没有输出
};
