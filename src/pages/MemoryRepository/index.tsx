import React, { useCallback, useRef, useState } from 'react';
import { useRouter } from '@ysf/ys-router';
import { Button, Empty, Modal, message } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import Ellipsis from '@ysf/ellipsis';
import { formatDate } from '@/utils';
import { Shanchu } from '@/assets/icons';
import type { TableChangeInterface, TableResInterface } from '@/components/RequestTable';
import RequestTable from '@/components/RequestTable';
import Breadcrumbs from '@/components/Breadcrumbs';
import ContentWrapper from '@/components/ContenWrapper';
import { getRepositoryList, deleteRepository, checkAssociation } from '@/api/memoryRepository';
import CreateModal from './components/CreateModal';
import './index.less';

const ModuleName = 'MemoryRepository';

const MemoryRepositoryList: React.FC = () => {
  const { navigate, routesMap } = useRouter();
  const [createVisible, setCreateVisible] = useState(false);
  const tableChangeRef = useRef<TableChangeInterface>();
  const [tableRes, setTableRes] = useState<Pick<TableResInterface<MemoryRepositoryNS.RepositoryType>, 'data'>>();
  const list = tableRes?.data?.list ?? [];
  const total = tableRes?.data?.total ?? 0;

  const navigateToDetail = useCallback(
    (id: number) => {
      navigate(routesMap.memoryDetail.path, {
        query: { id },
      });
    },
    [navigate, routesMap],
  );

  const onClickRow = useCallback(
    ({ id }: MemoryRepositoryNS.RepositoryType) => {
      navigateToDetail(id);
    },
    [navigateToDetail],
  );

  const onCreate = useCallback(() => {
    setCreateVisible(false);
    tableChangeRef.current?.({});
  }, []);

  const onDelete = useCallback(
    async (record: MemoryRepositoryNS.RepositoryType) => {
      // 先检查是否有 Agent 关联
      const checkRes = await checkAssociation({ repositoryId: record.id });
      if (checkRes?.data?.associated) {
        Modal.warning({
          title: '无法删除',
          content: `该记忆库已被 ${checkRes?.data?.agentNames?.join(', ')} 关联，请先解除关联后再删除。`,
        });
        return;
      }

      Modal.confirm({
        title: '确认删除该记忆库吗？',
        content: '删除后，该记忆库中的所有用户记忆数据将被清除，且无法恢复。',
        okType: 'danger',
        onOk: () => {
          deleteRepository({ repositoryId: record.id }).then(() => {
            message.success('删除成功');
            tableChangeRef.current?.({ queryLastPage: list?.length === 1 && total !== 1 });
          });
        },
      });
    },
    [list?.length, total],
  );

  const columns = [
    {
      title: '记忆库名称',
      dataIndex: 'name',
      width: '30%',
      render: (val: string, { description }: MemoryRepositoryNS.RepositoryType) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>
            <Ellipsis lines={1} tooltipProps={{ mouseEnterDelay: 1 }}>
              <div className={`${ModuleName}-name`}>{val}</div>
            </Ellipsis>
            <Ellipsis lines={1} tooltipProps={{ mouseEnterDelay: 1 }}>
              <div className={`${ModuleName}-desc`}>{description || '暂无描述'}</div>
            </Ellipsis>
          </span>
        </div>
      ),
    },
    {
      title: 'Agent引用数',
      dataIndex: 'bindingCount',
    },
    {
      title: '发布时间',
      dataIndex: 'createTime',
      render: (val: number) => formatDate(val),
    },
    {
      title: '操作',
      dataIndex: 'ope',
      width: 100,
      render: (_: unknown, record: MemoryRepositoryNS.RepositoryType) => (
        <>
          <span
            className="AiAgent-link"
            style={{ marginRight: 12 }}
            onClick={(e) => {
              e.stopPropagation();
              navigateToDetail(record.id);
            }}
          >
            <FormOutlined style={{ fontSize: 16, verticalAlign: 'middle' }} />
          </span>
          <span
            className="AiAgent-link"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(record);
            }}
          >
            <Shanchu color="currentColor" size={16} />
          </span>
        </>
      ),
    },
  ];

  return (
    <>
      <Breadcrumbs
        extra={
          <Button onClick={() => setCreateVisible(true)} type="primary">
            创建记忆库
          </Button>
        }
      />
      <ContentWrapper>
        <RequestTable
          rowKey="id"
          columns={columns}
          request={getRepositoryList}
          onRow={(record) => ({ onClick: () => onClickRow(record) })}
          noDataNode={
            <Empty
              description={
                <>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>暂无记忆库</div>
                  <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                    创建记忆库后，可将其关联到 Agent，让 Agent 具备长期记忆能力
                  </div>
                </>
              }
              style={{ height: 'calc(100% - 100px)' }}
            >
              <Button type="primary" onClick={() => setCreateVisible(true)}>
                创建记忆库
              </Button>
            </Empty>
          }
          getTableChange={(fn) => {
            tableChangeRef.current = fn;
          }}
          getRes={(res) => {
            setTableRes(res);
          }}
        />
      </ContentWrapper>

      <CreateModal open={createVisible} onCancel={() => setCreateVisible(false)} onOk={onCreate} />
    </>
  );
};

export default MemoryRepositoryList;
