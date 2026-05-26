# 卡片编辑器实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 web-ai-agent 工程中新增"卡片编辑"路由，完整还原 a2ui MVP 的三栏编辑工作台功能。

**Architecture:** 新增一个路由页面 `/cardEditor`，内含三栏布局（结构数据面板 / 预览效果 / 聊天窗口）。核心逻辑从 a2ui 移植并适配当前工程的 React 18 + TypeScript 4.9 + Ant Design 4 + twin.macro 技术栈。所有类型、工具函数、渲染器、模板数据作为独立模块放在页面目录下，页面组件用 useState 管理本地状态，API 调用复用 `src/utils/fetch.ts`。

**Tech Stack:** React 18.2, TypeScript 4.9, Ant Design 4.24, twin.macro 3.4, react-json-view 1.21

---

## 文件结构

```
src/pages/CardEditor/                  # 页面根目录
├── index.tsx                          # 路由入口，三栏布局组件
├── types.ts                           # 核心类型定义 (PreviewSpec, PreviewNode 等)
├── constants.ts                       # 预设模板数据、默认运行时数据、常量
├── utils/
│   ├── normalize-spec.ts              # Spec 节点 ID 规范化
│   ├── resolve-binding.ts             # 动态绑定值解析
│   ├── runtime-data.ts                # 运行时数据管理（collect/get/set）
│   └── chat-response.ts              # LLM 响应解析与容错
├── components/
│   ├── SpecPreview.tsx                # 递归 JSON-to-UI 预览渲染器
│   ├── StructurePanel.tsx             # 左栏：JSON 面板 + 动态数据面板
│   └── ChatPanel.tsx                  # 右栏：聊天消息列表 + 输入
├── api.ts                             # 卡片编辑相关 API 函数
└── styles.ts                          # twin.macro 样式常量（可选抽取）

src/routes/index.tsx                   # 修改：新增 cardEditor 路由
```

---

## Task 1: 核心类型定义

**Files:**

- Create: `src/pages/CardEditor/types.ts`

- [ ] **Step 1: 创建类型定义文件**

从 a2ui 的 `shared/lib/types.ts` 移植，适配 TypeScript 4.9 语法（去掉 `satisfies` 等 5.0+ 语法）。

```typescript
// src/pages/CardEditor/types.ts

export type StyleToken = {
  width?: string;
  maxWidth?: string;
  minHeight?: string;
  padding?: string;
  gap?: string;
  radius?: string;
  background?: string;
  color?: string;
  border?: string;
  shadow?: string;
  align?: 'left' | 'center' | 'right';
  justify?: 'start' | 'center' | 'end' | 'between';
  fontSize?: string;
  fontWeight?: string;
};

export type BindingValue = {
  binding: string;
  fallback?: string;
};

export type ResolvableText = string | BindingValue;

export type NodeAction = {
  type: 'emit' | 'navigate' | 'submit';
  name: string;
  payload?: Record<string, string>;
};

export type TextNode = {
  type: 'text';
  id?: string;
  text: ResolvableText;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3';
  style?: StyleToken;
};

export type InputNode = {
  type: 'input';
  id?: string;
  name: string;
  label?: ResolvableText;
  placeholder?: ResolvableText;
  value?: ResolvableText;
  inputType?: 'text' | 'password' | 'email';
  style?: StyleToken;
};

export type ButtonNode = {
  type: 'button';
  id?: string;
  label: ResolvableText;
  variant?: 'primary' | 'secondary';
  action?: NodeAction;
  style?: StyleToken;
};

export type DividerNode = {
  type: 'divider';
  id?: string;
  style?: StyleToken;
};

export type BadgeNode = {
  type: 'badge';
  id?: string;
  label: ResolvableText;
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  style?: StyleToken;
};

export type ImageNode = {
  type: 'image';
  id?: string;
  src: ResolvableText;
  alt?: ResolvableText;
  fit?: 'cover' | 'contain';
  style?: StyleToken;
};

export type IconNode = {
  type: 'icon';
  id?: string;
  name: ResolvableText;
  style?: StyleToken;
};

export type ContainerNode = {
  type: 'page' | 'card' | 'column' | 'row';
  id?: string;
  children: PreviewNode[];
  style?: StyleToken;
};

export type PreviewNode =
  | TextNode
  | InputNode
  | ButtonNode
  | DividerNode
  | BadgeNode
  | ImageNode
  | IconNode
  | ContainerNode;

export type PreviewSpec = {
  version: string;
  theme: {
    accent: string;
    canvas: string;
    panel: string;
    text: string;
    muted: string;
  };
  root: PreviewNode;
};

export type RuntimeData = Record<string, unknown>;

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
```

- [ ] **Step 2: 验证类型编译**

Run: `npx tsc --noEmit src/pages/CardEditor/types.ts 2>&1 | head -20`
Expected: 无报错

- [ ] **Step 3: Commit**

```bash
git add src/pages/CardEditor/types.ts
git commit -m "feat(card-editor): add core type definitions"
```

---

## Task 2: 工具函数 — normalize-spec

**Files:**

- Create: `src/pages/CardEditor/utils/normalize-spec.ts`

- [ ] **Step 1: 创建 normalize-spec.ts**

从 a2ui 的 `shared/lib/normalize-spec.ts` 移植，import 路径改为相对路径。

```typescript
// src/pages/CardEditor/utils/normalize-spec.ts

import type { PreviewNode, PreviewSpec } from '../types';

type CounterMap = Record<string, number>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
}

function getLabelHint(node: PreviewNode): string {
  switch (node.type) {
    case 'text':
      return typeof node.text === 'string' ? node.text : node.text.fallback ?? '';
    case 'input':
      return typeof node.label === 'string' ? node.label : node.label?.fallback ?? node.name;
    case 'button':
      return typeof node.label === 'string' ? node.label : node.label?.fallback ?? '';
    case 'badge':
      return typeof node.label === 'string' ? node.label : node.label?.fallback ?? '';
    case 'image':
      return typeof node.alt === 'string'
        ? node.alt
        : node.alt?.fallback ?? (typeof node.src === 'string' ? node.src : node.src.fallback ?? 'image');
    case 'icon':
      return typeof node.name === 'string' ? node.name : node.name?.fallback ?? 'icon';
    case 'divider':
      return 'divider';
    case 'page':
    case 'card':
    case 'column':
    case 'row':
      return node.type;
  }
}

function getExistingId(node: PreviewNode) {
  const candidate = node.id;
  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null;
}

function nextNodeId(node: PreviewNode, counters: CounterMap, used: Set<string>) {
  const base = slugify(getLabelHint(node)) || node.type;
  const id = `${node.type}-${base}`;
  counters[id] = (counters[id] ?? 0) + 1;

  let candidate = `${id}-${counters[id]}`;
  while (used.has(candidate)) {
    counters[id] += 1;
    candidate = `${id}-${counters[id]}`;
  }

  used.add(candidate);
  return candidate;
}

function normalizeNode(node: PreviewNode, counters: CounterMap, used: Set<string>): PreviewNode {
  const existingId = getExistingId(node);
  const normalizedId = existingId && !used.has(existingId) ? existingId : nextNodeId(node, counters, used);

  used.add(normalizedId);

  switch (node.type) {
    case 'page':
    case 'card':
    case 'column':
    case 'row':
      return {
        ...node,
        id: normalizedId,
        children: node.children.map((child) => normalizeNode(child, counters, used)),
      };
    default:
      return {
        ...node,
        id: normalizedId,
      };
  }
}

export function normalizeSpec(spec: PreviewSpec): PreviewSpec {
  const counters: CounterMap = {};
  const used = new Set<string>();

  return {
    ...spec,
    root: normalizeNode(spec.root, counters, used),
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/CardEditor/utils/normalize-spec.ts
git commit -m "feat(card-editor): add spec normalization utility"
```

---

## Task 3: 工具函数 — resolve-binding + runtime-data

**Files:**

- Create: `src/pages/CardEditor/utils/resolve-binding.ts`
- Create: `src/pages/CardEditor/utils/runtime-data.ts`

- [ ] **Step 1: 创建 resolve-binding.ts**

