import {
  type WorkflowNodeEntity,
  type PositionSchema,
  FlowNodeTransformData,
  nanoid,
} from '@flowgram.ai/free-layout-editor';

import type { FlowNodeRegistry } from '../../typings';
import React from 'react';
import { WorkflowNodeType } from '../constants';
import { groupColors } from '../../components/group/color';

let index = 0;
export const GroupNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.Group,
  meta: {
    renderKey: `${WorkflowNodeType.Group}`,
    skipCheck: true,
    defaultPorts: [],
    isContainer: true,
    disableSideBar: true,
    size: {
      width: 560,
      height: 400,
    },
    padding: () => ({
      top: 80,
      bottom: 40,
      left: 75,
      right: 75,
    }),
    selectable(node: WorkflowNodeEntity, mousePos?: PositionSchema): boolean {
      if (!mousePos) {
        return true;
      }
      const transform = node.getData<FlowNodeTransformData>(FlowNodeTransformData);
      return !transform.bounds.contains(mousePos.x, mousePos.y);
    },
    expandable: false,
    /**
     * It cannot be added through the panel
     * 不能通过面板添加
     */
    nodePanelVisible: false,
  },
  formMeta: {
    render: () => <></>,
  },
  onAdd() {
    const colorKeys = Object.keys(groupColors);
    const randomColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
    return {
      type: WorkflowNodeType.Group,
      id: `group_${nanoid()}`,
      meta: {
        position: {
          x: 0,
          y: 0,
        },
      },
      data: {
        color: randomColor,
        title: `Group_${++index}`,
      },
    };
  },
};
