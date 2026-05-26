import React from 'react';
import { Button } from 'antd';
import classnames from 'classnames';
import { ToolboxTypeEnum } from '@/constants';
import { IconNeizhigongju, IconQuanbu, IconZidingyi } from '@/assets/icons';
import './index.less';

interface CategorySidebarProps {
  currentType: ToolboxTypeEnum;
  onTypeChange: (type: ToolboxTypeEnum) => void;
  onCreateToolClick: () => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ currentType, onTypeChange, onCreateToolClick }) => {
  const categories = [
    {
      type: ToolboxTypeEnum.all,
      label: '全部',
      icon: <IconQuanbu color="currentColor" />,
    },
    {
      type: ToolboxTypeEnum.default,
      label: '内置工具',
      icon: <IconNeizhigongju color="currentColor" />,
    },

    {
      type: ToolboxTypeEnum.custom,
      label: '自定义工具',
      icon: <IconZidingyi color="currentColor" />,
    },
  ];

  return (
    <div className="ToolModal-CategorySidebar">
      <div className="ToolModal-CategorySidebar-header">
        <h3 className="ToolModal-CategorySidebar-title">添加工具</h3>
      </div>
      <div className="ToolModal-CategorySidebar-content">
        <div className="ToolModal-CategorySidebar-create">
          <Button type="primary" block onClick={onCreateToolClick}>
            创建工具
          </Button>
        </div>
        <div className="ToolModal-CategorySidebar-categories">
          {categories.map((category) => (
            <div
              key={category.type}
              className={classnames('ToolModal-CategorySidebar-item', {
                active: currentType === category.type,
              })}
              onClick={() => onTypeChange(category.type)}
            >
              <span className="ToolModal-CategorySidebar-item-icon">{category.icon}</span>
              <span className="ToolModal-CategorySidebar-item-label">{category.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySidebar;
