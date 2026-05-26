import { useControlTips } from './use-control';
import { GroupTipsStyle } from './style';
import { isMacOS } from './is-mac-os';
import { IconClose } from './icon-close';
import React from 'react';

export const GroupTips = () => {
  const { visible, close, closeForever } = useControlTips();

  if (!visible) {
    return null;
  }

  return (
    <GroupTipsStyle className={'workflow-group-tips'}>
      <div className="container">
        <div className="content">
          <p className="text">{`按住${isMacOS ? 'Cmd ⌘' : 'Ctrl'}可将节点拖出`}</p>
          <div
            className="space"
            style={{
              width: 0,
            }}
          />
        </div>
        <div className="actions">
          <p className="close-forever" onClick={closeForever}>
            不再提示
          </p>
        </div>
      </div>
    </GroupTipsStyle>
  );
};
