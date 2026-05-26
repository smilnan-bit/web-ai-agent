import type { WorkflowNodeRegistry } from '@flowgram.ai/free-layout-editor';
import { nanoid } from 'nanoid';
import { ScheduleNodeType } from '../constants';
import { IconScheduleIntent } from '../icons';
import { formMeta } from './form-meta';

export const IntentNodeRegistry: WorkflowNodeRegistry = {
  type: ScheduleNodeType.Intent,
  meta: {
    type: ScheduleNodeType.Intent,
    nodePanelVisible: true,
    defaultPorts: [{ type: 'input' }],
    useDynamicPort: true,
  },
  info: {
    title: '意图识别',
    description: '根据用户意图分发到不同处理分支',
    icon: IconScheduleIntent,
    bgColor: 'rgba(51, 126, 255, 0.04)',
  },
  formMeta,
  onAdd() {
    return {
      type: ScheduleNodeType.Intent,
      id: nanoid(),
      data: {
        title: '意图识别',
        model: '',
        intents: [
          { id: nanoid(), name: '', desc: '' },
          { id: nanoid(), name: '', desc: '' },
        ],
        maxRetry: 3,
        retryPrompt: '',
      },
    } as any;
  },
};
