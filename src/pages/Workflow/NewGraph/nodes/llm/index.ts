import { formMeta } from './form-meta';
import { WorkflowNodeType } from '../constants';
import { IconDamoxing } from '../icons';
import { genNodeFormConfig } from '../utils';

// 大模型默认值 mode:model, temperature:0.7
const defaultLLMValue = { mode: 0, temperature: 0.7 };

export const LLMNodeRegistry = genNodeFormConfig<typeof defaultLLMValue>({
  type: WorkflowNodeType.LLM,
  config: {
    info: {
      title: '大模型',
      icon: IconDamoxing,
      bgColor: 'rgba(159, 128, 255, 0.04)',
    },
    meta: {
      type: WorkflowNodeType.LLM,
      size: {
        width: 360,
        height: 174,
      },
    },
  },
  formMeta,
  formData: defaultLLMValue,
});

export { LLMContent } from './node-content';
