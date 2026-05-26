import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { TestRunDataState } from '../model';
import { TaskStateEnum, TaskTypeEnum } from '@ysf/ai-chat/es/type';
import { useCurrentEntity } from '@flowgram.ai/free-layout-editor';
import { NodeRunStatusEnum } from '../constants';
import { WorkflowNodeType } from '../nodes';

export const useNodeTestRunReport = () => {
  const { list: testRunData, loading } = useRecoilValue(TestRunDataState);
  const node = useCurrentEntity();

  const workflowNodeData = useMemo(
    () => testRunData.findLast((item) => item.type === TaskTypeEnum.AGENt_TOOL)?.flowList || [],
    [testRunData],
  );

  const nodeData = useMemo(
    () =>
      workflowNodeData.filter(
        (item) =>
          ([WorkflowNodeType.Start, WorkflowNodeType.End].includes(item.nodeType) &&
            item.nodeType === node?.flowNodeType) ||
          item.nodeId === node?.id,
      ),
    [workflowNodeData, node?.id, node?.flowNodeType],
  );

  const { requestData, responseData } = useMemo(() => {
    const req = nodeData.find((item) => item.taskState === TaskStateEnum.REQ);
    const res = nodeData.find((item) => item.taskState === TaskStateEnum.RES);
    return { requestData: req, responseData: res };
  }, [nodeData]);

  const status = useMemo(() => {
    if (responseData) {
      return NodeRunStatusEnum.Succeeded;
    } else if (loading) {
      return NodeRunStatusEnum.Processing;
    } else {
      return NodeRunStatusEnum.terminated;
    }
  }, [responseData, loading]);

  return useMemo(() => {
    if (!requestData) {
      return null;
    }
    return { status, requestData, responseData };
  }, [status, requestData, responseData]);
};

export const useLineRunData = () => {
  const { list: testRunData } = useRecoilValue(TestRunDataState);
  const workflowLineData = useMemo(
    () => testRunData?.findLast((item) => item.type === TaskTypeEnum.AGENt_TOOL)?.edgeList,
    [testRunData],
  );
  return { workflowLineData };
};
