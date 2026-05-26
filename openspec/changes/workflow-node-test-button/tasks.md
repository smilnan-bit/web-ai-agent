## 1. 新增播放图标

- [x] 1.1 在 `nodes/icons.tsx` 中添加 `IconBofang` 播放图标组件（如需自定义样式）或确认使用 antd `PlayCircleOutlined`

## 2. 抽取通用 NodeDebugPanel 组件

- [x] 2.1 创建 `components/node-debug-panel/index.tsx` 通用调试面板组件(复用现有 DebugPanel）)

## 3. 新增大模型节点测试 API

- [x] 3.1 在 `api/workflow.tsx` 中新增 `executeLLMNode` API 函数
- [x] 3.2 定义请求参数类型：workflowId, mode, tipWord, temperature, param

## 4. 修改 FormHeader 添加测试 icon 入口

- [x] 4.1 在 `form-components/form-header/index.tsx` 中导入测试图标和 Tooltip
- [x] 4.2 添加节点类型判断逻辑（仅 LLM 和 Code 显示）
- [x] 4.3 添加只读模式判断（readonly 时隐藏）
- [x] 4.4 在 NodeMenu 前添加测试 icon 按钮，包装 Tooltip "测试该节点"
- [x] 4.5 实现点击事件，触发 debugPanelVisible 状态（通过 Context 或事件传递）

## 5. 大模型节点表单集成

- [x] 5.1 在 `nodes/llm/form.tsx` 中添加 debugPanelVisible 状态
- [x] 5.2 在表单顶部添加【测试该节点】文字链入口
- [x] 5.3 引入并渲染 NodeDebugPanel 组件
- [x] 5.4 实现 onExecute 回调，调用 `executeLLMNode` API
- [x] 5.5 从表单中获取 mode, tipWord, temperature, inputParam 等参数

## 6. 代码节点表单集成

- [x] 6.1 在 `nodes/code/form.tsx` 中添加【测试该节点】文字链入口
- [x] 6.2 复用现有 DebugPanel 或切换为 NodeDebugPanel
- [x] 6.3 确保文字链与现有 IDE 内"测试代码"功能一致

## 7. 状态联动（卡片 icon 与表单面板）

- [x] 7.1 设计状态传递方案（Context 或 EventBus）
- [x] 7.2 卡片 icon 点击时打开对应节点的 DebugPanel
- [x] 7.3 确保侧边栏表单和卡片入口状态同步

## 8. 测试验证

- [ ] 8.1 验证大模型节点两个入口均可打开试运行面板
- [ ] 8.2 验证代码节点两个入口均可打开试运行面板
- [ ] 8.3 验证只读模式下测试入口隐藏
- [ ] 8.4 验证其他节点类型无测试入口
- [ ] 8.5 验证输入参数填写和运行结果展示正常
