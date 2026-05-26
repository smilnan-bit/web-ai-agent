import React, { useMemo } from 'react';
import MulSelect from '@ysf/mul-select';
import type { SelectProps } from 'antd/es/select';

interface EnumSelectProps {
  optionsConfig: Record<string | number, string | number | { name: string; sort: number }>; // 下拉框的选项配置项可以是对象或者数组
  disabledOptions?: (string | number)[]; // 要禁用的Option的Key
  isNumberValue?: boolean; // 是否是数字类型的value,默认为true
  hasAll?: boolean; // 是否有全部选项，默认为true
  hasAllText?: string; // 全部选项的文案，默认为全部
  isNumberEnum?: boolean; // 是否是数字枚举类型
  hasSortValue?: boolean; // 是否有排序字段,若有排序字段，配置项为 {name: string, sort: number}
}

const { Option } = MulSelect;
const EnumSelect: React.FC<EnumSelectProps & SelectProps> = ({
  optionsConfig,
  disabledOptions,
  isNumberValue = true,
  hasAll = true,
  hasAllText = '全部',
  isNumberEnum = false,
  hasSortValue,
  ...selectProps
}) => {
  const realConfig = useMemo(() => {
    const realConfig = isNumberEnum
      ? Object.keys(optionsConfig) // TypeScript 会为数字 Enum 提供反向映射 (value 到 key),特殊处理数字枚举类型
          .filter((key) => !isNaN(Number(key)))
          // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
          .reduce((acc, cur) => ({ ...acc, [cur]: optionsConfig[cur] }), {})
      : optionsConfig;
    let resArray: Array<Array<string>>;
    if (hasSortValue) {
      resArray = Object.entries(realConfig)
        .sort((a, b) => a[1].sort - b[1].sort)
        .map((item) => [item[0], item[1].name]);
    } else resArray = Object.entries(realConfig);
    return resArray;
  }, [hasSortValue, isNumberEnum, optionsConfig]);

  return (
    <MulSelect style={{ width: '100%' }} placeholder="请选择" {...selectProps}>
      {hasAll && <Option value={undefined}>{hasAllText}</Option>}
      {realConfig.map(([key, label]) => {
        const realValue = isNumberValue || isNumberEnum ? Number(key) : key;
        return (
          <Option value={realValue} key={realValue} disabled={disabledOptions?.find((item) => item === realValue)}>
            {label}
          </Option>
        );
      })}
    </MulSelect>
  );
};

export default EnumSelect;
