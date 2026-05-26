import React, { useCallback, useState } from 'react';
import type { ModalProps } from 'antd';
import { Tag } from 'antd';
import { IconNeizhigongju, IconQuanbu, IconZidingyi } from '@/assets/icons';
import { getSkillList } from '@/api/skill';
import type { SkillNS } from '@/types/Skills';
import type { AppsNS } from '@/types/Apps';
import ResourceModal from '@/components/ResourceModal';
import type { CategoryItem } from '@/components/ResourceModal';
import { SkillStatusEnum, SkillTypeEnum } from '@/constants';
import SkillIcon from '@/components/SkillIcon';

const SKILL_CATEGORIES: CategoryItem<SkillTypeEnum>[] = [
  { type: SkillTypeEnum.all, label: '全部', icon: <IconQuanbu color="currentColor" /> },
  { type: SkillTypeEnum.builtin, label: '内置 Skill', icon: <IconNeizhigongju color="currentColor" /> },
  { type: SkillTypeEnum.custom, label: '自定义 Skill', icon: <IconZidingyi color="currentColor" /> },
];
interface SkillModalProps extends Omit<ModalProps, 'title'> {
  onAdd: (skill: AppsNS.SkillType) => void;
  onDelete: (skill: { skillId: string | number }) => void;
  hasAddedList: AppsNS.SkillType[];
}

const SkillModal: React.FC<SkillModalProps> = ({ onAdd, onDelete, hasAddedList, ...modalProps }) => {
  const [currentType, setCurrentType] = useState<SkillTypeEnum>(SkillTypeEnum.all);

  const handleAddGroup = useCallback(
    (skill: SkillNS.SkillDetailType) => {
      onAdd({
        skillId: skill.skillId,
        skillName: skill.skillName,
        skillDesc: skill.skillDesc,
      });
    },
    [onAdd],
  );

  const handleDeleteGroup = useCallback(
    (skillId: string | number) => {
      onDelete({ skillId });
    },
    [onDelete],
  );

  return (
    <ResourceModal<SkillTypeEnum, SkillNS.SkillDetailType>
      title="添加 Skill"
      categories={SKILL_CATEGORIES}
      currentType={currentType}
      onTypeChange={setCurrentType}
      fetchGroups={({ currentType: type, searchName }) =>
        getSkillList({
          pageNo: 1,
          pageSize: 10000,
          skillType: type,
          skillStatus: SkillStatusEnum.success,
          ...(searchName ? { name: searchName } : {}),
        })
      }
      groupToAnchor={(skill) => ({ id: skill.skillId, name: skill.skillName })}
      centerContentProps={{
        groupIdKey: 'skillId',
        hasChildren: false, // Skill 无子级，卡片本身即可添加
        searchPlaceholder: '搜索 Skill 名称',
        hasAddedGroupList: hasAddedList,
        onAddGroup: handleAddGroup,
        onDeleteGroup: handleDeleteGroup,
        renderGroupIcon: (skill: SkillNS.SkillDetailType) => (
          <SkillIcon type={skill.skillType} name={skill.skillName} />
        ),
        groupNameKey: 'skillName',
        groupDescKey: 'skillDesc',
      }}
      {...modalProps}
    />
  );
};

export default SkillModal;
