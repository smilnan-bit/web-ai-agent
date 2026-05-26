# Agent 记忆库绑定规格

## ADDED Requirements

### Requirement: 记忆库绑定入口

系统 SHALL 在 Agent 编辑页面提供记忆库绑定功能入口，该入口 MUST 受白名单控制。

交互模式采用与知识库绑定一致的弹窗方式，但限制只能绑定一个记忆库。

#### Scenario: 白名单用户查看绑定入口

- **WHEN** 已开启记忆库白名单的租户用户进入 Agent 编辑页面
- **THEN** 系统在配置区域展示"记忆库"模块（使用 MultipleEdit 组件）

#### Scenario: 非白名单用户不可见

- **WHEN** 未开启记忆库白名单的租户用户进入 Agent 编辑页面
- **THEN** 系统隐藏"记忆库"模块，用户无法看到此功能

### Requirement: 记忆库绑定状态展示

系统 SHALL 使用 MultipleEdit 组件展示当前绑定的记忆库。

#### Scenario: 已绑定记忆库

- **WHEN** Agent 已绑定记忆库
- **THEN** 模块中展示已绑定的记忆库卡片，显示记忆库名称
- **THEN** 卡片上显示删除按钮可解除绑定

#### Scenario: 未绑定记忆库

- **WHEN** Agent 未绑定任何记忆库
- **THEN** 模块显示空状态和"添加"按钮
- **THEN** 空状态提示文案："关联记忆库后，该 Agent 产生的对话记忆将自动保存到记忆库中"

### Requirement: 记忆库选择弹窗

系统 SHALL 通过弹窗方式让用户选择要绑定的记忆库。

一个 Agent MUST 只能绑定一个记忆库。
一个记忆库 SHALL 可以被多个 Agent 绑定。

#### Scenario: 打开选择弹窗

- **WHEN** 用户点击"添加"按钮
- **THEN** 系统弹出记忆库选择弹窗
- **THEN** 弹窗调用 `/agent/api/memory/repository/list` 获取可用记忆库列表

#### Scenario: 弹窗列表展示

- **WHEN** 弹窗打开且成功获取记忆库列表
- **THEN** 弹窗以列表形式展示所有记忆库，每项显示名称和描述
- **THEN** 已绑定的记忆库显示"已添加"状态标识

#### Scenario: 选择记忆库（未绑定状态）

- **WHEN** Agent 当前未绑定记忆库，用户在弹窗中点击某个记忆库的"添加"按钮
- **THEN** 系统立即将该记忆库绑定到 Agent
- **THEN** 关闭弹窗，模块中展示已绑定的记忆库

#### Scenario: 选择记忆库（已绑定状态）

- **WHEN** Agent 当前已绑定记忆库，用户打开弹窗
- **THEN** 弹窗中已绑定的记忆库显示"已添加"状态
- **THEN** 其他记忆库的"添加"按钮置灰不可点击
- **THEN** 弹窗提示"一个 Agent 只能绑定一个记忆库，如需更换请先解除当前绑定"

#### Scenario: 弹窗中解除绑定

- **WHEN** 用户在弹窗中点击已绑定记忆库的"移除"按钮
- **THEN** 系统解除该记忆库与 Agent 的绑定
- **THEN** 其他记忆库的"添加"按钮恢复可点击状态

#### Scenario: 记忆库列表为空

- **WHEN** 租户下无任何记忆库
- **THEN** 弹窗显示空状态提示"暂无可用记忆库"
- **THEN** 提供"去创建"链接跳转到记忆库列表页面

### Requirement: 解除绑定

系统 SHALL 支持在模块卡片上直接解除记忆库绑定。

#### Scenario: 卡片上解除绑定

- **WHEN** 用户点击已绑定记忆库卡片上的删除按钮
- **THEN** 系统解除该记忆库与 Agent 的绑定
- **THEN** 模块恢复为空状态

### Requirement: 保存绑定关系

系统 SHALL 在保存 Agent 配置时同步保存记忆库绑定关系。

#### Scenario: 保存绑定

- **WHEN** 用户保存 Agent 配置
- **THEN** 系统将记忆库 ID（memoryRepositoryId）包含在 Agent 保存请求中
- **THEN** 后端保存 Agent 与记忆库的绑定关系

#### Scenario: 保存解除绑定

- **WHEN** 用户解除记忆库绑定后保存 Agent 配置
- **THEN** 系统将 memoryRepositoryId 字段设为空提交
- **THEN** 后端解除 Agent 与记忆库的绑定关系
