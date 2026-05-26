## ADDED Requirements

### Requirement: BindCard 选择面板在五种卡片下列出所有 a2ui 卡片

`src/pages/AppList/components/EditContent/BindCard/SelectType.tsx` MUST 在现有 `product` / `order` / `flow` / `button` / `image` 五种 OptionCard 之下，追加一段「a2ui 卡片」区域，SHALL 调用 `/cotui/spec/list` 拉取当前空间下所有已发布的 cotUi 卡片，并为每张卡片渲染一个与原五种卡片并列的 OptionCard。

- 每张 a2ui 卡片的 `OptionCard` SHALL 以卡片的 `name` 作为标题、以 spec 的缩略渲染（复用 `SpecPreview` 的 `fitContainer` 模式）或封面图作为 `optionPic`
- 选中 a2ui 卡片时，SHALL NOT 进入原有 `CardTypeConfig` / `DialogueCardTypeConfig` 的 `formConfig` 渲染流程，而是进入「cotUi 动态数据配置面板」（见下方 Requirement）
- 不再新增 `CardTypeEnum.cotUi` 作为独立的第六种类型；所有 a2ui 卡片共用一个内部 `cardType === 'cotUi'` 标记，`specId` 用于区分具体卡片

#### Scenario: Dialog 节点卡片类型选择列出 a2ui 卡片

- **WHEN** 用户在 Dialog 节点 form 中选择「回答类型 = 卡片选择」，打开 BindCard 弹窗
- **THEN** 弹窗左侧的卡片样式选择区在 `product / order / flow / button / image` 五项之下额外展示 a2ui 卡片列表，每张卡片 OptionCard 内展示卡片名称与缩略预览

#### Scenario: 选中 a2ui 卡片后的弹窗布局

- **WHEN** 用户点选任意一张 a2ui 卡片 OptionCard
- **THEN** 弹窗布局 SHALL 变为三栏：
  - 左栏：保留 SelectType 选择面板（当前选中项高亮）
  - 中栏：展示动态数据配置面板（变量映射表：每一行 = spec 中一条 binding 路径 + 序号 + 工作流变量引用选择器）
  - 右栏：使用 `SpecPreview` 渲染所选 spec，并在每个带 binding 的叶子节点上叠加序号徽章（1、2、3……），序号与中栏行一一对应

### Requirement: CardConfig 扩展 cotUi 子对象

`CardConfig` 类型 MUST 扩展 `cotUi?: { specId: number; bindings: Record<string, string> }`。

- `specId`：引用 `/cotui/spec/list` 中的卡片 id
- `bindings`：spec 内 binding 路径 → 工作流变量引用的映射
- SHALL NOT 包含 `outputKeys` 字段；USER_RESPONSE 的子参数由 spec 本身推导（见下方「输出参数由 spec meta 推导」Requirement），用户 SHALL NOT 在 BindCard 面板中勾选输出字段

#### Scenario: 动态数据配置面板

- **WHEN** 用户在 BindCard 弹窗中选中某张 a2ui 卡片
- **THEN** 中栏展示 spec 的所有 `bindingPaths`（调用 `getSpecMeta(specId)` 返回），每行包含：`#序号` + binding 路径 + 工作流上下文变量引用选择器；同一序号的变量位置在右栏卡片预览中以徽章形式叠加展示

#### Scenario: 输出参数自动派生，不提供勾选入口

- **WHEN** 用户在 BindCard 弹窗中配置 cotUi 卡片
- **THEN** 面板 SHALL NOT 展示「输出字段勾选」区域；保存后 Dialog 节点的 `USER_RESPONSE.subParams` 由 spec 中所有 `input` / `select` / `buttonGroup` 节点的 `value.binding` 路径自动推导

### Requirement: SpecPreview 支持动态变量位置徽章

`src/pages/CardEditor/components/SpecPreview.tsx` MUST 新增可选 prop `bindingBadges?: Map<string, number>`，当传入时 SHALL 在渲染含 `BindingValue` 字段的叶子节点（`text` / `input.label|placeholder|value` / `image.src|alt` / `badge.label` / `button.label` / `select.label|placeholder`）外层叠加一个带序号的圆形徽章（数字取自 map 中 `bindingPath → index`）。

- 徽章 SHALL 绝对定位于节点左上角，不影响原布局
- 同一个 binding 路径在 spec 中出现多次时，所有出现位置共享同一个序号
- 切换 spec 时，由于徽章依赖外部传入的 bindings 顺序，SHALL 自动随新 spec 重新定位

#### Scenario: 切换卡片后徽章随 spec 自动重绘

- **WHEN** 用户在 BindCard 弹窗中从 a2ui 卡片 A 切换到 a2ui 卡片 B
- **THEN** 右栏 `SpecPreview` 使用 B 的 spec 渲染，中栏的变量行列表根据 `collectBindings(specB)` 重新生成；右栏的序号徽章按新顺序叠加在 B 的对应叶子节点上

### Requirement: a2ui 卡片复用对话节点的单一 direct 输出端口

a2ui 卡片选择类型 SHALL NOT 引入额外端口；与 product / order 卡片一致，统一走 `dialog-direct-${type}` 主端口 + `dialog-otherwise` 兜底端口。

