import { ShortcutsRegistry } from '@flowgram.ai/shortcuts-plugin';
import { FlowRendererRegistry } from '@flowgram.ai/renderer';
import { FlowGroupService } from '@flowgram.ai/document';
import { definePluginCreator, PluginContext } from '@flowgram.ai/core';

import { WorkflowGroupService } from './workflow-group-service';
import { WorkflowGroupPluginOptions } from './type';
import { GroupShortcut, StackShortcut, TileShortcut, UngroupShortcut } from './shortcuts';
import { WorkflowNodeType } from '../../nodes';

export const createFreeGroupPlugin = definePluginCreator<WorkflowGroupPluginOptions, PluginContext>(
  {
    onBind({ bind, rebind }, opts) {
      bind(WorkflowGroupService).toSelf().inSingletonScope();
      bind(WorkflowGroupPluginOptions).toConstantValue(opts);
      rebind(FlowGroupService).toService(WorkflowGroupService);
    },
    onInit(ctx, { groupNodeRender, disableGroupShortcuts = false }) {
      // register node render
      if (groupNodeRender) {
        const renderRegistry = ctx.get<FlowRendererRegistry>(FlowRendererRegistry);
        renderRegistry.registerReactComponent(`${WorkflowNodeType.Group}`, groupNodeRender);
      }
      // register shortcuts
      if (!disableGroupShortcuts) {
        const shortcutsRegistry = ctx.get(ShortcutsRegistry);
        shortcutsRegistry.addHandlers(
          new GroupShortcut(ctx),
          new UngroupShortcut(ctx),
          new StackShortcut(ctx),
          new TileShortcut(ctx),
        );
      }
    },
    onReady(ctx) {
      const groupService = ctx.get(WorkflowGroupService);
      groupService.ready();
    },
    onDispose(ctx) {
      const groupService = ctx.get(WorkflowGroupService);
      groupService.dispose();
    },
  }
);
