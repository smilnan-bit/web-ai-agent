import React from 'react';
import type { FormMeta } from '@flowgram.ai/free-layout-editor';
import { FormContain } from '@form/form-container';
import { StartNodeContent } from './node-content';
import StartForm from './form';

export const formMeta: FormMeta = {
  render: () => <FormContain node={<StartNodeContent />} sideNode={<StartForm />} />,
};
