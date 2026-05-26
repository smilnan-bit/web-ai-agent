import { getNodeScope, type FormMeta } from '@flowgram.ai/free-layout-editor';
import { autoChangeRefEffect } from '../../effects/autoChangeRefEffect';
import type { FlowNodeJSON } from '../../typings';
import React from 'react';
import { get } from 'lodash';
import FormCondition from './form';
import { ConditionContent } from './node-content';
import { FormContain } from '../../form-components';
import { defaultFormMeta, generateEffects } from '../default-form-meta';
import { SimpleParamTypeEnum } from '../../constants';
import { getSourceVariable } from '../../utils/variables';
import { ConditionValueDisableTypes } from './const';

export const renderForm = () => {
  return <FormContain node={<ConditionContent />} sideNode={<FormCondition />} />;
};

export const formMeta: FormMeta<FlowNodeJSON> = {
  ...defaultFormMeta,
  render: renderForm,
  effect: generateEffects({
    input: false,
    output: false,
    customEffect: {
      conditions: autoChangeRefEffect(),
    },
  }),
  validate: {
    ...defaultFormMeta.validate,
    conditions: ({ value }) => {
      if (!value?.length) {
        return '至少需要一个条件';
      }
      return undefined;
    },
    'conditions.*.params': ({ value }) => {
      if (!value?.length) {
        return '至少需要一个判断';
      }
      return undefined;
    },
    'conditions.*.portTitle': ({ value }) => {
      if (!value?.trim()) {
        return '请输入分支名';
      }
      return undefined;
    },
    'conditions.*.params.*.quoteParam': ({ value, context }) => {
      if ([null, undefined].includes(value)) {
        return '请选择引用变量';
      }
      const availableVariables = getNodeScope(context.node).available.variables;
      const sourceVariable = getSourceVariable(value, availableVariables);
      if (!sourceVariable) {
        return '引用的变量不存在';
      }
      return undefined;
    },
    'conditions.*.params.*.quoteCondition': ({ value }) => {
      if ([null, undefined].includes(value)) {
        return '请选择条件';
      }
      return undefined;
    },
    'conditions.*.params.*.value': ({ value, formValues, name, context }) => {
      const paramPath = name.split('.').slice(0, -1);
      if (
        !ConditionValueDisableTypes.includes(get(formValues, [...paramPath, 'quoteCondition'])) &&
        [null, undefined].includes(value)
      ) {
        return '请输入';
      }
      if (value && get(formValues, [...paramPath, 'valueType']) === SimpleParamTypeEnum.quote) {
        const availableVariables = getNodeScope(context.node).available.variables;
        const sourceVariable = getSourceVariable(value, availableVariables);
        if (!sourceVariable) {
          return '引用的变量不存在';
        }
      }
      return undefined;
    },
  },
};
