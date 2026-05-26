import React from 'react';
import TypeCascader, { type TypeCascaderProps } from '@/components/TypeCascader';
import type { ToolParamsTypeEnum } from '@/constants';

export const TypeSelectItem: React.FC<
  {
    value?: ToolParamsTypeEnum;
    subType?: ToolParamsTypeEnum;
    onChange?: (value?: ToolParamsTypeEnum) => void;
    otherChange?: (value?: [ToolParamsTypeEnum, ToolParamsTypeEnum?]) => void;
  } & TypeCascaderProps
> = ({ value, subType, onChange, otherChange, ...props }) => {
  const cascaderValue = subType
    ? ([value, subType] as [ToolParamsTypeEnum, ToolParamsTypeEnum])
    : (value as ToolParamsTypeEnum);
  return (
    <TypeCascader
      style={{ width: '100%' }}
      value={cascaderValue}
      onChange={(value) => {
        const type = value?.[0];

        onChange?.(type);
        otherChange?.(value);
      }}
      placeholder="请选择变量类型"
      {...props}
    />
  );
};
