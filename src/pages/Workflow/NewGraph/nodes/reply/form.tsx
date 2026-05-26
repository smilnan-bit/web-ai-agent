import React from 'react';
import type { InputParamsType } from '@form';
import { ParamsFormWithValue } from '@form';
import { ReplyContent } from './content';
import type { CardTypeEnum } from '@/pages/AppList/components/EditContent/BindCard/constants';

export enum FormReplyTypeEnum {
  text = 0,
  customPage = 1,
  card = 2,
}

export const FormReplyTypeConfig = {
  [FormReplyTypeEnum.text]: { label: '文本', sort: 1 },
  [FormReplyTypeEnum.customPage]: { label: '自定义页面', sort: 3 },
  [FormReplyTypeEnum.card]: { label: '卡片', sort: 2 },
};

export const FormReplyTypeTipImage = 'https://res.qiyukf.net/storage/6896dcc7-3a9c-45cd-b2c8-4484d8ad1936.png';

export type CardConfig = {
  cardType: CardTypeEnum;
  product?: Record<string, any>;
  order?: Record<string, any>;
  flow?: Record<string, any>;
  button?: Record<string, any>;
  image?: Record<string, any>;
};

export type ReplyFormData = {
  type: FormReplyTypeEnum;
  content: string;
  outputParam?: InputParamsType[];
  cardParam?: {
    directPopup: number;
    params: [];
    url: string;
  };
  cardOutputStyle?: number; // 卡片样式
  cardConfig?: CardConfig;
};

const FormContent = () => {
  return (
    <>
      <ParamsFormWithValue name="outputParam" />
      <ReplyContent />
    </>
  );
};

export default FormContent;
