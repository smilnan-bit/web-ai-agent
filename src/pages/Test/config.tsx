import { formatDuration } from '@/utils';

export const getCostInfo = (taskData) => [
  { label: '测评名称', value: taskData?.name },
  { label: '测评对象', value: taskData?.agentName },
  { label: '测评样本数', value: `${taskData?.taskCount}条` },
  { label: '预估费用消耗', value: `调用量${taskData?.llmCount}次` },
  { label: '预估测评持续时长', value: formatDuration(taskData?.llmCost) },
];
