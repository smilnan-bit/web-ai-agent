import type { WorkflowEdgeJSON } from '@flowgram.ai/free-layout-editor';
import { ScheduleNodeType } from './nodes/constants';

export interface ScheduleDocumentJSON {
  nodes: any[];
  edges: WorkflowEdgeJSON[];
}

export const START_NODE_ID = 'schedule_start';
export const END_NODE_ID = 'schedule_end';

export const initialData: ScheduleDocumentJSON = {
  nodes: [
    {
      id: START_NODE_ID,
      type: ScheduleNodeType.Start,
      meta: { type: ScheduleNodeType.Start, position: { x: 180, y: 300 } },
      data: { title: '开始' },
    },
    {
      id: END_NODE_ID,
      type: ScheduleNodeType.End,
      meta: { type: ScheduleNodeType.End, position: { x: 600, y: 300 } },
      data: { title: '结束' },
    },
  ],
  edges: [],
};
