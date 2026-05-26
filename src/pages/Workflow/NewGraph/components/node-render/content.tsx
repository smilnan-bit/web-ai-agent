import { FormHeader, FormContent } from '../../form-components';
import React from 'react';
import type { WorkflowNodeType } from '../../nodes';

export const NodeContent = ({ form, type }: { form: any; type: WorkflowNodeType }) => {
  // 从meta中获取自定义配置
  return (
    <>
      <FormHeader />
      <FormContent>{form.render()}</FormContent>
    </>
  );
};

export default NodeContent;
