import type { RequestResultType } from '@/utils';
import { request } from '@/utils';

export const getKnowledgeList: (data: any) => RequestResultType<KnowledgeNS.KnowledgeType[]> = (data) => {
  return request('/agent/api/ys/knowledge/list', { method: 'post', data });
};

export const getRagSetting = (params: { appId: number }) =>
  request('/agent/api/app/configuration/rag/setting/get', { method: 'get', params });

export const saveRagSetting = (data) =>
  request('/agent/api/app/configuration/rag/setting/save', { method: 'post', data });
