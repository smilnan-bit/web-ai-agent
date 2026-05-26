import { ToolParamsTypeEnum } from '@/constants';
import { END_NODE_ID, SimpleParamTypeEnum, VariableSplitSymbol } from '../../constants';

export const textOutputParam = [
  {
    name: 'result',
    type: ToolParamsTypeEnum.string,
    value: [END_NODE_ID, 'result', ToolParamsTypeEnum.string].join(VariableSplitSymbol),
    valueType: SimpleParamTypeEnum.quote,
  },
];
