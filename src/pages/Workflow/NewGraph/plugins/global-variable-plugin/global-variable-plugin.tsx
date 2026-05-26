import {
    GlobalScope,
    definePluginCreator,
    PluginCreator,
    ASTFactory,
    FreeLayoutPluginContext
  } from '@flowgram.ai/free-layout-editor';
import { IconQuanjubianliang } from '../../nodes/icons';
import React from 'react';
import { createASTFromType } from '../../utils/variables';
import { GLOBAL_VARIABLE_ID, setGlobalVariable, VarStatusEnum, VarType } from '../../constants';
import { getVarList } from '@/pages/Var/api';
  export interface SyncVariablePluginOptions {}
  

  export const createGlobalVariablePlugin: PluginCreator<SyncVariablePluginOptions> =
    definePluginCreator<SyncVariablePluginOptions, FreeLayoutPluginContext>({
      async onInit(ctx, options) {
        const globalScope = ctx.get(GlobalScope);
        const { data } = await getVarList();
        const list = (data?.list || []).filter(item => item.status === VarStatusEnum.open) as VarType[];
        setGlobalVariable(list);
        globalScope.setVar(
            ASTFactory.createVariableDeclaration({
                key: `${GLOBAL_VARIABLE_ID}`,
                meta: {
                  title: '全局变量',
                  icon: <IconQuanjubianliang tw="mr-1" />,
                  disabled: true,
                },
                type: ASTFactory.createObject({
                  properties: list.map(item=> ASTFactory.createProperty({
                    meta: {...item, isGlobal: true, title: item.name},
                    key: item.id?.toString() || '',
                    type: createASTFromType({type: item.type}),
                  })),
                }),
              })
        )
      },
    })