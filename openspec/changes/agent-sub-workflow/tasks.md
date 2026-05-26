# Tasks: agent-sub-workflow

> 后端接口由服务端实现，前端通过接口获取数据。以下任务均为**前端实现**。
>
> **约定接口（前端对接）**：
>
> - `GET /workflows?appId=:appId` — 获取工作流列表，返回字段含 `maxDepth`、`refCount`
> - `GET /workflows/:id/referrers` — 获取引用该工作流的父工作流列表 (`id`, `name`)
> - `GET /workflows/:id/params` — 获取子工作流最新发布版本的输入/输出参数定义

## Phase 1: DSL & 节点引擎

- [ ] 1. **定义 `WorkflowNodeData` TypeScript 类型**

  - 在节点类型定义文件中新增 `type: "workflow"` 节点的数据结构，包含 `workflowId`、`inputs`、`errorHandling` 字段
  - _参考_: `design.md` § D1

- [ ] 2. **工作流节点的 DSL 序列化 & 反序列化**
  - 在画布 store 中添加对 `type: "workflow"` 节点的解析与输出支持
  - _参考_: `specs/workflow-node/spec.md` § DSL 结构

## Phase 2: 节点面板 & 画布

- [ ] 3. **将「条件分支」标签改为「条件判断」**

  - 在节点面板的节点类型配置中，将 `condition` 节点的 `label` 修改为 `条件判断`
  - **注意**：仅改 label，不改 `type` 字段，保持向后兼容
  - _参考_: `specs/workflow-node-types/spec.md`

- [ ] 4. **在节点面板新增「工作流」节点类型入口**

  - 在节点类型列表中，`condition` 节点之后插入 `workflow` 节点的面板条目
  - 点击时：在画布新增节点并立即弹出子工作流选择弹窗
  - _参考_: `specs/workflow-node-types/spec.md`

- [ ] 5. **实现工作流节点 Card 组件**
  - 节点卡片展示：子工作流名称 / 未配置占位符、输入输出参数摘要
  - 当 `errorHandling.strategy === "branch"` 时，卡片底部渲染「异常」分支连接桩
  - _参考_: `specs/workflow-node-card/spec.md`

## Phase 3: 子工作流选择弹窗

- [ ] 6. **实现子工作流选择弹窗**
  - 调用 `GET /workflows?appId=:appId` 获取列表
  - 根据接口返回的 `maxDepth` 字段过滤：当前工作流自身 + `maxDepth >= 3` 的工作流不可选，并以置灰 + tooltip 方式提示原因
  - `hasLegacyVersion === true` 的工作流不可选
  - 搜索框支持按名称模糊搜索
  - _参考_: `specs/workflow-selection-modal/spec.md`

## Phase 4: 配置面板

- [ ] 7. **实现工作流节点右侧配置面板**

  - 顶部：已选子工作流名称 + 「更换」按钮（点击重新打开选择弹窗）
  - 中部：输入参数映射表，参数定义来自 `GET /workflows/:id/params`，支持选择上游变量或填入固定值
  - 底部：输出参数展示区（只读），同样来自 `/params` 接口的 End 节点输出
  - _参考_: `specs/workflow-node-form/spec.md`

- [ ] 8. **实现异常处理策略配置**
  - 在配置面板底部新增「异常处理」折叠区
  - 支持选择：`abort`（中断流程）/ `return`（返回默认值，展示各输出参数的默认值填写表单）/ `branch`（走异常分支）
  - _参考_: `specs/workflow-node-form/spec.md` § 异常处理配置

## Phase 5: 发布校验

- [ ] 9. **工作流发布前校验工作流节点**
  - 在发布前校验逻辑中，针对 `type: "workflow"` 节点增加：
    - `workflowId` 非空校验
    - `inputs` 参数映射完整性校验
    - 调用 `GET /workflows/:id/params` 校验引用参数在子工作流最新版本中仍存在
  - _参考_: `specs/workflow-node-validation/spec.md`

## Phase 6: 调试日志

- [ ] 10. **调试窗口支持展示工作流节点日志**
  - 对 `type: "workflow"` 节点的日志条目，渲染可折叠的子日志面板
  - 默认收起，点击展开后展示子工作流内部所有节点的日志
  - _参考_: `specs/sub-workflow-debug-log/spec.md`

## Phase 7: 工作流列表页

- [ ] 11. **工作流列表页新增「被引用」列**

  - 利用列表接口返回的 `refCount` 字段，在表格中插入「被引用」列
  - 数值 > 0 时可点击，点击后调用 `GET /workflows/:id/referrers`，以下拉浮层展示来源工作流列表
  - _参考_: `specs/workflow-list-columns/spec.md`

- [ ] 12. **删除工作流时的引用保护确认弹窗**
  - 在工作流删除操作前，检查列表数据中对应项的 `refCount`
  - 若 `refCount > 0`，弹出二次确认对话框展示引用数量和风险提示，用户确认后才执行删除
  - _参考_: `specs/workflow-delete-guard/spec.md`
