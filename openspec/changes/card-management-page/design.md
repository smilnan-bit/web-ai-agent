## Architecture

### 路由层级调整

```
/card                    → Card (卡片管理列表页，已在菜单中显示)
  /card/editor           → CardEditor (新建/编辑，hidden，面包屑: 卡片管理 > 新建卡片 / 编辑卡片)
/cardEditor              → CardEditor (保留，调试用，不动)
```

CardEditor 通过 `useQueryLocationSearch()` 读取 `?id=xxx`：

- 无 `id` → 新建模式，面包屑末级显示「新建卡片」，spec 初始为 `emptySpec`，保存后 toast「创建成功」
- 有 `id` → 编辑模式，面包屑末级显示「编辑卡片」，加载 `getCardDetail(id)` 数据，保存后 toast「保存成功」
- 保存成功后统一 `navigate('/card')`

### API 层设计

新建 `src/api/card.ts`，将 `CardEditor/api.ts` 的 `saveCardSpec` 迁移进来并扩展：

```typescript
getCardList(params: TableParamsType)              → GET  /agent/api/card/list
getCardDetail(params: { id: string })             → GET  /agent/api/card/get
saveCard(data: { id?: string; spec: PreviewSpec; name?: string }) → POST /agent/api/card/save
deleteCard(data: { id: string })                  → POST /agent/api/card/delete
```

### Card 列表页 (`src/pages/Card/index.tsx`)

**有卡片状态（卡片数量 > 0）**：

- 页面标题「卡片管理」+ 右上角「新建卡片」按钮（`navigate('/card/editor')`）
- 3 列网格，每个卡片格子：
  - 上方：`<SpecPreview>` 缩小渲染（CSS `transform: scale(0.35)` + `pointer-events: none`，外层 `overflow: hidden`）
  - 下方：卡片名称
  - Hover：遮罩层 + 「查看」「编辑」「删除」三个文字链
- 分页：`pageSize=20`，`useRequest` + `refreshDeps: [page]`

**无卡片状态（空状态）**：

- 渐变背景（紫蓝色椭圆光晕，CSS 实现）
- 居中布局：
  - 标题「AI 生成卡片」+ ⓘ tooltip
  - 副标题文案
  - 输入框 + 发送按钮（选中模板且输入内容后发送，`navigate('/card/editor')`，携带 `state: { prompt, templateSpec }`）
  - 模板选择区（横向滚动，目前只有「空白」模板，点击选中高亮）

### 查看卡片弹窗

组件：`<ViewCardModal>`，位于 `src/pages/Card/components/ViewCardModal.tsx`

```
┌──────────────────────────────────────────────────────┐
│ 查看卡片                                        ✕    │
│ ┌─────────────────┬───────────────────────────────┐  │
│ │                 │  JSON（只读 ReactJson）        │  │
│ │  <SpecPreview>  ├───────────────────────────────┤  │
│ │  (交互可用)     │  内容（getCardDetail 数据）    │  │
│ └─────────────────┴───────────────────────────────┘  │
│                                        [编辑] [删除]  │
└──────────────────────────────────────────────────────┘
```

- 弹窗宽度 900px
- 左右分栏：左 `flex: 1`，右 `flex: 1`（右侧上下 split，上 JSON 只读，下内容 tab）
- 打开时调用 `getCardDetail(id)` 获取数据
- 「编辑」→ `navigate('/card/editor?id=xxx')`；「删除」→ 打开删除确认弹窗

### 删除确认弹窗

使用 antd `Modal.confirm` 或独立 `<DeleteConfirmModal>` 组件：

- 标题：「删除」
- 内容：「删除后，将不可恢复，请谨慎选择。」
- 按钮：「删除」（danger）/ 「取消」

### CardEditor 改造要点

1. `emptySpec` 新增到 `constants.ts`（version + theme + 空 page root，`children: []`）
2. 读取 `useQueryLocationSearch()` 的 `id`
3. 有 `id` 时 `useRequest(getCardDetail, { manual: false })` 初始化 spec
4. `Breadcrumbs` 使用 `currentText` prop 传入「新建卡片」/「编辑卡片」
5. `handleSave` 传 `id` 字段到 `saveCard`，成功后 `navigate('/card')`

## Key Decisions

- **SpecPreview 缩略图**：使用 CSS `transform: scale()` 方案，外层容器固定尺寸 + `overflow: hidden`，内层 `pointer-events: none` 防止交互穿透
- **空状态输入框**：选中模板后点发送，将 `{ prompt, templateSpec }` 通过 `navigate state` 传给 CardEditor，CardEditor 读取 `useQueryLocationState()` 初始化并自动触发首次 chat
- **模板数据**：暂时只有「空白模板」，spec 为 `emptySpec`，后续扩展在 `constants.ts` 中 `cardTemplates` 数组里追加
