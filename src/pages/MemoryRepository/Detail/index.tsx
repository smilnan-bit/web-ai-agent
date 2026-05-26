import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Empty, Input, List, Modal, Pagination, Spin, Tooltip, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Renwu } from '@/assets/icons';
import { useRequest } from 'ahooks';
import { formatDate, useQueryLocationSearch } from '@/utils';
import Breadcrumbs from '@/components/Breadcrumbs';
import ContentWrapper from '@/components/ContenWrapper';
import { listUsers, getMemories, deleteMemory, getRepositoryDetail } from '@/api/memoryRepository';
import './index.less';
import { Shanchu } from '@/assets/icons';
import CreateModal from '../components/CreateModal';

const ModuleName = 'MemoryRepositoryDetail';
const PAGE_SIZE = 20;
const MEMORY_PAGE_SIZE = 10; // 记忆列表每页条数

const MOCK_USERS: MemoryRepositoryNS.UserType[] = [
  { userId: 'user_10001' },
  { userId: 'user_20086' },
  { userId: 'user_30152' },
  { userId: 'user_40209' },
  { userId: 'user_51089' },
];

const MOCK_MEMORIES: Record<string, MemoryRepositoryNS.MemoryType[]> = {
  user_10001: [
    { id: 'm1001', userId: 'user_10001', memory: '用户偏好佩戴轻量级无线耳机，对音质要求较高，曾购买多款高端耳机产品', createTime: Date.now() - 86400000 * 2, updateTime: Date.now() - 86400000 * 2 },
    { id: 'm1002', userId: 'user_10001', memory: '用户上次咨询时提到想要升级家庭音响系统，预算在 3000–5000 元', createTime: Date.now() - 86400000 * 5, updateTime: Date.now() - 86400000 * 5 },
    { id: 'm1003', userId: 'user_10001', memory: '用户对售后服务非常关注，希望保修期内可以上门维修', createTime: Date.now() - 86400000 * 10, updateTime: Date.now() - 86400000 * 10 },
  ],
  user_20086: [
    { id: 'm2001', userId: 'user_20086', memory: '用户是跑步爱好者，每周跑步 4–5 次，寻找适合运动场景的防水耳机', createTime: Date.now() - 86400000 * 1, updateTime: Date.now() - 86400000 * 1 },
    { id: 'm2002', userId: 'user_20086', memory: '用户曾反馈某款耳机佩戴舒适性不佳，希望推荐人体工程学设计产品', createTime: Date.now() - 86400000 * 7, updateTime: Date.now() - 86400000 * 7 },
  ],
  user_30152: [
    { id: 'm3001', userId: 'user_30152', memory: '用户对品牌忠诚度较高，长期使用同品牌产品，偏好苹果生态系统', createTime: Date.now() - 86400000 * 3, updateTime: Date.now() - 86400000 * 3 },
    { id: 'm3002', userId: 'user_30152', memory: '用户家中有老人和小孩，注重产品安全性和简洁操作体验', createTime: Date.now() - 86400000 * 8, updateTime: Date.now() - 86400000 * 8 },
    { id: 'm3003', userId: 'user_30152', memory: '上次通话中表示近期有出行计划，需要降噪效果好的旅行耳机', createTime: Date.now() - 86400000 * 14, updateTime: Date.now() - 86400000 * 14 },
    { id: 'm3004', userId: 'user_30152', memory: '用户曾购买蓝牙耳机作为商务礼品，适合礼品场景推荐', createTime: Date.now() - 86400000 * 21, updateTime: Date.now() - 86400000 * 21 },
  ],
  user_40209: [
    { id: 'm4001', userId: 'user_40209', memory: '用户是学生，预算有限，倾向于性价比高的产品，价格敏感', createTime: Date.now() - 86400000 * 1, updateTime: Date.now() - 86400000 * 1 },
    { id: 'm4002', userId: 'user_40209', memory: '用户喜欢游戏，需要低延迟耳机，曾询问过电竞耳机产品线', createTime: Date.now() - 86400000 * 4, updateTime: Date.now() - 86400000 * 4 },
  ],
  user_51089: [
    { id: 'm5001', userId: 'user_51089', memory: '用户是音乐制作人，专业需求，关注音频技术规格和录音质量', createTime: Date.now() - 86400000 * 6, updateTime: Date.now() - 86400000 * 6 },
    { id: 'm5002', userId: 'user_51089', memory: '用户曾咨询专业监听耳机，对频响曲线和音染有明确要求', createTime: Date.now() - 86400000 * 12, updateTime: Date.now() - 86400000 * 12 },
    { id: 'm5003', userId: 'user_51089', memory: '用户习惯在深夜工作，偏好夜间场景下舒适佩戴的设计', createTime: Date.now() - 86400000 * 18, updateTime: Date.now() - 86400000 * 18 },
  ],
};

