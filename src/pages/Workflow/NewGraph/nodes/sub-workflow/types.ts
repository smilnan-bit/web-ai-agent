import type { ToolNS } from '@/types/Tools';
import { CodeNodeErrorConfig } from '../code/const';
import type { EndOutputTypeEnum } from '../end/form';

/** 与 CodeNodeErrorEnum 一致，子工作流节点复用同一套错误处理枚举（类型 + 值） */
export { CodeNodeErrorEnum as SubWorkflowNodeErrorEnum } from '../code/const';
export const SubWorkflowNodeErrorConfig = CodeNodeErrorConfig;

/** 子工作流节点的表单数据 */
export interface SubWorkflowNodeData {
  /** 引用的子工作流 ID */
  refWorkflowId?: number;
  /** 引用的子工作流名称（仅用于 UI 展示，不参与流程执行） */
  workflowName?: string;
  workflowDesc?: string;
  /** 入参列表（来自子工作流的 inputParams schema） */
  inputParam?: ToolNS.ToolParamsType[];
  /** 出参列表（来自子工作流的 outputParams schema） */
  outputParam?: ToolNS.ToolParamsType[];
  returnType: EndOutputTypeEnum;
  settingOnError: {
    processType: any;
    dataOnErr?: string;
  };
  /** 节点标题 */
  title?: string;
}
