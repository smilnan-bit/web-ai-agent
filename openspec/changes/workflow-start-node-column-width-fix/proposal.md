## Why

Agent 工作流节点设置面板中的 `ParamsForm` 组件因采用等比例拉宽策略，导致【变量名称】和【变量类型】列宽度过长，而【描述】列反而过短，影响用户体验和界面美观度。本次修复将这两列设置为固定宽度，以确保面板在不同宽度下保持合理的列宽分布。

## What Changes

- **修改 ParamsForm 组件的列宽策略**（影响所有使用该组件的节点）：
  - 【变量名称】列：从自适应改为固定宽度 180px
  - 【参数类型】列：从自适应改为固定宽度 140px
  - 【描述】列：保持自适应，占据剩余空间

## Capabilities

### New Capabilities

（无新增能力）

### Modified Capabilities

（本次为样式修复，不涉及 spec 级别的行为变更）

## Impact

- **受影响代码**：工作流编辑器中所有使用 `ParamsForm` 组件的节点配置面板
- **具体位置**：`src/pages/Workflow/NewGraph/form-components/input-output/form.less`
- **影响节点**：开始节点、合并节点等所有使用 ParamsForm 的节点
- **影响范围**：仅影响 UI 样式，不涉及功能逻辑变更
- **兼容性**：无 Breaking Change，纯样式优化
