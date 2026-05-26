# Agent 长期记忆管理 - 任务清单

## 1. 基础设施搭建

- [x] 1.1 创建类型定义文件 `src/types/MemoryRepository.d.ts`，定义 RepositoryType、UserType、MemoryType 接口
- [x] 1.2 创建 API 模块 `src/api/memoryRepository.tsx`，实现所有后端接口调用
- [x] 1.3 在 `src/constants/enum.ts` 中添加记忆库相关枚举（如需要）- 暂无需要，跳过

## 2. 记忆库列表页面

- [x] 2.1 创建页面目录结构 `src/pages/MemoryRepository/`
- [x] 2.2 实现列表页面 `src/pages/MemoryRepository/index.tsx`，展示记忆库卡片列表
- [x] 2.3 实现列表页面样式 `src/pages/MemoryRepository/index.less`
- [x] 2.4 实现新建记忆库弹窗 `src/pages/MemoryRepository/components/CreateModal/index.tsx`
- [x] 2.5 实现删除记忆库功能（包含关联检查逻辑）
- [x] 2.6 实现空状态展示

## 3. 记忆库详情页面

- [x] 3.1 创建详情页面 `src/pages/MemoryRepository/Detail/index.tsx`，左右分栏布局
- [x] 3.2 实现详情页面样式 `src/pages/MemoryRepository/Detail/index.less`
- [x] 3.3 实现左侧用户 UID 列表（支持搜索、分页）
- [x] 3.4 实现右侧记忆列表展示
- [x] 3.5 实现删除单条记忆功能
- [x] 3.6 实现返回列表导航

## 4. Agent 绑定记忆库

- [ ] 4.1 创建记忆库绑定模块 `src/pages/AppList/components/EditContent/Memory/index.tsx`
- [ ] 4.2 创建记忆库选择弹窗 `src/pages/MemoryRepository/components/MemoryModal/index.tsx`
- [ ] 4.3 实现弹窗中的记忆库列表展示和选择逻辑
- [ ] 4.4 实现只能绑定一个记忆库的限制逻辑（已绑定时其他项置灰）
- [ ] 4.5 在 Agent 编辑页面 `EditContent/index.tsx` 中集成 Memory 模块
- [ ] 4.6 通过 AppEventBus 实现记忆库绑定状态更新

## 5. 路由与导航

- [ ] 5.1 在路由配置中添加记忆库列表页面路由 `/memory-repository`
- [ ] 5.2 在路由配置中添加记忆库详情页面路由 `/memory-repository/detail`
- [ ] 5.3 在侧边栏导航中添加"记忆库"菜单项

## 6. 白名单权限控制

- [ ] 6.1 确认全局配置中的白名单字段名
- [ ] 6.2 在路由配置中添加白名单权限检查
- [ ] 6.3 在侧边栏中根据白名单控制菜单项显示/隐藏
- [ ] 6.4 在 Agent 编辑页面中根据白名单控制 Memory 模块显示/隐藏

## 7. 类型扩展与集成

- [ ] 7.1 在 `src/types/Apps.d.ts` 中扩展 AppDetailType，添加 memoryRepository 字段
- [ ] 7.2 更新 CurrentAppState 相关逻辑以支持记忆库字段
- [ ] 7.3 确保 Agent 保存接口正确传递记忆库绑定信息
