# Skill Association Specification

## ADDED Requirements

### Requirement: Agent 编排中的 Skill 模块

系统 SHALL 在 Agent 编排的工作流下方新增 Skill 模块。

#### Scenario: Skill 模块展示

- **WHEN** 用户进入 Agent 编排页面
- **THEN** 系统在工作流下方显示 Skill 模块
- **THEN** 系统展示所有关联的 Skill 的名称和描述

### Requirement: 添加 Skill 功能

系统 SHALL 提供添加 Skill 的功能。

#### Scenario: 打开添加 Skill 弹窗

- **WHEN** 用户点击"添加"图标
- **THEN** 系统弹出"添加 Skill"弹窗

### Requirement: Skill 分类展示

系统 SHALL 在添加 Skill 弹窗中分类展示 Skill。

#### Scenario: Skill 分类

- **WHEN** 用户打开添加 Skill 弹窗
- **THEN** 系统显示"内置 Skill"和"自定义 Skill"两个分类
- **THEN** 系统默认定位在"全部"分类

### Requirement: Skill 信息展示

系统 SHALL 在弹窗中展示每个 Skill 的详细信息。

#### Scenario: Skill 信息展示

- **WHEN** 用户查看 Skill 列表
- **THEN** 系统显示每个 Skill 的 LOGO、名称和描述
- **WHEN** Skill 描述超出显示范围
- **THEN** 系统使用"..."代替超出部分
- **WHEN** 用户鼠标 hover 在 Skill 描述上
- **THEN** 系统显示完整的描述内容

### Requirement: Skill 关联操作

系统 SHALL 提供添加、移除、已添加三种状态按钮。

#### Scenario: 添加 Skill

- **WHEN** 用户点击"添加"按钮
- **THEN** 系统将该 Skill 关联到当前 Agent
- **THEN** 系统更新按钮状态为"已添加"

#### Scenario: 移除 Skill

- **WHEN** 用户点击"移除"按钮
- **THEN** 系统取消该 Skill 与当前 Agent 的关联
- **THEN** 系统更新按钮状态为"添加"

#### Scenario: 已添加状态

- **WHEN** Skill 已关联到当前 Agent
- **THEN** 系统显示"已添加"按钮状态

### Requirement: 空状态处理

系统 SHALL 正确处理关联为空的情况。

#### Scenario: 空状态展示

- **WHEN** 没有关联任何 Skill
- **THEN** 系统显示提示文案："您可直接关联内置 Skill，也可上传自己的 Skill 进行使用。"

### Requirement: 关联逻辑复用

系统 SHALL 复用 Tools 和 Workflows 的关联逻辑。

#### Scenario: 关联事件触发

- **WHEN** 用户进行 Skill 关联操作
- **THEN** 系统使用 `AppEventBus.emit(EventTypeEnum.saveAppData, ...)` 模式触发保存事件
