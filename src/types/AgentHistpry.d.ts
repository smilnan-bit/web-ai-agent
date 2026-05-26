import type { AppsNS } from '@/types/Apps';

// biome-ignore lint/style/noNamespace: <explanation>
declare namespace AgentHistoryNS {
  export interface AgentHistoryDetail extends AppsNS.AppDetailType {}

  export interface AgentHistoryList {
    appId: number;
    versionList: {
      versionId: number;
      operator: string;
      operateTime: number;
    }[];
  }

  type OperationStringKey = 'promptInfo' | 'modelInfo' | 'settingInfo' | 'answerTipsInfo';
  type OperationArrayKey = 'toolInfoList' | 'knowledgeInfoList' | 'workflowInfoList';
  interface OperationDetail {
    operator: string;
    operateTime: number;
    description: string;
  }
  export interface AgentPublishDetail {
    appId?: number;
    [key: OperationStringKey]: OperationDetail;
    [key: OperationArrayKey]: OperationDetail[];
  }
  export interface AgentHistoryState {
    // 是否处于历史记录状态
    isHistoryMode: boolean;
    // 当前选中的历史记录
    currentHistory: AppsNS.AppDetailType | null;
    // 最后一次草稿状态
    lastDraft?: AppsNS.AppDetailType | null;
    // 是否正在加载历史记录
    loading?: boolean;
  }
}
