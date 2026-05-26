import EventEmitter from 'eventemitter3';
import type { ValidateError } from '../services';
import type { WorkflowNodeType } from '../nodes';
import type { WorkflowNodeJSON } from '@flowgram.ai/free-layout-editor';

export enum WorkflowEventNameEnum {
  PROBLEM_PANEL_SHOW = 'problem_panel_show',
  PROBLEM_PANEL_HIDE = 'problem_panel_hide',
  ADD_NODE_MODAL_OPEN = 'add_node_modal_open',
  UNDEFINED_VAR_ERROR = 'undefined_var_error',
  AUTO_SAVE_START = 'autoSaveStart',
  AUTO_SAVE_SUCCESS = 'autoSaveSuccess',
  AUTO_SAVE_FAILED = 'autoSaveFailed',
  CLEAR_AUTO_SAVE_STATE = 'clearAutoSaveState',
  /** 版本切换事件 - 通知聊天面板清除 */
  VERSION_SWITCH = 'versionSwitch',
  /** 打开节点测试面板 */
  NODE_DEBUG_PANEL_OPEN = 'nodeDebugPanelOpen',
}

export interface WorkflowEventEvents {
  [WorkflowEventNameEnum.PROBLEM_PANEL_SHOW]: (errorList?: ValidateError[]) => void;
  [WorkflowEventNameEnum.PROBLEM_PANEL_HIDE]: () => void;
  [WorkflowEventNameEnum.ADD_NODE_MODAL_OPEN]: (payload: {
    open: boolean;
    nodeType: WorkflowNodeType;
    onAdd: (addJson: WorkflowNodeJSON) => void;
  }) => void;
  [WorkflowEventNameEnum.UNDEFINED_VAR_ERROR]: (payload: { nodeId: string; hasError: boolean }) => void;
  [WorkflowEventNameEnum.AUTO_SAVE_START]: () => void;
  [WorkflowEventNameEnum.AUTO_SAVE_SUCCESS]: () => void;
  [WorkflowEventNameEnum.AUTO_SAVE_FAILED]: () => void;
  [WorkflowEventNameEnum.CLEAR_AUTO_SAVE_STATE]: () => void;
  [WorkflowEventNameEnum.VERSION_SWITCH]: () => void;
  [WorkflowEventNameEnum.NODE_DEBUG_PANEL_OPEN]: (nodeId: string) => void;
}

const workflowEventBus = new EventEmitter<WorkflowEventEvents>();

// 应用声明周期内全局事件

export const workflowGlobalRegister = <T extends EventEmitter.EventNames<WorkflowEventEvents>>(
  eventName: T,
  cb: EventEmitter.EventListener<WorkflowEventEvents, T>,
) => {
  workflowEventBus.on(eventName, cb);
};

export const workflowGlobalUnregister = <T extends EventEmitter.EventNames<WorkflowEventEvents>>(
  eventName: T,
  cb: EventEmitter.EventListener<WorkflowEventEvents, T>,
) => {
  workflowEventBus.off(eventName, cb);
};

export const workflowGlobalEmit = <T extends EventEmitter.EventNames<WorkflowEventEvents>>(
  eventName: T,
  ...args: EventEmitter.EventArgs<WorkflowEventEvents, T>
) => {
  workflowEventBus.emit(eventName, ...args);
};

export default workflowEventBus;
