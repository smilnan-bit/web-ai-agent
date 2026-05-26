import type { TestTaskType } from '@/pages/Test/type';
import type { RequestResultType } from '@/utils';
import { request } from '@/utils';

export const getTestList = (params) => {
  return request('/agent/api/app/evaluation/task/list', { params });
};

export const saveTestTask = (data) => request('/agent/api/app/evaluation/task/add', { method: 'post', data });

export const addCostTask = (data) => request('/agent/api/app/evaluation/task/addCostTask', { method: 'post', data });

export const getTestTaskCost: (params: any) => RequestResultType<TestTaskType> = (params) =>
  request('/agent/api/app/evaluation/task/getCost', { method: 'get', params });

export const deleteTestTask = (data: { taskId: number }) =>
  request('/agent/api/app/evaluation/task/delete', { method: 'post', data });

// 重新开始测评任务
export const reSubmitTestTask = (data: { taskId: number }) =>
  request('/agent/api/app/evaluation/task/resubmit', { method: 'post', data });

// 暂停测评任务
export const pauseTestTask = (data: { taskId: number }) =>
  request('/agent/api/app/evaluation/task/pause', { method: 'post', data });

// 继续测评任务
export const resumeTestTask = (data: { taskId: number }) =>
  request('/agent/api/app/evaluation/task/resume', { method: 'post', data });
