# Agent Skills List Specification

## ADDED Requirements

### Requirement: Skill 列表页面展示

系统 SHALL 在 Agent 模板上方新增 Agent Skills 一级菜单栏，点击后展示 Skill 列表页面。

#### Scenario: 访问 Skill 列表页面

- **WHEN** 用户点击 Agent Skills 菜单
- **THEN** 系统显示 Skill 列表页面，包含页面标题"Agent Skills"

#### Scenario: 列表字段展示

- **WHEN** 用户查看 Skill 列表
- **THEN** 系统显示以下字段：Skill、状态、Agent 引用数、更新时间、发布时间、操作

### Requirement: Skill 信息展示

系统 SHALL 正确展示每个 Skill 的详细信息。

#### Scenario: Skill 名称和描述展示

- **WHEN** Skill 名称或描述超出显示范围
- **THEN** 系统使用"..."代替超出部分
- **WHEN** 用户鼠标 hover 在 Skill 名称或描述上
- **THEN** 系统显示完整的名称和描述内容

#### Scenario: 状态展示

- **WHEN** 用户查看 Skill 状态
- **THEN** 系统显示"成功"、"上传失败"或"上传中"状态

### Requirement: 列表排序和分页

系统 SHALL 按照发布时间降序排列 Skill 列表，并支持分页显示。

#### Scenario: 列表排序

- **WHEN** 用户查看 Skill 列表
- **THEN** 系统按照发布时间降序排列，最新上传的排在最上面

#### Scenario: 分页显示

- **WHEN** Skill 数量超过 50 条
- **THEN** 系统显示分页器，每页最多展示 50 条数据

### Requirement: Skill 删除功能

系统 SHALL 提供 Skill 删除功能，包含二次确认机制。

#### Scenario: 删除操作

- **WHEN** 用户点击删除按钮
- **THEN** 系统弹出二次确认弹窗
- **WHEN** 用户在确认弹窗中点击"删除"
- **THEN** 系统删除该 Skill 并刷新列表
- **WHEN** 用户在确认弹窗中点击"取消"
- **THEN** 系统关闭弹窗，不执行删除操作

### Requirement: 上传 Skill 按钮

系统 SHALL 在列表页面提供上传 Skill 按钮。

#### Scenario: 点击上传按钮

- **WHEN** 用户点击"上传 Skill"按钮
- **THEN** 系统弹出上传 Skill 弹窗
