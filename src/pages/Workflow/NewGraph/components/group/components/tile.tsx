import type { CSSProperties, FC } from 'react';

import { CommandRegistry, useService, type WorkflowNodeEntity } from '@flowgram.ai/free-layout-editor';
import { Button, Tooltip } from '@douyinfe/semi-ui';
import React from 'react';
import { WorkflowGroupCommand } from '../../../plugins/create-free-group-plugin';
import { IconPingpu } from '../icon';

interface TileButtonProps {
  node: WorkflowNodeEntity;
  style?: CSSProperties;
}

export const TileButton: FC<TileButtonProps> = ({ node, style }) => {
  const commandRegistry = useService(CommandRegistry);
  return (
    <Tooltip content="平铺">
      <div className="workflow-group-btn" style={style} tw="right-[60px]">
        <Button
          icon={<IconPingpu />}
          style={{ height: 30, width: 30 }}
          theme="borderless"
          type="tertiary"
          onClick={() => {
            commandRegistry.executeCommand(WorkflowGroupCommand.Tile, node);
          }}
        />
      </div>
    </Tooltip>
  );
};
