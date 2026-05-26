import type { FormMeta } from '@flowgram.ai/free-layout-editor';
import React from 'react';
import { defaultFormMeta, generateEffects } from '../default-form-meta';
import { BatchContent } from './node-content';
import { FormContain, genInputParamValidate } from '../../form-components';
import FormContent from './form';
import { provideBatchInputEffect } from '../../effects/provideBatchInputEffect';
import { autoChangeRefEffect } from '../../effects/autoChangeRefEffect';
import { createBatchOutputsFormPlugin } from '../../plugins/create-batch-outputs-from-plugin';
import { ToolParamsTypeEnum } from '@/constants';

export const renderForm = ({ form }) => {
  return (
    <FormContain
      node={<BatchContent />}
      sideNode={<FormContent />}
      nodeContentStyle={{ display: 'flex', flexDirection: 'column' }}
    />
  );
};

export const formMeta: FormMeta = {
  ...defaultFormMeta,
  render: renderForm,
  effect: generateEffects({
    input: false,
    output: false,
    customEffect: {
      inputParam: [...provideBatchInputEffect, ...autoChangeRefEffect()],
    },
  }),
  plugins: [createBatchOutputsFormPlugin({ outputKey: 'outputParam', outputPrivateScope: false })],
  validate: {
    ...defaultFormMeta.validate,
    ...genInputParamValidate({
      privateScope: true,
      checkType: ({ sourceType }) => {
        if (sourceType !== ToolParamsTypeEnum.array) {
          return false;
        }
        return true;
      },
    }),
    ...genInputParamValidate({
      inputName: 'outputParam',
      checkType: ({ sourceType }) => {
        if ([ToolParamsTypeEnum.object, ToolParamsTypeEnum.array].includes(sourceType)) {
          return false;
        }
        return true;
      },
    }),
    parallelCount: ({ value }) => {
      if ([undefined, '', null].includes(value)) {
        return '请输入并行运行数量';
      }
      return undefined;
    },
    maxIterations: ({ value }) => {
      if ([undefined, '', null].includes(value)) {
        return '请输入批处理次数上限';
      }
      return undefined;
    },
  },
};
