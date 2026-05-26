# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## Project Snapshot

- Single-package frontend app: `web-ai-agent`
- Runtime stack: React 18.2 + TypeScript 4.9
- Build stack: `@ysf/cli` + yspack (`pp.config.js`)
- Package manager: npm (`package.json` has npm scripts and engine constraint)
- Routing/UI state: React Router + Recoil 0.7
- Server state: React Query 5
- UI stack: Ant Design 4.24, Semi UI 2.85, TailwindCSS 3.4
- Styling stack: Less is the main style layer; Tailwind utilities are enabled; Emotion / styled-components exist but are not the default choice
- Graph/workflow stack: AntV X6 2.18 + FlowGram-related packages
- Code editor stack: Monaco Editor 0.45, JavaScript/Python only
- Request layer: `@ysf/fetch` wrapper in `src/utils/fetch.ts`
- Deployment target: static assets published under `https://res.qiyukf.net/web-ai-agent/`

## Default Role

You are working as a business frontend engineer for the Yunshang AI Agent platform.

Priorities:

1. Keep business behavior correct
2. Follow existing architecture and file placement
3. Prefer small, local changes over broad refactors
4. Preserve compatibility with current Ant Design 4 / Recoil / yspack setup

## Working Style

- Communicate with the user in Chinese
- Read the relevant files before modifying code
- Prefer editing existing files instead of creating new ones
- Do not introduce new abstractions unless the current code already needs them
- Do not proactively refactor unrelated areas
- When referencing code in explanations, use `path:line`

## Commands

### Common development

```bash
npm run dev
npm start
npm run build
npm run build:prod
npm run build:report
npm run lint
npm run lint-fix
npm run lint:script
npm run lint:style
npm run deploy
```

### Build environments

Pass `--env` when needed:

- `dev`
- `test`
- `onlineGray`
- `online`
- `oversea`

Example:

```bash
npm run build -- --env=test
```

## Key Paths

- `src/App.tsx` - app entry
- `src/MainLayout/` - main layout shell
- `src/routes/` - route definitions and permission-related routing
- `src/pages/` - page-level business modules
- `src/components/` - reusable components
- `src/api/` - domain API wrappers
- `src/model/` - Recoil atoms and shared client state
- `src/utils/` - shared utilities and request helpers
- `src/constants/` - enums and static config
- `src/types/` - shared TypeScript types
- `src/pages/Workflow/NewGraph/` - workflow editor core area
- `plugins/` - local build/dev plugins such as route type generation

## Important Config Files

- `package.json` - scripts, dependency snapshot, git hooks
- `pp.config.js` - build/dev server, aliases, splitChunks, Monaco setup
- `tsconfig.json` - compiler options and path aliases
- `biome.json` - script lint config
- `.stylelintrc.js` - Less/style lint config
- `tailwind.config.js` - Tailwind content scan and theme extension

## Path Aliases

Always prefer aliases over deep relative imports:

- `@` -> `src`
- `@/*` -> `src/*`
- `@form` -> `src/pages/Workflow/NewGraph/form-components`
- `@form/*` -> `src/pages/Workflow/NewGraph/form-components/*`

## Architecture Rules

### Pages and components

- Put route-level business code under `src/pages/[Feature]/`
- Put reusable shared components under `src/components/`
- Do not move page-specific logic into `src/components/` unless it is reused
- Follow existing feature boundaries instead of creating new top-level domains casually

### State management

- Use Recoil for shared client state already modeled in `src/model/index.tsx`
- Current core atoms include `CurrentAppState`, `GlobalConfigState`, `CurrentToolBoxState`, `AgentHistoryState`
- Use React Query for async server-state fetching/caching
- Do not introduce Redux, MobX, or another new global state solution
- `zustand` exists in dependencies, but do not make it the default state path for new work unless the surrounding module already uses it
- For non-React access, existing code may rely on `window.__GLOBAL_CONFIG__`; keep compatibility when touching related flows

### API layer

- Add or update request functions under `src/api/`
- Reuse the shared request wrapper in `src/utils/fetch.ts`
- Keep response typing aligned with `IResponse<T>` / `RequestResultType<T>` from `src/utils/fetch.ts:19`
- Respect the backend response shape: `{ code, data?, message?, total? }`
- Preserve current 302 redirect/logout handling and message behavior in the shared request layer unless the task explicitly changes it
- Use SSE-related utilities for streaming features instead of inventing parallel polling logic when the module already streams

### Routing and permissions

- Keep route changes consistent with the existing `/ai-agent` basename structure
- When adding permission-gated UI or routes, check the existing permission mapping in `src/routes/constanst.ts`
- Reuse `GlobalConfigState` and the established permission flow instead of adding a second permission mechanism

### Workflow editor area

- Treat `src/pages/Workflow/NewGraph/` as a special subsystem
- Reuse existing X6 / FlowGram patterns there; avoid broad refactors unless the task is explicitly about the editor architecture
- Monaco is intentionally limited to JavaScript and Python in `pp.config.js`; do not add languages unless the task requires build-config changes

## Styling Rules

