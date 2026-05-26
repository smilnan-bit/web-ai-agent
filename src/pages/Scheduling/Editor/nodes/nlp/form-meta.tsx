import React from 'react';
import type { FormMeta } from '@flowgram.ai/free-layout-editor';
import { FormContain } from '@form/form-container';
import { NLPNodeContent } from './node-content';
import NLPForm from './form';

export const formMeta: FormMeta = {
  render: () => <FormContain node={<NLPNodeContent />} sideNode={<NLPForm />} />,
};
