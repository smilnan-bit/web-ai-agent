import type { WorkflowNS } from '@/types/Workflow';
import type { RequestResultType, TableResultType } from '@/utils';
import { request } from '@/utils';

export const getWorkflowList: (params: {
  pageNo: number;
  pageSize: number;
}) => TableResultType<WorkflowNS.WorkflowType> = (params) => {
  return request('/agent/api/workflow/list', { params });
};

export const getWorkflowDetail: (params: { workflowId: string }) => RequestResultType<WorkflowNS.WorkflowType> = (
  params,
) => {
  return request('/agent/api/workflow/detail', { params });
};

export const saveWorkflow: (
  data: Pick<WorkflowNS.WorkflowType, 'workflowId' | 'workflowDesc' | 'workflowName'>,
) => RequestResultType<{ workflowId: string }> = (data) => {
  return request('/agent/api/workflow/save', { method: 'post', data });
};

export const deleteWorkflow: (data: { workflowId: string }) => RequestResultType = (data) => {
  return request('/agent/api/workflow/delete', { method: 'post', data });
};

export const copyWorkflow: (
  data: Pick<WorkflowNS.WorkflowType, 'workflowId' | 'workflowDesc' | 'workflowName'>,
) => RequestResultType<{ workflowId: string }> = (data) => {
  return request('/agent/api/workflow/copy', { method: 'post', data });
};

export const executeCodeNode: (data: {
  workflowId: number;
  code: string;
  codeLanguage: string;
  timeoutMs: number;
  param: Record<string, any>;
}) => RequestResultType = (data) => {
  return request('/agent/api/workflow/debug/executeCode', { method: 'post', data });
};
