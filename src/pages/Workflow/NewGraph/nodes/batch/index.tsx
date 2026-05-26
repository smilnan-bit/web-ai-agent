import {
  FlowNodeTransformData,
  type WorkflowNodeEntity,
  type PositionSchema,
  nanoid,
  type VariableDeclaration,
} from '@flowgram.ai/free-layout-editor';
import { formMeta } from './form-meta';

import type { FlowNodeRegistry } from '../../typings';
import { ProcessTypeEnum, WorkflowNodeType } from '../constants';
import { IconPichuli } from '../icons';
import { genNodeFormConfig } from '../utils';

export const BatchNodeRegistry: FlowNodeRegistry = genNodeFormConfig({
  type: WorkflowNodeType.Batch,
  config: {
    info: {
      title: '批处理',
      icon: IconPichuli,
      description: '通过设定批量运行次数和逻辑，运行批处理体内的任务',
      bgColor: 'rgba(31, 194, 209, 0.04)',
    },
    meta: {
      type: WorkflowNodeType.Batch,
      hideSubCanvasWhenCollapsed: true,
      /**
       * Mark as subcanvas
       * 子画布标记
       */
      isContainer: true,
      /**
       * The subcanvas default size setting
       * 子画布默认大小设置
       */
      size: {
        width: 424,
        height: 244,
      },
      get maxNum() {
        // 从 window 全局变量获取，避免在模块顶层直接访问 Recoil
        return window.__GLOBAL_CONFIG__?.batchNodeMaxCount || 10;
      },
      // autoResizeDisable: true,
      /**
       * The subcanvas padding setting
       * 子画布 padding 设置
       */
      padding: (transform) => {
        if (!transform.isContainer) {
          return {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          };
        }
        return {
          top: 120,
          bottom: 80,
          left: 80,
          right: 80,
        };
      },
      /**
       * Controls the node selection status within the subcanvas
       * 控制子画布内的节点选中状态
       */
      selectable(node: WorkflowNodeEntity, mousePos?: PositionSchema): boolean {
        if (!mousePos) {
          return true;
        }
        const transform = node.getData<FlowNodeTransformData>(FlowNodeTransformData);
        // 鼠标开始时所在位置不包括当前节点时才可选中
        return !transform.bounds.contains(mousePos.x, mousePos.y);
      },
      // expandable: false, // disable expanded
      wrapperStyle: {
        minWidth: 'unset',
        width: '100%',
      },
      sonNodeProcessType: ProcessTypeEnum.sonOfBatch,
      fieldsToNodeData(data: Record<string, any>, availableVariables: VariableDeclaration[], node: WorkflowNodeEntity) {
        // 子画布的第一个节点id,后端需要
        const firstNodeId = node?.blocks?.find(
          (block) => (block.type as WorkflowNodeType) === WorkflowNodeType.BlockStart,
        )?.id;
        return { ...(data || {}), firstNodeId: firstNodeId };
      },
    },
  },
  formMeta,
  formData: {
    parallelCount: 1,
    maxIterations: 100,
  },
  blocksInitial: true,
});
