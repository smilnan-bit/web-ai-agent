import React from 'react';
import { Dropdown, Menu, Modal, message } from 'antd';
import { EllipsisOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from '@ysf/ys-router';
import { deleteScheduling } from '@/api/scheduling';
import type { SchedulingStrategy } from '@/api/scheduling';

interface StrategyCardProps {
  item: SchedulingStrategy;
  onEdit: (item: SchedulingStrategy) => void;
  onDelete: () => void;
}

const CardIcon: React.FC = () => (
  <div
    style={{
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: 'rgba(99, 97, 242, 0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="4" r="2" fill="#6361F2" />
      <path d="M2 10c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="#6361F2" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  </div>
);

const StrategyCard: React.FC<StrategyCardProps> = ({ item, onEdit, onDelete }) => {
  const { navigate, routesMap } = useRouter();

  const handleCardClick = () => {
    navigate(routesMap.schedulingEdit.path, { query: { id: item.id } });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: '删除调度策略',
      content: `确认删除"${item.name}"？删除后不可恢复，请谨慎操作。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const res = await deleteScheduling({ id: item.id });
        if ((res as any)?.code === 200) {
          message.success('删除成功');
          onDelete();
        } else {
          message.error((res as any)?.message ?? '删除失败');
        }
      },
    });
  };

  const menu = (
    <Menu
      onClick={({ domEvent }) => domEvent.stopPropagation()}
      items={[
        {
          key: 'edit',
          label: '编辑',
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            onEdit(item);
          },
        },
        {
          key: 'delete',
          label: '删除',
          danger: true,
          onClick: ({ domEvent }) => {
            handleDelete(domEvent as unknown as React.MouseEvent);
          },
        },
      ]}
    />
  );

  return (
    <div className="scheduling-card" onClick={handleCardClick}>
      <div className="card-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          <CardIcon />
          <span className="card-name">{item.name}</span>
        </div>
        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
          <span className="card-more-btn" onClick={(e) => e.stopPropagation()}>
            <EllipsisOutlined />
          </span>
        </Dropdown>
      </div>
      <div className="card-desc">{item.desc || '暂无描述'}</div>
      <div className="card-footer">
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <UserOutlined style={{ fontSize: 12 }} />
          {item.createUser}
        </span>
        <span>最近编辑 {item.updateTime}</span>
      </div>
    </div>
  );
};

export default StrategyCard;
