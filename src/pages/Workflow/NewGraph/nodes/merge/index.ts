import { formMeta } from './form-meta';
import { WorkflowNodeType } from '../constants';
import { IconJuhebianliang } from '../icons';
import { genNodeFormConfig } from '../utils';
import { genGroup, type MergeFormData } from './form';

export const MergeNodeRegistry = genNodeFormConfig<MergeFormData>({
  type: WorkflowNodeType.Merge,
  config: {
    info: {
      title: '变量聚合',
      icon: IconJuhebianliang,
      bgColor: 'rgba(237, 190, 0, 0.04)',
    },
    meta: {
      size: {
        width: 360,
        height: 114,
      },
      fieldsToNodeData(data: MergeFormData) {
        const { inputParam, ...rest } = data;
        return {
          ...rest,
          inputParam: inputParam.map((item, i) => {
            return {
              ...item,
              groupName: item.groupName || `Group${i + 1}`,
            };
          }),
        };
      },
    },
  },
  formData: {
    strategy: 1,
    inputParam: [genGroup()],
    outputParam: [],
  },
  formMeta,
});