从 a2ui 的 `client/lib/resolve-binding.ts` 移植。

```typescript
// src/pages/CardEditor/utils/resolve-binding.ts

import type { BindingValue, PreviewNode, PreviewSpec, RuntimeData } from '../types';

function getPathValue(source: RuntimeData, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    return (current as Record<string, unknown>)[segment];
  }, source);
}

function resolveValue(value: string | BindingValue | undefined, runtimeData: RuntimeData): string | undefined {
  if (typeof value === 'string' || value === undefined) {
    return value;
  }

  const resolved = getPathValue(runtimeData, value.binding);

  if (resolved === undefined || resolved === null) {
    return value.fallback;
  }

  return String(resolved);
}

function resolveNode(node: PreviewNode, runtimeData: RuntimeData): PreviewNode {
  switch (node.type) {
    case 'text':
      return { ...node, text: resolveValue(node.text, runtimeData) ?? '' };
    case 'input':
      return {
        ...node,
        label: resolveValue(node.label, runtimeData),
        placeholder: resolveValue(node.placeholder, runtimeData),
        value: resolveValue(node.value, runtimeData),
      };
    case 'button':
      return { ...node, label: resolveValue(node.label, runtimeData) ?? '' };
    case 'badge':
      return { ...node, label: resolveValue(node.label, runtimeData) ?? '' };
    case 'image':
      return {
        ...node,
        src: resolveValue(node.src, runtimeData) ?? '',
        alt: resolveValue(node.alt, runtimeData),
      };
    case 'icon':
      return { ...node, name: resolveValue(node.name, runtimeData) ?? '' };
    case 'divider':
      return node;
    case 'page':
    case 'card':
    case 'column':
    case 'row':
      return {
        ...node,
        children: node.children
          .filter((child): child is PreviewNode => Boolean(child && typeof child === 'object' && 'type' in child))
          .map((child) => resolveNode(child, runtimeData)),
      };
  }
}

export function resolvePreviewSpec(spec: PreviewSpec, runtimeData: RuntimeData): PreviewSpec {
  return {
    ...spec,
    root: resolveNode(spec.root, runtimeData),
  };
}
```

- [ ] **Step 2: 创建 runtime-data.ts**

从 a2ui 的 `client/lib/runtime-data.ts` 移植。

```typescript
// src/pages/CardEditor/utils/runtime-data.ts

import type { BindingValue, PreviewNode, PreviewSpec, RuntimeData } from '../types';

export const defaultRuntimeData: RuntimeData = {
  user: { name: 'Alex Chen', email: 'alex.chen@acme.ai' },
  product: { title: 'AeroPulse Headphones', price: '$249' },
  order: { id: '#A23198', arrival: 'Tomorrow, 18:00 - 21:00' },
};

export function cloneRuntimeData(data: RuntimeData = defaultRuntimeData): RuntimeData {
  return JSON.parse(JSON.stringify(data)) as RuntimeData;
}

function readBinding(value: unknown): BindingValue | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  if (!('binding' in value) || typeof (value as BindingValue).binding !== 'string') {
    return null;
  }
  return value as BindingValue;
}

function collectFromNode(node: PreviewNode, result: Map<string, string>) {
  switch (node.type) {
    case 'text': {
      const binding = readBinding(node.text);
      if (binding) result.set(binding.binding, binding.fallback ?? '');
      return;
    }
    case 'input': {
      for (const field of [node.label, node.placeholder, node.value]) {
        const binding = readBinding(field);
        if (binding) result.set(binding.binding, binding.fallback ?? '');
      }
      return;
    }
    case 'button':
    case 'badge': {
      const binding = readBinding(node.label);
      if (binding) result.set(binding.binding, binding.fallback ?? '');
      return;
    }
    case 'image': {
      const srcBinding = readBinding(node.src);
      const altBinding = readBinding(node.alt);
      if (srcBinding) result.set(srcBinding.binding, srcBinding.fallback ?? '');
      if (altBinding) result.set(altBinding.binding, altBinding.fallback ?? '');
      return;
    }
    case 'icon': {
      const nameBinding = readBinding(node.name);
      if (nameBinding) result.set(nameBinding.binding, nameBinding.fallback ?? '');
      return;
    }
    case 'divider':
      return;
    case 'page':
    case 'card':
    case 'column':
    case 'row':
      node.children.forEach((child) => collectFromNode(child, result));
  }
}

export function collectBindings(spec: PreviewSpec): Array<{ path: string; fallback: string }> {
  const result = new Map<string, string>();
  collectFromNode(spec.root, result);
  return Array.from(result.entries()).map(([path, fallback]) => ({ path, fallback }));
}

export function getRuntimeValue(data: RuntimeData, path: string): string {
  const value = path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    return (current as Record<string, unknown>)[segment];
  }, data);

  return value == null ? '' : String(value);
}

export function setRuntimeValue(data: RuntimeData, path: string, value: string): RuntimeData {
  const next = cloneRuntimeData(data);
  const segments = path.split('.');
  let current: Record<string, unknown> = next;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    const existing = current[segment];
    if (!existing || typeof existing !== 'object') {
      current[segment] = {};
    }
    current = current[segment] as Record<string, unknown>;
  }

  current[segments[segments.length - 1]] = value;
  return next;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/CardEditor/utils/resolve-binding.ts src/pages/CardEditor/utils/runtime-data.ts
git commit -m "feat(card-editor): add binding resolution and runtime data utilities"
```

---

## Task 4: 工具函数 — chat-response（LLM 响应解析与容错）

**Files:**

- Create: `src/pages/CardEditor/utils/chat-response.ts`

- [ ] **Step 1: 创建 chat-response.ts**

从 a2ui 的 `client/lib/chat-response.ts` 移植。这是最复杂的工具函数，包含完整的 JSON 解析、spec 校验、sanitize 容错逻辑。

````typescript
// src/pages/CardEditor/utils/chat-response.ts

import type { NodeAction, PreviewNode, PreviewSpec, StyleToken } from '../types';
import { normalizeSpec } from './normalize-spec';

type ParsedModelPayload = {
  reply?: unknown;
  nextSpec?: unknown;
  log?: unknown;
};

export type ChatGenerationOutput = {
  reply: string;
  nextSpec: PreviewSpec;
  log: string;
};

function isNodeAction(value: unknown): value is NodeAction {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  const validType = candidate.type === 'emit' || candidate.type === 'navigate' || candidate.type === 'submit';

  if (!validType || typeof candidate.name !== 'string') return false;

  if ('payload' in candidate && candidate.payload != null) {
    if (typeof candidate.payload !== 'object' || Array.isArray(candidate.payload)) return false;
    return Object.values(candidate.payload as Record<string, unknown>).every((item) => typeof item === 'string');
  }

  return true;
}

function isStyleToken(value: unknown) {
  if (value == null) return true;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value as Record<string, unknown>).every((item) => item == null || typeof item === 'string');
}

function isPreviewNode(value: unknown): value is PreviewNode {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  if (typeof candidate.type !== 'string' || !isStyleToken(candidate.style)) return false;

  switch (candidate.type) {
    case 'text':
      return 'text' in candidate;
    case 'input':
      return typeof candidate.name === 'string';
    case 'button':
      return (
        'label' in candidate && (!('action' in candidate) || candidate.action == null || isNodeAction(candidate.action))
      );
    case 'divider':
      return true;
    case 'badge':
      return 'label' in candidate;
    case 'image':
      return 'src' in candidate;
    case 'icon':
      return 'name' in candidate;
    case 'page':
    case 'card':
    case 'column':
    case 'row':
      return Array.isArray(candidate.children) && candidate.children.every((child: unknown) => isPreviewNode(child));
    default:
      return false;
  }
}

