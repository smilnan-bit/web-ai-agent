## Why

工具节点（Tool Node）和子工作流节点（Sub-Workflow Node）"代码块 1"的输入参数区域当前均复用了 `ParamsFormWithValue` 组件（`fixedNameAndType` 模式）。该组件的 value 输入区域只提供统一的文本框，无论参数类型是 number、integer 还是 string 均相同，不支持按参数基本类型渲染专属输入控件（如数字输入框、单选框）。需要以新共用组件替换两处调用，在保留「输入/引用」切换能力的基础上，实现按类型差异化的输入体验。

## What Changes

- **移除** 工具节点 form（`nodes/tool/form.tsx`）中对 `ParamsFormWithValue`（`fixedNameAndType` 模式）的调用
- **移除** 子工作流节点 form（`nodes/sub-workflow/form.tsx`）中对 `ParamsFormWithValue`（`fixedNameAndType` 模式）的调用
- **新增** `FixedParamsInput` 共用组件，供工具节点和子工作流节点的输入参数区域复用，实现值填写交互：
  - 参数名称与类型固定（只读，由工具/子工作流定义决定）
  - **保留** `输入 / 引用` 切换下拉（即保留 `SimpleParamTypeEnum` valueType 机制）
  - **`引用` 模式**：行为与现有一致，渲染 `ParamSelect` 变量选择器
  - **`输入` 模式**：根据参数基本类型渲染专属控件：
    - `String` → Input 文本框
    - `Integer` → InputNumber（整数）
    - `Number` → InputNumber（浮点）
    - `Boolean` → Select（true / false 单选）
  - **`Object` 类型**：嵌套结构渲染保持不变（沿用现有 subParams 展开方式）
  - **`Array` 类型**：每行用输入框（按 `subType` 渲染），最右侧提供 `+`（在当前行后新增）和 `-`（删除当前行）按钮；仅剩最后一行时禁用 `-` 按钮
  - 所有值统一序列化为 `string` 后传给后端（保持与现有接口契约一致）
- **使用 flowgram.ai form 体系**（`Field` / `FieldArray` / `useForm` 等），与工作流节点 form 框架统一

## Capabilities

### New Capabilities

- `fixed-params-input`: 固定名称和类型的参数值填写组件，供工具节点和子工作流节点复用，支持按类型渲染控件、嵌套 Object/Array 结构、折叠展开、值序列化为 string

### Modified Capabilities

（无已有 spec 需要变更）

## Impact

- **直接修改文件**：
  - `src/pages/Workflow/NewGraph/nodes/tool/form.tsx`（替换 `ParamsFormWithValue` 引用）
  - `src/pages/Workflow/NewGraph/nodes/sub-workflow/form.tsx`（替换 `ParamsFormWithValue` 引用）
- **新增文件**：
  - `src/pages/Workflow/NewGraph/form-components/fixed-params-input/index.tsx`（新组件主体，放在 form-components 下供两个节点共享）
  - `src/pages/Workflow/NewGraph/form-components/fixed-params-input/index.less`（样式）
- **参考但不修改**：
  - `src/components/RenderInput/CmpByType.tsx`（嵌套渲染参考）
  - `src/pages/Workflow/NewGraph/form-components/input-output/form-with-value.tsx`（flowgram form 用法参考）
- **依赖**：`@flowgram.ai/free-layout-editor`（`Field`, `FieldArray`, `useForm` 等）、`antd`（`Input`, `InputNumber`, `Select`）
- **不影响**：`ParamsFormWithValue` 组件本身（其他节点仍可继续使用）、后端接口（值仍为 string）
