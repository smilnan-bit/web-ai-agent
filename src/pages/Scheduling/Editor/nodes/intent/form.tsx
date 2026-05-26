import React, { useEffect } from 'react';
import { Input, Select, InputNumber, Slider, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { getNodeForm, useRefresh } from '@flowgram.ai/free-layout-editor';
import { nanoid } from 'nanoid';
import { useNodeRenderContext } from '@/pages/Workflow/NewGraph/hooks';
import { SectionPanel, VarsTable } from '../shared-form-components';

const MODEL_OPTIONS = [
  { label: '商和大模型', value: 'shanhe' },
  { label: '通义千问', value: 'qwen' },
];

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

const IntentForm = () => {
  const { node } = useNodeRenderContext();
  const refresh = useRefresh();

  useEffect(() => {
    const form = getNodeForm(node);
    if (!form) return;
    const d = form.onFormValuesChange(() => refresh());
    return () => d.dispose();
  }, [node, refresh]);

  const form = getNodeForm(node);
  const model: string = form?.getValueIn('model') ?? '';
  const temperature: number = form?.getValueIn('temperature') ?? 0.7;
  const intents: Array<{ id: string; name: string; desc: string }> = form?.getValueIn('intents') ?? [];
  const maxRetry: number = form?.getValueIn('maxRetry') ?? 2;
  const retryPrompt: string = form?.getValueIn('retryPrompt') ?? '';

  const set = (key: string, v: unknown) => form?.setValueIn(key, v);

  const addIntent = () => set('intents', [...intents, { id: nanoid(), name: '', desc: '' }]);
  const removeIntent = (idx: number) =>
    set(
      'intents',
      intents.filter((_, i) => i !== idx),
    );
  const updateIntent = (idx: number, key: string, val: string) =>
    set(
      'intents',
      intents.map((item, i) => (i === idx ? { ...item, [key]: val } : item)),
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionPanel title="输入">
        <VarsTable rows={INPUT_VARS} />
      </SectionPanel>

      <SectionPanel title="模型">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <span style={labelStyle}>模型</span>
            <Select
              value={model || undefined}
              onChange={(v) => set('model', v)}
              options={MODEL_OPTIONS}
              placeholder="请选择模型"
              style={{ width: '100%' }}
              size="small"
            />
          </div>
          <div>
            <span style={labelStyle}>
              Temperature <span style={{ color: '#f5222d' }}>*</span>
            </span>
            <InputNumber
              value={temperature}
              onChange={(v) => v !== null && set('temperature', v)}
              min={0}
              max={1}
              step={0.1}
              style={{ width: '100%' }}
              size="small"
            />
          </div>
        </div>
      </SectionPanel>

      <SectionPanel title="意图匹配">
        {intents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '12px 0', color: '#bfbfbf', fontSize: 13 }}>
            暂无意图，点击下方按钮添加
          </div>
        )}
        {intents.map((intent, idx) => (
          <div key={intent.id || idx} style={{ marginBottom: 12 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>意图 {idx + 1}</span>
              <DeleteOutlined
                style={{ fontSize: 12, color: '#bfbfbf', cursor: 'pointer' }}
                onClick={() => removeIntent(idx)}
              />
            </div>
            <Input
              size="small"
              placeholder="意图名称"
              value={intent.name}
              onChange={(e) => updateIntent(idx, 'name', e.target.value)}
              style={{ marginBottom: 4 }}
            />
            <Input
              size="small"
              placeholder="意图描述"
              value={intent.desc}
              onChange={(e) => updateIntent(idx, 'desc', e.target.value)}
            />
          </div>
        ))}
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <span onClick={addIntent} style={{ color: '#337EFF', cursor: 'pointer', fontSize: 13 }}>
            <PlusOutlined /> 新增
          </span>
        </div>
      </SectionPanel>

      <SectionPanel title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>反问策略</span>}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#595959' }}>最大反问次数</span>
            <Tooltip title="设置大模型追问用户的最大次数">
              <InfoCircleOutlined style={{ fontSize: 12, color: '#bfbfbf' }} />
            </Tooltip>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Slider
              value={maxRetry}
              min={0}
              max={10}
              step={1}
              onChange={(v) => set('maxRetry', v)}
              style={{ flex: 1 }}
            />
            <InputNumber
              value={maxRetry}
              min={0}
              max={10}
              onChange={(v) => v !== null && set('maxRetry', v)}
              size="small"
              style={{ width: 60 }}
            />
          </div>
        </div>
        <div>
          <span style={labelStyle}>提示词</span>
          <Input.TextArea
            value={retryPrompt}
            onChange={(e) => set('retryPrompt', e.target.value)}
            placeholder={
              '支持设置额外的提示词，当用户回复中没有获取到必填字段信息时，大模型将根据本提示词中设置的人设进行主动反问。\n示例：请根据上下文进行反问，注意反问时尽量做到语气温和，自然。\n多使用俏皮的反问语句引导客户。'
            }
            maxLength={1000}
            showCount
            rows={4}
            style={{ fontSize: 12 }}
          />
        </div>
      </SectionPanel>
    </div>
  );
};

export default IntentForm;
