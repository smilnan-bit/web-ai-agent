import React, { type FC, useRef } from 'react';

import { MonacoJsonViewer } from '@ysf/ai-chat';

import { TaskStateEnum, type WrokFlowNodeLogParams } from '@ysf/ai-chat/es/type';
import { IconFangda, IconWenjian } from '../../../components/selector-box-popover/icon';
import './index.less';

interface NodeStatusGroupProps {
  data?: WrokFlowNodeLogParams;
  optional?: boolean;
  disableCollapse?: boolean;
}
const STATE_MAP = {
  [TaskStateEnum.REQ]: '输入',
  [TaskStateEnum.RES]: '输出',
};

export const NodeStatusGroup: FC<NodeStatusGroupProps> = ({ data }) => {
  const jsonViewerRef = useRef<{ copy: () => void; fullscreen: () => void } | null>();

  const handleCopy = () => {
    if (jsonViewerRef.current) {
      jsonViewerRef.current?.copy();
    }
  };

  const handleFullscreen = () => {
    if (jsonViewerRef.current) {
      jsonViewerRef.current?.fullscreen();
    }
  };

  if (!data) {
    return null;
  }

  return (
    <div key={`${data.nodeId}_${data.taskState}`} className={'wfnl-content-item-code'}>
      <div className={'wcic-header'}>
        <span>{STATE_MAP[data?.taskState]}</span>
        <span>
          <IconWenjian onClick={() => handleCopy()} color={'#00000073'} style={{ cursor: 'pointer' }} />
          <IconFangda onClick={() => handleFullscreen()} color={'#00000073'} style={{ cursor: 'pointer' }} />
        </span>
      </div>
      <div>
        <MonacoJsonViewer
          theme="vs-light"
          jsonInput={data?.content || {}}
          height="200px"
          ref={(el) => {
            jsonViewerRef.current = el;
          }}
        />
      </div>
    </div>
  );
};
