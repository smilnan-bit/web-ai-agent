import React from 'react';
import type { InputParamsType } from '@form';
import { ARRAY_SUB_TYPES, FieldWrapper, ParamsFormWithValue } from '@form';
import FormFragment from '../../components/form-fragment';
import { InputNumber } from 'antd';
import { ToolParamsTypeEnum } from '@/constants';
import { PrivateScopeProvider } from '@flowgram.ai/free-layout-editor';
export type BatchFormData = {
  loopCount: number;
  loopLimit: number;
  inputParam?: InputParamsType[];
  outputParam?: InputParamsType[];
};

const FormContent = () => {
  return (
    <>
      <FormFragment title="循环设置">
        <FieldWrapper
          name="parallelCount"
          required
          title="并行运行数量"
          labelLayout="inline"
          labelStyle={{ width: 110, maxWidth: 110 }}
          tw="mt-4"
        >
          <InputNumber min={1} max={10} precision={0} />
        </FieldWrapper>
        <FieldWrapper
          name="maxIterations"
          required
          title="批处理次数上限"
          labelLayout="inline"
          labelStyle={{ width: 110, maxWidth: 110 }}
          tw="mt-3"
        >
          <InputNumber min={1} max={200} precision={0} />
        </FieldWrapper>
      </FormFragment>
      <PrivateScopeProvider>
        <ParamsFormWithValue
          name="inputParam"
          disableValueType
          quoteValType={ToolParamsTypeEnum.array}
          quoteValSubType={ARRAY_SUB_TYPES}
        />
      </PrivateScopeProvider>
      <ParamsFormWithValue
        name="outputParam"
        title="输出"
        disableValueType
        quoteValType={[
          ToolParamsTypeEnum.boolean,
          ToolParamsTypeEnum.number,
          ToolParamsTypeEnum.string,
          ToolParamsTypeEnum.integer,
        ]}
      />
    </>
  );
};

export default FormContent;
