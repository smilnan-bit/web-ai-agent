import React from 'react';
import type { FormMeta } from '@flowgram.ai/free-layout-editor';
import { FormContain } from '@form/form-container';
import { AgentNodeContent } from './node-content';
import AgentForm from './form';

export const formMeta: FormMeta = {
  render: () => <FormContain node={<AgentNodeContent />} sideNode={<AgentForm />} />,
};
