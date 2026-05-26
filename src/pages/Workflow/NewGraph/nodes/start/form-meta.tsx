import { createEffectFromVariableProvider, type FormMeta, ValidateTrigger } from '@flowgram.ai/free-layout-editor';
import type { FlowNodeJSON } from '../../typings';
import React from 'react';
import { StartContent } from './node-content';
import { FormContain, generateParamsFormValidateFields } from '../../form-components';
import { defaultFormMeta } from '../default-form-meta';
import { parseNodeOutputByViewVariableMeta } from '../../utils/variables';
import FormContent from './form';

export const renderForm = () => {
  return <FormContain node={<StartContent />} sideNode={<FormContent />} />;
};

export const formMeta: FormMeta<FlowNodeJSON> = {
  ...defaultFormMeta,
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    ...generateParamsFormValidateFields({ inputName: 'inputParam' }),
  },
  effect: {
    // input比较特殊 虽然叫intput实际时output
    inputParam: createEffectFromVariableProvider({
      parse: parseNodeOutputByViewVariableMeta,
    }),
  },
};
