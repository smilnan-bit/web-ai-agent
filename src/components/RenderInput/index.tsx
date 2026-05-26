import React from 'react';
import { Form, type FormProps, type FormInstance } from 'antd';
import CmpByType from './CmpByType';
import { SimpleParamTypeEnum } from '@/pages/Workflow/NewGraph/constants';
import { ToolParamsTypeEnum } from '@/constants';
import type { WorkflowNS } from '@/types/Workflow';
import { useAvailableVariables } from '@flowgram.ai/free-layout-editor';
import { getSourceVariable } from '@/pages/Workflow/NewGraph/utils/variables';

const RenderInput = ({
  inputParam,
  form,
  renderInitParam = false,
  ...formProps
}: { inputParam: WorkflowNS.WorkflowSimpleParamType[]; form: FormInstance; renderInitParam?: boolean } & FormProps) => {
  const availableVariables = useAvailableVariables();

  return (
    <Form
      form={form}
      {...formProps}
      className="RenderInput"
      labelAlign="right"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
    >
      {inputParam
        ?.filter((item) => item.name)
        .map((param) => {
          if (param.valueType === SimpleParamTypeEnum.quote) {
            const sourceVariable = getSourceVariable(param.value, availableVariables);
            return (
              <CmpByType
                key={param.name}
                param={{
                  type: sourceVariable?.meta?.type,
                  name: param.name,
                  subParams: sourceVariable?.meta.subParams,
                  required: sourceVariable?.meta.required,
                  subType: sourceVariable?.meta.subType,
                }}
              />
            );
          } else if (renderInitParam) {
            return <CmpByType key={param.name} param={param} />;
          } else {
            return <CmpByType key={param.name} param={{ type: ToolParamsTypeEnum.string, name: param.name }} />;
          }
        })}
    </Form>
  );
};

export default RenderInput;
