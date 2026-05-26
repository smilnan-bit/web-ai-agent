import type { WorkflowNS } from '@/types/Workflow';
import { Outputs } from '../../components/node-render/variable-list';

export type OutputParamsType = WorkflowNS.WorkflowSimpleParamType;

export const OutputParamNodeRender = Outputs;
