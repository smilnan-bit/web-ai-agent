## 1. 对齐工作流版本历史 API 定义

- [x] 1.1 在 `src/pages/Workflow/NewGraph/api/index.ts` 中，将 `getWorkflowHistoryList` 的 URL 和入参与文档对齐（`/agent/api/workflow/version/list`，包含 `workflowId`、`pageNo`、`pageSize`）,pageNO 固定传 1，pageSize 固定传 100
- [x] 1.2 在 `src/pages/Workflow/NewGraph/api/index.ts` 中，将 `getWorkflowHistoryVersionDetail` 的入参从 `versionId` 调整为 `version`，并确保使用响应中的 `canvasInfo` 字段
- [x] 1.3 在 `src/pages/Workflow/NewGraph/api/index.ts` 中，将 `restoreWorkflowVersion` 的 URL 从 `/recover` 调整为 `/restore`，请求体为 `{ workflowId, version }`

## 2. 更新类型定义与数据映射

- [x] 2.1 在 `src/types/Workflow.d.ts` 中补充/更新工作流版本历史相关类型（如 `WorkflowHistoryItem`、`WorkflowVersionDetail`），字段名与 API 文档保持一致：`version`、`operatorName`、`releaseTime`、`canvasInfo` 等
- [x] 2.2 在 `src/pages/Workflow/NewGraph/components/workflow-history/index.tsx` 中，调整列表数据映射：使用 `version` 替代 `versionId`，`operatorName` 替代 `operator`，`releaseTime` 替代 `operateTime`
- [x] 2.3 在 `WorkflowHistory` 中使用 `dayjs(releaseTime)` 渲染发布时间，确保格式为 `YYYY-MM-DD HH:mm`

## 3. 历史版本详情与只读模式

- [x] 3.1 在 `WorkflowHistory` 的版本点击逻辑中，使用 `getWorkflowHistoryVersionDetail({ workflowId, version })`，从响应的 `data.canvasInfo` 解析画布 JSON 并调用 `editorRef.current.document.reload`
- [x] 3.2 确保编辑器在历史版本模式下设置 `playground.config.readonly = true`，在返回"当前版本"时重置为 `false`（检查 `editor.tsx` 与相关 context）
- [x] 3.3 确认所有依赖可编辑状态的 UI（如节点表单、工具栏按钮、试运行入口）都受 `playground.config.readonly` 控制

## 4. 历史版本恢复流程与文案

- [x] 4.1 在 `WorkflowHistory` 中实现"恢复历史版本"点击逻辑：调用 `restoreWorkflowVersion({ workflowId, version })`
- [x] 4.2 恢复前弹出确认弹窗，文案参考后端文档："恢复后将覆盖当前最新的画布内容，且不可找回，请谨慎选择"
- [x] 4.3 恢复成功后给出提示（如 `message.success`），并视情况刷新当前草稿（可通过重新加载画布数据实现）

## 5. 回归与边界场景

- [ ] 5.1 针对存在多条历史版本的工作流，验证：列表展示、版本切换、恢复功能是否与时间线和版本号一致
- [ ] 5.2 验证在 `readonly` 模式下，节点拖拽、连线、新增节点、表单编辑、试运行等交互均被禁用
- [ ] 5.3 验证在网络错误或接口返回非 200 时，前端能正确提示错误信息，不破坏当前画布状态
