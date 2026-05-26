import type { FlowNodeRegistry } from '../../typings';
import { formMeta } from './form-meta';
import { WorkflowNodeType } from '../constants';
import { IconKaishi } from '../icons';

export const StartNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.Start,
  meta: {
    type: WorkflowNodeType.Start,
    isStart: true,
    deleteDisable: true,
    copyDisable: true,
    nodePanelVisible: false,
    defaultPorts: [{ type: 'output' }],
    size: {
      width: 360,
      height: 84,
    },
  },
  info: {
    title: '开始',
    icon: IconKaishi,
    bgColor: 'rgba(51, 126, 255, 0.04)',
    description: '工作流的起始节点，用于设定启动工作流需要的信息',
  },
  /**
   * Render node via formMeta
   */
  formMeta,
  /**
   * Start Node cannot be added
   */
  canAdd() {
    return false;
  },
};

export { StartContent } from './node-content';
