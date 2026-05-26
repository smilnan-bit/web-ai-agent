import React from 'react';

export const SidebarContext = React.createContext<{
  visible: boolean;
  nodeId?: string;
  setNodeId: (node: string | undefined) => void;
  isNewGraph: boolean;
  showLeftPanel: boolean;
  setShowLeftPanel: (show: boolean) => void;
  showTestRunPanel: boolean;
  setShowTestRunPanel: (show: boolean) => void;
  showHistoryPanel: boolean;
  setShowHistoryPanel: (show: boolean) => void;
  isHistoryMode: boolean;
  setIsHistoryMode: (isHistoryMode: boolean) => void;
  currentVersion?: number;
  setCurrentVersion: (version: number | undefined) => void;
}>({
  visible: false,
  setNodeId: () => {},
  isNewGraph: false,
  showLeftPanel: false,
  setShowLeftPanel: () => {},
  showTestRunPanel: false,
  setShowTestRunPanel: () => {},
  showHistoryPanel: false,
  setShowHistoryPanel: () => {},
  isHistoryMode: false,
  setIsHistoryMode: () => {},
  currentVersion: undefined,
  setCurrentVersion: () => {},
});

export const IsSidebarContext = React.createContext<boolean>(false);
