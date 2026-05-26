# 记忆库详情页面规格

## ADDED Requirements

### Requirement: 页面布局

系统 SHALL 以左右分栏布局展示记忆库详情：

- **左侧面板**：用户 UID 列表
- **右侧面板**：选中用户的记忆列表

#### Scenario: 页面初始化

- **WHEN** 用户进入记忆库详情页面
- **THEN** 系统从 URL 参数获取 `repositoryId`，加载用户列表展示在左侧面板
- **THEN** 右侧面板显示空状态提示"请选择一个用户查看记忆"

### Requirement: 用户 UID 列表

系统 SHALL 在左侧面板展示该记忆库下的所有用户 UID，支持搜索和分页。

#### Scenario: 加载用户列表

- **WHEN** 页面初始化或用户切换分页
- **THEN** 系统调用 `/agent/api/memory/repository/listUsers` 获取用户列表
- **THEN** 参数包含 `repositoryId`、`offset`、`limit`

#### Scenario: 搜索用户 UID

- **WHEN** 用户在搜索框输入 UID 关键字并触发搜索
- **THEN** 系统调用 `/agent/api/memory/repository/listUsers` 带 `userId` 参数进行模糊查询
- **THEN** 列表展示匹配结果

#### Scenario: 用户列表为空

- **WHEN** 记忆库下无任何用户数据
- **THEN** 左侧面板显示空状态提示"暂无用户记忆数据"

#### Scenario: 分页切换

- **WHEN** 用户点击分页器切换页码
- **THEN** 系统根据新的 `offset` 重新请求数据并更新列表

### Requirement: 选中用户查看记忆

系统 SHALL 支持点击用户 UID 在右侧面板展示该用户的所有记忆。

#### Scenario: 选中用户加载记忆

- **WHEN** 用户点击左侧列表中的某个 UID
- **THEN** 系统高亮选中项
- **THEN** 系统调用 `/agent/api/memory/repository/memories` 传入 `repositoryId` 和 `userId`
- **THEN** 右侧面板展示该用户的记忆列表

#### Scenario: 用户无记忆数据

- **WHEN** 选中的用户在该记忆库下无任何记忆
- **THEN** 右侧面板显示空状态提示"该用户暂无记忆数据"

### Requirement: 记忆列表展示

系统 SHALL 在右侧面板以列表形式展示用户的记忆，每条记忆 MUST 包含：

- 记忆内容（文本）
- 创建时间
- 删除按钮

#### Scenario: 记忆列表正常展示

- **WHEN** 成功获取用户记忆数据
- **THEN** 系统以时间倒序展示记忆列表，每条记忆显示内容和创建时间

### Requirement: 删除单条记忆

系统 SHALL 支持删除用户的单条记忆。

#### Scenario: 删除记忆成功

- **WHEN** 用户点击某条记忆的删除按钮
- **THEN** 系统弹出二次确认弹窗
- **WHEN** 用户确认删除
- **THEN** 系统调用 `/agent/api/memory/repository/deleteMemory` 执行删除
- **THEN** 删除成功后从列表中移除该条记忆

#### Scenario: 取消删除

- **WHEN** 用户点击删除按钮后在确认弹窗中点击取消
- **THEN** 系统关闭弹窗，不执行任何操作

### Requirement: 返回列表

系统 SHALL 提供返回记忆库列表的导航。

#### Scenario: 点击返回

- **WHEN** 用户点击页面顶部的返回按钮或面包屑导航
- **THEN** 系统跳转回记忆库列表页面
