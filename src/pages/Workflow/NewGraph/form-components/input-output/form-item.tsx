import { Input } from 'antd';
import React from 'react';
import EnumSelect from '@/components/EnumSelect';
import type { ToolParamsTypeEnum } from '@/constants';
import { FormField, useField, useWatch } from '@form';
import { SimpleParamTypeConfig, SimpleParamTypeEnum } from '../../constants';
import ParamSelect from './param-select';

const ParamsFormWithValueItem: React.FC<{
  hideType?: boolean;
  quoteValType?: ToolParamsTypeEnum | ToolParamsTypeEnum[];
  quoteValSubType?: ToolParamsTypeEnum[];
  onQuoteValueChange?: (value?: string) => void;
  disableAll?: boolean; // 是否全部禁用
  placeholder?: string;
  disableValueType?: boolean; // 是否禁用类型选择
  excludeValType?: ToolParamsTypeEnum[]; //不允许选择的变量类型
}> = ({
  quoteValType,
  onQuoteValueChange,
  placeholder = '',
  quoteValSubType,
  hideType,
  disableAll = false,
  disableValueType = false,
  excludeValType,
}) => {
  const itemField = useField();
  const valueType = useWatch(`${itemField.name}[valueType]`);

  return (
    <>
      {hideType ? null : (
        <div tw="flex-[1] min-w-0">
          <FormField<number> name={`${itemField.name}[valueType]`}>
            <EnumSelect
              optionsConfig={SimpleParamTypeConfig}
              hasAll={false}
              onChange={(value) => {
                itemField.onChange({
                  ...(itemField.value as Record<string, unknown>),
                  valueType: value,
                  value: undefined,
                });
              }}
              hasSortValue={true}
              disabled={disableAll || disableValueType}
            />
          </FormField>
        </div>
      )}
      <div tw="flex-[3] min-w-0 overflow-hidden">
        <FormField<string> name={`${itemField.name}[value]`}>
          {(field) =>
            valueType === SimpleParamTypeEnum.input ? (
              <Input
                placeholder={placeholder || '请输入'}
                status={field.status}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                maxLength={100}
                disabled={disableAll}
              />
            ) : (
              <ParamSelect
                hasError={field.status === 'error'}
                quoteValType={quoteValType}
                quoteValSubType={quoteValSubType}
                excludeValType={excludeValType}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  onQuoteValueChange?.(value);
                }}
                placeholder={placeholder || '请选择引用变量'}
                disabled={disableAll}
              />
            )
          }
        </FormField>
      </div>
    </>
  );
};

export default ParamsFormWithValueItem;
