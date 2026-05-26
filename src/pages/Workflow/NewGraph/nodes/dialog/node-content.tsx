import React, { useEffect } from 'react';
import { Inputs, Outputs } from '../../components/node-render/variable-list';
import TextShower from '../../components/node-render/text-shower';
import { useNodeRenderContext } from '../../hooks';
import { Field } from '../../components/node-render/field';
import { useWatchFormValues, WorkflowNodePortsData } from '@flowgram.ai/free-layout-editor';
import { CustomPort } from '../../components/node-render/CustomPort';

const outputTypeMap = {
  0: '直接回答',
  1: '固定按钮',
  2: '动态按钮',
  3: '卡片选择',
};

export enum DialogOutputTypeEnum {
  direct = 0,
  fixed = 1,
  dynamic = 2,
  card = 3,
}
const OutPutType = () => {
  const { node } = useNodeRenderContext();
  const data = useWatchFormValues(node);
  const { type, options } = data;

  const ports = node.getData(WorkflowNodePortsData);

  useEffect(() => {
    ports.updateDynamicPorts();
  }, [ports]);
  return (
    <>
      <Field label="提问方式">
        <span>{outputTypeMap[type || 0]}</span>
      </Field>
      {type === DialogOutputTypeEnum.fixed && options && (
        <>
          {options.map(({ id, value }) => (
            <Field label="选项" key={id}>
              <span>{value}</span>
              <CustomPort data-port-id={id} data-port-type="output" />
            </Field>
          ))}
        </>
      )}
      {[DialogOutputTypeEnum.fixed, DialogOutputTypeEnum.dynamic, DialogOutputTypeEnum.card].includes(type) && (
        <Field label="其他">
          <CustomPort data-port-id={'dialog-otherwise'} data-port-type="output" />
        </Field>
      )}
    </>
  );
};

export function DialogContent() {
  const { node } = useNodeRenderContext();
  const data = useWatchFormValues(node);
  const { type } = data;
  const ports = node.getData(WorkflowNodePortsData);

  //flowgram 动态端口bug,要强制更新
  useEffect(() => {
    ports.updateDynamicPorts();
  }, [type]);
  // 不使用 useMemo，直接计算
  const shouldShowOtherPort = [
    DialogOutputTypeEnum.direct,
    DialogOutputTypeEnum.dynamic,
    DialogOutputTypeEnum.card,
  ].includes(type);
  return (
    <>
      <Inputs />
      <Outputs showPort={shouldShowOtherPort} portId={`dialog-direct-${type}`} />
      <TextShower label="提问内容" />
      <OutPutType />
    </>
  );
}
