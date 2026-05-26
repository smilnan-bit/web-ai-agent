import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useRecoilState } from 'recoil';
import { useMemoizedFn } from 'ahooks';
import { IconDuigou } from '@/assets/icons';
import SpecPreview from '@/pages/CardEditor/components/SpecPreview';
import { defaultRuntimeData } from '@/pages/CardEditor/utils/runtime-data';
import type { PreviewSpec } from '@/pages/CardEditor/types';
import type { CardItem } from '@/api/card';
import { CardTypeEnum, modulePrefix } from '../../constants';
import { SelectCardState, SelectedCotUiSpecIdState } from '../../model';
import './index.less';

interface Props {
  card: CardItem;
  disabled?: boolean;
}

/**
 * a2ui 卡片专用 OptionCard。只展示卡片完整预览，不展示卡片名称；
 * 选中/悬停态通过传 rootOutlineColor 给 SpecPreview，让 spec 的根节点卡片自己长边框，
 * 外层 wrapper 不再加 border（避免两层边框）。
 */
const CotUiOptionCard: React.FC<Props> = ({ card, disabled = false }) => {
  const [selectCardType, setSelectCardType] = useRecoilState(SelectCardState);
  const [selectedSpecId, setSelectedSpecId] = useRecoilState(SelectedCotUiSpecIdState);
  const [hover, setHover] = useState(false);
  const isActive = selectCardType === CardTypeEnum.cotUi && selectedSpecId === card.id;

  const outlineColor = disabled ? undefined : isActive ? '#337eff' : hover ? '#337eff4d' : undefined;

  const spec = useMemo<PreviewSpec | null>(() => {
    try {
      return card.uiJson ? (JSON.parse(card.uiJson) as PreviewSpec) : null;
    } catch {
      return null;
    }
  }, [card.uiJson]);

  const handleSelect = useMemoizedFn(() => {
    if (disabled) return;
    setSelectCardType(CardTypeEnum.cotUi);
    setSelectedSpecId(card.id);
  });

  return (
    <div
      className={classNames({
        [`${modulePrefix}-cotui-optioncard`]: true,
        [`${modulePrefix}-optioncard-disable`]: disabled && !isActive,
        isactive: isActive,
      })}
      onClick={handleSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={card.specName}
    >
      <div className={`${modulePrefix}-cotui-optioncard-preview`}>
        {spec ? (
          <SpecPreview spec={spec} runtimeData={defaultRuntimeData} fitContainer rootOutlineColor={outlineColor} />
        ) : (
          <div className={`${modulePrefix}-cotui-optioncard-fallback`}>{card.specName}</div>
        )}
      </div>
      {isActive && <IconDuigou className="BindCard-optioncard-icon" size={24} />}
    </div>
  );
};

export default CotUiOptionCard;
