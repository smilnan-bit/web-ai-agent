import React, { useEffect } from 'react';
import { useWatchFormValues, WorkflowNodePortsData } from '@flowgram.ai/free-layout-editor';
import { Inputs, Outputs } from '../../components/node-render/variable-list';
import { useNodeRenderContext } from '../../hooks';
import { Field } from '../../components/node-render/field';
import type { SubWorkflowNodeData } from './types';
import { SubWorkflowNodeErrorConfig, SubWorkflowNodeErrorEnum } from './types';
import { CustomPort } from '../../components/node-render/CustomPort';
import { EndOutputTypeConfig, EndOutputTypeEnum } from '../end/form';

/** 子工作流基础信息展示（工作流名称、描述） */
const SubWorkflowBasicInfo = () => {
  const { node } = useNodeRenderContext();
  const data = useWatchFormValues<SubWorkflowNodeData>(node);

  const workflowName = data?.workflowName;
  const workflowDesc = data?.workflowDesc;

  return (
    <>
      {/* 工作流名称 */}
      <Field label="工作流名称">
        <div tw="truncate" title={workflowName}>
          {workflowName}
        </div>
      </Field>

      {/* 工作流描述 */}
      <Field label="工作流描述">
        <div tw="truncate" title={workflowDesc}>
          {workflowDesc}
        </div>
      </Field>
    </>
  );
};

/** 异常处理展示 */
const ErrorHandlingShower = () => {
  const { node } = useNodeRenderContext();
  const data = useWatchFormValues<{ settingOnError?: { processType?: SubWorkflowNodeErrorEnum } }>(node);

  const errorProcessType = data?.settingOnError?.processType;
  const ports = node.getData(WorkflowNodePortsData);

  // flowgram 动态端口bug，切换 processType 后需强制更新端口
  useEffect(() => {
    ports.updateDynamicPorts();
  }, [errorProcessType]);

  return (
    <Field label={'异常处理'}>
      {SubWorkflowNodeErrorConfig[errorProcessType || SubWorkflowNodeErrorEnum.break]}
      {errorProcessType === SubWorkflowNodeErrorEnum.error && (
        <CustomPort data-port-id="subflow-output-error" data-port-type="output"></CustomPort>
      )}
    </Field>
  );
};

export function SubWorkflowContent() {
  const { node } = useNodeRenderContext();
  const data = useWatchFormValues<SubWorkflowNodeData>(node);
  return (
    <>
      {/* 按设计稿顺序：工作流名称 → 工作流描述 → 输入 → 输出 → 异常处理 */}
      <SubWorkflowBasicInfo />
      <Inputs useFieldsToNodeData={false} />
      <Outputs showPort={true} portId="subflow-output" disableCheckValueType />
      {data?.returnType !== undefined && <Field label={'输出模式'}>{EndOutputTypeConfig[data.returnType]?.text}</Field>}
      <ErrorHandlingShower />
    </>
  );
}
