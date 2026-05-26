import { atom } from 'recoil';
import type { ToolNS } from '@/types/Tools';

export const CurrentToolState = atom<Partial<ToolNS.ToolType>>({
  key: 'currentToolState',
  default: null,
});

export const CurrentToolStepState = atom<number>({
  key: 'currentToolStepState',
  default: 0,
});

export const CurrentDebugState = atom<{ params: Record<string, any>; debugRes: ToolNS.ToolDebugResType }>({
  key: 'currentDebugState',
  default: null,
});
