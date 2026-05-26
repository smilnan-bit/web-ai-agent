import React from 'react';
import { useForm, useWatch } from '@form/hooks';
import { ToolParamsTypeEnum } from '@/constants';
import { orderCardConfig, productCardConfig } from '@/pages/AppList/components/EditContent/BindCard/constants';
import { Input, Radio } from 'antd';
import { FieldWrapper, FormField, type OutputParamsType } from '@form';
import { type InputParamsType, ParamsFormWithValue } from '@form/input-output';
import { PLACEHOLDER_TEXT } from '@/constants/placeholderText';
import Output from './output';
import FixedButtonSetting from './fixed-btn';
import DynamicButtonSetting from './dynamic-btn';
import CardSetting from './card';
import FormFragment from '../../components/form-fragment';
import FormPrompt from '../../form-components/form-prompt';
import { DialogAnswerTypeEnum } from './type';
import { usePlayground } from '@flowgram.ai/free-layout-editor';

export const DialogAnswerTypeConfig = {
  [DialogAnswerTypeEnum.direct]: '直接回答',
  [DialogAnswerTypeEnum.fixed]: '固定按钮',
  [DialogAnswerTypeEnum.dynamic]: '动态按钮',
  [DialogAnswerTypeEnum.card]: '卡片选择',
};

export enum CardTypeEnum {
  product = 'product',
  order = 'order',
  cotUi = 'cotUi',
}

/** 单个 binding 的取值：可选「输入」或「引用变量」 */
export type CotUiBindingValue = {
  /** 0=input 文本输入; 1=quote 引用工作流变量 */
  valueType?: 0 | 1;
  value?: string;
};

/** a2ui 卡片配置：specId 指向具体卡片，bindings 是 binding 路径到取值的映射 */
export type CotUiCardConfig = {
  specId?: string;
  bindings?: Record<string, CotUiBindingValue>;
  /**
   * 保存时缓存的 spec meta，用于 Dialog 节点同步推导 USER_RESPONSE 子参数、反向路由端口。
   * 用户重新打开 BindCard 弹窗时会刷新为最新 spec 对应的值。
   */
  reportDataKeys?: string[];
  actionNames?: string[];
};

export type CardConfig = {
  cardType: CardTypeEnum;
  product?: Record<string, any>;
  order?: Record<string, any>;
  cotUi?: CotUiCardConfig;
};

export type DialogFormData = {
  inputParam?: InputParamsType[];
  content: string;
  options?: [{ id: string; value: string }];
  outputParam?: OutputParamsType[];
  type: DialogAnswerTypeEnum;
  cardConfig?: CardConfig;
  cardOutputStyle?: number;
};

export const DialogDirectOutputParam = [
  { name: 'USER_RESPONSE', type: ToolParamsTypeEnum.string, desc: '用户回复内容' },
];

export const getDialogOutParamByProductCard = (otherParams: OutputParamsType[]) => [
  {
    name: 'USER_RESPONSE',
    type: ToolParamsTypeEnum.object,
    desc: '用户回复内容',
    subParams: [...productCardConfig.ui, ...productCardConfig.other, ...(otherParams || [])],
  },
];

export const getDialogOutParamByOrderCard = (otherParams: OutputParamsType[]) => [
  {
    name: 'USER_RESPONSE',
    type: ToolParamsTypeEnum.object,
    desc: '用户回复内容',
    subParams: [
      ...orderCardConfig.ui.flatMap((item) => item.filter((field) => !field.noDialogueOutput)),
      ...orderCardConfig.product,
      ...orderCardConfig.other,
      ...(otherParams || []),
    ],
  },
];

/**
 * cotUi 卡片的 USER_RESPONSE 结构：
 * - actionName：用户点击的按钮 action.name（用于 Dialog 分支路由）
 * - actionType：navigate | emit | submit
 * - 其余字段 = spec 中每个 input/select/buttonGroup 的上报 key（来自 SpecMeta.reportDataKeys）
 *
 * 本函数只组装形状，具体 reportDataKeys 由调用方通过异步取回的 spec meta 注入。
 */
export const getDialogOutParamByCotUiCard = (reportDataKeys: string[]) => [
  {
    name: 'USER_RESPONSE',
    type: ToolParamsTypeEnum.object,
    desc: '用户回复内容',
    subParams: reportDataKeys.map((key) => ({ name: key, type: ToolParamsTypeEnum.string })),
  },
];

const FormContent = () => {
  const playground = usePlayground();
  const readonly = playground?.config?.readonly ?? false;
  const typeValue = useWatch<DialogAnswerTypeEnum>('type');
  let renderSetting: React.ReactNode | null = null;
  if (typeValue === DialogAnswerTypeEnum.fixed) {
    renderSetting = <FixedButtonSetting />;
  } else if (typeValue === DialogAnswerTypeEnum.dynamic) {
    renderSetting = <DynamicButtonSetting />;
  } else if (typeValue === DialogAnswerTypeEnum.card) {
    renderSetting = <CardSetting />;
  }

  return (
    <>
      <ParamsFormWithValue desc="回复内容中可引用的变量" />
      {/* 对话节点卡片时需分开设置 */}
      <FormFragment title="提问内容" required disableWhenReadonly={typeValue !== DialogAnswerTypeEnum.card}>
        <div tw="pt-4 flex flex-col gap-4">
          {/* 内容区域 */}
          <FormPrompt />
          <FieldWrapper name="type" title="回答类型">
            <Radio.Group
              options={Object.entries(DialogAnswerTypeConfig).map(([value, label]) => ({
                value: Number(value),
                label,
              }))}
              disabled={readonly}
            />
          </FieldWrapper>
          {renderSetting}
        </div>
      </FormFragment>
      <Output type={typeValue} />
    </>
  );
};

export default FormContent;
