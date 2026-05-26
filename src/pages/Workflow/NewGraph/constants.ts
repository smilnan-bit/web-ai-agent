import { ToolParamsTypeEnum } from '@/constants';
export const TAG_COLOR = '#333';
export const TAG_BACKGROUND_COLOR = '#F2F4F7';
export const TAG_WARNING_COLOR = '#FAAD14';
export const TAG_WARNING_BACKGROUND_COLOR = 'rgba(250, 173, 20, 0.08)';
export const TAG_SUCCESS_COLOR = '#008000';
export const TAG_SUCCESS_BACKGROUND_COLOR = 'rgba(0, 128, 0, 0.08)';
export const MAX_CONTENT_LENGTH = 3500;

export enum VarStatusEnum {
  open = 0,
  close = 1,
  delete = 2,
}

export interface VarType {
  id?: string;
  name: string;
  desc: string;
  type: ToolParamsTypeEnum;
  subTyp?: ToolParamsTypeEnum;
  groupId?: number;
  status?: VarStatusEnum; //0开, 1关闭， 2删除
}

export enum EdgeType {
  normal = 0,
  condition = 1,
  dialogOptions = 2, // 对话节点选项
  error = 3, // 错误节点-异常
}

export enum SimpleParamTypeEnum {
  input = 0,
  quote = 1,
}

export const SimpleParamTypeConfig = {
  [SimpleParamTypeEnum.input]: { name: '输入', sort: 2 },
  [SimpleParamTypeEnum.quote]: { name: '引用', sort: 1 },
};

export const VariableSplitSymbol = ':';

export const VariableNameSplitSymbol = '.';

export const GLOBAL_VARIABLE_ID = 'global_variable';

let arr: VarType[] = [];
let map: Record<string, VarType> = {};

export const getGlobalVariableList = () => {
  return arr;
};

export const getGlobalVariableMap = () => {
  return map;
};

export const setGlobalVariable = (data: VarType[]) => {
  arr = data;
  map = data.reduce<Record<string, VarType>>((acc, item) => {
    acc[item.id || ''] = item;
    return acc;
  }, {});
};

export const clearGlobalVariable = () => {
  arr = [];
  map = {};
};

export enum NodeRunStatusEnum {
  Processing = 'processing',
  Succeeded = 'succeeded',
  terminated = 'failed',
}

export const INPUT_PARAM_FILTER_DEFAULT = [
  {
    id: 1,
    name: 'BOT_USER_INPUT',
    type: 1,
    desc: '用户本轮对话输入内容',
    required: true,
    deep: 1,
  },
  {
    id: 2,
    name: 'HISTORY_CONTEXT',
    type: ToolParamsTypeEnum.string,
    desc: '用户本轮对话上下文内容',
    required: 'true',
    isDefault: true,
    deep: 1,
  },
];

export const START_NODE_ID = 'start_node';
export const END_NODE_ID = 'end_node';
