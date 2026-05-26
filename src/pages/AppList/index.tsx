import type { FC } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Empty, Input, Select, Spin } from 'antd';
import { useRecoilValue } from 'recoil';
import { GlobalConfigState } from '@/model';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getAppBizTypeList, getAppList } from '@/api';
import type { AppsNS } from '@/types/Apps';
import { AgentBizTypeEnum, AgentTypeEnum } from '@/constants';
import { useQueryLocationState } from '@/utils';
import CreateAppModal from './components/CreateAppModal';
import AppCard from './components/AppCard';
import { mockAppList } from './mockData';
import './index.less';
import { useMemoizedFn, useRequest } from 'ahooks';

const AppList: FC = () => {
  const [appList, setAppList] = useState<AppsNS.AppType[]>([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editAppData, setEditAppData] = useState<AppsNS.AppType>();
  const [keyword, setKeyword] = useState<string>();
  const [selectedBizType, setSelectedBizType] = useState<number | null>(null);

  const globalConfig = useRecoilValue(GlobalConfigState) || {};
  const locationState = useQueryLocationState() as { newAgent?: { appId: number; appName: string; appDesc: string } } | null;

  // 从智能搭建助手跳转过来时，将新创建的 Agent 置顶
  const displayList = useMemo<AppsNS.AppType[]>(() => {
    const newAgent = locationState?.newAgent;
    if (!newAgent) return appList;
    if (appList.some((a) => a.appId === newAgent.appId)) return appList;
    const topItem: AppsNS.AppType = {
      appId: newAgent.appId,
      appName: newAgent.appName,
      appDesc: newAgent.appDesc || '',
      type: AgentTypeEnum.self,
      bizType: AgentBizTypeEnum.Service,
      updateStaffName: '我',
      updateTime: Date.now(),
      prompt: '',
    };
    return [topItem, ...appList];
  }, [appList, locationState?.newAgent]);

  const selfAppOutLimit = useMemo(
    () =>
      appList?.filter((item) => item.type === AgentTypeEnum.self && item?.bizType === AgentBizTypeEnum.Service)
        ?.length >= globalConfig.appLimit,
    [appList, globalConfig.appLimit],
  );

  // 质检Agent个数超出限制
  const inspectionAppOutLimit = useMemo(
    () =>
      appList?.filter((item) => item.type === AgentTypeEnum.self && item?.bizType === AgentBizTypeEnum.Inspection)
        ?.length >= globalConfig.inspectionAppLimit,
    [appList, globalConfig.inspectionAppLimit],
  );

  const thirdPartyAppOutLimit = useMemo(
    () =>
      appList?.filter((item) => item.type === AgentTypeEnum.thirdParty)?.length >=
      (globalConfig.thirdPartyAppLimit || 0),
    [appList, globalConfig.thirdPartyAppLimit],
  );

  const {
    data: { data: bizTypeList = [] } = {},
  } = useRequest(getAppBizTypeList);

  // 没有质检Agent权限
  const inspectionNoPermission =
    !globalConfig.viewAllAgentsPermission || !globalConfig.inspectionAppEnable || inspectionAppOutLimit;

  // 没有第三方Agent权限
  const thirdPartyNoPermission = !globalConfig.thirdPartyEnable || thirdPartyAppOutLimit;

  const getData = useCallback(() => {
    setLoading(true);
    getAppList()
      .then(({ data }) => {
        setAppList(data?.length ? data : mockAppList);
      })
      .catch(() => {
        setAppList(mockAppList);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  console.log(selfAppOutLimit, inspectionAppOutLimit, thirdPartyAppOutLimit);

  const CreateButton = useMemo(
    () => (
      <span>
        {globalConfig.viewAllAgentsPermission === 1 && (
          <Select style={{ width: 200, marginRight: 8 }} value={selectedBizType} onChange={setSelectedBizType}>
            <Select.Option value={null}>全部应用</Select.Option>
            {bizTypeList?.map(({ title, value }) => (
              <Select.Option key={value} value={value}>
                {title}
              </Select.Option>
            ))}
          </Select>
        )}
        <Input.Search
          allowClear
          onSearch={setKeyword}
          maxLength={100}
          style={{ width: 320, marginRight: 8 }}
          placeholder="请输入Agent名称/描述/提示词进行搜索"
        />
        <Button
          type="primary"
          onClick={() => {
            setVisible(true);
            setEditAppData(undefined);
          }}
          disabled={selfAppOutLimit && inspectionNoPermission && thirdPartyNoPermission}
        >
          + 创建Agent应用
        </Button>
      </span>
    ),
    [
      selfAppOutLimit,
      inspectionNoPermission,
      thirdPartyNoPermission,
      bizTypeList,
      selectedBizType,
      globalConfig.viewAllAgentsPermission,
    ],
  );

  const showAppList = useMemo(() => {
    const trimKeyword = keyword?.trim();
    const listByKeyword = trimKeyword
      ? displayList?.filter(
          ({ appName, appDesc, prompt }) =>
            appName.includes(trimKeyword) || appDesc?.includes(trimKeyword) || prompt?.includes(trimKeyword),
        )
      : displayList;

    const listByBizType = listByKeyword?.filter((item) =>
      selectedBizType !== null ? item.bizType === selectedBizType : true,
    );

    return listByBizType;
  }, [keyword, displayList, selectedBizType]);

  // 复制应用
  const handleCopy = useMemoizedFn((item) => {
    setVisible(true);
    setEditAppData(item);
  });

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <>
      <Breadcrumbs extra={CreateButton} />
      {loading ? (
        <Spin />
      ) : showAppList?.length ? (
        <div className="AppList">
          {showAppList?.map((item, index) => (
            <AppCard
              key={item.appId}
              appInfo={item}
              index={index}
              afterDelete={getData}
              setEditAppData={setEditAppData}
              setEditModalVis={setVisible}
              onCopy={handleCopy}
            />
          ))}
        </div>
      ) : (
        <Empty
          style={{ height: 'calc(100vh - 120px)' }}
          image="https://res.qiyukf.net/yx/16394c211cd2ffdb6307467b933cfe91"
          description={
            !appList?.length ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 600 }}>创建你的第一个Agent</div>
                <div style={{ margin: '8px 0 16px', color: 'rgba(0, 0, 0, 0.45)' }}>
                  利用大模型和工具能力编排能力强大的Agent
                </div>
                {CreateButton}
              </>
            ) : (
              '暂无数据'
            )
          }
        />
      )}
      <CreateAppModal
        open={visible}
        onCancel={() => {
          setVisible(false);
          setEditAppData(undefined);
        }}
        onOk={() => {
          setVisible(false);
          setEditAppData(undefined);
          getData();
        }}
        initData={editAppData}
        disableCreateConfig={{
          [AgentTypeEnum.self]: selfAppOutLimit && inspectionNoPermission,
          [AgentTypeEnum.thirdParty]: thirdPartyNoPermission,
        }}
        permissions={{
          selfAppOutLimit,
          inspectionAppOutLimit: inspectionNoPermission,
          thirdPartyAppOutLimit: thirdPartyNoPermission,
        }}
      />
    </>
  );
};

export default AppList;
