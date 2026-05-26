# Agent Skills Management Proposal

## Why

随着 AI Agent 生态的发展，用户需要更灵活地扩展 Agent 的能力。当前系统缺乏统一的 Skill 管理机制，无法让用户上传、管理和复用自定义的 Skill。通过引入 Agent Skills 管理系统，可以提升 Agent 的扩展性和用户自定义能力，满足不同场景下的个性化需求。

## What Changes

- **新增 Agent Skills 一级菜单栏**：在 Agent 模板上方新增 Agent Skills 菜单
- **Skill 列表页面**：展示所有 Skill 的列表，包含 Skill 信息、状态、引用数等字段
- **Skill 上传功能**：支持.zip 和.skill 格式的文件上传，包含拖拽上传和点击上传
- **Skill 删除功能**：提供删除操作，包含二次确认机制
- **Skill 关联功能**：在 Agent 编排中支持关联内置 Skill 和自定义 Skill
- **内置 Skill 集成**：集成 Anthropic 提供的 Skill 集合作为内置 Skill
- **白名单机制**：按租户控制功能可见性

## Capabilities

### New Capabilities

- **agent-skills-list**: 自定义 Skill 列表展示和管理功能
- **skill-upload**: Skill 文件上传和处理功能
- **skill-association**: Agent 与 Skill 的关联管理功能（复用 tools 和 workflow 的关联逻辑）

### Modified Capabilities

- **agent-management**: 扩展 Agent 编排功能以支持 Skill 关联
- **navigation-menu**: 新增 Agent Skills 一级菜单项

## Impact

### 影响范围

- **前端组件**: 需要新增 Skill 相关组件，包括列表、上传弹窗、关联弹窗等
- **API 接口**: 需要新增 Skill 管理相关的 REST API
- **数据库**: 需要新增 Skill 相关的数据表结构
- **权限系统**: 需要扩展权限控制以支持白名单机制
- **现有功能**: Agent 编排功能需要扩展以支持 Skill 调用

### 技术依赖

- 复用现有的 ToolModal 组件
- 参考现有的上传组件实现
- 遵循现有的表格和页面开发规范
- 需要集成文件上传服务（NOS）

### 数据接口

- Skill 列表查询接口
- Skill 上传接口
- Skill 删除接口
- Skill 关联接口
- 内置 Skill 同步接口
