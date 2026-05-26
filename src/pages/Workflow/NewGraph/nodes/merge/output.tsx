import React from 'react';
import { FormFragmentFieldWrapper, type OutputParamsType, useForm, useWatch } from '@form';
import type { MergeFormData } from './form';
import { useNodeRenderContext } from '../../hooks';
import { useWatchFormValues } from '@flowgram.ai/free-layout-editor';
import { useDebounceEffect } from 'ahooks';
import TreeDataShower from '@/components/TreeDataShower';

const Output = () => {
  const nodeRender = useNodeRenderContext();
  const data = useWatchFormValues(nodeRender.node);
  const inputParam = data?.inputParam || [];
  const form = useForm();
  useDebounceEffect(
    () => {
      const outputParam: OutputParamsType[] = [];
      inputParam.forEach((item, index) => {
        if (item.type) {
          outputParam.push({
            name: item.groupName || `Group${index + 1}`,
            type: item.type,
            subType: item.subType,
          });
        }
        form.setFieldValue('outputParam', outputParam);
      });
    },
    [inputParam],
    {
      wait: 300,
    },
  );

  return (
    <FormFragmentFieldWrapper<MergeFormData['outputParam']> name="outputParam" title="输出">
      {({ value }) => <TreeDataShower treeData={value} />}
    </FormFragmentFieldWrapper>
  );
};

export default Output;
