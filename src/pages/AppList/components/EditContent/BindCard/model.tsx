import { atom } from 'recoil';
import { CardTypeEnum } from './constants';

export const SelectCardState = atom<CardTypeEnum>({
  key: 'selectCardState',
  default: CardTypeEnum.notUse,
});

/**
 * 当前选中的 a2ui 卡片 specId。
 * 仅当 SelectCardState === CardTypeEnum.cotUi 时有意义，用于驱动：
 * - SelectType 中 a2ui 卡片列表的高亮
 * - 中栏 CotUiDataSource 按 specId 拉 spec meta
 * - 右栏 Preview 渲染 SpecPreview
 */
export const SelectedCotUiSpecIdState = atom<string | undefined>({
  key: 'selectedCotUiSpecIdState',
  default: undefined,
});
