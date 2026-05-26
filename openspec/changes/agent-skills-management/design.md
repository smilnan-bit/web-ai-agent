# Agent Skills Management Design

## Context

当前系统已有完善的 Tools 和 Workflows 管理功能，需要在此基础上扩展 Agent Skills 管理能力。根据 POPO 交互稿，Skills 管理主要包括自定义 Skills 的上传、管理和关联功能，内置 Skills 由后端统一管理，前端仅负责展示。

## Goals / Non-Goals

**Goals:**

- 实现自定义 Skills 的完整生命周期管理（上传、列表展示、删除）
- 复用现有的 Tools 和 Workflows 关联逻辑实现 Skills 关联功能
- 遵循现有组件规范和代码风格
- 支持.zip 和.skill 格式文件上传

**Non-Goals:**

- 内置 Skills 的管理功能（由后端统一处理）
- Skills 的多轮交互功能（本期仅支持单轮交互）
- Skills 的运行时调试功能

## Decisions

### 1. 关联功能复用策略

- **决策**: 复用 Tools 和 Workflows 的关联逻辑，使用相同的 EventBus 机制
- **理由**: 减少重复代码，保持一致性，降低维护成本
- **实现**: 使用 `AppEventBus.emit(EventTypeEnum.saveAppData, ...)` 模式

### 2. 内置 Skills 处理策略

- **决策**: 内置 Skills 数据完全由后端提供，前端仅负责展示
- **理由**: 简化前端逻辑，便于统一管理内置 Skills 集合
- **实现**: 通过 API 获取内置 Skills 列表，与自定义 Skills 统一展示

### 3. API 设计策略

- **决策**: 参考 Tools 模块的 API 设计模式
- **理由**: 保持 API 风格一致性，便于理解和维护
- **实现**: 使用类似的接口命名和参数结构

### 4. 组件复用策略

- **决策**: 复用 ToolModal 组件作为 Skills 弹窗基础
- **理由**: 减少组件开发工作量，保持 UI 一致性
- **实现**: 基于 ToolModal 扩展 Skills 特定功能

## Risks / Trade-offs

### 风险与缓解措施

- **风险**: Skills 关联逻辑与 Tools/Workflows 不完全一致

  - **缓解**: 充分测试关联场景，确保逻辑兼容性

- **风险**: 文件上传格式支持问题

  - **缓解**: 严格验证.zip 和.skill 格式，提供清晰的错误提示

- **风险**: 内置 Skills 数据同步延迟
  - **缓解**: 实现合理的缓存和刷新机制

### 权衡考虑

- **一致性 vs 灵活性**: 优先保持与现有功能的一致性，牺牲部分灵活性
- **开发效率 vs 功能完整性**: 优先实现核心功能，后续迭代完善

## Migration Plan

### 部署步骤

1. 后端 API 部署和数据表创建
2. 前端功能开发和测试
3. 白名单机制配置
4. 功能灰度发布
5. 全量发布

### 回滚策略

- 保留原有功能不变
- 通过白名单控制新功能可见性
- 支持快速回滚到前一个稳定版本
