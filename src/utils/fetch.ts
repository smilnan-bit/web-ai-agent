/* eslint-disable compat/compat */
import fetchRequest from '@ysf/fetch';
import type { IErrorResponse } from '@ysf/fetch/dist/types/request';
import { message } from 'antd';

export interface TableParamsType {
  pageNo: number;
  pageSize: number;
}

export interface Response<T = any> extends IResponse<T> {
  data?: T;
}

export type TableResultType<T> = Promise<IResponse<{ total: number; list: T[] }>>;
/**
 * 常见返回体
 */
export interface IResponse<T = any> {
  code: number;
  data?: T;
  message?: string;
  total?: number;
  time?: number; // 兼容老的
  promptTitle?: string; // 兼容老的
  promptMsg?: string; // 兼容老的
  redirectUrl?: string; // 兼容老的
}

export type RequestResultType<T = boolean> = Promise<IResponse<T>>;

export const request = (url: string, _options?, useServerMsg = true): Promise<IResponse> => {
  return new Promise((resolve, reject) => {
    const options = _options || {};
    options.csrfToken = false;
    fetchRequest(url, options)
      .then((res) => {
        resolve(res);
      })
      .catch((e: IErrorResponse) => {
        const { code, message: serverMsg, response } = e || {};
        if (code === 302) {
          // demo 模式：屏蔽登录跳转，直接 reject 让调用方降级处理
          reject(e);
          return;
        }
        if (code === undefined && useServerMsg) {
          const error: any = new Error('网络连接失败，请稍后再试');
          // http status非200错误增加点标记
          error.isNetworkError = true;
          reject(error);
        } else {
          useServerMsg && serverMsg && message.error(serverMsg);
          reject(e);
        }
      });
  });
};
