## ADDED Requirements

### Requirement: 卡片列表接口

#### Scenario: 获取分页列表

- **WHEN** 调用 `getCardList({ pageNo, pageSize })`
- **THEN** 返回 `{ total, list: CardItem[] }`，列表按更新时间倒序

### Requirement: 卡片详情接口

#### Scenario: 获取单个卡片数据

- **WHEN** 调用 `getCardDetail({ id })`
- **THEN** 返回包含 `spec`（`PreviewSpec`）和卡片内容数据的对象

### Requirement: 保存卡片接口

#### Scenario: 新建卡片

- **WHEN** 调用 `saveCard({ spec, name })`（无 `id`）
- **THEN** 后端创建新卡片，返回成功

#### Scenario: 更新卡片

- **WHEN** 调用 `saveCard({ id, spec, name })`（有 `id`）
- **THEN** 后端更新对应卡片，返回成功

### Requirement: 删除卡片接口

#### Scenario: 删除卡片

- **WHEN** 调用 `deleteCard({ id })`
- **THEN** 后端删除该卡片，返回成功；前端刷新列表
