import { type FC, useCallback, useState, type MouseEvent } from 'react';

import { useClientContext, type WorkflowNodeEntity } from '@flowgram.ai/free-layout-editor';
import { IconButton, Dropdown } from '@douyinfe/semi-ui';

import type { FlowNodeRegistry } from '../../typings';
import { PasteShortcut } from '../../shortcuts/paste';
import { CopyShortcut } from '../../shortcuts/copy';
import React from 'react';
import { IconGengduo } from '../../nodes/icons';
import type { DropDownMenuItem } from '@douyinfe/semi-ui/lib/es/dropdown';
import { message } from 'antd';

interface NodeMenuProps {
  node: WorkflowNodeEntity;
  updateTitleEdit: (setEditing: boolean) => void;
  deleteNode: () => void;
}

export const NodeMenu: FC<NodeMenuProps> = ({ node, deleteNode, updateTitleEdit }) => {
  const [visible, setVisible] = useState(true);
  const clientContext = useClientContext();
  const registry = node.getNodeRegistry<FlowNodeRegistry>();

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const sameTypeNodes = clientContext.document
        .getAllNodes()
        .filter((item) => item.getNodeMeta().type === node.getNodeMeta().type);

      if (registry.meta?.maxNum && sameTypeNodes.length >= registry.meta?.maxNum) {
        message.warning(`最多只能添加${registry.meta?.maxNum}个${registry.info?.title}节点`);
        return;
      }
      try {
        const copyShortcut = new CopyShortcut(clientContext);
        const pasteShortcut = new PasteShortcut(clientContext);
        const data = copyShortcut.toClipboardData([node]);
        // 确保在复制后立即粘贴
        if (data) {
          pasteShortcut.apply(data);
        }
      } catch (error) {
        console.error('Copy/paste operation failed:', error);
        // 可以在这里添加用户友好的错误提示
      }
      e.stopPropagation(); // Disable clicking prevents the sidebar from opening
    },
    [clientContext, node],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteNode();
      e.stopPropagation(); // Disable clicking prevents the sidebar from opening
    },
    [deleteNode],
  );

  const handleEditTitle = useCallback(
    (e) => {
      e.stopPropagation();
      updateTitleEdit(true);
    },
    [updateTitleEdit],
  );

  if (!visible) {
    return <></>;
  }

  const Menu = [
    { node: 'item', name: '重命名', onClick: handleEditTitle },
    {
      node: 'item',
      name: '复制',
      onClick: handleCopy,
      disabled: registry.meta?.copyDisable === true,
    },
    {
      node: 'item',
      name: <span style={{ color: '#FF4D4F' }}>删除</span>,
      onClick: handleDelete,
      disabled: !!(registry.canDelete?.(clientContext, node) || registry.meta?.deleteDisable),
    },
  ];
  return (
    <Dropdown trigger="hover" position="bottomRight" menu={Menu as DropDownMenuItem[]}>
      <IconButton
        color="secondary"
        size="small"
        theme="borderless"
        icon={<IconGengduo />}
        onClick={(e) => e.stopPropagation()}
      />
    </Dropdown>
  );
};