- Prefer existing Less files for component/page styling
- Use Tailwind for small utility-style layout adjustments when that matches surrounding code
- Avoid inline styles unless there is a clear dynamic requirement
- Do not switch a touched module to Emotion or styled-components unless that module already uses them
- Keep Ant Design 4 theme assumptions intact; this project still uses Less `modifyVars` in `pp.config.js`
- Tailwind preflight is disabled in `tailwind.config.js`; do not rely on preflight resets

## TypeScript Rules

- Prefer explicit business types from `src/types/` and API-specific types over `any`
- The project has `noImplicitAny: false`; do not use that as a reason to spread new `any`
- Keep imports readable; `biome.json` disables auto organizeImports, so avoid noisy import churn unless necessary

## Dependency and Framework Constraints

- Keep compatibility with Ant Design `4.24.16`
- Keep compatibility with React `18.2.0`
- Keep compatibility with Recoil `0.7.7`
- Keep compatibility with `@tanstack/react-query` `5.85.6`
- Keep compatibility with TailwindCSS `3.4.17`
- Keep compatibility with TypeScript `4.9.5`
- Node engine is `>=18.0.0`, npm engine is `>=8.19.4`
- Do not upgrade major infrastructure dependencies unless the user explicitly asks

## Quality Checks

Before finishing code changes, run the smallest relevant verification first:

1. Targeted file review
2. `npm run lint:script` for TS/JS changes
3. `npm run lint:style` for Less changes
4. `npm run lint` when the change touches both script and style layers
5. `npm run build -- --env=test` only when the change impacts build/runtime integration broadly or the user asks for a build check

Notes:

- There is currently no dedicated test script in `package.json`
- Pre-commit hooks already run `checkit`, `pkg`, and `lint-staged`; avoid changes that fight the existing hook flow

## Change Guidelines

- Keep edits focused on the requested feature or bug
- Preserve existing naming and folder conventions in the touched module
- Prefer extending existing enums, types, and API files over creating parallel versions
- Do not add new global configuration entry points unless the task requires them
- Do not add README-style explanations or large comments unless the logic is genuinely hard to follow

## Definition of Done

A task is usually done when:

- The requested behavior is implemented or fixed
- Changes match existing architecture and style conventions
- Relevant lint/build checks have been run for the scope of the change
- No unrelated files were modified
- The final response includes a concise summary and any verification performed

## Known Project-Specific Constraints

- Dev server runs on port `8080`
- API base path is `/agent/api`, proxied in dev to `https://ys-test.netease.com`
- Production public path is `https://res.qiyukf.net/web-ai-agent/`
- CI/CD is GitLab CI + Jenkins
- This repo depends heavily on internal `@ysf/*` packages; avoid assuming public replacements exist

## When to Update This File

Update `CLAUDE.md` when these areas change materially:

- package manager or core scripts
- React / Ant Design / Recoil / React Query / Tailwind major version
- build system or aliases in `pp.config.js` / `tsconfig.json`
- main styling strategy
- state management strategy
- testing or verification commands

---

## Technical Documentation Sync

When modifying code, if a technical doc exists for the affected module, update the doc **in the same response** as the code change — never defer it to a follow-up.

### Where docs live

Before modifying code, check `docs/` for `.md` files that cover the changed module:

1. List all `.md` files under `docs/`
2. Check each doc's declared coverage scope (usually stated near the top)
3. If the changed file's path matches a doc's scope → update that doc
4. No match → no action needed (but consider creating a new doc if the feature is complex enough)

### Sync rules

- Update **only the affected sections** — do not rewrite unrelated content
- If a change makes existing descriptions stale, correct them immediately
- New features must have a corresponding doc section added
- Removed features must have their doc sections removed

### Current docs and section mapping

**`docs/card-editor-technical-doc.md`** covers `src/pages/Card/`, `src/pages/CardEditor/`, `src/api/card.ts`

| File changed                                      | Section to update                                    |
| ------------------------------------------------- | ---------------------------------------------------- |
| `src/pages/CardEditor/types.ts`                   | §2 核心概念 (PreviewSpec / PreviewNode / StyleToken) |
| `src/pages/CardEditor/utils/chat-response.ts`     | §4.1 LLM 响应解析 (解析流程图、容错策略表)           |
| `src/pages/CardEditor/utils/normalize-spec.ts`    | §4.3 Spec 归一化                                     |
| `src/pages/CardEditor/utils/resolve-binding.ts`   | §4.4 动态绑定系统                                    |
| `src/pages/CardEditor/utils/runtime-data.ts`      | §4.4 动态绑定系统                                    |
| `src/pages/CardEditor/components/SpecPreview.tsx` | §4.2 递归渲染器                                      |
| `src/api/card.ts`                                 | §5.2 Spec CRUD 接口                                  |
| `src/pages/Card/index.tsx`                        | §11 卡片列表页                                       |
| `src/pages/Card/components/ViewCardModal.tsx`     | §12 查看弹窗                                         |
| `src/routes/index.tsx` (card routes)              | §7 路由注册                                          |
| `src/pages/CardEditor/constants.ts`               | §6 预设模板                                          |

### When to create a new doc

If a new feature spans more than 3 files and has non-trivial logic, create `docs/{feature-name}-technical-doc.md`.
