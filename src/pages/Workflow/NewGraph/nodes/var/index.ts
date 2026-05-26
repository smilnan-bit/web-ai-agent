import { formMeta } from './form-meta';
import { WorkflowNodeType } from '../constants';
import { IconBianliangfuzhi } from '../icons';
import { genNodeFormConfig } from '../utils';
import { type VarFormData, VarOutputData } from './form';

export const VarNodeRegistry = genNodeFormConfig<VarFormData>({
  type: WorkflowNodeType.Var,
  config: {
    info: {
      title: '全局变量赋值',
      icon: IconBianliangfuzhi,
      bgColor: 'rgba(237, 190, 0, 0.04)',
    },
    meta: {
      size: {
        width: 360,
        height: 114,
      },
    },
  },
  formData: {
    outputParam: [...VarOutputData],
  },
  formMeta,
});
