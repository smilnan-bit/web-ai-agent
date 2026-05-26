## Why

工作流编辑器需要支持查看历史版本功能，让用户能够查看、对比和恢复已发布的历史版本。当前代码库中已有部分实现，但需要根据后端提供的标准 API 文档进行对齐和优化，确保前后端接口字段一致，功能完整可用。

## What Changes

- **更新 API 接口调用**：根据新的 API 文档调整请求参数和响应字段映射
  - 列表接口：字段名对齐（`version` vs `versionId`，`operatorName` vs `operator`）
  - 详情接口：字段名对齐（`canvasInfo` vs `diagramInfo`）
  - 恢复接口：URL 路径对齐（`/restore` vs `/recover`）
- **优化 UI 交互**：确保历史版本查看、切换、恢复功能流畅
- **错误处理**：完善 API 调用失败时的错误提示和处理
- **只读模式**：查看历史版本时自动进入只读模式，防止误编辑

## Capabilities

### New Capabilities

- `workflow-version-history`: 工作流版本历史管理能力
  - 查询工作流版本历史列表（分页）
  - 查看指定版本的完整配置信息
  - 恢复历史版本到当前草稿
  - 在只读模式下查看历史版本

### Modified Capabilities

<!-- 无现有能力需要修改 -->

## Impact

**影响的代码模块：**

- `src/pages/Workflow/NewGraph/api/index.ts` - API 接口定义
- `src/pages/Workflow/NewGraph/components/workflow-history/index.tsx` - 历史版本列表组件
- `src/pages/Workflow/NewGraph/editor.tsx` - 编辑器主组件（历史版本模式切换）
- `src/pages/Workflow/NewGraph/components/header-panel/index.tsx` - 头部面板（历史版本入口）

**API 变更：**

- `/agent/api/workflow/version/list` - 查询版本列表
- `/agent/api/workflow/version/detail` - 查询版本详情
- `/agent/api/workflow/version/restore` - 恢复历史版本

**依赖关系：**

- 依赖后端提供的工作流版本管理 API
- 需要确保 API 字段名与文档一致
