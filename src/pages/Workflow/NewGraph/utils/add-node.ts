import type { WorkflowDocument, WorkflowNodeJSON } from '@flowgram.ai/free-layout-editor';
import type { WorkflowNodeType } from '../nodes';
import { message } from 'antd';
import { WorkflowEventNameEnum, workflowGlobalEmit } from '../event';

export const addNode: (data: {
  nodeType: WorkflowNodeType;
  document: WorkflowDocument;
  onAdd: (nodeJSON: WorkflowNodeJSON) => Promise<void> | void;
  nodeJSON: WorkflowNodeJSON;
}) => Promise<void> = async ({ nodeType, document, onAdd, nodeJSON }) => {
  const nodeRegistry = document?.getNodeRegistry?.(nodeType);
  const nodeMeta = nodeRegistry?.meta;
  if (nodeMeta?.maxNum && nodeMeta?.maxNum > 0) {
    const nodes = document.getAllNodes().filter((node) => node.getNodeMeta().type === nodeType);
    if (nodes.length >= nodeMeta.maxNum) {
      message.warning(`最多只能添加${nodeMeta.maxNum}个${nodeRegistry.info?.title}节点`);
      return;
    }
  }
  if (nodeMeta?.addModal) {
    workflowGlobalEmit(WorkflowEventNameEnum.ADD_NODE_MODAL_OPEN, {
      open: true,
      nodeType: nodeType as unknown as WorkflowNodeType,
      onAdd,
    });
    return;
  } else {
    await onAdd(nodeJSON);
  }
};
