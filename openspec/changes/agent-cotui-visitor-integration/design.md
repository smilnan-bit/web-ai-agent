# Design — agent-cotui-visitor-integration

## Context

本次改动横跨三端：

- **`web-ai-agent`（管理后台）**：CardEditor 产出 `PreviewSpec`；工作流 Dialog 节点引用 spec
- **后端（工作流引擎 + IM 网关）**：执行 Dialog 节点 → 解析 binding → 下发 cmd 13004；收到 cmd 13005 → 按 `action.name` 路由分支 → USER_RESPONSE 喂给后续节点
- **`basic-web-visitor`（访客端）**：注册新 cmd → 包装成 `QyMessage(COTUI)` → 渲染 → 用户交互 → 回传 cmd 13005

前端范围：管理后台 Dialog 节点改造 + 访客端消息渲染与回传 + 共享类型包。协议字段形式作为契约列出但属于后端实现范畴。

## Goals / Non-goals

- 打通端到端链路，一张 spec 跑通「编辑 → 下发 → 渲染 → 回传 → 工作流分支」
- 在访客端既有 `QyMessage` 路由体系下新增消息类型，零耦合既有 24 种模板
- 两端共用 `PreviewSpec` / `resolveBinding`，避免协议漂移
- 不扩充节点类型、不做增量更新、不做多人协同

## Key Decisions

### 决策 1：下发协议独立于 cmd 203

**选**：新开 cmd 13004（下发）+ cmd 13005（上报）

**备选**：复用 cmd 203 + 新增 `TemapteIdEnum.cotui`

**理由**：
- CotUi 未来需要承载流式 spec、增量 patch、多卡片编排等能力，不宜混入既有"一触即达"模板空间
- 独立 cmd 让访客端在顶层 `msgConfigMap` 注册 `COTUI` 类型，与 WORKFLOW 并列，分发干净
- 代价：旧版访客端不识别该 cmd，消息会被丢弃；后端必须按 SDK 版本降级（见决策 5）

### 决策 2：回源上下文由 msgidClient 唯一索引

**选**：`Cmd13004` / `Cmd13005` **不**携带任何工作流上下文字段（`dialogId / flowId / nodeId / nodeType / requestId / preRequestId` 全部砍掉）。后端以 `msgidClient` 为主键维护 `msgidClient → 工作流节点实例` 的状态表；访客端上报时只回传 `msgidClient`。

**备选 A**：复制 cmd 203 的 `ExtendInfoVO`，带 6 个字段 —— **否决**，其中 `nodeType / preRequestId` 对 cotui 冗余，`dialogId` 语义不清晰，且"字段稳定"不是好理由
**备选 B**：最小集 `flowId / nodeId / requestId` —— **否决**，既然 `msgidClient` 已能让后端查表，这三个字段仍是冗余，且把后端实现细节泄露到协议层

**理由**：
- 前端（访客端 + 管理后台）对工作流状态**应当无感**，不该让协议承载后端实现细节
- `msgidClient` 本就是幂等 + 消息定位必需字段，后端直接用它作为状态表主键，零额外成本
- 消息体更精简，IM 通道压力更小
- 后续若工作流状态模型演进（比如拆多级节点、加父子流），协议无需变更

### 决策 3：IM 消息体同时存 spec 与 runtimeData 快照

**选**：下发时访客端收到的消息体 = spec + runtimeData（当时变量） + 回源上下文

**备选 A**：存 resolved spec（runtimeData 已融入文本）—— 丢 binding 原貌，不利于埋点回溯
**备选 B**：只存 specId + runtimeData —— spec 改版后回看"变脸"

**理由**：IM 历史消息需要稳定回看。spec 永远内联下发，单条体积由后端在保存接口层做上限约束（例如 32KB），超限的卡片在保存时就被拒绝，不会进入下发链路。

### 决策 4：按钮 action 三种语义对应三种状态机

