import React from 'react';

/** 变量徽章：[AI BOT_USER_INPUT] */
export const VarChip: React.FC<{ prefix?: string; name: string }> = ({ prefix = 'AI', name }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      padding: '1px 5px',
      background: '#F0F5FF',
      border: '1px solid #D6E4FF',
      borderRadius: 3,
      fontSize: 11,
      color: '#333',
      whiteSpace: 'nowrap',
    }}
  >
    <span
      style={{
        color: '#337EFF',
        fontWeight: 700,
        fontSize: 10,
        lineHeight: 1,
      }}
    >
      {prefix}
    </span>
    {name}
  </span>
);

/** 普通文本徽章：[对不起] [我不知道] */
export const TextChip: React.FC<{ text: string }> = ({ text }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '1px 5px',
      background: '#F5F5F5',
      border: '1px solid #E8E8E8',
      borderRadius: 3,
      fontSize: 11,
      color: '#555',
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </span>
);

/** 节点卡片内容行：标签 + 内容 */
export const NodeRow: React.FC<{
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ label, children, style }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 6,
      minHeight: 20,
      fontSize: 12,
      lineHeight: '20px',
      ...style,
    }}
  >
    <span style={{ color: '#999', flexShrink: 0, width: 66 }}>{label}</span>
    <span style={{ flex: 1, color: '#333', display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
      {children}
    </span>
  </div>
);

/** 节点卡片内容区域包裹 */
export const NodeCardBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 12px 4px' }}>{children}</div>
);
