import React, { useState } from 'react';
import { Button, Input, Modal, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export interface AgentItem {
  id: string;
  name: string;
  type: 'third' | 'self';
  desc: string;
}

export const MOCK_AGENTS: AgentItem[] = [
  { id: '1', name: 'Agent1111名称', type: 'third', desc: 'Agent1111的描述描述描述' },
  { id: '2', name: 'Agent2222的名称', type: 'self', desc: 'Agent2222的描述描述描述' },
];

export const AgentSelectModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSelect: (agent: AgentItem) => void;
}> = ({ open, onClose, onSelect }) => {
  const [keyword, setKeyword] = useState('');
  const filtered = MOCK_AGENTS.filter((a) => a.name.includes(keyword));
  return (
    <Modal title="选择Agent" open={open} onCancel={onClose} footer={null} width={480} destroyOnClose>
      <Input
        placeholder="搜索Agent名称"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        suffix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        style={{ marginBottom: 16 }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((agent) => (
          <div
            key={agent.id}
            style={{
              padding: '12px 16px',
              borderRadius: 6,
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#262626' }}>{agent.name}</span>
                <Tag
                  color={agent.type === 'third' ? 'blue' : 'orange'}
                  style={{ fontSize: 12, padding: '1px 8px', borderRadius: 4 }}
                >
                  {agent.type === 'third' ? '三方智能体' : '自营智能体'}
                </Tag>
              </div>
              <div style={{ fontSize: 13, color: '#8c8c8c' }}>{agent.desc}</div>
            </div>
            <Button
              onClick={() => {
                onSelect(agent);
                onClose();
              }}
              style={{ marginLeft: 16, letterSpacing: '0.2em', flexShrink: 0 }}
            >
              添加
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
};

const cellStyle: React.CSSProperties = {
  height: 30,
  padding: '0 8px',
  background: '#f5f5f5',
  border: '1px solid #e8e8e8',
  borderRadius: 4,
  fontSize: 12,
  color: '#595959',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const SectionPanel: React.FC<{
  title: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}> = ({ title, children, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 0',
          cursor: 'pointer',
          borderBottom: '1px solid #f0f0f0',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: '#8c8c8c',
            transform: expanded ? 'none' : 'rotate(-90deg)',
            transition: 'transform 0.2s',
            display: 'inline-block',
          }}
        >
          ∨
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#262626' }}>{title}</span>
      </div>
      {expanded && <div style={{ paddingTop: 12, paddingBottom: 4 }}>{children}</div>}
    </div>
  );
};

export const VarsTable: React.FC<{
  rows: { name: string; type?: string; desc: string }[];
  showRequired?: boolean;
}> = ({ rows, showRequired = false }) => {
  const colTpl = showRequired ? '1fr 80px 1fr 52px' : '1fr 80px 1fr';
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: colTpl, gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: '#8c8c8c' }}>
          变量名称 <span style={{ color: '#f5222d' }}>*</span>
        </span>
        <span style={{ fontSize: 12, color: '#8c8c8c' }}>
          变量类型 <span style={{ color: '#f5222d' }}>*</span>
        </span>
        <span style={{ fontSize: 12, color: '#8c8c8c' }}>
          描述 <span style={{ color: '#f5222d' }}>*</span>
        </span>
        {showRequired && (
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>
            必填 <span style={{ color: '#f5222d' }}>*</span>
          </span>
        )}
      </div>
      {rows.map((row) => (
        <div key={row.name} style={{ display: 'grid', gridTemplateColumns: colTpl, gap: 8, marginBottom: 8 }}>
          <div style={cellStyle}>{row.name}</div>
          <div style={cellStyle}>{row.type ?? 'String'}</div>
          <div style={cellStyle}>{row.desc}</div>
          {showRequired && <div style={cellStyle} />}
        </div>
      ))}
    </div>
  );
};

export const ConversationModeContent: React.FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => (
  <div>
    <div style={{ fontSize: 12, color: '#595959', marginBottom: 10 }}>用户的新消息：</div>
    {(
      [
        { v: 'restart', label: '从头开始', desc: '从开始节点重新流转。' },
        {
          v: 'continue',
          label: '断点续接',
          desc: '优先衔接上次对话，即用户的新消息优先给当前节点继续处理。',
        },
      ] as const
    ).map((opt) => (
      <label
        key={opt.v}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          marginBottom: 12,
          cursor: 'pointer',
        }}
      >
        <input
          type="radio"
          checked={value === opt.v}
          onChange={() => onChange(opt.v)}
          style={{ marginTop: 3, accentColor: '#337EFF' }}
        />
        <div>
          <div style={{ fontSize: 13, color: '#262626' }}>{opt.label}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{opt.desc}</div>
        </div>
      </label>
    ))}
  </div>
);
