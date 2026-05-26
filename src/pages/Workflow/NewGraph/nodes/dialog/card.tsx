import React from 'react';
import OutCardSetting from '../../form-components/form-card-setting';
import { Other } from './other';
import { CardModeEnum } from '@/pages/AppList/components/EditContent/BindCard/constants';

export const CardSetting = () => {
  return (
    <>
      <OutCardSetting mode={CardModeEnum.dialogue} />
      <Other />
    </>
  );
};

export default CardSetting;
