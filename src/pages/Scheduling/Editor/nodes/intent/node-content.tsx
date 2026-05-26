import React, { useLayoutEffect } from 'react';
import { getNodeForm, useRefresh, useWatchFormValues, WorkflowNodePortsData } from '@flowgram.ai/free-layout-editor';
import { useNodeRenderContext } from '@/pages/Workflow/NewGraph/hooks';
import { CustomPort } from '@/pages/Workflow/NewGraph/components/node-render/CustomPort';
import { NodeCardBody, NodeRow, VarChip } from '../../components/NodeCardHelpers';

export function IntentNodeContent() {
  const { node } = useNodeRenderContext();
  const refresh = useRefresh();
  const data = useWatchFormValues(node);
  const intents: Array<{ id: string; name: string }> = data?.intents || [];
  const model: string = data?.model || '';

  useLayoutEffect(() => {
    const form = getNodeForm(node);
    if (!form) return;
    const d = form.onFormValuesChange(() => refresh());
    return () => d.dispose();
  }, [node, refresh]);

  useLayoutEffect(() => {
    window.requestAnimationFrame(() => {
      node.getData<WorkflowNodePortsData>(WorkflowNodePortsData).updateDynamicPorts();
    });
    // biome-ignore lint/correctness/useExhaustiveDependencies: intents.length triggers port update
  }, [node, intents.length]);

  return (
    <NodeCardBody>
      <NodeRow label="输入">
        <VarChip name="BOT_USER_INPUT" />
        <VarChip name="HISTORY_CONTEXT" />
      </NodeRow>
      {model && <NodeRow label="模型">{model}</NodeRow>}
      {intents.map((intent, idx) => (
        <div key={intent.id || idx} style={{ position: 'relative' }}>
          <NodeRow label={`意图${idx + 1}`}>{intent.name || <span style={{ color: '#bbb' }}>未填写</span>}</NodeRow>
          <CustomPort data-port-id={intent.id} data-port-type="output" />
        </div>
      ))}
      <div style={{ position: 'relative' }}>
        <NodeRow label="其他">
          <span style={{ color: '#999', fontSize: 11 }}>兜底分支</span>
        </NodeRow>
        <CustomPort data-port-id="intent-other" data-port-type="output" />
      </div>
    </NodeCardBody>
  );
}
