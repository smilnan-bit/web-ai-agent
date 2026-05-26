## Why

当前 Agent 平台缺少统一的卡片管理入口，用户无法浏览、新建、编辑、查看和删除 AI 生成的卡片。现有的 `/cardEditor` 路由是临时调试入口，不具备完整的卡片生命周期管理能力。

## What Changes

- 新增**卡片管理列表页**（`/card`）：展示所有卡片缩略图，支持 hover 操作（查看/编辑/删除）和分页（20 条/页）
- 新增**空状态引导页**：无卡片时展示渐变背景 + AI 输入框（输入描述并选择模板后点发送跳转编辑页）+ 可选模板
- 新增**查看卡片弹窗**：左侧预览 + 右侧只读 JSON + 内容数据展示（来自后端 `getCardDetail`）
- 新增**删除确认弹窗**：二次确认后调用 `deleteCard` 接口
- 改造 **CardEditor**（`/card/editor`）：支持 `?id=xxx` 区分新建/编辑模式，接入面包屑，保存后返回列表
- 新增**卡片相关 API 层**：`getCardList`、`getCardDetail`、`deleteCard`、`saveCard`（统一到 `src/api/card.ts`）
- 更新**路由配置**：将 `/card/editor` 作为 `/card` 的子路由，面包屑自动生成

## Capabilities

### New Capabilities

- `card-list`: 卡片管理列表页，含卡片缩略图网格、分页、hover 操作、空状态模板引导
- `card-editor`: 卡片编辑器页面，支持新建/编辑模式，三栏布局（JSON/预览/AI 对话），面包屑导航
- `card-api`: 卡片相关接口封装（list/get/save/delete）

### Modified Capabilities

（无）

## Impact

- `src/pages/Card/index.tsx`：从空文件改造为完整列表页
- `src/pages/CardEditor/index.tsx`：增加路由参数读取、面包屑配置、保存逻辑完善
- `src/pages/CardEditor/api.ts`：迁移并扩展到 `src/api/card.ts`
- `src/routes/index.tsx`：调整 card 相关路由层级结构
