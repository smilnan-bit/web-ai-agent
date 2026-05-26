import { formMeta } from './form-meta';
import { WorkflowNodeType } from '../constants';
import { IconWenbenchuli } from '../icons';
import { genNodeFormConfig } from '../utils';
import { getInputInitConcatData, TextConcatOutputData, type TextFormData, TextProcessTypeEnum } from './form';

export const TextNodeRegistry = genNodeFormConfig<TextFormData>({
  type: WorkflowNodeType.Text,
  config: {
    info: {
      title: '文本处理',
      icon: IconWenbenchuli,
      bgColor: 'rgba(237, 190, 0, 0.04)',
    },
    meta: {
      size: {
        width: 360,
        height: 114,
      },
      fieldsToNodeData(data: TextFormData) {
        const { inputParam, delimiters, method, concatResult, ...rest } = data || {};
        const content =
          method === TextProcessTypeEnum.concat ? { concatParam: { concatResult } } : { splitParam: { delimiters } };
        return {
          ...rest,
          inputParam: inputParam?.map(({ id, ...rest }) => rest), //过滤掉id属性
          method,
          ...content,
        };
      },
    },
  },
  formData: {
    method: TextProcessTypeEnum.concat,
    inputParam: [getInputInitConcatData()],
    outputParam: [...TextConcatOutputData],
  },
  formMeta,
});

export { TextContent } from './node-content';
