export type ILibraryList = { type: LibraryType; list: any[] };
export type LibraryType = 'tool' | 'workflow' | 'knowledge';

export type LibraryStatus = 'disabled' | 'existing' | 'outdated';

export interface LibraryBlockInfo extends Record<string, any> {
  icon: string;
  type: LibraryType;
  id: string;
  uuid: string;
}