| action.type | 回源工作流 | 卡片状态变化 | 是否允许重复 |
|---|---|---|---|
| `submit` | ✅ 是 | 一次后整卡置灰（所有按钮 disable） | 否 |
| `emit` | ✅ 是 | 不置灰 | 是 |
| `navigate` | ❌ 否 | 不置灰，仅打开 URL | 是 |

状态图：

```
                  ┌────────────┐
                  │  rendered  │
                  └─────┬──────┘
     click submit │ click emit │ click navigate
                  ▼             ▼              ▼
            ┌──────────┐  ┌──────────┐   ┌─────────┐
            │ submitted│  │ rendered │   │rendered │
            │ (置灰)   │  │ (不变)   │   │ +打开URL│
            └──────────┘  └──────────┘   └─────────┘
```

Dialog 节点视角：
- `submit` + `emit` 会触发分支匹配；`submit` 匹配成功后节点完成
- `emit` 在节点未完成前可多次触发分支（典型场景如"喜欢 / 不喜欢"实时投票）
- 超时由后端独立计时（不在协议层），到期后后端主动走 otherwise 分支；访客端不感知超时，卡片按钮仍可点但后端会用 `msgidClient` 识别已终态的节点并静默丢弃事件

### 决策 5：旧端降级由后端主导

**选**：后端按访客端 SDK 版本判断

- 新端（支持 cotui） → 发 cmd 13004
- 旧端 → 发 cmd 203 + `radio_button` 模板 + `fallback.text`

**备选**：访客端兜底渲染。**否决**，因为旧端压根没注册 cmd 13004 处理器，消息会被 IM 层丢弃。

### 决策 6：校验三层分工

```
  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
  │ CardEditor  │   │  访客端     │   │   后端      │
  │  预览校验    │   │  提交校验    │   │  接收校验    │
  └─────────────┘   └─────────────┘   └─────────────┘
   ① LLM 防呆        ② UX 护栏         ③ 安全守门
   可选做            必做              必做
```

- 访客端：`required / type=email / pattern` 不通过时按钮 disabled + 友好提示
- 后端：cmd 13005 到达后按 spec 重跑校验，失败返回 error cmd
- CardEditor：先不做，后续再加

### 决策 7：共享类型包走内部 npm

**选**：抽 `@ysf/cotui-core` 内部 npm 包

**包含**：
- 纯类型：`PreviewSpec / StyleToken / BindingValue / NodeAction / CotUiEvent`
- 纯函数：`resolveBinding / normalizeSpec / collectBindings / collectEventInfo`

**不包含**：任何 React 组件、antd 依赖、协议 cmd 类型（协议类型放各端 `protocol/`）

**备选**：monorepo / git submodule / 手工同步。都更重，当前双仓结构下内部 npm 最轻。

## Architecture

### 整体数据流

```
┌──────────────────────┐      ┌───────────────────────┐
│  CardEditor          │      │  Workflow Editor      │
│  产出 PreviewSpec    │      │  Dialog.cotUi 配置    │
│  → /cotui/spec/save  │      │  → specId + bindings  │
└──────────┬───────────┘      └──────────┬────────────┘
           │                              │
           ▼                              ▼
      ┌─────────────────────────────────────────┐
      │       后端（不在本次前端范围）           │
      │  工作流引擎：执行 Dialog.cotUi          │
      │   → 读 spec → resolve bindings          │
      │   → 发 cmd 13004                        │
      └──────────────┬──────────────────────────┘
                     │
                     ▼
      ┌──────────────────────────────────────────┐
      │  访客端 basic-web-visitor                │
      │                                          │
      │  IM 层 cmd 13004 → QyMessage(COTUI)      │
      │           │                              │
      │           ▼                              │
      │  msgConfigMap[COTUI] = CotUiMsg          │
      │           │                              │
      │           ▼                              │
      │  Renderer.tsx 渲染                       │
      │  (移植版 SpecPreview + resolveBinding)   │
      │           │                              │
      │  用户点击 submit/emit button             │
      │           │                              │
      │           ▼                              │
      │  emit.ts 组装 Cmd13005 → imServer.send   │
      └──────────────┬───────────────────────────┘
                     │
                     ▼
      ┌──────────────────────────────────────────┐
      │  后端：cmd 13005 按 actionName 路由      │
      │  USER_RESPONSE = { actionName, ... }     │
      │  工作流继续执行                          │
      └──────────────────────────────────────────┘
```

