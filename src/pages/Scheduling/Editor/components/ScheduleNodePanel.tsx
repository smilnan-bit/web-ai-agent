import React, { type FC } from 'react';
import type { NodePanelRenderProps } from '@flowgram.ai/free-node-panel-plugin';
import { Popover } from '@douyinfe/semi-ui';
import { useClientContext } from '@flowgram.ai/free-layout-editor';
import { nodeRegistries } from '../nodes';
import { IconScheduleIntent, IconScheduleAgent, IconScheduleNLP } from '../nodes/icons';
import { ScheduleNodeType } from '../nodes/constants';

const NODE_ICON_MAP: Partial<Record<number, React.ReactNode>> = {
  [ScheduleNodeType.Intent]: <IconScheduleIntent size={16} />,
  [ScheduleNodeType.Agent]: <IconScheduleAgent size={16} />,
  [ScheduleNodeType.NLP]: <IconScheduleNLP size={16} />,
};

const ScheduleNodeList: FC<{ onSelect: NodePanelRenderProps['onSelect'] }> = ({ onSelect }) => {
  const context = useClientContext();
  const visibleNodes = nodeRegistries.filter((r) => r.meta.nodePanelVisible !== false);

  return (
    <div style={{ width: 168, padding: '4px 0' }}>
      {visibleNodes.map((registry, idx) => {
        const icon = NODE_ICON_MAP[registry.type as number];
        const handleClick = (e: React.MouseEvent) => {
          const json = (registry as any).onAdd?.(context);
          onSelect({ nodeType: registry.type as string, selectEvent: e, nodeJSON: json });
        };

        return (
          <div
            key={idx}
            onClick={handleClick}
            style={{
              padding: '9px 14px',
              cursor: 'pointer',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'rgba(0,0,0,0.75)',
              transition: 'background 0.15s',
              margin: '0 4px',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#F0F5FF';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            {icon && <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>}
            <span>{registry.info?.title ?? String(registry.type)}</span>
          </div>
        );
      })}
    </div>
  );
};

export const ScheduleNodePanel: FC<NodePanelRenderProps> = ({ onSelect, position, onClose }) => {
  return (
    <Popover
      trigger="click"
      visible={true}
      onVisibleChange={(v) => (v ? null : onClose())}
      content={<ScheduleNodeList onSelect={onSelect} />}
      placement="topLeft"
      popupAlign={{ offset: [0, -8] }}
      overlayStyle={{ padding: 0 }}
      style={{ borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: 0 }}
    >
      <div
        style={{
          position: 'absolute',
          top: position.y,
          left: position.x,
          width: 0,
          height: 0,
        }}
      />
    </Popover>
  );
};
