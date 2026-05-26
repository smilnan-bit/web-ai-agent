# 卡片管理技术文档 — Generative UI 接入方案

## 1. 概述

CardEditor 是 web-ai-agent 工程中新增的 AI 驱动结构化 UI 卡片编辑器页面。其核心理念源自开源项目 [json-render](https://github.com/vercel-labs/json-render)（Vercel Labs 出品的 Generative UI 框架），通过 LLM 生成结构化 JSON 描述来渲染预定义的 UI 组件，实现**受控的生成式 UI**。

### 1.1 接入路径

```
json-render (开源框架，提供核心理念)
    ↓ 简化并重新定义 spec 格式
a2ui (Next.js 15 MVP 原型验证)
    ↓ 移植到生产技术栈
web-ai-agent/CardEditor (生产集成)
```

接入并非直接 npm 依赖 json-render，而是提取了其核心设计思想（LLM 生成 JSON → 受限组件目录 → 渲染器消费），结合业务需求重新实现了一套更轻量的 spec 协议和渲染器。

### 1.2 技术栈适配

| 维度       | a2ui 原型             | web-ai-agent 生产         |
| ---------- | --------------------- | ------------------------- |
| 框架       | Next.js 15 / React 19 | React 18.2                |
| TypeScript | 5.x                   | 4.9                       |
| UI 库      | 原生 HTML/CSS         | Ant Design 4 + twin.macro |
| 状态管理   | React hooks           | React hooks (Recoil 可选) |
| 构建       | Next.js built-in      | @ysf/cli + yspack         |
| LLM 调用   | Server-side (AI SDK)  | 前端 fetch → 后端代理     |

---

## 2. 核心概念

### 2.1 PreviewSpec

整个卡片 UI 的完整描述，包含版本号、主题色和组件树：

```typescript
type PreviewSpec = {
  version: string;
  theme: {
    primary: string; // 主色，如 '#3370ff'
    bg: string; // 卡片背景色，如 '#ffffff'
    text: string; // 主文字颜色，如 '#1f2329'
    textMinor: string; // 次要文字颜色，如 '#8f959e'
  };
  root: PreviewNode; // 组件树根节点
};
```

### 2.2 PreviewNode

8 种预定义节点类型的联合类型，`ContainerNode` 合并 card/column/row，分为容器节点和叶子节点：

| 类别 | 类型      | 说明                          |
| ---- | --------- | ----------------------------- |
| 容器 | `card`    | 卡片容器，含 `children`       |
| 容器 | `column`  | 纵向布局，含 `children`       |
| 容器 | `row`     | 横向布局，含 `children`       |
| 叶子 | `text`    | 文本（支持 h1-h3, p, span）   |
| 叶子 | `input`   | 输入框（text/password/email） |
| 叶子 | `button`  | 按钮（primary/secondary）     |
| 叶子 | `divider` | 分割线                        |
| 叶子 | `badge`   | 标签（5 种色调）              |
| 叶子 | `image`   | 图片（cover/contain）         |

> 注：`ContainerNode` 中 `type: 'card' | 'column' | 'row'` 共用同一结构体，`PreviewNode` 联合类型共 7 个成员。

### 2.3 StyleToken

统一的样式描述对象，14 个可选属性：

```typescript
type StyleToken = {
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
```

### 2.4 BindingValue — 动态数据绑定

节点的文本字段可以是静态字符串或动态绑定值：

```typescript
type BindingValue = {
  binding: string; // 点号分隔的数据路径，如 "user.name"
  fallback?: string; // 绑定解析失败时的降级文本
};

type ResolvableText = string | BindingValue;
```

运行时，`resolve-binding` 工具会遍历 spec 树，将所有 `BindingValue` 替换为从 `RuntimeData` 中查找的实际值。

### 2.5 NodeAction

按钮交互的动作描述：

```typescript
type NodeAction = {
  type: 'emit' | 'navigate' | 'submit';
  name: string;
  payload?: Record<string, string>;
};
```

---

## 3. 系统架构

### 3.1 目录结构

```
src/
├── api/
│   └── card.ts                      # Spec CRUD 接口（统一 request）
└── pages/
    ├── Card/
    │   ├── index.tsx                # 列表页（空状态 + 瀑布流 + 下拉加载）
    │   ├── index.less
    │   └── components/
    │       ├── ViewCardModal.tsx    # 查看弹窗（预览 + JSON 树）
    │       └── ViewCardModal.less
    └── CardEditor/
        ├── index.tsx                # 编辑器主页面（三栏布局）
        ├── types.ts                 # 核心类型定义
        ├── constants.ts             # 预设模板 & 默认值
        ├── api.ts                   # sendChat（原生 fetch）
        ├── utils/
        │   ├── normalize-spec.ts    # Spec ID 归一化
        │   ├── resolve-binding.ts   # 动态绑定解析
        │   ├── runtime-data.ts      # 运行时数据管理
        │   └── chat-response.ts     # LLM 响应解析 & 清洗
        └── components/
            ├── SpecPreview.tsx      # 递归 JSON-to-UI 渲染器（列表页/弹窗/编辑器共用）
            ├── StructurePanel.tsx   # 左侧结构面板
            └── ChatPanel.tsx        # 右侧聊天面板
```

### 3.2 三栏布局

```
┌─────────────────────────────────────────────────────────────┐
│  面包屑导航                                                   │
├──────────────┬──────────────────────┬───────────────────────┤
│  结构面板     │     实时预览          │     聊天面板           │
│  (可折叠)     │                      │                       │
│              │                      │                       │
│  ┌────────┐ │   ┌──────────────┐   │  ┌─────────────────┐ │
│  │JSON 树 │ │   │              │   │  │ AI: 你好！...    │ │
│  │react-  │ │   │  SpecPreview │   │  │                 │ │
│  │json-   │ │   │  渲染结果     │   │  │ 用户: 改标题    │ │
│  │view    │ │   │              │   │  │                 │ │
│  └────────┘ │   └──────────────┘   │  │ AI: 已修改...   │ │
│              │                      │  └─────────────────┘ │
│  ┌────────┐ │                      │                       │
│  │动态数据│ │                      │  ┌─────────────────┐ │
│  │编辑器  │ │                      │  │ [输入框] [发送]  │ │
│  └────────┘ │                      │  └─────────────────┘ │
└──────────────┴──────────────────────┴───────────────────────┘
```

### 3.3 数据流

```
用户输入消息
    ↓
ChatPanel → handleSendChat()
    ↓
POST /a2ui/api/chat  ← { message, currentSpec, messages }
    ↓
LLM 返回原始文本
    ↓
resolveChatGeneration() 解析 & 验证 & 清洗
    ↓
更新 spec 状态 + 追加聊天消息
    ↓
SpecPreview 重新渲染 (resolvePreviewSpec → renderNode)
```

---

## 4. 核心模块详解

### 4.1 LLM 响应解析 (`chat-response.ts`)

这是整个系统中最复杂的模块，负责将 LLM 的非确定性输出转换为可靠的结构化数据。

#### 解析流程

````
LLM 原始文本 (responseText)
    ↓ resolveChatGeneration() — 外层 try/catch 兜底
    ↓
    parseModelPayload()
      ↓ stripCodeFences()         剥离 ```json ... ``` 围栏
      ↓ extractJsonObject()       提取第一个完整 { ... }
      ↓ JSON.parse()
          ├─ 成功
          │     ↓ isPreviewSpec()       严格类型校验
          │         ├─ 通过 → normalizeSpec() 直接使用
          │         └─ 不通过 → sanitizePreviewSpec() 宽松清洗
          │                       ├─ 清洗成功 → 使用清洗后的 spec
          │                       └─ 返回 null → fallbackSpec（UI 不变）
          │
          └─ 失败（JSON 无法解析）
                ↓ throw Error → 被外层 catch 捕获
                → 软降级：原始文本作 reply，spec 保持 fallbackSpec 不变
````

#### 容错策略

| 场景                                  | 处理位置                           | 处理方式                                              | 用户感知              |
| ------------------------------------- | ---------------------------------- | ----------------------------------------------------- | --------------------- |
| LLM 输出包含 markdown 代码围栏        | `stripCodeFences`                  | 自动剥离 ` ```json ``` `                              | 无感知                |
| JSON 前后有额外文本                   | `extractJsonObject`                | 定位首个 `{` 到最后匹配的 `}`                         | 无感知                |
| 未知节点类型                          | `sanitizePreviewNode`              | `toPlaceholderTextNode` 降级为文本占位 `[type] label` | 看到占位文本          |
| 字段类型不匹配                        | `sanitizePreviewNode`              | 尝试修复；无法修复则降级为占位                        | 局部降级              |
| `nextSpec` 缺失或非法                 | `resolveChatGeneration`            | `nextSpec = null` → 返回 `fallbackSpec`               | UI 不变，有 reply     |
| `reply` 字段缺失                      | `resolveChatGeneration`            | `throw` → 被外层 catch 捕获                           | 见下行                |
| JSON 完全无法解析（纯文本/截断/空串） | `resolveChatGeneration` 外层 catch | 原始文本作 reply，spec 保持不变                       | 看到原始文本，UI 不变 |
| `responseText` 为空串                 | `resolveChatGeneration` 外层 catch | reply 兜底为 `'抱歉，生成结果解析失败，请重试。'`     | 看到提示文案          |

### 4.2 递归渲染器 (`SpecPreview.tsx`)

#### 渲染流程

1. 将 `theme` 的 4 个色值映射为 CSS 变量（`--theme-primary`, `--theme-bg`, `--theme-text`, `--theme-text-minor`）
2. 调用 `resolvePreviewSpec` 解析所有动态绑定（仅 label/placeholder 类字段）
3. 从 `root` 节点开始递归调用 `renderNode`
4. 每种节点类型有独立的渲染函数，使用内联样式 + CSS 变量

#### 交互式表单模拟

预览区中 `input`、`select`、`buttonGroup` 节点支持用户实时交互：

- **formValues state**：组件级 `useState<Record<string, string>>({})`，以 `node.name || node.id` 为 key 存储用户输入/选择的值
- **onFormChange 回调**：从 `SpecPreview` 组件顶层透传至每个交互节点的渲染函数
- **优先级**：`formValues[fieldName]` > `node.value`（spec 中的默认值）
- **Select 交互**：以平铺选项列表方式展示，点击切换选中态，支持 single/multiple 模式
- **ButtonGroup 交互**：点击按钮切换选中态，支持 single/multiple 模式和 row/column 方向

#### Action 提交数据模型

当用户点击带 `action` 的 Button 时，`handleAction` 收集以下数据并展示在 toast 浮层中：

```typescript
type ActionInfo = {
  type: string; // action.type (emit/navigate/submit)
  name: string; // action.name (camelCase 标识)
  nodeId: string; // 触发按钮的 node ID
  staticPayload: Record<string, string>; // action.payload 中的静态 KV
  formValues: Record<string, string>; // 用户在 input/select/buttonGroup 中输入/选择的值
};
```

> **设计决策**：action 提交时不再注入 binding 的 runtime context，而是携带用户实际交互数据（formValues）。binding 数据在工作流运行时由后端统一注入上下文，编辑器中不模拟。

#### StyleToken → CSS 映射

```typescript
function mapStyles(style?: StyleToken): React.CSSProperties {
  // width → width, maxWidth → maxWidth, minHeight → minHeight
  // padding → padding, gap → gap
  // radius → borderRadius, background → background
  // color → color, border → border, shadow → boxShadow
  // align → textAlign, fontSize → fontSize, fontWeight → fontWeight
  // justify → justifyContent (通过 getJustifyContent 转换)
}
```

### 4.3 Spec 归一化 (`normalize-spec.ts`)

确保 spec 树中每个节点具有唯一 ID，用于 React 渲染 key 和 JSON 树定位。

#### ID 生成规则

- 格式：`{nodeType}-{slugifiedLabel}-{counter}`
- 优先保留已有的有效且唯一 ID
- slug 化规则：小写 + 非字母数字替换为 `-` + 截断 24 字符
- 通过 `used` Set 和 `counters` Map 保证全局唯一

### 4.4 动态绑定系统

#### 数据流

```
PreviewSpec (含 BindingValue)
    + RuntimeData { user: { name: "Alex" } }
    ↓ resolvePreviewSpec()
PreviewSpec (纯字符串，可直接渲染)
```

#### RuntimeData 管理

- `defaultRuntimeData`：包含 user、product、order 三组模拟数据
- `collectBindings(spec)`：遍历 spec 树，收集所有绑定路径。**注意**：`select.value` 和 `buttonGroup.value` 不被视为 binding（它们是用户交互状态，由前端 formValues 管理）；只有 `select.label`/`select.placeholder` 中的 binding 会被收集
- `getRuntimeValue / setRuntimeValue`：点号路径的 getter/setter
- StructurePanel 中展示为可编辑的 Input 列表，修改后实时触发预览更新

#### 事件及上报数据 (`collectEventInfo`)

二期新增面板，位于 StructurePanel 底部，自动从 spec 中提取事件配置信息：

```typescript
interface EventInfo {
  targetComponents: string[]; // 带 action 的 Button 节点的 name/id
  triggerActions: string[]; // 触发类型，目前固定为 "click"
  reportDataKeys: string[]; // input/select/buttonGroup 节点的 name 字段
}
```

- **目标组件**：扫描 spec 中所有 `type === 'button' && action` 的节点，取其 `name || id`
- **触发动作**：目前所有按钮事件统一为 `click`
- **上报数据 key**：收集所有 `input`/`select`/`buttonGroup` 节点的 `name` 字段，这些 key 会作为工作流对话节点的 `USER_RESPONSE` 输出参数

面板为只读展示（Tag 样式），跟随 spec 实时更新。

---

## 5. API 接口

### 5.1 AI 对话接口

```
POST /a2ui/api/chat
Content-Type: application/json

Request:
{
  "message": "把标题改成中文",
  "currentSpec": { ... PreviewSpec },
  "messages": [ ... ChatMessage[] ],
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}

Response:
{
  "text": "{ \"reply\": \"已将标题修改为中文\", \"nextSpec\": {...}, \"log\": \"...\" }"
}
```

- 开发环境通过 `pp.config.js` 代理到 `http://localhost:3000/api`（a2ui 后端）
- 使用原生 `fetch` 发起请求（不经过项目 request 拦截器）
- 返回的 `text` 字段是 LLM 原始文本，需前端自行解析
- **后续迁移**：生产对接 `/agent/api/cotui/chat`
- `sessionId`：每次进入编辑器页面时由前端通过 `crypto.randomUUID()` 生成，在该次编辑会话内所有 Chat 请求均携带同一值；页面刷新或路由切换导致组件卸载时自然重置（新组件实例重新生成），后端可用此字段关联上下文/计费/追踪日志

### 5.2 Spec CRUD 接口（`src/api/card.ts`）

| 接口 | 方法+路径                           | 入参                                   | 返回                             |
| ---- | ----------------------------------- | -------------------------------------- | -------------------------------- |
| 新建 | POST `/agent/api/cotui/spec/save`   | `{ specName, specDesc?, uiJson }`      | `Long`（新 id）                  |
| 更新 | POST `/agent/api/cotui/spec/update` | `{ id, specName?, specDesc?, uiJson }` | `boolean`                        |
| 详情 | GET `/agent/api/cotui/spec/get`     | `{ id }`                               | `CotUiSpecVO`                    |
| 列表 | GET `/agent/api/cotui/spec/list`    | `{ pageNo, pageSize, keyword? }`       | `AgentPageResponse<CotUiSpecVO>` |
| 删除 | POST `/agent/api/cotui/spec/delete` | `{ id }`                               | `boolean`                        |

`uiJson` = `JSON.stringify(PreviewSpec)`，前端读取后需 `JSON.parse` 还原。保存时区分新建与更新：

```typescript
isEdit
  ? updateCard({ id, specName, uiJson: JSON.stringify(spec) })
  : saveCard({ specName, uiJson: JSON.stringify(spec) });
```

`specName` 兜底策略：取最近用户消息前 20 字符，再兜底 `"未命名卡片"`。

---

## 6. 预设模板

系统内置 4 套预设模板：

| ID        | 名称     | 说明                      | 主色    |
| --------- | -------- | ------------------------- | ------- |
| `blank`   | 空白     | 最小化卡片，仅标题+副标题 | #4a7bff |
| `login`   | 登录     | 登录表单，含绑定示例      | #6f72d8 |
| `product` | 商品卡片 | 电商商品展示              | #ff6a3d |
| `order`   | 订单信息 | 订单详情，含多个绑定      | #1f7a5f |

默认加载 `login` 模板。切换模板时重置聊天记录和运行时数据。

---

## 7. 路由注册

```typescript
// src/routes/index.tsx
{ path: '/card', component: Card }           // 卡片列表页（空状态 + 瀑布流）
{ path: '/card/editor', component: CardEditor }  // 卡片编辑器（新建 & 编辑）
{ path: '/cardEditor', component: CardEditor }   // 调试路由（保留）
```

新建卡片流程：Card 页面输入描述 → `sendChat(emptySpec)` → 得到 `initialSpec` → `navigate('/card/editor', { state: { initialSpec, initialMessages } })`，编辑器初始化时读取 `locationState` 直接呈现结果。

编辑已有卡片：`/card/editor?id=xxx` → `getCardDetail({ id })` → `JSON.parse(card.uiJson)` → 加载已有 spec。

---

## 8. 依赖关系

```
types.ts ←─────────────────────────┐
    ↑                              │
normalize-spec.ts                  │
    ↑                              │
resolve-binding.ts  runtime-data.ts│
    ↑                   ↑          │
chat-response.ts        │          │
    ↑                   │          │
constants.ts   api.ts   │          │
    ↑            ↑      │          │
    └────────────┼──────┼──────────┘
                 │      │
         index.tsx ─────┘
         ↑   ↑   ↑
SpecPreview  StructurePanel  ChatPanel
```

外部依赖：

- `react-json-view`：JSON 树可视化（StructurePanel）
- `@ant-design/icons`：`LoadingOutlined`（ChatPanel loading 状态）
- `antd`：`Input`, `Button`, `Breadcrumb` 等基础组件

---

## 9. 设计决策 & 权衡

| 决策                          | 选择                            | 原因                                                             |
| ----------------------------- | ------------------------------- | ---------------------------------------------------------------- |
| 不直接依赖 json-render npm 包 | 自研轻量 spec                   | json-render 的 catalog/schema 抽象对当前场景过重，且技术栈不兼容 |
| 全量 spec 替换而非 diff patch | 每次 LLM 返回完整 nextSpec      | 简化 LLM 提示词复杂度，避免 JSON patch 的边界问题                |
| 前端解析 LLM 输出而非后端     | `chat-response.ts` 在浏览器执行 | 减少后端改动，便于快速迭代容错逻辑                               |
| sendChat 使用原生 fetch       | 绕过项目 request 拦截器         | 对话接口代理到独立服务，不走项目统一鉴权                         |
| 内联样式而非 CSS class        | SpecPreview 使用 `style` 属性   | spec 中的样式是动态生成的，无法预定义 class                      |
| uiJson 存储为字符串           | `mediumtext`，前端 parse        | 后端不解析 spec 结构，零耦合                                     |
| CSS Columns 瀑布流            | 替代 react-virtualized Masonry  | 数量有限无需虚拟化，零依赖，天然高度自适应                       |
| 下拉加载替代翻页              | IntersectionObserver            | 瀑布流场景更自然                                                 |

---

## 10. 当前限制

- 无撤销/重做功能
- 无多人协作
- 节点类型限制为 **7 种**（card/column/row/text/input/button/divider/badge/image）
- 不支持自定义组件扩展
- 无版本历史
- LLM 返回的 spec 无增量更新（全量替换）
- `SpecPreview` 的 theme CSS 变量命名与 `PreviewSpec.theme` 字段存在不一致，渲染层待对齐

---

## 11. 卡片列表页（`src/pages/Card/index.tsx`）

### 11.1 页面状态机

列表页存在两种互斥状态，由 `isEmpty` 决定切换：

```
total === 0 && !loading && page === 1
        ↓ true              ↓ false
    空状态视图          瀑布流列表视图
  （AI 生成入口）       （ContentWrapper）
```

### 11.2 空状态 — AI 生成入口

无卡片数据时展示全屏居中的引导界面，用户在此发起第一次 AI 生成。

#### 交互流程

```
用户在 textarea 输入描述
    ↓ Enter（非 Shift）或点击发送按钮
handleEmptySend()
    ↓ 构造 userMessage，设置 generating = true
sendChat({ message, messages: [userMessage] })
    ↓ 调用 /a2ui/api/chat，currentSpec 默认传 defaultSpec
resolveChatGeneration(res.text, defaultSpec)
    ↓ 解析出 { reply, nextSpec, log }
navigate('/card/editor', { state: { initialSpec, initialMessages } })
    ↓
CardEditor 初始化时从 locationState 读取并直接渲染生成结果
```

#### 关键实现细节

| 细节                | 说明                                                                        |
| ------------------- | --------------------------------------------------------------------------- |
| `generating` 状态   | 防重复提交；发送按钮 `disabled`；图标切换为 CSS loading spinner             |
| `textarea` 自动增高 | `onChange` 时先 `style.height = 'auto'` 再读 `scrollHeight` 赋值            |
| `Enter` 发送        | `onKeyDown` 中检测 `e.key === 'Enter' && !e.shiftKey`，否则正常换行         |
| 发送图标            | `<IconFasong size={14} color="#FFF" />`，生成中替换为 CSS spinner           |
| 错误处理            | `sendChat` 异常或 `res.text` 为空时 `message.error('生成失败，请稍后重试')` |

### 11.3 瀑布流列表

有卡片数据时展示 3 列等宽瀑布流，每列内卡片按自然高度排列。

#### 瀑布流实现

采用 **CSS Columns**，零外部依赖：

```less
// index.less
.CardManagement-masonry {
  columns: 3;
  column-gap: 16px;
}
.CardManagement-card {
  break-inside: avoid; // 禁止卡片在列间断裂
  margin-bottom: 16px;
  position: relative;
}
```

每张卡片包含三层结构：

1. **缩略图层** `.CardManagement-thumbnail`：`SpecPreview` 直接渲染，高度跟随 spec 内容自适应
2. **Hover 遮罩层** `.CardManagement-card-overlay`：绝对定位覆盖，显示「查看 / 编辑 / 删除」三个操作
3. **名称底栏** `.CardManagement-card-footer`：展示 `specName`，兜底"未命名卡片"

#### 卡片操作

| 操作 | 行为                                                                     |
| ---- | ------------------------------------------------------------------------ |
| 查看 | `setViewCardId(card.id)` + `setViewVisible(true)` → 打开 `ViewCardModal` |
| 编辑 | `navigate('/card/editor?id=${card.id}')`                                 |
| 删除 | `Modal.confirm` 二次确认 → `deleteCard({ id })` → `refresh()`            |

`handleDelete` 同时被列表和 `ViewCardModal` 复用（通过 props 传入）。

### 11.4 下拉无限加载

使用原生 `IntersectionObserver` 监听底部哨兵元素，避免引入额外库。

#### 核心逻辑

```typescript
// 状态
const [page, setPage] = useState(1);
const [allList, setAllList] = useState<CardItem[]>([]);
const [total, setTotal] = useState(0);
const hasMore = allList.length < total;

// 列表请求（manual，由 useEffect 和 observer 触发）
const { loading, run: loadPage } = useRequest(() => getCardList({ pageNo: page, pageSize: 20 }), {
  manual: true,
  onSuccess: (res) => {
    const newList = res?.data?.list ?? [];
    setTotal(res?.data?.total ?? 0);
    // page === 1 时重置（刷新场景），否则追加
    setAllList((prev) => (page === 1 ? newList : [...prev, ...newList]));
  },
});

// page 变化触发加载
useEffect(() => {
  loadPage();
}, [page]);

// IntersectionObserver 触发翻页
useEffect(() => {
  if (!sentinelRef.current || !hasMore || loading) return;
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) setPage((p) => p + 1);
    },
    { threshold: 0.1 },
  );
  observer.observe(sentinelRef.current);
  return () => observer.disconnect();
}, [hasMore, loading]);
```

#### 刷新策略

删除成功后调用 `refresh()`：

```typescript
const refresh = useCallback(() => {
  setPage(1);
  setAllList([]);
  loadPage(); // page 已是 1 时 useEffect 不会重新触发，需手动调用
}, [loadPage]);
```

#### 底部哨兵 UI

```tsx
<div ref={sentinelRef} className="CardManagement-sentinel">
  {loading && <span>加载中...</span>}
  {!hasMore && allList.length > 0 && <span>已加载全部</span>}
</div>
```

---

## 12. 查看弹窗（`src/pages/Card/components/ViewCardModal.tsx`）

### 12.1 功能概述

只读弹窗，宽度 960px，展示单张卡片的完整信息。由列表页卡片悬浮遮罩层的「查看」按钮触发。

```
Props:
  visible: boolean        — 显隐控制
  cardId: string | null   — 当前查看的卡片 ID
  onClose: () => void     — 关闭回调
  onDelete: (id) => void  — 删除回调（由列表页传入，逻辑在列表页维护）
```

### 12.2 数据获取

```typescript
const { data, loading } = useRequest(() => getCardDetail({ id: cardId! }), {
  ready: visible && Boolean(cardId), // 弹窗可见且有 ID 时才发请求
  refreshDeps: [cardId], // cardId 变化时重新获取
});
```

- `destroyOnClose`：关闭时销毁 DOM，下次打开重新初始化（避免残留旧数据）
- `uiJson` 字符串需 `JSON.parse` 后传给 `SpecPreview`（**待修复**：当前代码使用 `cardData?.spec`，与后端实际返回字段 `uiJson` 不一致）

### 12.3 布局结构

```
┌──────────────────────────────────────────────────┐
│  查看卡片                                   [×]  │
├──────────────────┬───────────────────────────────┤
│                  │  ▼ UI Spec JSON（折叠 2 层）   │
│   SpecPreview    │  { version, theme, root… }    │
│   （左栏预览）    ├───────────────────────────────┤
│                  │  内容                          │
│                  │  ▼ cardData JSON（折叠 1 层）  │
│                  │  { id, specName, uiJson… }    │
├──────────────────┴───────────────────────────────┤
│  [编辑]                              [删除]       │
└──────────────────────────────────────────────────┘
```

- **左栏**：`SpecPreview` 渲染卡片预览，使用 `defaultRuntimeData` 填充绑定变量
- **右上**：`react-json-view` 展示 `PreviewSpec` 对象（collapsed=2），供开发者调试 spec 结构
- **右下**：`react-json-view` 展示完整 `cardData` 响应（collapsed=1），供查看 `specName`、时间等元数据

### 12.4 操作按钮

| 按钮 | 行为                                                                            |
| ---- | ------------------------------------------------------------------------------- |
| 编辑 | `onClose()` 后 `navigate('/card/editor?id=${cardId}')`                          |
| 删除 | `onClose()` 后调用 `onDelete(cardId)`（确认弹窗由列表页的 `handleDelete` 维护） |

> **注意**：删除操作先关弹窗再执行，避免 `Modal.confirm` 被父级弹窗遮挡。

### 12.5 已知问题

| 问题              | 位置                   | 说明                                                           |
| ----------------- | ---------------------- | -------------------------------------------------------------- |
| `spec` 字段不存在 | `ViewCardModal.tsx:30` | `cardData?.spec` 应改为 `JSON.parse(cardData?.uiJson ?? '{}')` |

---

## 13. 后续演进方向

1. **Undo/Redo**：基于 spec 快照栈实现
2. **更多节点类型**：表格、列表、标签页等
3. **组件目录注册机制**：对齐 json-render 的 catalog 模式，支持自定义扩展
4. **增量更新**：LLM 返回 JSON Patch 而非全量 spec
5. **生产 LLM 服务对接**：`/agent/api/cotui/chat` 替换 a2ui 开发服务器
6. **specName 输入框**：CardEditor 增加卡片命名入口
