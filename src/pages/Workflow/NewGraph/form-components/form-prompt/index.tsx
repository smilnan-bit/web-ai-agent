import React from 'react';
import { PromptEditorWithInputs } from '@flowgram.ai/form-materials';
import { FormField } from '../form-field';
import type { WorkflowNS } from '@/types/Workflow';
import { SimpleParamTypeEnum } from '../../constants';
import { getRefVariable } from '../../utils/variables';
import { PLACEHOLDER_TEXT } from '@/constants/placeholderText';
import './index.less';
import { usePlayground } from '@flowgram.ai/free-layout-editor';

const FormPrompt = ({ name = 'content', inputParamName = 'inputParam', ...props }) => {
  const playground = usePlayground();
  const readonly = playground?.config?.readonly ?? false;
  return (
    <FormField<WorkflowNS.WorkflowSimpleParamType[]> name={inputParamName}>
      {({ value: inputParams }) => (
        <FormField<string> name={name}>
          {({ value, onChange }) => {
            const inputsValues = inputParams?.reduce((acc, { valueType, value, name }) => {
              if (valueType === SimpleParamTypeEnum.quote) {
                const { nodeId, namePath } = getRefVariable(value) || {};
                acc[name] = { type: 'ref', content: [nodeId, ...(namePath || [])] };
              } else acc[name] = { type: 'constant', content: value };
              return acc;
            }, {});
            return (
              <div className="form-prompt">
                <PromptEditorWithInputs
                  value={{ type: 'template', content: value }}
                  onChange={({ content } = { type: 'template' }) => onChange(content)}
                  inputsValues={inputsValues || {}}
                  placeholder={PLACEHOLDER_TEXT}
                  options={{ height: 'auto' }}
                  readonly={readonly}
                  {...props}
                />
              </div>
            );
          }}
        </FormField>
      )}
    </FormField>
  );
};

export default FormPrompt;
