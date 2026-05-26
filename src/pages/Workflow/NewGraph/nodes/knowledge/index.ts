import { formMeta } from './form-meta';
import { WorkflowNodeType } from '../constants';
import { SimpleParamTypeEnum } from '../../constants';
import { IconZhishiku } from '../icons';
import { genNodeFormConfig } from '../utils';
import type { InputParamsType } from '../../form-components/input-output';
import { ToolParamsTypeEnum } from '@/constants';

export const KnowledgeOutputData = [
  {
    name: 'outputList',
    type: ToolParamsTypeEnum.string,
  },
];

export const KnowledgeNodeRegistry = genNodeFormConfig<{
  outputParam: typeof KnowledgeOutputData;
  inputParam: InputParamsType[];
}>({
  type: WorkflowNodeType.Knowledge,
  config: {
    info: {
      title: '知识库',
      icon: IconZhishiku,
      bgColor: 'rgba(75, 177, 250, 0.04)',
    },
    meta: {
      type: WorkflowNodeType.Knowledge,
      size: {
        width: 360,
        height: 144,
      },
    },
  },
  formMeta,
  formData: {
    outputParam: KnowledgeOutputData,
    inputParam: [{ name: 'Query', valueType: SimpleParamTypeEnum.quote }],
  },
});

export { KnowledgeContent } from './node-content';
