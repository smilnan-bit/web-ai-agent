import type { LibraryType } from './type';

export const LibraryConfig: Record<LibraryType, { nameKey: string; idKey: string }> = {
  tool: {
    nameKey: 'name',
    idKey: 'toolId',
  },
  workflow: {
    nameKey: 'workflowName',
    idKey: 'workflowId',
  },
  knowledge: {
    nameKey: 'spaceName',
    idKey: 'spaceId',
  },
};
