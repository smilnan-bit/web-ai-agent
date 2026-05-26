import React, { useCallback, useEffect, useState } from 'react';
import { Input, List, Modal, Spin, Typography, Empty, type ModalProps, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getSubWorkflowList } from '../../api';
import type { SubWorkflowItem } from '../../api';

interface SubWorkflowSelectModalProps extends ModalProps {
  open: boolean;
  /** 当前工作流 ID，用于排除自身 */
  currentWorkflowId?: number;
  /** 已选中的工作流 ID */
  hasAddedList?: number[];
  onConfirm: (item: SubWorkflowItem) => void;
  onCancel: () => void;
  onDelete?: (workflowId: number) => void;
}

const SubWorkflowSelectModal: React.FC<SubWorkflowSelectModalProps> = ({
  open,
  currentWorkflowId,
  hasAddedList,
  onConfirm,
  onCancel,
  onDelete,
  zIndex,
}) => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<SubWorkflowItem[]>([]);
  const [selected, setSelected] = useState<SubWorkflowItem | null>(null);
  const [hoveringId, setHoveringId] = useState<number>();

  const fetchList = useCallback(
    async (keyword = '') => {
      if (!open || !currentWorkflowId) return;
      setLoading(true);
      try {
        const res = await getSubWorkflowList({ workflowId: currentWorkflowId, keyword, pageNo: 1, pageSize: 100 });
        setList((res as any)?.data?.list || []);
      } catch {
        setList([]);
      } finally {
        setLoading(false);
      }
    },
    [open, currentWorkflowId],
  );

  useEffect(() => {
    if (open) {
      fetchList();
      setSelected(null);
    }
  }, [open, fetchList]);

  return (
    <Modal
      title="选择子工作流"
      open={open}
      footer={null}
      onCancel={onCancel}
      okButtonProps={{ disabled: !selected }}
      width={480}
      bodyStyle={{ height: 'calc(100vh - 308px)', overflowY: 'auto', padding: '24px' }}
      zIndex={zIndex}
    >
      <div tw="mb-3">
        <Input.Search prefix={<SearchOutlined />} placeholder="搜索工作流名称" onSearch={fetchList} allowClear />
      </div>
      <Spin spinning={loading}>
        {list.length === 0 && !loading ? (
          <Empty description="暂无可引用的工作流" style={{ padding: '24px 0' }} />
        ) : (
          <div tw="flex gap-2 flex-col">
            {list?.map((item) => {
              const { workflowId, workflowName, workflowDesc } = item;
              const added = hasAddedList?.find((item) => item === workflowId);
              const showRemove = hoveringId === workflowId && added;
              return (
                <div
                  tw="bg-[#f3f4f6] flex px-3 py-2 rounded-[2px] border border-[rgba(0, 0, 0, 0.06)]"
                  key={workflowId}
                  onMouseEnter={() => setHoveringId(workflowId)}
                  onMouseLeave={() => setHoveringId(undefined)}
                >
                  <div tw="flex-1 mr-6">
                    <div tw="flex items-center gap-1 leading-[22px] truncate">
                      <span tw="font-medium truncate whitespace-nowrap">{workflowName}</span>
                    </div>
                    <div tw="text-[rgba(47, 27, 27, 0.45)]">{workflowDesc}</div>
                  </div>
                  {!showRemove ? (
                    <Button
                      tw="w-[64px] p-0 flex items-center justify-center"
                      disabled={!!added}
                      onClick={() => onConfirm(item)}
                    >
                      {added ? '已添加' : '添加'}
                    </Button>
                  ) : (
                    <Button
                      tw="w-[64px] p-0 flex items-center justify-center"
                      onClick={() => onDelete?.(workflowId)}
                      danger
                    >
                      移除
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default SubWorkflowSelectModal;
