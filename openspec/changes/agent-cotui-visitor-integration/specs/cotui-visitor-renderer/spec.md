## ADDED Requirements

### Requirement: 注册 QyMsgTypeEnum.COTUI 消息类型

访客端 MUST 在顶层消息类型枚举 `QyMsgTypeEnum` 中新增 `COTUI` 值，与 `TEXT` / `WORKFLOW` / `QA` 等并列。

#### Scenario: 消息类型注册

- **WHEN** 访客端构建消息路由表 `msgConfigMap`
- **THEN** `msgConfigMap[QyMsgTypeEnum.COTUI]` 指向 `CotUiMsg` 组件，并启用 `nosysMsgConfig`（含 isBubble/showName/showTime/showAvatar）

### Requirement: CotUi 消息组件落点独立于 WorkflowMsg

CotUi 消息组件 MUST 位于 `source/components/MessageList/msgComponents/CotUiMsg/`，与 WorkflowMsg 平级，SHALL NOT 作为 WorkflowMsg 的子模板。

#### Scenario: CotUiMsg 目录结构

- **WHEN** 访客端接入 CotUi 消息类型
- **THEN** 创建以下文件：
  - `CotUiMsg/index.tsx`：消息入口（H5 默认 + PC 气泡样式）
  - `CotUiMsg/index.pc.tsx`：PC 端覆盖，用 `@ebay/nice-modal-react` 实现底部弹窗
  - `CotUiMsg/Renderer.tsx`：移植版 SpecPreview 渲染器
  - `CotUiMsg/emit.ts`：组装 cmd 13005 payload 并通过 `imServer.send` 发送
  - `CotUiMsg/resolveBinding.ts`：从 `@ysf/cotui-core` 引入

### Requirement: IM 层将 cmd 13004 转换为 QyMessage

IM 层（`source/im/splitMsg.ts` 或等效位置）MUST 监听 cmd 13004，将其转换为 `QyMessage`，`msgType = QyMsgTypeEnum.COTUI`，`body` 携带 cardId / spec / runtimeData / fallback。

#### Scenario: cmd 13004 → QyMessage 转换

- **WHEN** 访客端 IM 层收到 cmd 13004
- **THEN** 构造 `QyMessage`：`msgType = COTUI`，`msgidClient = payload.msgidClient`，`body = { cardId, spec, runtimeData, fallback }`，并插入消息列表

#### Scenario: spec 解析失败

- **WHEN** 访客端渲染过程中抛出异常（spec 结构异常、未知节点类型等）
- **THEN** 降级显示 `fallback.text` 作为普通文本消息，不影响消息列表其他项

### Requirement: 渲染器复用 PreviewSpec 类型与纯函数

访客端渲染器 MUST 从 `@ysf/cotui-core` 引入 `PreviewSpec` 类型、`resolveBinding`、`normalizeSpec` 函数，SHALL NOT 在访客端仓重复定义。

#### Scenario: 类型来源

- **WHEN** 访客端实现 Renderer.tsx
- **THEN** `import type { PreviewSpec } from '@ysf/cotui-core'`；`import { resolveBinding, normalizeSpec } from '@ysf/cotui-core'`

#### Scenario: antd 部件替换

- **WHEN** Renderer 渲染 `input / button / select / buttonGroup` 节点
- **THEN** 使用原生 `<input>` / `<button>` / 自定义选项列表，不引入 antd；样式继续使用 twin.macro

### Requirement: runtimeData 仅在访客端运行时解析

访客端渲染 CotUi 卡片时，`runtimeData` MUST 已由后端注入到 cmd 13004 payload。访客端 SHALL NOT 从 SDK 上下文或全局 store 读取额外变量。

#### Scenario: binding 解析

- **WHEN** Renderer 遇到 spec 中的 `BindingValue`（`{ binding: "user.name", fallback }`）
- **THEN** 使用 `resolveBinding(bindingValue, runtimeData)` 得到最终字符串；解析失败时使用 `fallback`

### Requirement: 按钮状态机区分三种 action 类型

根据按钮 `action.type`，访客端 MUST 实施不同交互状态：

