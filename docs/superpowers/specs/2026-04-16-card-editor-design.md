# A2UI 卡片编辑器 - 产品需求文档（PRD）

> 基于 `/work/a2ui` MVP 原型逻辑的完整还原，面向在 `web-ai-agent` 工程中新增"卡片编辑"路由实现。

---

## 1. 产品概述

- **产品名称**：卡片编辑（A2UI 卡片编辑器）
- **产品定位**：AI 驱动的结构化 UI 卡片编辑器，作为网易云商 AI Agent 平台的新功能模块，新增"卡片编辑"路由
- **核心理念**：用户通过自然语言对话，驱动 LLM 实时修改一套结构化 JSON 规格（PreviewSpec），页面根据 JSON 自动渲染 UI 预览效果
- **目标用户**：Agent 运营人员
- **核心场景**：让运营人员通过 AI 对话可视化地编辑和管理 Agent 对话中使用的卡片 UI（如登录卡片、商品卡片、订单卡片等）

### 技术要求

| 维度     | 要求                                                            |
| -------- | --------------------------------------------------------------- |
| 运行环境 | 集成到 web-ai-agent 工程（React 18.2 + TypeScript 4.9）         |
| 路由     | 新增路由页面，纳入现有 `/ai-agent` 路由体系                     |
| 状态管理 | 复用 Recoil + React Query 模式                                  |
| 样式方案 | 使用 `twin.macro`（tw prop + css 条件样式），与现有工程规范一致 |
| UI 组件  | 复用 Ant Design 4，自定义渲染器部分手写                         |
| API 层   | 复用 `src/utils/fetch.ts` 请求封装                              |

---

## 2. 核心概念

### 2.1 PreviewSpec（页面规格）

整个编辑器围绕一个核心数据结构 PreviewSpec 运转，它是一个 JSON 对象，描述了一张卡片的完整 UI 信息：

- **version**：规格版本号
- **theme**：主题色系统（5 个颜色变量）
- **root**：组件树根节点，由 PreviewNode 递归组成

### 2.2 PreviewNode（组件节点）

组件节点的联合类型，支持 10 种节点类型：

- **容器类**（含 children 子节点数组）：`page`、`card`、`column`、`row`
- **内容类**：`text`、`input`、`button`、`divider`、`badge`、`image`、`icon`

### 2.3 StyleToken（样式 Token）

所有节点通过 StyleToken 控制样式，14 个属性值均为字符串类型。

### 2.4 BindingValue（动态绑定）

文本字段支持动态绑定，格式为 `{ binding: "path.to.value", fallback: "默认值" }`，在渲染前通过运行时数据解析为实际文本。

### 2.5 NodeAction（按钮动作）

按钮可携带交互动作，支持 `emit`（自定义事件）、`navigate`（导航）、`submit`（表单提交）三种类型。

---

## 3. 功能模块

### 3.1 三栏编辑工作台

这是一个独立的路由页面，整体为三栏并列布局：

```
┌─────────────────────────────────────────────────────────┐
│  主编辑区（三栏并列）                                    │
├──────────┬──────────────────┬───────────────────────────┤
│ 结构数据面板│    预览效果      │      聊天窗口             │
│           │                 │                           │
│ [JSON面板] │  模板切换区      │   消息列表                │
│ 实时JSON树 │                 │                           │
│ 展开/折叠  │  组件树渲染      │                           │
│           │                 │                           │
│ [数据面板] │                 │   输入框 + 发送按钮         │
│ 绑定字段   │  [保存] 按钮     │                           │
│ 运行时编辑 │                 │                           │
├──────────┴──────────────────┴───────────────────────────┤
```

**布局规则**：

- 三栏等分主编辑区
- 结构数据面板可整体折叠/展开
- 内部 JSON 面板和数据面板也可独立折叠/展开
- 保存按钮位于预览区内

---

### 3.2 预设模板系统

中栏预览区顶部提供模板切换入口，内置 4 个预设模板：

