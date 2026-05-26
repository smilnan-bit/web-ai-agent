import { atom } from 'recoil';
import type { AppsNS } from '@/types/Apps';
import type { ToolNS } from '@/types/Tools';
import type { AgentHistoryNS } from '@/types/AgentHistpry';

// 当前Agent应用
export const CurrentAppState = atom<AppsNS.AppDetailType>({
  key: 'currentAppState',
  default: undefined,
});

// 全局输入框长度限制等
export const GlobalConfigState = atom<basicNS.GlobalConfigType & { notifyDownloadCenter?: () => Promise<void> }>({
  key: 'GlobalConfigState',
  default: undefined,
});

export const CurrentToolBoxState = atom<ToolNS.ToolBoxDetailType>({
  key: 'currentToolBoxState',
  default: undefined,
});

export const AgentHistoryState = atom<AgentHistoryNS.AgentHistoryState>({
  key: 'AgentHistoryState',
  default: {
    isHistoryMode: false,
    currentHistory: null,
    lastDraft: null,
    loading: false,
  },
});
