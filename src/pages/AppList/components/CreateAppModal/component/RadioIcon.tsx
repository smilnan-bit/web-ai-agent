import React from 'react';

interface RadioIconProps {
  checked?: boolean;
  size?: number;
}

const RadioIcon: React.FC<RadioIconProps> = ({ checked = false, size = 14 }) => {
  if (checked) {
    // 选中状态的单选按钮：蓝色外圆 + 白色中圆 + 蓝色中心点
    return (
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 外层蓝色实心圆 */}
        <circle cx="7" cy="7" r="7" fill="#5983FF" />
        {/* 中层白色圆（形成蓝色边框效果） */}
        <circle cx="7" cy="7" r="5.5" fill="white" />
        {/* 中心蓝色小点 */}
        <circle cx="7" cy="7" r="2.5" fill="#5983FF" />
      </svg>
    );
  }

  // 未选中状态的单选按钮：灰色边框，白色填充
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="6.5" stroke="#D9D9D9" fill="white" strokeWidth="1" />
    </svg>
  );
};

export default RadioIcon;
