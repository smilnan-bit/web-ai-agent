# Agent 长期记忆管理 - 技术设计

## Context

当前项目是网易云商 AI Agent 应用配置与管理平台前端 SPA。Agent 编辑页面采用模块化设计，各功能模块（Tools、Skills、Knowledge、Workflow）通过 `AppEventBus` 事件总线与父组件通信，实现数据的统一管理和保存。

本次需求新增记忆库管理模块，需要：

1. 新建独立的记忆库管理页面（列表+详情）
2. 在 Agent 编辑页面集成记忆库绑定功能
3. 实现白名单权限控制

## Goals / Non-Goals

**Goals:**

- 实现记忆库列表页面，支持创建、删除、进入详情
- 实现记忆库详情页面，支持用户列表展示和记忆管理
- 实现 Agent 绑定记忆库功能（弹窗模式，限制单个绑定）
- 通过白名单控制功能可见性
- 复用现有组件模式（MultipleEdit、ResourceModal 等）

**Non-Goals:**

- 记忆的录入逻辑（由后端 Mem0 框架处理）
- 记忆的召回逻辑（由后端处理）
- 调用日志和消耗明细（本期不实现）
- 记忆内容的编辑功能（本期仅支持查看和删除）

## Decisions

### 1. 目录结构

**决策**: 在 `src/pages/` 下新建 `MemoryRepository` 目录，参考现有页面结构。

```
src/pages/MemoryRepository/
├── index.tsx                    # 列表页面
├── index.less
├── Detail/
│   ├── index.tsx               # 详情页面
│   └── index.less
└── components/
    ├── CreateModal/            # 新建记忆库弹窗
    │   ├── index.tsx
    │   └── index.less
    └── MemoryModal/            # Agent 绑定记忆库弹窗
        ├── index.tsx
        └── index.less
```

**理由**: 与项目现有页面结构保持一致，便于维护。

### 2. API 层实现

**决策**: 在 `src/api/` 下新建 `memoryRepository.tsx`，遵循项目 API 模块标准模式。

```typescript
// src/api/memoryRepository.tsx
export const getRepositoryList: () => TableResultType<MemoryRepositoryNS.RepositoryType>;
export const saveRepository: (data) => RequestResultType<number>;
export const deleteRepository: (data) => RequestResultType;
export const checkAssociation: (params) => RequestResultType<boolean>;
export const listUsers: (params) => TableResultType<MemoryRepositoryNS.UserType>;
export const getMemories: (params) => RequestResultType<MemoryRepositoryNS.MemoryType[]>;
export const deleteMemory: (data) => RequestResultType;
```

**理由**: 遵循项目 API 编写规范，使用 `request` 工具函数和标准响应类型。

### 3. 类型定义

**决策**: 在 `src/types/` 下新建 `MemoryRepository.d.ts`，使用 namespace 模式。

```typescript
declare namespace MemoryRepositoryNS {
  export interface RepositoryType {
    repositoryId: number;
    name: string;
    description?: string;
    createTime: number;
  }

  export interface UserType {
    userId: string;
  }

  export interface MemoryType {
    id: string;
    content: string;
    userId: string;
    agentId?: string;
    sessionId?: string;
    createTime: number;
  }
}
```

**理由**: 遵循项目类型声明规范，使用 namespace 隔离。

### 4. Agent 绑定记忆库的交互模式

**决策**: 采用弹窗模式（类似知识库），使用 `MultipleEdit` + 自定义 Modal 组件。

**替代方案**: 下拉选择器

- 优点：交互简单
- 缺点：与现有知识库、工具等模块交互不一致

**选择弹窗模式理由**:

- 与知识库绑定交互一致，用户学习成本低
- 弹窗可展示更多信息（名称、描述等）
- 便于扩展（如后续支持多选）

**特殊处理**: 由于只能绑定一个记忆库，当已有绑定时，其他记忆库的"添加"按钮需置灰。

### 5. 记忆库详情页面布局

**决策**: 左右分栏布局，左侧用户列表，右侧记忆列表。

```
┌─────────────────────────────────────────────┐
│  ← 返回  记忆库名称                          │
├──────────────┬──────────────────────────────┤
│  用户列表     │  记忆列表                    │
│  [搜索框]     │  (选中用户后展示)            │
│  ─────────   │  ┌─────────────────────────┐ │
│  user_001    │  │ 记忆内容...    [删除]   │ │
│  user_002 ← │  │ 2026-03-18              │ │
│  user_003    │  └─────────────────────────┘ │
│  ...         │  ┌─────────────────────────┐ │
│              │  │ 记忆内容...    [删除]   │ │
│  [分页]       │  │ 2026-03-17              │ │
│              │  └─────────────────────────┘ │
└──────────────┴──────────────────────────────┘
```

**理由**: 符合交互稿设计，左右联动便于管理。

### 6. 白名单控制实现

**决策**: 通过全局配置 `GlobalConfigState` 中的白名单字段控制。

- 路由层面：在路由配置中添加权限检查
- 侧边栏：根据白名单字段条件渲染菜单项
- Agent 编辑页：根据白名单字段条件渲染记忆库模块

**理由**: 复用现有权限控制机制，统一管理。

### 7. 状态管理

**决策**: Agent 绑定记忆库通过 `AppEventBus` 通知父组件更新。

```typescript
// Memory/index.tsx
const onBindMemory = useCallback((repository) => {
  AppEventBus.emit(EventTypeEnum.saveAppData, {
    memoryRepository: repository,
  });
}, []);

const onUnbind = useCallback(() => {
  AppEventBus.emit(EventTypeEnum.saveAppData, {
    memoryRepository: null,
  });
}, []);
```

**理由**: 与现有 Tools、Knowledge 等模块保持一致的数据流模式。

## Risks / Trade-offs

### 风险 1: 白名单字段未定义

- **风险**: 后端可能尚未在全局配置中返回记忆库白名单字段
- **缓解**: 先与后端确认字段名，前端做好降级处理（字段不存在时默认隐藏）

### 风险 2: 记忆库详情页面数据量大

- **风险**: 用户 UID 列表和记忆列表可能数据量很大
- **缓解**:
  - 用户列表使用分页（offset/limit）
  - 记忆列表视需求后续添加分页或虚拟滚动

### 风险 3: 删除记忆库时的关联检查

- **风险**: 需要调用额外接口检查是否有 Agent 关联
- **缓解**: 在删除确认前调用 `checkAssociation` 接口，有关联时提示用户

### Trade-off: 只能绑定一个记忆库

- **限制**: 当前设计仅支持一个 Agent 绑定一个记忆库
- **好处**: 简化数据模型和交互逻辑
- **扩展性**: 如后续需支持多个，弹窗模式易于扩展

## Open Questions

1. **白名单字段名称**: 需确认全局配置中用于控制记忆库功能的白名单字段名（如 `memoryRepositoryEnabled`）

2. **Agent 保存时的字段名**: 需确认 Agent 配置中记忆库绑定字段名（建议 `memoryRepositoryId`）

3. **记忆库详情页路由**: 建议 `/memory-repository/detail?repositoryId={id}`，需确认是否符合项目路由规范
