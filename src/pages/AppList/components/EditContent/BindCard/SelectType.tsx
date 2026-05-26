import React, { useEffect } from 'react';
import { useRequest } from 'ahooks';
import { getCardList } from '@/api/card';
import type { CardItem } from '@/api/card';
import './index.less';
import { CardModeEnum, CardTypeConfig, CardTypeEnum, DialogueCardTypeConfig, modulePrefix } from './constants';
import OptionCard from './components/OptionCard';
import CotUiOptionCard from './components/CotUiOptionCard';

const COTUI_PAGE_SIZE = 50;

const SelectType: React.FC<{ mode?: CardModeEnum; disabled?: boolean }> = ({
  mode = CardModeEnum.bind,
  disabled = false,
}) => {
  const isInWorkflow = [CardModeEnum.dialogue, CardModeEnum.reply].includes(mode);
  const { data: cotUiList = [], run: loadCotUiList } = useRequest<CardItem[], []>(
    async () => {
      const res = await getCardList({ pageNo: 1, pageSize: COTUI_PAGE_SIZE });
      return res?.data?.list ?? [];
    },
    { manual: true },
  );

  useEffect(() => {
    loadCotUiList();
  }, [loadCotUiList]);

  return (
    <div className={`${modulePrefix}-selecttype ${isInWorkflow ? 'inworkflow' : ''}`}>
      {mode === CardModeEnum.bind && <OptionCard cardType={CardTypeEnum.notUse} />}
      <div style={{ marginTop: 24, marginBottom: 16 }} className={`${modulePrefix}-title`}>
        选择卡片样式
      </div>
      <div className={`${modulePrefix}-selecttype-list ${isInWorkflow ? 'inworkflow' : ''}`}>
        {Object.entries(mode === CardModeEnum.dialogue ? DialogueCardTypeConfig : CardTypeConfig).map(([key]) => (
          <OptionCard cardType={key as CardTypeEnum} key={key} disabled={disabled} />
        ))}
        {cotUiList.length > 0 && (
          <>
            <div className={`${modulePrefix}-selecttype-subtitle`}>a2ui 卡片</div>
            {cotUiList.map((card) => (
              <CotUiOptionCard key={card.id} card={card} disabled={disabled} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default SelectType;
