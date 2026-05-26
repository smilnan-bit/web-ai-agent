import { useCallback, useContext } from 'react';

import { useClientContext } from '@flowgram.ai/free-layout-editor';
import React from 'react';
import { useWorkflowCheck } from '../../hooks';
import { useMemoizedFn } from 'ahooks';
import { WorkflowEventNameEnum, workflowGlobalEmit } from '../../event';
import { Button, message } from 'antd';
import { WorkflowNodeType } from '../../nodes';
import { SidebarContext } from '../../context';
import { useRecoilValue } from 'recoil';
import { BasicInfoState } from '../../model';
import { getGraphInfo } from '../../api';
import { loadCanvasData } from '../../utils';

const TestRunButton = ({ setSavedData }: { setSavedData: (data: string) => void }) => {
  const clientContext = useClientContext();
  const { validateWorkflow } = useWorkflowCheck();
  const { showTestRunPanel, setShowTestRunPanel, isHistoryMode, showHistoryPanel } = useContext(SidebarContext);
  const basicInfo = useRecoilValue(BasicInfoState);

  const getIsEmpty = useMemoizedFn(() => {
    return (
      clientContext.document.getAllNodes().filter((node) => node.getNodeMeta().type !== WorkflowNodeType.Comment)
        .length === 2
    );
  });

  const runPreCheck = useCallback(async () => {
    const result = await validateWorkflow();
    if (result.hasError) {
      workflowGlobalEmit(WorkflowEventNameEnum.PROBLEM_PANEL_SHOW, result.allErrors);
      return false;
    }
    if (getIsEmpty()) {
      message.error('画布没有内容');
      return false;
    }
    return true;
  }, [validateWorkflow, getIsEmpty]);

  const onTestRun = useCallback(async () => {
    const ok = await runPreCheck();
    if (!ok) throw new Error('precheck_failed');

    message.warning('加载中，请稍等');
    if (!(showHistoryPanel && isHistoryMode)) {
      // 先更新画布信息
      try {
        const { data } = await getGraphInfo({ workflowId: basicInfo?.workflowId });
        const { diagramInfo } = data || {};
        if (diagramInfo) {
          loadCanvasData(clientContext.document, diagramInfo, {
            workflowEdgeList: data?.workflowEdgeList,
            workflowNodeList: data?.workflowNodeList,
            setSavedData,
          });
        }
      } catch (error) {
        console.log('更新画布信息失败:', error);
        message.error('更新画布信息失败，请重试');
        return;
      }
    }

    // 更新后再打开试运行面板，readonly 状态由 editor.tsx 统一管理
    setShowTestRunPanel(true);
  }, [
    runPreCheck,
    setShowTestRunPanel,
    basicInfo?.workflowId,
    clientContext,
    setSavedData,
    showHistoryPanel,
    isHistoryMode,
  ]);

  return (
    <Button onClick={onTestRun} tw="mr-2" disabled={showTestRunPanel}>
      试运行
    </Button>
  );
};

export default TestRunButton;
