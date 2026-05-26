## ADDED Requirements

### Requirement: 卡片列表展示

卡片管理页面（`/card`）展示所有已创建的卡片，按更新时间倒序排列，每页最多 20 条，支持分页。

#### Scenario: 有卡片数据时

- **WHEN** 用户访问 `/card`，且后端返回卡片数量 > 0
- **THEN** 页面显示标题「卡片管理」、右上角「新建卡片」按钮，以及 3 列网格的卡片列表；底部展示分页控件

#### Scenario: 无卡片数据时（空状态）

- **WHEN** 用户访问 `/card`，且后端返回卡片数量 = 0
- **THEN** 页面显示渐变背景 + 居中的「AI 生成卡片」引导区域（含 tooltip、副标题、模板选择区、AI 输入框）；不显示「新建卡片」按钮

### Requirement: 卡片缩略图渲染

每个卡片格子的上方区域展示卡片的实际视觉效果（缩小预览）。

#### Scenario: 缩略图展示

- **WHEN** 卡片列表中的某一项卡片拥有合法的 `spec` 数据
- **THEN** 使用 `<SpecPreview>` 组件渲染该卡片，通过 CSS `transform: scale()` 缩小至格子尺寸，外层 `overflow: hidden`，内层 `pointer-events: none`

### Requirement: 卡片 Hover 操作

鼠标悬停在卡片上时，展示操作入口。

#### Scenario: Hover 显示操作

- **WHEN** 用户 hover 在某个卡片格子上
- **THEN** 显示半透明遮罩，遮罩上展示「查看」「编辑」「删除」三个文字链

#### Scenario: 点击查看

- **WHEN** 用户点击「查看」
- **THEN** 打开「查看卡片弹窗」，弹窗内展示该卡片的预览、只读 JSON 和内容数据

#### Scenario: 点击编辑

- **WHEN** 用户点击「编辑」
- **THEN** 跳转到 `/card/editor?id=xxx`

#### Scenario: 点击删除

- **WHEN** 用户点击「删除」
- **THEN** 弹出二次确认弹窗；确认后调用删除接口，成功后刷新列表

### Requirement: 空状态模板选择与生成

无卡片时，用户可选择模板并输入描述来创建第一个卡片。

#### Scenario: 选择模板后发送

- **WHEN** 用户在空状态页面选中一个模板，并在输入框中填写描述后点击发送按钮
- **THEN** 跳转到 `/card/editor`，同时通过 `navigate state` 传递 `{ prompt, templateSpec }`，CardEditor 初始化该模板 spec 并自动触发首次 AI 对话
