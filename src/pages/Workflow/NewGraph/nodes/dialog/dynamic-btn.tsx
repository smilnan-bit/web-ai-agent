import React from 'react';
import ParamSelect from '@form/input-output/param-select';
import { Select } from 'antd';
import { FormField } from '@form';
import { ToolParamsTypeEnum } from '@/constants';
import { Other } from './other';

const DynamicButtonSetting = () => {
  return (
    <>
      <div tw="flex gap-2">
        <div tw="leading-8">选项1~N</div>
        <Select
          options={[{ label: 'Array<String>', value: ToolParamsTypeEnum.array }]}
          disabled
          value={ToolParamsTypeEnum.array}
        />
        <div tw="flex-1 min-w-0">
          <FormField name="optionParamName">
            <ParamSelect quoteValType={ToolParamsTypeEnum.array} quoteValSubType={[ToolParamsTypeEnum.string]} />
          </FormField>
        </div>
      </div>
      <Other />
    </>
  );
};

export default DynamicButtonSetting;
