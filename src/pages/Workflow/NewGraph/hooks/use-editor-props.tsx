import { useMemo } from 'react';

import { debounce } from 'lodash-es';
import { createMinimapPlugin } from '@flowgram.ai/minimap-plugin';
import { createFreeSnapPlugin } from '@flowgram.ai/free-snap-plugin';
import { createFreeNodePanelPlugin } from '@flowgram.ai/free-node-panel-plugin';
import { createFreeLinesPlugin } from '@flowgram.ai/free-lines-plugin';
import { type FreeLayoutProps, WorkflowNodeLinesData } from '@flowgram.ai/free-layout-editor';
import { createContainerNodePlugin } from '@flowgram.ai/free-container-plugin';
import { nanoid } from 'nanoid';

import { canContainNode, checkUniqueOutPortLine, onDragLineEnd } from '../utils';
import type { FlowNodeRegistry, FlowDocumentJSON } from '../typings';
import { shortcuts } from '../shortcuts';
import { CustomService } from '../services';
import { WorkflowRuntimeService } from '../plugins/runtime-plugin/runtime-service';
import { createRuntimePlugin, createContextMenuPlugin } from '../plugins';
import { defaultFormMeta } from '../nodes/default-form-meta';
import { WorkflowNodeType } from '../nodes';
import { CommentRender, LineAddButton, NodePanel } from '../components';
import { NodeRender } from '../components/node-render';
import workflowEventBus, { WorkflowEventNameEnum } from '../event';
import { createGlobalVariablePlugin } from '../plugins/global-variable-plugin';
import { GroupNodeRender } from '../components/group';
import { SelectorBoxPopover } from '../components/selector-box-popover';
import { createFreeGroupPlugin } from '../plugins/create-free-group-plugin';

