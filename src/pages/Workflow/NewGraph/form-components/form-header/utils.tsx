import { getNodeForm, type FlowNodeEntity } from '@flowgram.ai/free-layout-editor';

import type { FlowNodeRegistry } from '../../typings';
import React from 'react';

export const getIcon = (node: FlowNodeEntity, large?: boolean) => {
  const Icon = node.getNodeRegistry<FlowNodeRegistry>().info?.icon;
  if (!Icon) return null;
  return large ? <Icon tw="text-[20px]" /> : <Icon tw="text-[18px]" />;
};

export const getNodeName = (node: FlowNodeEntity) => {
  const title = getNodeForm(node)?.getValueIn('title');
  return title;
};

export const getNodeBgColor = (node: FlowNodeEntity) => {
  return node.getNodeRegistry<FlowNodeRegistry>().info?.bgColor || '#fff';
};
