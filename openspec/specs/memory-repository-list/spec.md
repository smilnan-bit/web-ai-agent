# 记忆库列表页面规格

## ADDED Requirements

### Requirement: 记忆库列表展示

系统 SHALL 以卡片列表形式展示所有记忆库，每个卡片 MUST 包含以下信息：

- 记忆库名称
- 记忆库描述（可选，无描述时显示占位文案）
- 创建时间

#### Scenario: 正常加载记忆库列表

- **WHEN** 用户进入记忆库列表页面
- **THEN** 系统调用 `/agent/api/memory/repository/list` 获取数据并展示卡片列表

#### Scenario: 记忆库列表为空

- **WHEN** 用户进入记忆库列表页面且无任何记忆库
- **THEN** 系统展示空状态占位图和"新建记忆库"引导按钮

### Requirement: 新建记忆库

系统 SHALL 提供新建记忆库的功能，通过弹窗表单实现。

表单字段：

- **名称**（必填）：只能使用英文字母、数字、下划线，MUST 以英文字母开头
- **描述**（选填）：记忆库用途说明

#### Scenario: 成功创建记忆库

- **WHEN** 用户点击"新建记忆库"按钮
- **THEN** 系统弹出新建表单弹窗
- **WHEN** 用户填写合法的名称并点击确认
- **THEN** 系统调用 `/agent/api/memory/repository/save` 保存记忆库，成功后刷新列表

#### Scenario: 名称格式校验失败

- **WHEN** 用户输入的名称不符合格式要求（如以数字开头、包含特殊字符）
- **THEN** 系统在输入框下方显示格式错误提示，禁止提交

#### Scenario: 名称为空校验

- **WHEN** 用户未填写名称直接点击确认
- **THEN** 系统提示"请输入记忆库名称"

### Requirement: 删除记忆库

系统 SHALL 提供删除记忆库的功能，删除前 MUST 检查是否有 Agent 关联该记忆库。

#### Scenario: 删除未关联 Agent 的记忆库

- **WHEN** 用户点击某记忆库卡片上的删除按钮
- **THEN** 系统调用 `/agent/api/memory/repository/checkAssociation` 检查关联状态
- **WHEN** 检查结果显示无 Agent 关联
- **THEN** 系统弹出二次确认弹窗，确认后调用 `/agent/api/memory/repository/delete` 执行软删除

#### Scenario: 删除已关联 Agent 的记忆库

- **WHEN** 用户点击某记忆库卡片上的删除按钮
- **THEN** 系统调用 `/agent/api/memory/repository/checkAssociation` 检查关联状态
- **WHEN** 检查结果显示有 Agent 关联
- **THEN** 系统弹窗提示"该记忆库已被 Agent 关联，请先解除关联后再删除"，禁止删除操作

### Requirement: 进入记忆库详情

系统 SHALL 支持点击卡片进入记忆库详情页面。

#### Scenario: 点击卡片进入详情

- **WHEN** 用户点击某记忆库卡片（非删除按钮区域）
- **THEN** 系统跳转到该记忆库的详情页面，URL 格式为 `/memory-repository/detail?repositoryId={id}`

### Requirement: 白名单访问控制

记忆库列表页面 MUST 受白名单控制，未开启白名单的租户无法访问。

#### Scenario: 白名单用户访问

- **WHEN** 已开启记忆库白名单的租户用户访问记忆库列表
- **THEN** 系统正常展示记忆库列表页面

#### Scenario: 非白名单用户访问

- **WHEN** 未开启记忆库白名单的租户用户尝试访问记忆库列表
- **THEN** 系统隐藏侧边栏中的"记忆库"入口，直接访问路由时重定向到首页或显示无权限提示
