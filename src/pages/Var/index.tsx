import React, { useCallback, useEffect, useRef, useState } from 'react';
import Ellipsis from '@ysf/ellipsis';
import { Button, Empty, Modal, Switch, Tooltip, message } from 'antd';
import { FormOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { TableChangeInterface } from '@/components/RequestTable';
import { Shanchu } from '@/assets/icons';
import Breadcrumbs from '@/components/Breadcrumbs';
import RequestTable from '@/components/RequestTable';
import ContentWrapper from '@/components/ContenWrapper';
import VarModal from './modal';
import { deleteVar, getVarList, updateVarStatus } from './api';
import { ToolParamsTypeShowEnum } from '@/constants';
import { VarStatusEnum, type VarType } from '../Workflow/NewGraph/constants';
import { mockVarList } from './mockData';

const Workflow: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);
  const tableChangeRef = useRef<TableChangeInterface>();
  const [total, setTotal] = useState(0);
  const [initData, setInitData] = useState<VarType | undefined>();

  const requestWithMock = useCallback(async (_params: any) => {
    try {
      const res = await getVarList();
      if (!res?.data?.list?.length) {
        return { code: 200, data: { list: mockVarList, total: mockVarList.length } };
      }
      return res;
    } catch {
      return { code: 200, data: { list: mockVarList, total: mockVarList.length } };
    }
  }, []);

  const updateStatus = useCallback((val, id) => {
    updateVarStatus({ id, status: val ? VarStatusEnum.open : VarStatusEnum.close }).then(() => {
      message.success(val ? '启用变量成功' : '禁用变量成功');
      tableChangeRef.current?.({});
    });
  }, []);

  useEffect(() => {
    if (!createVisible) {
      setInitData(undefined);
    }
  }, [createVisible]);

  const onEdit = useCallback((record: VarType) => {
    setCreateVisible(true);
    setInitData(record);
  }, []);
  const onCreate = useCallback((data: VarType) => {
    message.success('创建成功');
    tableChangeRef.current?.({});
    setCreateVisible(false);
  }, []);

  const onDelete = useCallback(({ id }) => {
    Modal.confirm({
      title: '确认删除吗',
      content: '删除后，数据不可恢复，请谨慎选择',
      okType: 'danger',
      onOk: () => {
        deleteVar({ id }).then(() => {
          message.success('删除成功');
          tableChangeRef.current?.({});
        });
      },
    });
  }, []);

  const columns = [
    {
      title: '变量名称',
      dataIndex: 'name',
      width: '25%',
      render: (val) => (
        <Ellipsis lines={1}>
          <div>{val}</div>
        </Ellipsis>
      ),
    },
    {
      title: '变量描述',
      dataIndex: 'desc',
      width: '25%',
      render: (val) => (
        <Ellipsis lines={1}>
          <div>{val}</div>
        </Ellipsis>
      ),
    },
    {
      title: '变量类型',
      dataIndex: 'type',
      width: '25%',
      render: (val) => ToolParamsTypeShowEnum[val],
    },
    {
      title: '操作',
      dataIndex: 'status',
      render: (val, record) => (
        <div tw="flex gap-4 items-center">
          <Switch checked={val === VarStatusEnum.open} onChange={(val) => updateStatus(val, record.id)} />
          <span
            tw="flex gap-1 items-center text-[#337EFF] cursor-pointer hover:text-[#5c9dff]"
            onClick={() => onEdit(record)}
          >
            <FormOutlined />
            编辑
          </span>
          <span
            tw="flex gap-1 items-center text-[#FF4D4F] cursor-pointer hover:text-[#ff7875]"
            onClick={(e) => {
              onDelete(record);
            }}
          >
            <Shanchu color="currentColor" />
            删除
          </span>
        </div>
      ),
    },
  ];

  return (
    <>
      <Breadcrumbs
        extra={
          <Button onClick={() => setCreateVisible(true)} type="primary" disabled={total >= 50}>
            创建全局变量
          </Button>
        }
        tip={
          <Tooltip title="全局变量支持在工作流中赋值，并在不同的Agent及不同的工作流引用。注意：新会话进入后，全局变量值会清空。即不可获取非当前会话中的全局变量值 ">
            <InfoCircleOutlined style={{ marginLeft: 4 }} tw="cursor-pointer" />
          </Tooltip>
        }
      />
      <ContentWrapper>
        <RequestTable
          rowKey={'id'}
          columns={columns}
          request={requestWithMock}
          pagination={true}
          noDataNode={
            <Empty
              description={<div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>暂无数据</div>}
              style={{ height: 'calc(100% - 100px)' }}
            />
          }
          getTableChange={(fn) => {
            tableChangeRef.current = fn;
          }}
          getRes={(res) => {
            setTotal(res?.data?.total || 0);
          }}
        />
      </ContentWrapper>
      <VarModal
        open={createVisible}
        onCancel={() => {
          setCreateVisible(false);
        }}
        onOk={onCreate}
        initData={initData}
      />
    </>
  );
};

export default Workflow;
