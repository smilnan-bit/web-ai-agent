import { Radio } from 'antd';
import React, { useState } from 'react';
import { FieldWrapper, useForm, useWatch } from '../../form-components';
import BindCard from '@/pages/AppList/components/EditContent/BindCard';
import {
  type CardModeEnum,
  CardTypeConfig,
  CardTypeEnum,
} from '@/pages/AppList/components/EditContent/BindCard/constants';
import { usePlayground } from '@flowgram.ai/free-layout-editor';

export type CardConfig = {
  cardType: CardTypeEnum;
  product?: Record<string, any>;
  order?: Record<string, any>;
};

const DEFAULT_CARD_CONFIG = [
  {
    label: '样式一',
    img: 'https://res.qiyukf.net/storage/ed5b29ce-fb9b-4910-b758-82b9167cb9b6.png',
    value: 0,
  },
  {
    label: '样式二',
    img: 'https://res.qiyukf.net/storage/ee478ef5-c781-4e9e-849f-6aef28c4c6b3.png',
    value: 1,
  },
  {
    label: '样式三',
    img: 'https://res.qiyukf.net/storage/bf447bd8-18a6-48d9-818b-b8cf8f10e7f2.png',
    value: 2,
  },
  {
    label: '样式四',
    img: 'https://res.qiyukf.net/storage/fa635c7f-dd13-405a-bed7-82e541a2400f.png',
    value: 3,
  },
];

export const CardSetting = ({ mode }: { mode: CardModeEnum }) => {
  const form = useForm();
  const [showBindCard, setShowBindCard] = useState(false);
  const playground = usePlayground();
  const readonly = playground?.config?.readonly ?? false;
  const onBindCard = (cardConfig) => {
    // 处理绑定卡片逻辑
    console.log('绑定卡片配置:', cardConfig);
    form.setFieldValue('cardConfig', cardConfig);
    setShowBindCard(false);
  };
  const cardType = useWatch<CardTypeEnum>('cardConfig.cardType');
  const showCardPreImg = cardType ? CardTypeConfig[cardType]?.optionPic : undefined;
  const cardConfig = useWatch<CardConfig>('cardConfig');
  // cotUi 类型卡片展示形态由访客端自行决定，Dialog 节点不再提供「输出样式」配置
  const isCotUi = cardType === CardTypeEnum.cotUi;
  return (
    <>
      {!isCotUi && (
        <FieldWrapper
          name="cardOutputStyle"
          title="输出样式"
          desc="注意，该功能对“卡片样式=横向列表”以及“卡片展示方式=底部弹窗”不生效。即“卡片样式=横向列表”，或者“卡片展示方式=底部弹窗”时，不论选择哪种输出样式，都会按照默认样式输出"
        >
          <Radio.Group disabled={readonly}>
            {(DEFAULT_CARD_CONFIG || []).map((item) => (
              <Radio value={item.value} key={item.value} style={{ marginRight: 0 }}>
                <>
                  <div>{item?.label}</div>
                  <div tw={'ml-[-24px] mt-[4px] w-[96px]'}>
                    <img src={item?.img} tw={'w-full'} draggable={false} />
                  </div>
                </>
              </Radio>
            ))}
          </Radio.Group>
        </FieldWrapper>
      )}
      <FieldWrapper name="cardConfig" title="编辑卡片">
        {showCardPreImg ? (
          <div
            onClick={() => setShowBindCard(true)}
            tw="cursor-pointer inline-block p-[8px] bg-[#F3F3F6] w-[326px] border-[1px] border-solid border-[#0000000F] rounded-[4px]"
          >
            <div tw={'w-full relative bg-[#fff] rounded-[6px]'}>
              <img src={showCardPreImg} tw={'w-full opacity-[30%]'} />
              <span
                tw={'absolute left-[50%] top-[50%] text-[14px] text-[#337EFF] font-medium'}
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                点击编辑
              </span>
            </div>
          </div>
        ) : isCotUi ? (
          <div
            onClick={() => setShowBindCard(true)}
            tw="cursor-pointer inline-block p-[8px] bg-[#F3F3F6] w-[326px] border-[1px] border-solid border-[#0000000F] rounded-[4px]"
          >
            <div tw={'w-full text-center py-[24px] bg-[#fff] rounded-[6px] text-[14px] text-[#337EFF] font-medium'}>
              已选择 a2ui 卡片，点击重新编辑
            </div>
          </div>
        ) : (
          <div
            onClick={() => {
              setShowBindCard(true);
            }}
            style={{
              color: '#337EFF',
              cursor: 'pointer',
            }}
          >
            + 配置卡片内容
          </div>
        )}
      </FieldWrapper>
      {showBindCard && (
        <BindCard
          readonly={readonly}
          responseParams={[]}
          onOk={onBindCard}
          onCancel={() => {
            setShowBindCard(false);
          }}
          open={showBindCard}
          mode={mode}
          initData={cardConfig || { cardType: CardTypeEnum.product }}
        />
      )}
    </>
  );
};

export default CardSetting;
