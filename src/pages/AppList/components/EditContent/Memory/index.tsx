import React, { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { CurrentAppState } from '@/model';
import { AppEventBus } from '@/pages/AppList/event';
import { EventTypeEnum } from '@/constants/eventType';
import MultipleEdit from '../MutipleEdit';
import MemoryModal from '../MemoryModal';
import { useRouter } from '@ysf/ys-router';

const Memory: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const currentApp = useRecoilValue(CurrentAppState);
  const { memorySetting } = currentApp;
  const { routesMap } = useRouter();
  const onDelete = useCallback(() => {
    AppEventBus.emit(EventTypeEnum.saveAppData, {
      memorySetting: undefined,
    });
  }, []);

  const onUnbind = useCallback(() => {
    // 解绑后关闭弹窗
    setModalVisible(false);
  }, []);

  const handleBind = useCallback((item: MemoryRepositoryNS.RepositoryType) => {
    AppEventBus.emit(EventTypeEnum.saveAppData, {
      memorySetting: { id: item.id, name: item.name },
    });
    setModalVisible(false);
  }, []);

  const handleUnbind = useCallback(() => {
    AppEventBus.emit(EventTypeEnum.saveAppData, {
      memorySetting: undefined,
    });
  }, []);

  return (
    <>
      <MultipleEdit
        title="记忆库"
        list={memorySetting ? [memorySetting] : []}
        onAdd={() => {
          setModalVisible(true);
        }}
        onDelete={onDelete}
        emptyText="记忆库用于存储用户的长期记忆，使Agent能够跨会话记住用户的偏好和信息。每个Agent最多绑定一个记忆库。"
        nameKey="name"
        onTitleClick={() => {
          window.open(routesMap.memory.path, '_blank');
        }}
        onItemTitleClick={(item) => {
          if ('id' in item && item.id) {
            window.open(`${routesMap.memoryDetail.path}?id=${item.id}`, '_blank');
          }
        }}
        // 因为只能绑定一个，绑定后隐藏添加按钮
        showAdd={!memorySetting}
      />
      <MemoryModal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onUnbind={onUnbind}
        boundedData={memorySetting ? [memorySetting] : []}
        handleBind={handleBind}
        handleUnbind={handleUnbind}
      />
    </>
  );
};

export default Memory;
