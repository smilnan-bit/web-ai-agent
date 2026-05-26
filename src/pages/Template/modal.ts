import { atom } from 'recoil';

type AuthType = 'none' | 'qiyu' | 'service' | 'qiyu_bot';
interface AgentItem {
  appId: number;
  appName: string;
  appDesc: string;
  logoUrl: string;
  allowCopy: boolean;
  templateTagList: string[];
  sampleQueries: string;
  templateAccessUrl: string;
  knowledgeNameList?: string[];
  toolboxList?: [
    {
      name: string;
      authType: AuthType;
    },
  ];
}
// 当前Agent应用
export const currentTemplateAgentState = atom<AgentItem>({
  key: 'currentTemplateAgentState',
});
