import React from 'react';
import { Cascader } from 'antd';
import type { CascaderProps } from 'antd';
import { ToolParamsTypeEnum, ToolParamsTypeShowEnum } from '@/constants';

export interface TypeCascaderProps {
  value?: ToolParamsTypeEnum | [ToolParamsTypeEnum, ToolParamsTypeEnum];
  onChange?: (value?: [ToolParamsTypeEnum, ToolParamsTypeEnum?]) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  disableObject?: boolean;
  cascaderProps?: CascaderProps;
  children?: React.ReactNode;
  disableArray?: boolean;
}

const TypeCascader: React.FC<TypeCascaderProps> = ({
  value,
  onChange,
  placeholder = '请选择变量类型',
  disabled,
  style,
  cascaderProps,
  disableObject,
  children,
  disableArray,
}) => {
  const allTypeValues: ToolParamsTypeEnum[] = [
    ToolParamsTypeEnum.string,
    ToolParamsTypeEnum.integer,
    ToolParamsTypeEnum.number,
    ToolParamsTypeEnum.boolean,
    ...(disableObject ? [] : [ToolParamsTypeEnum.object]),
    ...(disableArray ? [] : [ToolParamsTypeEnum.array]),
  ];

  const secondLevelValues = allTypeValues.filter(
    (t) => t !== ToolParamsTypeEnum.array && t !== ToolParamsTypeEnum.object,
  );

  const options: CascaderProps['options'] = allTypeValues.map((t) => {
    const isArray = t === ToolParamsTypeEnum.array;
    return {
      value: t,
      label: ToolParamsTypeShowEnum[t],
      disabled: false,
      isLeaf: !isArray,
      children: isArray
        ? secondLevelValues.map((c) => ({ value: c, label: ToolParamsTypeShowEnum[c], isLeaf: true }))
        : undefined,
    };
  });

  const cascaderValue =
    value === undefined
      ? undefined
      : Array.isArray(value)
        ? value
        : value === ToolParamsTypeEnum.array
          ? [value, ToolParamsTypeEnum.string]
          : [value];

  return (
    <Cascader
      {...(cascaderProps as any)}
      style={style}
      disabled={disabled}
      options={options}
      value={cascaderValue}
      displayRender={(labels) => {
        if (labels && labels.length === 2 && labels[0] === ToolParamsTypeShowEnum[ToolParamsTypeEnum.array]) {
          return `Array<${labels[1]}>`;
        }
        return labels?.[0] as string;
      }}
      onChange={(val) => {
        if (!val || val.length === 0) {
          onChange?.(undefined);
          return;
        }
        const type = val[0] as ToolParamsTypeEnum;
        const subType = (val[1] as ToolParamsTypeEnum) || undefined;
        onChange?.([type, subType]);
      }}
      placeholder={placeholder}
      dropdownClassName={`type-cascader-dropdown`}
    >
      {children}
    </Cascader>
  );
};

export default TypeCascader;
