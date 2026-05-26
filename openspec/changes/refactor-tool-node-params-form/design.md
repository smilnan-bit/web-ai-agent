## Context

### 现状

工具节点（`nodes/tool/form.tsx`）和子工作流节点（`nodes/sub-workflow/form.tsx`）的输入参数区域均使用：

```tsx
<ParamsFormWithValue mode={ParamsFormWithValueModeEnum.fixedNameAndType} />
```

`ParamsFormWithValue` 是一个通用参数配置组件，`fixedNameAndType` 模式下会锁定名称和类型，禁止增删，并展示 value 输入框。其 value 输入采用 `SimpleParamTypeEnum`（`input=0` / `quote=1`）二选一：直接输入或引用工作流变量。

**问题**：在工具节点/子工作流节点的调用场景中，不同类型的参数应有专属控件（Boolean 需 Select、Number 需 InputNumber 等），而当前 `输入` 模式下统一使用 Input 文本框，无类型区分；Array 类型的行级增删交互也不直观。

### 参考组件

- **`RenderInput/CmpByType`**：已实现按类型差异化渲染 + 嵌套递归逻辑（使用 Ant Design Form），是交互逻辑的直接参考
- **`form-with-value.tsx`**：展示了 flowgram.ai `Field`/`FieldArray` 的标准用法，是 form 绑定的参考

---

## Goals / Non-Goals

**Goals:**

- 新增 `FixedParamsInput` 组件，统一替换工具节点和子工作流节点中的 `ParamsFormWithValue fixedNameAndType` 用法
- **保留** `输入 / 引用` 切换下拉（`SimpleParamTypeEnum` valueType 机制）
- `引用` 模式行为不变，沿用 `ParamSelect` 变量选择器
- `输入` 模式按 `ToolParamsTypeEnum` 渲染专属输入控件：String→Input、Integer/Number→InputNumber、Boolean→Select(true/false)
- Object 类型嵌套渲染保持不变（沿用 subParams 展开方式）
- Array 类型：每行按 `subType` 渲染输入框，每行右侧提供 `+`/`-` 操作按钮，最后一行 `-` 禁用
- 使用 flowgram.ai form 体系（`Field`/`FieldArray`）与节点 form 生态保持一致
- 所有值以 `string` 形式序列化传后端（兼容现有接口契约）
- 组件放在 `form-components/fixed-params-input/`，两个节点均可直接 import

**Non-Goals:**

- 不修改 `ParamsFormWithValue` 本身（其他节点继续使用）
- 不处理表单校验规则的全量重构（保持与现有 `genInputParamValidate` 一致的基础校验即可）
- 不涉及后端接口变更
- 不重构子工作流/工具节点的其他表单区域（出参展示、异常处理等）

---

## Decisions

### D1：组件放置位置 — `form-components/fixed-params-input/` 而非各节点目录内

**决策**：放在 `src/pages/Workflow/NewGraph/form-components/fixed-params-input/`

**理由**：工具节点和子工作流节点都需要使用，属于跨节点复用的 form 组件，`form-components/` 是该工程的标准共享 form 组件目录（已有 `input-output/`、`param-select/` 等）。放在单个节点目录内会导致跨目录引用，不符合现有架构约定。

**备选方案**：放在 `components/`（全局组件目录）→ 排除，因为该组件强依赖 flowgram.ai form 上下文，不适合在工作流编辑器外复用。

---

### D2：form 绑定方式 — flowgram.ai `Field`/`FieldArray` 而非 Ant Design Form

**决策**：使用 `@flowgram.ai/free-layout-editor` 的 `Field`、`FieldArray`、`useForm`

**理由**：

- 工作流节点 form 数据完全由 flowgram.ai 管理，节点 submit/validate 均走 flowgram form 生命周期
- 引入 Ant Design Form 实例会导致两套 form 状态并存，数据同步复杂且易出 bug
- 现有 `form-with-value.tsx` 已验证 flowgram `FieldArray` 可以处理嵌套结构

**备选方案**：复用 `RenderInput/CmpByType`（使用 Ant Design Form）→ 排除，因为需要额外维护 Ant Design Form 实例与 flowgram form 的双向同步。

---

