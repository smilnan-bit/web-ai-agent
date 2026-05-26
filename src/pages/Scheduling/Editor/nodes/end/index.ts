import type { WorkflowNodeRegistry } from '@flowgram.ai/free-layout-editor';
import { ScheduleNodeType } from '../constants';
import { IconScheduleEnd } from '../icons';
import { formMeta } from './form-meta';

export const EndNodeRegistry: WorkflowNodeRegistry = {
  type: ScheduleNodeType.End,
  meta: {
    type: ScheduleNodeType.End,
    deleteDisable: true,
    copyDisable: true,
    nodePanelVisible: false,
    defaultPorts: [{ type: 'input' }],
  },
  info: {
    title: '结束',
    description: '智能调度的终止节点，对话到此直接结束',
    icon: IconScheduleEnd,
    bgColor: 'rgba(242, 85, 85, 0.04)',
  },
  formMeta,
  canAdd() {
    return false;
  },
};
