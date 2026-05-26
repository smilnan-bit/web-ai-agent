import type { FC } from 'react';
import { ConditionRelationConfig, type ConditionRelationEnum } from './const';
import React from 'react';

export const LogicDisplay: FC<{
  logic: ConditionRelationEnum;
}> = ({ logic }) => (
  <div tw="relative text-center py-1">
    <div tw="absolute top-[50%] -mt-[1px] w-full border-0 border-b border-solid border-[#D9D9D9]" />
    <span tw="min-w-[28px] relative inline-block bg-white">{ConditionRelationConfig[logic]}</span>
  </div>
);
