## Context

当前工作流编辑器已经实现了部分“发布记录/历史版本”侧边栏能力，包括：

- 在右侧最外层展示发布历史列表面板
- 点击某个历史版本后，通过接口拉取对应版本的画布配置并渲染到画布上
- 在历史版本模式下将画布切为只读（readonly），防止编辑

但现状与后端最新的 API 文档存在以下不一致/待对齐点：

- 接口 URL 与字段命名不完全一致：
  - 列表接口：响应字段为 `version`、`operatorName`、`releaseTime`
  - 详情接口：画布字段为 `canvasInfo`，节点列表字段为 `nodeList`
  - 恢复接口：标准路径为 `/api/workflow/version/restore`，当前前端使用 `/recover`
- 前端类型定义 `WorkflowNS.WorkflowHistoryItem` 与实际返回结构需要确认并更新
- 恢复历史版本的 API 语义需要与“覆盖当前草稿、不可逆”保持一致，并在前端文案中体现

本设计文档的目标，是在不破坏现有工作流编辑体验的前提下，对前端实现进行一次集中对齐和补齐。

## Goals / Non-Goals

**Goals:**

- 与后端《工作流版本历史管理 API 文档》完全对齐：URL、请求参数、响应字段
- 确保以下能力可用且交互合理：
  - 查询并展示指定工作流的历史发布版本列表
  - 查看某个版本的完整画布配置，并在只读模式下浏览
  - 将某个历史版本恢复为当前草稿，并覆盖现有草稿
- 对已有历史版本侧边栏代码进行必要的小范围重构，让结构清晰、可维护

**Non-Goals:**

- 不在本次改动中新增“版本对比 diff”能力
- 不改动工作流发布逻辑本身（仍由现有发布接口生成新版本）
- 不改动权限/多租户相关逻辑（沿用后端 Session 中的 tenantGuid/accountGuid）

## Decisions

1. **API URL 与方法对齐**

   - 列表接口：
     - 使用 `GET /agent/api/workflow/version/list`
     - 请求参数：`workflowId`、`pageNo`(默认 1)、`pageSize`(默认 20)
     - 响应 `data` 为数组，每项字段：`workflowId`、`version`、`operatorName`、`releaseTime`
   - 详情接口：
     - 使用 `GET /agent/api/workflow/version/detail`
     - 请求参数：`workflowId`、`version`
     - 响应 `data` 字段：`workflowId`、`version`、`canvasInfo`、`firstNodeId`、`operatorName`、`releaseTime`、`nodeList`
     - 前端仅强依赖 `canvasInfo`（画布 JSON）、`firstNodeId`（首节点 ID 预留）、`operatorName`、`releaseTime`
   - 恢复接口：
     - 使用 `POST /agent/api/workflow/version/restore`
     - 请求体 JSON：`{ workflowId, version }`
     - 响应 `data` 为 `true/false`，前端仅根据 `code === 200` 判定成功

2. **前端 API 封装调整**

   - 在 `src/pages/Workflow/NewGraph/api/index.ts` 中：
     - `getWorkflowHistoryList`：
       - 确认 URL 为 `/agent/api/workflow/version/list`
       - 将 `pageNo`、`pageSize` 设置默认值（如调用处未传则由调用方补齐）
     - `getWorkflowHistoryVersionDetail`：
       - 将参数从 `{ workflowId, versionId }` 改为 `{ workflowId, version }`，与后端文档对齐
       - 响应中使用 `data.canvasInfo` 代替 `data.diagramInfo`
     - `restoreWorkflowVersion`：
       - URL 从 `/agent/api/workflow/version/recover` 调整为 `/agent/api/workflow/version/restore`
       - 请求体为 `{ workflowId, version }`

3. **前端类型与字段映射**

   - 在 `src/types/Workflow.d.ts` 中新增/更新类型：
     - `WorkflowHistoryItem`：
       - 字段：`workflowId: number; version: number; operatorName: string; releaseTime: number;`
     - `WorkflowVersionDetail`：
       - 字段：`workflowId: number; version: number; canvasInfo: string; firstNodeId?: string; operatorName: string; releaseTime: number; nodeList?: any[];`
   - 在 `WorkflowHistory` 组件中：
     - 将现有使用的 `versionId` 字段替换为 `version`
     - 将 `operator` 字段替换为 `operatorName`
     - 将 `operateTime` 字段替换为 `releaseTime`

4. **UI 与交互行为**

   - 历史版本侧边栏（`WorkflowHistory` 组件）：
     - 列表项展示：
       - 发布人：使用 `operatorName`
       - 发布时间：使用 `releaseTime`，格式化为 `YYYY-MM-DD HH:mm`
       - 版本标识：内部 state 使用 `current` 索引区分“当前草稿/某历史版本”
     - 点击某一历史版本：
       - 调用 `getWorkflowHistoryVersionDetail({ workflowId, version: item.version })`
       - 从响应中读取 `canvasInfo` 并 `document.reload(text2object(canvasInfo))`
       - 调用 `onVersionChange(true)`，编辑器进入历史版本模式
       - 调用 `editorRef.current?.tools.fitView()` 调整视图
   - 恢复历史版本：
     - 点击“恢复历史版本”时：
       - 弹出二次确认弹窗，文案对齐后端文档说明：“恢复后将覆盖当前最新的画布内容，且不可找回，请谨慎选择”
       - 确认后调用 `restoreWorkflowVersion({ workflowId, version })`
       - 成功后：
         - 提示“恢复成功，请重新发布以生效”
         - 可选：自动刷新当前草稿数据（通过重新拉取草稿接口）

5. **只读模式（readonly）策略**
   - 保持现有 `playground.config.readonly` 方案：
     - 进入历史版本模式时：`readonly = true`
     - 切回当前草稿时：`readonly = false`
   - 在节点表单、工具栏等组件侧：
     - 已通过 `playground.config.readonly` 控制禁用交互（如节点拖拽、连线、表单编辑、试运行入口等）
   - 新增的 `FormFragment` 蒙层：
     - 当 `readonly = true` 时，在表单段落上方加半透明蒙层，阻断交互，统一展示态与只读态体验

## Risks / Trade-offs

- **字段命名差异引发的回归风险**

  - 风险：老代码中使用的 `versionId`、`operator`、`operateTime` 等字段若未完全替换，可能导致历史列表或详情展示异常
  - 缓解：
    - 在类型定义中统一字段名，尽量通过 TypeScript 报错暴露遗漏点
    - 对相关页面做一次完整回归：查看列表、切换版本、恢复版本

- **恢复接口为不可逆操作**

  - 风险：用户误操作恢复版本，覆盖当前草稿，且无法通过前端撤销
  - 缓解：
    - 弹出确认弹窗，明确提示“不可恢复”的风险
    - 可选：在恢复前将当前草稿自动保存为一个新的历史版本（如后端支持）

- **只读模式切换带来的状态同步问题**
  - 风险：`readonly` 状态与 UI 某些区域不同步（例如表单、按钮、试运行入口）
  - 缓解：
    - 所有依赖可编辑性的区域应统一依赖 `playground.config.readonly`
    - 在代码层面搜索 `readonly` 使用点，确保覆盖关键交互点
