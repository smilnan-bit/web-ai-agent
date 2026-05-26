import { ToolParamsTypeEnum } from '@/constants';
import { useAvailableVariables } from '@flowgram.ai/free-layout-editor';
import { useMemoizedFn } from 'ahooks';
import { getSourceVariable } from '../utils/variables';
import { getGlobalVariableMap, GLOBAL_VARIABLE_ID, VariableSplitSymbol } from '../constants';

interface VarInfo {
  fromNodeName: string;
  varName: string;
  type: ToolParamsTypeEnum;
  valid: boolean;
}

export const useVar = () => {
  const variables = useAvailableVariables();
  const getVarInfo = useMemoizedFn((str?: string): VarInfo => {
    let valid = true;
    if (!str) {
      return {
        fromNodeName: '',
        varName: '',
        type: ToolParamsTypeEnum.string,
        valid,
      };
    }
    const sourceVariable = getSourceVariable(str, variables);
    if (!sourceVariable) {
      valid = false;
    }
    let [nodeId, varName, type] = str.split(VariableSplitSymbol);
    if (nodeId === GLOBAL_VARIABLE_ID) {
      varName = getGlobalVariableMap()[varName]?.name;
    }
    const fromNodeName = variables?.find((item) => item.key === nodeId)?.meta?.title;

    return {
      fromNodeName,
      varName,
      type: Number(type),
      valid,
    };
  });

  return {
    getVarInfo,
  };
};
