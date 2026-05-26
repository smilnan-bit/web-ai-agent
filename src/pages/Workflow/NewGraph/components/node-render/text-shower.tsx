import React from 'react';
import { useNodeRenderContext } from '../../hooks';
import { Field } from './field';
import { Tooltip } from '@douyinfe/semi-ui';
import { useWatchFormValues } from '@flowgram.ai/free-layout-editor';

const TextShower = ({ fieldName, label, value }: { fieldName?: string; label?: string; value?: string }) => {
  const nodeRender = useNodeRenderContext();
  const data = useWatchFormValues(nodeRender.node);
  const text = value || data?.[fieldName || 'content'] || '';
  return (
    <Field label={label || '输出内容'} isEmpty={!text?.trim()}>
      <div tw="flex">
        <Tooltip
          content={
            <div tw="text-[rgba(15,21,40, 0.82)] text-[14px] break-words break-all max-h-[500px] overflow-y-auto">
              {text}
            </div>
          }
          style={{
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div tw="truncate">
            <span tw="cursor-pointer">{text}</span>
          </div>
        </Tooltip>
      </div>
    </Field>
  );
};

export default TextShower;
