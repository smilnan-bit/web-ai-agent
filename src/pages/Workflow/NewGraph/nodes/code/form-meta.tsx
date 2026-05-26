import {
  createEffectFromVariableProvider,
  FlowNodeFormData,
  type FormModelV2,
  type FormMeta,
  type FormRenderProps,
  type VariableAbilityParseContext,
} from '@flowgram.ai/free-layout-editor';
import React from 'react';
import type { CodeNodeJSON } from './types';
import { defaultFormMeta, generateEffects } from '../default-form-meta';
import { parseNodeOutputByViewVariableMeta } from '../../utils/variables';
import { CodeContent } from './node-content';
import { FormContain, generateParamsFormValidateFields, genInputParamValidate } from '../../form-components';
import FormContent from './form';

export const renderForm = ({ form }) => {
  return <FormContain node={<CodeContent />} sideNode={<FormContent />} />;
};

const parseOutputParam = (value: any, ctx: VariableAbilityParseContext) => {
  const formModel = ctx.node.getData(FlowNodeFormData).getFormModel<FormModelV2>();
  const fieldsToNodeData = ctx.node.getNodeMeta().fieldsToNodeData;
  const realValue = fieldsToNodeData(formModel.values);
  return parseNodeOutputByViewVariableMeta(realValue.outputParam, ctx);
};

export const formMeta: FormMeta = {
  ...defaultFormMeta,
  render: renderForm,
  effect: generateEffects({
    output: false,
    customEffect: {
      'settingOnError.processType': createEffectFromVariableProvider({ parse: parseOutputParam }),
      outputParam: createEffectFromVariableProvider({ parse: parseOutputParam }),
    },
  }),
  validate: {
    ...defaultFormMeta.validate,
    ...genInputParamValidate({ canEmpty: true }),
    ...generateParamsFormValidateFields(),
    'settingOnError.timeoutMs': ({ value }) => {
      if (value === undefined || value === '' || value === null) {
        return '请输入超时时间';
      }
      return undefined;
    },
  },
};
