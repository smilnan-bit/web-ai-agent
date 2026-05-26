import type { FormMeta } from '@flowgram.ai/free-layout-editor';
import { defaultFormMeta, generateEffects } from '../default-form-meta';
import React from 'react';
import { MergeContent } from './node-content';
import { FormContain, genInputParamValidate } from '../../form-components';
import FormContent from './form';
import { autoChangeRefEffect } from '../../effects/autoChangeRefEffect';
import { ToolParamsTypeEnum } from '@/constants';

export const renderForm = () => {
  return <FormContain node={<MergeContent />} sideNode={<FormContent />} />;
};

export const formMeta: FormMeta = {
  ...defaultFormMeta,
  render: renderForm,
  effect: {
    ...generateEffects({ input: false }),
    'inputParam.*.params': autoChangeRefEffect(),
  },
  validate: {
    ...defaultFormMeta.validate,
    ...genInputParamValidate({
      noCheckName: true,
      checkType: ({ name, sourceType, sourceSubType, formValues }) => {
        const str = name.split('.');
        let parent: any = formValues;
        for (let i = 0; i < str.length - 3; i++) {
          parent = parent[str[i]];
        }
        const type = parent?.type;
        const subType = parent?.subType;
        if (!type) {
          return true;
        } else if (type === ToolParamsTypeEnum.array && type === sourceType) {
          if (subType !== sourceSubType) {
            return false;
          }
        }
        return type === sourceType;
      },
      inputName: 'inputParam.*.params',
    }),
  },
};
