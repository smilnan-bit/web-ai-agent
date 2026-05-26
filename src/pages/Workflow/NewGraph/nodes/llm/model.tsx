import React, { useState } from 'react';
import { FieldWrapper, useForm } from '../../form-components';
import type { LlmFormData } from './form';
import DebounceSelect from '@/components/DebounceSelect';
import { fetchLLMOptions } from './api';
import { InputNumber } from 'antd';
import FormFragment from '../../components/form-fragment';

const optionsCache = {};

export const getOptionsCache = () => {
  return optionsCache;
};

export const SelectModel = () => {
  const [allLLM, setAllLLM] = useState<{ type: number; name: string; temperature: number }[]>([]);
  const form = useForm();
  return (
    <FormFragment title="模型">
      <div className={`field-wrapper`} tw="pt-4">
        {/* 内容区域 */}
        <div className={`field-content`}>
          <div tw="flex gap-2">
            <div tw="flex-1">
              <FieldWrapper<LlmFormData['mode']> name="mode" title="模型" tableRow>
                {({ onChange, value }) => (
                  <DebounceSelect
                    value={value}
                    placeholder={'请选择模型'}
                    fetchOptions={fetchLLMOptions}
                    optionKey="type"
                    getDataSource={(dataSource) => setAllLLM(dataSource || [])}
                    handleOptions={(data) => {
                      data.forEach((item) => {
                        optionsCache[item.type] = item.name;
                      });
                    }}
                    onChange={(value) => {
                      onChange(value as number);
                      form.setValueIn('temperature', allLLM.find((item) => item.type === value)?.temperature);
                    }}
                  />
                )}
              </FieldWrapper>
            </div>
            <div tw="flex-1">
              <FieldWrapper<LlmFormData['temperature']> name="temperature" title="Temperature" required tableRow>
                <InputNumber style={{ width: '100%' }} min={0} max={1} step={0.1} />
              </FieldWrapper>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </FormFragment>
  );
};
