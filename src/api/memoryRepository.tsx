import type { RequestResultType, TableResultType } from '@/utils';
import { request } from '@/utils';

/** 获取记忆库列表 */
export const getRepositoryList: (params: {
  offset: number;
  limit: number;
}) => TableResultType<MemoryRepositoryNS.RepositoryType> = (params) => {
  return request('/agent/api/memory/repository/list', { params });
};

/** 创建/更新记忆库 */
export const saveRepository: (data: {
  name: string;
  description?: string;
  repositoryId?: number;
}) => RequestResultType<number> = (data) => {
  return request('/agent/api/memory/repository/save', { method: 'post', data });
};

/** 删除记忆库（软删除） */
export const deleteRepository: (data: { repositoryId: number }) => RequestResultType = (data) => {
  return request('/agent/api/memory/repository/delete', { method: 'post', data });
};

/** 检查记忆库是否关联了智能体 */
export const checkAssociation: (params: {
  repositoryId: number;
}) => RequestResultType<{ associated: boolean; agentNames: string[] }> = (params) => {
  return request('/agent/api/memory/repository/checkAssociation', { params });
};

/** 分页获取用户列表 */
export const listUsers: (params: {
  repositoryId: number;
  userId?: string;
  offset: number;
  limit: number;
}) => TableResultType<MemoryRepositoryNS.UserType> = (params) => {
  return request('/agent/api/memory/repository/listUsers', { params });
};

/** 获取指定用户的记忆列表 */
export const getMemories: (params: {
  repositoryId: number;
  userId: string;
}) => RequestResultType<MemoryRepositoryNS.MemoryType[]> = (params) => {
  return request('/agent/api/memory/repository/memories', { params });
};

/** 删除单条记忆 */
export const deleteMemory: (data: {
  repositoryId: number;
  memoryId: string;
}) => RequestResultType = (data) => {
  return request('/agent/api/memory/repository/deleteMemory', { method: 'post', data });
};

/** 获取记忆库详情 */
export const getRepositoryDetail: (params: {
  repositoryId: number;
}) => RequestResultType<MemoryRepositoryNS.RepositoryType> = (params) => {
  return request('/agent/api/memory/repository/detail', { params });
};
