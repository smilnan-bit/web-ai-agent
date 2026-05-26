import React from 'react';
import type { FormMeta } from '@flowgram.ai/free-layout-editor';
import { FormContain } from '@form/form-container';
import { EndNodeContent } from './node-content';
import EndForm from './form';

export const formMeta: FormMeta = {
  render: () => <FormContain node={<EndNodeContent />} sideNode={<EndForm />} />,
};
