import React from 'react';

const NODE_COLORS = {
  start: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32', label: '开始' },
  end: { bg: '#fce4ec', border: '#e91e63', text: '#880e4f', label: '结束' },
  dialogue: { bg: '#e3f2fd', border: '#2196f3', text: '#0d47a1', label: '对话' },
  tool: { bg: '#fff8e1', border: '#ff9800', text: '#e65100', label: '工具' },
  reply: { bg: '#f3e5f5', border: '#9c27b0', text: '#4a148c', label: '回复' },
  condition: { bg: '#fafafa', border: '#9e9e9e', text: '#424242', label: '条件' },
  block: { bg: '#f1f8e9', border: '#8bc34a', text: '#33691e', label: '分支' },
};

function NodeCard({ node, depth = 0 }) {
  const style = NODE_COLORS[node.type] || NODE_COLORS.dialogue;
  const isContainer = node.blocks && node.blocks.length > 0;

  return (
    <div style={{ marginLeft: depth * 16, marginBottom: 8 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          padding: '8px 12px',
          background: style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: 8,
          position: 'relative',
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: style.text,
            background: style.border + '22',
            border: `1px solid ${style.border}`,
            borderRadius: 4,
            padding: '1px 6px',
            whiteSpace: 'nowrap',
            marginTop: 2,
          }}
        >
          {style.label}
        </span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4 }}>
            {node.data.title}
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 2, lineHeight: 1.4 }}>
            {node.data.content}
          </div>
        </div>
      </div>

      {isContainer && (
        <div
          style={{
            marginLeft: 16,
            marginTop: 4,
            paddingLeft: 12,
            borderLeft: `2px dashed ${style.border}88`,
          }}
        >
          {node.blocks.map((child) => (
            <NodeCard key={child.id} node={child} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}

function Arrow() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 4,
      }}
    >
      <div style={{ width: 1, height: 12, background: '#bbb' }} />
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: '6px solid #bbb',
        }}
      />
    </div>
  );
}

export default function WorkflowPreview({ nodes }) {
  if (!nodes || nodes.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: 14 }}>
        暂无工作流数据
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 16,
        overflowY: 'auto',
        height: '100%',
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        {nodes.map((node, idx) => (
          <React.Fragment key={node.id}>
            <NodeCard node={node} depth={0} />
            {idx < nodes.length - 1 && <Arrow />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
