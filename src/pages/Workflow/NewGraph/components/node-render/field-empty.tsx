import { isString } from 'lodash-es';

import React from 'react';

interface FieldEmptyProps {
  fieldName: string | React.ReactNode;
}

export function FieldEmpty({ fieldName }: FieldEmptyProps) {
  return (
    <div tw="overflow-hidden flex flex-row items-center text-[#ACB3BF]">
      <span tw="flex-1 overflow-hidden truncate whitespace-nowrap">
        {isString(fieldName) ? `未设置${fieldName}` : '未设置'}
        {!isString(fieldName) && fieldName}
      </span>
    </div>
  );
}
