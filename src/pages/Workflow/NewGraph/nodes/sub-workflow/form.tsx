import React from 'react';
import { Input, Select } from 'antd';
import { useForm, useWatch } from '@flowgram.ai/free-layout-editor';
import { FieldWrapper, FormField, FormFragmentFieldWrapper } from '../../form-components';
import FixedParamsInput from '../../form-components/fixed-params-input';
import TreeDataShower from '@/components/TreeDataShower';
import { SubWorkflowNodeErrorConfig, SubWorkflowNodeErrorEnum, type SubWorkflowNodeData } from './types';
import FormFragment from '../../components/form-fragment';
import JsonEditor from '../code/json-editor';
import { EndOutputTypeConfig } from '../end/form';
import { useUpdateEffect } from 'ahooks';
import { generateDefaultJsonFromParams } from '../code/form';

/** 子工作流节点表单主体 */
const SubWorkflowForm: React.FC = () => {
  const errorProcessType = useWatch<SubWorkflowNodeErrorEnum>('settingOnError.processType');
  const outputParams = useWatch<SubWorkflowNodeData['outputParam']>('outputParam');
  const form = useForm();

  useUpdateEffect(() => {
    if (errorProcessType === SubWorkflowNodeErrorEnum.returnContent) {
      const json = generateDefaultJsonFromParams(outputParams || []);
      form.setValueIn('settingOnError.dataOnErr', JSON.stringify(json, null, 2));
    }
  }, [outputParams, errorProcessType]);
  return (
    <>
      {/* 入参配置 */}
      <FormFragment title="工作流">
        <FieldWrapper name="workflowName" title="工作流名称">
          <Input disabled={true} />
        </FieldWrapper>
        <FieldWrapper name="workflowDesc" title="工作流描述">
          <Input.TextArea rows={3} disabled={true} />
        </FieldWrapper>
      </FormFragment>
      <FixedParamsInput />

      {/* 出参展示 */}
      <FormFragmentFieldWrapper<SubWorkflowNodeData['outputParam']> name="outputParam" title="输出">
        {({ value }) => <TreeDataShower treeData={value || []} />}
      </FormFragmentFieldWrapper>
      <FormFragmentFieldWrapper<SubWorkflowNodeData['returnType']> name="returnType" title="输出模式">
        {({ value }) => EndOutputTypeConfig[value]?.text}
      </FormFragmentFieldWrapper>
      <FormFragment title="异常处理">
        <FieldWrapper name={'settingOnError.processType'} title="异常处理方式">
          <Select style={{ width: '100%' }}>
            {Object.entries(SubWorkflowNodeErrorConfig).map(([value, label]) => (
              <Select.Option value={Number(value)} key={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </FieldWrapper>
        {errorProcessType === SubWorkflowNodeErrorEnum.returnContent && (
          <FormField name={'settingOnError.dataOnErr'} style={{ display: 'block' }}>
            <JsonEditor className="formcode-codeeditor" />
          </FormField>
        )}
      </FormFragment>
    </>
  );
};

export default SubWorkflowForm;
