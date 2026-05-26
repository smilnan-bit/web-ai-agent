import type { ToolParamsTypeEnum } from '@/constants';
import type { RequestResultType, TableResultType } from '@/utils';
import { request } from '@/utils';
import type { VarStatusEnum, VarType } from '../Workflow/NewGraph/constants';

export const getVarList: () => TableResultType<VarType> = (params) => {
  return request('/agent/api/globalparam/list', params);
};

export const addVar = (data: VarType) => {
  return request('/agent/api/globalparam/add', { method: 'post', data });
};

export const updateVar = (data: VarType) => {
  return request('/agent/api/globalparam/update', { method: 'post', data });
};

export const deleteVar = (data: { id: string }) => {
  return request('/agent/api/globalparam/delete', { method: 'post', data });
};

export const updateVarStatus = (data: { id: string; status: VarStatusEnum }) => {
  return request('/agent/api/globalparam/updateStatus', { method: 'post', data });
};
