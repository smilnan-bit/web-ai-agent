import type { FlowNodeRegistry } from '../../typings';
import { formMeta } from './form-meta';
import { WorkflowNodeType } from '../constants';
import { IconKaishi } from '../icons';

export const BlockStartNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.BlockStart,
  meta: {
    type: WorkflowNodeType.BlockStart,
    isStart: true,
    deleteDisable: true,
    copyDisable: true,
    sidebarDisabled: true,
    nodePanelVisible: false,
    defaultPorts: [{ type: 'output' }],
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
    icon: IconKaishi,
    title: '区块开始节点',
    description: '区块开始节点',
  },
  /**
   * Render node via formMeta
   */
  formMeta,
  formData: {
    title: '区块开始节点',
  },
  /**
   * Start Node cannot be added
   */
  canAdd() {
    return false;
  },
};
