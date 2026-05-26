import React from 'react';
import { Inputs, Outputs } from '../../components/node-render/variable-list';
import TextShower from '../../components/node-render/text-shower';
import { useNodeRenderContext } from '../../hooks';
import { Field } from '../../components/node-render/field';

import { useWatchFormValues } from '@flowgram.ai/free-layout-editor';
import { getOptionsCache } from './model';

const ModelShower = () => {
  const { node } = useNodeRenderContext();
  const data = useWatchFormValues(node);
  const mode = data?.mode;
  const text = getOptionsCache()[mode] || '商和大模型';
  return (
    <Field label="模型" isEmpty={!text?.trim()}>
      {text}
    </Field>
  );
};

export function LLMContent() {
  return (
    <>
      <Inputs />
      <Outputs />
      <ModelShower />
      <TextShower fieldName="tipWord" label="提示词" />
    </>
  );
}
