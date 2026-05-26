import { ConditionRelationEnum } from './const';
import type { FC } from 'react';
import { LogicDisplay } from './logic-display';
import React, { Fragment } from 'react';

interface Condition {
  left?: React.ReactNode;
  operator?: React.ReactNode;
  right?: React.ReactNode;
}

interface ConditionContainerProps {
  conditions: Condition[];
  logic?: ConditionRelationEnum;
}

export const ConditionContainer: FC<ConditionContainerProps> = (props) => {
  const { conditions = [], logic = ConditionRelationEnum.and } = props;

  return (
    <div tw="border border-solid border-[#D9D9D9] bg-white py-1 rounded-[4px] text-xs text-[#333] min-h-[32px]">
      {conditions.map((condition, index) => (
        <Fragment key={index}>
          <div tw="flex items-center px-1">
            <div tw="flex-1 min-w-0 overflow-hidden flex-grow flex-shrink-0">{condition.left}</div>
            <div tw="flex items-center flex-grow-0 flex-shrink-0 basis-[0] px-2 ">{condition.operator}</div>
            <div tw="flex-1 min-w-0 overflow-hidden flex-grow flex-shrink-0">{condition.right}</div>
          </div>
          {index < conditions.length - 1 ? <LogicDisplay logic={logic} /> : null}
        </Fragment>
      ))}
    </div>
  );
};
