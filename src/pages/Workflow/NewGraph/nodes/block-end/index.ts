import type { FlowNodeRegistry } from '../../typings';
import { IconJieshu } from '../icons';
import { formMeta } from './form-meta';
import { WorkflowNodeType } from '../constants';

export const BlockEndNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.BlockEnd,
  meta: {
    type: WorkflowNodeType.BlockEnd,
    isNodeEnd: true,
    deleteDisable: true,
    copyDisable: true,
    sidebarDisabled: true,
    nodePanelVisible: false,
    defaultPorts: [{ type: 'input' }],
    size: {
      width: 100,
      height: 100,
    },
    wrapperStyle: {
      minWidth: 'unset',
      width: '100%',
      borderWidth: 2,
      borderRadius: 4,
      cursor: 'move',
      paddingBottom: 0,
    },
  },
  info: {
    icon: IconJieshu,
    title: '区块结束节点',
    description: '区块结束节点',
  },
  /**
   * Render node via formMeta
   */
  formMeta,
  formData: {
    title: '区块结束节点',
  },
  /**
   * Start Node cannot be added
   */
  canAdd() {
    return false;
  },
};
