## 1. 创建 FixedParamsInput 组件文件结构

- [x] 1.1 在 `src/pages/Workflow/NewGraph/form-components/` 下新建 `fixed-params-input/` 目录
- [x] 1.2 创建 `fixed-params-input/index.tsx` 文件（组件主体骨架，含 props interface 定义：`name?`, `showDesc?`）
- [x] 1.3 创建 `fixed-params-input/index.less` 文件（样式骨架，定义 ModuleName 常量）

## 2. 实现「输入 / 引用」切换下拉

- [x] 2.1 复用现有 `EnumSelect`（或直接用 `Select`），渲染「输入」/「引用」切换下拉，宽度约 72px，与原 `ParamsFormWithValue` 视觉一致
- [x] 2.2 绑定到参数的 `valueType` 字段（`SimpleParamTypeEnum.input = 0` / `SimpleParamTypeEnum.quote = 1`）
- [x] 2.3 切换 valueType 时将当前行 `value` 重置为 `undefined`

## 3. 实现「输入」模式按类型渲染专属控件

- [x] 3.1 抽取 `renderInputByType(type, subType, fieldProps)` 工具函数，按 `type` 分支返回对应控件
- [x] 3.2 实现 `String` → `<Input>`，值原样存储
- [x] 3.3 实现 `Integer` → `<InputNumber precision={0}>`，onChange 时 `String(v ?? '')` 写入 form
- [x] 3.4 实现 `Number` → `<InputNumber>`，onChange 时 `String(v ?? '')` 写入 form
- [x] 3.5 实现 `Boolean` → `<Select>` 选项为 `'true'`/`'false'`，值以 string 存储
- [x] 3.6 实现 `Object` → 禁用只读 Input（placeholder「请通过添加子节点进行配置」），走子字段递归逻辑
- [x] 3.7 实现 `Array` → 使用 flowgram `FieldArray` 管理行列表，每行按 `subType` 调用 `renderInputByType`

## 4. 实现「引用」模式沿用 ParamSelect

- [x] 4.1 当 `valueType === SimpleParamTypeEnum.quote` 时，渲染 `ParamSelect`，props 透传（`quoteValType` 等）与原来一致
- [x] 4.2 验证引用选中后 `value` 正确存储为变量引用字符串

## 5. 实现 Object subParams 递归渲染

- [x] 5.1 抽取 `ParamInputItem` 递归组件，接受 `param`、`namePath: string[]`、`deep: number` props
- [x] 5.2 使用 flowgram `FieldArray` 绑定 `subParams` 字段，确保子字段值变更正确写入 form
- [x] 5.3 实现嵌套层级缩进（每层 +16px），通过 `deep` prop 控制

## 6. 实现 Array 行级增删操作

- [x] 6.1 使用 flowgram `FieldArray` 绑定 array 参数，获取 `field.append` 和 `field.insert`
- [x] 6.2 每行右侧渲染 `+` 按钮：点击时 `insert(index + 1, '')` 在当前行后插入空行
- [x] 6.3 每行右侧渲染 `-` 按钮：点击时 `remove(index)` 删除当前行
- [x] 6.4 当列表仅剩 1 行时，`-` 按钮设为 `disabled`（不可点击）

## 7. 实现名称/类型只读展示与 showDesc prop

- [x] 7.1 参数名称以 `nameUnEditable` 模式渲染（禁用 Input 或纯文本），对应视觉稿「变量名称」列
- [x] 7.2 参数类型以类型图标展示（复用项目中已有的类型图标组件）
- [x] 7.3 添加 `showDesc?: boolean` prop，控制参数 `desc` 字段的显示与隐藏

## 8. 整体 flowgram form 绑定

- [x] 8.1 组件顶层使用 `FieldArray name="inputParam"` 读取参数列表，每项渲染 `ParamInputItem`
- [x] 8.2 验证组件挂载时能从 flowgram form 回显已有 valueType 和 value

## 9. 替换工具节点调用

- [x] 9.1 修改 `src/pages/Workflow/NewGraph/nodes/tool/form.tsx`：import `FixedParamsInput`，删除 `ParamsFormWithValue fixedNameAndType` 调用
- [x] 9.2 将原来的 `showDesc={!isTemplateTool}` prop 透传给 `FixedParamsInput`
- [ ] 9.3 本地验证工具节点面板正常展示、输入/引用切换、各类型控件渲染

## 10. 替换子工作流节点调用

- [x] 10.1 修改 `src/pages/Workflow/NewGraph/nodes/sub-workflow/form.tsx`：import `FixedParamsInput`，删除 `ParamsFormWithValue fixedNameAndType` 调用
- [ ] 10.2 本地验证子工作流节点面板正常展示、输入/引用切换、各类型控件渲染

## 11. 样式收尾与质量检查

- [x] 11.1 完善 `index.less`：参数行布局（名称列、必填列、类型列、值列、操作列）、Array 行增删按钮间距、嵌套缩进线
- [x] 11.2 运行 `npm run lint:script` 确认无 TS / Biome 错误
- [x] 11.3 运行 `npm run lint:style` 确认无 stylelint 错误
- [ ] 11.4 手工回归：String/Integer/Number/Boolean 各类型输入控件在「输入」模式下渲染正确
- [ ] 11.5 手工回归：「引用」模式下 ParamSelect 正常展示，切换时 value 重置
- [ ] 11.6 手工回归：Object 嵌套子字段正常展开，缩进层级正确
- [ ] 11.7 手工回归：Array 行级增删，最后一行删除按钮禁用，提交数据格式（值均为 string）
- [ ] 11.8 手工回归：工具节点和子工作流节点面板均正常，form submit 数据正确
