import React, { type FC } from 'react';
import type { NodePanelRenderProps } from '@flowgram.ai/free-node-panel-plugin';
import { useClientContext, type WorkflowNodeEntity } from '@flowgram.ai/free-layout-editor';

import type { FlowNodeRegistry } from '../../typings';
import { nodeRegistries } from '../../nodes';
import { canContainNode } from '../../utils';

interface NodeProps {
  label: string;
  icon: React.FC;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  disabled: boolean;
}

function Node(props: NodeProps) {
  const Icon = props.icon;
  return (
    <div
      onClick={props.disabled ? undefined : props.onClick}
      style={props.disabled ? { opacity: 0.3 } : {}}
      tw="w-full leading-8 px-3 rounded-[4px] flex items-center cursor-pointer text-[16px] hover:bg-[#F5F5F5]"
    >
      <Icon />
      <div tw="text-[14px] ml-3">{props.label}</div>
    </div>
  );
}

interface NodeListProps {
  onSelect: NodePanelRenderProps['onSelect'];
  containerNode?: WorkflowNodeEntity;
}

export const NodeList: FC<NodeListProps> = (props) => {
  const { onSelect, containerNode } = props;
  const context = useClientContext();
  const handleClick = (e: React.MouseEvent, registry: FlowNodeRegistry) => {
    const json = registry.onAdd?.(context);
    onSelect({
      nodeType: registry.type as string,
      selectEvent: e,
      nodeJSON: json,
    });
  };
  return (
    <div
      style={{ width: 80 * 2 + 20 }}
      tw="max-h-[500px] overflow-auto [&::-webkit-scrollbar]:hidden rounded-[4px] w-[180px] py-1 px-2"
    >
      {nodeRegistries
        .filter((register) => register.meta.nodePanelVisible !== false)
        .filter((register) => {
          if (register.meta.onlyInContainer) {
            return register.meta.onlyInContainer === containerNode?.flowNodeType;
          }
          if (containerNode && !canContainNode(register.type, containerNode)) {
            return false;
          }

          return true;
        })
        .map((registry, index) => (
          <Node
            key={`${registry.type}-${index}`}
            disabled={!(registry.canAdd?.(context) ?? true)}
            icon={registry.info?.icon as React.FC<React.SVGProps<SVGSVGElement>>}
            label={registry?.info?.title as string}
            onClick={(e) => handleClick(e, registry)}
          />
        ))}
    </div>
  );
};
