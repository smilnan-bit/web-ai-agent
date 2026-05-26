import { ToolParamsTypeEnum } from '@/constants';
import type { WorkflowNS } from '@/types/Workflow';
import {
  ASTFactory,
  getNodeForm,
  type VariableDeclaration,
  type ASTNodeJSON,
  type PropertyJSON,
  type VariableDeclarationJSON,
  type VariableAbilityParseContext,
} from '@flowgram.ai/free-layout-editor';
import { isArray, uniqBy } from 'lodash';
import React from 'react';
import { SimpleParamTypeEnum, VariableNameSplitSymbol, VariableSplitSymbol } from '../constants';
import { type ConditionNodeSelectEnum, ConditionValueDisableTypes } from '../nodes/condition/const';

export const createASTFromType = ({
  type,
  subType,
  properties,
}: {
  type: ToolParamsTypeEnum;
  subType?: ToolParamsTypeEnum;
  properties?: PropertyJSON[];
}): ASTNodeJSON | undefined => {
  // if (ViewVariableType.isArrayType(type)) {
  //   return ASTFactory.createArray({
  //     items: createASTFromType(ViewVariableType.getArraySubType(type), properties),
  //   });
  // }
  switch (type) {
    case ToolParamsTypeEnum.boolean:
      return ASTFactory.createBoolean();
    case ToolParamsTypeEnum.string:
      return ASTFactory.createString();
    case ToolParamsTypeEnum.number:
      return ASTFactory.createNumber();
    case ToolParamsTypeEnum.integer:
      return ASTFactory.createInteger();
    case ToolParamsTypeEnum.object:
      return ASTFactory.createObject({
        properties,
      });
    // 目前array 类型都没有子参数
    case ToolParamsTypeEnum.array:
      return ASTFactory.createArray({
        items: createASTFromType({ type: subType || ToolParamsTypeEnum.string }),
      });
  }
};
/**
 * ViewVariableTreeNode properties
 * @param treeNode
 * @returns
 */
export const createASTPropertyFromViewVariable = (treeNode): PropertyJSON | undefined => {
  if (!treeNode?.name) {
    return;
  }

  const drilldownProperties = uniqBy(treeNode.subParams || [], (_child) => _child?.name)
    .filter((_child) => _child && _child?.name)
    ?.map(createASTPropertyFromViewVariable)
    .filter(Boolean) as PropertyJSON[];

  // 该输出变量若是引用的其他变量，则使用initializer输出，类型会跟随被引用类型变化而变化
  if (treeNode.refVarAsOutput) {
    return ASTFactory.createProperty({
      key: treeNode?.name,
      meta: treeNode,
      initializer: ASTFactory.createKeyPathExpression({ keyPath: treeNode.keyPath }),
    });
  }
  return ASTFactory.createProperty({
    key: treeNode.name,
    meta: treeNode,
    type: createASTFromType({
      type: treeNode.type,
      subType: treeNode.subType,
      properties: drilldownProperties,
    }),
  });
};

/**
 * Node output variable generation
 * @param rootKey
 * @param variables
 * @returns
 */
export const parseNodeOutputByViewVariableMeta = (
  value: unknown[],
  ctx: VariableAbilityParseContext,
): VariableDeclarationJSON[] => {
  const nodeId = ctx.node.id;
  const list = uniqBy(
    isArray(value) ? value : [value],
    (_child) => _child?.name,
    //  No variable is generated when the Preset variable is not enabled
  ).filter((v) => v && v.name && !(v.isPreset && !v.enabled));
  if (list.length > 0) {
    const Icon = ctx.node.getNodeRegistry().info?.icon;
    return [
      ASTFactory.createVariableDeclaration({
        key: `${nodeId}`,
        meta: {
          title: getNodeForm(ctx.node)?.getValueIn('title') || ctx.node.id,
          icon: <Icon tw="mr-1" />,
          disabled: true,
        },
        type: ASTFactory.createObject({
          properties: list.map(createASTPropertyFromViewVariable).filter(Boolean) as PropertyJSON[],
        }),
      }),
    ];
  }

  return [];
};

