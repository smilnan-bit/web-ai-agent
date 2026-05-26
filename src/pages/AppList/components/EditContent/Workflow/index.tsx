import React, { useCallback, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import cloneDeep from 'lodash/cloneDeep';
import { useRouter } from '@ysf/ys-router';
import { Tooltip } from 'antd';
import { useMemoizedFn } from 'ahooks';
import { CurrentAppState } from '@/model';
import type { AppsNS } from '@/types/Apps';
import { AppEventBus } from '@/pages/AppList/event';
import { EventTypeEnum } from '@/constants/eventType';
import { IconBangdingkapian, IconShezhi } from '@/assets/icons';
import { getWorkflowDetail } from '@/api';
import { ToolStatusEnum } from '@/constants';
import SettingModal, { type SettingModalRef } from '@/pages/AppList/components/EditContent/Tools/SettingModal';
import BindCard from '../BindCard';
import MultipleEdit from '../MutipleEdit';
import WorkflowModal from '../WorkflowModal';

const Workflow: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const currentApp = useRecoilValue(CurrentAppState);
  const { workflowList } = currentApp;
  const { routesMap } = useRouter();
  const [bindCardOpen, setBindCardOpen] = useState(false);
  const [workflowBindData, setWorkflowBindData] = useState<AppsNS.WorkflowType>();
  const settingModalRef = React.useRef<SettingModalRef>(null);

  const onAddTool = useCallback(
    (additem) => {
      AppEventBus.emit(EventTypeEnum.saveAppData, {
        workflowList: [
          ...(currentApp.workflowList || []),
          { workflowId: additem.workflowId, workflowName: additem.workflowName, isNew: additem.isNew },
        ],
      });
    },
    [currentApp.workflowList],
  );

  const onDelete = useCallback(
    (deleteItem) => {
      AppEventBus.emit(EventTypeEnum.saveAppData, {
        workflowList: currentApp.workflowList.filter((item) => item.workflowId !== deleteItem.workflowId),
      });
    },
    [currentApp.workflowList],
  );

  const onBindCard = useCallback(
    (cardConfig) => {
      const newFlowList = cloneDeep(workflowList);
      const newItem = newFlowList.find((item) => item.workflowId === workflowBindData.workflowId);
      newItem.cardConfig = { ...newItem.cardConfig, ...cardConfig };
      AppEventBus.emit(
        EventTypeEnum.saveAppData,
        {
          workflowList: newFlowList,
        },
        true,
        true,
        () => {
          setBindCardOpen(false);
        },
      );
    },
    [workflowBindData?.workflowId, workflowList],
  );

  const onClickExpand = useCallback((item) => {
    getWorkflowDetail({ workflowId: item.workflowId }).then(({ data }) => {
      setBindCardOpen(true);
      setWorkflowBindData({ ...item, responseParams: data.responseParams });
    });
  }, []);

  const handleSetting = useMemoizedFn((item) => {
    settingModalRef?.current?.open(item);
  });

  const handleSaveSetting = useCallback(
    (newItem) => {
      const newFlowList = cloneDeep(workflowList);
      const index = newFlowList.findIndex((item) => item.workflowId === newItem.workflowId);
      if (index > -1) {
        newFlowList[index] = newItem;
        AppEventBus.emit(
          EventTypeEnum.saveAppData,
          {
            workflowList: newFlowList,
          },
          true,
          true,
          () => {
            settingModalRef.current?.close();
          },
        );
      }
    },
    [workflowList],
  );
  // 属于当前Agent的卡片参数
  const agnetCardParams = useMemo(() => {
    return { onlySendCard: workflowBindData?.cardConfig?.onlySendCard || false };
  }, [workflowBindData]);

  return (
    <>
      <MultipleEdit
        title="工作流"
        list={workflowList}
        onAdd={() => {
          setModalVisible(true);
        }}
        onDelete={onDelete}
        emptyText="工作流能够通过流程画布的方式配置工具、大模型等功能，实现可控的复杂业务流程编排。"
        nameKey={'workflowName'}
        onTitleClick={() => {
          window.open(routesMap.workflow.path, '_blank');
        }}
        onItemTitleClick={({ workflowId, isNew }: AppsNS.WorkflowType) => {
          if (isNew) {
            window.open(`${routesMap.workflowEditNew.path}?id=${workflowId}`, '_blank');
          } else {
            window.open(`/ai-agent-old/workflow?id=${workflowId}`);
          }
        }}
        warningText={'该工作流不存在'}
        isWarning={(item: AppsNS.WorkflowType) => item?.status === ToolStatusEnum.deleted}
        getExtraOperate={(item: AppsNS.WorkflowType) => (
          <div
            className="MultipleEdit-opeicon "
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Tooltip title="绑定卡片" mouseEnterDelay={1}>
              <IconBangdingkapian color="currentColor" className={'AiAgent-link'} onClick={() => onClickExpand(item)} />
            </Tooltip>
            <IconShezhi color="currentColor" className={'AiAgent-link'} onClick={() => handleSetting(item)} />
          </div>
        )}
      />
      <WorkflowModal
        onAdd={onAddTool}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onDelete={onDelete}
        hasAddedList={workflowList}
      />
      <BindCard
        open={bindCardOpen}
        responseParams={workflowBindData?.responseParams}
        initData={workflowBindData?.cardConfig}
        onOk={onBindCard}
        agnetCardParams={agnetCardParams}
        onCancel={() => {
          setBindCardOpen(false);
          setWorkflowBindData(undefined);
        }}
      />
      <SettingModal
        ref={settingModalRef}
        onSuccess={handleSaveSetting}
        title="工作流"
        paramsSet={true}
        globalScheduleSet={true}
      />
    </>
  );
};

export default Workflow;
