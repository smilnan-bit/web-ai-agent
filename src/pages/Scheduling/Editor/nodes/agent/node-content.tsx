import React, { useEffect, useRef, useState } from 'react';
import { getNodeForm, useRefresh } from '@flowgram.ai/free-layout-editor';
import { useNodeRenderContext } from '@/pages/Workflow/NewGraph/hooks';
import { NodeCardBody, NodeRow, TextChip, VarChip } from '../../components/NodeCardHelpers';
import { type AgentItem, AgentSelectModal } from '../shared-form-components';

const REJECT_ACTION_LABEL: Record<string, string> = {
  continue: '向下继续流转',
  back: '返回上一意图节点',
};

const CONV_MODE_LABEL: Record<string, string> = {
  continue: '断点续接',
  restart: '从头开始',
};

export function AgentNodeContent() {
  const { node } = useNodeRenderContext();
  const refresh = useRefresh();
  const [modalOpen, setModalOpen] = useState(false);
  const hasAutoOpened = useRef(false);

  useEffect(() => {
    const form = getNodeForm(node);
    if (!form) return;
    const d = form.onFormValuesChange(() => refresh());
    return () => d.dispose();
  }, [node, refresh]);

  const form = getNodeForm(node);
  const agentName: string = form?.getValueIn('agentName') || '';
  const rejectKeywords: string[] = form?.getValueIn('rejectKeywords') || [];
  const rejectAction: string = form?.getValueIn('rejectAction') || 'continue';
  const conversationMode: string = form?.getValueIn('conversationMode') || 'restart';

  useEffect(() => {
    if (!form) return;
    const agentId: string = form.getValueIn('agentId') ?? '';
    if (!agentId && !hasAutoOpened.current) {
      hasAutoOpened.current = true;
      setModalOpen(true);
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: only run once when form is ready
  }, [form]);

  const handleAgentSelect = (agent: AgentItem) => {
    form?.setValueIn('agentId', agent.id);
    form?.setValueIn('agentName', agent.name);
    form?.setValueIn('agentDesc', agent.desc);
  };

  return (
    <NodeCardBody>
      {agentName && <NodeRow label="Agent名称">{agentName}</NodeRow>}
      <NodeRow label="输入">
        <VarChip name="BOT_USER_INPUT" />
        <VarChip name="HISTORY_CONTEXT" />
      </NodeRow>
      {rejectKeywords.length > 0 && (
        <NodeRow label="拒识策略">
          {rejectKeywords.slice(0, 2).map((k) => (
            <TextChip key={k} text={k} />
          ))}
          {rejectKeywords.length > 2 && (
            <span style={{ color: '#999', fontSize: 11 }}>+{rejectKeywords.length - 2}</span>
          )}
        </NodeRow>
      )}
      <NodeRow label="拒识后">{REJECT_ACTION_LABEL[rejectAction] || '向下继续流转'}</NodeRow>
      <NodeRow label="会话衔接方式">{CONV_MODE_LABEL[conversationMode] || '从头开始'}</NodeRow>
      <AgentSelectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={(agent) => {
          handleAgentSelect(agent);
          setModalOpen(false);
        }}
      />
    </NodeCardBody>
  );
}
