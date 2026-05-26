import { useCallback } from 'react';
import { useClientContext, getNodeScope } from '@flowgram.ai/free-layout-editor';
import type { WorkflowEdgeJSON, WorkflowNodeJSON } from '@flowgram.ai/free-layout-editor';
import type { ValidateError } from '../services';
import type { BackendEdgeData } from '../typings';
import { EdgeType } from '../constants';
import { WorkflowNodeType } from '../nodes';
import type { ProcessTypeEnum } from '../nodes/constants';
import { getOrCreateEdgeId } from '../utils/edge-data';

export interface WorkflowValidationResult {
  hasError: boolean;
  hasWarning: boolean;
  errorCount: number;
  warningCount: number;
  nodeErrors: Record<string, ValidateError[]>;
  allErrors: ValidateError[];
}

const defaultBackendEdgeData: (data: {
  edge: WorkflowEdgeJSON & { edgeId: string };
  sourceNode: WorkflowNodeJSON;
}) => BackendEdgeData = ({ edge, sourceNode }) => {
  return {
    index: 0,
    edgeId: edge.edgeId,
    edgeName: edge.edgeId,
    startNode: sourceNode.id,
    endNode: edge.targetNodeID,
    edgeType: EdgeType.normal,
  };
};

// 从画布 JSON 转换为后端数据格式的辅助函数
export const canvasJsonToBackendData = (
  json: { nodes: WorkflowNodeJSON[]; edges: WorkflowEdgeJSON[] },
  clientContext: ReturnType<typeof useClientContext>,
) => {
  const nodes: (WorkflowNodeJSON & { processType?: ProcessTypeEnum })[] = [...json.nodes];
  const edges: (WorkflowEdgeJSON & { processType?: ProcessTypeEnum })[] = [...json.edges];

  // 处理子画布数据
  nodes.forEach((node) => {
    const nodeRegistry = clientContext.document.getNodeRegistry(node.type);
    const sonNodeProcessType = nodeRegistry?.meta?.sonNodeProcessType as ProcessTypeEnum | undefined;
    node.blocks?.forEach((block) => {
      nodes.push({
        ...block,
        processType: sonNodeProcessType,
      });
    });

    node.edges?.forEach((edge) => {
      edges.push({
        ...edge,
        processType: sonNodeProcessType,
      });
    });
  });

  //处理后端需要的边数据
  const edgesData = edges.map((edge) => {
    const sourceNode = nodes.find((node) => node.id === edge.sourceNodeID);
    let getBackendEdgeData = defaultBackendEdgeData;
    if (sourceNode) {
      const clientContextNode = clientContext.document.getNodeRegistry(sourceNode.type);
      getBackendEdgeData = clientContextNode?.meta?.getBackendEdgeData || defaultBackendEdgeData;
    }

    // 从 lineData 中获取或生成 edgeId 和边实体
    const { edgeId, lineEntity } = getOrCreateEdgeId(clientContext.document, edge);
    const backendEdgeDataFromLine = lineEntity?.lineData?.backendEdgeData as BackendEdgeData | undefined;

    const _edgeData = {
      ...(getBackendEdgeData({
        edge: { ...edge, edgeId },
        sourceNode: nodes.find((node) => node.id === edge.sourceNodeID) || ({} as WorkflowNodeJSON),
      }) || {}),
      // 优先使用lineData中的processType，其次使用edge的processType，最后使用默认值
      processType: backendEdgeDataFromLine?.processType ?? edge.processType,
    };

    // 获得 _edgeData 后，将数据合并进 lineData
    if (lineEntity) {
      lineEntity.lineData = {
        ...lineEntity.lineData,
        edgeId: _edgeData.edgeId,
        backendEdgeData: _edgeData,
      };
    }

    return _edgeData;
  });

  // 保证节点内的相对顺序, 后端蠢蠢的依赖前端排序
  edgesData.sort((a, b) => (a.index || 0) - (b.index || 0));

  // 后端需要的节点数据
  const nodesData = nodes
    .filter((node) => node.type !== WorkflowNodeType.Group)
    .map((node) => {
      const { title, ...formData } = node.data;
      const { fieldsToNodeData } = clientContext.document.getNodeRegistry(node.type).meta || {};
      const nodeEntity = clientContext.document.getNode(node.id);
      const availableVariables = nodeEntity ? getNodeScope(nodeEntity).available.variables : [];
      const nodeEdges = edgesData.filter(({ startNode }) => startNode === node.id);
      return {
        nodeType: node.type,
        nodeName: node.data.title,
        nodeId: node.id,
        action: JSON.stringify({
          param: fieldsToNodeData ? fieldsToNodeData(formData, availableVariables, node) : formData,
        }),
        edges: nodeEdges.map(({ edgeId }) => ({ id: edgeId })),
        processType: node.processType,
      };
    });
  console.log('>>>>> data: ', clientContext.document.toJSON());
  console.log('>>>>> backendData: ', { edgesData, nodesData });
  return {
    canvas: JSON.stringify(clientContext.document.toJSON()),
    nodes: nodesData,
    edges: edgesData.map((edge) => {
      const { index, ...rest } = edge;
      return rest;
    }),
  };
};

export const useWorkflowData = () => {
  const clientContext = useClientContext();

  const toBackendData = useCallback(() => {
    const json = clientContext.document.toJSON();
    return canvasJsonToBackendData(json, clientContext);
  }, [clientContext]);

  return {
    toBackendData,
  };
};
