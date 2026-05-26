## ADDED Requirements

### Requirement: 工作流节点类型定义

画布 DSL 中 SHALL 支持 `type: "workflow"` 的新节点类型，节点数据结构包含 `workflowId`（引用的子工作流 ID）、`inputs`（输入参数映射数组）和 `errorHandling`（异常处理策略）。

#### Scenario: 新增工作流节点

- **WHEN** 用户在节点列表顶部点击「工作流」节点并插入画布
- **THEN** 画布中新增一个 `type: "workflow"` 节点，`workflowId` 为空，`inputs` 为空数组，`errorHandling.strategy` 默认为 `"abort"`

#### Scenario: 工作流节点位于节点列表最上方

- **WHEN** 用户打开节点类型选择列表
- **THEN** 「工作流」节点条目 SHALL 展示在列表第一位，优先于其他节点类型

### Requirement: 工作流节点支持复制

画布中的工作流节点 SHALL 支持节点复制操作，复制后的节点拥有独立的 ID，但 `workflowId`、`inputs`、`errorHandling` 配置与原节点相同。

#### Scenario: 复制工作流节点

- **WHEN** 用户右键点击工作流节点并选择「复制」
- **THEN** 画布中新增一个与原节点配置完全相同的工作流节点，拥有新的节点 ID

### Requirement: 工作流节点支持重命名

工作流节点 SHALL 支持自定义卡片名称，重命名操作 MUST 不影响所引用子工作流的名称。

#### Scenario: 重命名工作流节点

- **WHEN** 用户双击工作流节点卡片名称并输入新名称确认
- **THEN** 节点卡片名称更新为用户输入的名称，所引用子工作流的名称保持不变
