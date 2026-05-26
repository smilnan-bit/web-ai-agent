import { getNodeForm, type FreeLayoutPluginContext } from '@flowgram.ai/free-layout-editor';
import type { WorkflowNodeType } from '../nodes';
import { ToolParamsTypeEnum } from '@/constants';
import { END_NODE_ID, SimpleParamTypeEnum, VariableSplitSymbol } from '../constants';
import type { WorkflowNS } from '@/types/Workflow';
import { getRefVariable } from './variables';
import type { ToolNS } from '@/types/Tools';

export { onDragLineEnd } from './on-drag-line-end';
export { canContainNode } from './can-contain-node';
export { toggleLoopExpanded } from './toggle-loop-expanded';
export { getOrCreateEdgeId, mapWorkflowEdgeListToLineData } from './edge-data';
export { loadCanvasData } from './load-canvas-data';

export const checkUniqueOutPortLine = (fromPort) => {
  // 限制同一个 fromPort 仅能连出一条线
  if (fromPort.availableLines.length >= 1) {
    return false;
  }
  return true;
};

/**
 * 生成唯一的节点标题，避免与现有标题重复
 * @param baseTitle 基础标题
 * @param existingTitles 现有标题集合
 * @returns 唯一的标题
 */
export const generateUniqueTitle = (baseTitle: string, existingTitles: Set<string>): string => {
  let titlePrefix = baseTitle;
  let startIndex = 0;
  let newTitle = titlePrefix;

  // 检查标题是否已有数字后缀
  const matched = titlePrefix.match(/-(\d+)$/);
  if (matched) {
    startIndex = Number(matched[1]);
    titlePrefix = titlePrefix.slice(0, matched.index);
  }

  // 生成唯一标题
  while (existingTitles.has(newTitle)) {
    startIndex += 1;
    newTitle = `${titlePrefix}-${startIndex}`;
  }

  return newTitle;
};

export const getNodeTitle = (type: WorkflowNodeType, ctx: FreeLayoutPluginContext, name?: string) => {
  let title = '';
  if (!name) {
    title = ctx.document.getNodeRegistry(type).info?.title;
  } else {
    title = name;
  }

  const allTitle = ctx.document.getAllNodes().map((node) => {
    const form = getNodeForm(node);
    const title = form?.getValueIn('title');
    return title;
  });
  const allTitleSet = new Set(allTitle);

  return generateUniqueTitle(title, allTitleSet);
};

// 递归检查参数，遇到无效值立即返回 false
export const checkSingleParam = (item: unknown): boolean => {
  const typedItem = item as { type?: number; required?: boolean; value?: unknown; subParams?: unknown[] };
  const type = typedItem?.type;

  // 如果参数不是必需的，跳过检查
  if (type !== ToolParamsTypeEnum.object) {
    if (typedItem?.required === false) {
      return true;
    } else if (!typedItem || [null, undefined, ''].includes(typedItem?.value as any)) {
      return false;
    }
  } else if (typedItem?.subParams?.length) {
    // 使用 for...of 循环，支持提前跳出
    for (const subItem of typedItem.subParams) {
      if (!checkSingleParam(subItem)) {
        return false; // 遇到无效值立即返回 false
      }
    }
  }

  return true;
};

export const checkParams = (outputParam: unknown[], required = false) => {
  if (required) {
    if (!outputParam?.length) return false;
  }

  if (!outputParam) return true;

  // 使用 for...of 循环遍历主参数，支持提前跳出
  for (const item of outputParam) {
    if (!checkSingleParam(item)) {
      return false; // 遇到无效值立即返回 false
    }
  }

  return true;
};

export const initWorkflowToolParam = ({ name, type, desc, required, subParams, subType }: ToolNS.ToolParamsType) => {
  return {
    name,
    type,
    desc,
    required,
    subType,
    subParams: subParams?.map(initWorkflowToolParam),
    valueType: type !== ToolParamsTypeEnum.object ? SimpleParamTypeEnum.quote : undefined,
  };
};

export const initSubWorkflowOutputParam = (workflowOutputParam: WorkflowNS.WorkflowSimpleParamType[]) => {
  return workflowOutputParam?.map((item) => {
    const isInput = item.valueType === SimpleParamTypeEnum.input;
    const refVar = !isInput ? getRefVariable(item.value) : null;
    const itemType = isInput ? ToolParamsTypeEnum.string : refVar?.type;
    const itemSubType = isInput ? undefined : refVar?.subType;
    const valueArray = [END_NODE_ID, item.name, itemType];
    if (itemSubType) valueArray.push(itemSubType);
    return {
      name: item.name,
      type: itemType,
      subType: itemSubType,
      valueType: SimpleParamTypeEnum.quote,
      value: valueArray.join(VariableSplitSymbol),
    };
  });
};
