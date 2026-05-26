import React, { useCallback, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import cloneDeep from 'lodash/cloneDeep';
import { useRouter } from '@ysf/ys-router';
import { Tooltip } from 'antd';
import { useMemoizedFn } from 'ahooks';
import { CurrentAppState, GlobalConfigState } from '@/model';
import type { AppsNS } from '@/types/Apps';
import { AppEventBus } from '@/pages/AppList/event';
import { EventTypeEnum } from '@/constants/eventType';
import { ToolStatusEnum, ToolboxTypeEnum } from '@/constants';
import { IconBangdingkapian, IconShezhi } from '@/assets/icons';
import { getToolDetail } from '@/api';
import MultipleEdit from '../MutipleEdit';
import ToolModal from '@/components/ToolModal';
import BindCard from '../BindCard';
import type { SettingModalRef } from './SettingModal';
import SettingModal from './SettingModal';
import TplToolSetModal from '@/components/TplToolSetModal';
import type { ToolNS } from '@/types/Tools';

const Tools: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { toolList } = useRecoilValue(CurrentAppState);
  const currentApp = useRecoilValue(CurrentAppState) || {};
  const globalConfig = useRecoilValue(GlobalConfigState) || {};
  const { routesMap } = useRouter();
  const [bindCardOpen, setBindCardOpen] = useState(false);
  const [toolBindData, setToolBindData] = useState<AppsNS.ToolType>();
  const settingModalRef = React.useRef<SettingModalRef>(null);
  const [tplSetModalVis, setTplSetModalVis] = useState(false);
  const [tplSetData, setTplSetData] = useState<AppsNS.ToolType & { templateToolVo?: ToolNS.TemplateItemType }>();

  const onDelete = useCallback(
    (deleteItem) => {
      AppEventBus.emit(EventTypeEnum.saveAppData, {
        toolList: currentApp.toolList.filter((item) => item.toolId !== deleteItem.toolId),
      });
    },
    [currentApp.toolList],
  );

  const onBindCard = useCallback(
    (cardConfig) => {
      const newToolList = cloneDeep(toolList);
      const newItem = newToolList.find((item) => item.toolId === toolBindData.toolId);
      newItem.cardConfig = { ...newItem.cardConfig, ...cardConfig };
      AppEventBus.emit(
        EventTypeEnum.saveAppData,
        {
          toolList: newToolList,
        },
        true,
        true,
        () => {
          setBindCardOpen(false);
        },
      );
    },
    [toolBindData?.toolId, toolList],
  );

  const onClickExpand = useCallback((toolItem) => {
    getToolDetail({ toolboxId: toolItem.toolboxId, toolId: toolItem.toolId }).then(({ data }) => {
      setBindCardOpen(true);
      setToolBindData({ ...toolItem, responseParams: data.responseParams });
    });
  }, []);

  const handleSetting = useMemoizedFn((item) => {
    settingModalRef?.current?.open(item);
  });

  // 保存设置
  const handleSaveSetting = useMemoizedFn((newItem) => {
    const newToolList = cloneDeep(toolList);
    const index = newToolList.findIndex((item) => item.toolId === newItem.toolId);
    if (index > -1) {
      newToolList[index] = newItem;
      AppEventBus.emit(
        EventTypeEnum.saveAppData,
        {
          toolList: newToolList,
        },
        true,
        true,
        () => {
          settingModalRef?.current?.close();
        },
      );
    }
  });

  const onAddTool = useCallback(
    (toolitem, openTplSetModal) => {
      if (toolitem.isTemplateTool && openTplSetModal) {
        setTplSetModalVis(true);
        setModalVisible(false);
        setTplSetData(toolitem);
        return;
      }
      const hasAddedIndex = currentApp.toolList?.findIndex((item) => item.toolId === toolitem.toolId);
      const newToolList = [...(currentApp.toolList || [])];
      if (hasAddedIndex !== undefined && hasAddedIndex > -1) {
        newToolList.splice(hasAddedIndex, 1, { ...toolitem });
      } else {
        newToolList.push({ ...toolitem });
      }
      AppEventBus.emit(EventTypeEnum.saveAppData, {
        toolList: newToolList,
      });
    },
    [currentApp.toolList],
  );

  // 属于当前Agent的卡片参数
  const agnetCardParams = useMemo(() => {
    return { onlySendCard: toolBindData?.cardConfig?.onlySendCard || false };
  }, [toolBindData]);

  return (
    <>
      <MultipleEdit
        title="工具"
        list={toolList}
        onAdd={() => setModalVisible(true)}
        onDelete={onDelete}
        emptyText="工具能够让 Agent 调用外部 API，例如查询订单、物流等，扩展Agent的能力边界。"
        addLimit={globalConfig.appToolLimit}
        nameKey="name"
        descKey="desc"
        isGrayItem={(item) => item.toolStatus === ToolStatusEnum.noOpen}
        onTitleClick={() => {
          window.open(routesMap.toolboxs.path, '_blank');
        }}
        onItemTitleClick={({ toolboxId, toolId, toolboxType }: AppsNS.ToolType) => {
          window.open(
            `${routesMap.toolEdit.path}?toolboxId=${toolboxId}&toolId=${toolId}&toolboxType=${toolboxType}`,
            '_blank',
          );
        }}
        enableClick={(item) => item.toolboxType !== ToolboxTypeEnum.default}
        warningText={'该工具不存在'}
        isWarning={(item: AppsNS.ToolType) => item?.toolStatus === ToolStatusEnum.deleted}
        getExtraOperate={(item) => {
          const toolItem = item as AppsNS.ToolType;
          return (
            <div
              className="MultipleEdit-opeicon"
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {toolItem.supportBindCard !== 0 && (
                <Tooltip title="绑定卡片" mouseEnterDelay={1}>
                  <IconBangdingkapian
                    color="currentColor"
                    className={'AiAgent-link'}
                    onClick={() => onClickExpand(toolItem)}
                  />
                </Tooltip>
              )}
              {toolItem.supportToolSetting !== 0 && (
                <IconShezhi color="currentColor" className={'AiAgent-link'} onClick={() => handleSetting(toolItem)} />
              )}
              {toolItem.isTemplateTool && (
                <IconShezhi
                  color="currentColor"
                  className={'AiAgent-link'}
                  onClick={() => {
                    setTplSetModalVis(true);
                    setTplSetData(toolItem);
                  }}
                />
              )}
            </div>
          );
        }}
      />
      <ToolModal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onAdd={(toolitem) => onAddTool(toolitem, true)}
        onDelete={onDelete}
        hasAddedList={currentApp?.toolList || []}
      />
      <BindCard
        open={bindCardOpen}
        responseParams={toolBindData?.responseParams}
        onCancel={() => {
          setBindCardOpen(false);
          setToolBindData(undefined);
        }}
        initData={toolBindData?.cardConfig}
        agnetCardParams={agnetCardParams}
        onOk={onBindCard}
      />
      <TplToolSetModal
        open={tplSetModalVis}
        initData={tplSetData}
        onCancel={() => setTplSetModalVis(false)}
        onSave={(template) => {
          onAddTool(template, false);
          setTplSetModalVis(false);
        }}
      />
      <SettingModal
        ref={settingModalRef}
        onSuccess={handleSaveSetting}
        title="工具"
        paramsSet={true}
        globalScheduleSet={false}
      />
    </>
  );
};

export default Tools;
