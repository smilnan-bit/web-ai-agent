## Context

当前工作流编辑器中：

- **代码节点**：已有测试功能，但入口较深（需展开 IDE 编辑器 → 点击"测试代码"按钮），用户不易发现
- **大模型节点**：没有单独测试功能，只能通过整个工作流试运行来验证

现有代码结构：

- `DebugPanel` 组件：位于 `nodes/code/DebugPanel/`，提供输入参数填写、运行、查看输入/输出的完整功能
- `FormHeader` 组件：节点卡片头部，包含标题、折叠按钮、更多菜单（`NodeMenu`）
- `FormFragment` 组件：表单区块，支持 `extra` 属性在标题右侧添加额外内容
- `executeCodeNode` API：`/agent/api/workflow/debug/executeCode`

## Goals / Non-Goals

**Goals:**

1. 为**大模型节点**和**代码节点**新增两个便捷测试入口
2. 入口 1：表单右上角文字链【测试该节点】
3. 入口 2：节点卡片头部 icon（位于 `...` 左侧，hover 显示 tooltip）
4. 大模型节点复用代码节点的 `DebugPanel` 交互逻辑
5. 新增大模型节点测试 API

**Non-Goals:**

- 不修改其他节点类型
- 不改变现有代码节点 IDE 内的"测试代码"入口
- 不涉及工作流整体试运行功能

## Decisions

### 1. 入口实现方案

**入口 1 - 表单文字链**

| 方案                  | 描述                                        | 优缺点                             |
| --------------------- | ------------------------------------------- | ---------------------------------- |
| A. FormFragment extra | 在表单顶部 FormFragment 的 extra 属性中添加 | ✅ 简单，与现有"在 IDE 中编写"一致 |
| B. FormHeader 下方    | 在 FormHeader 下方添加独立行                | ❌ 需要修改布局结构                |

**决定：采用方案 A**

- 代码节点：在第一个 `FormFragment`（代码区块）的 extra 中添加文字链
- 大模型节点：在 `SelectModel` 区块或新增一个顶部 Fragment 添加文字链

**入口 2 - 卡片头部 icon**

修改 `FormHeader` 组件：

1. 在 `NodeMenu` 组件前添加测试按钮
2. 仅对 `WorkflowNodeType.LLM` 和 `WorkflowNodeType.Code` 显示
3. 使用 `Tooltip` 包裹，hover 显示"测试该节点"

### 2. DebugPanel 复用方案

| 方案            | 描述                                                    | 优缺点                                            |
| --------------- | ------------------------------------------------------- | ------------------------------------------------- |
| A. 直接复用     | 大模型节点引入代码节点的 DebugPanel                     | ❌ 代码依赖 `useWatch('code')` 等代码节点特有字段 |
| B. 抽取通用组件 | 抽取 `NodeDebugPanel` 通用组件，通过 props 传入执行函数 | ✅ 解耦，可扩展                                   |
| C. 各自实现     | 大模型节点单独实现 DebugPanel                           | ❌ 代码重复                                       |

**决定：采用方案 B**

- 抽取 `src/pages/Workflow/NewGraph/components/node-debug-panel/` 通用组件
- Props: `inputParam`, `onExecute`, `visible`, `onClose`
- 代码节点和大模型节点各自提供 `onExecute` 实现

### 3. 测试 icon 设计

根据 Figma 设计，使用"播放"图标（▶️ 样式）。检查现有图标：

- `PlayCircleOutlined`（antd）- 已用于代码节点 IDE
- 需新增 `IconBofang` 或复用 `PlayCircleOutlined`

**决定：使用 `PlayCircleOutlined`**

- 与现有代码节点 IDE 中的图标保持一致
- 减少新增图标维护成本

### 4. API 设计

**大模型节点测试 API**

```typescript
// POST /agent/api/workflow/debug/executeLLM
interface ExecuteLLMRequest {
  workflowId: number;
  mode: number; // 模型类型
  tipWord: string; // 提示词
  temperature: number; // 温度参数
  param: Record<string, any>; // 输入参数
}

interface ExecuteLLMResponse {
  code: number;
  data: string; // JSON 字符串，包含输出结果
  message?: string;
}
```

### 5. 状态管理

测试面板的显示状态：

- **方案 A**：组件内部 `useState`
- **方案 B**：通过 `SidebarContext` 管理

**决定：采用方案 A**

- 测试面板与节点表单紧密耦合
- 无需跨组件共享状态
- 与现有代码节点实现保持一致

## Risks / Trade-offs

| 风险                          | 缓解措施                                       |
| ----------------------------- | ---------------------------------------------- |
| 大模型测试 API 尚未提供       | 先完成前端，API 接口定义与后端对齐后联调       |
| FormHeader 修改影响所有节点   | 通过节点类型判断，仅 LLM/Code 显示测试按钮     |
| 测试面板遮挡表单内容          | 复用现有 DebugPanel 定位逻辑（fixed/absolute） |
| readonly 模式下应禁用测试入口 | 检查 `playground.config.readonly`              |

## 文件修改清单

| 文件                                    | 修改内容                              |
| --------------------------------------- | ------------------------------------- |
| `nodes/llm/form.tsx`                    | 添加测试文字链 + 引入 DebugPanel      |
| `nodes/code/form.tsx`                   | 添加测试文字链入口                    |
| `form-components/form-header/index.tsx` | 添加测试 icon 按钮                    |
| `components/node-debug-panel/`          | 新建通用 DebugPanel 组件              |
| `api/workflow.tsx`                      | 新增 `executeLLMNode` API             |
| `nodes/llm/api.ts`                      | 如有需要，添加大模型专属 API 调用逻辑 |
