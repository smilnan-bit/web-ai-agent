import React, { useEffect, useState } from 'react';
import type { ModalProps } from 'antd';
import { Button, Modal } from 'antd';
import { getKnowledgeList } from '@/api/knowledge';
import type { AppsNS } from '@/types/Apps';

const KnowledgeModal: React.FC<
  {
    onDelete: (deleteItem: AppsNS.KnowledgeType) => void;
    onAdd: (addItem: AppsNS.KnowledgeType) => void;
    hasAddedList: AppsNS.KnowledgeType[];
    requestParams: Record<string, any>;
  } & ModalProps
> = ({ onDelete, onAdd, hasAddedList, requestParams, ...modalProps }) => {
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeNS.KnowledgeType[]>([]);
  const [hoveringId, setHoveringId] = useState<number>();

  useEffect(() => {
    getKnowledgeList(requestParams).then(({ data }) => {
      setKnowledgeList(data as any);
    });
  }, [requestParams]);
  return (
    <Modal
      title="选择知识空间"
      footer={null}
      width={560}
      bodyStyle={{ height: 'calc(100vh - 308px)', overflowY: 'auto' }}
      {...modalProps}
    >
      <div tw="flex flex-col gap-3">
        {knowledgeList?.map((item) => {
          const { id, name, docCount, type } = item;
          const added = hasAddedList?.find((item) => item.spaceId === id);
          const showRemove = hoveringId === id && added;
          return (
            <div
              tw="bg-[#f3f4f6] flex px-3 py-2 rounded-[2px] border border-[rgba(0, 0, 0, 0.06)] w-[512px]"
              key={id}
              onMouseEnter={() => setHoveringId(id)}
              onMouseLeave={() => setHoveringId(undefined)}
            >
              <div tw="flex-1 mr-6">
                <div tw="flex items-center gap-1 leading-[22px] w-[400px] truncate">
                  <span tw="font-medium truncate whitespace-nowrap">{name}</span>
                  {type === -1 && (
                    <div tw="flex-none text-[12px] text-[#fff] bg-[#337EFF] rounded-[2px] px-1 leading-5">问题库</div>
                  )}
                </div>
                <div tw="text-[rgba(47, 27, 27, 0.45)]">{docCount}个知识点</div>
              </div>
              {!showRemove ? (
                <Button
                  tw="w-[64px] p-0 flex items-center justify-center"
                  disabled={!!added}
                  onClick={() => onAdd({ spaceId: item.id, spaceName: item.name, spaceLink: item.spaceLink })}
                >
                  {added ? '已添加' : '添加'}
                </Button>
              ) : (
                <Button
                  tw="w-[64px] p-0 flex items-center justify-center"
                  onClick={() => onDelete({ spaceId: item.id, spaceName: item.name, ...item })}
                  danger
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

export default KnowledgeModal;
