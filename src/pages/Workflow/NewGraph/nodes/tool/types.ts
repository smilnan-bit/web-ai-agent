/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import type { FlowNodeJSON } from '@flowgram.ai/free-layout-editor';

export interface ToolNodeJSON extends FlowNodeJSON {
  data: {
    title: string;
  };
}
