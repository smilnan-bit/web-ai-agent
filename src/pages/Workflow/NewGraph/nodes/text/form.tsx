import React from 'react';
import { Radio } from '@douyinfe/semi-ui';
import { FieldWrapper, FormFragmentFieldWrapper } from '@form';

import { ToolParamsTypeEnum } from '@/constants';
import type { InputParamsType, OutputParamsType } from '../../form-components/input-output';
import { useForm, useWatch } from '@form/hooks';
import { DelimiterSelector } from './delimiter-selector';

import { nanoid } from 'nanoid';
import { SimpleParamTypeEnum } from '../../constants';
import { ParamsFormWithValue } from '@form/input-output';
import FormPrompt from '../../form-components/form-prompt';
import FormFragment from '../../components/form-fragment';
import TreeDataShower from '@/components/TreeDataShower';
import { usePlayground } from '@flowgram.ai/free-layout-editor';

export enum TextProcessTypeEnum {
  concat = 'concat',
  split = 'split',
}

export const getInputInitConcatData = () => {
  return {
    id: nanoid(),
    name: 'string1',
    valueType: SimpleParamTypeEnum.quote,
    value: undefined,
  };
};

export const getInputInitSplitData = () => {
  return {
    id: nanoid(),
    name: 'string',
    valueType: SimpleParamTypeEnum.quote,
    value: undefined,
  };
};

export const TextConcatOutputData = [
  {
    name: 'output',
    type: ToolParamsTypeEnum.string,
    desc: '拼接后的文本',
  },
];

export const TextSplitOutputData = [
  {
    name: 'output',
    type: ToolParamsTypeEnum.array,
    subType: ToolParamsTypeEnum.string,
    desc: '分隔后的文本',
  },
];

export type TextFormData = {
  method: TextProcessTypeEnum;
  concatResult?: string; //给后端要塞到concatParam字段数据里
  delimiters?: string[]; // 给后端要塞到splitParam字段数据里
  inputParam: InputParamsType[];
  outputParam: OutputParamsType[];
};

const FormContent = () => {
  const method = useWatch('method');
  const form = useForm();
  const playground = usePlayground();
  return (
    <>
      {/* 同行布局示例 */}
      <FieldWrapper<TextFormData['method']> name="method" title="处理模式">
        {({ value, onChange }) => (
          <Radio.Group
            onChange={(e) => {
              onChange(e.target.value);
              form.setFieldValue(
                'outputParam',
                e.target.value === TextProcessTypeEnum.concat ? [...TextConcatOutputData] : [...TextSplitOutputData],
              );
              form.setFieldValue(
                'inputParam',
                e.target.value === TextProcessTypeEnum.concat ? [getInputInitConcatData()] : [getInputInitSplitData()],
              );
            }}
            value={value as string}
            disabled={playground.config.readonly}
          >
            <Radio value={TextProcessTypeEnum.concat}>字符串拼接</Radio>
            <Radio value={TextProcessTypeEnum.split}>字符串分隔</Radio>
          </Radio.Group>
        )}
      </FieldWrapper>
      <ParamsFormWithValue
        quoteValType={method === TextProcessTypeEnum.split ? ToolParamsTypeEnum.string : undefined}
        disableAdd={method === TextProcessTypeEnum.split}
        nameUnEditable={method === TextProcessTypeEnum.split}
        disableRemove={method === TextProcessTypeEnum.split}
      />
      {method === TextProcessTypeEnum.concat ? (
        <FormFragment title="字符串拼接" required>
          <div tw="pt-4" />
          <FormPrompt name="concatResult" />
        </FormFragment>
      ) : (
        <FormFragmentFieldWrapper<TextFormData['delimiters']> name="delimiters" title="分隔符" required>
          <DelimiterSelector />
        </FormFragmentFieldWrapper>
      )}
      <FormFragmentFieldWrapper<TextFormData['outputParam']> name="outputParam" title="输出">
        {({ value }) => <TreeDataShower treeData={value} />}
      </FormFragmentFieldWrapper>
    </>
  );
};

export default FormContent;
