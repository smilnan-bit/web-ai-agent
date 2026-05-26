import React from 'react';
import { Outputs } from '../../components/node-render/variable-list';
import { useNodeRenderContext } from '../../hooks';
import { Field } from '../../components/node-render/field';
import TextShower from '../../components/node-render/text-shower';
import { useWatchFormValues } from '@flowgram.ai/free-layout-editor';
import { EndOutputTypeConfig, EndOutputTypeEnum } from './form';

const EndType = () => {
  const { node } = useNodeRenderContext();
  const data = useWatchFormValues(node);
  const type = data.returnType;
  return <Field label="输出模式">{EndOutputTypeConfig[type || EndOutputTypeEnum.variable].text}</Field>;
};

export function EndContent() {
  const { node } = useNodeRenderContext();
  const data = useWatchFormValues(node);
  return (
    <>
      {data.returnType === EndOutputTypeEnum.silence ? null : (
        <Outputs title={data.returnType === EndOutputTypeEnum.text ? '输入' : '输出'} />
      )}
      <EndType />
      {data.returnType === EndOutputTypeEnum.text && <TextShower label="回复内容" />}
    </>
  );
}
