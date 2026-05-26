import type {
  WorkflowNodeJSON as FlowNodeJSONDefault,
  WorkflowNodeRegistry as FlowNodeRegistryDefault,
  FreeLayoutPluginContext,
  FlowNodeEntity,
  WorkflowEdgeJSON,
  WorkflowNodeMeta,
  WorkflowNodeJSON,
} from '@flowgram.ai/free-layout-editor';
import type { IFlowValue } from '@flowgram.ai/form-materials';

import type { JsonSchema } from './json-schema';
import type { WorkflowNodeType } from '../nodes';
import type { EdgeType } from '../constants';
import type { ProcessTypeEnum } from '../nodes/constants';

/**
 * You can customize the data of the node, and here you can use JsonSchema to define the input and output of the node
 * 你可以自定义节点的 data 业务数据, 这里演示 通过 JsonSchema 来定义节点的输入/输出
 */
export interface FlowNodeJSON extends FlowNodeJSONDefault {
  data: {
    /**
     * Node title
     */
    title?: string;
    /**
     * Inputs data values
     */
    inputsValues?: Record<string, IFlowValue>;
    /**
     * Define the inputs data of the node by JsonSchema
     */
    inputs?: JsonSchema;
    /**
     * Define the outputs data of the node by JsonSchema
     */
    outputs?: JsonSchema;
    /**
     * Rest properties
     */
    [key: string]: any;
  };
}

export interface BackendNodeData {
  nodeType: WorkflowNodeType;
  nodeName: string;
  nodeId: string;
  action: string;
  edges: { id: string }[];
}

export interface BackendEdgeData {
  edgeId: string;
  startNode: string;
  endNode: string;
  edgeType: EdgeType;
  relationship?: string;
  index?: number; //条件分支排序，传给后端数据时排序用
  processType?: ProcessTypeEnum;
}

/**
 * You can customize your own node meta
 * 你可以自定义节点的meta
 */
export interface FlowNodeMeta extends WorkflowNodeMeta {
  type?: WorkflowNodeType; // 从meta拿类型
  sidebarDisabled?: boolean;
  nodePanelHidden?: boolean;
  wrapperStyle?: React.CSSProperties;
  onlyInContainer?: WorkflowNodeType;
  skipCheck?: boolean; // 跳过useWorkflowCheck检查，即不需要校验内容是否正确 是否连线
  isOldForm?: boolean; // 是否是老表单,老的使用antd form需要额外处理
  getBackendEdgeData?: (data: { edge: WorkflowEdgeJSON; sourceNode: WorkflowNodeJSON }) => BackendEdgeData;
  checkData?: (data: any) => boolean;
  addModal?: boolean; // 添加节点时是否弹出弹窗
  sonNodeProcessType?: ProcessTypeEnum; // 子节点处理类型
  hideSubCanvasWhenCollapsed?: boolean; // 折叠时是否隐藏子画布,coze bug 子画布隐藏需要单独处理
}

/**
 * You can customize your own node registry
 * 你可以自定义节点的注册器
 */
export interface FlowNodeRegistry extends FlowNodeRegistryDefault {
  meta: FlowNodeMeta;
  info?: {
    title: string;
    icon: React.FC;
    bgColor?: string;
    description?: string;
  };
  canAdd?: (ctx: FreeLayoutPluginContext) => boolean;
  canDelete?: (ctx: FreeLayoutPluginContext, from: FlowNodeEntity) => boolean;
  onAdd?: (ctx: FreeLayoutPluginContext) => FlowNodeJSON;
}

export interface FlowDocumentJSON {
  nodes: FlowNodeJSON[];
  edges: WorkflowEdgeJSON[];
}
