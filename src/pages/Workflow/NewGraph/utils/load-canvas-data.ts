import type { WorkflowDocument } from '@flowgram.ai/free-layout-editor';
import { text2object } from '@/utils';
import type { BackendEdgeData, BackendNodeData } from '../typings';
import { mapWorkflowEdgeListToLineData } from './edge-data';

/**
 * 加载画布数据的通用函数
 * @param document 画布文档实例
 * @param canvasInfo 画布数据（JSON 字符串）
 * @param options 可选配置
 * @param options.workflowEdgeList 后端返回的边数据列表
 * @param options.workflowNodeList 后端返回的节点数据列表
 * @param options.setSavedData 可选的保存数据回调函数
 */
export function loadCanvasData(
  document: WorkflowDocument,
  canvasInfo: string,
  options?: {
    workflowEdgeList?: BackendEdgeData[];
    workflowNodeList?: BackendNodeData[];
    setSavedData?: (data: string) => void;
  },
): void {
  const saveData = () => {
    const json = document.toJSON();
    options?.setSavedData?.(JSON.stringify(json));
  };
  // 1. 重新加载画布数据
  document.reload(text2object(canvasInfo));
  // 2. 如果有边数据，延迟映射到 lineData
  if (options?.workflowEdgeList?.length && options?.workflowNodeList) {
    setTimeout(() => {
      if (!document) return;
      mapWorkflowEdgeListToLineData(document, options.workflowEdgeList || [], options.workflowNodeList || []);
      saveData();
    }, 150); // 稍微延迟，确保边已经创建完成
  } else {
    saveData();
  }
}
