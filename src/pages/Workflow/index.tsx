import React, { useCallback, useRef, useState } from 'react';
import Ellipsis from '@ysf/ellipsis';
import { useRouter } from '@ysf/ys-router';
import { useRecoilValue } from 'recoil';
import { Button, Empty, Modal, message, Tooltip } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import { GlobalConfigState } from '@/model';
import type { TableChangeInterface, TableResInterface } from '@/components/RequestTable';
import { formatDate, timestamp2date } from '@/utils';
import { IconFuzhi, Shanchu } from '@/assets/icons';
import Breadcrumbs from '@/components/Breadcrumbs';
import { deleteWorkflow, getWorkflowList } from '@/api/workflow';
import RequestTable from '@/components/RequestTable';
import ContentWrapper from '@/components/ContenWrapper';
import WorkflowBasicInfo from '@/components/WorkflowBasicInfo';
import { useMemoizedFn } from 'ahooks';
import { copiedForbiddenTipsMap, copyDisabledMap } from '@/pages/Workflow/constanst';
import type { WorkflowNS } from '@/types/Workflow';
import { mockWorkflowList } from './mockData';

const Workflow: React.FC = () => {
  const { navigate, routesMap } = useRouter();
  const [createVisible, setCreateVisible] = useState(false);
  const globalConfig = useRecoilValue(GlobalConfigState);
  const tableChangeRef = useRef<TableChangeInterface>();
  const [copyWorkData, setCopyWorkData] = useState<any>(null);
  const [tableRes, setTableRes] = useState<Pick<TableResInterface<WorkflowNS.WorkflowType>, 'data'>>();
  const list = tableRes?.data?.list ?? [];
  const total = tableRes?.data?.total ?? 0;

  const requestWithMock = useCallback(async (params: any) => {
    try {
      const res = await getWorkflowList(params);
      if (!res?.data?.list?.length) {
        return { code: 200, data: { list: mockWorkflowList, total: mockWorkflowList.length } };
      }
      return res;
    } catch {
      return { code: 200, data: { list: mockWorkflowList, total: mockWorkflowList.length } };
    }
  }, []);

  const navigateToEdit = useCallback(
    (workflowId, isNew = false) => {
      if (isNew) {
        navigate(routesMap.workflowEditNew.path, { query: { id: workflowId } });
      } else {
        window.location.href = `/ai-agent-old/workflow?id=${workflowId}`;
      }
    },
    [navigate, routesMap.workflowEditNew.path],
  );

  const onCreate = useCallback(
    ({ workflowId }) => {
      setCreateVisible(false);
      navigateToEdit(workflowId, true);
    },
    [navigateToEdit],
  );

  const onDelete = useCallback(
    ({ workflowId }) => {
      Modal.confirm({
        title: '确认删除该工作流吗？',
        content: '此操作不可逆，请谨慎操作',
        okType: 'danger',
        onOk: () => {
          deleteWorkflow({ workflowId }).then(() => {
            message.success('删除成功');
            tableChangeRef.current?.({ queryLastPage: list?.length === 1 && total !== 1 });
          });
        },
      });
    },
    [list?.length, total],
  );
  const handleCopyWorkflow = useMemoizedFn((record, copyDisabled) => {
    if (copyDisabled) return;
    const { workflowName, workflowDesc, workflowId } = record || {};
    setCreateVisible(true);
    setCopyWorkData({
      workflowId: workflowId,
      workflowName: `${workflowName}_${timestamp2date(new Date(), 'yyyyMMddHHmmss')}`,
      workflowDesc,
      isCopy: true,
    });
  });

  const columns = [
    {
      title: '工作流',
      dataIndex: 'workflowName',
      width: '30%',
      render: (val, { workflowDesc }) => (
        <>
          <Ellipsis lines={1}>
            <div>{val}</div>
          </Ellipsis>
          <Ellipsis lines={1}>
            <div style={{ color: '#bfbfbf', fontSize: 12 }}>{workflowDesc}</div>
          </Ellipsis>
        </>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (val) => (val ? '已发布' : '未发布'),
    },
    { title: 'Agent引用数', dataIndex: 'agentBindCount' },
    { title: '工作流引用数', dataIndex: 'workflowRefCount' },
    { title: '更新时间', dataIndex: 'updateTime', render: (val) => formatDate(val) },
    { title: '发布时间', dataIndex: 'releaseTime', render: (val) => formatDate(val) },
    {
      title: '操作',
      dataIndex: 'ope',
      width: 160,
      render: (_, record) => {
        // 无法复制的工作流提示文案map
        const copyType = !record.isNew ? 'isOld' : !record.status ? 'noPublish' : 'normal';
        const copyDisabled = copyDisabledMap[copyType];
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', color: 'rgba(0,0,0,0.45)' }}>
            <Tooltip placement="top" title={'编辑'}>
              <FormOutlined
                onClick={() => navigateToEdit(record.workflowId, record.isNew)}
                style={{ marginRight: 8 }}
                className="AiAgent-link"
              />
            </Tooltip>
            <Tooltip
              placement="top"
              title={copiedForbiddenTipsMap[copyType] || copiedForbiddenTipsMap['normal']}
              autoAdjustOverflow={true}
              arrowPointAtCenter={true}
            >
              <span
                className={`AiAgent-link ${copyDisabled ? 'AiAgent-link-disbaled' : ''}`}
                style={{ display: 'inline-flex', marginRight: 8 }}
              >
                <IconFuzhi
                  color={copyDisabled ? '#D9D9D9' : 'currentColor'}
                  onClick={(e) => handleCopyWorkflow(record, copyDisabled)}
                />
              </span>
            </Tooltip>
            <Tooltip placement="top" title={'删除'}>
              <span
                className="AiAgent-link"
                onClick={(e) => {
                  onDelete(record);
                }}
                style={{ display: 'inline-flex' }}
              >
                <Shanchu color="currentColor" />
              </span>
            </Tooltip>
          </span>
        );
      },
    },
  ];

  return (
    <>
      <Breadcrumbs
        extra={
          <Button onClick={() => setCreateVisible(true)} type="primary" disabled={total >= globalConfig.workflowLimit}>
            创建工作流
          </Button>
        }
      />
      <ContentWrapper>
        <RequestTable
          rowKey={'workflowId'}
          columns={columns}
          request={requestWithMock}
          noDataNode={
            <Empty
              description={
                <>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>没有工作流！</div>
                  <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>在此统一添加和管理你的工作流，方便构建应用时使用</div>
                </>
              }
              style={{ height: 'calc(100% - 100px)' }}
            />
          }
          getTableChange={(fn) => {
            tableChangeRef.current = fn;
          }}
          getRes={(res) => {
            setTableRes(res);
          }}
          pagination={true}
        />
      </ContentWrapper>
      <WorkflowBasicInfo
        open={createVisible}
        onCancel={() => {
          setCreateVisible(false);
          setCopyWorkData(null);
        }}
        onOk={onCreate}
        initData={copyWorkData}
      />
    </>
  );
};

export default Workflow;
