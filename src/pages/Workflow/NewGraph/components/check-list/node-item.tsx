import { BaseItem } from './base-item';
import React, { useMemo } from 'react';
import { type FlowNodeRegistry, getNodeForm, useClientContext } from '@flowgram.ai/free-layout-editor';
import type { ValidateError } from '../../services';

interface NodeItemProps {
  problem: ValidateError;
  onClick: (p: ValidateError) => void;
}

export const NodeItem: React.FC<NodeItemProps> = ({ problem, onClick }) => {
  const { document } = useClientContext();
  const meta = useMemo(() => {
    if (!problem.nodeId) {
      return {
        title: '未知节点',
        icon: undefined,
      };
    }

    try {
      const node = document.getNode(problem.nodeId);
      if (!node) {
        return {
          title: '节点不存在',
          icon: undefined,
        };
      }
      const title = getNodeForm(node)?.getValueIn('title');
      const icon = node.getNodeRegistry<FlowNodeRegistry>().info?.icon;

      return {
        title,
        icon,
      };
    } catch (error) {
      console.error('获取节点meta信息失败:', error);
      return {
        title: '获取节点信息失败',
        icon: undefined,
      };
    }
  }, [problem.nodeId, document]);
  const Icon = meta?.icon;

  return <BaseItem problem={problem} title={meta?.title || ''} icon={Icon ? <Icon /> : null} onClick={onClick} />;
};
