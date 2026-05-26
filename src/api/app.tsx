import type { AppsNS } from '@/types/Apps';
import type { RequestResultType } from '@/utils';
import type { AgentHistoryNS } from '@/@types/AgentHistpry';

import { request } from '@/utils';

export const getAppList: () => RequestResultType<AppsNS.AppType[]> = () => {
  return request('/agent/api/app/list');
};

export const saveApp: (data: AppsNS.AppType) => RequestResultType = (data) => {
  return request('/agent/api/app/save', { method: 'post', data });
};

export const copyApp: (data: AppsNS.AppType) => RequestResultType<{ appId: number }> = (data) => {
  return request('/agent/api/app/copy', { method: 'post', data });
};

export const deleteApp: (data: { appId: number }) => RequestResultType = (data) => {
  return request('/agent/api/app/delete', { method: 'post', data });
};

export const getAppConfigDetail: (params: { appId: number }) => RequestResultType<AppsNS.AppDetailType> = (params) => {
  return request('/agent/api/app/configuration/get', { params });
};

export const saveAppConfigDetail: (
  data: Pick<AppsNS.AppDetailType, 'appId' | 'prompt' | 'ysKnowledgeList' | 'toolList'> & {
    answerTipsSetting?: AppsNS.AppAnswerTipsSetting | null;
    [key: string]: unknown;
  },
) => RequestResultType = (data) => {
  return request('/agent/api/app/configuration/save', { method: 'post', data });
};

export const releaseAppConfig: (data: { appId: number }) => RequestResultType = (data) => {
  return request('/agent/api/app/configuration/release', { method: 'post', data });
};

export const fetchDocLink: (docId: number | string) => RequestResultType = (docId) => {
  return request('/agent/api/ys/knowledge/getDocLink', { method: 'get', params: { docId } });
};

export const checkThirdApp: (data) => RequestResultType = (data) => {
  return request('/agent/api/app/third/check', { method: 'post', data });
};

export const asrApi: (data: { url: string; duration: number }) => Promise<any> = (data) => {
  return request('/agent/api/app/configuration/transAudio', { method: 'post', data }, false);
};
export const getSelfReleasedApps: () => RequestResultType<AppsNS.AppType[]> = () => {
  return request('/agent/api/app/listRelease');
};

// 获取应用历史记录列表
export const getAppHistoryList: (params: {
  appId: number;
  pageNo: number;
  pageSize: number;
}) => RequestResultType<AgentHistoryNS.AgentHistoryList> = (params) => {
  return request('/agent/api/app/version/list', { params });
};

// 获取应用发布日志详情
export const getHistoryPublishDetail: (params: {
  appId: number;
  versionId: number;
}) => RequestResultType<AgentHistoryNS.AgentPublishDetail> = (params) => {
  return request('/agent/api/app/version/log', { params });
};

// 获取应用历史版本详情
export const getHistoryVersionDetail: (params: {
  appId: number;
  versionId: number;
}) => RequestResultType<AgentHistoryNS.AgentHistoryDetail> = (params) => {
  return request('/agent/api/app/version/detail', { params });
};

// 根据Id恢复指定版本
export const restoreVersion: (data: { appId: number; versionId: number }) => RequestResultType = (data) => {
  return request('/agent/api/app/version/recover', { method: 'post', data });
};

// 获取应用类型列表
export const getAppBizTypeList: () => RequestResultType<AppsNS.AppBizType[]> = () => {
  return request('/agent/api/app/getBizTypeList');
};
