import type { FlowNodeType, WorkflowNodeEntity } from '@flowgram.ai/free-layout-editor';

import { WorkflowNodeType } from '../nodes';

/**
 * 判断父节点是否可以包含对应子节点
 * Determine whether the parent node can contain the corresponding child node
 * @param childNodeType
 * @param parentNodeType
 */
export function canContainNode(childNodeType: WorkflowNodeType | FlowNodeType, parentNode: WorkflowNodeEntity) {
  /**
   * 开始/结束节点无法tian
   */
  const parentNodeType = parentNode?.flowNodeType;
  if (
    [WorkflowNodeType.Start, WorkflowNodeType.End, WorkflowNodeType.BlockStart, WorkflowNodeType.BlockEnd].includes(
      childNodeType as WorkflowNodeType,
    )
  ) {
    return false;
  }

  //group节点无法嵌套group节点
  if (childNodeType === WorkflowNodeType.Group && parentNodeType === WorkflowNodeType.Group) {
    return false;
  }

  /**
   * 批处理节点子节点类型限制,或批处理内套分组节点时限制子节点类型
   */
  if (
    [WorkflowNodeType.Batch, WorkflowNodeType.Dialog, WorkflowNodeType.Reply, WorkflowNodeType.SubWorkflow].includes(
      childNodeType as WorkflowNodeType,
    ) &&
    (parentNodeType === WorkflowNodeType.Batch || parentNode?.parent?.flowNodeType === WorkflowNodeType.Batch)
  ) {
    return false;
  }
  return true;
}
