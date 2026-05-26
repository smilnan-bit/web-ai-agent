import { useMemo } from 'react';

import { createMinimapPlugin } from '@flowgram.ai/minimap-plugin';
import { createFreeSnapPlugin } from '@flowgram.ai/free-snap-plugin';
import { createFreeNodePanelPlugin } from '@flowgram.ai/free-node-panel-plugin';
import { createFreeLinesPlugin } from '@flowgram.ai/free-lines-plugin';
import type { FreeLayoutProps } from '@flowgram.ai/free-layout-editor';

import { createContextMenuPlugin } from '@/pages/Workflow/NewGraph/plugins';
import { NodeRender } from '@/pages/Workflow/NewGraph/components/node-render';
import { LineAddButton } from '@/pages/Workflow/NewGraph/components';
import { ScheduleNodePanel } from './components/ScheduleNodePanel';

export function useScheduleEditorProps(initialData: any, nodeRegistries: any[]): FreeLayoutProps {
  return useMemo<FreeLayoutProps>(
    () => ({
      /**
       * 是否启用背景网格
       */
      background: true,
      playground: {
        /**
         * 阻止 Mac 浏览器手势翻页
         */
        preventGlobalGesture: true,
      },
      /**
       * 初始只读状态
       */
      readonly: false,
      /**
       * 初始画布数据
       */
      initialData,
      /**
       * 节点注册
       */
      nodeRegistries,
      /**
       * 提供默认节点注册
       */
      getNodeDefaultRegistry(type) {
        return {
          type,
          meta: {
            defaultExpanded: true,
          },
        };
      },
      /**
       * 节点数据转换（fromJSON）
       */
      fromNodeJSON(node, json) {
        return json;
      },
      /**
       * 节点数据转换（toJSON）
       */
      toNodeJSON(node, json) {
        return json;
      },
      lineColor: {
        hidden: 'transparent',
        default: '#4d53e8',
        drawing: '#5DD6E3',
        hovered: '#37d0ff',
        selected: '#37d0ff',
        error: 'red',
        flowing: '#4d53e8',
      },
      /**
       * 判断是否可连线
       */
      canAddLine(ctx, fromPort, toPort) {
        // 不能自循环
        if (fromPort.node === toPort.node) {
          return false;
        }
        return true;
      },
      /**
       * 判断是否能删除连线
       */
      canDeleteLine(ctx, line, newLineInfo, silent) {
        return true;
      },
      /**
       * 判断是否能删除节点
       */
      canDeleteNode(ctx, node) {
        return true;
      },
      scroll: {
        enableScrollLimit: false,
      },
      materials: {
        /**
         * 复用工作流节点渲染器
         */
        renderDefaultNode: NodeRender,
      },
      /**
       * 启用节点引擎（支持 formMeta 配置）
       */
      nodeEngine: {
        enable: true,
      },
      /**
       * 启用撤销/重做历史
       */
      history: {
        enable: true,
        enableChangeNode: true,
      },
      /**
       * 画布渲染完成后自动 fitView
       */
      onAllLayersRendered(ctx) {
        ctx.tools.fitView(false);
        console.log('--- Schedule Playground rendered ---');
      },
      onInit() {
        console.log('--- Schedule Playground init ---');
      },
      onDispose() {
        console.log('--- Schedule Playground Dispose ---');
      },
      plugins: () => [
        /**
         * 连线渲染插件
         */
        createFreeLinesPlugin({
          renderInsideLine: LineAddButton,
        }),
        /**
         * 缩略图插件
         */
        createMinimapPlugin({
          disableLayer: true,
          canvasStyle: {
            canvasWidth: 182,
            canvasHeight: 102,
            canvasPadding: 50,
            canvasBackground: 'rgba(242, 243, 245, 1)',
            canvasBorderRadius: 10,
            viewportBackground: 'rgba(255, 255, 255, 1)',
            viewportBorderRadius: 4,
            viewportBorderColor: 'rgba(6, 7, 9, 0.10)',
            viewportBorderWidth: 1,
            viewportBorderDashLength: undefined,
            nodeColor: 'rgba(0, 0, 0, 0.10)',
            nodeBorderRadius: 2,
            nodeBorderWidth: 0.145,
            nodeBorderColor: 'rgba(6, 7, 9, 0.10)',
            overlayColor: 'rgba(255, 255, 255, 0.55)',
          },
        }),
        /**
         * 自动对齐及辅助线插件
         */
        createFreeSnapPlugin({
          edgeColor: '#00B2B2',
          alignColor: '#00B2B2',
          edgeLineWidth: 1,
          alignLineWidth: 1,
          alignCrossWidth: 8,
        }),
        /**
         * 节点添加面板渲染插件
         */
        createFreeNodePanelPlugin({
          renderer: ScheduleNodePanel,
        }),
        /**
         * 右键菜单插件
         */
        createContextMenuPlugin({}),
      ],
    }),
    [],
  );
}
