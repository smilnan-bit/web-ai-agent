import React from 'react';
import { useRecoilState } from 'recoil';
import classNames from 'classnames';
import { useMemoizedFn } from 'ahooks';
import { IconDuigou } from '@/assets/icons';
import { SelectCardState } from '../../model';
import { CardTypeConfig, CardTypeEnum, modulePrefix } from '../../constants';
import './index.less';

const OptionCard: React.FC<{ cardType: CardTypeEnum; disabled?: boolean }> = ({ cardType, disabled = false }) => {
  const [selectCardType, setSelectCardType] = useRecoilState(SelectCardState);
  const isActive = selectCardType === cardType;

  const handleSelectCardType = useMemoizedFn((type: CardTypeEnum) => {
    if (disabled) return;
    setSelectCardType(type);
  });

  return (
    <div
      className={classNames({
        [`${modulePrefix}-optioncard`]: true,
        notuse: cardType === CardTypeEnum.notUse,
        [`${modulePrefix}-optioncard-disable`]: disabled && !isActive,
        isactive: isActive,
      })}
      onClick={() => handleSelectCardType(cardType)}
    >
      {cardType === CardTypeEnum.notUse ? '不使用卡片' : <img src={CardTypeConfig[cardType].optionPic} />}
      {isActive && <IconDuigou className="BindCard-optioncard-icon" size={24} />}
    </div>
  );
};

export default OptionCard;
