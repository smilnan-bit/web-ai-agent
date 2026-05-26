import { Tooltip } from 'antd';
import type { TooltipProps } from 'antd/es/tooltip';
import React from 'react';

const TooltipFormItem: React.FC<{
  tooltipProps?: TooltipProps & { titleFromValue?: (value: any) => React.ReactNode };
  Content: React.ComponentType<any>;
  [otherProps: string]: any;
}> = ({ tooltipProps = {}, Content, style, ...inputProps }) => {
  const { value } = inputProps;

  return (
    <Tooltip
      title={
        tooltipProps?.title
          ? tooltipProps?.title
          : tooltipProps?.titleFromValue
            ? tooltipProps?.titleFromValue(value)
            : value
      }
      mouseEnterDelay={1}
      {...tooltipProps}
    >
      {/* disable的元素都无法悬浮提示 需要套一层 */}
      <div style={{ ...style }}>
        <Content {...inputProps} />
      </div>
    </Tooltip>
  );
};

export default TooltipFormItem;
