export enum TestTaskStatus {
  init = 0,
  running = 1,
  stop = 2,
  finish = 3,
}

export const TestTaskStatusConfig = {
  [TestTaskStatus.init]: '--',
  [TestTaskStatus.running]: '进行中',
  [TestTaskStatus.stop]: '已暂停',
  [TestTaskStatus.finish]: '已完成',
};

// 预估花费轮训任务枚举
export enum CountingStatusEnum {
  counting = 0,
  finished = 1,
}
export interface TestTaskType {
  id: number;
  name: string;
  agentName: string;
  agentId: number;
  taskCount: number;
  successCount: number;
  llmCount: number;
  llmCost: number;
  processStatus: TestTaskStatus;
  createTime: string;
  countingStatus: CountingStatusEnum; // 0: 费用未计算，1: 费用已计算
  nosKey: string;
  fileList?: any[];
}

export interface StepRefType {
  validateValues: () => Promise<void>;
}

export interface StepItemProps {
  taskData: Partial<TestTaskType>;
  setTaskData: React.Dispatch<React.SetStateAction<Partial<TestTaskType>>>;
}
