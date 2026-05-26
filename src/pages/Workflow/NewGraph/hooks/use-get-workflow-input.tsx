import type { WorkflowNS } from '@/types/Workflow';
import { useService, WorkflowDocument, getNodeForm } from '@flowgram.ai/free-layout-editor';
import { useCallback } from 'react';
import { WorkflowNodeType } from '../nodes';

export const useGetWorkflowInput = (): (() => {
  inputParam?: WorkflowNS.WorkflowSimpleParamType[];
  startNodeId?: string;
}) => {
  const document = useService(WorkflowDocument);

  const getWorkflowInput = useCallback(() => {
    // 查找开始节点
    const startNode = document.root.blocks.find((node) => node.flowNodeType === WorkflowNodeType.Start);

    if (!startNode) {
      return {};
    }

    // 获取节点的表单值
    const form = getNodeForm(startNode);
    const inputParam = form?.getValueIn<WorkflowNS.WorkflowSimpleParamType[]>('inputParam');

    return {
      inputParam,
      startNodeId: startNode.id,
    };
  }, [document]);

  return getWorkflowInput;
};
