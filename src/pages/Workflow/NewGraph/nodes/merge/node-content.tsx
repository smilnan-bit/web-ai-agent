import React from 'react';
import { VariableTagList } from '../../components/node-render/variable-tag-list';
import { Field } from '../../components/node-render/field';
import { ToolParamsTypeEnum, ToolParamsTypeShowEnum } from '@/constants';
import { useAvailableVariables, useWatchFormValues } from '@flowgram.ai/free-layout-editor';
import { useNodeRenderContext } from '../../hooks';
import { transformParams } from '../../components/node-render/variable-list';

export function MergeContent() {
  const nodeRender = useNodeRenderContext();
  const data = useWatchFormValues(nodeRender.node);
  const variables = useAvailableVariables();
  const inputParams = data?.inputParam || [];
  return (
    <>
      {inputParams.map((item, i) => {
        return (
          <Field label={item.groupName || `Group${i + 1}`} key={i}>
            <div tw="flex flex-col gap-2">
              {item.type ? (
                <VariableTagList
                  value={[
                    {
                      name:
                        item.type === ToolParamsTypeEnum.array
                          ? `${ToolParamsTypeShowEnum[item.type]}<${ToolParamsTypeShowEnum[item.subType || ToolParamsTypeEnum.string]}>`
                          : ToolParamsTypeShowEnum[item.type],
                      type: item.type,
                      subType: item.subType,
                      invalid: false,
                    },
                  ]}
                />
              ) : null}
              <VariableTagList value={transformParams({ params: item.params, variables })} />
            </div>
          </Field>
        );
      })}
    </>
  );
}
