import type { ToolParamsTypeEnum } from '@/constants';
import type { ToolNS } from './Tools';
import type { SimpleParamTypeEnum } from '@/pages/Workflow/NewGraph/constants';

// biome-ignore lint/style/noNamespace: <explanation>
declare namespace WorkflowNS {
  export interface WorkflowType {
    workflowId: number;
    workflowName: string;
    workflowDesc: string;
    status?: WorkflowStatusEnum;
    version?: number;
    releaseTime?: number;
    operatorGuid?: string;
    updateTime?: number;
    diagramInfo?: string;
    responseParams?: ToolNS.ToolParamsType[];
    isCopy?: boolean; // 前端字段，判断是否为复制新建
  }

  export interface WorkflowSimpleParamType extends ToolNS.ToolParamsType {
    id?: string;
    valueType?: SimpleParamTypeEnum;
    value?: string;
    type?: ToolParamsTypeEnum;
  }

  // 工作流版本历史列表项
  export interface WorkflowHistoryItem {
    workflowId: number;
    version: number;
    operatorName: string;
    releaseTime: number;
  }

  // 工作流版本详情
  export interface WorkflowVersionDetail {
    workflowId: number;
    version: number;
    canvasInfo: string;
    firstNodeId?: string;
    operatorName: string;
    releaseTime: number;
    nodeList?: any[];
  }
}
