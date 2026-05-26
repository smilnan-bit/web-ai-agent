import { SimpleParamTypeEnum, VariableNameSplitSymbol, VariableSplitSymbol } from '../constants';
import {
  DataEvent,
  type Effect,
  VariableFieldKeyRenameService,
  type EffectOptions,
  getNodeScope,
  type IForm,
} from '@flowgram.ai/free-layout-editor';
import type { ConditionItem } from '../nodes/condition/node-content';
import type { WorkflowNS } from '@/types/Workflow';
import { ToolParamsTypeEnum } from '@/constants';
import { isValidVarValue } from '../utils/variables';

export const autoChangeRefEffect: (data?: { isSingleParam?: boolean }) => EffectOptions[] = ({
  isSingleParam = false,
} = {}) => [
  {
    event: DataEvent.onValueInit,
    effect: ((params) => {
      const { context, form, name } = params;
      const renameService = context.node.getService(VariableFieldKeyRenameService);

      const isCondition = name === 'conditions';
      //变量名变化
      const disposableRename = renameService.onRename(({ before, after }) => {
        const beforeKeyPath = [...before.parentFields.map((_field) => _field.key).reverse(), before.key];
        const afterKeyPath = [...after.parentFields.map((_field) => _field.key).reverse(), after.key];

        const refreshVariables = ({ value, namePath }: { value?: string; namePath: string }) => {
          if (!isValidVarValue(value)) {
            return;
          }
          const [nodeId, variableNames, varType] = value.split(VariableSplitSymbol);
          const currentNamePath = [nodeId, ...variableNames.split(VariableNameSplitSymbol)];
          if (isKeyPathMatch(currentNamePath, beforeKeyPath)) {
            //如obj.obj2.obj3 => obj1.obj2.obj3 ,需把后面的obj2,obj3拼接上去
            const suffixNamePath = currentNamePath.slice(beforeKeyPath.length);
            //afterKeyPath 第一项为nodeId，需要去掉
            const newVarNamePath = [...afterKeyPath.slice(1), ...suffixNamePath];
            form.setValueIn(
              namePath,
              [nodeId, newVarNamePath.join(VariableNameSplitSymbol), varType].join(VariableSplitSymbol),
            );
          }
        };
        if (isSingleParam) {
          refreshVariables({ value: safeGetFormValues(form, name), namePath: name });
          return;
        }
        // 递归处理引用参数（在文档可能被销毁时保护调用）
        walkParams({
          params: safeGetFormValues(form, name),
          basePath: name,
          refresh: refreshVariables,
        });
        if (isCondition) {
          refreshConditionParams({ form, name, refresh: refreshVariables });
        }
      });

      //变量类型变化、删除变量
      const disposableVarChange = getNodeScope(context.node).available.onListOrAnyVarChange((variables) => {
        const refreshVariables = ({
          value,
          namePath,
          resetFields,
        }: {
          value?: string;
          namePath: string;
          resetFields?: string[];
        }) => {
          if (!isValidVarValue(value)) {
            return;
          }
          const beforeValueArray = value.split(VariableSplitSymbol);
          const refNode = variables.find((item) => item.key === beforeValueArray[0]);
          const newVar = refNode?.getByKeyPath(beforeValueArray[1].split(VariableNameSplitSymbol));
          const newVarIsArray = newVar?.meta.type === ToolParamsTypeEnum.array;
          //type或subtype变化时，更新相应引用值
          if (
            newVar &&
            (newVar.meta.type !== Number(beforeValueArray[2]) ||
              (newVarIsArray &&
                newVar.meta.subType !== undefined &&
                newVar.meta.subType !== Number(beforeValueArray[3])))
          ) {
            form.setValueIn(
              namePath,
              [...beforeValueArray.slice(0, 2), newVar.meta.type, ...(newVarIsArray ? [newVar.meta.subType] : [])].join(
                VariableSplitSymbol,
              ),
            );
            resetFields?.forEach((field) => {
              form.setValueIn(field, undefined);
            });
          }
        };
        if (isSingleParam) {
          refreshVariables({ value: safeGetFormValues(form, name), namePath: name });
          return;
        }
        // 递归处理引用参数（在文档可能被销毁时保护调用）
        walkParams({
          params: safeGetFormValues(form, name),
          basePath: name,
          refresh: refreshVariables,
        });
        if (isCondition) {
          refreshConditionParams({ form, name, refresh: refreshVariables });
        }
      });

      return () => {
        disposableRename.dispose();
        disposableVarChange.dispose();
      };
    }) as Effect,
  },
];

/**
 * If ref value's keyPath is the under as targetKeyPath
 * @param value
 * @param targetKeyPath
 * @returns
 */
function isKeyPathMatch(keyPath: string[], targetKeyPath: string[]) {
  return targetKeyPath.every((_key, index) => _key === keyPath[index]);
}

// 递归处理引用参数
function walkParams(options: {
  params: WorkflowNS.WorkflowSimpleParamType[] | undefined;
  basePath: string; // 如 `${name}.${idx}.subParams`
  refresh: (v: { value?: string; namePath: string }) => void;
}) {
  const { params, basePath, refresh } = options;
  if (!params?.length) return;

  params.forEach((p, i) => {
    // 处理 value 是引用
    if (p?.valueType === SimpleParamTypeEnum.quote) {
      refresh({ value: p.value, namePath: `${basePath}.${i}.value` });
    }
    // 递归子参数
    if (p?.subParams?.length) {
      walkParams({
        params: p.subParams,
        basePath: `${basePath}.${i}.subParams`,
        refresh,
      });
    }
  });
}

// 处理条件分支下 params 的刷新逻辑
function refreshConditionParams(options: {
  form: IForm;
  name: string;
  refresh: (v: { value?: string; namePath: string; resetFields?: string[] }) => void;
}) {
  const { form, name, refresh } = options;
  const list = safeGetFormValues(form, name);
  list?.forEach((_v: ConditionItem, idx: number) => {
    _v.params?.forEach((param: ConditionItem['params'][number], paramIndex: number) => {
      if (param?.valueType === SimpleParamTypeEnum.quote) {
        refresh({
          value: param.value,
          namePath: `${name}.${idx}.params.${paramIndex}.value`,
        });
      }
      refresh({
        value: param?.quoteParam,
        namePath: `${name}.${idx}.params.${paramIndex}.quoteParam`,
        resetFields: [`${name}.${idx}.params.${paramIndex}.quoteCondition`],
      });
    });
  });
}

// 文档销毁时保护性获取
function safeGetFormValues(form: IForm, name: string) {
  try {
    return form.getValueIn(name);
  } catch (e) {
    return undefined;
  }
}
