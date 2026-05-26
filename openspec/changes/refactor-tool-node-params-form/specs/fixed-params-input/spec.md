## ADDED Requirements

### Requirement: 保留「输入 / 引用」切换下拉

`FixedParamsInput` 组件 SHALL 为每个参数行保留 `SimpleParamTypeEnum` valueType 切换下拉框（选项：「输入」/ 「引用」），用户可在两种模式之间切换。

#### Scenario: 默认显示「输入」模式

- **WHEN** 参数的 `valueType` 未设置或为 `SimpleParamTypeEnum.input`
- **THEN** 值区域渲染对应类型的直接输入控件，切换下拉显示「输入」

#### Scenario: 切换到「引用」模式

- **WHEN** 用户从切换下拉选择「引用」
- **THEN** 值区域切换为 `ParamSelect` 变量选择器，行为与原 `ParamsFormWithValue` 引用模式一致

#### Scenario: 切换时重置 value

- **WHEN** 用户切换「输入」↔「引用」模式
- **THEN** 当前行的 `value` 字段重置为空（`undefined` / `''`），避免旧值类型错误

---

### Requirement: 「输入」模式按参数基本类型渲染专属控件

`FixedParamsInput` 组件在 `valueType = input` 时 SHALL 根据参数 `type` 渲染专属输入控件，而非统一使用文本框。

#### Scenario: String 类型渲染 Input

- **WHEN** 参数 `type` 为 `ToolParamsTypeEnum.string` 且 valueType 为 input
- **THEN** 渲染 `<Input>` 文本输入框，用户输入值以 `string` 原样存储

#### Scenario: Integer 类型渲染整数 InputNumber

- **WHEN** 参数 `type` 为 `ToolParamsTypeEnum.integer` 且 valueType 为 input
- **THEN** 渲染 `<InputNumber precision={0}>` 整数输入框，onChange 时以 `String(v ?? '')` 写入 form

#### Scenario: Number 类型渲染浮点 InputNumber

- **WHEN** 参数 `type` 为 `ToolParamsTypeEnum.number` 且 valueType 为 input
- **THEN** 渲染 `<InputNumber>` 浮点输入框，onChange 时以 `String(v ?? '')` 写入 form

#### Scenario: Boolean 类型渲染 Select 单选

- **WHEN** 参数 `type` 为 `ToolParamsTypeEnum.boolean` 且 valueType 为 input
- **THEN** 渲染 `<Select>` 下拉，选项为 `true` / `false`，选中值以 `'true'` / `'false'` string 存储

---

### Requirement: 「引用」模式沿用 ParamSelect 变量选择器

`FixedParamsInput` 组件在 `valueType = quote` 时 SHALL 渲染与原 `ParamsFormWithValue` 一致的 `ParamSelect` 变量选择器，行为不变。

#### Scenario: 引用模式显示变量选择器

- **WHEN** 参数的 `valueType` 为 `SimpleParamTypeEnum.quote`
- **THEN** 值区域渲染 `ParamSelect`，展示可用变量列表，选中后 `value` 存储变量引用字符串

---

### Requirement: 参数名称和类型只读展示

`FixedParamsInput` 组件 SHALL 将每个参数的 `name`（变量名称）和 `type`（变量类型图标）以只读方式展示。

#### Scenario: 名称只读

- **WHEN** 组件渲染任意参数行
- **THEN** 参数名称以可编辑输入框展示（因为视觉稿中变量名称列有输入框样式，但实际为 fixedNameAndType 模式下不可改）；或以只读文本展示，具体以 fixedNameAndType 模式约束为准

#### Scenario: 类型图标展示

- **WHEN** 组件渲染任意参数行
- **THEN** 参数类型以对应图标（对象/默认参数/小数/整数/布尔/字符串）展示，不提供编辑能力

---

### Requirement: Object 类型嵌套结构渲染保持不变

