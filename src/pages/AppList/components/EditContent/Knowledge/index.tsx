import React, { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Tooltip } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { CurrentAppState } from '@/model';
import { AppEventBus } from '@/pages/AppList/event';
import { EventTypeEnum } from '@/constants/eventType';
import type { AppsNS } from '@/types/Apps';
import { ToolStatusEnum } from '@/constants';
import MultipleEdit from '../MutipleEdit';
import KnowledgeModal from '../KnowlegeModal';
import KnowledgeSet from './KnowledgSet';

const Knowledge: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [knowledgeSetVis, setKnowledgeSetVis] = useState(false);
  const currentApp = useRecoilValue(CurrentAppState);
  const { ysKnowledgeList } = currentApp;

  const onDelete = useCallback(
    (deleteItem) => {
      AppEventBus.emit(EventTypeEnum.saveAppData, {
        ysKnowledgeList: currentApp.ysKnowledgeList.filter((item) => item.spaceId !== deleteItem.spaceId),
      });
    },
    [currentApp.ysKnowledgeList],
  );

  return (
    <>
      <MultipleEdit
        title="知识库"
        list={ysKnowledgeList}
        onAdd={() => {
          setModalVisible(true);
        }}
        onDelete={onDelete}
        emptyText="将知识文档上传或导入知识空间后，可以在此添加或绑定知识空间，使Agent能够依据知识空间中的内容回答用户问题。"
        nameKey={'spaceName'}
        onTitleClick={() => {
          window.open('/knowledge/space', '_blank');
        }}
        onItemTitleClick={({ spaceLink }: AppsNS.KnowledgeType) => {
          spaceLink && window.open(spaceLink, '_blank');
        }}
        isWarning={(item: AppsNS.KnowledgeType) => item?.status === ToolStatusEnum.deleted}
        warningText={'该知识库不存在'}
        titleExtra={
          <Tooltip title="知识库设置">
            <SettingOutlined
              style={{ marginLeft: 'auto', marginRight: 16 }}
              className="AiAgent-link"
              onClick={() => setKnowledgeSetVis(true)}
            />
          </Tooltip>
        }
      />
      <KnowledgeModal open={modalVisible} onCancel={() => setModalVisible(false)} onDelete={onDelete} />
      <KnowledgeSet open={knowledgeSetVis} onCancel={() => setKnowledgeSetVis(false)} />
    </>
  );
};

export default Knowledge;
