import { useCallback, useContext, useEffect, useMemo, startTransition } from 'react';
import { PlaygroundEntityContext, useRefresh, useClientContext } from '@flowgram.ai/free-layout-editor';
import type { FlowNodeMeta } from '../../typings';
import { SidebarContext, IsSidebarContext } from '../../context';
import { SidebarNodeRenderer } from './sidebar-node-renderer';
import React from 'react';
import { Resizable } from '@douyinfe/semi-ui';
import { useResizableMemory } from '@/components/ResizePanel/useResizableMemory';
import TestRunPanel from '../../testrun/test-run-panel';

const Default_Width = 480;

export const SidebarRenderer = () => {
  const { nodeId, setNodeId, showTestRunPanel } = useContext(SidebarContext);
  const { selection, playground, document } = useClientContext();
  const refresh = useRefresh();

  // 使用 Resizable 记忆功能
  const { size, handleSizeChange } = useResizableMemory({
    storageKey: 'workflow-sidebar-width',
    defaultWidth: Default_Width,
    defaultHeight: '100%',
    minWidth: 320,
    maxWidth: '80vw',
    enableMemory: true,
  });
  const handleClose = useCallback(() => {
    // Sidebar delayed closing
    startTransition(() => {
      setNodeId(undefined);
    });
  }, [setNodeId]);
  const node = nodeId ? document.getNode(nodeId) : undefined;
  /**
   * Listen readonly
   */
  useEffect(() => {
    const disposable = playground.config.onReadonlyOrDisabledChange(() => {
      handleClose();
      refresh();
    });
    return () => disposable.dispose();
  }, [playground, handleClose, refresh]);
  /**
   * Listen selection
   */
  useEffect(() => {
    const toDispose = selection.onSelectionChanged(() => {
      if (showTestRunPanel) {
        return;
      }
      /**
       * 如果没有选中任何节点，则自动关闭侧边栏
       * If no node is selected, the sidebar is automatically closed
       */
      if (selection.selection.length === 0) {
        handleClose();
      } else if (selection.selection.length === 1 && selection.selection[0] !== node) {
        handleClose();
      }
    });
    return () => toDispose.dispose();
  }, [selection, handleClose, node, showTestRunPanel]);
  /**
   * Close when node disposed
   */
  useEffect(() => {
    if (node) {
      const toDispose = node.onDispose(() => {
        setNodeId(undefined);
      });
      return () => toDispose.dispose();
    }
    return () => {};
  }, [node, setNodeId]);

  const memoized = useMemo(() => {
    if (showTestRunPanel) {
      return { visible: true };
    }
    if (!node) {
      return { visible: false };
    }
    const { sidebarDisabled = false } = node.getNodeMeta<FlowNodeMeta>();
    return { visible: !sidebarDisabled };
  }, [node, showTestRunPanel]);
  const { visible } = memoized;

  /**
   * Add "key" to rerender the sidebar when the node changes
   */
  const content = showTestRunPanel ? (
    <TestRunPanel />
  ) : node && visible ? (
    <PlaygroundEntityContext.Provider key={node.id} value={node}>
      <SidebarNodeRenderer node={node} />
    </PlaygroundEntityContext.Provider>
  ) : null;

  return (
    <div
      style={{ display: visible ? 'block' : 'none' }}
      tw="h-full bg-white rounded-[4px] shadow-[0_2px_6px_0_rgba(0,0,0,0.12)] border border-solid border-[rgba(0, 0, 0, 0.06)] box-border"
    >
      <Resizable
        enable={{
          top: false,
          left: true,
          right: false,
          bottom: false,
        }}
        minWidth={Default_Width}
        maxWidth={'80vw'}
        size={size}
        onChange={(size) => {
          handleSizeChange({
            width: size.width || Default_Width,
            height: '100%',
          });
        }}
      >
        <IsSidebarContext.Provider value={true}>{content}</IsSidebarContext.Provider>
      </Resizable>
    </div>
  );
};