| ID        | 名称         | 主题色           | 内容描述                                                                   |
| --------- | ------------ | ---------------- | -------------------------------------------------------------------------- |
| `blank`   | 空白         | 蓝色系 (#3B82F6) | 最简卡片：标题 + 副标题                                                    |
| `login`   | 登录（默认） | 紫色系 (#7C3AED) | 登录卡片：标题、副标题、邮箱/密码输入框、登录按钮、注册链接                |
| `product` | 商品卡片     | 橙色系 (#F97316) | 商品展示：NEW 标签、图片区、标题、描述、价格、购买/加购按钮                |
| `order`   | 订单信息     | 绿色系 (#10B981) | 订单详情：订单号+已发货状态、到达时间、商品明细行、收货地址、追踪/联系按钮 |

**切换模板时的行为**：

- 替换当前 spec 为目标模板的完整 PreviewSpec
- 重置聊天记录（清空消息历史）
- 更新保存状态为 unsaved
- 更新动态数据绑定面板

---

### 3.3 AI 对话编辑

右栏聊天窗口，通过自然语言驱动 LLM 修改 spec。

**完整交互流程**：

1. **用户输入**：底部输入框，支持回车或点击发送按钮
2. **发送请求**：
   - 追加 user message 到消息列表
   - 显示 thinking 消息（"正在思考你的页面改动..."）
   - 调用后端 API（POST），请求体：`{ message, currentSpec, messages }`
3. **API 请求/响应契约**：
   - 请求体：`{ message: string, currentSpec: PreviewSpec, messages: ChatMessage[] }`
   - 响应体：`{ reply: string, nextSpec: PreviewSpec, log: string }`
   - 非流式，一次性返回完整 JSON 响应
   - 具体后端实现（LLM 调用、校验等）不在本前端工程范围
4. **响应处理（前端）**：
   - 去除 markdown 代码围栏
   - 提取 JSON 对象 `{ reply, nextSpec, log }`
   - 对 nextSpec 做类型校验 + 容错修复（sanitize）
   - 未知节点类型降级为 text 节点
5. **状态更新**：
   - 用 nextSpec 替换当前 spec
   - 追加 assistant message（reply 内容）
   - 移除 thinking 消息
   - 左栏 JSON 面板和中栏预览同步更新

**消息类型**：

- `user`：用户发送的文本消息
- `assistant`：LLM 的回复文本（reply 字段）
- `thinking`：加载中的过渡态消息

---

### 3.4 实时预览渲染器

中栏预览区核心功能，是一个**递归的 JSON-to-UI 渲染器**，根据 PreviewSpec 节点类型逐一渲染为对应的 HTML 元素。

**主题系统**：通过 CSS 变量注入 5 个主题色：

| CSS 变量         | 对应字段     | 说明       |
| ---------------- | ------------ | ---------- |
| `--theme-accent` | theme.accent | 主色       |
| `--theme-panel`  | theme.panel  | 面板背景色 |
| `--theme-text`   | theme.text   | 主文字色   |
| `--theme-muted`  | theme.muted  | 次要文字色 |

**10 种节点渲染规则**：

| 节点类型  | 渲染为                      | 布局/样式                                       | 特殊说明                                    |
| --------- | --------------------------- | ----------------------------------------------- | ------------------------------------------- |
| `card`    | `<div>` 卡片容器            | 圆角、阴影、padding、背景色为 theme.panel       | 有 children                                 |
| `column`  | `<div>` 纵向容器            | flex-direction: column，gap 可配                | 有 children                                 |
| `row`     | `<div>` 横向容器            | flex-direction: row，gap 可配                   | 有 children                                 |
| `text`    | `<p>/<h1>/<h2>/<h3>/<span>` | 根据 `as` 字段决定语义标签                      | text 字段支持 BindingValue                  |
| `input`   | `<label>` + `<input>`       | 带标签和占位符                                  | label/placeholder/value 均支持 BindingValue |
| `button`  | `<button>`                  | primary（强调色填充）/ secondary（边框样式）    | 可携带 NodeAction                           |
| `divider` | `<div>` 分割线              | 1px 横线，颜色取 border 变量                    | 纯展示                                      |
| `badge`   | `<span>` 标签徽章           | 5 种色调（info/success/warning/danger/neutral） | 纯展示                                      |
| `image`   | `<img>`                     | 无 src 时显示灰色占位图                         | src 为空时用占位                            |
| `icon`    | `<span>`                    | 文字/emoji 渲染                                 | 简单文本展示                                |

**NodeAction 事件处理**：

- 按钮可携带 `action: { type, name, payload }`
- 点击后在预览底部显示调试信息（action 类型 + name + payload）
- 三种 action 类型：`emit`（自定义事件）、`navigate`（导航）、`submit`（表单提交）

**容错渲染**：

- 未知节点类型降级为 text 节点，显示 `[typeLabel] xxx`
- 渲染前通过 `resolvePreviewSpec()` 解析所有绑定值为实际文本

---

### 3.5 JSON 结构面板

左栏上半部分，展示当前 spec 的实时 JSON 树。

**功能**：

- 使用 JSON 树形组件渲染当前 PreviewSpec
- 三种展开模式，通过顶部按钮切换：
  - **全部展开**：所有节点展开
  - **全部折叠**：只显示顶层
  - **默认展开**：展开前 2 层
- 面板可独立折叠/展开
- JSON 数据随 spec 状态实时同步更新（聊天编辑后立即反映）

---

### 3.6 动态数据绑定系统

左栏下半部分，提供运行时数据的编辑能力。

**绑定收集**：

- `collectBindings()` 遍历整棵节点树，收集所有 BindingValue 字段
- 自动提取出所有绑定路径（如 `user.name`、`product.price`）
- 在面板中为每个绑定路径生成一个可编辑的输入框

**默认运行时数据**：

```json
{
  "user": { "name": "Alex Chen", "email": "alex.chen@acme.ai" },
  "product": { "title": "AeroPulse Headphones", "price": "$249" },
  "order": { "id": "#A23198", "arrival": "Tomorrow, 18:00 - 21:00" }
}
```

**绑定解析流程**：

1. 用户在数据面板修改某个绑定字段的值
2. `setRuntimeValue(path, value)` 更新 runtimeData 状态
3. `resolvePreviewSpec(spec, runtimeData)` 遍历 spec，将 `{ binding: "path" }` 替换为实际值
4. 中栏预览根据解析后的 spec 重新渲染

**面板可独立折叠/展开**，与 JSON 面板独立控制。

---

### 3.7 保存功能

- 保存按钮位于预览区内
- 点击后将当前 spec 发送到后端保存 API
- 发送前对 spec 做一次节点 ID 规范化（normalizeSpec）
- 保存状态三态：
  - `saved`：已保存
  - `unsaved`：未保存（有修改）
  - `saving`：保存中
- 每次 spec 变更后，保存状态自动变为 unsaved
- MVP 阶段后端 save API 为 mock 实现，仅返回 `{ success: true }`

---

## 4. 完整数据模型定义

### 4.1 PreviewSpec

```typescript
type PreviewSpec = {
  version: string; // 当前 "0.2.0"
  theme: {
    accent: string; // 主色，如 "#7C3AED"
    canvas: string; // 背景色，如 "#F5F3FF"
    panel: string; // 面板背景色，如 "#FFFFFF"
    text: string; // 主文字色，如 "#1E1B4B"
    muted: string; // 次要文字色，如 "#6B7280"
  };
  root: PreviewNode; // 组件树根节点
};
```

### 4.2 PreviewNode

```typescript
// 基础字段（所有节点共有）
type BaseNode = {
  id?: string; // 节点唯一标识，可选，规范化时自动生成
  style?: StyleToken; // 样式 token
};

// 容器节点
type PageNode = BaseNode & { type: 'page'; children: PreviewNode[] };
type CardNode = BaseNode & { type: 'card'; children: PreviewNode[] };
type ColumnNode = BaseNode & { type: 'column'; children: PreviewNode[] };
type RowNode = BaseNode & { type: 'row'; children: PreviewNode[] };

// 内容节点
type TextNode = BaseNode & {
  type: 'text';
  text: ResolvableText;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span';
};
type InputNode = BaseNode & {
  type: 'input';
  label?: ResolvableText;
  placeholder?: ResolvableText;
  value?: ResolvableText;
};
type ButtonNode = BaseNode & {
  type: 'button';
  label: string;
  variant?: 'primary' | 'secondary';
  action?: NodeAction;
};
type DividerNode = BaseNode & { type: 'divider' };
type BadgeNode = BaseNode & {
  type: 'badge';
  label: string;
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
};
type ImageNode = BaseNode & {
  type: 'image';
  src?: string;
  alt?: string;
};
type IconNode = BaseNode & {
  type: 'icon';
  name: string;
};

type PreviewNode =
  | PageNode
  | CardNode
  | ColumnNode
  | RowNode
  | TextNode
  | InputNode
  | ButtonNode
  | DividerNode
  | BadgeNode
  | ImageNode
  | IconNode;
```

### 4.3 StyleToken

```typescript
type StyleToken = {
  width?: string;
  maxWidth?: string;
  minHeight?: string;
  padding?: string;
  gap?: string;
  radius?: string; // border-radius
  background?: string;
  color?: string;
  border?: string;
  shadow?: string; // box-shadow
  align?: string; // align-items
  justify?: string; // justify-content
  fontSize?: string;
  fontWeight?: string;
};
```

### 4.4 BindingValue & ResolvableText

```typescript
type BindingValue = {
  binding: string; // 绑定路径，如 "user.name"
  fallback?: string; // 解析失败时的回退值
};

type ResolvableText = string | BindingValue;
```

### 4.5 NodeAction

```typescript
type NodeAction = {
  type: 'emit' | 'navigate' | 'submit';
  name: string; // 动作名称
  payload?: Record<string, string>; // 附加数据
};
```

### 4.6 ChatMessage

```typescript
type ChatMessage = {
  role: 'user' | 'assistant' | 'thinking';
  content: string;
};
```

### 4.7 Spec 节点 ID 规范化规则

- 如果节点已有合法 id 且未被占用，保留原 id
- 否则根据节点类型 + 内容标签生成 slug 形式 id，如 `text-welcome-back-1`
- slug 生成规则：`{type}-{labelSlug}-{counter}`
- 保存时必须做一次规范化

---

## 5. API 接口规格

### 5.1 聊天 API

```
POST /api/chat（具体路径根据后端约定）
```

**请求体**：

```typescript
{
  message: string;                // 用户输入的自然语言，最大 4000 字符
  currentSpec: PreviewSpec;       // 当前页面规格 JSON
  messages: ChatMessage[];        // 聊天历史，最多 40 条
}
```

**响应体**（一次性返回完整 JSON）：

```typescript
{
  reply: string; // LLM 对用户的回复文本
  nextSpec: PreviewSpec; // 更新后的完整 PreviewSpec
  log: string; // LLM 的操作日志/思考过程
}
```

**错误处理**：

- 消息为空 → 前端拦截，不发请求
- 响应 JSON 解析失败 → 保持当前 spec 不变，显示错误提示
- nextSpec 校验失败 → 尝试 sanitize 修复，失败则保持当前 spec

### 5.2 保存 API

```
POST /api/save（具体路径根据后端约定）
```

**请求体**：

```typescript
{
  spec: PreviewSpec; // 规范化后的页面规格
}
```

**响应体**：

```typescript
{
  success: boolean;
  receivedAt?: string;            // 接收时间
}
```

---

## 6. LLM 协议详情

### 6.1 System Prompt

LLM 的 System Prompt 定义了其行为约束（前端需理解以便正确构建请求和解析响应）：

```
You are an AI UI editor. You update a UI schema based on the user's request.
Return JSON only. The JSON must include exactly these top-level fields:
{"reply": string, "nextSpec": PreviewSpec, "log": string}.
Do not wrap the JSON in markdown fences.
Use only these node types: page, card, column, row, text, input, button, divider, badge, image, icon.
```

### 6.2 用户消息组装

每次请求中，用户消息格式为：

```
User request: {message}

Current spec:
{JSON.stringify(currentSpec)}
```

### 6.3 响应解析与容错逻辑（前端实现）

前端解析 LLM 响应时的容错处理步骤：

1. **去除 markdown 围栏**：正则匹配 ` ```json...``` ` 或 ` ```...``` `，提取内部内容
2. **JSON 提取**：在文本中查找第一个 `{...}` JSON 对象
3. **字段校验**：
   - `reply` 必须是 string
   - `nextSpec` 必须通过 `isPreviewSpec()` 校验
   - `log` 是 string（可选）
4. **Spec 容错修复（sanitize）**：
   - 确保 root 节点存在且类型合法
   - 递归遍历所有节点，验证 type 字段
   - 未知节点类型降级为 `{ type: "text", text: "[unknownType] ..." }`
   - 确保容器节点的 children 为数组
   - 确保 theme 对象包含全部 5 个颜色字段，缺失则补默认值
5. **解析失败兜底**：如果整体解析失败，保持当前 spec 不变，显示错误提示消息

### 6.4 `isPreviewSpec()` 校验规则

- 顶层必须包含 `version`（string）、`theme`（object）、`root`（object with type）
- theme 必须包含 accent、canvas、panel、text、muted 五个 string 字段
- root.type 必须是 10 种合法节点类型之一

---

## 7. 当前实现边界与约束

| 维度       | 约束说明                                                                |
| ---------- | ----------------------------------------------------------------------- |
| 渲染器节点 | 仅支持 10 种基础节点类型，暂无 table、tabs、textarea、select 等复杂组件 |
| 持久化     | Save API 目前为 mock，需对接真实后端                                    |
| 鉴权       | 无独立鉴权，依赖 web-ai-agent 工程已有的登录和权限体系                  |
| 版本管理   | 无 undo/redo、无操作历史、无版本 diff                                   |
| Spec 校验  | 依赖 LLM 稳定输出合法 JSON，有 sanitize 容错但不够健壮                  |
| 多用户     | 无协作编辑能力，单用户单会话                                            |
| 节点交互   | 按钮点击仅显示调试信息，无真实事件触发                                  |

---

## 附录：预设模板完整 Spec

### A.1 blank（空白模板）

- 主题色：accent `#3B82F6`, canvas `#EFF6FF`, panel `#FFFFFF`, text `#1E3A5F`, muted `#6B7280`
- 结构：page > card > column > [h1 标题, p 副标题]

### A.2 login（登录模板，默认）

- 主题色：accent `#7C3AED`, canvas `#F5F3FF`, panel `#FFFFFF`, text `#1E1B4B`, muted `#6B7280`
- 结构：page > card > column > [h2 标题(绑定 user.name), p 副标题, input 邮箱, input 密码, button 登录(primary, submit), row > [span 注册提示, button 注册(secondary, navigate)]]

### A.3 product（商品卡片模板）

- 主题色：accent `#F97316`, canvas `#FFF7ED`, panel `#FFFFFF`, text `#1C1917`, muted `#78716C`
- 结构：page > card > column > [badge NEW, image 商品图, column > [h2 标题(绑定 product.title), p 描述, row > [span 价格(绑定 product.price)]], row > [button 购买(primary, submit), button 加入购物车(secondary, emit)]]

### A.4 order（订单信息模板）

- 主题色：accent `#10B981`, canvas `#ECFDF5`, panel `#FFFFFF`, text `#064E3B`, muted `#6B7280`
- 结构：page > card > column > [row > [h2 订单号(绑定 order.id), badge 已发货], divider, column > [p 预计到达(绑定 order.arrival)], divider, column 商品明细, divider, column 收货地址, row > [button 追踪包裹(primary, emit), button 联系客服(secondary, emit)]]
