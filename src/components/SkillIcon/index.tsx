import React from 'react';
import { SkillTypeEnum } from '@/constants';

interface SkillIconProps {
  type?: SkillTypeEnum;
  imageUrl?: string;
  name?: string;
  style?: React.CSSProperties;
}

const builtinSkillIcon = 'https://res.qiyukf.net/storage/6a2d1fcd-17ba-44e1-b504-2a92c3434a53.png';
const customSkillIcon = 'https://res.qiyukf.net/storage/86c337c0-ae07-4c93-8ca2-788ac8abd8b2.png';

const SkillIcon: React.FC<SkillIconProps> = ({ type = SkillTypeEnum.custom, imageUrl, name, style = {} }) => {
  return (
    <div>
      {/* 中心图标或 Logo */}

      <img
        src={type === SkillTypeEnum.builtin ? builtinSkillIcon : customSkillIcon}
        alt={name || 'skill'}
        style={{
          width: 40,
          height: 40,
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </div>
  );
};

export default SkillIcon;
