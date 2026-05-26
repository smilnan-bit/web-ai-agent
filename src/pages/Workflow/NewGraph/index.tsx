import React from 'react';
import Editor from './editor';
import './index.less';

const block = 'm-graph';
const EditGraph: React.FC = () => {
  // 显示加载状态

  return (
    <div className={`${block}`}>
      <Editor />
    </div>
  );
};

export default EditGraph;
