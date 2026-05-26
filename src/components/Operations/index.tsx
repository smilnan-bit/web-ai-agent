import React from 'react';
import type { CSSProperties, ReactElement } from 'react';
import './index.less';

const modulePrefix = 'm-operations';

interface OperationsProps {
  head?: ReactElement;
  left?: ReactElement;
  right?: ReactElement;
  className?: string;
  style?: CSSProperties;
}

const Operations: React.FC<OperationsProps> = ({ head, left, right, className = '', style }) => (
  <div className={`${modulePrefix} ${className}`} style={style}>
    {head}
    <div className={`${modulePrefix}-body`}>
      <div className={`${modulePrefix}-left`}>{left}</div>
      <div className={`${modulePrefix}-right`}>{right}</div>
    </div>
  </div>
);

export default Operations;
