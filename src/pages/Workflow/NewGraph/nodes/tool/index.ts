import { formMeta } from './form-meta';
import { WorkflowNodeType } from '../constants';
import { IconGongju } from '../icons';
import { genNodeFormConfig } from '../utils';

export const ToolNodeRegistry = genNodeFormConfig({
  type: WorkflowNodeType.Tool,
  config: {
    meta: {
      type: WorkflowNodeType.Tool,
      size: {
        width: 360,
        height: 211,
      },
      addModal: true,
      fieldsToNodeData(fields: Record<string, any>) {
        const { templateConfig, ...otherFields } = fields || {};
        return otherFields;
      },
    },
    info: {
      title: '工具',
      icon: IconGongju,
      bgColor: 'rgba(80, 191, 136, 0.04)',
    },
  },
  formMeta,
});

export { ToolContent } from './node-content';
