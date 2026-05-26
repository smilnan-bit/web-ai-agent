import {
  type FormRenderProps,
  type FormMeta,
  ValidateTrigger,
  createEffectFromVariableProvider,
} from '@flowgram.ai/free-layout-editor';
import type { FlowNodeJSON } from '../typings';
import { FormHeader, FormContent } from '../form-components';
import React from 'react';
import { titleValidate } from '../utils/validate';
import { parseNodeOutputByViewVariableMeta } from '../utils/variables';
import { genInputParamEffect } from '../form-components/input-output';
import { syncVariableTitle } from '../effects/syncVaraibleTitle';

export const renderForm = ({ form }: FormRenderProps<FlowNodeJSON>) => (
  <>
    <FormHeader />
    <FormContent />
  </>
);

export const defaultFormMeta: FormMeta<FlowNodeJSON> = {
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: titleValidate,
  },
  /**
   * Initialize (fromJSON) data transformation
   * 初始化(fromJSON) 数据转换
   * @param value
   * @param ctx
   */
  formatOnInit: (value, ctx) => value,
  /**
   * Save (toJSON) data transformation
   * 保存(toJSON) 数据转换
   * @param value
   * @param ctx
   */
  formatOnSubmit: (value, ctx) => value,
};

export const generateEffects = ({
  input = true,
  output = true,
  outputReplaceInput = false, //早期节点输出当输入
  customEffect,
}: {
  customEffect?: any;
  input?: boolean;
  output?: boolean;
  outputReplaceInput?: boolean;
} = {}) => {
  let effect = {
    title: syncVariableTitle,
    ...customEffect,
  };
  if (outputReplaceInput) {
    effect = {
      ...effect,
      ...genInputParamEffect('outputParam'),
    };
  } else {
    if (input) {
      effect = {
        ...effect,
        ...genInputParamEffect(),
      };
    }
    if (output) {
      effect.outputParam = createEffectFromVariableProvider({
        parse: parseNodeOutputByViewVariableMeta,
      });
    }
  }
  return effect;
};
