import type { TemplateParser } from '../TemplateParser';
import type { LibraryBlockInfo, ILibraryList, LibraryType } from '../type';
import { merge } from 'lodash-es';
import type { AppsNS } from '@/types/Apps';
import { LibraryConfig } from '../utils';

const defaultLibraryBlockInfo: Record<
  LibraryType,
  {
    icon: string;
  }
> = {
  tool: {
    icon: 'https://res.qiyukf.net/storage/dfe6b3d1-ff40-4df8-b5f8-878457b9f424.png',
  },
  workflow: {
    icon: 'https://res.qiyukf.net/storage/48ca6262-c880-4ab4-8e29-791de8e050e0.png',
  },
  knowledge: {
    icon: 'https://res.qiyukf.net/storage/7e32c15b-811b-4e6f-80b2-119352a03345.png',
  },
};

export const getLibraryInfoByBlockInfo = ({
  librarys,
  blockInfo,
}: {
  librarys: ILibraryList[];
  blockInfo: LibraryBlockInfo;
}): AppsNS.ILibraryItem | null => {
  if (!blockInfo) {
    return null;
  }
  const libraryTypeList = librarys.find((item) => item.type === blockInfo.type)?.list;
  return libraryTypeList?.find((item) => `${item[LibraryConfig[blockInfo.type].idKey]}` === `${blockInfo.id}`) ?? null;
};

// Get the corresponding information according to the resource type
export const getLibraryBlockInfoFromTemplate = (props: {
  template: string;
  templateParser: TemplateParser;
}): LibraryBlockInfo | null => {
  const { template, templateParser } = props;
  const data = templateParser.getData(template);
  if (!data) {
    return null;
  }
  const { type, ...rest } = data as LibraryBlockInfo;
  const libraryBlockInfo = merge({}, defaultLibraryBlockInfo[type], {
    type,
    ...rest,
  });
  return libraryBlockInfo;
};
export type LibraryStatus = 'disabled' | 'existing' | 'outdated';

export const getLibraryStatus = ({
  librarys,
  blockInfo,
}: { librarys: ILibraryList[]; blockInfo: LibraryBlockInfo }): LibraryStatus => {
  if (!blockInfo) {
    return 'disabled';
  }
  const library = getLibraryInfoByBlockInfo({ librarys, blockInfo });
  return library ? 'existing' : 'disabled';
};
