import React from 'react';
import { FormFragmentFieldWrapper, type InputParamsType, type OutputParamsType } from '@form';
import { ParamsFormWithValue } from '@form/input-output';
import Knowledge from './knowledge';
import type { AppsNS } from '@/types/Apps';
import TreeDataShower from '@/components/TreeDataShower';

export type KnowledgeFormData = {
  knowledge: AppsNS.KnowledgeType[];
  inputParam: InputParamsType[];
  outputParam: OutputParamsType[];
};

const FormContent = () => {
  return (
    <>
      <ParamsFormWithValue name="inputParam" nameUnEditable disableAdd disableRemove />
      <Knowledge />
      <FormFragmentFieldWrapper<KnowledgeFormData['outputParam']> name="outputParam" title="输出">
        {({ value }) => <TreeDataShower treeData={value} />}
      </FormFragmentFieldWrapper>
    </>
  );
};

export default FormContent;
