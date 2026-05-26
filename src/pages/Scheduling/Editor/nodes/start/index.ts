import type { WorkflowNodeRegistry } from '@flowgram.ai/free-layout-editor';
import { ScheduleNodeType } from '../constants';
import { IconScheduleStart } from '../icons';
import { formMeta } from './form-meta';

export const StartNodeRegistry: WorkflowNodeRegistry = {
  type: ScheduleNodeType.Start,
  meta: {
    type: ScheduleNodeType.Start,
    isStart: true,
    deleteDisable: true,
    copyDisable: true,
    nodePanelVisible: false,
    defaultPorts: [{ type: 'output' }],
  },
  info: {
    title: '开始',
    description: '智能调度的起始节点，接收用户对话输入',
    icon: IconScheduleStart,
    bgColor: 'rgba(51, 126, 255, 0.04)',
  },
  formMeta,
  canAdd() {
    return false;
  },
};
