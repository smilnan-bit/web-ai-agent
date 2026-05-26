import React from 'react';

interface NodeWrapperStyleProps {
  children: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  'data-node-selected'?: string;
  style?: React.CSSProperties;
}

export const NodeWrapperStyle: React.FC<NodeWrapperStyleProps> = ({
  children,
  className,
  ref,
  draggable,
  onDragStart,
  onTouchStart,
  onClick,
  onMouseUp,
  onFocus,
  onBlur,
  'data-node-selected': dataNodeSelected,
  style,
}) => {
  return (
    <div
      ref={ref}
      className={className}
      draggable={draggable}
      onDragStart={onDragStart}
      onTouchStart={onTouchStart}
      onClick={onClick}
      onMouseUp={onMouseUp}
      onFocus={onFocus}
      onBlur={onBlur}
      data-node-selected={dataNodeSelected}
      style={style}
      tw="items-start bg-white border border-[rgba(6,7,9,0.15)] rounded-lg shadow-[0_2px_6px_0_rgba(0,0,0,0.04),0_4px_12px_0_rgba(0,0,0,0.02)] flex flex-col justify-center relative w-[360px] h-auto"
    >
      {children}
    </div>
  );
};
