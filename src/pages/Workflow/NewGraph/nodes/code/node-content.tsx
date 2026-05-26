import React, { useEffect } from 'react';
import { Inputs, Outputs } from '../../components/node-render/variable-list';
import { useNodeRenderContext } from '../../hooks';
import { Field } from '../../components/node-render/field';
import { CodeNodeErrorConfig, CodeNodeErrorEnum } from './const';
import { CustomPort } from '../../components/node-render/CustomPort';
import { useWatchFormValues, WorkflowNodePortsData } from '@flowgram.ai/free-layout-editor';

export function CodeContent() {
  const { node } = useNodeRenderContext();
  const data = useWatchFormValues(node);
  const {
    settingOnError: { processType },
  } = data;
  const ports = node.getData(WorkflowNodePortsData);

  // flowgram 动态端口bug,要强制更新
  useEffect(() => {
    ports.updateDynamicPorts();
  }, [processType]);

  return (
    <>
      <Inputs />
      <Outputs showPort={true} portId="code-output" />
      <Field label={'异常处理'}>
        {CodeNodeErrorConfig[data.settingOnError?.processType]}
        {processType === CodeNodeErrorEnum.error && (
          <CustomPort data-port-id="code-output-error" data-port-type="output"></CustomPort>
        )}
      </Field>
    </>
  );
}
