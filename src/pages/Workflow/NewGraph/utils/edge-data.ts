import { nanoid } from 'nanoid';
import type { WorkflowEdgeJSON, WorkflowDocument } from '@flowgram.ai/free-layout-editor';
import type { BackendEdgeData, BackendNodeData } from '../typings';
import { WorkflowNodeType } from '../nodes';
import { END_NODE_ID, START_NODE_ID } from '../constants';

type LineEntity = ReturnType<NonNullable<WorkflowDocument['linesManager']>['getAllLines']>[0];

/**
 * 判断节点 ID 是否匹配（特殊处理开始节点和结束节点）
 * @param frontendNodeId 前端节点 ID（可能是 'start_node' 或 'end_node'）
 * @param backendNodeId 后端节点 ID（随机生成的）
 * @param workflowNodeList 后端节点列表
 * @param expectedNodeType 期望的节点类型（WorkflowNodeType.Start 或 WorkflowNodeType.End）
 * @returns 是否匹配
 */
function isNodeIdMatch(
  frontendNodeId: string,
  backendNodeId: string,
  workflowNodeList: BackendNodeData[],
  expectedNodeType: WorkflowNodeType,
): boolean {
  // 如果是开始节点或结束节点，需要特殊判断
  if ([START_NODE_ID, END_NODE_ID].includes(frontendNodeId)) {
    const backendNode = workflowNodeList.find((node) => node.nodeId === backendNodeId);
    return backendNode?.nodeType === expectedNodeType;
  }
  // 其他节点正常匹配
  return frontendNodeId === backendNodeId;
}

/**
 * 查找边实体（内部函数，复用查找逻辑）
 */
function findLineEntity(document: WorkflowDocument, edge: WorkflowEdgeJSON): LineEntity | undefined {
  const allLines = document.linesManager?.getAllLines?.() ?? [];

  return allLines.find((line) => {
    //纯前端数据，不需要特殊处理开始/结束节点,
    return (
      line.from.id === edge.sourceNodeID &&
      line.to?.id === edge.targetNodeID &&
      (!edge.sourcePortID || line.fromPort?.portID === edge.sourcePortID) && //没有portID时， fromport.portID为‘’，sourceportID为空。不能直接判断相等
      (!edge.targetPortID || line.toPort?.portID === edge.targetPortID)
    );
  });
}

/**
 * 从画布边实体中获取或生成 edgeId 和边实体（不更新 lineData）
 * @param document 画布文档实例
 * @param edge 边的 JSON 数据
 * @returns 包含 edgeId 和 lineEntity 的对象
 */
export function getOrCreateEdgeId(
  document: WorkflowDocument,
  edge: WorkflowEdgeJSON,
): { edgeId: string; lineEntity: LineEntity | undefined } {
  const lineEntity = findLineEntity(document, edge);

  if (!lineEntity) {
    console.warn('lineEntity not found, create new edgeId: ', lineEntity, edge);
    console.warn('allLines: ', document.linesManager?.getAllLines?.());
    return { edgeId: nanoid(), lineEntity: undefined };
  }

  const lineData = lineEntity.lineData;
  return {
    edgeId: lineData?.edgeId || nanoid(),
    lineEntity,
  };
}

/**
 * 将 workflowEdgeList 映射到画布边的 lineData
 * @param document 画布文档实例
 * @param workflowEdgeList 后端返回的边数据列表
 */
export function mapWorkflowEdgeListToLineData(
  document: WorkflowDocument,
  workflowEdgeList: BackendEdgeData[],
  workflowNodeList: BackendNodeData[],
): void {
  if (!workflowEdgeList || workflowEdgeList.length === 0) {
    return;
  }

  const allLines = document.linesManager?.getAllLines?.() ?? [];

  workflowEdgeList.forEach((backendEdgeData) => {
    const { startNode, endNode, edgeId } = backendEdgeData;

    // 找到对应的源节点（特殊处理开始节点）
    // startNode 是后端返回的随机 ID，需要通过 workflowNodeList 判断是否是开始节点
    const backendStartNode = workflowNodeList.find((node) => node.nodeId === startNode);
    const frontendStartNodeId = backendStartNode?.nodeType === WorkflowNodeType.Start ? 'start_node' : startNode;
    const sourceNode = document.getNode(frontendStartNodeId);

    if (!sourceNode) return;

    // 根据节点类型的 getPortIdFromEdgeData 方法，从 backendEdgeData 反推 portId
    const nodeRegistry = document.getNodeRegistry(sourceNode.flowNodeType);
    const getPortIdFromEdgeData = nodeRegistry?.meta?.getPortIdFromEdgeData;

    let matchedLine;

    if (getPortIdFromEdgeData) {
      // 如果节点有 getPortIdFromEdgeData，说明有多个输出端口，需要通过 portId 匹配
      try {
        const sourceNodeJSON = sourceNode.toJSON();
        const portId = getPortIdFromEdgeData(backendEdgeData, sourceNodeJSON);

        // 找到匹配的边：源节点、目标节点、源端口都匹配（特殊处理开始/结束节点）
        matchedLine = allLines.find((line) => {
          const fromMatch = isNodeIdMatch(line.from.id, startNode, workflowNodeList, WorkflowNodeType.Start);
          const toMatch = line.to ? isNodeIdMatch(line.to.id, endNode, workflowNodeList, WorkflowNodeType.End) : false;
          return fromMatch && toMatch && line.fromPort.portID === portId;
        });
      } catch (error) {
        console.warn('处理边数据失败:', error, backendEdgeData);
        return;
      }
    } else {
      // 如果节点没有 getPortIdFromEdgeData，说明只有一个输出端口，只需要通过节点ID匹配（特殊处理开始/结束节点）
      matchedLine = allLines.find((line) => {
        const fromMatch = isNodeIdMatch(line.from.id, startNode, workflowNodeList, WorkflowNodeType.Start);
        const toMatch = line.to ? isNodeIdMatch(line.to.id, endNode, workflowNodeList, WorkflowNodeType.End) : false;
        return fromMatch && toMatch;
      });
    }
    if (!matchedLine) {
      console.warn('>>>>> matchedLine not found: ', backendEdgeData);
      return;
    }
    // 将 BackendEdgeData 存入 lineData
    matchedLine.lineData = {
      ...matchedLine.lineData,
      edgeId,
      backendEdgeData,
    };
  });
}
