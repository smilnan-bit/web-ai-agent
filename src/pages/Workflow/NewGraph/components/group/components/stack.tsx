import type { CSSProperties, FC } from 'react';

import { CommandRegistry, useService, type WorkflowNodeEntity } from '@flowgram.ai/free-layout-editor';
import { Button, Tooltip } from '@douyinfe/semi-ui';
import React from 'react';
import { WorkflowGroupCommand } from '../../../plugins/create-free-group-plugin';
import { IconDuidie } from '../icon';

interface StackButtonProps {
  node: WorkflowNodeEntity;
  style?: CSSProperties;
}

export const StackButton: FC<StackButtonProps> = ({ node, style }) => {
  const commandRegistry = useService(CommandRegistry);
  return (
    <Tooltip content="堆叠">
      <div className="workflow-group-btn" style={style} tw="right-[90px]">
        <Button
          icon={<IconDuidie />}
          style={{ height: 30, width: 30 }}
          theme="borderless"
          type="tertiary"
          onClick={() => {
            commandRegistry.executeCommand(WorkflowGroupCommand.Stack, node);
          }}
        />
      </div>
    </Tooltip>
  );
};
