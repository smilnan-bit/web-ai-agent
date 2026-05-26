import React from 'react';
import { Inputs, Outputs } from '../../components/node-render/variable-list';

export function ToolContent() {
  return (
    <>
      <Inputs restrictQuoteType={true} checkInvalid={true} />
      <Outputs />
    </>
  );
}
