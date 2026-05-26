import { request } from '@/utils';
import type { IFetchOption } from '@ysf/fetch/dist/types/request';
import type { Response } from '@/utils/fetch';
import type { BackendEdgeData, BackendNodeData } from '../typings';
import type { WorkflowNS } from '@/types/Workflow';

// 工作流版本历史列表接口类型
export interface WorkflowHistoryItem {
  workflowId: number;
  version: number;
  operatorName: string;
  releaseTime: number;
}

export interface WorkflowHistoryList {
  versionList?: WorkflowHistoryItem[];
}

// 工作流版本详情接口类型
export interface WorkflowVersionDetail {
  workflowId: number;
  version: number;
  canvasInfo: string;
  firstNodeId?: string;
  operatorName: string;
  releaseTime: number;
  nodeList?: any[];
}

// 保存画布
export const saveGraph = (data, options?: IFetchOption) =>
  request('/agent/api/workflow/canvas/save', { data, method: 'post', ...(options || {}) });

export const getGraphInfo = (
  params,
): Promise<
  Response<
    WorkflowNS.WorkflowType & {
      diagramInfo: string;
      workflowEdgeList: BackendEdgeData[];
      workflowNodeList: BackendNodeData[];
    }
  >
> => request('/agent/api/workflow/detail', { params });

// 发布工作流
export const releaseGraph = (data: { workflowId: number; version: number }, options?: RequestInit) =>
  request('/agent/api/workflow/canvas/release', { method: 'post', data, ...(options || {}) });

// 获取工作流版本历史列表
export const getWorkflowHistoryList = (params: {
  workflowId: number;
  pageNo?: number;
  pageSize?: number;
}) => {
  return request('/agent/api/workflow/version/list', {
    params: {
      ...params,
      pageNo: params.pageNo ?? 1,
      pageSize: params.pageSize ?? 100,
    },
  });
};

// 获取工作流历史版本详情
export const getWorkflowHistoryVersionDetail = (params: {
  workflowId: number;
  version: number;
}) => {
  return request('/agent/api/workflow/version/detail', { params });
};

// 恢复工作流历史版本
export const restoreWorkflowVersion = (data: { workflowId: number; version: number }) => {
  return request('/agent/api/workflow/version/restore', { method: 'post', data });
};

// ========== 子工作流相关接口 ==========

/** 子工作流列表项 */
export interface SubWorkflowItem {
  /** 工作流 ID */
  workflowId: number;
  /** 工作流名称 */
  workflowName: string;
  /** 描述 */
  workflowDesc?: string;
}

/** 获取可引用的子工作流列表（排除自身及超出深度限制的） */
export const getSubWorkflowList = (params: {
  /** 当前工作流 ID（用于排除自身及循环引用） */
  workflowId: number;
  /** 搜索关键词 */
  keyword?: string;
  pageNo: number;
  pageSize: number;
}) => request('/agent/api/workflow/reference/selectable', { params });
