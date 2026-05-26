import type { FormMeta } from '@flowgram.ai/free-layout-editor';
import React from 'react';
import { ToolContent } from './node-content';
import { FormContain, genInputParamValidate } from '../../form-components';
import { defaultFormMeta, generateEffects } from '../default-form-meta';
import FormContent from './form';

export const renderForm = () => {
  return <FormContain node={<ToolContent />} sideNode={<FormContent />} />;
};

export const formMeta: FormMeta = {
  ...defaultFormMeta,
  render: renderForm,
  validate: ({ isTemplateTool }) => {
    return {
      ...defaultFormMeta.validate,
      ...genInputParamValidate({
        canEmpty: true,
        checkRequired: true,
        noCheckName: isTemplateTool,
        checkInputValueType: true,
      }),
    };
  },
  effect: generateEffects(),
};