/**
 * @param variable 引用变量字符串，格式为 nodeid:varnamepath:vartype
 * @returns { nodeId: string; namePath: string[]; valueArray: string[] }
 * namepath,type和，subtype为快照，在effect中会进行更新
 * 如果拿变量类型，尽量使用getSourceVariable的返回值的meta.type
 */
export const getRefVariable = (variable?: string) => {
  //不是合法的引用变量格式，正常为${nodeid:varname:vartype}
  if (!isValidVarValue(variable)) return null;
  const valueArray = variable?.split(VariableSplitSymbol);
  return valueArray
    ? {
        nodeId: valueArray[0],
        namePath: valueArray[1].split(VariableNameSplitSymbol),
        type: valueArray[2] ? Number(valueArray[2]) : undefined,
        subType: valueArray[3] ? Number(valueArray[3]) : undefined,
        valueArray,
        fullNamePath: [valueArray[0], ...valueArray[1].split(VariableNameSplitSymbol)],
      }
    : null;
};

export const getSourceVariable = (value: string | undefined, availableVariables: VariableDeclaration[]) => {
  if (!value) return null;
  if (getRefVariable(value)) {
    const { nodeId, namePath } = getRefVariable(value) || {};
    if (!nodeId || !namePath) return null;
    const targetNode = availableVariables?.find((item) => item.key === nodeId);
    const targetVariable = targetNode?.getByKeyPath(namePath);
    return targetVariable;
  }
  return null;
};

export const ToolParamsTypeEnumToJsonSchema = (type: ToolParamsTypeEnum, subType?: ToolParamsTypeEnum) => {
  switch (type) {
    case ToolParamsTypeEnum.boolean:
      return { type: 'boolean' };
    case ToolParamsTypeEnum.string:
      return { type: 'string' };
    case ToolParamsTypeEnum.number:
      return { type: 'number' };
    case ToolParamsTypeEnum.integer:
      return { type: 'integer' };
    case ToolParamsTypeEnum.object:
      return { type: 'object' };
    case ToolParamsTypeEnum.array: {
      return {
        type: 'array',
        items: subType ? ToolParamsTypeEnumToJsonSchema(subType) : undefined,
      };
    }
  }
};

export const checkVariableParams = (data: {
  params: (WorkflowNS.WorkflowSimpleParamType & { quoteParam?: string; quoteCondition?: ConditionNodeSelectEnum })[];
  availableVariables: VariableDeclaration[];
  isConditionParam?: boolean;
  restrictQuoteType?: boolean;
}) => {
  const { params, availableVariables, isConditionParam, restrictQuoteType } = data;
  if (!params?.length) {
    return true;
  }
  for (const param of params) {
    const { quoteParam, quoteCondition, value, subParams, valueType, type } = param;
    //非必填不校验
    const skipCheck = param.required === false && !value;
    const isQuoteValue = valueType === SimpleParamTypeEnum.quote;
    //条件分支某些条件可以不填引用变量
    const isConditionAllowed =
      !isConditionParam || (quoteCondition !== undefined && !ConditionValueDisableTypes.includes(quoteCondition));
    const isNonObjectType = type !== ToolParamsTypeEnum.object;

    if (!skipCheck && isQuoteValue && isConditionAllowed && isNonObjectType) {
      const sourceVariable = getSourceVariable(value, availableVariables);
      if (!sourceVariable) {
        return false;
      }
      //引用变量类型不对
      if (restrictQuoteType && value) {
        if (sourceVariable.meta.type !== type) {
          return false;
        }
      }
    }

    //条件分支引用变量
    if (quoteParam) {
      const sourceVariable = getSourceVariable(quoteParam, availableVariables);
      if (!sourceVariable) {
        return false;
      }
    }
    if (subParams?.length) {
      if (!checkVariableParams({ params: subParams, availableVariables, isConditionParam, restrictQuoteType })) {
        return false;
      }
    }
  }
  return true;
};

// 判断是否是合法的引用变量格式
// 类型守卫函数：当返回 true 时，value 一定是 string 类型
export const isValidVarValue = (value?: unknown): value is string => {
  if (!value || typeof value !== 'string') return false;
  if ((value.split(VariableSplitSymbol)?.length || 0) < 3) return false;
  return true;
};
