import React, { useCallback, useMemo } from 'react';
import type { ModalProps } from 'antd';
import { useRecoilValue } from 'recoil';
import { CurrentAppState } from '@/model';
import { AppEventBus } from '@/pages/AppList/event';
import type { AppsNS } from '@/types/Apps';
import { EventTypeEnum } from '@/constants/eventType';
import CommonKnowledgeModal from '@/components/KnowlegeModal';
import './index.less';

const KnowledgeModal: React.FC<{ onDelete: (deleteItem: AppsNS.KnowledgeType) => void } & ModalProps> = ({
  onDelete,
  ...modalProps
}) => {
  const currentApp = useRecoilValue(CurrentAppState);
  const { appId, ysKnowledgeList } = currentApp;

  const onAdd = useCallback(
    (item) => {
      AppEventBus.emit(EventTypeEnum.saveAppData, {
        ysKnowledgeList: [...(currentApp.ysKnowledgeList || []), item],
      });
    },
    [currentApp.ysKnowledgeList],
  );
  const requestParams = useMemo(() => ({ appId }), [appId]);

  return (
    <CommonKnowledgeModal
      onAdd={onAdd}
      onDelete={onDelete}
      requestParams={requestParams}
      hasAddedList={ysKnowledgeList}
      {...modalProps}
    />
  );
};

export default KnowledgeModal;
