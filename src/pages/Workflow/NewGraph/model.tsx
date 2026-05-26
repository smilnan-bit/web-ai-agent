import { atom } from 'recoil';
import type { WorkflowNS } from '@/types/Workflow';
import type { IMsg } from '@ysf/ai-chat/es/type';

export const BasicInfoState = atom<(WorkflowNS.WorkflowType & { hasSaved: boolean }) | null>({
  key: 'BasicInfoState',
  default: null,
});

export const ProblemPanelShowState = atom<boolean>({
  key: 'ProblemPanelShowState',
  default: false,
});

export const TestRunDataState = atom<{ loading: boolean; list: IMsg[] }>({
  key: 'TestRunDataState',
  default: { loading: false, list: [] },
});
