/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import React, { useEffect, useState, useContext } from 'react';

import { useRefresh } from '@flowgram.ai/free-layout-editor';
import { useClientContext } from '@flowgram.ai/free-layout-editor';

// import { IconUndo, IconRedo } from '@douyinfe/semi-icons';
import { ZoomSelect } from './zoom-select';
import { SwitchLine } from './switch-line';
import { ToolContainer, ToolSection } from './styles';
import { Readonly } from './readonly';
import { MinimapSwitch } from './minimap-switch';
import { Minimap } from './minimap';
import { Interactive } from './interactive';
import { FitView } from './fit-view';
import { Comment } from './comment';
import { AutoLayout } from './auto-layout';
import { Divider, IconButton, Tooltip } from '@douyinfe/semi-ui';
import { AddNode } from '../add-node';
import { SidebarContext } from '../../context';

const IconUndo = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" style={{ fontSize: '16px' }}>
    <path
      d="m3.276 4.333 2.195-2.195a.667.667 0 0 0-.942-.943L1.195 4.53a.663.663 0 0 0 .003.946l3.33 3.33a.667.667 0 0 0 .943-.943L3.276 5.667h6.39c2.21 0 4 1.457 4 3.666 0 2.21-1.79 3.667-4 3.667H4.334a.667.667 0 1 0 0 1.333h5.334c2.945 0 5.333-2.054 5.333-5 0-2.945-2.388-5-5.333-5h-6.39Z"
      fill="currentColor"
    ></path>
  </svg>
);

const IconRedo = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" style={{ fontSize: '16px' }}>
    <path
      d="m12.724 4.333-2.195-2.195a.667.667 0 0 1 .942-.943l3.334 3.334a.663.663 0 0 1 .135.749.662.662 0 0 1-.138.197l-3.33 3.33a.667.667 0 0 1-.943-.943l2.195-2.195h-6.39c-2.21 0-4 1.457-4 3.666 0 2.21 1.79 3.667 4 3.667h5.333a.667.667 0 1 1 0 1.333H6.333c-2.945 0-5.333-2.054-5.333-5 0-2.945 2.388-5 5.333-5h6.39Z"
      fill="currentColor"
    ></path>
  </svg>
);

export const GraphTools = () => {
  const { history, playground } = useClientContext();
  const { isHistoryMode, showHistoryPanel } = useContext(SidebarContext);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [minimapVisible, setMinimapVisible] = useState(true);

  const { showTestRunPanel } = useContext(SidebarContext);

  useEffect(() => {
    const disposable = history.undoRedoService.onChange(() => {
      setCanUndo(history.canUndo());
      setCanRedo(history.canRedo());
    });
    return () => disposable.dispose();
  }, [history]);
  const refresh = useRefresh();

  useEffect(() => {
    const disposable = playground.config.onReadonlyOrDisabledChange(() => refresh());
    return () => disposable.dispose();
  }, [playground, refresh]);

  const hideReadonly = showTestRunPanel || showHistoryPanel;

  if (playground.config.readonly) {
    return (
      <ToolContainer>
        <ToolSection>
          <Interactive />
          <ZoomSelect />
          <FitView />
          <MinimapSwitch minimapVisible={minimapVisible} setMinimapVisible={setMinimapVisible} />
          <Minimap visible={minimapVisible} />
          {/* 试运行历史版本相关的只读（打开历史面板或已切到历史版本）：不展示 Readonly；
              工具栏切换只读：仍展示 Readonly 用于退出只读 */}
          {!hideReadonly && <Readonly />}
        </ToolSection>
      </ToolContainer>
    );
  }

  return (
    <ToolContainer>
      <ToolSection>
        <Interactive />
        <AutoLayout />
        <SwitchLine />
        <ZoomSelect />
        <FitView />
        <MinimapSwitch minimapVisible={minimapVisible} setMinimapVisible={setMinimapVisible} />
        <Minimap visible={minimapVisible} />
        <Readonly />
        <Comment />
        <Tooltip content="撤回">
          <IconButton
            type="tertiary"
            theme="borderless"
            icon={<IconUndo />}
            disabled={!canUndo || playground.config.readonly}
            onClick={() => history.undo()}
          />
        </Tooltip>
        <Tooltip content="取消撤回">
          <IconButton
            type="tertiary"
            theme="borderless"
            icon={<IconRedo />}
            disabled={!canRedo || playground.config.readonly}
            onClick={() => history.redo()}
          />
        </Tooltip>
        <Divider layout="vertical" style={{ height: '16px' }} margin={3} />
        <AddNode disabled={playground.config.readonly} />
      </ToolSection>
    </ToolContainer>
  );
};
