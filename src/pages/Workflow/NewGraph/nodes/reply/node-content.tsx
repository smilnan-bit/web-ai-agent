import React from 'react';
import { Outputs } from '../../components/node-render/variable-list';
import TextShower from '../../components/node-render/text-shower';

export function ReplyContent() {
  return (
    <>
      <Outputs title="输入" />
      <TextShower label="回复内容" />
    </>
  );
}
