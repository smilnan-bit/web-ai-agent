import { lazy } from 'react';
import type { RouterConfigI } from '@ysf/ys-router';
import { defineRouterConfig } from '@ysf/ys-router';
import { isDevelopment } from '@/constants/env';
import { PermissionCodeMap } from '@/routes/constanst';

const generateRoutes = (): RouterConfigI['routes'] => [
  {
    title: 'Agent应用',
    name: 'apps',
    path: '/apps',
    component: lazy(() => import('@/pages/AppList')),
    items: [
      {
        title: 'Agent应用编辑',
        name: 'appEdit',
        path: '/apps/edit',
        fullscreen: true,
        hidden: true,
        component: lazy(() => import('@/pages/AppList/EditApp')),
      },
    ],
  },
  {
    title: '工具组',
    name: 'toolboxs',
    path: '/toolboxs',
    component: lazy(() => import('@/pages/tools')),
    items: [
      {
        title: '工具列表',
        name: 'tools',
        path: '/toolboxs/tools',
        hidden: true,
        component: lazy(() => import('@/pages/tools/ToolList')),
        items: [
          {
            title: '编辑工具',
            name: 'toolEdit',
            path: '/toolboxs/tools/edit',
            hidden: true,
            component: lazy(() => import('@/pages/tools/CreateTool')),
          },
        ],
      },
    ],
  },
  {
    title: '工作流',
    name: 'workflow',
    path: '/workflow',
    component: lazy(() => import('@/pages/Workflow')),
    items: [
      {
        title: '编辑工作流(新)',
        name: 'workflowEditNew',
        path: '/workflow/editNew',
        hidden: true,
        fullscreen: true,
        component: lazy(() => import('@/pages/Workflow/NewGraph')),
      },
    ],
  },
  {
    title: '全局变量',
    name: 'var',
    path: '/var',
    component: lazy(() => import('@/pages/Var')),
  },
  {
    title: '记忆库',
    name: 'memory',
    path: '/memory',
    component: lazy(() => import('@/pages/MemoryRepository')),
    code: [PermissionCodeMap.AGENT_MEMORY_PERMISSION],
    items: [
      {
        title: '记忆库详情',
        name: 'memoryDetail',
        hidden: true,
        path: '/memory/detail',
        component: lazy(() => import('@/pages/MemoryRepository/Detail')),
      },
    ],
  },
  {
    title: 'Skills',
    name: 'skills',
    path: '/skills',
    component: lazy(() => import('@/pages/skills/SkillList')),
    code: [PermissionCodeMap.SKILL_SHOW],
  },
  {
    title: '卡片管理',
    name: 'card',
    path: '/card',
    nopadding: true,
    component: lazy(() => import('@/pages/Card')),
    items: [
      {
        title: '卡片编辑',
        name: 'cardEditor',
        path: '/card/editor',
        hidden: true,
        fullscreen: true,
        nopadding: true,
        component: lazy(() => import('@/pages/CardEditor')),
      },
    ],
  },
  {
    title: 'Agent模板',
    name: 'template',
    path: '/template',
    nopadding: true,
    code: [PermissionCodeMap.TEMPLATE_GALLERY_SHOW],
    component: lazy(() => import('@/pages/Template')),
    items: [
      {
        title: '试用模板',
        name: 'templateTry',
        path: '/template/try',
        hidden: true,
        component: lazy(() => import('@/pages/Template/Try')),
      },
    ],
  } as any,
  {
    title: 'Agent测评',
    name: 'test',
    path: '/test',
    component: lazy(() => import('@/pages/Test')),
    items: [
      {
        title: '创建测评任务',
        name: 'testCreate',
        path: '/test/create',
        hidden: true,
        fullscreen: true,
        component: lazy(() => import('@/pages/Test/Create')),
      },
    ],
  },
  {
    title: '智能调度',
    name: 'scheduling',
    path: '/scheduling',
    component: lazy(() => import('@/pages/Scheduling')),
    items: [
      {
        title: '编辑调度策略',
        name: 'schedulingEdit',
        path: '/scheduling/edit',
        hidden: true,
        fullscreen: true,
        component: lazy(() => import('@/pages/Scheduling/Editor')),
      },
    ],
  },
  {
    title: 'AI搭建助手',
    name: 'ai-build',
    path: '/ai-build',
    component: lazy(() => import('@/pages/AiBuildAssistant/ConversationalBuild')),
    items: [
      {
        title: '场景挖掘',
        name: 'scene-mining',
        path: '/ai-build/scene-mining',
        component: lazy(() => import('@/pages/AiBuildAssistant/SceneMining')),
      },
      {
        title: '智能搭建助手',
        name: 'conversational-build',
        path: '/ai-build/build',
        component: lazy(() => import('@/pages/AiBuildAssistant/ConversationalBuild')),
      },
      {
        title: '自动测试与调优',
        name: 'auto-testing',
        path: '/ai-build/auto-testing',
        component: lazy(() => import('@/pages/AiBuildAssistant/AutoTesting')),
      },
    ],
  },
];

const routerConfig: RouterConfigI = {
  basename: isDevelopment ? '/' : '/ai-agent',
  autoDocumentTitle: true,
  routes: [
    {
      path: '/',
      title: 'Ai Agent',
      name: 'ai-agent',
      items: generateRoutes(),
      meta: { isNavRoot: true },
    },
    {
      path: '*',
      title: '404',
      name: '404',
      meta: { breadcrumb: false },
      fullscreen: true,
      component: lazy(() => import('@/pages/404')),
    },
  ],
};

export default defineRouterConfig(routerConfig);
