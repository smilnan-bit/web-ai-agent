import type { FormMeta } from '@flowgram.ai/free-layout-editor';
import { defaultFormMeta, generateEffects } from '../default-form-meta';
import React from 'react';
import { TextContent } from './node-content';
import { FormContain } from '../../form-components';
import FormContent, { TextProcessTypeEnum, type TextFormData } from './form';
import { genInputParamValidate } from '../../form-components/input-output';
import { ToolParamsTypeEnum } from '@/constants';
import { MAX_CONTENT_LENGTH } from '../../constants';

export const renderForm = () => {
  return <FormContain node={<TextContent />} sideNode={<FormContent />} />;
};

export const formMeta: FormMeta = {
  ...defaultFormMeta,
  render: renderForm,
  effect: generateEffects(),
  validate: {
    ...defaultFormMeta.validate,
    // 校验分隔符
    delimiters: ({ value: setterValue, formValues }) => {
      // 只有分割模式才校验分隔符
      if (formValues?.method === TextProcessTypeEnum.concat) {
        return undefined;
      }
      // 检查分隔符是否为空
      if (setterValue === undefined || (Array.isArray(setterValue) && setterValue.length === 0)) {
        return '分隔符不能为空';
      }
      return undefined;
    },
    concatResult: ({ value: setterValue, formValues }) => {
      if (formValues?.method === TextProcessTypeEnum.split) {
        return undefined;
      }
      if (setterValue === undefined || (setterValue as string).trim() === '') {
        return '字符串拼接不能为空';
      }
      if (setterValue?.length > MAX_CONTENT_LENGTH) {
        return `最大长度${MAX_CONTENT_LENGTH}字符`;
      }
      return undefined;
    },
    ...genInputParamValidate<TextFormData>({
      checkType: ({ sourceType, formValues }) => {
        if (formValues?.method === TextProcessTypeEnum.split) {
          if (sourceType !== ToolParamsTypeEnum.string) {
            return false;
          }
        }
        return true;
      },
    }),
  },
};
