import React, { useEffect, useState } from 'react';
import type { ModalProps } from 'antd';
import { Button, Modal } from 'antd';
import Ellipsis from '@ysf/ellipsis';
import { getWorkflowList } from '@/api/workflow';
import type { AppsNS } from '@/types/Apps';
import './index.less';
import type { WorkflowNS } from '@/types/Workflow';

const WorkflowModal: React.FC<
  {
    onDelete: (deleteItem: AppsNS.WorkflowType) => void;
    onAdd: (addItem: AppsNS.WorkflowType) => void;
    hasAddedList?: AppsNS.WorkflowType[];
    singleSelect?: boolean;
  } & ModalProps
> = ({ onDelete, onAdd, hasAddedList = [], singleSelect = false, ...modalProps }) => {
  const [workflowList, setWorkflowList] = useState<WorkflowNS.WorkflowType[]>([]);
  const [hoveringId, setHoveringId] = useState<number>();

  useEffect(() => {
    getWorkflowList().then((res) => {
      const list = res?.data?.list || [];
      const filteredList = list.filter((item) => item?.releaseTime && item?.releaseTime > 0);
      setWorkflowList(filteredList);
    });
  }, []);

  return (
    <Modal
      title="选择工作流"
      footer={null}
      bodyStyle={{ height: 'calc(100vh - 308px)' }}
      className="WorkflowModal"
      {...modalProps}
    >
      <div className="WorkflowList">
        {workflowList?.map((item) => {
          const { workflowId, workflowName, workflowDesc } = item;
          const added = hasAddedList.find((addedItem) => addedItem.workflowId === workflowId);
          const showRemove = hoveringId === workflowId && added && !singleSelect;
          const buttonText = added ? (singleSelect ? '已选择' : '已添加') : singleSelect ? '选择' : '添加';

          return (
            <div
              className="WorkflowItem"
              key={workflowId}
              onMouseEnter={() => {
                if (!singleSelect) {
                  setHoveringId(workflowId);
                }
              }}
              onMouseLeave={() => {
                if (!singleSelect) {
                  setHoveringId(undefined);
                }
              }}
            >
              <div>
                <Ellipsis lines={1}>
                  <div className="WorkflowItem-name">{workflowName}</div>
                </Ellipsis>
                <Ellipsis lines={1}>
                  <div className="WorkflowItem-count">{workflowDesc}</div>
                </Ellipsis>
              </div>
              {!showRemove ? (
                <Button
                  disabled={!!added}
                  onClick={() =>
                    // Fix type mismatch by casting item to expected type
                    onAdd(item as any)
                  }
                >
                  {buttonText}
                </Button>
              ) : (
                <Button
                  danger
                  onClick={() =>
                    // Fix type mismatch by casting item to expected type
                    onDelete(item as any)
                  }
                >
                  移除
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default WorkflowModal;