### D3：嵌套 Object 字段路径管理 — `FieldArray` + `namePath` 拼接

**决策**：通过递归组件 `ParamInputItem` + `namePath: string[]` props 传递，在 flowgram `FieldArray` 中用拼接路径访问 subParams 值

**数据路径示例**：

```
inputParam[0].value            → 顶层 string 参数的值
inputParam[1].subParams[0].value → object 参数第一个子字段的值
inputParam[2][0]               → array 参数第一个元素的值
```

**理由**：与 `CmpByType` 的 `namePath` 思路一致，但适配 flowgram `FieldArray` 的 `field.name` 路径体系。

---

### D4：值序列化为 string 的时机 — onChange 时实时转换

**决策**：在各类型控件的 `onChange` 回调中，将原生值（`number`/`boolean`/`string`）立即转为 `string` 后写入 flowgram form

**理由**：

- 保持与现有后端接口一致（所有 value 字段为 string）
- 避免在 form submit 时做批量转换，降低遗漏风险
- `InputNumber` 的 `onChange` 返回 `number | null`，转 string 时处理 null → `''`
- `Select`（Boolean）的值为 `'true'`/`'false'` string，直接存储

**转换规则**：
| 类型 | 控件原生值 | 存储值 |
|------|-----------|--------|
| String | `string` | 原样 |
| Integer/Number | `number \| null` | `String(v ?? '')` |
| Boolean | `'true' \| 'false'` | 原样（已是 string） |
| Object | 不直接存值（通过子字段） | `''`（占位） |
| Array | 每个元素递归按类型转换 | 元素值为 string |

---

### D5：Object 折叠展开 — 本地 `useState` 控制

**决策**：每个 Object 类型参数维护独立的 `collapsed: boolean` 本地状态（默认展开）

**理由**：展开/折叠是纯 UI 状态，无需持久化到 form 数据中。使用 `useState` 最简单，且每个参数独立控制不相互影响。

---

## Risks / Trade-offs

| 风险                                                                                           | 缓解措施                                                                                          |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| flowgram `FieldArray` 对深度嵌套（Object 内 Array）的路径拼接可能有兼容问题                    | 先实现一层嵌套，验证后再递归；参考 `form-with-value.tsx` 中已有的 subParams 嵌套用法              |
| Array 动态增删行时，flowgram form 的数组下标漂移（删除中间项）                                 | 使用 `field.remove(index)` 官方 API，确保 form 状态正确更新；加 key 用 index（数组元素无稳定 ID） |
| Boolean Select 存 `'true'`/`'false'` string，后端如果期望 `true`/`false` boolean 会解析出错    | 确认后端接口文档；若需要，在 submit 时做统一的 value 解析（不影响 form 存储层）                   |
| 两个节点（tool/sub-workflow）使用同一组件，但可能有微小差异需求（如 sub-workflow 不显示 desc） | 通过 props 控制差异行为（`showDesc?: boolean`），避免 fork 两份组件                               |

---

## Migration Plan

1. 新建 `form-components/fixed-params-input/index.tsx` 和 `index.less`，完整实现并本地验证
2. 修改 `nodes/tool/form.tsx`：替换 `ParamsFormWithValue` → `FixedParamsInput`，验证工具节点正常
3. 修改 `nodes/sub-workflow/form.tsx`：替换 `ParamsFormWithValue` → `FixedParamsInput`，验证子工作流节点正常
4. 运行 `npm run lint:script` 确认无 TS/lint 错误
5. 手工回归：工具节点/子工作流节点的入参填写、各类型控件渲染、Object 折叠展开、Array 增删、提交数据格式

**回滚策略**：直接恢复两个 form 文件中的 `ParamsFormWithValue` 调用，新组件文件可保留不影响其他功能。

---

## Open Questions

1. **交互稿登录问题**：Popo 交互稿未能获取（登录超时），Object 折叠展开的具体交互细节（默认状态、折叠时显示方式）待确认
2. **Array 元素类型**：当 Array 的 `subType` 为 Object 时，是否需要支持子字段展开？暂按不支持处理，仅渲染 Input 兜底
3. **`showDesc` 需求**：工具节点 `showDesc={!isTemplateTool}` 中的描述字段在新组件中是否继续支持？需与 PM/设计确认
