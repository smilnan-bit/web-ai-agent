import { VariableTagList } from './variable-tag-list';
import { Field } from './field';
import React from 'react';
import { useNodeRenderContext } from '../../hooks';
import { SimpleParamTypeEnum } from '../../constants';
import { ToolParamsTypeEnum } from '@/constants';
import { useAvailableVariables, useWatchFormValues, type VariableDeclaration } from '@flowgram.ai/free-layout-editor';
import { getSourceVariable } from '../../utils/variables';
import type { WorkflowNS } from '@/types/Workflow';
import type { ToolNS } from '@/types/Tools';
import { checkSingleParam } from '../../utils';

export function transformParams({
  params,
  variables,
  restrictQuoteType,
  checkInvalid,
  showAsArray,
  includeType,
  disableCheckValueType = false,
}: {
  params: WorkflowNS.WorkflowSimpleParamType[] | undefined;
  variables: VariableDeclaration[];
  restrictQuoteType?: boolean;
  checkInvalid?: boolean;
  showAsArray?: boolean;
  includeType?: ToolParamsTypeEnum[];
  disableCheckValueType?: boolean;
}): ToolNS.ToolParamsType[] {
  return params?.map((item) => {
    if (!disableCheckValueType && item?.valueType === SimpleParamTypeEnum.quote) {
      const sourceVariable = getSourceVariable(item?.value, variables);
      if (item.value && (restrictQuoteType || includeType?.length)) {
        const varType = sourceVariable?.meta?.type;
        const varSubType = sourceVariable?.meta?.subType;
        //类型匹配不上
        if (
          (item.type && varType !== item.type) ||
          (varType === ToolParamsTypeEnum.array && item.subType && varSubType !== item.subType) ||
          (includeType?.length && !includeType.includes(varType))
        ) {
          return {
            name: sourceVariable?.name,
            type: varType,
            subType: varSubType,
            invalid: true,
          };
        }
      }
      if (showAsArray) {
        return {
          name: item?.name,
          //不支持 array<array> 和 array<object>
          type: [undefined, ToolParamsTypeEnum.array, ToolParamsTypeEnum.object].includes(sourceVariable?.meta?.type)
            ? undefined
            : ToolParamsTypeEnum.array,
          subType: [undefined, ToolParamsTypeEnum.array, ToolParamsTypeEnum.object].includes(sourceVariable?.meta?.type)
            ? undefined
            : sourceVariable?.meta.type,
        };
      }
      return {
        name: item?.name,
        //非必填且有类型则使用原有类型，否则使用引用的变量类型
        type:
          item.required === false && item.type ? item.type : !sourceVariable ? undefined : sourceVariable?.meta?.type,
        subType:
          item.required === false && item.subType
            ? item.subType
            : !sourceVariable
              ? undefined
              : sourceVariable?.meta?.subType,
      };
    } else if (!disableCheckValueType && item?.valueType === SimpleParamTypeEnum.input) {
      return {
        name: item.name,
        type: item.type || ToolParamsTypeEnum.string,
        subType: item.subType,
        invalid: checkInvalid ? !checkSingleParam(item) : false,
      };
    } else {
      return { ...item, invalid: checkInvalid ? !checkSingleParam(item) : false };
    }
  }) as (ToolNS.ToolParamsType & { invalid?: boolean })[];
}

/**
 * 节点输出
 */
export function Outputs({
  showPort,
  portId,
  title,
  showAsArray = false,
  disableCheckValueType = false,
}: { showPort?: boolean; portId?: string; title?: string; showAsArray?: boolean; disableCheckValueType?: boolean }) {
  const { node } = useNodeRenderContext();
  const formData = useWatchFormValues(node);
  const { fieldsToNodeData } = node.getNodeMeta();
  const availableVariables = useAvailableVariables();
  const data = fieldsToNodeData ? fieldsToNodeData(formData, availableVariables) : formData;

  const outputParams = data?.outputParam || [];
  const variables = useAvailableVariables();
  const isEmpty = !outputParams || outputParams.length === 0;
  return (
    <Field label={title || '输出'} isEmpty={isEmpty} showPort={showPort} portId={portId}>
      <VariableTagList
        value={transformParams({ params: outputParams, variables, showAsArray, disableCheckValueType })}
      />
    </Field>
  );
}

export function Inputs({
  restrictQuoteType,
  checkInvalid,
  label,
  isGlobal = false,
  showAsArray = false, // 是否显示为数组，类型为数组包裹子元素
  includeType,
  useFieldsToNodeData = true,
}: {
  restrictQuoteType?: boolean;
  checkInvalid?: boolean;
  label?: string;
  isGlobal?: boolean;
  showAsArray?: boolean;
  includeType?: ToolParamsTypeEnum[];
  useFieldsToNodeData?: boolean;
}) {
  const { node } = useNodeRenderContext();
  const formData = useWatchFormValues(node);
  const { fieldsToNodeData } = node.getNodeMeta();
  const availableVariables = useAvailableVariables();
  const data = useFieldsToNodeData && fieldsToNodeData ? fieldsToNodeData(formData, availableVariables) : formData;
  const inputParams = data?.inputParam || [];
  const isEmpty = !inputParams || inputParams.length === 0;
  const variables = useAvailableVariables();

  return (
    <Field label={label === undefined ? '输入' : label} isEmpty={isEmpty}>
      <VariableTagList
        value={transformParams({
          params: inputParams,
          variables,
          restrictQuoteType,
          checkInvalid,
          showAsArray,
          includeType,
        })}
        isGlobal={isGlobal}
      />
    </Field>
  );
}
