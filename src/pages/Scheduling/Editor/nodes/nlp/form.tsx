import React, { useEffect } from 'react';
import { getNodeForm, useRefresh } from '@flowgram.ai/free-layout-editor';
import { useNodeRenderContext } from '@/pages/Workflow/NewGraph/hooks';
import { ConversationModeContent, SectionPanel, VarsTable } from '../shared-form-components';

const INPUT_VARS = [{ name: 'BOT_USER_INPUT', type: 'String', desc: '用户本轮对话输入内容' }];

const NLPForm = () => {
  const { node } = useNodeRenderContext();
  const refresh = useRefresh();

  useEffect(() => {
    const form = getNodeForm(node);
    if (!form) return;
    const d = form.onFormValuesChange(() => refresh());
    return () => d.dispose();
  }, [node, refresh]);

  const form = getNodeForm(node);
  const conversationMode: string = form?.getValueIn('conversationMode') ?? 'restart';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionPanel title="输入">
        <VarsTable rows={INPUT_VARS} showRequired />
      </SectionPanel>
      <SectionPanel title="对话衔接方式">
        <ConversationModeContent value={conversationMode} onChange={(v) => form?.setValueIn('conversationMode', v)} />
      </SectionPanel>
    </div>
  );
};

export default NLPForm;
