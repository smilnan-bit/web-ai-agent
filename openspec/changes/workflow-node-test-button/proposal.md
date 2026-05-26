## Why

实施人员需要方便快捷地单独测试**大模型节点**和**代码节点**的输出效果。

- **大模型节点**：当前只能整个工作流/Agent 试运行，比较麻烦。希望可以针对大模型节点单独进行试运行，如果输出效果不好，可以快捷地去调整提示词/切换模型来进行调整。
- **代码节点**：虽然已有测试功能，但入口较深（需完全展开代码编辑器才能看到"测试代码"按钮），需要增加更便捷的入口。

## What Changes

### 测试入口（大模型节点 + 代码节点）

**入口 1：表单右上角文字链**

- 在【工作流-大模型节点-表单】右上角展示文字链【测试该节点】
- 在【工作流-代码节点-表单】右上角展示文字链【测试该节点】

**入口 2：节点卡片 icon 按钮**

- 在【工作流-大模型节点-卡片】右上角展示【测试该节点 icon】
- 在【工作流-代码节点-卡片】右上角展示【测试该节点 icon】
- icon 位置在【...】更多菜单左侧
- hover 时显示 tooltip "测试该节点"

### 测试面板

- 点击【测试该节点】后立即弹出【试运行表单】
- 大模型节点和代码节点共用相同的试运行表单交互逻辑（复用现有 `DebugPanel` 组件）
- 若节点设置了【输入参数】，则在表单中支持用户手工输入【输入参数值】；若未设置则不展示
- 输入/输出在未点击【运行】时展示为空，点击【运行】后立即执行并展示节点的输入输出内容

## Capabilities

### New Capabilities

- `workflow-node-test`: 工作流节点单独测试功能的便捷入口（表单文字链 + 卡片 icon），适用于大模型节点和代码节点

### Modified Capabilities

<!-- 无需修改现有 spec -->

## Impact

- **前端组件**:
  - `src/pages/Workflow/NewGraph/nodes/llm/form.tsx` - 添加"测试该节点"文字链入口 + DebugPanel
  - `src/pages/Workflow/NewGraph/nodes/code/form.tsx` - 添加"测试该节点"文字链入口（复用现有 DebugPanel）
  - `src/pages/Workflow/NewGraph/form-components/form-header/index.tsx` - 针对大模型节点和代码节点类型，添加测试按钮 icon
  - `src/pages/Workflow/NewGraph/nodes/icons.tsx` - 新增播放图标（如有需要）
  - `src/pages/Workflow/NewGraph/nodes/code/DebugPanel` - 抽取通用 `NodeDebugPanel` 组件
- **API**:
  - 代码节点：复用现有 `/agent/api/workflow/debug/executeCode`
  - 大模型节点：需新增 `/agent/api/workflow/debug/executeLLM`（参数：workflowId, mode, tipWord, temperature, inputParam 等）
- **复用组件**: `RenderInput`, `JsonTreeView`, `DebugPanel` 样式
