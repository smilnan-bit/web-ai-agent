import { useContext, useEffect, useState } from 'react';
import {
  useClientContext,
  CommandService,
  type FlowNodeRegistry,
  usePlayground,
} from '@flowgram.ai/free-layout-editor';
import { Button, Tooltip } from 'antd';
import { IconClose } from '@douyinfe/semi-icons';
import { PlayCircleOutlined } from '@ant-design/icons';
import { TitleInput } from './title-input';
import { FlowCommandId } from '../../shortcuts';
import { useIsSidebar, useNodeRenderContext } from '../../hooks';
import { SidebarContext } from '../../context';
import { NodeMenu } from '../../components/node-menu';
import { getIcon, getNodeBgColor, getNodeName } from './utils';
import React from 'react';
import { IconJiantouXia } from '../../nodes/icons';
import { WorkflowNodeType } from '../../nodes/constants';
import { toggleLoopExpanded } from '../../utils';
import { WorkflowEventNameEnum, workflowGlobalEmit } from '../../event';

export function FormHeader() {
  const { node, expanded, toggleExpand, readonly } = useNodeRenderContext();
  const playground = usePlayground();
  const ctx = useClientContext();
  const [titleEdit, updateTitleEdit] = useState<boolean>(false);
  const { setNodeId } = useContext(SidebarContext);
  const { setShowLeftPanel } = useContext(SidebarContext);
  const isSidebar = useIsSidebar();
  const handleExpand = (e: React.MouseEvent) => {
    toggleExpand();
    e.stopPropagation(); // Disable clicking prevents the sidebar from opening
  };
  const handleDelete = () => {
    ctx.get<CommandService>(CommandService).executeCommand(FlowCommandId.DELETE, [node]);
  };
  const handleClose = () => {
    setNodeId(undefined);
    setShowLeftPanel(false);
  };

  const handleTestNode = (e: React.MouseEvent, fromCard: boolean) => {
    e.stopPropagation();
    if (fromCard) {
      // 从卡片点击：先打开侧边栏，再触发打开调试面板
      setNodeId(node.id);
      // 使用 setTimeout 确保侧边栏渲染后再触发事件
      setTimeout(() => {
        workflowGlobalEmit(WorkflowEventNameEnum.NODE_DEBUG_PANEL_OPEN, node.id);
      }, 100);
    } else {
      // 从侧边栏点击：直接触发打开调试面板
      workflowGlobalEmit(WorkflowEventNameEnum.NODE_DEBUG_PANEL_OPEN, node.id);
    }
  };

  useEffect(() => {
    // 折叠子节点
    if (node.getNodeMeta().hideSubCanvasWhenCollapsed) {
      toggleLoopExpanded(node, expanded);
    }
  }, [expanded]);

  const type = node.getNodeRegistry<FlowNodeRegistry>().type;
  const limitEdit = readonly || type === WorkflowNodeType.Start || type === WorkflowNodeType.End || isSidebar;

  // 仅大模型节点和代码节点显示测试按钮
  const showTestButton = !readonly && (type === WorkflowNodeType.LLM || type === WorkflowNodeType.Code);

  return (
    <div
      tw="flex p-3 pb-2 justify-start items-center w-full gap-[8px] cursor-move text-[14px] leading-[20px]"
      style={
        !isSidebar
          ? { backgroundColor: getNodeBgColor(node) }
          : {
              fontSize: '16px',
              height: '56px',
              padding: '0 16px',
              cursor: 'auto',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            }
      }
    >
      {getIcon(node, isSidebar)}
      <TitleInput
        readonly={readonly}
        updateTitleEdit={updateTitleEdit}
        titleEdit={titleEdit}
        showEdit={
          isSidebar && type !== WorkflowNodeType.End && type !== WorkflowNodeType.Start && !playground.config.readonly
        }
      />
      {/* <div tw="flex-1 font-medium">{getNodeName(node)}</div> */}
      {node.renderData.expandable && !isSidebar && (
        <IconJiantouXia
          tw="cursor-pointer"
          onClick={handleExpand}
          style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(90deg)' }}
        />
      )}
      {showTestButton && !isSidebar && (
        <Tooltip title="测试该节点" overlayInnerStyle={{ color: '#000' }} color="#fff">
          <PlayCircleOutlined
            tw="cursor-pointer text-[16px] hover:text-[#337EFF]"
            onClick={(e) => handleTestNode(e, true)}
          />
        </Tooltip>
      )}
      {showTestButton && isSidebar && (
        <span
          tw="cursor-pointer text-[#337EFF] flex items-center text-[14px] ml-auto"
          onClick={(e) => handleTestNode(e, false)}
        >
          <PlayCircleOutlined tw="mr-1" />
          测试该节点
        </span>
      )}
      {limitEdit || isSidebar ? undefined : (
        <div tw="flex items-center gap-1">
          <NodeMenu node={node} deleteNode={handleDelete} updateTitleEdit={updateTitleEdit} />
        </div>
      )}
      {isSidebar && (
        <Button type="text" icon={<IconClose />} size="small" onClick={handleClose} tw="pt-[2px] leading-[24px]" />
      )}
    </div>
  );
}