`src/pages/Workflow/NewGraph/nodes/dialog/index.ts` 的 `getBackendEdgeData` 中，当 `type === card` 且 `cardType === 'cotUi'`，`relationship.optionValue` SHALL 取 `cardConfig.cotUi.specId`（仅作来源标识，后端按需使用）。

#### Scenario: 生成分支 edgeData

- **WHEN** Dialog 节点 `type === card` 且 `cardConfig.cardType === 'cotUi'`，用户从节点的 direct 输出端口连出一条 edge
- **THEN** `getBackendEdgeData` 返回 `relationship: { optionValue: <specId>, otherWise: false, type: DialogAnswerTypeEnum.card }`

#### Scenario: 从 edgeData 反推端口

- **WHEN** 加载已保存的工作流，遇到 cotUi Dialog 节点的 edge
- **THEN** `getPortIdFromEdgeData` 走与其他卡片类型一致的逻辑，返回 `dialog-direct-${type}`（主输出）或 `dialog-otherwise`（兜底）

### Requirement: 输出参数由 spec meta 自动推导

MUST 新增 `getDialogOutParamByCotUiCard`（位于 `dialog/output.tsx`），根据 spec meta 自动生成 USER_RESPONSE 的 subParams，SHALL NOT 读取任何用户勾选配置。

- 输出字段 SHALL 等于 spec 中所有 `input` / `select` / `buttonGroup` 节点的 `value.binding` 路径集合（即"上报字段的 key 即 value.binding"）
- `getSpecMeta` 返回的 `reportDataKeys` SHALL 即为上述 `value.binding` 路径列表
- 字段类型默认 `string`；后续可按节点类型扩展（`select` / `buttonGroup` multiple 模式 → `array`）

#### Scenario: USER_RESPONSE 结构生成

- **WHEN** 工作流编辑器渲染 Dialog.cotUi 节点的输出
- **THEN** USER_RESPONSE 结构为：
  ```
  {
    name: 'USER_RESPONSE',
    type: object,
    subParams: [
      { name: 'actionName', type: string },
      { name: 'actionType', type: string },
      ...spec 中每个 input/select/buttonGroup 的 value.binding 对应的字段
    ]
  }
  ```

#### Scenario: 切换 spec 或修改 spec 后输出实时更新

- **WHEN** 用户在 BindCard 中切换 specId，或 spec 被编辑后重新发布
- **THEN** Dialog 节点的输出参数 `subParams` SHALL 根据最新 spec 的 `value.binding` 列表重新生成，不依赖用户再次交互

### Requirement: 新增 getSpecMeta 接口供 Dialog 节点使用

`src/api/card.ts` MUST 新增 `getSpecMeta({ id })`，SHALL 返回 `{ reportDataKeys, actionNames, bindingPaths }`。

- `reportDataKeys`：spec 中所有 `input` / `select` / `buttonGroup` 节点的 `value.binding` 路径列表（用作 USER_RESPONSE 子参数名）
- `actionNames`：spec 中所有 `button.action.name` 列表
- `bindingPaths`：spec 中所有 `BindingValue.binding` 路径列表，保持 DFS 遍历顺序（中栏变量行和右栏徽章序号依赖此顺序）

#### Scenario: Dialog 节点加载 spec meta

- **WHEN** 用户在 BindCard 弹窗中选中某张 a2ui 卡片
- **THEN** 调用 `getSpecMeta({ id: specId })`，根据返回值渲染中栏变量映射面板和右栏 `SpecPreview` 的徽章序号

#### Scenario: 接口返回与前端 collectEventInfo / collectBindings 一致

- **WHEN** 后端实现 `getSpecMeta` 时
- **THEN** 其返回的 `reportDataKeys` SHALL 等价于前端 `collectEventInfo` 收集 `value.binding` 路径的结果；`bindingPaths` SHALL 等价于前端 `collectBindings(spec).map(b => b.path)` 的顺序

### Requirement: checkVariable 支持 cotUi 配置完整性校验

`dialog/index.ts` 的 `checkVariable` MUST 增加 cotUi 分支：当 `cardType === 'cotUi'` 时，SHALL 遍历 `cotUi.bindings` 中的每个变量引用，确认其在 `availableVariables` 中存在。

#### Scenario: bindings 引用未定义变量

- **WHEN** 用户在 cotUi 变量映射面板中为某个 binding 路径填写了变量引用，但该引用在后续流程中被删除
- **THEN** Dialog 节点显示校验错误，阻止工作流保存

### Requirement: cotUi 类型不复用 cardOutputStyle 配置

现有 `cardOutputStyle`（`CardOutputModeEnum.msgBubble` = 1 / `bottomPopup` = 2）SHALL NOT 在 cotUi 类型下生效，Dialog 节点表单中 SHALL 对 cotUi 类型隐藏该配置项。卡片展示形态由访客端自行决定。

#### Scenario: cotUi 类型隐藏 outputStyle 配置

- **WHEN** 用户在 Dialog 节点中选择 `cardType === 'cotUi'`
- **THEN** 表单中 SHALL NOT 显示「输出样式」选择项；保存的 workflow JSON 中 SHALL NOT 写入 `cardOutputStyle` 字段（或写入但后端下发时忽略）
