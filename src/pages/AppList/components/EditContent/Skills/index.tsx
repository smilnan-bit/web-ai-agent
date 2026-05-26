import React, { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { CurrentAppState } from '@/model';
import type { AppsNS } from '@/types/Apps';
import { AppEventBus } from '@/pages/AppList/event';
import { EventTypeEnum } from '@/constants/eventType';
import SkillModal from '@/components/SkillModal';
import MultipleEdit from '../MutipleEdit';

const Skills: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const currentApp = useRecoilValue(CurrentAppState);
  const { skillList } = currentApp || {};

  const onAddSkill = useCallback(
    (addItem: AppsNS.SkillType) => {
      const newSkillList = [...(currentApp.skillList || [])];
      const existIndex = newSkillList.findIndex((s) => String(s.skillId) === String(addItem.skillId));
      if (existIndex === -1) {
        newSkillList.push(addItem);
        AppEventBus.emit(EventTypeEnum.saveAppData, { skillList: newSkillList });
      }
    },
    [currentApp.skillList],
  );

  const onDeleteSkill = useCallback(
    (deleteItem: AppsNS.SkillType) => {
      const newSkillList = (currentApp.skillList || []).filter(
        (s) => String(s.skillId) !== String((deleteItem as any).skillId),
      );
      AppEventBus.emit(EventTypeEnum.saveAppData, { skillList: newSkillList });
    },
    [currentApp.skillList],
  );

  return (
    <>
      <MultipleEdit
        title="Skill"
        list={skillList as any[]}
        onAdd={() => setModalVisible(true)}
        onDelete={onDeleteSkill as any}
        emptyText="您可直接关联内置Skill，也可上传自己的Skill进行使用。"
        nameKey="skillName"
        descKey="skillDesc"
        enableClick={(item) => false}
      />
      <SkillModal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onAdd={onAddSkill}
        onDelete={(item) => {
          const newSkillList = (currentApp.skillList || []).filter((s) => String(s.skillId) !== String(item.skillId));
          AppEventBus.emit(EventTypeEnum.saveAppData, { skillList: newSkillList });
        }}
        hasAddedList={skillList || []}
      />
    </>
  );
};

export default Skills;
