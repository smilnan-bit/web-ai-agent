import React, { useRef, useState } from 'react';
import { Button, Empty, Input, Spin, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { getSchedulingList } from '@/api/scheduling';
import type { SchedulingStrategy } from '@/api/scheduling';
import StrategyCard from './components/StrategyCard';
import CreateEditModal from './components/CreateEditModal';
import './index.less';

const MOCK_STRATEGIES: SchedulingStrategy[] = [
  {
    id: 'm1',
    name: '机器人A协同策略',
    desc: '机器人A的协同策略（勿动）',
    createUser: '超级管理员姓名',
    updateTime: '04-27 20:07:36',
    published: false,
  },
  {
    id: 'm2',
    name: '机器人B协同策略',
    desc: '机器人B的协同策略（勿动）',
    createUser: '超级管理员姓名',
    updateTime: '04-22 13:32:24',
    published: false,
  },
  {
    id: 'm3',
    name: '机器人C协同策略',
    desc: '机器人C的协同策略（勿动）',
    createUser: '超级管理员姓名',
    updateTime: '04-14 15:30:39',
    published: false,
  },
  {
    id: 'm4',
    name: '机器人D协同策略',
    desc: '机器人D的协同策略（勿动）',
    createUser: '超级管理员姓名',
    updateTime: '04-14 15:10:14',
    published: false,
  },
];

const SchedulingPage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<SchedulingStrategy | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data,
    loading,
    run: reloadList,
  } = useRequest(() => getSchedulingList({ name: searchKeyword }), { manual: false });

  const apiList: SchedulingStrategy[] = (data as any)?.data?.list ?? [];
  const list = apiList.length > 0 ? apiList : MOCK_STRATEGIES;
  const isEmpty = !loading && list.length === 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchKeyword(val);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      reloadList();
    }, 300);
  };

  const handleCreateClick = () => {
    setEditingItem(null);
    setModalVisible(true);
  };

  const handleEdit = (item: SchedulingStrategy) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingItem(null);
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    setEditingItem(null);
    reloadList();
  };

  const handleDelete = () => {
    reloadList();
  };

  return (
    <div className="scheduling-page">
      <div className="scheduling-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="scheduling-title">智能调度</span>
          <Tooltip title="支持针对大/小模型以及多个智能体设置全局调度策略">
            <InfoCircleOutlined style={{ fontSize: 14, color: '#bfbfbf', cursor: 'pointer' }} />
          </Tooltip>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Input
            placeholder="请输入调度策略名称/描述"
            value={searchKeyword}
            onChange={handleSearchChange}
            allowClear
            style={{ width: 280 }}
            suffix={<span style={{ color: '#bfbfbf', fontSize: 14 }}>🔍</span>}
          />
          <Button type="primary" onClick={handleCreateClick}>
            创建调度策略
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <Spin />
        </div>
      ) : isEmpty ? (
        <div className="empty-wrap">
          <Empty description="暂无调度策略，点击右上角按钮创建" />
        </div>
      ) : (
        <div className="scheduling-list">
          {list.map((item) => (
            <StrategyCard key={item.id} item={item} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <CreateEditModal
        visible={modalVisible}
        item={editingItem}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default SchedulingPage;
