import type { WorkflowNS } from '@/types/Workflow';
import { autoChangeRefEffect } from '../../effects/autoChangeRefEffect';
import { Inputs } from '../../components/node-render/variable-list';

export type InputParamsType = WorkflowNS.WorkflowSimpleParamType;

export const genInputParamEffect = (name = 'inputParam') => {
  return {
    [name]: autoChangeRefEffect(),
  };
};

export const InputParamNodeRender = Inputs;
