import React, { useLayoutEffect } from 'react';
import { ConditionBranch } from './condition-branch';
import { Field } from '../../components/node-render/field';
import { useNodeRenderContext } from '../../hooks';
import type { SimpleParamTypeEnum } from '../../constants';
import { CustomPort } from '../../components/node-render/CustomPort';
import { useWatchFormValues, WorkflowNodePortsData } from '@flowgram.ai/free-layout-editor';
import type { ConditionNodeSelectEnum, ConditionRelationEnum } from './const';

export interface ConditionItem {
  id: string;
  portTitle: string;
  params: {
    valueType: SimpleParamTypeEnum;
    quoteParam: string;
    quoteCondition: ConditionNodeSelectEnum;
    value: string;
  }[];
  relation: ConditionRelationEnum;
}

export function ConditionContent() {
  const nodeRender = useNodeRenderContext();
  const data = useWatchFormValues(nodeRender.node);
  const conditions = data?.conditions;
  useLayoutEffect(() => {
    window.requestAnimationFrame(() => {
      nodeRender.node.getData<WorkflowNodePortsData>(WorkflowNodePortsData).updateDynamicPorts();
    });
  }, [nodeRender.node]);

  return (
    <>
      {conditions?.map((condition, index) => {
        let label = '如果';

        if (index > 0) {
          label = '否则如果';
        }

        return (
          <Field label={label} key={condition.id}>
            <ConditionBranch branch={condition} />
            <CustomPort data-port-id={condition.id} data-port-type="output"></CustomPort>
          </Field>
        );
      })}
      <Field label="否则">
        <div tw="h-8 border border-solid p-1 rounded-[2px] border-[rgba(68,83,130,0.25)]" />
        <CustomPort data-port-id="condition-else" data-port-type="output"></CustomPort>
      </Field>
    </>
  );
}
