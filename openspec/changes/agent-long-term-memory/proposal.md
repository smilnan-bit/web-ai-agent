# Agent 长期记忆管理 - 需求提案

## Why

当前 Agent 智能体缺乏跨会话的记忆能力，无法记住用户的个人偏好、历史交互信息等。这导致：

1. 每次对话都需要用户重新提供个人信息
2. 无法提供个性化的服务体验
3. Agent 无法根据历史交互持续学习和改进

通过对接 Mem0 长期记忆框架，让 Agent 能够：

- 自动提取对话中的关键事实（原子化事实）
- 按用户 UID 隔离存储记忆数据
- 在后续对话中召回相关记忆，提供个性化服务

## What Changes

### 新增功能模块

1. **记忆库管理页面** (`/memory-repository`)

   - 记忆库列表：展示所有记忆库，支持创建、删除
   - 记忆库详情：查看用户列表、管理用户记忆

2. **Agent 关联记忆库**

   - 在 Agent 配置中新增记忆库绑定功能
   - 一个 Agent 只能绑定一个记忆库
   - 一个记忆库可以被多个 Agent 绑定

3. **白名单控制**
   - 记忆库功能通过白名单开启
   - 未开启白名单的租户看不到记忆库相关入口

## Capabilities

### memory-repository-list

记忆库列表页面，展示所有记忆库的卡片列表，支持：

- 查看记忆库名称、描述、创建时间
- 新建记忆库（弹窗表单）
- 删除记忆库（需检查是否关联 Agent）
- 点击卡片进入记忆库详情

### memory-repository-detail

记忆库详情页面，左右布局：

- **左侧**：用户 UID 列表（支持搜索、分页）
- **右侧**：选中用户的记忆列表
  - 查看记忆内容、创建时间
  - 删除单条记忆

### agent-memory-binding

Agent 配置中的记忆库绑定功能：

- 在 Agent 编辑页面添加"关联记忆库"选项
- 下拉选择可用的记忆库
- 保存时更新 Agent 的记忆库绑定关系

## Impact

### 新增文件

- `src/pages/MemoryRepository/index.tsx` - 记忆库列表页面
- `src/pages/MemoryRepository/Detail/index.tsx` - 记忆库详情页面
- `src/pages/MemoryRepository/components/` - 相关组件
- `src/services/memoryRepository.ts` - API 服务层

### 修改文件

- `src/router/` - 添加记忆库相关路由
- Agent 编辑页面 - 添加记忆库绑定选项
- 侧边栏导航 - 添加记忆库入口（白名单控制）

### 后端接口依赖

| 接口            | 方法 | 路径                                            | 描述                  |
| --------------- | ---- | ----------------------------------------------- | --------------------- |
| 创建/更新记忆库 | POST | `/agent/api/memory/repository/save`             | 保存记忆库            |
| 删除记忆库      | POST | `/agent/api/memory/repository/delete`           | 软删除记忆库          |
| 检查关联        | GET  | `/agent/api/memory/repository/checkAssociation` | 检查是否关联 Agent    |
| 记忆库列表      | GET  | `/agent/api/memory/repository/list`             | 获取记忆库列表        |
| 用户列表        | GET  | `/agent/api/memory/repository/listUsers`        | 分页获取用户 UID 列表 |
| 用户记忆列表    | GET  | `/agent/api/memory/repository/memories`         | 获取指定用户的记忆    |
| 删除记忆        | POST | `/agent/api/memory/repository/deleteMemory`     | 删除单条记忆          |

## 参考资料

### 交互稿

- [【Agent】Agent 对接长期记忆](https://docs.popo.netease.com/team/pc/r17pusa6/pageDetail/de983275170e46719d5515e7a9b872a5)

### 视觉稿

- [记忆库列表](https://www.figma.com/design/3CgZYTBOBsWA9202Q0Ye3g/智能?node-id=132004-71152)
- [记忆库详情](https://www.figma.com/design/3CgZYTBOBsWA9202Q0Ye3g/智能?node-id=132014-73770)

### 技术背景

- 基于 Mem0 长期记忆框架
- 支持原子化事实提取、语义去重、冲突处理
- 按 User/Agent/Session 三层记忆架构
