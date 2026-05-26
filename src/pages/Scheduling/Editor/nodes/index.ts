export { ScheduleNodeType } from './constants';

import type { WorkflowNodeRegistry } from '@flowgram.ai/free-layout-editor';
import { StartNodeRegistry } from './start';
import { EndNodeRegistry } from './end';
import { IntentNodeRegistry } from './intent';
import { AgentNodeRegistry } from './agent';
import { NLPNodeRegistry } from './nlp';

export const nodeRegistries: WorkflowNodeRegistry[] = [
  StartNodeRegistry,
  EndNodeRegistry,
  IntentNodeRegistry,
  AgentNodeRegistry,
  NLPNodeRegistry,
];
