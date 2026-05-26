import { type FlowNodeJSON, nanoid, type FormMeta } from '@flowgram.ai/free-layout-editor';
import type { FlowNodeRegistry as CustomFlowNodeRegistry } from '../typings';
import { WorkflowNodeType } from './constants';
import { getNodeTitle } from '../utils';

type FlowNodeRegistryConfig = Omit<CustomFlowNodeRegistry, 'type'>;

export const genNodeFormConfig = <T>({
  type,
  config,
  formMeta,
  formData,
  blocksInitial = false,
}: {
  type: WorkflowNodeType;
  config: FlowNodeRegistryConfig;
  formMeta: FormMeta;
  formData?: T;
  blocksInitial?: boolean; // 是否有区块开始和结束节点，默认没有
}): CustomFlowNodeRegistry => {
  return {
    type,
    ...config,
    meta: {
      type,
      ...config.meta,
    },
    formMeta,
    onAdd: (ctx) => {
      return {
        type,
        id: nanoid(),
        data: {
          title: getNodeTitle(type, ctx),
          ...(formData || {}),
        },
        ...(blocksInitial
          ? {
              blocks: [
                {
                  id: `block_start_${nanoid(5)}`,
                  type: WorkflowNodeType.BlockStart,
                  meta: {
                    position: {
                      x: 32,
                      y: 0,
                    },
                  },
                  data: { title: '区块开始节点' },
                },
                {
                  id: `block_end_${nanoid(5)}`,
                  type: WorkflowNodeType.BlockEnd,
                  meta: {
                    position: {
                      x: 192,
                      y: 0,
                    },
                  },
                  data: { title: '区块结束节点' },
                },
              ],
            }
          : {}),
      };
    },
  };
};
