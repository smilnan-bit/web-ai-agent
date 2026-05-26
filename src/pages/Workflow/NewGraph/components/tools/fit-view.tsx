/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { usePlaygroundTools } from '@flowgram.ai/free-layout-editor';
import { IconButton, Tooltip } from '@douyinfe/semi-ui';
import React from 'react';

const IconExpand = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" style={{ fontSize: '16px' }}>
    <path
      d="M1.55 1.911a.664.664 0 0 1 .615-.411h4.668a.667.667 0 1 1 0 1.333H3.776l3.529 3.529a.667.667 0 1 1-.943.943L2.833 3.776v3.057a.667.667 0 0 1-1.333 0V2.165c0-.09.018-.176.05-.254Zm12.9 12.178a.664.664 0 0 1-.14.211l-.01.009a.664.664 0 0 1-.465.19H9.167a.667.667 0 1 1 0-1.332h3.057L8.695 9.638a.667.667 0 0 1 .943-.943l3.529 3.529V9.167a.667.667 0 1 1 1.333 0v4.668c0 .09-.018.175-.05.253Z"
      fill="#000"
    ></path>
  </svg>
);

export const FitView = () => {
  const tools = usePlaygroundTools();
  return (
    <Tooltip content="适配屏幕大小">
      <IconButton icon={<IconExpand />} type="tertiary" theme="borderless" onClick={() => tools.fitView()} />
    </Tooltip>
  );
};
