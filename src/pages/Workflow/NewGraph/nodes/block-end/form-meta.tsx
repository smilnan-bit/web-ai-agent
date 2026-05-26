import type { FormRenderProps, FormMeta, FlowNodeJSON } from '@flowgram.ai/free-layout-editor';
import React from 'react';
import { IconJieshu } from '../icons';
export const renderForm = ({ form }: FormRenderProps<FlowNodeJSON>) => (
  <>
    <div
      style={{
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconJieshu size={24} />
    </div>
  </>
);

export const formMeta: FormMeta<FlowNodeJSON> = {
  render: renderForm,
};
