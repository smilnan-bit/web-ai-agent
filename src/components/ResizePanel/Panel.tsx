import React from 'react';
import type { FC } from 'react';
import ResizableView from './Resize';
import './index.less';
import type { PanelProps } from './type';
const prefix = 'm-resize-panel';

const directionMap = {
  left: 'w',
  right: 'e',
  top: 'n',
  bottom: 's',
};
const ResizePanel: FC<PanelProps> = (props: PanelProps) => {
  const { className = '', children, direction, ...other } = props;
  let horizontal = false;
  if (direction === 'left' || direction === 'right') {
    horizontal = true;
  }
  return (
    <div className={`m-resize-panel m-resize-panel-${direction} ${className}`}>
      <ResizableView horizontal={horizontal} resizeHandles={[directionMap[direction]]} {...other} />
      <div className={`${prefix}-content ${prefix}-content-${direction}`}>{children}</div>
    </div>
  );
};

export default ResizePanel;