### 协议字段（契约版，非实现）

**Cmd13004**：
```
cmd, sessionid, msgidClient,
cardId,            // 卡片身份标识（来自 /cotui/spec/save 返回的 id）
spec,              // 完整 PreviewSpec，永远内联
runtimeData?,
fallback: { text }
```

**Cmd13005**：
```
cmd, sessionid, msgidClient,
event: {
  type: 'action' | 'lifecycle',
  actionType?, actionName?, buttonNodeId?,
  staticPayload?, formValues?,
  lifecycle?: 'render' | 'close',  // 超时不由访客端感知
  timestamp
}
```

> 设计取向：**极简协议**。
> - 无 `mode` / `specId` —— spec 永远内联，大小由后端在保存时约束
> - 无 `schemaVersion` —— 卡片结构由 `cardId` 对应的后端记录决定，版本演进由后端在下发前转换
> - 无 `outputStyle` —— 展示形态由访客端按平台/内容自行决定
> - 无 `timeoutMs` —— 超时由后端独立计时，访客端不感知
> - 无回源上下文字段 —— 以 `msgidClient` 为后端内部主键

## Risks / Trade-offs

| 风险 | 缓解 |
|---|---|
| 旧版访客端静默丢弃 cmd 13004 | 后端按 SDK 版本强制降级；上线前灰度观察 |
| spec 超大撑爆 IM 消息通道 | 后端在 `/cotui/spec/save` 接口做字节数上限校验（如 32KB）；超限保存即失败，不会下发 |
| 两端 PreviewSpec 定义漂移 | 抽 `@ysf/cotui-core`，两端统一依赖；CI 校验 package 版本 |
| 用户连点按钮导致多次回源 | submit 类按钮点击后本地立即置灰 + `msgidClient` 幂等 |
| 历史消息 LLM 产出的 text 被当 HTML 解析导致 XSS | Renderer 只用 `textContent`，不用 `dangerouslySetInnerHTML`；image.src 白名单 |
| 超时的处理与语义 | 协议层不感知超时；后端独立计时，到期走 otherwise；访客端卡片仍可点但后端用 `msgidClient` 识别已终态节点并静默丢弃事件 |

## Migration Plan

按 Phase 推进，每个 Phase 可独立验收：

1. **协议定稿**（0.5d）：cmd 号段 + 字段审定 + 降级策略，与后端/访客端 owner 对齐
2. **共享类型包**（1d）：`@ysf/cotui-core` 发版；两端引入
3. **管理后台**（2-3d）：Dialog 节点 cotUi 类型 + spec meta 接口 + 变量映射面板
4. **访客端 CotUiMsg**（3-4d）：消息类型注册 + H5 气泡样式渲染器 + 上报
5. **联调**（1d）：端到端跑一个登录/确认卡片
6. **PC 差异化 + 超时降级**（1-2d）：`.pc.tsx` 底部弹窗、`lifecycle` 事件

## Open Questions

1. cmd 13004 / 13005 号段是否与协议 owner 达成共识？
2. `@ysf/cotui-core` 走公司内部 npm 仓还是 git submodule？
3. CardEditor 是否需要"会话联调"入口（模拟 runtimeData + 点击按钮 + mock 回源 LLM 下一轮）？
4. `cardId` 命名约定：是否和后端 `/cotui/spec/save` 返回的 id 字段保持一致？类型用 string 还是 number？
