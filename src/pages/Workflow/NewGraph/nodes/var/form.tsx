import React from 'react';
import { FormFragmentFieldWrapper } from '@form';
import { ToolParamsTypeEnum } from '@/constants';
import type { OutputParamsType } from '../../form-components/input-output';
import { ParamsFormWithValue } from '@form/input-output';
import TreeDataShower from '@/components/TreeDataShower';
import { getGlobalVariableList } from '../../constants';

export const VarOutputData = [
  {
    name: 'isSuccess',
    type: ToolParamsTypeEnum.boolean,
    desc: '输出为全局变量赋值的结果。赋值成功，则输出为true，赋值失败，则输出为false',
  },
];

export type VarFormData = {
  outputParam: OutputParamsType[];
};

const FormContent = () => {
  return (
    <>
      <ParamsFormWithValue quoteValType={ToolParamsTypeEnum.string} selectNames={getGlobalVariableList()} />
      <FormFragmentFieldWrapper<VarFormData['outputParam']> name="outputParam" title="输出">
        {({ value }) => <TreeDataShower treeData={value} />}
      </FormFragmentFieldWrapper>
    </>
  );
};

export default FormContent;
