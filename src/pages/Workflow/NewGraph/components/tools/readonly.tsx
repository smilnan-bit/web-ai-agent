/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import React, { useCallback } from 'react';
import { usePlayground } from '@flowgram.ai/free-layout-editor';
import { IconButton, Tooltip } from '@douyinfe/semi-ui';

const IconUnlock = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" style={{ fontSize: '16px' }}>
    <path
      d="M11.667 2a2.333 2.333 0 0 0-2.334 2.333V6h2c.737 0 1.334.597 1.334 1.333v6c0 .737-.597 1.334-1.334 1.334h-8A1.333 1.333 0 0 1 2 13.333v-6C2 6.597 2.597 6 3.333 6H8V4.333a3.667 3.667 0 1 1 7.333 0v1H14v-1A2.333 2.333 0 0 0 11.667 2ZM3.333 7.333v6h8v-6h-8Zm4 1.334c.369 0 .667.298.667.666v2a.667.667 0 1 1-1.333 0v-2c0-.368.298-.666.666-.666Z"
      fill="#000"
    ></path>
  </svg>
);

const IconLock = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" style={{ fontSize: '16px' }}>
    <path
      d="M12 4.667V6h.667C13.403 6 14 6.597 14 7.333v6c0 .737-.597 1.334-1.333 1.334H3.333A1.333 1.333 0 0 1 2 13.333v-6C2 6.597 2.597 6 3.333 6H4V4.667a4 4 0 1 1 8 0ZM8 2a2.667 2.667 0 0 0-2.667 2.667V6h5.334V4.667A2.667 2.667 0 0 0 8 2Zm4.667 11.333v-6H3.333v6h9.334Zm-4-2a.667.667 0 0 1-1.334 0v-2a.667.667 0 1 1 1.334 0v2Z"
      fill="#000"
    ></path>
  </svg>
);

export const Readonly = () => {
  const playground = usePlayground();
  const toggleReadonly = useCallback(() => {
    playground.config.readonly = !playground.config.readonly;
  }, [playground]);
  return playground.config.readonly ? (
    <Tooltip content="编辑模式">
      <IconButton theme="borderless" type="tertiary" icon={<IconLock />} onClick={toggleReadonly} />
    </Tooltip>
  ) : (
    <Tooltip content="只读模式">
      <IconButton theme="borderless" type="tertiary" icon={<IconUnlock />} onClick={toggleReadonly} />
    </Tooltip>
  );
};
