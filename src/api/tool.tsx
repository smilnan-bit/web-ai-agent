import type { RequestResultType, TableParamsType, TableResultType } from '@/utils';
import type { ToolNS } from '@/types/Tools';
import type { ToolStatusEnum, ToolboxTypeEnum } from '@/constants';
import { request } from '@/utils';

// const prefix = 'https://nei.hz.netease.com/api/apimock-v2/93e568f03796d32d3db691b50ec2b5c7';
const prefix = '';

export const getToolboxList: (
  params: TableParamsType & { toolboxType: ToolboxTypeEnum; fastQuery?: boolean; name?: string }, //fastQuery: 是否快速查询，快速查询不返回toolNames, agentBindCount, workflowBindCount
) => TableResultType<ToolNS.ToolBoxDetailType> = (params) => {
  return request('/agent/api/toolbox/list', { params });
};

export const getToolboxDetail: (params: {
  toolboxId: string | number;
}) => RequestResultType<ToolNS.ToolBoxDetailType> = (params) => {
  return request('/agent/api/toolbox/get', { params });
};

export const saveToolbox: (data: ToolNS.ToolBoxType) => RequestResultType<{ toolboxId: string }> = (data) => {
  return request('/agent/api/toolbox/save', { method: 'post', data });
};

export const deleteToolbox: (data: { toolboxId: string }) => RequestResultType = (data) => {
  return request('/agent/api/toolbox/delete', { method: 'post', data });
};

export const getToolList: (params: {
  toolboxId: string | number;
  status?: ToolStatusEnum;
}) => TableResultType<ToolNS.ToolType> = (params) => {
  return request('/agent/api/toolbox/tool/list', { params });
};

export const getToolDetail: (params: {
  toolId: string | number;
  toolboxId: string | number;
}) => RequestResultType<ToolNS.ToolType> = (params) => {
  return request('/agent/api/toolbox/tool/get', { params });
};

export const createTool: (data: ToolNS.ToolBasicType) => RequestResultType = (data) => {
  return request('/agent/api/toolbox/tool/create', { method: 'post', data });
};

export const updateTool: (
  data: Overwrite<Partial<ToolNS.ToolType>, { toolId: string; toolboxId: string }>,
) => RequestResultType = (data) => {
  return request('/agent/api/toolbox/tool/update', { method: 'post', data });
};

export const deleteTool: (data: { toolId: string; toolboxId: string }) => RequestResultType = (data) => {
  return request('/agent/api/toolbox/tool/delete', { method: 'post', data });
};

export const debugTool: (data: {
  toolId: string;
  toolboxId: string;
  params: Record<string, string | number | boolean>;
}) => RequestResultType<string> = (data) => {
  return request('/agent/api/toolbox/tool/debug', { data, method: 'post' }, false);
};

// 相似词保存
export const fetchSimilarWordsAdd: (data: {
  toolId: string | number;
  standard: string;
  similarExpressions: string[];
}) => RequestResultType = (data) => {
  return request(`${prefix}/agent/api/toolbox/tool/thesaurus/add`, { method: 'post', data });
};

// 相似词更新
export const fetchSimilarWordsUpdate: (data: {
  toolId: string | number;
  standardId: number;
  standard: string;
  similarExpressions: string[];
}) => RequestResultType = (data) => {
  return request(`${prefix}/agent/api/toolbox/tool/thesaurus/update`, { method: 'post', data });
};

// 相似词删除
export const fetchSimilarWordsDelete: (data: {
  toolId: string | number;
  standardIds?: number[];
}) => RequestResultType = (data) => {
  return request(`${prefix}/agent/api/toolbox/tool/thesaurus/delete`, { method: 'post', data });
};

// 相似词列表
export const fetchSimilarWordsList: (params: {
  toolId: string | number;
  limit: number;
  offset: number;
  keyword?: string;
  sortBy?: string;
  order?: string;
}) => RequestResultType<{ list: ToolNS.SimilarWordsListItem[]; total: number }> = (params) => {
  return request(`${prefix}/agent/api/toolbox/tool/thesaurus/list`, { params });
};

// 相似词是否重复校验
export const fetchSimilarWordsCheck: (params: {
  toolId: string | number;
  title: string;
  standardId?: number;
}) => RequestResultType = (params) => {
  return request(`${prefix}/agent/api/toolbox/tool/thesaurus/check`, { params });
};

// 相似词导入接口
export const fetchSimilarWordsImport: (data: { toolId: string | number; key: string }) => RequestResultType = (
  data,
) => {
  return request(`${prefix}/agent/api/toolbox/tool/thesaurus/import`, { method: 'post', data });
};

// 导入轮询接口
export const fetchImportPollingTask: (data: { taskToken: string }) => RequestResultType = (data) => {
  return request(`${prefix}/agent/api/polling/task`, { params: data });
};

// 获取AIGC推荐相似问题列表
export const fetchAigcRecommendList = (params) => request('/agent/api/toolbox/tool/thesaurus/recommend', { params });

// 获取AIGC推荐相似问题列表轮询id
export const fetchAigcRecommendTaskId = (data) =>
  request('/agent/api/toolbox/tool/thesaurus/ask', { method: 'POST', data });

// 获取相似词/意图详情
export const fetchWordDetail = (params) => request('/agent/api/toolbox/tool/thesaurus/get', { params });

export const toolInitDownload = (data) => request('/agent/api/download/init', { method: 'POST', data });
