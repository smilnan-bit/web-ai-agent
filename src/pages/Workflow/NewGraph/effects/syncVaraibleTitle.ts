import { DataEvent, type Effect, type EffectOptions, FlowNodeVariableData } from '@flowgram.ai/free-layout-editor';

export const syncVariableTitle: EffectOptions[] = [
  {
    event: DataEvent.onValueChange,
    effect: (({ value, context }) => {
      context.node.getData(FlowNodeVariableData).allScopes.forEach((_scope) => {
        _scope.output.variables.forEach((_var) => {
          _var.updateMeta({
            ...(_var.meta || {}),
            title: value || context.node.id,
          });
        });
      });
    }) as Effect,
  },
];
