import type { FormMeta } from '@flowgram.ai/free-layout-editor';
import React from 'react';
import { EndContent } from './node-content';
import { FormContain, genInputParamValidate } from '../../form-components';
import { defaultFormMeta, generateEffects } from '../default-form-meta';
import { trimPattern } from '@/constants';
import type { EndFormData } from './form';
import FormContent, { EndOutputTypeEnum } from './form';
import { MAX_CONTENT_LENGTH } from '../../constants';

export const renderForm = () => {
  return <FormContain node={<EndContent />} sideNode={<FormContent />} />;
};

export const formMeta: FormMeta = {
  ...defaultFormMeta,
  render: renderForm,
  effect: generateEffects({ outputReplaceInput: true }),
  validate: {
    ...defaultFormMeta.validate,
    ...genInputParamValidate<EndFormData>({
      inputName: 'outputParam',
      skipCheck: (formValues) => {
        if (formValues.returnType === EndOutputTypeEnum.silence) {
          return true;
        }
        return false;
      },
    }),
    content: ({ value: setterValue, formValues }) => {
      // 只有在返回文本模式时才校验 content 字段
      if (formValues?.returnType !== EndOutputTypeEnum.text) {
        return undefined;
      }

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
  },
};
