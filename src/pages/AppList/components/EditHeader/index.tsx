import { Button, Tooltip, message } from 'antd';
import React, { useCallback, useState } from 'react';
import { useRecoilState } from 'recoil';
import { ExclamationCircleOutlined, LeftOutlined } from '@ant-design/icons';
import { useRouter } from '@ysf/ys-router';
import { DateUtil } from '@ysf/helper';
import { useMemoizedFn } from 'ahooks';
import useAgentHistory from '@/pages/AppList/components/EditContent/History/useAgentHistory';
import type { AppsNS } from '@/types/Apps';
import { CurrentAppState } from '@/model';
import { releaseAppConfig } from '@/api';
import { AppStatusEnum } from '@/constants';
import { Bianji, IconChakanlishifabu, IconChakanlishifabubanben } from '@/assets/icons';
import { AppEventBus } from '@/pages/AppList/event';
import { EventTypeEnum } from '@/constants/eventType';
import CreateAppModal from '../CreateAppModal';

import './index.less';

const EditHeader: React.FC<{ saving?: boolean; saveTime?: number }> = ({ saving, saveTime }) => {
  const [appData, setAppData] = useRecoilState(CurrentAppState);

  const { isHistoryMode, setIsHistoryMode } = useAgentHistory();
  const { appId, appName, status } = appData;
  const { navigate, routesMap } = useRouter();
  const [visible, setVisible] = useState(false);
  const [editData, setEditData] = useState<AppsNS.AppType>();

  const onReturn = useCallback(() => {
    navigate(routesMap.apps.path);
  }, [navigate, routesMap.apps.path]);

  // 发布按钮
  const releaseApp = useCallback(() => {
    releaseAppConfig({ appId }).then(() => {
      message.success('发布成功');
      setAppData((pre) => ({ ...pre, status: AppStatusEnum.released }));
      AppEventBus.emit(EventTypeEnum.refreshAppData);
    });
  }, [appId, setAppData]);

  // 查看历史版本
  const handleGoHistory = useMemoizedFn((open: boolean) => {
    setIsHistoryMode(open);
  });

  // 根据状态渲染编辑操作按钮
  const renderEditActions = useCallback(() => {
    if (isHistoryMode) {
      return (
        <Button type={'primary'} onClick={() => handleGoHistory(false)}>
          退出查看
        </Button>
      );
    }
    return (
      <span className={'EditHeader-actions'}>
        {status === AppStatusEnum.draft && (
          <span style={{ color: '#FF8000' }}>
            <ExclamationCircleOutlined /> 有尚未发布的修改
          </span>
        )}
        <Tooltip placement="bottom" title={'查看历史发布版本'} trigger="hover">
          <Button className={'EditHeader-actions-history'} onClick={() => handleGoHistory(true)}>
            <IconChakanlishifabu size={16} />
          </Button>
        </Tooltip>
        <Button type="primary" onClick={releaseApp} disabled={status === AppStatusEnum.released}>
          发布
        </Button>
      </span>
    );
  }, [isHistoryMode, releaseApp, status, handleGoHistory]);

  return (
    <div className="EditHeader">
      <div className="EditHeader-left">
        <span onClick={onReturn} style={{ marginRight: 16 }} className="AiAgent-link">
          <LeftOutlined style={{ marginRight: 2 }} />
          返回
        </span>
        <div>
          <div>
            <span style={{ fontWeight: 600, fontSize: 16, marginRight: 8 }}>{appName}</span>
            <span className="AiAgent-link" style={{ verticalAlign: 'bottom' }}>
              <Bianji
                color="currentColor"
                onClick={() => {
                  setEditData(appData);
                  setVisible(true);
                }}
              />
            </span>
            <span style={{ color: 'rgba(0, 0, 0, 0.25)', marginLeft: 8 }}>
              {saving && '保存中'}
              {saveTime && `已自动保存 ${DateUtil.timestamp2date(saveTime, 'HH:mm:ss')}`}
            </span>
          </div>
        </div>
      </div>
      {renderEditActions()}
      <CreateAppModal
        open={visible}
        initData={editData}
        onCancel={() => {
          setVisible(false);
          setEditData(undefined);
        }}
        onOk={(values) => {
          setVisible(false);
          setAppData((pre) => ({ ...pre, ...values }));
        }}
      />
    </div>
  );
};

export default EditHeader;
