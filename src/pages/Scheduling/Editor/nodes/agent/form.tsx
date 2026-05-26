import React, { useEffect, useRef, useState } from 'react';
import { Input, Tag, Tooltip } from 'antd';
import { DownOutlined, InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { getNodeForm, useRefresh } from '@flowgram.ai/free-layout-editor';
import { useNodeRenderContext } from '@/pages/Workflow/NewGraph/hooks';
import {
  type AgentItem,
  AgentSelectModal,
  ConversationModeContent,
  SectionPanel,
  VarsTable,
} from '../shared-form-components';

const INPUT_VARS = [
  { name: 'BOT_USER_INPUT', type: 'String', desc: '用户本轮对话输入内容' },
  { name: 'HISTORY_CONTEXT', type: 'String', desc: '用户本轮对话上下文内容' },
];

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#595959',
  marginBottom: 4,
  display: 'block',
};

const AgentForm = () => {
  const { node } = useNodeRenderContext();
  const refresh = useRefresh();
  const [modalOpen, setModalOpen] = useState(false);
  const [tagInputVisible, setTagInputVisible] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = getNodeForm(node);
    if (!form) return;
    const d = form.onFormValuesChange(() => refresh());
    return () => d.dispose();
  }, [node, refresh]);

  const form = getNodeForm(node);
  const agentName: string = form?.getValueIn('agentName') ?? '';
  const agentDesc: string = form?.getValueIn('agentDesc') ?? '';
  const rejectKeywords: string[] = form?.getValueIn('rejectKeywords') ?? [];
  const rejectCharCount: number = form?.getValueIn('rejectCharCount') ?? 10;
  const rejectAction: string = form?.getValueIn('rejectAction') ?? 'continue';
  const conversationMode: string = form?.getValueIn('conversationMode') ?? 'restart';

  const set = (key: string, v: unknown) => form?.setValueIn(key, v);

  const handleAgentSelect = (agent: AgentItem) => {
    set('agentId', agent.id);
    set('agentName', agent.name);
    set('agentDesc', agent.desc);
  };

  const removeKeyword = (kw: string) =>
    set(
      'rejectKeywords',
      rejectKeywords.filter((k) => k !== kw),
    );

  const confirmTagInput = () => {
    const val = tagInput.trim();
    if (val && !rejectKeywords.includes(val)) {
      set('rejectKeywords', [...rejectKeywords, val]);
    }
    setTagInput('');
    setTagInputVisible(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionPanel title="Agent">
        <div style={{ marginBottom: 12 }}>
          <span style={labelStyle}>Agent名称</span>
          <div
            onClick={() => setModalOpen(true)}
            style={{
              height: 32,
              padding: '0 11px',
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              background: '#fff',
              fontSize: 13,
              color: agentName ? '#262626' : '#bfbfbf',
            }}
          >
            <span>{agentName || '请选择Agent'}</span>
            <DownOutlined style={{ fontSize: 11, color: '#bfbfbf' }} />
          </div>
        </div>
        <div>
          <span style={labelStyle}>Agent描述</span>
          <Input.TextArea
            value={agentDesc}
            readOnly
            placeholder="我是Agent描述（勿删）"
            rows={3}
            style={{ fontSize: 12, background: '#fafafa', color: '#595959', resize: 'none' }}
          />
        </div>
      </SectionPanel>

      <SectionPanel title="输入">
        <VarsTable rows={INPUT_VARS} showRequired />
      </SectionPanel>

      <SectionPanel
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            拒识策略
            <Tooltip title="当开始节点的'对话衔接方式=断点续接'时，Agent的拒识策略才会生效。">
              <InfoCircleOutlined style={{ fontSize: 12, color: '#bfbfbf' }} />
            </Tooltip>
          </span>
        }
      >
        <div style={{ fontSize: 12, color: '#595959', marginBottom: 8, lineHeight: '22px' }}>
          若Agent输出内容的前{' '}
          <Input
            size="small"
            value={rejectCharCount}
            onChange={(e) => set('rejectCharCount', Number(e.target.value) || 10)}
            style={{ width: 40, textAlign: 'center', display: 'inline-block', padding: '0 4px' }}
          />{' '}
          个字中包含如下关键词时，系统会判定当前Agent无能力回答用户当前问题，新消息将向下继续流转
        </div>
        <div
          style={{
            minHeight: 40,
            padding: '6px 8px',
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          {rejectKeywords.map((kw) => (
            <Tag key={kw} closable onClose={() => removeKeyword(kw)} style={{ fontSize: 12 }}>
              {kw}
            </Tag>
          ))}
          {tagInputVisible ? (
            <Input
              ref={tagInputRef}
              size="small"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onBlur={confirmTagInput}
              onPressEnter={confirmTagInput}
              style={{ width: 100 }}
              autoFocus
            />
          ) : (
            <span
              onClick={() => setTagInputVisible(true)}
              style={{ fontSize: 12, color: '#337EFF', cursor: 'pointer' }}
            >
              <PlusOutlined /> 添加关键词
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
          <span style={{ fontSize: 12, color: '#595959' }}>拒识后：</span>
          {(
            [
              { v: 'continue', label: '向下继续流转' },
              { v: 'back', label: '返回到上一个意图识别节点' },
            ] as const
          ).map((opt) => (
            <label
              key={opt.v}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                marginRight: 8,
                cursor: 'pointer',
                fontSize: 12,
                color: '#262626',
              }}
            >
              <input
                type="radio"
                checked={rejectAction === opt.v}
                onChange={() => set('rejectAction', opt.v)}
                style={{ accentColor: '#337EFF' }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </SectionPanel>

      <SectionPanel title="对话衔接方式">
        <ConversationModeContent value={conversationMode} onChange={(v) => set('conversationMode', v)} />
      </SectionPanel>

      <AgentSelectModal open={modalOpen} onClose={() => setModalOpen(false)} onSelect={handleAgentSelect} />
    </div>
  );
};

export default AgentForm;
