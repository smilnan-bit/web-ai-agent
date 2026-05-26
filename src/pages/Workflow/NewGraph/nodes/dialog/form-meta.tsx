import {
  createEffectFromVariableProvider,
  FlowNodeFormData,
  type FormModelV2,
  type VariableAbilityParseContext,
  type FormMeta,
  getNodeScope,
} from '@flowgram.ai/free-layout-editor';
import { defaultFormMeta, generateEffects } from '../default-form-meta';
import React from 'react';
import { parseNodeOutputByViewVariableMeta } from '../../utils/variables';
import { DialogContent } from './node-content';
import { FormContain, generateParamsFormValidateFields, genInputParamValidate } from '../../form-components';
import { autoChangeRefEffect } from '../../effects/autoChangeRefEffect';
import { trimPattern } from '@/constants';
import { MAX_CONTENT_LENGTH } from '../../constants';
import FormContent from './form';
import { DialogAnswerTypeEnum } from './type';
import { genOptionItem } from './fixed-btn';
import { getFullDialogOutputParam } from './output';

export const renderForm = () => {
  return <FormContain node={<DialogContent />} sideNode={<FormContent />} />;
};

const parseOutputParam = (value: any, ctx: VariableAbilityParseContext) => {
  const formModel = ctx.node.getData(FlowNodeFormData).getFormModel<FormModelV2>();
  const availableVariables = getNodeScope(ctx.node).available.variables;
  const outputParam = getFullDialogOutputParam({
    data: formModel.values,
    refVarAsOutput: true,
    availableVariables,
  });
  return parseNodeOutputByViewVariableMeta(outputParam, ctx);
};

export const formMeta: FormMeta = {
  ...defaultFormMeta,
  render: renderForm,
  validate: {
    ...defaultFormMeta.validate,
    ...genInputParamValidate({ canEmpty: true }),
    content: ({ value: setterValue, formValues }) => {
      // 必填校验
      if (setterValue === undefined || setterValue === null || setterValue === '') {
        return '请输入提问内容';
      }

      // trimPattern 校验：不能以空格开头和结尾
      if (typeof setterValue === 'string' && !trimPattern.test(setterValue)) {
        return '不能以空格开头和结尾';
      }

      if (setterValue?.length > MAX_CONTENT_LENGTH) {
        return `最大长度${MAX_CONTENT_LENGTH}字符`;
      }

      return undefined;
    },
    optionParamName: ({ value: optionParamName, formValues }) => {
      if (formValues.type === DialogAnswerTypeEnum.dynamic && !optionParamName) {
        return '请选择内容';
      }
      return undefined;
    },
    cardConfig: ({ value: cardConfig, formValues }) => {
      if (formValues.type === DialogAnswerTypeEnum.card && !cardConfig) {
        return '请配置卡片内容';
      }
      return undefined;
    },
    options: ({ value = [], formValues }) => {
      if (formValues.type !== DialogAnswerTypeEnum.fixed) {
        return undefined;
      }
      const filteredValue = value.filter((item) => !!item.value);
      if (
        filteredValue.find((item, index) =>
          filteredValue.find((item2, index2) => item2.value === item.value && index2 !== index),
        )
      ) {
        return '选项内容不能重复';
      }

      return undefined;
    },
    'options.*': ({ value = '', formValues }) => {
      if (formValues.type !== DialogAnswerTypeEnum.fixed) {
        return undefined;
      }

      if (!value) {
        return '请输入选项内容';
      }
      if (!trimPattern.test(value)) {
        return '不能以空格开头和结尾';
      }
      return undefined;
    },
    ...generateParamsFormValidateFields({
      skipCheck: (formValues) => {
        //直接回答或者 不勾选 从用户的回复中提取字段 则不校验输出变量
        if (formValues.type !== 0 || !formValues.extraOutput) {
          return true;
        }
        return false;
      },
    }),
  },
  effect: generateEffects({
    output: false,
    customEffect: {
      optionParamName: autoChangeRefEffect({ isSingleParam: true }),
      'cardConfig.product.*': autoChangeRefEffect({ isSingleParam: true }),
      'cardConfig.order.*': autoChangeRefEffect({ isSingleParam: true }),
      'cardConfig.cardType': createEffectFromVariableProvider({
        parse: parseOutputParam,
      }),
      'cardConfig.*.customParams': createEffectFromVariableProvider({
        parse: parseOutputParam,
      }),
      'cardConfig.*.customParams.*.value': autoChangeRefEffect({ isSingleParam: true }),
      type: createEffectFromVariableProvider({
        parse: parseOutputParam,
      }),
      extraOutput: createEffectFromVariableProvider({
        parse: parseOutputParam,
      }),
      outputParam: createEffectFromVariableProvider({
        parse: parseOutputParam,
      }),
    },
  }),
  formatOnInit: (value, ctx) => {
    const { options, cardOutputStyle = 0, ...rest } = value;
    // 修复历史问题index作为key，造成连线不正确
    return {
      options: (options || [genOptionItem()]).map((item, idx) => {
        if (typeof item === 'string') {
          return {
            id: genOptionItem(idx).id,
            value: item,
          };
        }
        return item;
      }),
      cardOutputStyle,
      ...rest,
    };
  },
};
