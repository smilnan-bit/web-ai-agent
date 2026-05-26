/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useMemo } from 'react';

import { SidebarContext } from '../../context';

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [nodeId, setNodeId] = useState<string | undefined>();
  const [showLeftPanel, setShowLeftPanel] = useState<boolean>(false);
  const [showTestRunPanel, setShowTestRunPanel] = useState<boolean>(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState<boolean>(false);
  const [isHistoryMode, setIsHistoryMode] = useState<boolean>(false);
  const [currentVersion, setCurrentVersion] = useState<number | undefined>();

  const contextValue = useMemo(
    () => ({
      visible: !!nodeId,
      nodeId,
      setNodeId,
      isNewGraph: true,
      showLeftPanel,
      setShowLeftPanel,
      showTestRunPanel,
      setShowTestRunPanel,
      showHistoryPanel,
      setShowHistoryPanel,
      isHistoryMode,
      setIsHistoryMode,
      currentVersion,
      setCurrentVersion,
    }),
    [nodeId, showLeftPanel, showTestRunPanel, showHistoryPanel, isHistoryMode, currentVersion],
  );
  return <SidebarContext.Provider value={contextValue}>{children}</SidebarContext.Provider>;
}
