import React from 'react';
import { Gongjuzu, IconXiaomoxinggongju } from '@/assets/icons';
import { ToolboxTypeEnum } from '@/constants';

interface ToolboxIconProps {
  toolboxType?: ToolboxTypeEnum;
  style?: React.CSSProperties;
  imageUrl?: string;
}

const ToolboxIcon: React.FC<ToolboxIconProps> = ({ toolboxType = ToolboxTypeEnum.custom, style = {}, imageUrl }) => {
  const isModelTool = toolboxType === ToolboxTypeEnum.modelTool;
  const isBuiltInTool = toolboxType === ToolboxTypeEnum.default;

  return (
    <div
      style={{
        borderRadius: 6,
        backgroundColor: isModelTool ? '#8080FF26' : 'rgba(255, 140, 25, 0.15)',
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {isBuiltInTool && imageUrl ? (
        <img src={imageUrl} alt="toolbox" width={style.width || 40} height={style.height || 40} />
      ) : isModelTool ? (
        <IconXiaomoxinggongju color={'#5555F2'} size={18} />
      ) : (
        <Gongjuzu color={'rgba(255, 140, 25, 1)'} size={18} />
      )}
    </div>
  );
};

export default ToolboxIcon;
