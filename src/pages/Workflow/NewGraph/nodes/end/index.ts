import type { FlowNodeRegistry } from '../../typings';
import { formMeta } from './form-meta';
import { WorkflowNodeType } from '../constants';
import { IconJieshu } from '../icons';

export const EndNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.End,
  meta: {
    type: WorkflowNodeType.End,
    deleteDisable: true,
    copyDisable: true,
    nodePanelVisible: false,
    defaultPorts: [{ type: 'input' }],
    size: {
      width: 360,
      height: 114,
    },
  },
  info: {
    title: '结束',
    icon: IconJieshu,
    bgColor: 'rgba(242, 85, 85, 0.04)',
    description: 'The final node of the workflow, used to return the result information after the workflow is run.',
  },
  /**
   * Render node via formMeta
   */
  formMeta,
  /**
   * End Node cannot be added
   */
  canAdd() {
    return false;
  },
};

export { EndContent } from './node-content';
