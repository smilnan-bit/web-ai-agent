import type { CSSProperties, FC } from 'react';

import { CommandRegistry, useService, type WorkflowNodeEntity } from '@flowgram.ai/free-layout-editor';
import { Button, Tooltip } from '@douyinfe/semi-ui';
import React from 'react';
import { FlowCommandId } from '../../../shortcuts/constants';
import { IconFuzhi3 } from '../../selector-box-popover/icon';

interface CopyButtonProps {
  node: WorkflowNodeEntity;
  style?: CSSProperties;
}

export const CopyButton: FC<CopyButtonProps> = ({ node, style }) => {
  const commandRegistry = useService(CommandRegistry);
  return (
    <Tooltip content="复制">
      <div className="workflow-group-btn" style={style} tw="right-[30px]">
        <Button
          icon={<IconFuzhi3 />}
          style={{ height: 30, width: 30 }}
          theme="borderless"
          type="tertiary"
          onClick={() => {
            commandRegistry.executeCommand(FlowCommandId.COPY, [node]);
          }}
        />
      </div>
    </Tooltip>
  );
};
