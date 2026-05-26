import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Space, message, Popconfirm, Tooltip, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';

import { getSkillList, deleteSkill } from '@/api/skill';
import type { SkillNS } from '@/types/Skills';
import { SkillStatusEnum, SkillTypeEnum } from '@/constants';
import SkillUploadModal from '../SkillUpload';
import ContentWrapper from '@/components/ContenWrapper';
import RequestTable, { type TableResInterface, type TableChangeInterface } from '@/components/RequestTable';
import Breadcrumbs from '@/components/Breadcrumbs';
import Ellipsis from '@ysf/ellipsis';
import { GlobalConfigState } from '@/model';
import { useRecoilValue } from 'recoil';

const SkillList: React.FC = () => {
  const tableChangeRef = useRef<TableChangeInterface>();
  const [tableRes, setTableRes] = useState<Pick<TableResInterface<SkillNS.SkillDetailType>, 'data'>>();
  const list = tableRes?.data?.list ?? [];
  const total = tableRes?.data?.total ?? 0;
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const globalConfig = useRecoilValue(GlobalConfigState);

  // 检查是否有上传中的项
  const hasUploading = list.some((item) => item.status === SkillStatusEnum.uploading);

  // 有上传中状态时 3s 轮询刷新列表
  useEffect(() => {
    if (!hasUploading) return;

    const timer = setInterval(() => {
      tableChangeRef.current?.({});
    }, 3000);

    return () => {
      clearInterval(timer);
    };
  }, [hasUploading]);

  const handleUploadClick = () => {
    setUploadModalVisible(true);
  };

  const handleUploadSuccess = () => {
    message.success('上传中，请稍后');
    tableChangeRef.current?.({});
    setUploadModalVisible(false);
  };

  const handleDelete = useCallback(
    ({ skillId }) => {
      Modal.confirm({
        title: '确认删除该skill吗？',
        content: '此操作不可逆，请谨慎操作',
        okType: 'danger',
        onOk: async () => {
          await deleteSkill({ skillId });
          message.success('删除成功');
          tableChangeRef.current?.({ queryLastPage: list?.length === 1 && total !== 1 });
        },
      });
    },
    [list?.length, total],
  );

  const columns: ColumnsType<SkillNS.SkillDetailType> = [
    {
      title: 'Skill',
      dataIndex: 'skillName',
      key: 'skillName',
      width: '35%',
      render: (name: string, record: SkillNS.SkillDetailType) => (
        <div>
          <Ellipsis lines={1}>{name}</Ellipsis>
          <Ellipsis lines={1}>
            <div style={{ color: '#bfbfbf', fontSize: '12px' }}>{record.skillDesc}</div>
          </Ellipsis>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: SkillStatusEnum, { errorMsg }) => {
        const statusMap = {
          [SkillStatusEnum.success]: { text: '成功', color: '#52c41a' },
          [SkillStatusEnum.failed]: { text: '上传失败', color: '#ff4d4f' },
          [SkillStatusEnum.uploading]: { text: '上传中', color: '#1890ff' },
        };
        const statusInfo = statusMap[status] || { text: '未知', color: '#666' };
        return (
          <span style={{ color: statusInfo.color }}>
            {statusInfo.text}
            {status === SkillStatusEnum.failed && errorMsg && (
              <Ellipsis lines={1}>
                <div style={{ color: '#bfbfbf', fontSize: '12px' }}>{errorMsg}</div>
              </Ellipsis>
            )}
          </span>
        );
      },
    },
    {
      title: 'Agent引用数',
      dataIndex: 'agentBindCount',
      key: 'agentBindCount',
    },
    {
      title: '发布时间',
      dataIndex: 'createTime',
      key: 'createTime',
      defaultSortOrder: 'descend',
      render: (time: number) => (time ? new Date(time).toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <>
      <Breadcrumbs
        extra={
          <Button type="primary" icon={<UploadOutlined />} onClick={handleUploadClick}>
            上传{globalConfig.builtinSkillTenant ? '内置' : ''}Skill
          </Button>
        }
      />

      <ContentWrapper>
        <RequestTable
          rowKey={'id'}
          columns={columns}
          request={getSkillList}
          getTableChange={(fn) => {
            tableChangeRef.current = fn;
          }}
          getRes={(res) => {
            setTableRes(res);
          }}
          params={{
            skillType: globalConfig.builtinSkillTenant ? SkillTypeEnum.builtin : SkillTypeEnum.custom,
          }}
        />
      </ContentWrapper>

      <SkillUploadModal
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onOk={handleUploadSuccess}
      />
    </>
  );
};

export default SkillList;
