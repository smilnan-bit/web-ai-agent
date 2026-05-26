import { ToolParamsTypeEnum } from '@/constants';

export enum ConditionRelationEnum {
  and = 0,
  or = 1,
}

export enum ConditionNodeSelectEnum {
  equal = 0,
  notEqual = 1,
  empty = 2,
  notEmpty = 3,
  bigger = 4,
  biggerEqual = 5,
  smaller = 6,
  smallerEqual = 7,
  include = 8,
  notInclude = 9,
  isTrue = 10,
  isFalse = 11,
}

// 条件分支中不能编辑值的类型
export const ConditionValueDisableTypes = [
  ConditionNodeSelectEnum.empty,
  ConditionNodeSelectEnum.notEmpty,
  ConditionNodeSelectEnum.isTrue,
  ConditionNodeSelectEnum.isFalse,
];

export const EqualConditionSelectConfig = {
  [ConditionNodeSelectEnum.equal]: '等于',
  [ConditionNodeSelectEnum.notEqual]: '不等于',
};

export const EmptyConditionSelectConfig = {
  [ConditionNodeSelectEnum.empty]: '为空',
  [ConditionNodeSelectEnum.notEmpty]: '不为空',
};
export const IncludeConditionSelectConfig = {
  [ConditionNodeSelectEnum.include]: '包含',
  [ConditionNodeSelectEnum.notInclude]: '不包含',
};

export const CompareConditionSelectConfig = {
  [ConditionNodeSelectEnum.bigger]: '大于',
  [ConditionNodeSelectEnum.biggerEqual]: '大于等于',
  [ConditionNodeSelectEnum.smaller]: '小于',
  [ConditionNodeSelectEnum.smallerEqual]: '小于等于',
};

export const LengthConditionSelectConfig = {
  [ConditionNodeSelectEnum.bigger]: '长度大于',
  [ConditionNodeSelectEnum.biggerEqual]: '长度大于等于',
  [ConditionNodeSelectEnum.smaller]: '长度小于',
  [ConditionNodeSelectEnum.smallerEqual]: '长度小于等于',
};

export const NumberConditionSelectConfig = {
  ...EqualConditionSelectConfig,
  ...EmptyConditionSelectConfig,
  ...CompareConditionSelectConfig,
};

export const StringConditionSelectConfig = {
  ...EqualConditionSelectConfig,
  ...EmptyConditionSelectConfig,
  ...IncludeConditionSelectConfig,
  ...LengthConditionSelectConfig,
};

export const BooleanConditionSelectConfig = {
  ...EqualConditionSelectConfig,
  ...EmptyConditionSelectConfig,
  [ConditionNodeSelectEnum.isTrue]: '为true',
  [ConditionNodeSelectEnum.isFalse]: '为false',
};

export const ArrayConditionSelectConfig = {
  ...EmptyConditionSelectConfig,
  ...IncludeConditionSelectConfig,
  ...LengthConditionSelectConfig,
};

export const ObjectConditionSelectConfig = {
  ...IncludeConditionSelectConfig,
  ...EmptyConditionSelectConfig,
};

export const ConditionNodeSelectConfig = {
  [ToolParamsTypeEnum.string]: StringConditionSelectConfig,
  [ToolParamsTypeEnum.integer]: NumberConditionSelectConfig,
  [ToolParamsTypeEnum.number]: NumberConditionSelectConfig,
  [ToolParamsTypeEnum.boolean]: BooleanConditionSelectConfig,
  [ToolParamsTypeEnum.array]: ArrayConditionSelectConfig,
  [ToolParamsTypeEnum.object]: ObjectConditionSelectConfig,
};

export const ConditionRelationConfig = {
  [ConditionRelationEnum.and]: '且',
  [ConditionRelationEnum.or]: '或',
};
