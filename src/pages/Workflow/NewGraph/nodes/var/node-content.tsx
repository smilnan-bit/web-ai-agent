import React from 'react';
import { InputParamNodeRender, OutputParamNodeRender } from '@form';

export function VarContent() {
  return (
    <>
      <InputParamNodeRender isGlobal={true} />
      <OutputParamNodeRender />
    </>
  );
}
