import type { RequestResultType, TableParamsType, TableResultType } from '@/utils';
import { request } from '@/utils';
import type { ChatMessage, PreviewSpec } from '@/pages/CardEditor/types';
import type { SpecMeta } from '@ysf/a2ui-core';
import { deriveSpecMeta } from '@ysf/a2ui-core';

export type { SpecMeta } from '@ysf/a2ui-core';
export { deriveSpecMeta } from '@ysf/a2ui-core';

// ——— VO 类型 ———

/** 后端 CotUiSpecVO 对应的前端类型 */
export interface CardItem {
  id: string;
  specName: string;
  specDesc: string;
  /** uiJson 是后端存储的 JSON 字符串，前端展示时需要 JSON.parse */
  uiJson: string;
  dbCreateTime: string;
  dbUpdateTime: string;
}

/** Chat 接口消息项，对应后端 CotUiMessageItem */
export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  log?: string;
}

/** Chat 接口响应 data，对应后端 CotUiChatVO */
export interface ChatResult {
  text: string;
  finishReason: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

// ——— Spec CRUD ———

/** GET /agent/api/cotui/spec/list - 分页查询，支持关键字搜索 */
export const getCardList: (params: TableParamsType & { keyword?: string }) => TableResultType<CardItem> = (params) => {
  return request('/agent/api/cotui/spec/list', { params });
};

/** GET /agent/api/cotui/spec/get?id=xxx - 获取单个 Spec 详情 */
export const getCardDetail: (params: { id: string }) => RequestResultType<CardItem> = (params) => {
  return request('/agent/api/cotui/spec/get', { params });
};

/** POST /agent/api/cotui/spec/save - 新建 Spec，返回新记录的 id */
export const saveCard: (data: {
  specName: string;
  specDesc?: string;
  uiJson: string;
}) => RequestResultType<number> = (data) => {
  return request('/agent/api/cotui/spec/save', { method: 'post', data });
};

/** POST /agent/api/cotui/spec/update - 更新已有 Spec */
export const updateCard: (data: {
  id: string;
  specName?: string;
  specDesc?: string;
  uiJson: string;
}) => RequestResultType<boolean> = (data) => {
  return request('/agent/api/cotui/spec/update', { method: 'post', data });
};

/** POST /agent/api/cotui/spec/delete - 逻辑删除 Spec */
export const deleteCard: (data: { id: string }) => RequestResultType<boolean> = (data) => {
  return request('/agent/api/cotui/spec/delete', { method: 'post', data });
};

// ——— Chat ———

export interface ChatRequestData {
  message: string;
  currentSpec?: PreviewSpec;
  messages: ChatMessage[];
  /** 前端每次进入编辑页生成的会话 ID，刷新或切换页面时重置 */
  sessionId: string;
}

export interface ChatResponseData {
  text: string;
}

export const sendChat = (data: ChatRequestData): RequestResultType<ChatResponseData> => {
  // return fetch('/a2ui/api/chat', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // }).then((res) => res.json());
  return request('/agent/api/cotui/chat', { method: 'post', data });
};

// ——— Spec Meta ———

/**
 * spec 的元信息，供 Dialog 节点变量映射面板、分支路由、USER_RESPONSE 推导使用。
 * 当前阶段后端尚未实现 /cotui/spec/meta 接口，前端 fallback 直接调用 @ysf/a2ui-core 的
 * deriveSpecMeta 解析 uiJson；后端就绪后替换 getSpecMeta 内部实现即可。
 *
 * SpecMeta 类型与 deriveSpecMeta 实现已上移到 @ysf/a2ui-core，本文件顶部 re-export
 * 以保持 import 路径稳定。
 */

/**
 * GET /agent/api/cotui/spec/meta?id=xxx
 * 由于后端尚未提供该接口，当前 fallback 到 getCardDetail 并本地解析 uiJson。
 */
export const getSpecMeta = async (params: { id: string }): Promise<SpecMeta> => {
  const detail = await getCardDetail(params);
  const uiJson = detail?.data?.uiJson;
  if (!uiJson) {
    return { reportDataKeys: [], actionNames: [], bindingPaths: [] };
  }
  try {
    const spec = JSON.parse(uiJson) as PreviewSpec;
    return deriveSpecMeta(spec);
  } catch {
    return { reportDataKeys: [], actionNames: [], bindingPaths: [] };
  }
};
