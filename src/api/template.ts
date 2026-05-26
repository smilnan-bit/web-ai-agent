import { request } from '@/utils';

export const getTestList = (params) => {
  return request('/agent/api/app/evaluation/task/list', { params });
};

// 获取agent分类列表
export const getAgentCategoryList = () => request('/agent/api/template/listCategory');

// 获取agent列表
export const getAgentList = (data?: { categoryId: number; agentName: string }) =>
  request('/agent/api/template/listApp', { params: data });

export const getAgentDetail = (params: { appId: number }) => {
  return request('/agent/api/template/getApp', { params });
};

// copy agent模板
export const copyTemplateAgent = (data) => request('/agent/api/template/copyApp', { method: 'POST', data });
