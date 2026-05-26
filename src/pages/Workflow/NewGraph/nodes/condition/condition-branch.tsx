import type { FC } from 'react';
import {
  IconCozEqual,
  IconCozEqualSlash,
  IconCozGreater,
  IconCozGreaterEqual,
  IconCozLess,
  IconCozLessEqual,
  IconCozProperSuperset,
  IconCozProperSupersetSlash,
} from '@coze-arch/coze-design/icons';

import React from 'react';
import { ConditionContainer } from './condition-container';
import { VariableDisplay } from './variable-display';
import { ExpressionDisplay } from './expression-display';
import type { ConditionItem } from './node-content';
import { ConditionNodeSelectEnum } from './const';

interface ConditionBranchProps {
  branch: ConditionItem;
}

const Operator: FC<{
  operator?: ConditionNodeSelectEnum;
}> = (props) => {
  const { operator } = props;
  const operatorMap = {
    [ConditionNodeSelectEnum.equal]: <IconCozEqual />,
    [ConditionNodeSelectEnum.notEqual]: <IconCozEqualSlash />,
    [ConditionNodeSelectEnum.bigger]: <IconCozGreater />,
    [ConditionNodeSelectEnum.biggerEqual]: <IconCozGreaterEqual />,
    [ConditionNodeSelectEnum.smaller]: <IconCozLess />,
    [ConditionNodeSelectEnum.smallerEqual]: <IconCozLessEqual />,
    [ConditionNodeSelectEnum.include]: <IconCozProperSuperset />,
    [ConditionNodeSelectEnum.notInclude]: <IconCozProperSupersetSlash />,
    [ConditionNodeSelectEnum.empty]: <IconCozEqual />,
    [ConditionNodeSelectEnum.notEmpty]: <IconCozEqualSlash />,
    [ConditionNodeSelectEnum.isTrue]: <IconCozEqual />,
    [ConditionNodeSelectEnum.isFalse]: <IconCozEqual />,
  };
  if (operator === undefined) {
    return null;
  }

  return <div tw="text-center flex text-[#ACB3BF]">{operatorMap[operator]}</div>;
};

export const ConditionBranch: FC<ConditionBranchProps> = (props) => {
  const { branch } = props;
  const { params = [], relation } = branch;

  return (
    <ConditionContainer
      conditions={params.map((condition) => ({
        left: <VariableDisplay keyPath={condition?.quoteParam} />,
        operator: <Operator operator={condition?.quoteCondition} />,
        right: (
          <ExpressionDisplay
            value={condition?.value}
            valueType={condition?.valueType}
            operator={condition?.quoteCondition}
          />
        ),
      }))}
      logic={relation}
    />
  );
};
