## ADDED Requirements

### Requirement: 新建/编辑模式区分

CardEditor 通过 URL query 参数区分新建和编辑模式。

#### Scenario: 新建模式

- **WHEN** 用户进入 `/card/editor`（无 `id` 参数）
- **THEN** spec 初始化为 `emptySpec`（version + theme + 空 page root），面包屑末级显示「新建卡片」

#### Scenario: 编辑模式

- **WHEN** 用户进入 `/card/editor?id=xxx`
- **THEN** 调用 `getCardDetail({ id })` 加载卡片数据，spec 初始化为该卡片的 spec，面包屑末级显示「编辑卡片」

#### Scenario: 从空状态引导跳转（携带 state）

- **WHEN** 用户从空状态模板引导页跳转而来（`navigate state` 含 `prompt` 和 `templateSpec`）
- **THEN** spec 初始化为 `templateSpec`，并自动触发首次 AI 对话（以 `prompt` 为用户消息）

### Requirement: 保存行为

#### Scenario: 新建保存成功

- **WHEN** 用户在新建模式下点击「保存」，接口调用成功
- **THEN** toast 提示「创建成功！」并跳转回 `/card`

#### Scenario: 编辑保存成功

- **WHEN** 用户在编辑模式下点击「保存」，接口调用成功
- **THEN** toast 提示「保存成功！」并跳转回 `/card`

### Requirement: 面包屑导航

#### Scenario: 面包屑「卡片管理」可点击

- **WHEN** 用户点击面包屑中的「卡片管理」
- **THEN** 跳转回 `/card`