export function useEditorProps(initialData: FlowDocumentJSON, nodeRegistries: FlowNodeRegistry[]): FreeLayoutProps {
  return useMemo<FreeLayoutProps>(
    () => ({
      /**
       * Whether to enable the background
       */
      background: true,
      playground: {
        /**
         * Prevent Mac browser gestures from turning pages
         * 阻止 mac 浏览器手势翻页
         */
        preventGlobalGesture: true,
      },
      /**
       * Whether it is read-only or not, the node cannot be dragged in read-only mode
       */
      readonly: false,
      /**
       * Initial data
       * 初始化数据
       */
      initialData,
      /**
       * Node registries
       * 节点注册
       */
      nodeRegistries,
      /**
       * Get the default node registry, which will be merged with the 'nodeRegistries'
       * 提供默认的节点注册，这个会和 nodeRegistries 做合并
       */
      getNodeDefaultRegistry(type) {
        return {
          type,
          meta: {
            defaultExpanded: true,
          },
          formMeta: defaultFormMeta,
        };
      },
      /**
       * 节点数据转换, 由 ctx.document.fromJSON 调用
       * Node data transformation, called by ctx.document.fromJSON
       * @param node
       * @param json
       */
      fromNodeJSON(node, json) {
        return json;
      },
      /**
       * 节点数据转换, 由 ctx.document.toJSON 调用
       * Node data transformation, called by ctx.document.toJSON
       * @param node
       * @param json
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
      /*
       * Check whether the line can be added
       * 判断是否连线
       */
      canAddLine(ctx, fromPort, toPort) {
        // Cannot be a self-loop on the same node / 不能是同一节点自循环
        if (fromPort.node === toPort.node) {
          return false;
        }
        // Cannot be in different containers - 不能在不同容器
        if (
          fromPort.node.parent?.id !== toPort.node.parent?.id &&
          ![fromPort.node.parent?.flowNodeType, toPort.node.parent?.flowNodeType].includes(WorkflowNodeType.Group)
        ) {
          return false;
        }
        // 限制同一个 fromPort 仅能连出一条线
        if (!checkUniqueOutPortLine(fromPort)) {
          return false;
        }
        /**
         * 线条环检测，不允许连接到前面的节点
         * Line loop detection, which is not allowed to connect to the node in front of it
         */
        return !fromPort.node.getData(WorkflowNodeLinesData).allInputNodes.includes(toPort.node);
      },
      /**
       * Check whether the line can be deleted, this triggers on the default shortcut `Bakspace` or `Delete`
       * 判断是否能删除连线, 这个会在默认快捷键 (Backspace or Delete) 触发
       */
      canDeleteLine(ctx, line, newLineInfo, silent) {
        return true;
      },
      /**
       * Check whether the node can be deleted, this triggers on the default shortcut `Bakspace` or `Delete`
       * 判断是否能删除节点, 这个会在默认快捷键 (Backspace or Delete) 触发
       */
      canDeleteNode(ctx, node) {
        return true;
      },
      canDropToNode: (ctx, params) => {
        const { dragNodeType, dropNode } = params;

        return canContainNode(dragNodeType!, dropNode!);
      },
      /**
       * Drag the end of the line to create an add panel (feature optional)
       * 拖拽线条结束需要创建一个添加面板 （功能可选）
       */
      onDragLineEnd,
      /**
       * SelectBox config
       */
      selectBox: {
        SelectorBoxPopover,
      },
      scroll: {
        /**
         * Whether to restrict the node from rolling out of the canvas needs to be closed because there is a running results pane
         * 是否限制节点不能滚出画布，由于有运行结果面板，所以需要关闭
         */
        enableScrollLimit: false,
      },
      materials: {
        /**
         * Render Node
         */
        renderDefaultNode: NodeRender,
        renderNodes: {
          [WorkflowNodeType.Comment]: CommentRender,
        },
      },
      /**
       * Node engine enable, you can configure formMeta in the FlowNodeRegistry
       */
      nodeEngine: {
        enable: true,
      },
      /**
       * Variable engine enable
       */
      variableEngine: {
        enable: true,
      },
      /**
       * Redo/Undo enable
       */
      history: {
        enable: true,
        enableChangeNode: true, // Listen Node engine data change
      },
      /**
       * Content change
       */
      onContentChange: debounce((ctx, event) => {
        // 检查是否有新创建的边（没有edgeId的），如果有就生成一个并写入lineData
        const allLines = ctx.document.linesManager?.getAllLines?.() ?? [];
        allLines.forEach((line) => {
          const lineData = line.lineData;
          // 如果lineData中没有edgeId，则生成一个并写入
          if (!lineData?.edgeId) {
            line.lineData = {
              ...lineData,
              edgeId: nanoid(),
            };
          }
        });

        //线条数据变化时，不自动保存（保证线条ID不会再次变化）
        if (event.type === 'LINE_DATA_CHANGE') {
          return;
        }
        // 历史模式下不触发自动保存，避免覆盖当前草稿
        const isHistoryMode = (ctx.playground.config as any).isHistoryMode;
        if (isHistoryMode) {
          console.log('Skip Auto Save: in history mode');
          return;
        }
        // 恢复操作期间不触发自动保存
        const isRestoring = (ctx.playground.config as any).isRestoring;
        if (isRestoring) {
          console.log('Skip Auto Save: restoring version');
          return;
        }
        console.log('Todo Auto Save: ', event, ctx.document.toJSON());
        workflowEventBus.emit(WorkflowEventNameEnum.AUTO_SAVE_START);
      }, 1000),
      /**
       * Running line
       */
      isFlowingLine: (ctx, line) => ctx.get(WorkflowRuntimeService).isFlowingLine(line),

      /**
       * Shortcuts
       */
      shortcuts,
      /**
       * Bind custom service
       */
      onBind: ({ bind }) => {
        bind(CustomService).toSelf().inSingletonScope();
      },
      /**
       * Playground init
       */
      onInit() {
        console.log('--- Playground init ---');
      },
      /**
       * Playground render
       */
      onAllLayersRendered(ctx) {
        // ctx.tools.autoLayout(); // init auto layout
        // init fit view
        ctx.tools.fitView(false);
        console.log('--- Playground rendered ---');
      },
      /**
       * Playground dispose
       */
      onDispose() {
        console.log('---- Playground Dispose ----');
      },
      plugins: () => [
        /**
         * Line render plugin
         * 连线渲染插件
         */
        createFreeLinesPlugin({
          renderInsideLine: LineAddButton,
        }),
        /**
         * Minimap plugin
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
         * Snap plugin
         * 自动对齐及辅助线插件
         */
        createFreeSnapPlugin({
          edgeColor: '#00B2B2',
          alignColor: '#00B2B2',
          edgeLineWidth: 1,
          alignLineWidth: 1,
          alignCrossWidth: 8,
        }),
        createFreeGroupPlugin({
          groupNodeRender: GroupNodeRender,
        }),
        /**
         * NodeAddPanel render plugin
         * 节点添加面板渲染插件
         */
        createFreeNodePanelPlugin({
          renderer: NodePanel,
        }),
        /**
         * This is used for the rendering of the loop node sub-canvas
         * 这个用于 loop 节点子画布的渲染
         */
        createContainerNodePlugin({}),
        /**
         * ContextMenu plugin
         */
        createContextMenuPlugin({}),
        createRuntimePlugin({
          mode: 'browser',
          // mode: 'server',
          // serverConfig: {
          //   domain: 'localhost',
          //   port: 4000,
          //   protocol: 'http',
          // },
        }),
        createGlobalVariablePlugin({}),
      ],
    }),
    [],
  );
}
