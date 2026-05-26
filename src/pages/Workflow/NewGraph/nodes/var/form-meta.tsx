import type { FormMeta } from '@flowgram.ai/free-layout-editor';
import { defaultFormMeta, generateEffects } from '../default-form-meta';
import React from 'react';
import { VarContent } from './node-content';
import { FormContain, genInputParamValidate } from '../../form-components';
import FormContent, { type VarFormData } from './form';
import { ToolParamsTypeEnum } from '@/constants';
import { getGlobalVariableMap } from '../../constants';

export const renderForm = () => {
  return <FormContain node={<VarContent />} sideNode={<FormContent />} />;
};

export const formMeta: FormMeta = {
  ...defaultFormMeta,
  render: renderForm,
  effect: generateEffects({ input: false }),
  validate: {
    ...defaultFormMeta.validate,
    ...genInputParamValidate<VarFormData>({
      customcheckName: (name) => {
        const id = name;
        const target = getGlobalVariableMap()[id];
        if (!target) {
          return '变量不存在';
        }
        return undefined;
      },
      checkType: ({ sourceType }) => {
        if (sourceType !== ToolParamsTypeEnum.string) {
          return false;
        }
        return true;
      },
    }),
  },
};
