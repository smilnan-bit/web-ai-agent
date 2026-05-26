import React from 'react';
import { ProblemEmpty } from './empty';
import type { ValidateError } from '../../services';
import { BaseGroupWrap } from './group-wrap';
import { NodeItem } from './node-item';
import { useClientContext, useService, WorkflowSelectService } from '@flowgram.ai/free-layout-editor';
import { scrollToView } from '../node-render/utils';
import { useContext } from 'react';
import { SidebarContext } from '../../context';

interface ProblemGroupProps {
  list: ValidateError[];
}

export const ProblemGroup: React.FC<ProblemGroupProps> = ({ list }) => {
  const isEmpty = !list.length;
  const { document } = useClientContext();
  const selectService = useService(WorkflowSelectService);
  const ctx = useClientContext();
  const { setNodeId } = useContext(SidebarContext);
  if (isEmpty) {
    return <ProblemEmpty />;
  }

  const onClick = (p: ValidateError) => {
    // 根据nodeId获取节点
    const node = document.getNode(p.nodeId);
    if (node) {
      // 选中节点
      selectService.selectNode(node);

      // 展开侧边栏
      setNodeId(p.nodeId);

      // 滚动到节点位置
      scrollToView(ctx, node);
    }
  };
  console.log(list);
  return (
    <div tw="flex-1 overflow-y-auto p-2 gap-1">
      <BaseGroupWrap>
        {list.map((i, index) => (
          <NodeItem key={`${i.nodeId}-${index}`} problem={i} onClick={onClick} />
        ))}
      </BaseGroupWrap>
    </div>
  );
};
