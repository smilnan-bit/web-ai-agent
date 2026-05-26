import { useAvailableVariables } from '@flowgram.ai/free-layout-editor';
import React, { useCallback, useMemo } from 'react';
import { ToolParamsTypeEnum } from '@/constants';
import type { TreeSelectProps } from 'antd';
import './param-select.less';
import { VariableNameSplitSymbol, VariableSplitSymbol } from '../../constants';
import { ToolParamsTypeEnumToJsonSchema } from '../../utils/variables';
import { VariableSelector } from '../../components/variable-selector';

// 数组类型的所有可能子类型
export const ARRAY_SUB_TYPES = [
  ToolParamsTypeEnum.string,
  ToolParamsTypeEnum.number,
  ToolParamsTypeEnum.integer,
  ToolParamsTypeEnum.boolean,
  ToolParamsTypeEnum.object,
];

const ParamSelect: React.FC<
  TreeSelectProps & {
    value?: string;
    onChange?: (value?: string) => void;
    quoteValType?: ToolParamsTypeEnum | ToolParamsTypeEnum[];
    quoteValSubType?: ToolParamsTypeEnum[];
    hasError?: boolean;
    excludeValType?: ToolParamsTypeEnum[];
  }
> = ({ value, onChange, quoteValType, quoteValSubType, excludeValType, ...props }) => {
  const availableVariables = useAvailableVariables();

  const innerValue = useMemo(() => {
    const valueArray = value?.split(VariableSplitSymbol);
    return valueArray?.slice(0, 2);
  }, [value]);

  const onInnerChange = useCallback(
    (value) => {
      if (!value) {
        onChange?.(undefined);
        return;
      }
      const nodeId = value[0];
      const variableName = value.slice(1);
      const targetNode = availableVariables.find((item) => item.key === nodeId);
      const targetVariable = targetNode?.getByKeyPath(variableName);
      if (!targetVariable) {
        onChange?.(undefined);
        return;
      }
      const valueArray = [nodeId, variableName.join(VariableNameSplitSymbol), targetVariable.meta.type];
      if (targetVariable.meta.type === ToolParamsTypeEnum.array) {
        valueArray.push(targetVariable.meta.subType || ToolParamsTypeEnum.string);
      }
      const serializeValue = valueArray.join(VariableSplitSymbol);
      onChange?.(serializeValue);
    },
    [onChange, availableVariables],
  );
  const excludeSchema = useMemo(() => {
    if (!excludeValType?.length) {
      return undefined;
    }
    const baseSchemas = excludeValType.map(ToolParamsTypeEnumToJsonSchema);
    const arraySubTypeSchemas = excludeValType.includes(ToolParamsTypeEnum.array)
      ? ARRAY_SUB_TYPES.map((subType) => ToolParamsTypeEnumToJsonSchema(ToolParamsTypeEnum.array, subType))
      : [];
    return [...baseSchemas, ...arraySubTypeSchemas];
  }, [excludeValType]);

  const includeSchema = useMemo(() => {
    if (!quoteValType) {
      return undefined;
    }
    const baseSchemas = Array.isArray(quoteValType)
      ? quoteValType.map((type) => ToolParamsTypeEnumToJsonSchema(type))
      : [ToolParamsTypeEnumToJsonSchema(quoteValType)];

    const includeValSubType = quoteValSubType?.length ? quoteValSubType : ARRAY_SUB_TYPES;
    const arraySubTypeSchemas =
      (Array.isArray(quoteValType) && quoteValType.includes(ToolParamsTypeEnum.array)) ||
      quoteValType === ToolParamsTypeEnum.array
        ? includeValSubType.map((subType) => ToolParamsTypeEnumToJsonSchema(ToolParamsTypeEnum.array, subType))
        : [];
    const result = [...baseSchemas, ...arraySubTypeSchemas];
    return result;
  }, [quoteValType, quoteValSubType]);

  return (
    <div className="m-param-select">
      <VariableSelector
        hasError={props.hasError}
        style={{
          width: '100%',
          height: 32,
          minWidth: 0,
        }}
        excludeSchema={excludeSchema}
        includeSchema={includeSchema}
        value={innerValue}
        onChange={onInnerChange}
        config={{ placeholder: (props.placeholder as string) || '请选择变量', notFoundContent: '未定义' }}
        readonly={props.disabled}
      />
    </div>
  );
};

export default ParamSelect;
