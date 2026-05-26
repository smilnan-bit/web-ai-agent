import type { WorkflowNodeRegistry } from '@flowgram.ai/free-layout-editor';
import { nanoid } from 'nanoid';
import { ScheduleNodeType } from '../constants';
import { IconScheduleNLP } from '../icons';
import { formMeta } from './form-meta';

export const NLPNodeRegistry: WorkflowNodeRegistry = {
  type: ScheduleNodeType.NLP,
  meta: {
    type: ScheduleNodeType.NLP,
    nodePanelVisible: true,
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  info: {
    title: 'NLP',
    description: '交由业务 NLP 模型处理',
    icon: IconScheduleNLP,
    bgColor: 'rgba(118, 74, 245, 0.04)',
  },
  formMeta,
  onAdd() {
    return {
      type: ScheduleNodeType.NLP,
      id: nanoid(),
      data: { title: 'NLP', conversationMode: 'restart' },
    } as any;
  },
};
