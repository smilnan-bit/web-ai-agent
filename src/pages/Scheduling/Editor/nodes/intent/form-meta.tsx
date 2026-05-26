import React from 'react';
import type { FormMeta } from '@flowgram.ai/free-layout-editor';
import { FormContain } from '@form/form-container';
import { IntentNodeContent } from './node-content';
import IntentForm from './form';

export const formMeta: FormMeta = {
  render: () => <FormContain node={<IntentNodeContent />} sideNode={<IntentForm />} />,
};
