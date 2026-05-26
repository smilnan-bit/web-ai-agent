import React from 'react';
import classnames from 'classnames';
import './index.less';

export interface CategoryItem<T = string | number> {
  type: T;
  label: string;
  icon?: React.ReactNode;
}

interface CategorySidebarProps<T = string | number> {
  title: string;
  categories: CategoryItem<T>[];
  currentType: T;
  onTypeChange: (type: T) => void;
  /** 可选的操作按钮（如"创建工具"） */
  actionSlot?: React.ReactNode;
}

function CategorySidebar<T = string | number>({
  title,
  categories,
  currentType,
  onTypeChange,
  actionSlot,
}: CategorySidebarProps<T>) {
  return (
    <div className="ResourceModal-CategorySidebar">
      <div className="ResourceModal-CategorySidebar-header">
        <h3 className="ResourceModal-CategorySidebar-title">{title}</h3>
      </div>
      <div className="ResourceModal-CategorySidebar-content">
        {actionSlot && <div className="ResourceModal-CategorySidebar-action">{actionSlot}</div>}
        <div className="ResourceModal-CategorySidebar-categories">
          {categories.map((category) => (
            <div
              key={String(category.type)}
              className={classnames('ResourceModal-CategorySidebar-item', {
                active: currentType === category.type,
              })}
              onClick={() => onTypeChange(category.type)}
            >
              {category.icon && <span className="ResourceModal-CategorySidebar-item-icon">{category.icon}</span>}
              <span className="ResourceModal-CategorySidebar-item-label">{category.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategorySidebar;