| action.type | 回源工作流 | 点击后卡片状态 | 是否允许重复点击 |
|---|---|---|---|
| submit | 是 | 整卡所有按钮置灰 | 否 |
| emit | 是 | 不变 | 是 |
| navigate | 否 | 不变 + 打开 URL | 是 |

#### Scenario: 点击 submit 按钮

- **WHEN** 用户点击 `action.type === 'submit'` 的按钮
- **THEN** 校验通过后发送 cmd 13005（`event.type = 'action'`, `actionType = 'submit'`），并立即将整卡所有按钮设置为 `disabled`

#### Scenario: 点击 emit 按钮

- **WHEN** 用户点击 `action.type === 'emit'` 的按钮
- **THEN** 发送 cmd 13005，但卡片状态不变，按钮仍可再次点击

#### Scenario: 点击 navigate 按钮

- **WHEN** 用户点击 `action.type === 'navigate'` 的按钮
- **THEN** 根据 `payload.url` 打开新标签页，**不**发送 cmd 13005

### Requirement: 输入校验在访客端前置拦截

访客端 MUST 在用户点击 submit 按钮时对 `input / select / buttonGroup` 节点进行前置校验（`required / type / pattern`），校验不通过时 SHALL 阻止提交。

#### Scenario: 必填项未填

- **WHEN** 用户点击 submit 按钮且存在 `required: true` 的 input 为空
- **THEN** 对应 input 显示错误提示（红框 + 文案），不发送 cmd 13005

#### Scenario: 格式校验失败

- **WHEN** 用户点击 submit 按钮且存在 `type === 'email'` 的 input 值不符合邮箱格式
- **THEN** 对应 input 显示错误提示，不发送 cmd 13005

### Requirement: 双端样式由访客端自行决定

cmd 13004 SHALL NOT 下发 `outputStyle` 字段。卡片展示形态（气泡 / 底部弹窗）MUST 由访客端根据平台（H5 / PC）和 spec 特征（交互复杂度、表单项数量等）自行决定。

#### Scenario: H5 端渲染

- **WHEN** 访客端在 H5 平台渲染 CotUi 消息
- **THEN** 使用 `CotUiMsg/index.tsx` 默认实现，卡片作为气泡消息插入消息列表

#### Scenario: PC 端渲染

- **WHEN** 访客端在 PC 平台渲染 CotUi 消息
- **THEN** 使用 `CotUiMsg/index.pc.tsx` 实现；默认走气泡样式，如有产品定义的局部规则（如表单项 ≥ 3 个）可走底部弹窗（`@ebay/nice-modal-react`）

### Requirement: 历史消息回看保留 spec 与 runtimeData 快照

IM 消息体 MUST 完整存储首次下发时的 spec 与 runtimeData，历史回看 SHALL 使用快照渲染。

#### Scenario: 用户回看历史会话

- **WHEN** 用户滚动消息列表看到一条历史 CotUi 消息
- **THEN** 使用消息体内存储的 spec + runtimeData 渲染；若消息已被标记为 `submitted`（本地缓存 + 后端状态），整卡按钮置灰

#### Scenario: spec 改版后的历史回看

- **WHEN** CardEditor 将该卡片的 spec 改版保存
- **THEN** 历史消息仍使用消息体内的旧 spec 快照，不受新版本影响

### Requirement: XSS 与资源白名单

Renderer MUST 对潜在不可信内容进行强校验：

- 文本节点 SHALL 仅使用 `textContent`，SHALL NOT 使用 `dangerouslySetInnerHTML`
- image 节点 `src` MUST 通过 `imageDomainWhitelist` 校验
- button `action.type` 枚举外的值 SHALL 被忽略（按钮不渲染或不可点击）

#### Scenario: text 节点渲染

- **WHEN** Renderer 渲染 `type === 'text'` 节点
- **THEN** 将解析后的字符串通过 React children（等价 textContent）注入，不允许 HTML

#### Scenario: image 节点非法 src

- **WHEN** image 节点的 `src` 不在白名单
- **THEN** image 降级为空白占位或隐藏

#### Scenario: 未知 action.type

- **WHEN** button 节点 `action.type` 不属于 `'emit' | 'navigate' | 'submit'`
- **THEN** 按钮渲染为 disabled 状态，点击无响应
