import { useNodeRender, type FlowNodeEntity } from '@flowgram.ai/free-layout-editor';
import { NodeRenderContext } from '../../context';
import React from 'react';

export function SidebarNodeRenderer(props: { node: FlowNodeEntity }) {
  const { node } = props;
  const nodeRender = useNodeRender(node);

  return (
    <NodeRenderContext.Provider value={nodeRender}>
      <div tw="flex flex-col h-full">{nodeRender.form?.render()}</div>
    </NodeRenderContext.Provider>
  );
}
