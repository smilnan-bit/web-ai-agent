import React, { useState } from 'react';
import { Button, Col, Modal, Progress, Row, Table, Tooltip, message } from 'antd';
import { CheckCircleTwoTone, DownloadOutlined, InfoCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useRouter } from '@ysf/ys-router';
import { useRequest } from 'ahooks';
import { DownloadButton } from '@ysf/download-center';
import Breadcrumbs from '@/components/Breadcrumbs';
import { pageSizeOptionsDef } from '@/components/RequestTable';
import { deleteTestTask, getTestList, pauseTestTask, reSubmitTestTask, resumeTestTask, toolInitDownload } from '@/api';
import { formatDate, formatDuration } from '@/utils';
import type { TestTaskType } from './type';
import { TestTaskStatus, TestTaskStatusConfig } from './type';
import { getCostInfo } from './config';
import { mockTestList } from './mockData';
import './index.less';

const Test = () => {
  const { navigate, routesMap } = useRouter();
  const [resubmitVis, setResubmitVis] = useState(false);
  const [resubmitData, setResubmitData] = useState<TestTaskType>();
  const [dataSource, setDataSource] = useState<TestTaskType[]>([]);
  const [pageProps, setPageProps] = useState<{ current: number; pageSize: number; total: number }>({
    current: 1,
    pageSize: 50,
    total: 0,
  });

  const { run: getList } = useRequest(() => getTestList({ pageNo: pageProps.current, pageSize: pageProps.pageSize }), {
    refreshDeps: [pageProps.current, pageProps.pageSize],
    pollingInterval: 3000,
    onSuccess: (res) => {
      const list = res?.data?.list;
      const total = res?.data?.total || 0;
      if (!list?.length && !total && pageProps.current === 1) {
        setDataSource(mockTestList);
        setPageProps((pre) => ({ ...pre, total: mockTestList.length }));
      } else {
        setDataSource(list || []);
        setPageProps((pre) => ({ ...pre, total }));
      }
    },
  });

  const onDelete = (taskId) =>
    Modal.confirm({
      title: '确认删除吗？',
      content: '删除后，该任务已消耗的调用量不可撤销，且不再可见已完成的测评结果，请谨慎删除。',
      okType: 'danger',
      onOk: () => {
        deleteTestTask({ taskId }).then(() => {
          message.success('删除成功');
          if (dataSource.length === 1 && pageProps.total !== 1) {
            setPageProps((pre) => ({ ...pre, current: pre.current - 1 }));
          } else {
            getList();
          }
        });
      },
    });

  const onResubmit = () => {
    reSubmitTestTask({ taskId: resubmitData.id }).then(() => {
      message.success('操作成功');
      setResubmitVis(false);
      setResubmitData(undefined);
      getList();
    });
  };

  const onPause = (taskId) =>
    pauseTestTask({ taskId }).then(() => {
      message.success('暂停成功');
      getList();
    });

  const onResume = (taskId) =>
    resumeTestTask({ taskId }).then(() => {
      message.success('操作成功');
      getList();
    });

  const columns = [
    { title: '任务名称', dataIndex: 'name' },
    { title: '测评对象', dataIndex: 'agentName' },
    { title: '费用消耗', dataIndex: 'llmCount', render: (val) => `调用量${val || 0}次` },
    { title: '测评创建时间', dataIndex: 'createTime', render: (val) => formatDate(val) || '--' },
    {
      title: '测评状态',
      dataIndex: 'processStatus',
      render: (val, { successCount, taskCount }) => (
        <>
          {val === TestTaskStatus.finish && (
            <CheckCircleTwoTone style={{ marginRight: 8 }} twoToneColor="rgba(82, 196, 26, 1)" />
          )}
          {TestTaskStatusConfig[val]}
          {[TestTaskStatus.running, TestTaskStatus.stop].includes(val) && (
            <Progress
              percent={(successCount * 100) / taskCount}
              showInfo={false}
              strokeColor={val === TestTaskStatus.running ? '#337EFF' : '#ABABAB'}
            />
          )}
        </>
      ),
    },
    {
      title: '操作',
      dataIndex: 'ope',
      render: (text, record) => {
        const { processStatus, id } = record;
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {[TestTaskStatus.finish, TestTaskStatus.stop].includes(processStatus) && (
              <DownloadButton
                downloadRequest={toolInitDownload}
                downloadParams={{
                  type: 'AGENT_EVALUATION_TASK_DOWNLOAD',
                  downloadTaskParam: {
                    taskId: id,
                  },
                }}
                type="link"
                className="Test-link"
                style={{ padding: 0 }}
              >
                <DownloadOutlined />
                查看结果
              </DownloadButton>
            )}
            {[TestTaskStatus.running].includes(processStatus) && (
              <span className="Test-link" onClick={() => onPause(id)}>
                <PauseCircleOutlined style={{ marginRight: 8 }} />
                暂停
              </span>
            )}
            {[TestTaskStatus.finish].includes(processStatus) && (
              <span
                className="Test-link"
                onClick={() => {
                  setResubmitVis(true);
                  setResubmitData(record as TestTaskType);
                }}
              >
                重新测评
              </span>
            )}
            {[TestTaskStatus.stop].includes(processStatus) && (
              <span className="Test-link" onClick={() => onResume(id)}>
                继续
              </span>
            )}
            {processStatus !== TestTaskStatus.init && (
              <span style={{ color: '#FF4D4F', cursor: 'pointer', marginBottom: 2 }} onClick={() => onDelete(id)}>
                删除
              </span>
            )}
            {processStatus === TestTaskStatus.init && '--'}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Breadcrumbs
        extra={
          <Button type="primary" onClick={() => navigate(routesMap.testCreate.path)}>
            创建测评任务
          </Button>
        }
        tip={
          <Tooltip title="支持批量导入测试集，针对单个Agent的效果模拟测试。超过1年的测评任务将不再支持重新测评。">
            <InfoCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        }
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        pagination={{
          ...pageProps,
          onChange: (page, pageSize) => {
            setPageProps((pre) => ({ ...pre, current: page, pageSize }));
          },
          showTotal(total) {
            return `共 ${total} 条记录`;
          },
          showSizeChanger: true,
          pageSizeOptions: pageSizeOptionsDef.map((s) => s.toString()),
        }}
      />

      <Modal
        title="重新测评"
        open={resubmitVis}
        okText="重新测评"
        onOk={onResubmit}
        onCancel={() => {
          setResubmitVis(false);
          setResubmitData(undefined);
        }}
      >
        <div>请重新确认测评任务</div>
        <div style={{ margin: '8px 0' }}>
          <InfoCircleOutlined style={{ color: 'rgba(250, 173, 20, 1)', marginRight: 8 }} />
          <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>重新开始测评后，将不可见原先的测评结果。</span>
        </div>
        <div style={{ background: 'rgba(242, 243, 245, 1)', padding: 12 }}>
          {getCostInfo(resubmitData).map(({ label, value }, index) => (
            <Row key={index} gutter={24} style={{ marginTop: index !== 0 ? 16 : 0 }}>
              <Col span={8} style={{ textAlign: 'right' }}>
                {label}
              </Col>
              <Col span={16}>{value}</Col>
            </Row>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default Test;
