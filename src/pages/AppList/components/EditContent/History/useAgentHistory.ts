import { useRecoilState } from 'recoil';
import { AgentHistoryState, CurrentAppState } from '@/model';
import type { AgentHistoryNS } from '@/types/AgentHistpry';

interface UseAgentHistoryState extends AgentHistoryNS.AgentHistoryState {
  setCurrentHistory: (history: AgentHistoryNS.AgentHistoryState['currentHistory']) => void;
  setIsHistoryMode: (isHistoryMode: boolean) => void;
  loading?: boolean;
  clearHistory: () => void;
  setHistoryLoading: (isLoading: boolean) => void;
  recoverToVersion: (version: AgentHistoryNS.AgentHistoryState['currentHistory']) => void;
}

const useAgentHistory = (): UseAgentHistoryState => {
  const [currentHistory, setCurrentHistory] = useRecoilState(AgentHistoryState);
  const [currentApp, setCurrentApp] = useRecoilState(CurrentAppState);

  return {
    // 是否处于历史记录状态
    isHistoryMode: currentHistory.isHistoryMode,
    // 当前选中的历史记录
    currentHistory: currentHistory.currentHistory,
    // 当前草稿状态
    lastDraft: currentHistory.lastDraft,
    // 是否正在加载历史记录
    loading: currentHistory.loading,
    // 更新当前历史记录
    setCurrentHistory: (history) => {
      setCurrentHistory((prev) => ({ ...prev, currentHistory: history }));
    },
    // 设置是否处于历史记录模式
    setIsHistoryMode: (isHistoryMode) => {
      const params: {
        isHistoryMode: boolean;
        currentHistory: AgentHistoryNS.AgentHistoryState['currentHistory'];
        lastDraft?: AgentHistoryNS.AgentHistoryState['currentHistory'] | null;
      } = {
        isHistoryMode,
        currentHistory: isHistoryMode ? currentApp : null,
        lastDraft: isHistoryMode ? currentApp : null,
      };
      if (!isHistoryMode) {
        // 如果进入历史记录模式，当前的草稿状态将被保存为最新历史记录
        setCurrentApp(currentHistory?.lastDraft);
        Promise.resolve().then(() => {
          setCurrentHistory((prev) => ({ ...prev, ...params }));
        });
      } else {
        // 如果退出历史记录模式，清除当前历史记录
        setCurrentHistory((prev) => ({ ...prev, ...params }));
      }
    },
    // 退出历史记录模式并清除当前历史记录
    clearHistory: () => {
      setCurrentHistory({ isHistoryMode: false, currentHistory: null, lastDraft: null, loading: false });
    },
    setHistoryLoading: (isLoading: boolean) => setCurrentHistory((prev) => ({ ...prev, loading: isLoading })),
    // 恢复到指定版本后，需要把当前版本内容设置为草稿内容
    recoverToVersion: (version: AgentHistoryNS.AgentHistoryState['currentHistory']) => {
      setCurrentApp(version);
      setCurrentHistory((prev) => ({
        ...prev,
        lastDraft: version,
        currentHistory: version,
      }));
    },
  };
};

export default useAgentHistory;
