import type { CSSProperties, FC } from 'react';

import { CommandRegistry, useService, type WorkflowNodeEntity } from '@flowgram.ai/free-layout-editor';
import { WorkflowGroupCommand } from '../../../plugins/create-free-group-plugin';
import { Button, Tooltip } from '@douyinfe/semi-ui';

import React from 'react';
import { IconQuxiaofenzu } from '../icon';

interface UngroupButtonProps {
  node: WorkflowNodeEntity;
  style?: CSSProperties;
}

export const UngroupButton: FC<UngroupButtonProps> = ({ node, style }) => {
  const commandRegistry = useService(CommandRegistry);
  return (
    <Tooltip content="取消分组">
      <div className="workflow-group-btn" style={style} tw="right-[120px]">
        <Button
          icon={<IconQuxiaofenzu />}
          style={{ height: 30, width: 30 }}
          theme="borderless"
          type="tertiary"
          onClick={() => {
            commandRegistry.executeCommand(WorkflowGroupCommand.Ungroup, node);
          }}
        />
      </div>
    </Tooltip>
  );
};
