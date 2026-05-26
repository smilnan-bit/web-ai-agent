## Why

Agent 平台的 CotUi（json-render 风格）卡片能力目前仅在管理后台编辑器 `/card/editor` 内部可预览，访客端（`basic-web-visitor`）无法渲染，工作流 Dialog 节点也不能将 CotUi spec 作为下发内容。为了打通「LLM 生成结构化卡片 → 工作流编排 → 访客端渲染 → 用户交互回传」端到端链路，需要新增独立协议、扩展 Dialog 节点、并在访客端实现渲染与回传能力。

## What Changes

- **协议**：新增 CotUi 专用下发 cmd `13004`（server → visitor）与上报 cmd `13005`（visitor → server），不复用现有 cmd 203「一触即达」分发机制
- **访客端消息类型**：新增 `QyMsgTypeEnum.COTUI` 顶层消息类型，与 `TEXT` / `WORKFLOW` 并列，在 `msgConfigMap` 注册 `CotUiMsg` 组件
- **访客端渲染器**：移植 `SpecPreview` 至 `basic-web-visitor`，antd 部件替换为原生 `<input>` / `<button>` / `<select>`；支持消息气泡样式（H5/PC 默认）与底部弹窗样式（PC 覆盖）
- **工作流 Dialog 节点**：`CardTypeEnum` 扩展 `cotUi`，`CardConfig.cotUi = { specId, bindings, outputKeys }`；分支路由按 `action.name` 生成；USER_RESPONSE 按 spec meta 展平
- **共享类型包**：抽 `@ysf/cotui-core` 内部 npm 包，统一 `PreviewSpec` / `CotUiEvent` 类型与 `resolveBinding` / `normalizeSpec` 纯函数
- **CardEditor**：新增 `GET /cotui/spec/meta` 接口，返回 spec 的 `reportDataKeys / actionNames / bindingPaths`，供 Dialog 节点变量映射面板使用
- **旧端降级**：后端根据访客端 SDK 版本判断，旧端不下发 cmd 13004，降级为 TEXT 消息 + `radio_button` 模板（走 cmd 203）

## Capabilities

### New Capabilities

- `cotui-protocol`：CotUi 卡片的下发/回传 cmd 协议、卡片身份标识（`cardId`）、幂等/超时语义、旧端降级
- `cotui-visitor-renderer`：访客端 CotUi 消息类型注册、渲染器、交互回传、校验、历史回看、双端样式差异

### Modified Capabilities

- `dialog-node-cotui`：工作流 Dialog 节点新增 `cotUi` 卡片类型；分支路由按 `action.name` 生成；输出参数由 spec meta 推导

## Impact

**web-ai-agent（管理后台）**

- `src/pages/AppList/components/EditContent/BindCard/constants.ts`：`CardTypeEnum` 新增 `cotUi`
- `src/pages/Workflow/NewGraph/nodes/dialog/form.tsx`：`CardConfig` 扩展
- `src/pages/Workflow/NewGraph/nodes/dialog/index.ts`：`getBackendEdgeData` / `getPortIdFromEdgeData` 增 cotUi 分支
- `src/pages/Workflow/NewGraph/nodes/dialog/output.tsx`：新增 `getDialogOutParamByCotUiCard`
- `src/pages/Workflow/NewGraph/nodes/dialog/card-cotui.tsx`（新）
- `src/api/card.ts`：新增 `getSpecMeta`

**basic-web-visitor（访客端）**

- `source/protocol/cmd_13004.ts`（新）、`source/protocol/cmd_13005.ts`（新）、`source/protocol/index.ts`：导出
- `source/typings/qiyu.ts`：`QyMsgTypeEnum.COTUI`
- `source/components/MessageList/msgComponents/CotUiMsg/`（新目录，含 `index.tsx` / `index.pc.tsx` / `Renderer.tsx` / `emit.ts`）
- `source/components/MessageList/msgComponents/index.tsx`：`msgConfigMap` 注册
- `source/im/splitMsg.ts`（或等效位置）：cmd 13004 → `QyMessage` 转换
- `source/api/socketApi.ts`：`sendCotuiEvent`

**共享**

- 新建 npm 包 `@ysf/cotui-core`（类型 + 纯函数），双端依赖

**后端（不在本次前端范围，需对齐契约）**

- 工作流引擎：Dialog.cotUi 节点执行 → resolve bindings → 发 cmd 13004
- IM 网关：cmd 13005 → 按 `actionName` 路由分支 → USER_RESPONSE
- 访客端版本判断 + 旧端降级路径

## Non-goals

- **不**实现增量 spec 更新（JSON Patch），本次仍全量下发
- **不**做多人协同编辑卡片
- **不**扩充节点类型（仍限 7 种：card/column/row/text/input/button/divider/badge/image）
- **不**在访客端内嵌 LLM 直连调用，所有 spec 由后端下发
