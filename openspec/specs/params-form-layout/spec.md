## ADDED Requirements

### Requirement: ParamsForm 列宽固定布局

`ParamsForm` 组件的表格列宽 SHALL 采用固定宽度策略，确保在面板宽度变化时保持合理的列宽分布。

- 【变量名称】列宽度 SHALL 固定为 180px
- 【参数类型】列宽度 SHALL 固定为 140px
- 【描述】列 SHALL 自适应占据剩余空间
- 【必填】列宽度 SHALL 保持现有的 54px 固定宽度

#### Scenario: 面板宽度变化时列宽保持稳定

- **WHEN** 用户调整工作流面板宽度
- **THEN** 变量名称列保持 180px 固定宽度
- **AND** 参数类型列保持 140px 固定宽度
- **AND** 描述列自适应占据剩余空间

#### Scenario: 表头与内容列宽对齐

- **WHEN** ParamsForm 组件渲染表格
- **THEN** 表头（.param-header）的列宽与内容行（.param-item）的列宽保持一致
