import type { RequestResultType } from '@/utils';
import { request } from '@/utils';

export interface SchedulingStrategy {
  id: string;
  name: string;
  desc: string;
  createUser: string;
  updateTime: string;
  published: boolean;
  diagramInfo?: string;
}

export interface SchedulingListParams {
  name?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface SchedulingListResult {
  list: SchedulingStrategy[];
  total: number;
}

export const getSchedulingList = (params?: SchedulingListParams): RequestResultType<SchedulingListResult> =>
  request('/agent/api/scheduling/list', { params });

export const getSchedulingDetail = (params: { id: string }): RequestResultType<SchedulingStrategy> =>
  request('/agent/api/scheduling/get', { params });

export const createScheduling = (data: { name: string; desc?: string }): RequestResultType<{ id: string }> =>
  request('/agent/api/scheduling/create', { method: 'post', data });

export const updateScheduling = (data: {
  id: string;
  name?: string;
  desc?: string;
}): RequestResultType => request('/agent/api/scheduling/update', { method: 'post', data });

export const deleteScheduling = (data: { id: string }): RequestResultType =>
  request('/agent/api/scheduling/delete', { method: 'post', data });

export const publishScheduling = (data: { id: string }): RequestResultType =>
  request('/agent/api/scheduling/publish', { method: 'post', data });

export const saveSchedulingCanvas = (data: { id: string; diagramInfo: string }): RequestResultType =>
  request('/agent/api/scheduling/saveCanvas', { method: 'post', data });
