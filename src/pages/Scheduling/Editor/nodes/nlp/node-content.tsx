import React, { useEffect } from 'react';
import { getNodeForm, useRefresh } from '@flowgram.ai/free-layout-editor';
import { useNodeRenderContext } from '@/pages/Workflow/NewGraph/hooks';
import { NodeCardBody, NodeRow, VarChip } from '../../components/NodeCardHelpers';

const CONV_MODE_LABEL: Record<string, string> = {
  continue: '断点续接',
  restart: '从头开始',
};

export function NLPNodeContent() {
  const { node } = useNodeRenderContext();
  const refresh = useRefresh();

  useEffect(() => {
    const form = getNodeForm(node);
    if (!form) return;
    const d = form.onFormValuesChange(() => refresh());
    return () => d.dispose();
  }, [node, refresh]);

  const form = getNodeForm(node);
  const conversationMode: string = form?.getValueIn('conversationMode') || 'restart';

  return (
    <NodeCardBody>
      <NodeRow label="输入">
        <VarChip name="BOT_USER_INPUT" />
      </NodeRow>
      <NodeRow label="会话衔接方式">{CONV_MODE_LABEL[conversationMode] || '从头开始'}</NodeRow>
    </NodeCardBody>
  );
}
