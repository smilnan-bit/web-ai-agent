import { WorkflowNodeEntity } from '@flowgram.ai/free-layout-core';
import { WorkflowNodeType } from '../../nodes';

export namespace WorkflowGroupUtils {
  /** 找到节点所有上级 */
  // const findNodeParents = (node: WorkflowNodeEntity): WorkflowNodeEntity[] => {
  //   const parents = [];
  //   let parent = node.parent;
  //   while (parent) {
  //     parents.push(parent);
  //     parent = parent.parent;
  //   }
  //   return parents;
  // };

  /** 节点是否处于分组中 */
  const isNodeInGroup = (node: WorkflowNodeEntity): boolean => {
    // 处于分组中
    if (node?.parent?.flowNodeType === WorkflowNodeType.Group) {
      return true;
    }
    return false;
  };

  /** 是否分组节点 */
  const isGroupNode = (group: WorkflowNodeEntity): boolean =>
    group.flowNodeType === WorkflowNodeType.Group;

  /** 判断节点能否组成分组 */
  export const validate = (nodes: WorkflowNodeEntity[], onError?: (errorMessage: string) => void): boolean => {
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      // 参数不合法
      onError && onError('请选择至少一个节点');
      return false;
    }

    // 判断是否有分组节点
    const isGroupRelatedNode = nodes.some((node) => isGroupNode(node));
    if (isGroupRelatedNode) {
      onError && onError('分组节点不能组成分组');
      return false;
    }

    // 判断是否有开始或结束节点
    const hasStartOrEndNode = nodes.some(
      (node) => node.flowNodeType === WorkflowNodeType.Start || node.flowNodeType === WorkflowNodeType.End,
    );
    if (hasStartOrEndNode) {
      onError && onError('开始/结束节点不能组成分组');
      return false;
    }

    // 判断是否有节点已经处于分组中
    const hasGroup = nodes.some((node) => node && isNodeInGroup(node));
    if (hasGroup) {
      onError && onError('节点已经处于分组中');
      return false;
    }

    // 判断是否来自同一个父亲
    const parent = nodes[0].parent;
    const isSameParent = nodes.every((node) => node.parent === parent);
    if (!isSameParent) {
      onError && onError('必须选择同一层的节点');
      return false;
    }

    return true;
  };
}
