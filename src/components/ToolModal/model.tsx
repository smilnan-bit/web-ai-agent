import { atom } from 'recoil';
import type { ToolNS } from '@/types/Tools';

// 当前选择的工具
export const SelectToolBoxState = atom<ToolNS.ToolBoxDetailType | null>({
  key: 'selectToolBoxState',
  default: null,
});
