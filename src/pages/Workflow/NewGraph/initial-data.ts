import { ToolParamsTypeEnum } from '@/constants';
import { WorkflowNodeType } from './nodes';
import type { FlowDocumentJSON } from './typings';
import { END_NODE_ID, INPUT_PARAM_FILTER_DEFAULT, START_NODE_ID } from './constants';

export const initialData: FlowDocumentJSON = {
  nodes: [
    {
      id: START_NODE_ID,
      type: WorkflowNodeType.Start,
      meta: {
        type: WorkflowNodeType.Start,
        position: {
          x: 180,
          y: 573.7,
        },
      },
      data: {
        title: '开始',
        inputParam: INPUT_PARAM_FILTER_DEFAULT,
      },
    },
    {
      id: END_NODE_ID,
      type: WorkflowNodeType.End,
      meta: {
        type: WorkflowNodeType.End,
        isNodeEnd: true,
        position: {
          x: 580,
          y: 573.7,
        },
      },
      data: {
        title: '结束',
        returnType: 0,
      },
    },
  ],
  edges: [],
};