function isPreviewSpec(value: unknown): value is PreviewSpec {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as PreviewSpec;
  return (
    typeof candidate.version === 'string' &&
    typeof candidate.theme?.accent === 'string' &&
    typeof candidate.theme?.canvas === 'string' &&
    typeof candidate.theme?.panel === 'string' &&
    typeof candidate.theme?.text === 'string' &&
    typeof candidate.theme?.muted === 'string' &&
    isStyleToken((candidate.root as Record<string, unknown>)?.style) &&
    isPreviewNode(candidate.root)
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function sanitizeString(value: unknown, fallback = '') {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function sanitizeStyleToken(value: unknown): StyleToken | undefined {
  const candidate = asRecord(value);
  if (!candidate) return undefined;
  const entries = Object.entries(candidate).flatMap(([key, item]) =>
    typeof item === 'string' ? ([[key, item]] as [string, string][]) : [],
  );
  return entries.length ? (Object.fromEntries(entries) as StyleToken) : undefined;
}

function sanitizeNodeAction(value: unknown): NodeAction | undefined {
  if (isNodeAction(value)) return value;
  return undefined;
}

function toPlaceholderTextNode(value: unknown, fallbackLabel = 'Unsupported node'): PreviewNode {
  const candidate = asRecord(value);
  const typeLabel = sanitizeString(candidate?.type, 'unknown');
  const label =
    sanitizeString(candidate?.label) ||
    sanitizeString(candidate?.name) ||
    sanitizeString(candidate?.title) ||
    sanitizeString(candidate?.text);

  return {
    type: 'text',
    text: `[${typeLabel}] ${label || fallbackLabel}`,
    as: 'p',
    style: { color: '#62708a', fontSize: '14px' },
  };
}

function sanitizePreviewNode(value: unknown): PreviewNode {
  const candidate = asRecord(value);
  if (!candidate || typeof candidate.type !== 'string') {
    return toPlaceholderTextNode(value, 'Invalid node');
  }

  const style = sanitizeStyleToken(candidate.style);

  switch (candidate.type) {
    case 'text':
      return {
        type: 'text',
        id: sanitizeString(candidate.id) || undefined,
        text: 'text' in candidate ? sanitizeString(candidate.text, '') : '',
        as:
          candidate.as === 'span' ||
          candidate.as === 'p' ||
          candidate.as === 'h1' ||
          candidate.as === 'h2' ||
          candidate.as === 'h3'
            ? candidate.as
            : undefined,
        style,
      };
    case 'input':
      return {
        type: 'input',
        id: sanitizeString(candidate.id) || undefined,
        name: sanitizeString(candidate.name, 'field'),
        label: sanitizeString(candidate.label) || undefined,
        placeholder: sanitizeString(candidate.placeholder) || undefined,
        value: sanitizeString(candidate.value) || undefined,
        inputType:
          candidate.inputType === 'password' || candidate.inputType === 'email' || candidate.inputType === 'text'
            ? candidate.inputType
            : undefined,
        style,
      };
    case 'button':
      return {
        type: 'button',
        id: sanitizeString(candidate.id) || undefined,
        label: sanitizeString(candidate.label, 'Button'),
        variant: candidate.variant === 'secondary' ? 'secondary' : 'primary',
        action: sanitizeNodeAction(candidate.action),
        style,
      };
    case 'divider':
      return { type: 'divider', id: sanitizeString(candidate.id) || undefined, style };
    case 'badge':
      return {
        type: 'badge',
        id: sanitizeString(candidate.id) || undefined,
        label: sanitizeString(candidate.label, 'Badge'),
        tone:
          candidate.tone === 'info' ||
          candidate.tone === 'success' ||
          candidate.tone === 'warning' ||
          candidate.tone === 'danger' ||
          candidate.tone === 'neutral'
            ? candidate.tone
            : undefined,
        style,
      };
    case 'image':
      return {
        type: 'image',
        id: sanitizeString(candidate.id) || undefined,
        src: sanitizeString(candidate.src, ''),
        alt: sanitizeString(candidate.alt) || undefined,
        fit: candidate.fit === 'contain' ? 'contain' : 'cover',
        style,
      };
    case 'icon':
      return {
        type: 'icon',
        id: sanitizeString(candidate.id) || undefined,
        name: sanitizeString(candidate.name, '•'),
        style,
      };
    case 'page':
    case 'card':
    case 'column':
    case 'row': {
      const rawChildren = Array.isArray(candidate.children) ? candidate.children : [];
      return {
        type: candidate.type,
        id: sanitizeString(candidate.id) || undefined,
        style,
        children: rawChildren.map((child: unknown) => sanitizePreviewNode(child)),
      };
    }
    default:
      return toPlaceholderTextNode(candidate, 'Unsupported node');
  }
}

function sanitizePreviewSpec(value: unknown, fallbackSpec: PreviewSpec): PreviewSpec | null {
  const candidate = asRecord(value);
  if (!candidate) return null;

  const theme = asRecord(candidate.theme);

  return normalizeSpec({
    version: sanitizeString(candidate.version, fallbackSpec.version),
    theme: {
      accent: sanitizeString(theme?.accent, fallbackSpec.theme.accent),
      canvas: sanitizeString(theme?.canvas, fallbackSpec.theme.canvas),
      panel: sanitizeString(theme?.panel, fallbackSpec.theme.panel),
      text: sanitizeString(theme?.text, fallbackSpec.theme.text),
      muted: sanitizeString(theme?.muted, fallbackSpec.theme.muted),
    },
    root: sanitizePreviewNode(candidate.root ?? fallbackSpec.root),
  });
}

function stripCodeFences(text: string) {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

function extractJsonObject(text: string) {
  const trimmed = stripCodeFences(text);

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function parseModelPayload(text: string): ParsedModelPayload {
  const jsonText = extractJsonObject(text);

  try {
    const parsed = JSON.parse(jsonText) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Model response is not a JSON object.');
    }
    return parsed as ParsedModelPayload;
  } catch (error) {
    throw new Error(
      `Failed to parse model JSON response: ${
        error instanceof Error ? error.message : 'Unknown error'
      }. Raw text: ${text}`,
    );
  }
}

export function resolveChatGeneration(responseText: string, fallbackSpec: PreviewSpec): ChatGenerationOutput {
  const payload = parseModelPayload(responseText);
  const reply = typeof payload.reply === 'string' ? payload.reply : null;
  const nextSpec = isPreviewSpec(payload.nextSpec)
    ? normalizeSpec(payload.nextSpec)
    : sanitizePreviewSpec(payload.nextSpec, fallbackSpec);
  const log = typeof payload.log === 'string' ? payload.log : '';

  if (!reply) {
    throw new Error('Model response must include a string reply.');
  }

  if (!nextSpec) {
    return {
      reply,
      nextSpec: normalizeSpec(fallbackSpec),
      log: log || 'Model response did not provide a valid nextSpec. Falling back to current spec.',
    };
  }

  return { reply, nextSpec, log };
}
````

注意：这里简化了 `resolveChatGeneration` 的入参，从接收 `LlmChatResponse` 对象改为直接接收 `responseText: string`，因为本工程不需要处理 AI SDK 的 finishReason/usage 元数据。

- [ ] **Step 2: Commit**

```bash
git add src/pages/CardEditor/utils/chat-response.ts
git commit -m "feat(card-editor): add LLM response parsing and sanitization"
```

---

## Task 5: 预设模板数据

**Files:**

- Create: `src/pages/CardEditor/constants.ts`

- [ ] **Step 1: 创建 constants.ts**

从 a2ui 的 `shared/lib/default-spec.ts` 移植 4 个预设模板的完整 JSON 数据。由于文件较长（约 600 行 spec 数据），这里列出关键结构，实际代码需要完整复制 a2ui 中的所有模板 spec。

```typescript
// src/pages/CardEditor/constants.ts

import type { PreviewSpec, PresetTemplate, RuntimeData } from './types';
import { normalizeSpec } from './utils/normalize-spec';

function cloneSpec(spec: PreviewSpec): PreviewSpec {
  return JSON.parse(JSON.stringify(spec)) as PreviewSpec;
}

const loginSpec: PreviewSpec = {
  version: '0.2.0',
  theme: {
    accent: '#6f72d8',
    canvas: 'linear-gradient(180deg, #ffffff 0%, #f7faff 100%)',
    panel: '#ffffff',
    text: '#162033',
    muted: '#62708a',
  },
  root: {
    type: 'page',
    id: 'login-page',
    style: { minHeight: '100%', padding: '16px' },
    children: [
      {
        type: 'card',
        id: 'login-card',
        style: {
          width: '100%',
          maxWidth: '420px',
          padding: '24px',
          radius: '24px',
          background: '#ffffff',
          shadow: '0 14px 36px rgba(49, 69, 104, 0.10)',
        },
        children: [
          {
            type: 'column',
            id: 'login-content',
            style: { gap: '10px' },
            children: [
              {
                type: 'text',
                id: 'title',
                text: { binding: 'user.name', fallback: 'Welcome back' },
                as: 'h1',
                style: { fontSize: '36px', fontWeight: '700' },
              },
              {
                type: 'text',
                id: 'subtitle',
                text: 'Sign in to your workspace account',
                as: 'p',
                style: { color: '#62708a', fontSize: '16px' },
              },
              {
                type: 'input',
                id: 'email',
                name: 'email',
                label: 'Email',
                placeholder: { binding: 'user.email', fallback: 'Please enter your email' },
                inputType: 'email',
              },
              {
                type: 'input',
                id: 'password',
                name: 'password',
                label: 'Password',
                placeholder: 'Please enter your password',
                inputType: 'password',
              },
              {
                type: 'row',
                id: 'actions',
                style: { justify: 'start', gap: '10px', padding: '4px 0 0' },
                children: [
                  {
                    type: 'button',
                    id: 'sign-in',
                    label: 'Sign in',
                    variant: 'primary',
                    style: { padding: '10px 18px' },
                  },
                ],
              },
              { type: 'divider', id: 'divider' },
              {
                type: 'row',
                id: 'footer-actions',
                style: { justify: 'between', gap: '10px' },
                children: [
                  {
                    type: 'text',
                    id: 'signup-copy',
                    text: "Don't have an account?",
                    as: 'p',
                    style: { color: '#62708a', fontSize: '14px' },
                  },
                  {
                    type: 'button',
                    id: 'sign-up',
                    label: 'Create account',
                    variant: 'secondary',
                    style: { padding: '10px 16px' },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

// blankSpec, productSpec, orderSpec: 完整复制 a2ui/shared/lib/default-spec.ts 中的对应对象
// （此处省略以节约计划篇幅，实现时需完整复制）

const blankSpec: PreviewSpec = {
  version: '0.2.0',
  theme: {
    accent: '#4a7bff',
    canvas: 'linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)',
    panel: '#ffffff',
    text: '#162033',
    muted: '#7b88a1',
  },
  root: {
    type: 'page',
    id: 'blank-page',
    style: { minHeight: '100%', padding: '16px' },
    children: [
      {
        type: 'card',
        id: 'blank-card',
        style: {
          width: '100%',
          maxWidth: '460px',
          padding: '20px',
          radius: '18px',
          background: '#ffffff',
          shadow: '0 10px 24px rgba(48, 84, 150, 0.08)',
        },
        children: [
          {
            type: 'column',
            id: 'blank-content',
            style: { gap: '8px' },
            children: [
              {
                type: 'text',
                id: 'blank-title',
                text: 'Blank canvas',
                as: 'h1',
                style: { fontSize: '24px', fontWeight: '700' },
              },
              {
                type: 'text',
                id: 'blank-subtitle',
                text: 'No preset content.',
                as: 'p',
                style: { color: '#7b88a1', fontSize: '14px' },
              },
            ],
          },
        ],
      },
    ],
  },
};

const productSpec: PreviewSpec = {
  version: '0.2.0',
  theme: {
    accent: '#ff6a3d',
    canvas: 'linear-gradient(180deg, #fff8f2 0%, #fff1e8 100%)',
    panel: '#fffdfb',
    text: '#221b16',
    muted: '#7f6858',
  },
  root: {
    type: 'page',
    id: 'product-page',
    style: { minHeight: '100%', padding: '16px' },
    children: [
      {
        type: 'card',
        id: 'product-card',
        style: {
          width: '100%',
          maxWidth: '430px',
          padding: '22px',
          radius: '22px',
          background: '#fffdfb',
          shadow: '0 16px 40px rgba(140, 77, 34, 0.10)',
        },
        children: [
          {
            type: 'column',
            id: 'product-content',
            style: { gap: '12px' },
            children: [
              {
                type: 'text',
                id: 'badge',
                text: 'SPRING DROP',
                as: 'p',
                style: { color: '#ff6a3d', fontSize: '12px', fontWeight: '700' },
              },
              {
                type: 'card',
                id: 'product-image-block',
                style: {
                  padding: '18px',
                  radius: '18px',
                  background: 'linear-gradient(135deg, #ffe2d2 0%, #fff4ec 100%)',
                },
                children: [
                  {
                    type: 'column',
                    id: 'product-image-content',
                    style: { gap: '8px' },
                    children: [
                      {
                        type: 'text',
                        id: 'image-title',
                        text: 'AeroPulse Headphones',
                        as: 'h2',
                        style: { fontSize: '24px', fontWeight: '700' },
                      },
                      {
                        type: 'text',
                        id: 'image-subtitle',
                        text: 'Wireless noise cancellation with 32-hour battery life',
                        as: 'p',
                        style: { color: '#7f6858', fontSize: '14px' },
                      },
                    ],
                  },
                ],
              },
              {
                type: 'row',
                id: 'price-row',
                style: { justify: 'between', gap: '10px' },
                children: [
                  { type: 'text', id: 'price', text: '$249', as: 'h2', style: { fontSize: '28px', fontWeight: '700' } },
                  {
                    type: 'text',
                    id: 'price-note',
                    text: 'Free shipping today',
                    as: 'p',
                    style: { color: '#7f6858', fontSize: '14px' },
                  },
                ],
              },
              {
                type: 'row',
                id: 'cta-row',
                style: { gap: '10px', justify: 'between' },
                children: [
                  {
                    type: 'button',
                    id: 'buy-now',
                    label: 'Buy now',
                    variant: 'primary',
                    style: { padding: '10px 16px' },
                  },
                  {
                    type: 'button',
                    id: 'add-cart',
                    label: 'Add to cart',
                    variant: 'secondary',
                    style: { padding: '10px 16px' },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

const orderSpec: PreviewSpec = {
  version: '0.2.0',
  theme: {
    accent: '#1f7a5f',
    canvas: 'linear-gradient(180deg, #f4fbf8 0%, #edf7f3 100%)',
    panel: '#ffffff',
    text: '#162a22',
    muted: '#668074',
  },
  root: {
    type: 'page',
    id: 'order-page',
    style: { minHeight: '100%', padding: '16px' },
    children: [
      {
        type: 'card',
        id: 'order-card',
        style: {
          width: '100%',
          maxWidth: '460px',
          padding: '22px',
          radius: '22px',
          background: '#ffffff',
          shadow: '0 16px 40px rgba(45, 95, 77, 0.10)',
        },
        children: [
          {
            type: 'column',
            id: 'order-content',
            style: { gap: '12px' },
            children: [
              {
                type: 'row',
                id: 'order-header',
                style: { justify: 'between', gap: '8px' },
                children: [
                  {
                    type: 'text',
                    id: 'order-title',
                    text: { binding: 'order.id', fallback: 'Order #A23198' },
                    as: 'h2',
                    style: { fontSize: '24px', fontWeight: '700' },
                  },
                  {
                    type: 'button',
                    id: 'status',
                    label: 'Shipped',
                    variant: 'secondary',
                    style: { padding: '8px 12px' },
                  },
                ],
              },
              {
                type: 'text',
                id: 'order-subtitle',
                text: { binding: 'order.arrival', fallback: 'Estimated arrival: Tomorrow, 18:00 - 21:00' },
                as: 'p',
                style: { color: '#668074', fontSize: '14px' },
              },
              { type: 'divider', id: 'order-divider-1' },
              {
                type: 'row',
                id: 'order-item-row',
                style: { justify: 'between', gap: '10px' },
                children: [
                  {
                    type: 'column',
                    id: 'order-item-info',
                    style: { gap: '6px' },
                    children: [
                      {
                        type: 'text',
                        id: 'order-item-name',
                        text: 'AeroPulse Headphones',
                        as: 'h3',
                        style: { fontSize: '18px', fontWeight: '700' },
                      },
                      {
                        type: 'text',
                        id: 'order-item-meta',
                        text: 'Midnight Black · Qty 1',
                        as: 'p',
                        style: { color: '#668074', fontSize: '14px' },
                      },
                    ],
                  },
                  {
                    type: 'text',
                    id: 'order-total',
                    text: '$249',
                    as: 'h3',
                    style: { fontSize: '18px', fontWeight: '700' },
                  },
                ],
              },
              { type: 'divider', id: 'order-divider-2' },
              {
                type: 'column',
                id: 'order-detail-list',
                style: { gap: '8px' },
                children: [
                  {
                    type: 'text',
                    id: 'shipping-title',
                    text: 'Shipping address',
                    as: 'h3',
                    style: { fontSize: '16px', fontWeight: '700' },
                  },
                  {
                    type: 'text',
                    id: 'shipping-body',
                    text: 'Ling Chen · 188 0000 0000\n88 Century Avenue, Pudong, Shanghai',
                    as: 'p',
                    style: { color: '#668074', fontSize: '14px' },
                  },
                ],
              },
              {
                type: 'row',
                id: 'order-action-row',
                style: { gap: '10px', justify: 'between', padding: '4px 0 0' },
                children: [
                  {
                    type: 'button',
                    id: 'track-order',
                    label: 'Track order',
                    variant: 'primary',
                    style: { padding: '10px 16px' },
                  },
                  {
                    type: 'button',
                    id: 'contact-support',
                    label: 'Contact support',
                    variant: 'secondary',
                    style: { padding: '10px 16px' },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

export const presetTemplates: PresetTemplate[] = [
  { id: 'blank', name: '空白', description: '从空白画布开始', spec: blankSpec },
  { id: 'login', name: '登录', description: '品牌感登录卡片', spec: loginSpec },
  { id: 'product', name: '商品卡片', description: '偏电商展示与转化', spec: productSpec },
  { id: 'order', name: '订单信息', description: '后台信息卡片', spec: orderSpec },
];

export const defaultSpec = normalizeSpec(cloneSpec(loginSpec));

export function getPresetSpec(presetId: string): PreviewSpec {
  const preset = presetTemplates.find((item) => item.id === presetId)?.spec ?? loginSpec;
  return normalizeSpec(cloneSpec(preset));
}

export const THINKING_MESSAGE_ID = 'assistant-thinking';

export const starterMessages = [
  {
    id: 'assistant-1',
    role: 'assistant' as const,
    content: '你好！我是 AI 卡片编辑助手。你可以试试：把标题改成中文、主题色改成粉色、增加一个表单字段。',
    log: JSON.stringify({ stage: 'init', message: 'Default login card loaded.' }, null, 2),
  },
];

export { cloneSpec };
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/CardEditor/constants.ts
git commit -m "feat(card-editor): add preset templates and constants"
```

---

## Task 6: API 函数

**Files:**

- Create: `src/pages/CardEditor/api.ts`

- [ ] **Step 1: 创建 api.ts**

按照项目 API 编写规范（`src/api/` 下的模式），使用 `request` 封装。MVP 阶段后端 API 路径待定，先使用占位路径。

```typescript
// src/pages/CardEditor/api.ts

import type { RequestResultType } from '@/utils';
import { request } from '@/utils';
import type { ChatMessage, PreviewSpec } from './types';

export interface ChatRequestData {
  message: string;
  currentSpec?: PreviewSpec;
  messages: ChatMessage[];
}

export interface ChatResponseData {
  text: string;
}

export interface SaveRequestData {
  spec: PreviewSpec;
}

export const sendChat: (data: ChatRequestData) => RequestResultType<ChatResponseData> = (data) => {
  return request('/agent/api/card/chat', { method: 'post', data });
};

export const saveCardSpec: (data: SaveRequestData) => RequestResultType = (data) => {
  return request('/agent/api/card/save', { method: 'post', data });
};
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/CardEditor/api.ts
git commit -m "feat(card-editor): add API functions for chat and save"
```

---

## Task 7: 预览渲染器组件

**Files:**

- Create: `src/pages/CardEditor/components/SpecPreview.tsx`

- [ ] **Step 1: 创建 SpecPreview.tsx**

从 a2ui 的 `client/components/spec-preview.tsx` 移植，改用 twin.macro 写样式，去掉 `"use client"` 指令（非 Next.js），适配 React 18 类型。

```typescript
// src/pages/CardEditor/components/SpecPreview.tsx

import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { resolvePreviewSpec } from '../utils/resolve-binding';
import type {
  BadgeNode,
  ButtonNode,
  ContainerNode,
  DividerNode,
  IconNode,
  ImageNode,
  InputNode,
  PreviewNode,
  PreviewSpec,
  RuntimeData,
  StyleToken,
  TextNode,
} from '../types';

function toCssVars(theme: PreviewSpec['theme']): CSSProperties {
  return {
    '--theme-accent': theme.accent,
    '--theme-canvas': theme.canvas,
    '--theme-panel': theme.panel,
    '--theme-text': theme.text,
    '--theme-muted': theme.muted,
  } as CSSProperties;
}

function mapStyles(style?: StyleToken): CSSProperties {
  if (!style) return {};
  return {
    width: style.width,
    maxWidth: style.maxWidth,
    minHeight: style.minHeight,
    padding: style.padding,
    gap: style.gap,
    borderRadius: style.radius,
    background: style.background,
    color: style.color,
    border: style.border,
    boxShadow: style.shadow,
    textAlign: style.align as CSSProperties['textAlign'],
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
  };
}

function getJustifyContent(value: StyleToken['justify']): string {
  switch (value) {
    case 'center':
      return 'center';
    case 'end':
      return 'flex-end';
    case 'between':
      return 'space-between';
    default:
      return 'flex-start';
  }
}

function getNodeRenderKey(node: PreviewNode, fallbackKey?: string) {
  return node.id ?? fallbackKey ?? node.type;
}

function renderText(node: TextNode, renderKey?: string) {
  const Tag = (node.as ?? 'p') as keyof JSX.IntrinsicElements;
  const content = typeof node.text === 'string' ? node.text : node.text.fallback ?? '';
  return (
    <Tag key={renderKey} style={{ margin: 0, ...mapStyles(node.style) }}>
      {content}
    </Tag>
  );
}

function renderInput(node: InputNode, renderKey?: string) {
  const label = typeof node.label === 'string' ? node.label : node.label?.fallback;
  const placeholder = typeof node.placeholder === 'string' ? node.placeholder : node.placeholder?.fallback;
  const value = typeof node.value === 'string' ? node.value : node.value?.fallback;

  return (
    <label key={renderKey} tw="flex flex-col gap-1" style={mapStyles(node.style)}>
      {label ? (
        <span tw="text-[13px] font-medium" style={{ color: 'var(--theme-text)' }}>
          {label}
        </span>
      ) : null}
      <input
        tw="w-full rounded-lg border border-[rgba(0,0,0,0.12)] px-3 py-2 text-[14px] outline-none bg-white"
        defaultValue={value}
        name={node.name}
        placeholder={placeholder}
        readOnly
        type={node.inputType ?? 'text'}
      />
    </label>
  );
}

function renderDivider(node: DividerNode, renderKey?: string) {
  return <div key={renderKey} tw="w-full h-px" style={{ background: 'rgba(0,0,0,0.08)', ...mapStyles(node.style) }} />;
}

function renderBadge(node: BadgeNode, renderKey?: string) {
  const label = typeof node.label === 'string' ? node.label : node.label?.fallback ?? '';
  const toneColors: Record<string, { bg: string; color: string }> = {
    neutral: { bg: 'rgba(0,0,0,0.06)', color: '#666' },
    info: { bg: '#e0f2fe', color: '#0369a1' },
    success: { bg: '#dcfce7', color: '#15803d' },
    warning: { bg: '#fef9c3', color: '#a16207' },
    danger: { bg: '#fee2e2', color: '#b91c1c' },
  };
  const tone = toneColors[node.tone ?? 'neutral'] ?? toneColors.neutral;

  return (
    <span
      key={renderKey}
      tw="inline-block rounded-full px-3 py-1 text-[12px] font-semibold"
      style={{ background: tone.bg, color: tone.color, ...mapStyles(node.style) }}
    >
      {label}
    </span>
  );
}

function renderImage(node: ImageNode, renderKey?: string) {
  const src = typeof node.src === 'string' ? node.src : node.src.fallback ?? '';
  const alt = typeof node.alt === 'string' ? node.alt : node.alt?.fallback ?? '';

  return (
    <img
      key={renderKey}
      tw="w-full rounded-lg"
      alt={alt}
      src={src || 'https://placehold.co/600x400/e9eef8/62708a?text=Preview'}
      style={{ objectFit: node.fit ?? 'cover', ...mapStyles(node.style) }}
    />
  );
}

function renderIcon(node: IconNode, renderKey?: string) {
  const content = typeof node.name === 'string' ? node.name : node.name?.fallback ?? '';
  return (
    <span key={renderKey} tw="text-[18px]" style={mapStyles(node.style)}>
      {content}
    </span>
  );
}

function renderNode(
  node: PreviewNode | null | undefined,
  fallbackKey?: string,
  onAction?: (node: ButtonNode) => void,
): React.ReactElement {
  if (!node || typeof node !== 'object' || !('type' in node)) {
    return <div key={fallbackKey ?? 'invalid-node'} />;
  }

  switch (node.type) {
    case 'text':
      return renderText(node, getNodeRenderKey(node, fallbackKey));
    case 'input':
      return renderInput(node, getNodeRenderKey(node, fallbackKey));
    case 'button': {
      const label = typeof node.label === 'string' ? node.label : node.label?.fallback ?? '';
      const isPrimary = node.variant !== 'secondary';
      return (
        <button
          key={getNodeRenderKey(node, fallbackKey)}
          tw="rounded-lg px-4 py-2 text-[14px] font-medium cursor-pointer border-none outline-none transition-opacity hover:opacity-80"
          style={{
            background: isPrimary ? 'var(--theme-accent)' : 'transparent',
            color: isPrimary ? '#fff' : 'var(--theme-accent)',
            border: isPrimary ? 'none' : '1px solid var(--theme-accent)',
            ...mapStyles(node.style),
          }}
          type="button"
          onClick={() => onAction?.(node)}
        >
          {label}
        </button>
      );
    }
    case 'badge':
      return renderBadge(node, getNodeRenderKey(node, fallbackKey));
    case 'image':
      return renderImage(node, getNodeRenderKey(node, fallbackKey));
    case 'icon':
      return renderIcon(node, getNodeRenderKey(node, fallbackKey));
    case 'divider':
      return renderDivider(node, getNodeRenderKey(node, fallbackKey));
    case 'page':
      return (
        <div
          key={getNodeRenderKey(node, fallbackKey)}
          tw="grid place-items-center w-full"
          style={{ background: 'var(--theme-canvas)', ...mapStyles(node.style) }}
        >
          {node.children.map((child, i) => renderNode(child, `${getNodeRenderKey(node, fallbackKey)}-${i}`, onAction))}
        </div>
      );
    case 'card':
      return (
        <div
          key={getNodeRenderKey(node, fallbackKey)}
          tw="rounded-2xl"
          style={{ background: 'var(--theme-panel)', ...mapStyles(node.style) }}
        >
          {node.children.map((child, i) => renderNode(child, `${getNodeRenderKey(node, fallbackKey)}-${i}`, onAction))}
        </div>
      );
    case 'column':
      return (
        <div key={getNodeRenderKey(node, fallbackKey)} tw="flex flex-col" style={mapStyles(node.style)}>
          {node.children.map((child, i) => renderNode(child, `${getNodeRenderKey(node, fallbackKey)}-${i}`, onAction))}
        </div>
      );
    case 'row':
      return (
        <div
          key={getNodeRenderKey(node, fallbackKey)}
          tw="flex flex-row items-center"
          style={{ justifyContent: getJustifyContent(node.style?.justify), ...mapStyles(node.style) }}
        >
          {node.children.map((child, i) => renderNode(child, `${getNodeRenderKey(node, fallbackKey)}-${i}`, onAction))}
        </div>
      );
    default:
      return <div key={fallbackKey ?? 'unknown-node'} />;
  }
}

interface SpecPreviewProps {
  spec: PreviewSpec;
  runtimeData: RuntimeData;
}

const SpecPreview: React.FC<SpecPreviewProps> = ({ spec, runtimeData }) => {
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const resolvedSpec = resolvePreviewSpec(spec, runtimeData);

  const handleAction = (node: ButtonNode) => {
    if (!node.action) return;
    const payload = node.action.payload ? ` ${JSON.stringify(node.action.payload)}` : '';
    setActionMessage(`[${node.action.type}] ${node.action.name} @ ${node.id ?? 'anonymous'}${payload}`);
  };

  return (
    <div
      tw="relative overflow-auto h-full rounded-lg"
      style={{ ...toCssVars(resolvedSpec.theme), color: 'var(--theme-text)' }}
    >
      {renderNode(resolvedSpec.root, undefined, handleAction)}
      {actionMessage ? (
        <div tw="absolute bottom-2 left-2 right-2 rounded-lg bg-[rgba(0,0,0,0.75)] text-white text-[12px] px-3 py-2 font-mono">
          {actionMessage}
        </div>
      ) : null}
    </div>
  );
};

export default SpecPreview;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/CardEditor/components/SpecPreview.tsx
git commit -m "feat(card-editor): add recursive spec preview renderer"
```

---

## Task 8: 左栏 — 结构数据面板

**Files:**

- Create: `src/pages/CardEditor/components/StructurePanel.tsx`

- [ ] **Step 1: 创建 StructurePanel.tsx**

包含 JSON 面板（使用 `react-json-view`）和动态数据面板。

```typescript
// src/pages/CardEditor/components/StructurePanel.tsx

import React, { useCallback, useMemo } from 'react';
import ReactJson from 'react-json-view';
import { Button, Input } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import type { PreviewSpec, RuntimeData } from '../types';
import { collectBindings, getRuntimeValue, setRuntimeValue } from '../utils/runtime-data';

type JsonExpandMode = 'default' | 'all' | 'collapsed';

interface StructurePanelProps {
  spec: PreviewSpec;
  runtimeData: RuntimeData;
  onRuntimeDataChange: (data: RuntimeData) => void;
  isJsonPanelCollapsed: boolean;
  onJsonPanelToggle: () => void;
  isRuntimePanelCollapsed: boolean;
  onRuntimePanelToggle: () => void;
  jsonExpandMode: JsonExpandMode;
  onJsonExpandModeChange: (mode: JsonExpandMode) => void;
  onResetRuntimeData: () => void;
}

const StructurePanel: React.FC<StructurePanelProps> = ({
  spec,
  runtimeData,
  onRuntimeDataChange,
  isJsonPanelCollapsed,
  onJsonPanelToggle,
  isRuntimePanelCollapsed,
  onRuntimePanelToggle,
  jsonExpandMode,
  onJsonExpandModeChange,
  onResetRuntimeData,
}) => {
  const bindings = useMemo(() => collectBindings(spec), [spec]);

  const jsonCollapseLevel = useMemo(() => {
    if (jsonExpandMode === 'all') return false;
    if (jsonExpandMode === 'collapsed') return 1;
    return 2;
  }, [jsonExpandMode]);

  const handleRuntimeValueChange = useCallback(
    (path: string, value: string) => {
      onRuntimeDataChange(setRuntimeValue(runtimeData, path, value));
    },
    [runtimeData, onRuntimeDataChange],
  );

  return (
    <div tw="flex flex-col h-full overflow-hidden">
      {/* JSON 面板 */}
      <div tw="flex flex-col" style={{ flex: isJsonPanelCollapsed ? '0 0 auto' : '1 1 0', minHeight: 0 }}>
        <div tw="flex items-center justify-between px-3 py-2 border-b border-[rgba(0,0,0,0.06)]">
          <span tw="text-[13px] font-semibold">实时 JSON</span>
          <div tw="flex items-center gap-1">
            {!isJsonPanelCollapsed && (
              <>
                <Button size="small" type="text" onClick={() => onJsonExpandModeChange('all')}>
                  全部展开
                </Button>
                <Button size="small" type="text" onClick={() => onJsonExpandModeChange('collapsed')}>
                  全部折叠
                </Button>
              </>
            )}
            <Button
              size="small"
              type="text"
              icon={isJsonPanelCollapsed ? <DownOutlined /> : <UpOutlined />}
              onClick={onJsonPanelToggle}
            />
          </div>
        </div>
        {!isJsonPanelCollapsed && (
          <div tw="flex-1 overflow-auto p-2 text-[12px]" style={{ minHeight: 0 }}>
            <ReactJson
              src={spec}
              name={false}
              collapsed={jsonCollapseLevel}
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={false}
              style={{ fontFamily: 'monospace', fontSize: 12, background: 'transparent' }}
            />
          </div>
        )}
      </div>

      {/* 动态数据面板 */}
      <div
        tw="flex flex-col border-t border-[rgba(0,0,0,0.06)]"
        style={{ flex: isRuntimePanelCollapsed ? '0 0 auto' : '0 0 240px' }}
      >
        <div tw="flex items-center justify-between px-3 py-2 border-b border-[rgba(0,0,0,0.06)]">
          <span tw="text-[13px] font-semibold">动态数据</span>
          <div tw="flex items-center gap-1">
            {!isRuntimePanelCollapsed && (
              <Button size="small" type="text" onClick={onResetRuntimeData}>
                重置数据
              </Button>
            )}
            <Button
              size="small"
              type="text"
              icon={isRuntimePanelCollapsed ? <DownOutlined /> : <UpOutlined />}
              onClick={onRuntimePanelToggle}
            />
          </div>
        </div>
        {!isRuntimePanelCollapsed && (
          <div tw="flex-1 overflow-auto p-3 flex flex-col gap-2" style={{ minHeight: 0 }}>
            {bindings.length > 0 ? (
              bindings.map((binding) => (
                <label tw="flex flex-col gap-1" key={binding.path}>
                  <span tw="text-[12px] text-[rgba(0,0,0,0.45)] font-mono">{binding.path}</span>
                  <Input
                    size="small"
                    value={getRuntimeValue(runtimeData, binding.path)}
                    placeholder={binding.fallback || '请输入动态值'}
                    onChange={(e) => handleRuntimeValueChange(binding.path, e.target.value)}
                  />
                </label>
              ))
            ) : (
              <div tw="text-[13px] text-[rgba(0,0,0,0.25)] text-center py-4">当前模板没有动态绑定字段</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StructurePanel;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/CardEditor/components/StructurePanel.tsx
git commit -m "feat(card-editor): add structure panel with JSON viewer and runtime data editor"
```

---

## Task 9: 右栏 — 聊天面板

**Files:**

- Create: `src/pages/CardEditor/components/ChatPanel.tsx`

- [ ] **Step 1: 创建 ChatPanel.tsx**

聊天消息列表 + 输入框 + 发送按钮。

```typescript
// src/pages/CardEditor/components/ChatPanel.tsx

import React, { useEffect, useRef } from 'react';
import { Button, Input } from 'antd';
import { SendOutlined, LoadingOutlined } from '@ant-design/icons';
import type { ChatMessage } from '../types';
import { THINKING_MESSAGE_ID } from '../constants';

const { TextArea } = Input;

interface ChatPanelProps {
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  loading: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, input, onInputChange, onSend, loading }) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div tw="flex flex-col h-full overflow-hidden">
      {/* 消息列表 */}
      <div ref={listRef} tw="flex-1 overflow-auto p-3 flex flex-col gap-3" style={{ minHeight: 0 }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            tw="max-w-[85%] rounded-lg px-3 py-2 text-[14px] leading-relaxed whitespace-pre-wrap"
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background: msg.role === 'user' ? 'var(--primary-color, #337eff)' : 'rgba(0,0,0,0.04)',
              color: msg.role === 'user' ? '#fff' : 'rgba(0,0,0,0.85)',
            }}
          >
            {msg.id === THINKING_MESSAGE_ID ? (
              <span tw="flex items-center gap-2">
                <LoadingOutlined />
                {msg.content}
              </span>
            ) : (
              msg.content
            )}
          </div>
        ))}
      </div>

      {/* 输入区 */}
      <div tw="flex-shrink-0 border-t border-[rgba(0,0,0,0.06)] p-3 flex gap-2">
        <TextArea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="请输入，例如：把标题改成中文，主题色改成粉色"
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={loading}
          tw="flex-1"
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={onSend}
          disabled={loading || !input.trim()}
          loading={loading}
        >
          发送
        </Button>
      </div>
    </div>
  );
};

export default ChatPanel;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/CardEditor/components/ChatPanel.tsx
git commit -m "feat(card-editor): add chat panel component"
```

---

## Task 10: 页面主组件（三栏布局）

**Files:**

- Create: `src/pages/CardEditor/index.tsx`

- [ ] **Step 1: 创建页面主组件**

三栏布局，组合所有子组件，管理所有状态。

```typescript
// src/pages/CardEditor/index.tsx

import React, { useCallback, useState } from 'react';
import { Button, message } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import Breadcrumbs from '@/components/Breadcrumbs';
import ContentWrapper from '@/components/ContenWrapper';
import SpecPreview from './components/SpecPreview';
import StructurePanel from './components/StructurePanel';
import ChatPanel from './components/ChatPanel';
import {
  defaultSpec,
  getPresetSpec,
  presetTemplates,
  starterMessages,
  THINKING_MESSAGE_ID,
  cloneSpec,
} from './constants';
import { cloneRuntimeData, defaultRuntimeData } from './utils/runtime-data';
import { normalizeSpec } from './utils/normalize-spec';
import { resolveChatGeneration } from './utils/chat-response';
import { sendChat, saveCardSpec } from './api';
import type { ChatMessage, PreviewSpec, RuntimeData } from './types';

type JsonExpandMode = 'default' | 'all' | 'collapsed';
type SaveStatus = 'saved' | 'unsaved' | 'saving';

const CardEditor: React.FC = () => {
  // Spec & template state
  const [spec, setSpec] = useState<PreviewSpec>(defaultSpec);
  const [activePreset, setActivePreset] = useState('login');

  // Panel collapse state
  const [isStructurePanelCollapsed, setIsStructurePanelCollapsed] = useState(false);
  const [isJsonPanelCollapsed, setIsJsonPanelCollapsed] = useState(false);
  const [isRuntimePanelCollapsed, setIsRuntimePanelCollapsed] = useState(false);
  const [isPresetCollapsed, setIsPresetCollapsed] = useState(false);
  const [jsonExpandMode, setJsonExpandMode] = useState<JsonExpandMode>('default');

  // Runtime data state
  const [runtimeData, setRuntimeData] = useState<RuntimeData>(() => cloneRuntimeData(defaultRuntimeData));

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Save state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('unsaved');

  // --- Chat logic ---
  const handleSendChat = useCallback(async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || chatLoading) return;

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: trimmed };
    const nextHistory = [...messages, userMessage];

    setMessages([...nextHistory, { id: THINKING_MESSAGE_ID, role: 'assistant', content: '正在思考你的页面改动...' }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await sendChat({ message: trimmed, currentSpec: spec, messages: nextHistory });

      if (res.code !== 200 || !res.data?.text) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== THINKING_MESSAGE_ID),
          { id: `assistant-error-${Date.now()}`, role: 'assistant', content: res.message ?? '更新失败，请稍后重试。' },
        ]);
        return;
      }

      const resolved = resolveChatGeneration(res.data.text, spec);

      setSpec(resolved.nextSpec);
      setSaveStatus('unsaved');
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== THINKING_MESSAGE_ID),
        { id: `assistant-${Date.now()}`, role: 'assistant', content: resolved.reply, log: resolved.log },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== THINKING_MESSAGE_ID),
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: error instanceof Error ? error.message : '解析模型响应失败，请稍后重试。',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, messages, spec]);

  // --- Save logic ---
  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      const normalizedSpec = normalizeSpec(spec);
      const res = await saveCardSpec({ spec: normalizedSpec });
      if (res.code === 200) {
        setSaveStatus('saved');
        message.success('保存成功');
      } else {
        setSaveStatus('unsaved');
        message.error(res.message ?? '保存失败');
      }
    } catch {
      setSaveStatus('unsaved');
      message.error('保存失败');
    }
  }, [spec]);

  // --- Preset switch ---
  const handlePresetSwitch = useCallback((presetId: string) => {
    const preset = presetTemplates.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePreset(presetId);
    setSpec(getPresetSpec(presetId));
    setMessages([
      {
        id: `assistant-preset-${presetId}`,
        role: 'assistant',
        content: `已切换到"${preset.name}"模板，你可以继续通过聊天细化这个页面。`,
      },
    ]);
    setSaveStatus('unsaved');
    setRuntimeData(cloneRuntimeData(defaultRuntimeData));
  }, []);

  // --- Layout ---
  const gridCols = isStructurePanelCollapsed
    ? '48px minmax(360px, 1.35fr) minmax(320px, 1fr)'
    : 'minmax(280px, 1fr) minmax(360px, 1.35fr) minmax(320px, 1fr)';

  return (
    <>
      <Breadcrumbs
        extra={
          <Button type="primary" onClick={handleSave} loading={saveStatus === 'saving'}>
            保存
          </Button>
        }
      />
      <ContentWrapper>
        <div tw="h-full" style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 0 }}>
          {/* 左栏：结构数据 */}
          <div tw="border-r border-[rgba(0,0,0,0.06)] overflow-hidden">
            {isStructurePanelCollapsed ? (
              <div tw="h-full flex flex-col items-center pt-3">
                <Button type="text" icon={<MenuUnfoldOutlined />} onClick={() => setIsStructurePanelCollapsed(false)} />
              </div>
            ) : (
              <div tw="h-full flex flex-col">
                <div tw="flex items-center justify-between px-3 py-2 border-b border-[rgba(0,0,0,0.06)]">
                  <span tw="text-[14px] font-semibold">结构数据</span>
                  <Button
                    type="text"
                    size="small"
                    icon={<MenuFoldOutlined />}
                    onClick={() => setIsStructurePanelCollapsed(true)}
                  />
                </div>
                <div tw="flex-1" style={{ minHeight: 0 }}>
                  <StructurePanel
                    spec={spec}
                    runtimeData={runtimeData}
                    onRuntimeDataChange={setRuntimeData}
                    isJsonPanelCollapsed={isJsonPanelCollapsed}
                    onJsonPanelToggle={() => setIsJsonPanelCollapsed((v) => !v)}
                    isRuntimePanelCollapsed={isRuntimePanelCollapsed}
                    onRuntimePanelToggle={() => setIsRuntimePanelCollapsed((v) => !v)}
                    jsonExpandMode={jsonExpandMode}
                    onJsonExpandModeChange={setJsonExpandMode}
                    onResetRuntimeData={() => setRuntimeData(cloneRuntimeData(defaultRuntimeData))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 中栏：预览效果 */}
          <div tw="flex flex-col overflow-hidden border-r border-[rgba(0,0,0,0.06)]">
            <div tw="flex items-center justify-between px-3 py-2 border-b border-[rgba(0,0,0,0.06)]">
              <span tw="text-[14px] font-semibold">预览效果</span>
              <Button type="text" size="small" onClick={() => setIsPresetCollapsed((v) => !v)}>
                {isPresetCollapsed ? '展开模板' : '收起模板'}
              </Button>
            </div>
            {!isPresetCollapsed && (
              <div tw="flex gap-2 px-3 py-2 border-b border-[rgba(0,0,0,0.06)] overflow-x-auto flex-shrink-0">
                {presetTemplates.map((preset) => (
                  <Button
                    key={preset.id}
                    type={activePreset === preset.id ? 'primary' : 'default'}
                    size="small"
                    onClick={() => handlePresetSwitch(preset.id)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            )}
            <div tw="flex-1 overflow-auto p-3 bg-[#f5f5f5]" style={{ minHeight: 0 }}>
              <SpecPreview spec={spec} runtimeData={runtimeData} />
            </div>
          </div>

          {/* 右栏：聊天 */}
          <div tw="flex flex-col overflow-hidden">
            <div tw="flex items-center px-3 py-2 border-b border-[rgba(0,0,0,0.06)]">
              <span tw="text-[14px] font-semibold">聊天窗口</span>
            </div>
            <div tw="flex-1" style={{ minHeight: 0 }}>
              <ChatPanel
                messages={messages}
                input={chatInput}
                onInputChange={setChatInput}
                onSend={handleSendChat}
                loading={chatLoading}
              />
            </div>
          </div>
        </div>
      </ContentWrapper>
    </>
  );
};

export default CardEditor;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/CardEditor/index.tsx
git commit -m "feat(card-editor): add main page component with three-panel layout"
```

---

## Task 11: 注册路由

**Files:**

- Modify: `src/routes/index.tsx`

- [ ] **Step 1: 在路由配置中添加 cardEditor 路由**

在 `generateRoutes()` 返回的数组中，`var` 路由之后添加：

```typescript
// 在 src/routes/index.tsx 的 generateRoutes() 中添加：
{
  title: '卡片编辑',
  name: 'cardEditor',
  path: '/cardEditor',
  nopadding: true,
  component: lazy(() => import('@/pages/CardEditor')),
},
```

注意：使用 `nopadding: true` 因为三栏布局需要占满内容区域高度。

- [ ] **Step 2: 验证路由注册**

Run: `npm run dev`

启动开发服务器后，在浏览器中访问 `http://localhost:8080/cardEditor`（开发环境 basename 为 `/`），验证页面可以正常加载。

- [ ] **Step 3: Commit**

```bash
git add src/routes/index.tsx
git commit -m "feat(card-editor): register cardEditor route"
```

---

## Task 12: 端到端验证与调整

**Files:**

- 可能修改上述任何文件

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`

- [ ] **Step 2: 浏览器验证清单**

访问 `http://localhost:8080/cardEditor`，逐一验证：

1. 页面正常加载，三栏布局渲染正确
2. 默认显示登录模板的预览效果
3. 左栏 JSON 面板正确展示当前 spec
4. JSON 面板的展开/折叠/全部展开按钮工作正常
5. 左栏动态数据面板显示绑定字段（user.name、user.email）
6. 修改动态数据面板的值，中栏预览实时更新
7. 点击模板切换按钮（空白/登录/商品/订单），预览和 JSON 正确更新
8. 切换模板后聊天记录被重置
9. 左栏结构数据面板可折叠/展开
10. 模板区域可收起/展开
11. 侧边栏菜单中出现"卡片编辑"菜单项

- [ ] **Step 3: 修复发现的问题**

根据验证结果修复任何样式、布局或功能问题。常见需要调整的点：

- ContentWrapper 的高度可能需要设置为 `calc(100vh - header高度)` 以使三栏撑满可视区
- react-json-view 的 `collapsed` prop 行为与 react-json-view-lite 不同，可能需要调整
- twin.macro 的 CSS 变量引用在渲染器中是否正确生效

- [ ] **Step 4: Lint 检查**

Run: `npm run lint:script`

修复所有 lint 错误。

- [ ] **Step 5: 最终 Commit**

```bash
git add -A
git commit -m "feat(card-editor): finalize card editor integration and fix issues"
```

---

## 实施顺序依赖关系

```
Task 1 (types) ──┬── Task 2 (normalize-spec)
                 ├── Task 3 (resolve-binding + runtime-data)
                 └── Task 5 (constants) ── needs Task 2

Task 2 ──── Task 4 (chat-response) ── needs normalize-spec
Task 1 ──── Task 6 (api)

Task 1,3,7 ──── Task 7 (SpecPreview)
Task 1,3 ────── Task 8 (StructurePanel)
Task 1 ──────── Task 9 (ChatPanel)

Task 5,6,7,8,9 ── Task 10 (主页面组件)
Task 10 ────────── Task 11 (路由注册)
Task 11 ────────── Task 12 (端到端验证)
```

推荐按 Task 编号顺序执行（1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12），这符合从底层到上层的依赖关系。
