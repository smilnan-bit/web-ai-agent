## Context

### 当前状态

工作流中所有使用 `ParamsForm` 组件的节点（开始节点、合并节点等）的输入参数表格使用 **flexbox 比例布局**：

```less
// src/pages/Workflow/NewGraph/form-components/input-output/form.less
.param-header,
.param-item {
  > :nth-child(1) {
    flex-grow: 4;
  } // 变量名称
  > :nth-child(2) {
    flex-grow: 3;
  } // 变量类型
  > :nth-child(3) {
    flex-grow: 3;
  } // 描述
  > :nth-child(4) {
    flex: 0 0 54px;
  } // 必填（固定宽度）
}
```

当面板宽度变化时，前三列按 4:3:3 比例分配空间。这导致：

- 面板变宽时，【变量名称】和【变量类型】列占据过多空间
- 【描述】列反而被压缩，输入体验差

### 设计规范

| 列       | 宽度     | 布局策略       |
| -------- | -------- | -------------- |
| 变量名称 | 180px    | 固定           |
| 参数类型 | 140px    | 固定           |
| 描述     | 剩余空间 | flex: 1 自适应 |
| 必填     | 54px     | 固定（已实现） |

### 涉及文件

- `src/pages/Workflow/NewGraph/form-components/input-output/form.less`

## Goals / Non-Goals

**Goals:**

- 将【变量名称】列设置为固定宽度 180px
- 将【参数类型】列设置为固定宽度 140px
- 让【描述】列自适应占据剩余空间
- 保持表格头和表格内容的列宽对齐
- 统一所有使用 ParamsForm 组件的节点样式

**Non-Goals:**

- 不修改组件逻辑代码（.tsx 文件）
- 不修改移动端适配（当前项目为 PC 端）

## Decisions

### Decision 1: 使用 CSS 固定宽度替代 flex-grow 比例

**选择**: 修改 `.param-header` 和 `.param-item` 的前两列为 `flex: 0 0 <width>`

**原因**:

1. 直接对应设计稿的像素值，无需计算比例
2. 固定宽度在不同面板宽度下表现一致
3. 保持第三列使用 `flex: 1` 自适应，确保响应式

**备选方案**:

- 使用 CSS Grid：需要更大改动，且当前组件已使用 flexbox
- 使用百分比宽度：无法精确匹配设计稿像素值

### Decision 2: 同时修改 header 和 item 的样式

**选择**: `.param-header` 和 `.param-item` 都需要同步修改

**原因**: 两者共用相同的列宽规则，必须保持一致才能对齐

## Risks / Trade-offs

### Risk 1: 极窄面板下列宽溢出

**风险**: 如果面板宽度小于 180+140+54+gap=约 400px，固定宽度可能导致内容溢出

**缓解**: 当前工作流面板最小宽度约 500px，足够容纳固定宽度。且原设计也存在此问题。

### Risk 2: 其他使用 ParamsForm 的场景受影响

**风险**: `ParamsForm` 组件可能被多处使用

**缓解**:

- 搜索发现该组件主要用于开始节点和部分其他节点
- 样式修改对所有使用场景生效，符合设计规范统一原则
