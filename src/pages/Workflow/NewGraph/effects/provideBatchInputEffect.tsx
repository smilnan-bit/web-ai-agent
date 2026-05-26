import React from 'react';
import {
  ASTFactory,
  createEffectFromVariableProvider,
  type EffectOptions,
  type VariableAbilityParseContext,
  getNodeForm,
} from '@flowgram.ai/free-layout-editor';
import { isArray, uniqBy } from 'lodash';
import { getRefVariable } from '../utils/variables';
import { ToolParamsTypeEnum } from '@/constants';

//为批处理节点等提供内部子画布用私有变量
export const provideBatchInputEffect: EffectOptions[] = createEffectFromVariableProvider({
  private: true,
  parse: (value: unknown[], ctx: VariableAbilityParseContext) => {
    const Icon = ctx.node.getNodeRegistry().info?.icon;
    const list = uniqBy(
      isArray(value) ? value : [value],
      (_child) => _child?.name,
      //  No variable is generated when the Preset variable is not enabled
    ).filter((v) => v && v.name && !(v.isPreset && !v.enabled));
    return [
      ASTFactory.createVariableDeclaration({
        key: ctx.node.id,
        meta: {
          title: getNodeForm(ctx.node)?.getValueIn('title') || ctx.node.id,
          icon: <Icon tw="mr-1" />,
        },
        type: ASTFactory.createObject({
          properties: [
            ...(list?.map((item) =>
              //取数组的子项
              ASTFactory.createProperty({
                key: item.name,
                meta: {
                  // 此处直接传子类型
                  type: getRefVariable(item.value)?.subType || ToolParamsTypeEnum.string,
                  title: `item(in ${item.name})`,
                },
                initializer: ASTFactory.createEnumerateExpression({
                  enumerateFor: ASTFactory.createKeyPathExpression({
                    keyPath: getRefVariable(item.value)?.fullNamePath || [],
                  }),
                }),
              }),
            ) || []),
            ASTFactory.createProperty({
              key: 'index',
              meta: {
                type: ToolParamsTypeEnum.integer,
              },
              type: ASTFactory.createInteger(),
            }),
          ],
        }),
      }),
    ];
  },
});
