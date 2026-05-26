import React, { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Tooltip, message } from 'antd';
import { useRouter } from '@ysf/ys-router';
import { CurrentAppState } from '@/model';
import type { AppsNS } from '@/types/Apps';
import { AppEventBus } from '@/pages/AppList/event';
import { EventTypeEnum } from '@/constants/eventType';
import { IconHuanbang, IconShezhi, Shanchu } from '@/assets/icons';
import WorkflowModal from '../WorkflowModal';
import useAgentHistory from '../History/useAgentHistory';
import Ellipsis from '@ysf/ellipsis';
import SettingModal, { type SettingModalRef } from '../Tools/SettingModal';

const WorkflowBind: React.FC = () => {
  const { workflowList = [] } = useRecoilValue(CurrentAppState) || {};
  const [modalVisible, setModalVisible] = useState(false);
  const { routesMap } = useRouter();
  const { isHistoryMode } = useAgentHistory();
  const currentWorkflow: AppsNS.WorkflowType | undefined = workflowList[0];
  const settingModalRef = React.useRef<SettingModalRef>(null);

  const handleSelect = useCallback(
    (item: AppsNS.WorkflowType) => {
      const isRebind = !!currentWorkflow;
      AppEventBus.emit(
        EventTypeEnum.saveAppData,
        {
          workflowList: [
            {
              workflowId: item.workflowId,
              workflowName: item.workflowName,
              workflowDesc: item.workflowDesc,
              isNew: item.isNew,
            },
          ],
        },
        false,
        true,
        () => {
          setModalVisible(false);
          message.success(isRebind ? '换绑成功！' : '绑定成功！');
        },
      );
    },
    [currentWorkflow],
  );

  const handleDelete = useCallback(() => {
    AppEventBus.emit(
      EventTypeEnum.saveAppData,
      {
        workflowList: [],
      },
      false,
      true,
      () => {
        message.success('删除成功！');
      },
    );
  }, []);

  const handleModalDelete = useCallback(() => {
    handleDelete();
  }, [handleDelete]);

  const handleViewDetail = useCallback(() => {
    if (!currentWorkflow) return;

    const { workflowId, isNew } = currentWorkflow;
    if (isNew) {
      window.open(`${routesMap.workflowEditNew.path}?id=${workflowId}`, '_blank');
    } else {
      window.open(`/ai-agent-old/workflow?id=${workflowId}`);
    }
  }, [currentWorkflow, routesMap]);

  const handleSaveSetting = useCallback((newItem) => {
    AppEventBus.emit(
      EventTypeEnum.saveAppData,
      {
        workflowList: [newItem],
      },
      true,
      true,
      () => {
        settingModalRef.current?.close();
      },
    );
  }, []);

  return (
    <>
      {currentWorkflow ? (
        <div
          tw="flex items-center gap-4 justify-between rounded border border-[rgba(0,0,0,0.06)] bg-[#f7f8fa] px-[17px] py-[27px] cursor-pointer"
          onClick={handleViewDetail}
        >
          <div tw="flex flex-col gap-[2px] leading-[22px] text-[14px] flex-1 min-w-0">
            <div tw="font-medium text-[rgba(0,0,0,0.85)]">{currentWorkflow.workflowName}</div>
            <div tw="text-[rgba(0,0,0,0.45)]">{currentWorkflow.workflowDesc || ''}</div>
          </div>
          {isHistoryMode ? null : (
            <div tw="flex items-center gap-4 text-[rgba(0,0,0,0.45)] text-[16px]">
              <Tooltip title="换绑">
                <span
                  tw="inline-flex cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalVisible(true);
                  }}
                >
                  <IconHuanbang />
                </span>
              </Tooltip>
              <Tooltip title="设置">
                <IconShezhi
                  color="currentColor"
                  className={'AiAgent-link'}
                  onClick={(e) => {
                    e.stopPropagation();
                    settingModalRef?.current?.open(currentWorkflow);
                  }}
                />
              </Tooltip>
              <Tooltip title="删除">
                <span
                  tw="inline-flex cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  <Shanchu />
                </span>
              </Tooltip>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          tw="flex h-[100px] cursor-pointer w-full items-center justify-center rounded border border-[rgba(51,126,255,0.2)] bg-[rgba(51,126,255,0.08)] text-[14px] text-[#337eff]"
          onClick={() => setModalVisible(true)}
        >
          <div tw="text-[16px] leading-[22px] flex gap-1 items-center justify-center">
            <span>+</span>
            <span tw="font-medium">绑定工作流</span>
          </div>
        </button>
      )}
      <WorkflowModal
        open={modalVisible}
        singleSelect={true}
        onCancel={() => setModalVisible(false)}
        hasAddedList={currentWorkflow ? [currentWorkflow] : []}
        onAdd={handleSelect}
        onDelete={handleModalDelete}
      />
      <SettingModal
        ref={settingModalRef}
        onSuccess={handleSaveSetting}
        title="工作流"
        paramsSet={false}
        globalScheduleSet={true}
      />
    </>
  );
};

export default WorkflowBind;
