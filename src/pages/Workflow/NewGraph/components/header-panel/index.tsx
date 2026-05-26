import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Button, message, Tooltip } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import EditTitle from '@/pages/Workflow/NewGraph/components/edit-title';
import { useRouter } from '@ysf/ys-router';
import { useRecoilValue } from 'recoil';
import { BasicInfoState } from '@/pages/Workflow/NewGraph/model';
import { createSignal, useObserver } from 'react-solid-state';
import { useWorkflowCheck } from '../../hooks';
import {
  WorkflowEventNameEnum,
  workflowGlobalEmit,
  workflowGlobalRegister,
  workflowGlobalUnregister,
} from '../../event';
import { useWorkflowData } from '../../hooks/use-workflow-data';
import { useClientContext } from '@flowgram.ai/free-layout-editor';
import { useMemoizedFn } from 'ahooks';
import { WorkflowNodeType } from '../../nodes';
import { releaseGraph, saveGraph } from '../../api';
import { IconLiaotian2, IconShanchu_2, IconSuccess } from '../../nodes/icons';
import TestRunButton from '../../testrun/testrun-button';
import { IconChakanlishifabu } from '@/assets/icons';
import { SidebarContext } from '../../context';
import { text2object } from '@/utils';

enum AutoSaveStateEnum {
  default = 0,
  autoSaveing = 1,
  autoSaveSuccess = 2,
  autoSaveFailed = 3,
}

let autoSaveTimer;

