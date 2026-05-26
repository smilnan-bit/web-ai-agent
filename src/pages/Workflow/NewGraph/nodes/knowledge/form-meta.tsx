import type { FormMeta } from '@flowgram.ai/free-layout-editor';
import { defaultFormMeta, generateEffects } from '../default-form-meta';
import React from 'react';
import { KnowledgeContent } from './node-content';
import FormContent from './form';
import { FormContain, genInputParamValidate } from '../../form-components';

export const renderForm = () => {
  return <FormContain node={<KnowledgeContent />} sideNode={<FormContent />} />;
};

export const formMeta: FormMeta = {
  ...defaultFormMeta,
  render: renderForm,
  effect: generateEffects(),
  validate: {
    ...defaultFormMeta.validate,
    ...genInputParamValidate(),
    knowledge: ({ value }) => {
      // 判断长度不能为空
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return '知识库不能为空';
      }
      return undefined;
    },
  },
};
