import type { FormMeta } from '@flowgram.ai/free-layout-editor';
import { defaultFormMeta, generateEffects } from '../default-form-meta';
import React from 'react';
import { LLMContent } from './node-content';
import FormContent from './form';
import { FormContain, genInputParamValidate } from '../../form-components';
import { generateParamsFormValidateFields } from '../../form-components/input-output/form';
import { MAX_CONTENT_LENGTH } from '../../constants';

export const renderForm = () => {
  return <FormContain node={<LLMContent />} sideNode={<FormContent />} />;
};

export const formMeta: FormMeta = {
  ...defaultFormMeta,
  render: renderForm,
  effect: generateEffects(),
  validate: {
    ...defaultFormMeta.validate,
    ...genInputParamValidate({ canEmpty: true }),
    ...generateParamsFormValidateFields(),
    temperature: ({ value }) => {
      if (value === undefined || value === '' || value === null) {
        return '请输入';
      }
      return undefined;
    },
    tipWord: ({ value }) => {
      if (!value) {
        return '请填写提示词';
      }
      if (value?.length > MAX_CONTENT_LENGTH) {
        return `最大长度${MAX_CONTENT_LENGTH}字符`;
      }
      return undefined;
    },
  },
};
