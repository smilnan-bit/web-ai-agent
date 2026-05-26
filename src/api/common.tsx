import { request } from '@/utils';
import type { Response } from '@/utils/fetch';

/**
 * @desc 获取上传nos的token,加个注释测试下提交代码
 * @param data
 */
export const fetchUploadNosToken = (data: { fileName: string }): Promise<Response<any>> => {
  return request('/agent/api/nos/token', { params: data });
};

export const getUnDownloadNum = (): Promise<Response<number>> => {
  return request('/agent/api/download/unDownloadSum');
};

export const getDownloadList = (params: { pageNo: number; pageSize: number }) => {
  return request('/agent/api/download/list', {
    params,
  });
};

export const postFileDownloadNum = (taskGuid) => {
  return request('/agent/api/download/addTimes', {
    method: 'POST',
    data: { taskGuid },
  });
};
