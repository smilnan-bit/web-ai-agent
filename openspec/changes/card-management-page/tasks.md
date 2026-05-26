# Tasks

## Task 1: 新建 `src/api/card.ts`

新建卡片相关 API 文件，定义 `CardItem` 类型及四个接口函数。

- [x] 1.1 创建 `src/api/card.ts`，定义 `CardItem` 接口类型（`id`, `name`, `spec`, `updatedAt` 等字段）
- [x] 1.2 实现 `getCardList(params: TableParamsType): TableResultType<CardItem>`
- [x] 1.3 实现 `getCardDetail(params: { id: string }): RequestResultType<CardItem>`
- [x] 1.4 实现 `saveCard(data: { id?: string; spec: PreviewSpec; name?: string }): RequestResultType`
- [x] 1.5 实现 `deleteCard(data: { id: string }): RequestResultType`

## Task 2: 路由配置调整（`src/routes/index.tsx`）

- [x] 2.1 将 `card` 路由的 `title` 改为「卡片管理」
- [x] 2.2 新增 `/card/editor` 子路由（`hidden: true`，`nopadding: true`），组件指向 `CardEditor`
- [x] 2.3 保留原有 `/cardEditor` 路由（调试用，不删）

## Task 3: 新增 `emptySpec` 及模板配置（`CardEditor/constants.ts`）

- [x] 3.1 在 `constants.ts` 中新增 `emptySpec`（`version: '0.2.0'` + 默认 theme + `root: { type: 'page', children: [] }`）
- [x] 3.2 新增 `cardTemplates` 数组，当前只有一项：`{ id: 'blank', name: '空白', spec: emptySpec }`

## Task 4: 改造 `CardEditor/index.tsx`

- [x] 4.1 引入 `useQueryLocationSearch` 和 `useQueryLocationState` 读取 `id` 和 navigate state
- [x] 4.2 有 `id` 时用 `useRequest(getCardDetail)` 加载数据并初始化 spec
- [x] 4.3 从 navigate state 读取 `prompt` 和 `templateSpec`：有 `templateSpec` 时初始化 spec，有 `prompt` 时在 `useEffect` 中自动触发首次 chat
- [x] 4.4 `Breadcrumbs` 传入 `currentText`（新建：「新建卡片」，编辑：「编辑卡片」）
- [x] 4.5 `handleSave` 改为调用 `saveCard({ id?, spec, name })`，成功后区分 toast 文案（创建成功/保存成功）并 `navigate('/card')`
- [x] 4.6 更新 `CardEditor/api.ts` 中的 `sendChat`，保留 SSE 兼容（暂不删除，后续由 card-api 统一）

## Task 5: 实现卡片列表页（`src/pages/Card/index.tsx`）

- [x] 5.1 实现列表状态：`useRequest(getCardList, { refreshDeps: [page] })`，默认 `pageSize=20`
- [x] 5.2 实现有数据状态：页面标题 + 「新建卡片」按钮 + 3 列网格
- [x] 5.3 实现空数据状态：渐变背景 + AI 生成卡片引导区（标题、tooltip、副标题）
- [x] 5.4 实现空状态模板选择区：渲染 `cardTemplates`，点击高亮选中
- [x] 5.5 实现空状态输入框 + 发送按钮：输入内容 + 选中模板后点击，`navigate('/card/editor', { state: { prompt, templateSpec } })`
- [x] 5.6 实现卡片缩略图：`<SpecPreview>` + CSS scale 缩放（外层固定高度 `overflow: hidden`，内层 `pointer-events: none`）
- [x] 5.7 实现 hover 遮罩：查看/编辑/删除操作入口
- [x] 5.8 实现分页控件（`Pagination`，`pageSize=20`）

## Task 6: 实现查看卡片弹窗（`src/pages/Card/components/ViewCardModal.tsx`）

- [x] 6.1 创建组件，接收 `cardId` 和 `visible` props
- [x] 6.2 打开时调用 `getCardDetail(cardId)` 获取数据（含 spec 和内容）
- [x] 6.3 左栏：`<SpecPreview>` 正常尺寸渲染（允许交互）
- [x] 6.4 右栏上半部分：`ReactJson` 只读展示 spec JSON
- [x] 6.5 右栏下半部分：展示卡片内容数据（来自 `getCardDetail` 响应）
- [x] 6.6 底部操作：「编辑」按钮（navigate 到编辑页）、「删除」按钮（触发删除确认弹窗）

## Task 7: 实现删除确认弹窗

- [x] 7.1 在 `Card/index.tsx` 中用 `Modal.confirm` 实现删除二次确认
- [x] 7.2 确认后调用 `deleteCard({ id })`，成功后 `message.success('删除成功')` 并刷新列表
- [x] 7.3 查看弹窗中的删除也复用同一逻辑（关闭查看弹窗 → 触发删除确认）

## Task 8: 样式文件

- [x] 8.1 创建 `src/pages/Card/index.less`：卡片网格、缩略图容器、hover 遮罩、空状态渐变背景
- [x] 8.2 创建 `src/pages/Card/components/ViewCardModal.less`：弹窗两栏布局

## Task 9: 回归验证

- [ ] 9.1 验证空状态引导流程：选择模板 → 填写描述 → 发送 → 跳转编辑页并自动触发 AI 对话
- [ ] 9.2 验证列表页：卡片缩略图正确渲染，hover 操作正常
- [ ] 9.3 验证查看弹窗：左右布局正确，JSON 只读，内容展示正常
- [ ] 9.4 验证新建流程：编辑后保存，toast「创建成功」，跳回列表
- [ ] 9.5 验证编辑流程：加载已有卡片数据，修改后保存，toast「保存成功」，跳回列表
- [ ] 9.6 验证删除流程：二次确认后删除，列表刷新
- [ ] 9.7 验证面包屑：「卡片管理」可点击返回列表，末级显示正确文案
- [ ] 9.8 验证 `/cardEditor` 调试路由依然可用
