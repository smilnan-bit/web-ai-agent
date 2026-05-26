## ADDED Requirements

### Requirement: 大模型节点和代码节点支持单独测试功能

系统 SHALL 为大模型节点（LLM）和代码节点（Code）提供单独测试功能，用户无需运行整个工作流即可验证单个节点的配置和输出效果。

#### Scenario: 用户通过表单文字链入口测试节点

- **WHEN** 用户在大模型节点或代码节点的侧边栏表单中点击右上角【测试该节点】文字链
- **THEN** 系统立即弹出试运行表单面板

#### Scenario: 用户通过卡片 icon 入口测试节点

- **WHEN** 用户将鼠标悬停在大模型节点或代码节点卡片右上角的播放 icon 上
- **THEN** 系统显示 tooltip "测试该节点"
- **WHEN** 用户点击该 icon
- **THEN** 系统立即弹出试运行表单面板

### Requirement: 测试入口仅在可编辑模式下显示

系统 SHALL 仅在非只读模式下显示测试入口（文字链和 icon），只读模式下隐藏。

#### Scenario: 只读模式下测试入口不可见

- **WHEN** 工作流处于只读模式（如历史版本查看）
- **THEN** 大模型节点和代码节点的测试入口（文字链和 icon）不显示

#### Scenario: 编辑模式下测试入口可见

- **WHEN** 工作流处于可编辑模式
- **THEN** 大模型节点和代码节点的测试入口（文字链和 icon）正常显示

### Requirement: 测试入口仅适用于大模型节点和代码节点

系统 SHALL 仅为大模型节点（WorkflowNodeType.LLM）和代码节点（WorkflowNodeType.Code）显示测试入口，其他节点类型不显示。

#### Scenario: 其他节点类型无测试入口

- **WHEN** 用户查看开始节点、结束节点、条件节点、工具节点等其他类型节点
- **THEN** 节点卡片和表单中不显示测试入口

### Requirement: 试运行表单支持输入参数填写

系统 SHALL 在试运行表单中展示节点配置的输入参数，允许用户手工填写参数值。

#### Scenario: 节点有输入参数时显示参数表单

- **WHEN** 节点配置了输入参数（inputParam 非空）
- **THEN** 试运行表单中显示"试运行输入"区域，包含所有输入参数的填写控件

#### Scenario: 节点无输入参数时不显示参数表单

- **WHEN** 节点未配置输入参数（inputParam 为空或不存在）
- **THEN** 试运行表单中不显示"试运行输入"区域

### Requirement: 试运行表单展示运行结果

系统 SHALL 在试运行表单中展示节点运行的输入和输出结果。

#### Scenario: 未运行时结果区域为空

- **WHEN** 用户打开试运行表单但未点击【运行】按钮
- **THEN** "运行结果"区域的输入和输出均显示为空

#### Scenario: 运行后展示输入输出

- **WHEN** 用户点击【运行】按钮
- **THEN** 系统立即执行节点测试
- **THEN** 系统在"运行结果"区域展示输入参数的 JSON 格式
- **THEN** 系统在"运行结果"区域展示输出结果的 JSON 格式

### Requirement: 大模型节点测试调用专用 API

系统 SHALL 为大模型节点测试调用专用后端 API `/agent/api/workflow/debug/executeLLM`。

#### Scenario: 大模型节点执行测试

- **WHEN** 用户在大模型节点试运行表单中点击【运行】
- **THEN** 系统调用 `/agent/api/workflow/debug/executeLLM` API
- **THEN** 请求参数包含 workflowId、mode、tipWord、temperature、param

### Requirement: 代码节点测试复用现有 API

系统 SHALL 为代码节点测试复用现有后端 API `/agent/api/workflow/debug/executeCode`。

#### Scenario: 代码节点执行测试

- **WHEN** 用户在代码节点试运行表单中点击【运行】
- **THEN** 系统调用 `/agent/api/workflow/debug/executeCode` API
- **THEN** 请求参数包含 workflowId、code、codeLanguage、timeoutMs、param

### Requirement: 卡片 icon 位置规范

系统 SHALL 将测试 icon 放置在节点卡片头部右侧操作区，位于【...】更多菜单左侧、折叠箭头右侧。

#### Scenario: icon 位置正确

- **WHEN** 用户查看大模型节点或代码节点卡片
- **THEN** 测试 icon 显示在【...】更多菜单图标的左侧
- **THEN** 测试 icon 显示在折叠箭头的右侧（如有折叠箭头）

### Requirement: 关闭试运行表单

系统 SHALL 支持用户关闭试运行表单。

#### Scenario: 用户关闭试运行表单

- **WHEN** 用户点击试运行表单右上角的关闭按钮（✕）
- **THEN** 试运行表单关闭
- **THEN** 用户返回节点表单编辑状态
