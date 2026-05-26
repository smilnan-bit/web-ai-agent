import React, { useEffect, useState } from 'react';
import type { ModalProps } from 'antd';
import { Button, Modal, Empty, Spin } from 'antd';
import { getRepositoryList } from '@/api/memoryRepository';
import type { AppsNS } from '@/types/Apps';
import './index.less';
import { useRouter } from '@ysf/ys-router';
import Ellipsis from '@ysf/ellipsis';
import './index.less';
interface MemoryModalProps extends ModalProps {
  onUnbind?: () => void;
  boundedData?: AppsNS.MemoryRepositoryType[];
  handleBind: (item: MemoryRepositoryNS.RepositoryType) => void;
  handleUnbind: () => void;
}

const MemoryModal: React.FC<MemoryModalProps> = ({
  onUnbind,
  boundedData,
  handleBind,
  handleUnbind,
  ...modalProps
}) => {
  const [repositoryList, setRepositoryList] = useState<MemoryRepositoryNS.RepositoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveringId, setHoveringId] = useState<number>();
  const { routesMap, navigate } = useRouter();

  useEffect(() => {
    if (modalProps.open) {
      setLoading(true);
      getRepositoryList({ offset: 0, limit: 10000 })
        .then(({ data }) => {
          setRepositoryList(data?.list || []);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [modalProps.open]);

  return (
    <Modal
      title="选择记忆库"
      footer={null}
      width={560}
      bodyStyle={{ height: 'calc(100vh - 308px)', overflowY: 'auto', minHeight: 200 }}
      className="memory-modal"
      {...modalProps}
    >
      <Spin spinning={loading}>
        {repositoryList.length === 0 && !loading ? (
          <Empty
            description={
              <span>
                暂无记忆库，请先
                <a onClick={() => navigate(routesMap.memory.path)}>创建记忆库</a>
              </span>
            }
          />
        ) : (
          <div tw="flex flex-col gap-3">
            {repositoryList.map((item) => {
              const { id, name, description } = item;
              const isBound = !!boundedData?.find((item) => item.id === id);
              const showUnbind = hoveringId === id && isBound;
              return (
                <div
                  tw="bg-[#f3f4f6] flex px-3 py-2 rounded-[2px] border border-[rgba(0, 0, 0, 0.06)] w-[512px]"
                  key={id}
                  onMouseEnter={() => setHoveringId(id)}
                  onMouseLeave={() => setHoveringId(undefined)}
                >
                  <div tw="flex-1 mr-6">
                    <Ellipsis lines={1}>
                      <div className="MemoryItem-name">{name}</div>
                    </Ellipsis>
                    <Ellipsis lines={1}>
                      <div className="MemoryItem-desc">{description || '暂无描述'}</div>
                    </Ellipsis>
                  </div>

                  {!showUnbind ? (
                    <Button
                      tw="w-[64px] p-0 flex items-center justify-center"
                      disabled={isBound}
                      onClick={() => handleBind(item)}
                    >
                      {isBound ? '已绑定' : '绑定'}
                    </Button>
                  ) : (
                    <Button tw="w-[64px] p-0 flex items-center justify-center" onClick={handleUnbind} danger>
                      解绑
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

export default MemoryModal;