const EditGraph: React.FC<{ savedData: string; setSavedData: (data: string) => void }> = ({
  savedData,
  setSavedData,
}) => {
  const { navigate, routesMap } = useRouter();
  const [submitLoading, setSubmitLoading] = createSignal(false);
  const [autoSaveState, setAutoSaveState] = useState(AutoSaveStateEnum.default);
  const { validateWorkflow } = useWorkflowCheck();
  const { toBackendData } = useWorkflowData();
  const clientContext = useClientContext();
  const basicInfo = useRecoilValue(BasicInfoState);
  const { showHistoryPanel, setShowHistoryPanel, setIsHistoryMode, isHistoryMode } = useContext(SidebarContext);
  let context: React.ReactNode | null;
  if (autoSaveState === AutoSaveStateEnum.autoSaveing) {
    context = (
      <>
        <IconLiaotian2 tw="text-[rgba(0, 0, 0, 0.45)]" /> 自动保存中...
      </>
    );
  } else if (autoSaveState === AutoSaveStateEnum.autoSaveSuccess) {
    context = (
      <>
        <IconSuccess tw="text-[#52C41A]" /> 自动保存成功
      </>
    );
  } else if (autoSaveState === AutoSaveStateEnum.autoSaveFailed) {
    context = (
      <>
        <IconShanchu_2 /> 自动保存失败
      </>
    );
  } else {
    context = null;
  }
  const goBack = () => {
    navigate(routesMap.workflow.path);
  };

  const getIsEdited = useMemoizedFn(() => {
    // 历史版本预览模式下，不认为画布被“编辑”，避免自动保存和返回时的拦截
    if (isHistoryMode || showHistoryPanel) {
      return false;
    }
    return JSON.stringify(clientContext.document.toJSON()) !== savedData;
  });

  const getIsEmpty = useMemoizedFn(() => {
    return (
      clientContext.document.getAllNodes().filter((node) => node.getNodeMeta().type !== WorkflowNodeType.Comment)
        .length === 2
    );
  });

  const handleGoBack = () => {
    if (getIsEdited() && !getIsEmpty()) {
      message.warning('正在自动保存，请稍后再离开');
    } else {
      goBack();
    }
  };

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

  const handleSave = useMemoizedFn(async (check = true) => {
    if (check) {
      const ok = await runPreCheck();
      if (!ok) throw new Error('precheck_failed');
    }
    if (!getIsEdited()) {
      console.log(' no change need to save ');
      workflowGlobalEmit(WorkflowEventNameEnum.CLEAR_AUTO_SAVE_STATE);
      return;
    }
    const data = toBackendData();
    try {
      await saveGraph({
        workflowId: basicInfo?.workflowId,
        version: basicInfo?.version,
        ...data,
      });
      setSavedData(data.canvas);
      if (!check) {
        setAutoSaveState(AutoSaveStateEnum.autoSaveSuccess);
      }
    } catch (e) {
      console.log('e===', e);
      throw e;
    } finally {
      autoSaveTimer = setTimeout(() => {
        workflowGlobalEmit(WorkflowEventNameEnum.CLEAR_AUTO_SAVE_STATE);
      }, 3000);
    }
  });
  const handleRelease = async () => {
    const release = async () => {
      try {
        await releaseGraph({ workflowId: basicInfo?.workflowId as number, version: basicInfo?.version as number });
        message.success('发布成功');
        goBack();
      } catch (e) {
        console.log('e===', e);
        throw e;
      }
    };
    setSubmitLoading(true);
    try {
      await handleSave();
      await release();
    } catch (e) {
      console.log('e===', e);
    } finally {
      setSubmitLoading(false);
    }
  };
  useEffect(() => {
    const cb = () => {
      setAutoSaveState(AutoSaveStateEnum.autoSaveing);
      handleSave(false);
    };
    const successCb = () => {
      setAutoSaveState(AutoSaveStateEnum.autoSaveSuccess);
    };
    const failedCb = () => {
      setAutoSaveState(AutoSaveStateEnum.autoSaveFailed);
    };
    const clearAutoSaveStateCb = () => {
      setAutoSaveState(AutoSaveStateEnum.default);
    };
    workflowGlobalRegister(WorkflowEventNameEnum.AUTO_SAVE_START, cb);
    workflowGlobalRegister(WorkflowEventNameEnum.AUTO_SAVE_SUCCESS, successCb);
    workflowGlobalRegister(WorkflowEventNameEnum.AUTO_SAVE_FAILED, failedCb);
    workflowGlobalRegister(WorkflowEventNameEnum.CLEAR_AUTO_SAVE_STATE, clearAutoSaveStateCb);
    return () => {
      workflowGlobalUnregister(WorkflowEventNameEnum.AUTO_SAVE_START, cb);
      workflowGlobalUnregister(WorkflowEventNameEnum.AUTO_SAVE_SUCCESS, successCb);
      workflowGlobalUnregister(WorkflowEventNameEnum.AUTO_SAVE_FAILED, failedCb);
      workflowGlobalUnregister(WorkflowEventNameEnum.CLEAR_AUTO_SAVE_STATE, clearAutoSaveStateCb);
      clearTimeout(autoSaveTimer);
    };
  }, []);
  return useObserver(() => (
    <div tw="relative z-10 flex items-center w-full px-6 py-3 shadow-sm select-none pointer-events-auto bg-white">
      <Button tw="mr-6" icon={<LeftOutlined />} onClick={handleGoBack}>
        返回
      </Button>
      <EditTitle tw="mr-auto" title={basicInfo?.workflowName || ''} />
      <div tw="text-[14px] leading-[22px] text-[rgba(0, 0, 0, 0.45)] mr-4 flex gap-1 items-center">{context}</div>
      <Tooltip title="查看历史发布版本">
        {!showHistoryPanel && (
          <Button
            icon={<IconChakanlishifabu size={16} />}
            tw="mr-2 inline-flex items-center justify-center"
            onClick={() => {
              setShowHistoryPanel(!showHistoryPanel);
              if (!showHistoryPanel) {
                setIsHistoryMode(false);
              }
            }}
          />
        )}
      </Tooltip>
      <TestRunButton setSavedData={setSavedData} />
      {!showHistoryPanel && (
        <Button onClick={() => handleRelease()} type="primary" loading={submitLoading()}>
          发布
        </Button>
      )}
      {showHistoryPanel && (
        <Button
          type="primary"
          tw="mr-2"
          onClick={() => {
            setShowHistoryPanel(false);
            setIsHistoryMode(false);
            // 退出历史版本查看时，恢复为当前版本的画布
            if (savedData) {
              try {
                clientContext.document.reload(text2object(savedData));
              } catch (e) {
                console.log('restore current version error===', e);
              }
            }
            // readonly 状态由 editor.tsx 统一管理，无需在此处手动设置
          }}
        >
          退出查看
        </Button>
      )}
    </div>
  ));
};

export default EditGraph;
