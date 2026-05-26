import { ShortcutsHandler } from '@flowgram.ai/shortcuts-plugin';
import { WorkflowSelectService, WorkflowNodeEntity } from '@flowgram.ai/free-layout-core';
import { PluginContext } from '@flowgram.ai/core';

import { WorkflowGroupService } from '../workflow-group-service';
import { WorkflowGroupCommand } from '../constant';
import { WorkflowNodeType } from '../../../nodes';

export class TileShortcut implements ShortcutsHandler {
  public commandId = WorkflowGroupCommand.Tile;

  public commandDetail: ShortcutsHandler['commandDetail'] = {
    label: '平铺',
  };

  public shortcuts: string[] = [];

  private selectService: WorkflowSelectService;

  private groupService: WorkflowGroupService;

  constructor(context: PluginContext) {
    this.selectService = context.get(WorkflowSelectService);
    this.groupService = context.get(WorkflowGroupService);
    this.execute = this.execute.bind(this);
  }

  public async execute(_groupNode?: WorkflowNodeEntity): Promise<void> {
    const groupNode = _groupNode || this.selectService.activatedNode;
    if (!groupNode || groupNode.flowNodeType !== WorkflowNodeType.Group) {
      return;
    }
    this.groupService.tile(groupNode);
  }
}

