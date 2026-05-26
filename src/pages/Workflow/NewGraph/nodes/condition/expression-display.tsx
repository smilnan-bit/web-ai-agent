import type { FC } from 'react';
import React from 'react';
import { VariableDisplay } from './variable-display';
import { ConditionTag } from './condition-tag';
import { SimpleParamTypeEnum } from '../../constants';
import { ConditionNodeSelectEnum, ConditionValueDisableTypes } from './const';

const specialValueMap = {
  [ConditionNodeSelectEnum.empty]: 'Empty',
  [ConditionNodeSelectEnum.notEmpty]: 'Empty',
  [ConditionNodeSelectEnum.isTrue]: 'true',
  [ConditionNodeSelectEnum.isFalse]: 'false',
};

export const ExpressionDisplay: FC<{
  value?: string;
  operator?: ConditionNodeSelectEnum;
  valueType?: SimpleParamTypeEnum;
}> = ({ value, operator, valueType }) => {
  if (ConditionValueDisableTypes.includes(operator as ConditionNodeSelectEnum)) {
    return <ConditionTag>{specialValueMap[operator as ConditionNodeSelectEnum]}</ConditionTag>;
  }
  if (!value) {
    return <ConditionTag>{value}</ConditionTag>;
  }
  if (valueType === SimpleParamTypeEnum.quote) {
    return <VariableDisplay keyPath={value} />;
  } else {
    return <ConditionTag tooltip={value}>{value}</ConditionTag>;
  }
};
