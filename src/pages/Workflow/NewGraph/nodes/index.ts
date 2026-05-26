export { WorkflowNodeType } from './constants';
import type { FlowNodeRegistry } from '../typings';
import { StartNodeRegistry } from './start';
import { LLMNodeRegistry } from './llm';
import { EndNodeRegistry } from './end';
import { ConditionNodeRegistry } from './condition';
import { CommentNodeRegistry } from './comment';
import { ToolNodeRegistry } from './tool';
import { ReplyNodeRegistry } from './reply';
import { DialogNodeRegistry } from './dialog';
import { KnowledgeNodeRegistry } from './knowledge';
import { CodeNodeRegistry } from './code';
import { TextNodeRegistry } from './text';
import { MergeNodeRegistry } from './merge';
import { VarNodeRegistry } from './var';
import { GroupNodeRegistry } from './group';
import { BatchNodeRegistry } from './batch';
import { BlockStartNodeRegistry } from './block-start';
import { BlockEndNodeRegistry } from './block-end';
import { SubWorkflowNodeRegistry } from './sub-workflow';

export const nodeRegistries: FlowNodeRegistry[] = [
  SubWorkflowNodeRegistry,
  ConditionNodeRegistry,
  CodeNodeRegistry,
  StartNodeRegistry,
  EndNodeRegistry,
  BatchNodeRegistry,
  LLMNodeRegistry,
  ToolNodeRegistry,
  CommentNodeRegistry,
  ReplyNodeRegistry,
  DialogNodeRegistry,
  KnowledgeNodeRegistry,
  TextNodeRegistry,
  MergeNodeRegistry,
  VarNodeRegistry,
  GroupNodeRegistry,
  BlockStartNodeRegistry,
  BlockEndNodeRegistry,
];
