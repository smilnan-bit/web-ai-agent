import type { FormMeta } from '@flowgram.ai/free-layout-editor';
import { defaultFormMeta, generateEffects } from '../default-form-meta';
import React from 'react';
import { ReplyContent } from './node-content';
import { FormContain, genInputParamValidate } from '../../form-components';
import { httpsUrlPattern, trimPattern } from '@/constants';
import FormContent, { FormReplyTypeEnum } from './form';
import { MAX_CONTENT_LENGTH } from '../../constants';
import { autoChangeRefEffect } from '../../effects/autoChangeRefEffect';

export const renderForm = () => {
  return <FormContain node={<ReplyContent />} sideNode={<FormContent />} />;
};

export const formMeta: FormMeta = {
  ...defaultFormMeta,
  render: renderForm,
  effect: generateEffects({
    outputReplaceInput: true,
    customEffect: {
      'cardConfig.product.*': autoChangeRefEffect({ isSingleParam: true }),
      'cardConfig.order.*': autoChangeRefEffect({ isSingleParam: true }),
      'cardConfig.flow.*': autoChangeRefEffect({ isSingleParam: true }),
      'cardConfig.button.*': autoChangeRefEffect({ isSingleParam: true }),
      'cardConfig.image.*': autoChangeRefEffect({ isSingleParam: true }),
      'cardConfig.*.customParams.*.value': autoChangeRefEffect({ isSingleParam: true }),
    },
  }),
  validate: {
    ...defaultFormMeta.validate,
    ...genInputParamValidate({ canEmpty: true, inputName: 'outputParam' }),
    content: ({ value: setterValue, formValues }) => {
      // 必填校验
      if (setterValue === undefined || setterValue === null || setterValue === '') {
        return '请输入回复内容';
      }

      // trimPattern 校验：不能以空格开头和结尾
      if (typeof setterValue === 'string' && !trimPattern.test(setterValue)) {
        return '不能以空格开头和结尾';
      }
      if (setterValue?.length > MAX_CONTENT_LENGTH) {
        return `最大长度${MAX_CONTENT_LENGTH}字符`;
      }
      return undefined;
    },
    'cardParam.url': ({ value: setterValue, formValues }) => {
      if (formValues?.type !== FormReplyTypeEnum.customPage) {
        return undefined;
      }
      if (setterValue === undefined || setterValue === null || setterValue === '') {
        return '请输入URL';
      }
      if (!httpsUrlPattern.test(setterValue)) {
        return '请输入https开头的URL';
      }
      return undefined;
    },
    'cardParam.params.*.key': ({ value: setterValue, formValues }) => {
      if (formValues?.type !== FormReplyTypeEnum.customPage) {
        return undefined;
      }
      if (!setterValue) {
        return '请选择变量';
      }
      return undefined;
    },
    cardConfig: ({ value: cardConfig, formValues }) => {
      if (formValues.type === FormReplyTypeEnum.card && !cardConfig) {
        return '请配置卡片内容';
      }
      return undefined;
    },
  },
  formatOnInit: (value, ctx) => {
    return {
      ...value,
      type: value.type === undefined ? FormReplyTypeEnum.text : value.type, //兼容老逻辑不设值
    };
  },
};
