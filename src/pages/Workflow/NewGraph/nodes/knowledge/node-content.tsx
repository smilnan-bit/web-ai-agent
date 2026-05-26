import React from 'react';
import { Inputs, Outputs } from '../../components/node-render/variable-list';
import { useNodeRenderContext } from '../../hooks';
import { useWatchFormValues } from '@flowgram.ai/free-layout-editor';
import TextShower from '../../components/node-render/text-shower';

const KnowledgeShower = () => {
  const { node } = useNodeRenderContext();
  const data = useWatchFormValues(node);
  const knowledge = data?.knowledge || [];
  const text = knowledge.map((item) => item.spaceName).join(',');

  return <TextShower label="知识库" value={text} />;
};

export function KnowledgeContent() {
  return (
    <>
      <Inputs />
      <Outputs />
      <KnowledgeShower />
    </>
  );
}
