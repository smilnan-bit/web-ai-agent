import React from 'react';
import './index.less';

const ContentWrapper: React.FC<{ className?: string; children: React.ReactNode }> = ({ children, className = '' }) => {
  return <div className={`ContentWrapper ${className}`}>{children}</div>;
};

export default ContentWrapper;
