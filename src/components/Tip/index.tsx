import type { TooltipProps } from 'antd';
import { Tooltip } from 'antd';
import React from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const Tip: React.FC<{ iconStyle?: React.CSSProperties } & TooltipProps> = ({ iconStyle = {}, ...tooltipProps }) => (
  <Tooltip {...tooltipProps}>
    <ExclamationCircleOutlined
      style={{ marginLeft: 4, cursor: 'pointer', color: 'rgba(0, 0, 0, 0.45)', ...iconStyle }}
    />
  </Tooltip>
);

export default Tip;
