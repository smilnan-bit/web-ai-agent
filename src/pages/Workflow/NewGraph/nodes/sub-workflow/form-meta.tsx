import type { FormMeta } from '@flowgram.ai/free-layout-editor';
import React from 'react';
import { defaultFormMeta, generateEffects } from '../default-form-meta';
import { FormContain, genInputParamValidate } from '../../form-components';
import { SubWorkflowContent } from './node-content';
import SubWorkflowForm from './form';

export const renderForm = () => {
  return <FormContain node={<SubWorkflowContent />} sideNode={<SubWorkflowForm />} />;
};

export const formMeta: FormMeta = {
  ...defaultFormMeta,
  render: renderForm,
  effect: generateEffects(),
  validate: {
    ...defaultFormMeta.validate,
    ...genInputParamValidate({ canEmpty: true, checkInputValueType: true }),
    refWorkflowId: ({ value }) => {
      if (!value) {
        return '请选择子工作流';
      }
      return undefined;
    },
  },
};
