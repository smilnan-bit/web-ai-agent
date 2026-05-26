import { FlowNodeBaseType } from '@flowgram.ai/free-layout-editor';
export enum WorkflowNodeType {
  Group = FlowNodeBaseType.GROUP, //必须用这个，里面打包了这个属性
  Comment = -1,
  Start = 0,
  End = 1,
  Knowledge = 2,
  Tool = 3,
  Reply = 5,
  Condition = 6,
  LLM = 7,
  Dialog = 8,
  Code = 9,
  Text = 10,
  Merge = 11,
  Var = 12,
  Batch = 13,
  BlockStart = 14,
  BlockEnd = 15,
  SubWorkflow = 16,
}

export enum ProcessTypeEnum {
  main = 0, //主流程节点
  sonOfBatch = 1, //批处理节点子节点
}
