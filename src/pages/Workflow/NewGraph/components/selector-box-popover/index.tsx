import type { FunctionComponent } from 'react';
import type { SelectorBoxPopoverProps } from '@flowgram.ai/free-layout-editor';
import { FlowCommandId } from '../../shortcuts/constants';
import React from 'react';
import { WorkflowGroupCommand } from '../../plugins/create-free-group-plugin';
import { IconChuangjianfenzu, IconFangda, IconFuzhi3, IconShanchu, IconSuoxiao } from './icon';
import { Tooltip } from '@douyinfe/semi-ui';

type SelectorButtonProps = {
  onClick?: () => void;
  tip?: string;
  children: React.ReactNode;
};

const SelectorButton: FunctionComponent<SelectorButtonProps> = ({ onClick, children, tip = '' }) => (
  <div
    tw="flex items-center w-[24px] h-[24px] justify-center cursor-pointer bg-[#000] opacity-25 hover:opacity-35 outline-none"
    onClick={onClick}
  >
    <Tooltip content={tip}>
      <div tw="flex items-center justify-center p-1">{children}</div>
    </Tooltip>
  </div>
);

export const SelectorBoxPopover: FunctionComponent<SelectorBoxPopoverProps> = ({
  bounds,
  children,
  commandRegistry,
}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: bounds.right,
        top: bounds.top,
        transform: 'translate(-100%, -100%)',
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div tw="flex flex-nowrap text-[#fff] text-[14px] rounded-[4px] w-[120px] overflow-hidden">
        <SelectorButton
          tip="折叠"
          onClick={() => {
            commandRegistry.executeCommand(FlowCommandId.COLLAPSE);
          }}
        >
          <IconSuoxiao />
        </SelectorButton>

        <SelectorButton
          tip="展开"
          onClick={() => {
            commandRegistry.executeCommand(FlowCommandId.EXPAND);
          }}
        >
          <IconFangda />
        </SelectorButton>
        <SelectorButton
          tip="创建分组"
          onClick={() => {
            commandRegistry.executeCommand(WorkflowGroupCommand.Group);
          }}
        >
          <IconChuangjianfenzu />
        </SelectorButton>

        <SelectorButton
          tip="复制"
          onClick={() => {
            commandRegistry.executeCommand(FlowCommandId.COPY);
          }}
        >
          <IconFuzhi3 />
        </SelectorButton>

        <SelectorButton
          tip="删除"
          onClick={() => {
            commandRegistry.executeCommand(FlowCommandId.DELETE);
          }}
        >
          <IconShanchu />
        </SelectorButton>
      </div>
    </div>
    <div>{children}</div>
  </>
);
