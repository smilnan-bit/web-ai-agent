import type { WorkflowNodeRegistry } from '@flowgram.ai/free-layout-editor';
import { nanoid } from 'nanoid';
import { ScheduleNodeType } from '../constants';
import { IconScheduleAgent } from '../icons';
import { formMeta } from './form-meta';

export const AgentNodeRegistry: WorkflowNodeRegistry = {
  type: ScheduleNodeType.Agent,
  meta: {
    type: ScheduleNodeType.Agent,
    nodePanelVisible: true,
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  info: {
    title: 'Agent',
    description: '将对话路由到指定 Agent 处理',
    icon: IconScheduleAgent,
    bgColor: 'rgba(51, 126, 255, 0.04)',
  },
  formMeta,
  onAdd() {
    return {
      type: ScheduleNodeType.Agent,
      id: nanoid(),
      data: {
        title: 'Agent',
        agentId: '',
        agentName: '',
        agentDesc: '',
        rejectKeywords: ['不是很确定', '我不知道', '可以换其他问法', '您的问题是什么'],
        rejectCharCount: 10,
        rejectAction: 'continue',
        conversationMode: 'restart',
      },
    } as unknown as ReturnType<NonNullable<WorkflowNodeRegistry['onAdd']>>;
  },
};