const MemoryRepositoryDetail: React.FC = () => {
  const { id } = useQueryLocationSearch();
  const repoId = Number(id);

  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [memoryPage, setMemoryPage] = useState(1); // 记忆列表当前页
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // 获取记忆库详情
  const { data: repoDetailData, run: refreshRepoDetail } = useRequest(
    () => getRepositoryDetail({ repositoryId: repoId }),
    {
      refreshDeps: [repoId],
      ready: !!repoId,
    },
  );

  const repoDetail = repoDetailData?.data ?? null;

  // 获取用户列表
  const { data: usersData, loading: usersLoading } = useRequest(
    () =>
      listUsers({
        repositoryId: repoId,
        userId: searchValue || undefined,
        offset: (currentPage - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      }),
    {
      refreshDeps: [repoId, searchValue, currentPage],
      ready: !!repoId,
    },
  );

  const rawUserTotal = usersData?.data?.total ?? 0;
  const userList = rawUserTotal === 0 && !searchValue ? MOCK_USERS : (usersData?.data?.list ?? []);
  const userTotal = rawUserTotal === 0 && !searchValue ? MOCK_USERS.length : rawUserTotal;

  // 获取选中用户的记忆列表
  const { data: memoriesData, run: refreshMemories } = useRequest(
    () => getMemories({ repositoryId: repoId, userId: selectedUserId! }),
    {
      refreshDeps: [repoId, selectedUserId],
      ready: !!repoId && !!selectedUserId,
    },
  );

  const rawMemoryList = memoriesData?.data ?? [];
  const memoryList = rawMemoryList.length === 0 && selectedUserId ? (MOCK_MEMORIES[selectedUserId] ?? []) : rawMemoryList;

  // 前端假分页：计算当前页显示的记忆数据
  const paginatedMemoryList = useMemo(() => {
    const startIndex = (memoryPage - 1) * MEMORY_PAGE_SIZE;
    const endIndex = startIndex + MEMORY_PAGE_SIZE;
    return memoryList.slice(startIndex, endIndex);
  }, [memoryList, memoryPage]);

  // 搜索用户
  const onSearch = useCallback((value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  }, []);

  // 选中用户
  const onSelectUser = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setSelectedMemoryId(null);
    setMemoryPage(1); // 切换用户时重置记忆分页
  }, []);

  // 用户列表分页变化
  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // 记忆列表分页变化
  const onMemoryPageChange = useCallback((page: number) => {
    setMemoryPage(page);
    setSelectedMemoryId(null); // 切换页时取消选中
  }, []);

  // 选中记忆
  const onSelectMemory = useCallback((memoryId: string) => {
    setSelectedMemoryId(memoryId);
  }, []);

  // 删除记忆
  const onDeleteMemory = useCallback(
    (e: React.MouseEvent, memoryId: string) => {
      e.stopPropagation();
      Modal.confirm({
        title: '确认删除该条记忆？',
        content: '删除后无法恢复。',
        okType: 'danger',
        onOk: async () => {
          await deleteMemory({ repositoryId: repoId, memoryId });
          // 延时 1s 再提示删除成功
          await new Promise((resolve) => setTimeout(resolve, 1000));
          message.success('删除成功');
          refreshMemories();
          if (selectedMemoryId === memoryId) {
            setSelectedMemoryId(null);
          }
        },
      });
    },
    [repoId, refreshMemories, selectedMemoryId],
  );

  // 编辑记忆库基础信息
  const onEditRepo = useCallback(() => {
    setEditModalVisible(true);
  }, []);

  // 编辑成功回调
  const onEditSuccess = useCallback(() => {
    setEditModalVisible(false);
    refreshRepoDetail();
  }, [refreshRepoDetail]);

  // 删除后如果当前页没有数据，自动跳到上一页
  useEffect(() => {
    if (memoryList.length > 0 && paginatedMemoryList.length === 0 && memoryPage > 1) {
      setMemoryPage(memoryPage - 1);
    }
  }, [memoryList.length, paginatedMemoryList.length, memoryPage]);

  useEffect(() => {
    if (userList.length > 0) {
      onSelectUser(userList[0].userId);
    }
  }, [userList, onSelectUser]);

  return (
    <>
      <Breadcrumbs
        currentText={
          <>
            {repoDetail?.name || '记忆库详情'}
            <Tooltip title="编辑记忆库">
              <EditOutlined onClick={onEditRepo} style={{ cursor: 'pointer', marginLeft: 8 }} />
            </Tooltip>
          </>
        }
      />
      <ContentWrapper className={`${ModuleName}-wrapper`}>
        <div className={ModuleName}>
          {/* 左侧用户列表 */}
          <div className={`${ModuleName}-left`}>
            <div className={`${ModuleName}-left-header`}>
              <Input.Search placeholder="请输入用户ID" allowClear onSearch={onSearch} />
            </div>
            <div className={`${ModuleName}-left-content`}>
              {usersLoading ? (
                <Spin spinning={usersLoading} />
              ) : userList.length > 0 ? (
                <List
                  dataSource={userList}
                  renderItem={(item: MemoryRepositoryNS.UserType) => (
                    <List.Item
                      className={`${ModuleName}-user-item ${selectedUserId === item.userId ? 'active' : ''}`}
                      onClick={() => onSelectUser(item.userId)}
                    >
                      <Renwu className={`${ModuleName}-user-icon`} color="currentColor" />
                      <span className={`${ModuleName}-user-id`}>{item.userId}</span>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无用户记忆数据" />
              )}
            </div>

            {userTotal > 0 && (
              <div className={`${ModuleName}-left-footer`}>
                <Pagination
                  simple
                  current={currentPage}
                  pageSize={PAGE_SIZE}
                  total={userTotal}
                  onChange={onPageChange}
                />
              </div>
            )}
          </div>

          {/* 右侧记忆列表 */}
          <div className={`${ModuleName}-right`}>
            <div className={`${ModuleName}-right-content`}>
              {!selectedUserId ? (
                <Empty description="请选择一个用户查看记忆" />
              ) : memoryList.length > 0 ? (
                <div className={`${ModuleName}-memory-list`}>
                  {paginatedMemoryList.map((memory: MemoryRepositoryNS.MemoryType) => (
                    <div
                      key={memory.id}
                      className={`${ModuleName}-memory-item ${selectedMemoryId === memory.id ? 'active' : ''}`}
                      onClick={() => onSelectMemory(memory.id)}
                    >
                      <div className={`${ModuleName}-memory-content`}>{memory.memory}</div>
                      <div className={`${ModuleName}-memory-footer`}>
                        <span className={`${ModuleName}-memory-time`}>{formatDate(memory.updateTime)}</span>
                        <div className={`${ModuleName}-memory-actions`}>
                          <Tooltip title="删除">
                            <span
                              className={`${ModuleName}-memory-action-btn danger`}
                              onClick={(e) => onDeleteMemory(e, memory.id)}
                            >
                              <Shanchu color="currentColor" width="16px" height="16px" />
                            </span>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="该用户暂无记忆数据" />
              )}
            </div>
            {/* 记忆列表分页 */}

            <div className={`${ModuleName}-right-footer`}>
              <Pagination
                current={memoryPage}
                pageSize={MEMORY_PAGE_SIZE}
                total={memoryList.length}
                onChange={onMemoryPageChange}
              />
            </div>
          </div>
        </div>
      </ContentWrapper>
      <CreateModal
        open={editModalVisible}
        editData={repoDetail}
        onCancel={() => setEditModalVisible(false)}
        onOk={onEditSuccess}
      />
    </>
  );
};

export default MemoryRepositoryDetail;
