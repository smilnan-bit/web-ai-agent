import { JsonSchemaUtils } from '@flowgram.ai/form-materials';
import React from 'react';
import {
  ASTFactory,
  createEffectFromVariableProvider,
  defineFormPluginCreator,
  EffectOptions,
  FlowNodeScopeType,
  FormPluginCreator,
  getNodeForm,
  getNodePrivateScope,
  getNodeScope,
  ScopeChainTransformService,
} from '@flowgram.ai/free-layout-editor';
import { set } from 'lodash';
import { WorkflowNS } from '@/types/Workflow';
import { getRefVariable } from '../../utils/variables';
import { ToolParamsTypeEnum } from '@/constants';
import { autoChangeRefEffect } from '../../effects/autoChangeRefEffect';

export const provideBatchOutputsEffect: EffectOptions[] = createEffectFromVariableProvider({
  parse: (params: WorkflowNS.WorkflowSimpleParamType[], ctx) => {
    const Icon = ctx.node.getNodeRegistry().info?.icon;
    return [
      ASTFactory.createVariableDeclaration({
        key: `${ctx.node.id}`,
        meta: {
          title: getNodeForm(ctx.node)?.getValueIn('title') || ctx.node.id,
          icon: <Icon tw="mr-1" />,
        },
        type: ASTFactory.createObject({
          properties: params.map(({ name, value }) =>
            ASTFactory.createProperty({
              key: name,
              meta: {
                name,
                type: ToolParamsTypeEnum.array,
                subType: getRefVariable(value)?.type || ToolParamsTypeEnum.string,
              },
              initializer: ASTFactory.createWrapArrayExpression({
                wrapFor: ASTFactory.createKeyPathExpression({
                  keyPath: getRefVariable(value)?.fullNamePath || [],
                }),
              }),
            }),
          ),
        }),
      }),
    ];
  },
});

/**
 * Free Layout only right now
 */
/**
 * Free Layout only right now
 */
export const createBatchOutputsFormPlugin: FormPluginCreator<{
  outputKey: string;
  /**
   * if set, infer json schema to inferTargetKey when submit
   */
  inferTargetKey?: string;
  outputPrivateScope?: boolean;
}> = defineFormPluginCreator({
  name: 'batch-outputs-plugin',
  onSetupFormMeta({ mergeEffect, addFormatOnSubmit }, { outputKey, inferTargetKey }) {
    mergeEffect({
      [outputKey]: [...provideBatchOutputsEffect, ...autoChangeRefEffect()], // 为后序节点产出变量
    });

    if (inferTargetKey) {
      addFormatOnSubmit((formData, ctx) => {
        const outputVariable = getNodeScope(ctx.node).output.variables?.[0];

        if (outputVariable?.type) {
          set(formData, inferTargetKey, JsonSchemaUtils.astToSchema(outputVariable?.type));
        }

        return formData;
      });
    }
  },
  onInit(ctx, { outputKey, outputPrivateScope }) {
    const chainTransformService = ctx.node.getService(ScopeChainTransformService);

    const batchNodeType = ctx.node.flowNodeType;

    const transformerId = `${batchNodeType}-outputs`;

    if (chainTransformService.hasTransformer(transformerId)) {
      return;
    }

    chainTransformService.registerTransformer(transformerId, {
      transformCovers: (covers, ctx) => {
        const node = ctx.scope.meta?.node;

        // Child Node's variable can cover parent
        if (node?.parent?.flowNodeType === batchNodeType) {
          return [...covers, getNodeScope(node.parent)];
        }

        return covers;
      },
      transformDeps(scopes, ctx) {
        const scopeMeta = ctx.scope.meta;

        if (scopeMeta?.type === FlowNodeScopeType.private) {
          return scopes;
        }

        const node = scopeMeta?.node;

        // Public of Loop Node depends on child Node
        if (node?.flowNodeType === batchNodeType) {
          // Get all child blocks (including nested blocks)
          const collectAllBlocks = (blocks: any[] = []): any[] => {
            const result: any[] = [];
            const stack = [...blocks];

            while (stack.length > 0) {
              const current = stack.shift();
              if (!current) continue;
              result.push(current);

              if (Array.isArray(current.blocks) && current.blocks.length > 0) {
                stack.push(...current.blocks);
              }
            }

            return result;
          };

          const allChildBlocks = collectAllBlocks(node.blocks || []);

          // public scope of all child blocks (flattened)
          return [
            ...(outputPrivateScope ? [getNodePrivateScope(node)] : []), // 此处会将节点产出的私有变量也返回
            ...allChildBlocks.map((_childBlock) => getNodeScope(_childBlock)),
          ];
        }

        return scopes;
      },
    });
  },
});