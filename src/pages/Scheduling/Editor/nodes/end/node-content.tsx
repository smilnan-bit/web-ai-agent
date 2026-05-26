import React from 'react';
import { NodeCardBody, NodeRow } from '../../components/NodeCardHelpers';
import { getNodeForm, useRefresh } from '@flowgram.ai/free-layout-editor';
import { useNodeRenderContext } from '@/pages/Workflow/NewGraph/hooks';
import { useEffect } from 'react';

export function EndNodeContent() {
  const { node } = useNodeRenderContext();
  const refresh = useRefresh();

  useEffect(() => {
    const form = getNodeForm(node);
    if (!form) return;
    const d = form.onFormValuesChange(() => refresh());
    return () => d.dispose();
  }, [node, refresh]);

  const form = getNodeForm(node);
  const endMode = form?.getValueIn('endMode') || '直接结束';

  return (
    <NodeCardBody>
      <NodeRow label="结束方式">{endMode}</NodeRow>
    </NodeCardBody>
  );
}
