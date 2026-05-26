import { useEffect } from 'react';
import { useLineRunData } from './use-node-testrun-report';
import { NodeRunStatusEnum } from '../constants';
import { useCurrentEntity, WorkflowNodeLinesData } from '@flowgram.ai/free-layout-editor';
import { text2object } from '@/utils';
import { TaskStateEnum } from '@ysf/ai-chat/es/type';

const colorMap = {
  default: '#4c53e7',
  [NodeRunStatusEnum.Succeeded]: 'var(--success-color)',
  [NodeRunStatusEnum.Processing]: 'var(--processing-color)',
  [NodeRunStatusEnum.terminated]: 'rgba(0,0,0,0.25)',
};
export const useRefreshLineStyle = () => {
  const node = useCurrentEntity();
  const { workflowLineData } = useLineRunData();

  useEffect(() => {
    if (!workflowLineData) return;

    node.getData(WorkflowNodeLinesData).inputLines.forEach((line) => {
      const lineRunData = workflowLineData?.find((item) => text2object(item.content)?.edgeId === line.lineData?.edgeId);
      line.updateUIState({
        lockedColor:
          lineRunData && lineRunData?.taskState === TaskStateEnum.RES
            ? colorMap[NodeRunStatusEnum.Succeeded]
            : colorMap[NodeRunStatusEnum.terminated],
        // 进行中显示虚线
        style: { strokeDasharray: status === NodeRunStatusEnum.Processing ? '5,1' : '0' },
      });
    });
  }, [node, workflowLineData]);
};