`FixedParamsInput` 组件对 `type = object` 的参数 SHALL 沿用现有 subParams 递归展开方式，不改变嵌套交互。

#### Scenario: Object 子字段递归展开

- **WHEN** 参数 `type` 为 `ToolParamsTypeEnum.object`
- **THEN** 展示子字段列表（`subParams`），每个子字段按其自身 type 递归渲染，缩进层级加深

---

### Requirement: Array 类型支持行级增删操作

`FixedParamsInput` 组件对 `type = array` 的参数 SHALL 在每行右侧提供 `+`（在当前行后新增）和 `-`（删除当前行）按钮，支持动态增删元素行。

#### Scenario: 新增按钮在当前行后插入空行

- **WHEN** 用户点击某行的 `+` 按钮
- **THEN** 在该行下方新增一行空白输入行，输入控件按 `subType` 渲染

#### Scenario: 删除按钮移除当前行

- **WHEN** 列表中存在多于 1 行，用户点击某行的 `-` 按钮
- **THEN** 该行从列表中移除，其余行数据不受影响

#### Scenario: 仅剩最后一行时禁用删除按钮

- **WHEN** Array 列表仅剩 1 行
- **THEN** 该行的 `-` 按钮处于禁用状态（不可点击），保证至少保留一个元素行

#### Scenario: Array 元素按 subType 渲染输入框

- **WHEN** Array 参数的 `subType` 为 string
- **THEN** 每行渲染 Input 文本框
- **WHEN** Array 参数的 `subType` 为 integer
- **THEN** 每行渲染 InputNumber（整数）控件

---

### Requirement: 所有值序列化为 string 存储

`FixedParamsInput` 组件 SHALL 将所有参数值统一以 `string` 类型存储到 flowgram form 中，以兼容后端接口契约。

#### Scenario: InputNumber 值转 string

- **WHEN** 用户在 InputNumber 控件中输入数值并触发 onChange
- **THEN** 数值通过 `String(value ?? '')` 转为字符串写入 form；若值为 `null`，写入 `''`

#### Scenario: Boolean Select 值为 string

- **WHEN** 用户从 Boolean Select 中选择 `true` 或 `false`
- **THEN** form 中存储 `'true'` 或 `'false'`（字符串），而非 JS boolean 类型

#### Scenario: String Input 值原样存储

- **WHEN** 用户在 String Input 中输入文本
- **THEN** 输入值原样存储为 string，无额外转换

---

### Requirement: 使用 flowgram.ai form 体系绑定数据

`FixedParamsInput` 组件 SHALL 使用 `@flowgram.ai/free-layout-editor` 提供的 `Field`、`FieldArray` 进行 form 数据绑定，不引入独立的 Ant Design Form 实例。

#### Scenario: 组件从 flowgram form 读取初始值

- **WHEN** 工具节点或子工作流节点的 form 面板打开
- **THEN** `FixedParamsInput` 从 flowgram form 的 `inputParam` 字段读取已有参数定义和值并回显，包括 valueType 和 value

#### Scenario: 用户修改值时写入 flowgram form

- **WHEN** 用户在任意控件中修改值或切换 valueType
- **THEN** 变更通过 flowgram `Field` 的 `onChange` 写入 form state，节点 submit 时可正确获取

---

### Requirement: 组件支持 showDesc prop 控制描述字段显示

`FixedParamsInput` 组件 SHALL 接受 `showDesc?: boolean` prop，控制是否显示参数描述（`desc`）字段。

#### Scenario: showDesc 为 true 时展示描述

- **WHEN** 父组件传入 `showDesc={true}`
- **THEN** 每个参数行显示该参数的 `desc` 描述文本（若有）

#### Scenario: showDesc 为 false 或未传时隐藏描述

- **WHEN** 父组件未传入 `showDesc` 或传入 `showDesc={false}`
- **THEN** 参数行不渲染描述字段
