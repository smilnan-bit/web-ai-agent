// 共享协议类型与节点类型 → 全部从 @ysf/a2ui-core 导出，与访客端保持一致
export type {
  StyleToken,
  BindingValue,
  ResolvableText,
  NodeAction,
  TextNode,
  InputNode,
  ButtonNode,
  DividerNode,
  BadgeNode,
  ImageNode,
  SelectOption,
  SelectNode,
  ButtonGroupOption,
  ButtonGroupNode,
  ContainerNode,
  PreviewNode,
  PreviewSpec,
  RuntimeData,
} from '@ysf/a2ui-core';

import type { PreviewSpec } from '@ysf/a2ui-core';

// ——— 以下为 web-ai-agent 编辑器侧独有类型 ———

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  log?: string;
};

export type PresetTemplate = {
  id: string;
  name: string;
  description: string;
  spec: PreviewSpec;
};
