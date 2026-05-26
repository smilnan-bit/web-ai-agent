import React, { useCallback, useRef, useState } from 'react';
import { useRouter } from '@ysf/ys-router';
import { Button, Empty, Modal, Tag, message } from 'antd';
import { useRecoilValue } from 'recoil';
import Ellipsis from '@ysf/ellipsis';
import { formatDate } from '@/utils';
import { Shanchu } from '@/assets/icons';
import type { ToolNS } from '@/types/Tools';
import { ToolboxTypeEnum } from '@/constants';
import type { TableChangeInterface, TableResInterface } from '@/components/RequestTable';
import RequestTable from '@/components/RequestTable';
import Breadcrumbs from '@/components/Breadcrumbs';
import ContentWrapper from '@/components/ContenWrapper';
import { deleteToolbox, getToolboxList } from '@/api';
import { GlobalConfigState } from '@/model';
import CreateToolbox from '../CreateToolbox';
import ToolboxIcon from '../ToolboxIcon';
import { mockToolboxList } from './mockData';

const ToolboxList: React.FC = () => {
  const { navigate, routesMap } = useRouter();
  const [createVisible, setCreateVisible] = useState(false);
  const globalConfig = useRecoilValue(GlobalConfigState);
  const tableChangeRef = useRef<TableChangeInterface>();
  const [tableRes, setTableRes] = useState<Pick<TableResInterface<ToolNS.ToolBoxType>, 'data'>>();
  const {
    data: { list, total },
  } = tableRes || { data: {} };

  const requestWithMock = useCallback(async (params: any) => {
    try {
      const res = await getToolboxList(params);
      if (!res?.data?.list?.length) {
        return { code: 200, data: { list: mockToolboxList, total: mockToolboxList.length } };
      }
      return res;
    } catch {
      return { code: 200, data: { list: mockToolboxList, total: mockToolboxList.length } };
    }
  }, []);

  const navigateToTool = useCallback(
    (toolboxId, toolboxType) => {
      navigate(routesMap.tools.path, { query: { toolboxId, toolboxType } });
    },
    [navigate, routesMap.tools.path],
  );

  const onClickRow = useCallback(
    ({ toolboxId, type }) => {
      navigateToTool(toolboxId, type);
    },
    [navigateToTool],
  );

  const onCreate = useCallback(
    (toolboxId, toolboxType) => {
      console.log('toolboxId', toolboxId);
      console.log('type', toolboxType);
      // setSelectedType(toolboxType);
      setCreateVisible(false);
      navigateToTool(toolboxId, toolboxType);
    },
    [navigateToTool],
  );

  const onDelete = useCallback(
    ({ toolboxId }) => {
      Modal.confirm({
        title: '确认删除该工具组吗？',
        okType: 'danger',
        onOk: () => {
          deleteToolbox({ toolboxId }).then(() => {
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
      title: '工具组',
      dataIndex: 'name',
      width: '30%',
      render: (val, { desc, type }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ToolboxIcon toolboxType={type} style={{ marginRight: 12 }} />
          <span>
            <Ellipsis lines={1} tooltipProps={{ mouseEnterDelay: 1 }}>
              <div>{val}</div>
            </Ellipsis>
            <Ellipsis lines={1} tooltipProps={{ mouseEnterDelay: 1 }}>
              <div style={{ color: '#bfbfbf', fontSize: 12, paddingTop: 2 }}>{desc}</div>
            </Ellipsis>
          </span>
        </div>
      ),
    },
    {
      title: '工具',
      dataIndex: 'toolNames',
      render: (val) =>
        val?.length > 0 ? (
          <>
            <Tag>
              <Ellipsis width={150} style={{ verticalAlign: 'bottom' }} tooltipProps={{ mouseEnterDelay: 1 }}>
                {val[0]}{' '}
              </Ellipsis>
            </Tag>

            {val.length > 1 ? `等${val.length}个` : ''}
          </>
        ) : (
          <></>
        ),
    },
    { title: 'Agent引用数', dataIndex: 'agentBindCount' },
    { title: '工作流引用数', dataIndex: 'workflowBindCount' },
    { title: '编辑时间', dataIndex: 'updateTime', render: (val) => formatDate(val) },
    {
      title: '操作',
      dataIndex: 'ope',
      render: (_, record) => (
        <span
          className="AiAgent-link"
          onClick={(e) => {
            onDelete(record);
            e.stopPropagation();
          }}
        >
          <Shanchu color="currentColor" size={16} />
        </span>
      ),
    },
  ];

  return (
    <>
      <Breadcrumbs
        tip={
          <Button
            type="link"
            onClick={() =>
              window.open('https://b.163.com/knowledge/public/WXjbs9n3GC/knowdetail?docId=kccOS3ujI0&pid=400628')
            }
          >
            对接手册
          </Button>
        }
        extra={
          <Button onClick={() => setCreateVisible(true)} type="primary" disabled={total >= globalConfig.toolboxLimit}>
            创建工具组
          </Button>
        }
      />
      <ContentWrapper>
        <RequestTable
          rowKey={'toolboxId'}
          params={{ toolboxType: ToolboxTypeEnum.custom }}
          columns={columns}
          request={requestWithMock}
          onRow={(record) => ({ onClick: () => onClickRow(record) })}
          noDataNode={
            <Empty
              description={
                <>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>没有自定义工具！</div>
                  <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                    在此统一添加和管理你的自定义工具，方便构建应用时使用
                  </div>
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
        />
      </ContentWrapper>

      <CreateToolbox open={createVisible} onCancel={() => setCreateVisible(false)} onOk={onCreate} />
    </>
  );
};

export default ToolboxList;
