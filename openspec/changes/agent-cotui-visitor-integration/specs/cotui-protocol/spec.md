## ADDED Requirements

### Requirement: 使用独立 cmd 承载 CotUi 卡片下发

CotUi 卡片下发 MUST 使用独立的 cmd `13004`，SHALL NOT 复用 cmd 203「一触即达」分发机制，也 SHALL NOT 新增 `TemapteIdEnum` 枚举。

#### Scenario: 后端执行 Dialog.cotUi 节点

- **WHEN** 工作流引擎执行到一个 `CardConfig.cardType === 'cotUi'` 的 Dialog 节点
- **THEN** 发送 cmd 13004 至访客端，payload 不经过 cmd 203 任何分发逻辑

#### Scenario: 访客端收到未知 cmd

- **WHEN** 旧版访客端收到 cmd 13004 且未注册该 cmd 处理器
- **THEN** 消息被 IM 层丢弃，不渲染任何 UI（由后端按 SDK 版本降级保证不会发送到此类访客端）

### Requirement: 回源上下文由 msgidClient 唯一索引

cmd 13004 / cmd 13005 payload SHALL NOT 携带 `dialogId / flowId / nodeId / nodeType / requestId / preRequestId` 等工作流上下文字段。回源信息 MUST 由后端自行存储，以 `msgidClient` 为主键维护 `msgidClient → 工作流节点实例` 的映射。

#### Scenario: 访客端上报时仅回传 msgidClient

- **WHEN** 访客端构造 cmd 13005 上报事件
- **THEN** 将 cmd 13004 的 `msgidClient` 原样复制到 cmd 13005；SHALL NOT 携带任何工作流上下文字段

#### Scenario: 后端接收上报时按 msgidClient 定位

- **WHEN** 后端收到 cmd 13005
- **THEN** MUST 使用 `msgidClient` 在内部状态表中查找对应的 Dialog 节点实例，并路由到对应分支

### Requirement: 下发 payload 携带卡片身份标识

cmd 13004 payload MUST 携带 `cardId` 字段，值为后端 `/cotui/spec/save` 返回的卡片 id。`cardId` 用于访客端去重、埋点统计、历史回看缓存键，SHALL NOT 用于访客端主动拉取 spec（spec 永远内联下发）。

#### Scenario: 访客端收到 cmd 13004

- **WHEN** 访客端收到 cmd 13004
- **THEN** `payload.cardId` MUST 为有效的卡片 id（非空）

#### Scenario: 访客端缓存键

- **WHEN** 访客端需要缓存/去重一张卡片的本地状态（如 `submitted` 标记）
- **THEN** SHALL 使用 `msgidClient` 作为主键（每次下发唯一）；如需跨消息统计同一卡片的行为，可辅以 `cardId`

### Requirement: spec 永远内联下发

cmd 13004 payload MUST 直接内联完整 `spec`（`PreviewSpec`），SHALL NOT 引入 `mode` 等间接索引字段。spec 体积由后端在保存时做上限约束。

#### Scenario: 访客端收到 cmd 13004

- **WHEN** 访客端收到 cmd 13004
- **THEN** `payload.spec` MUST 为完整 `PreviewSpec` 对象，访客端 SHALL 直接渲染，SHALL NOT 发起二次拉取

#### Scenario: spec 体积超限

- **WHEN** CardEditor 保存的 spec 序列化字节数超过后端上限
- **THEN** 后端 SHALL 在保存接口返回错误，阻止过大 spec 进入工作流下发链路

### Requirement: 所有上报事件使用独立 cmd 13005

访客端上报用户在 CotUi 卡片上的交互（按钮点击、可选生命周期事件）MUST 走 cmd 13005，SHALL NOT 走 cmd 220（埋点）或其他已有上报 cmd。

#### Scenario: 按钮点击事件上报

- **WHEN** 用户在 CotUi 卡片上点击 `action.type === 'submit' | 'emit'` 的按钮
- **THEN** 访客端发送 cmd 13005，`event.type = 'action'`，携带 `actionType / actionName / buttonNodeId / staticPayload / formValues`

#### Scenario: 生命周期事件上报（可选）

- **WHEN** CotUi 卡片渲染成功 / 被用户关闭
- **THEN** 访客端可选择发送 cmd 13005，`event.type = 'lifecycle'`，`event.lifecycle` 为 `render` / `close`（仅用于埋点，后端 SHALL NOT 依赖）

### Requirement: 上报幂等

同一 `msgidClient` 的 `submit` 类事件 MUST 保证幂等，重复上报 SHALL NOT 触发重复分支执行。

#### Scenario: 网络抖动导致重发

- **WHEN** 访客端因网络抖动对同一 `submit` 动作发送两次 cmd 13005
- **THEN** 后端按 `(msgidClient, actionName)` 去重，仅执行一次分支路由

#### Scenario: 用户连续点击同一按钮

- **WHEN** 用户连续点击 `action.type === 'submit'` 按钮
- **THEN** 访客端本地立即禁用该按钮，仅发送一次 cmd 13005

### Requirement: 超时完全由后端处理

协议层 SHALL NOT 携带任何超时字段。访客端 SHALL NOT 主动发起超时。Dialog 节点的 `askUserLimit` 超时完全由后端独立计时并处理。

#### Scenario: 后端独立超时走 otherwise 分支

- **WHEN** 后端在 `askUserLimit` 内未收到 cmd 13005
- **THEN** 后端主动将 Dialog 节点路由至 otherwise 分支

#### Scenario: 超时后访客端仍点击

- **WHEN** 超时发生后，访客端用户才点击 submit 按钮，cmd 13005 到达后端
- **THEN** 后端 MUST 按 `msgidClient` 检查该 Dialog 节点实例是否已进入终态，若已进入 SHALL 静默丢弃该事件（或返回 error cmd）

### Requirement: 旧版访客端必须由后端主动降级

后端 MUST 按访客端 SDK 版本判断；不支持 cotui 的旧端，后端 SHALL NOT 下发 cmd 13004。

#### Scenario: 访客端 SDK 版本低于 cotui 支持版本

- **WHEN** 工作流执行到 Dialog.cotUi 节点，且当前会话的访客端 SDK 版本低于 cotui 最低版本
- **THEN** 后端改为下发 cmd 203 + `radio_button` 模板，label 使用 Dialog 节点的 `content`，选项来自 spec 内 `submit` 按钮的 `action.name`

#### Scenario: 访客端 SDK 版本未知

- **WHEN** 后端无法确定访客端 SDK 版本
- **THEN** 默认按旧端处理，发送 TEXT 消息 + `fallback.text`
