import type { CSSProperties, FC } from 'react';

import { CommandRegistry, useService, type WorkflowNodeEntity } from '@flowgram.ai/free-layout-editor';
import { FlowCommandId } from '../../../shortcuts/constants';
import { Button, Tooltip } from '@douyinfe/semi-ui';
import React from 'react';
import { IconShanchu } from '../../selector-box-popover/icon';

interface DeleteButtonProps {
  node: WorkflowNodeEntity;
  style?: CSSProperties;
}

export const DeleteButton: FC<DeleteButtonProps> = ({ node, style }) => {
  const commandRegistry = useService(CommandRegistry);
  return (
    <Tooltip content="删除">
      <div className="workflow-group-btn" style={style}>
        <Button
          icon={<IconShanchu />}
          style={{ height: 30, width: 30 }}
          theme="borderless"
          type="tertiary"
          onClick={() => {
            commandRegistry.executeCommand(FlowCommandId.DELETE, [node]);
          }}
        />
      </div>
    </Tooltip>
  );
};
