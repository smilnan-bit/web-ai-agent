import React from 'react';
import { useNodeRender, type FlowNodeEntity } from '@flowgram.ai/free-layout-editor';
import { NodeRenderContext } from '../../context';
import { ConfigProvider } from '@douyinfe/semi-ui';
import { NodeWrapper } from './node-wrapper';
import { useMemoizedFn } from 'ahooks';
import { NodeStatusBar } from '../../testrun/node-status-bar';

export const NodeRender = ({ node }: { node: FlowNodeEntity }) => {
  const nodeRender = useNodeRender();
  /**
   * Used to make the Tooltip scale with the node, which can be implemented by itself depending on the UI library
   * 用于让 Tooltip 跟随节点缩放, 这个可以根据不同的 ui 库自己实现
   */
  const getPopupContainer = useMemoizedFn(() => node.renderData.node || document.body);
  return (
    <ConfigProvider getPopupContainer={getPopupContainer}>
      <NodeRenderContext.Provider value={nodeRender}>
        <NodeWrapper>{nodeRender.form && nodeRender.form.render()}</NodeWrapper>
        <NodeStatusBar />
      </NodeRenderContext.Provider>
    </ConfigProvider>
  );
};
