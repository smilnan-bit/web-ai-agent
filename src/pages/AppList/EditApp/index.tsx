import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useMemoizedFn } from 'ahooks';
import { Spin, message } from 'antd';
import { CurrentAppState } from '@/model';
import { getAppConfigDetail, saveAppConfigDetail } from '@/api';
import { useQueryLocationSearch } from '@/utils/other';
import useAgentHistory from '@/pages/AppList/components/EditContent/History/useAgentHistory';
import { EventTypeEnum } from '@/constants/eventType';
import { AppStatusEnum } from '@/constants';
import EditHeader from '../components/EditHeader';
import EditContent from '../components/EditContent';
import { AppEventBus } from '../event';
import './index.less';

const EditApp: React.FC = () => {
  const { appId } = useQueryLocationSearch();
  const [currentApp, setCurrentApp] = useRecoilState(CurrentAppState);
  const [loading, setLoading] = useState<boolean>(false);
  const { prompt, ysKnowledgeList, toolList, workflowList, skillList, memorySetting } = currentApp || {};
  const [saving, setSaving] = useState<boolean>(false);
  const [saveTime, setSaveTime] = useState<number>();
  const { clearHistory, loading: historyLoading } = useAgentHistory();
  const refreshAppData = useCallback(() => {
    setLoading(true);
    getAppConfigDetail({ appId: Number(appId) })
      .then(({ data }) => {
        setCurrentApp(data as any);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [appId, setCurrentApp]);

  const saveApp = useMemoizedFn(
    (params: Record<string, any> = {}, hasMsgTip = true, saveData = true, successCb?: () => void) => {
      const newData = { appId, prompt, ysKnowledgeList, toolList, workflowList, skillList, memorySetting, ...params };
      setSaveTime(undefined);
      setSaving(true);
      saveAppConfigDetail(newData)
        .then(() => {
          hasMsgTip && message.success('保存成功');
          setCurrentApp((pre) => ({ ...pre, ...(saveData ? newData : {}), status: AppStatusEnum.draft }));
          setSaveTime(new Date().getTime());
          successCb?.();
        })
        .finally(() => {
          setSaving(false);
        });
    },
  );

  useEffect(() => {
    refreshAppData();
  }, [appId, refreshAppData, setCurrentApp]);
  useEffect(() => {
    AppEventBus.on(EventTypeEnum.refreshAppData, refreshAppData);
    AppEventBus.on(EventTypeEnum.saveAppData, saveApp);
    return () => {
      AppEventBus.off(EventTypeEnum.refreshAppData, refreshAppData);
      AppEventBus.off(EventTypeEnum.saveAppData, saveApp);
    };
  }, [refreshAppData, saveApp]);

  useEffect(() => {
    return () => {
      setCurrentApp(undefined as any);
      clearHistory();
    };
  }, []);

  return !currentApp ? (
    <Spin />
  ) : (
    <div className="EditApp">
      <Spin wrapperClassName={'EditApp-loading'} spinning={historyLoading || loading}>
        <EditHeader saving={saving} saveTime={saveTime} />
        <EditContent />
      </Spin>
    </div>
  );
};

export default EditApp;
