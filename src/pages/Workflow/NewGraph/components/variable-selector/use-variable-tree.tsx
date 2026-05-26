import React, { useCallback } from 'react';

import { type IJsonSchema, JsonSchemaUtils, useTypeManager } from '@flowgram.ai/json-schema';
import { ASTMatch, type BaseVariableField, useAvailableVariables } from '@flowgram.ai/free-layout-editor';
import type { TreeNodeData } from '@douyinfe/semi-ui/lib/es/tree';
import { Icon } from '@douyinfe/semi-ui';

export type VariableSelectorField = BaseVariableField<{
  icon?: string | JSX.Element;
  title?: string;
  disabled?: boolean;
}>;

export function useVariableTree(params: {
  includeSchema?: IJsonSchema | IJsonSchema[];
  excludeSchema?: IJsonSchema | IJsonSchema[];
  customSkip?: (variable: VariableSelectorField) => boolean;
}): TreeNodeData[] {
  const { includeSchema, excludeSchema, customSkip } = params;

  const typeManager = useTypeManager() as ReturnType<typeof useTypeManager> & {
    getDisplayIcon?: (schema: IJsonSchema | Record<string, unknown>) => React.ReactNode;
  };
  const variables = useAvailableVariables();

  const getVariableTypeIcon = useCallback(
    (variable: VariableSelectorField) => {
      if (variable.meta?.icon) {
        if (typeof variable.meta.icon === 'string') {
          return <img style={{ marginRight: 8 }} width={12} height={12} src={variable.meta.icon} />;
        }

        return variable.meta.icon;
      }

      const schema = JsonSchemaUtils.astToSchema(variable.type, { drilldownObject: false });

      const displayIcon = typeManager?.getDisplayIcon?.(schema || {});
      return <Icon size="small" svg={displayIcon} />;
    },
    [typeManager],
  );

  const renderVariable = (
    variable: VariableSelectorField,
    parentFields: VariableSelectorField[] = [],
  ): TreeNodeData | null => {
    const type = variable?.type;

    if (!type) {
      return null;
    }

    let children: TreeNodeData[] | undefined;

    if (ASTMatch.isObject(type)) {
      children = (type.properties || [])
        .map((_property) => renderVariable(_property as VariableSelectorField, [...parentFields, variable]))
        .filter(Boolean) as TreeNodeData[];
    }

    const keyPath = [...parentFields.map((_field) => _field.key), variable.key];
    const key = keyPath.join('.');

    const isSchemaInclude = includeSchema ? JsonSchemaUtils.isASTMatchSchema(type, includeSchema) : true;
    const isSchemaExclude = excludeSchema ? JsonSchemaUtils.isASTMatchSchema(type, excludeSchema) : false;
    const isCustomSkip = customSkip ? customSkip(variable) : false;

    // disabled in meta when created
    const isMetaDisabled = variable.meta?.disabled;

    const isSchemaMatch = isSchemaInclude && !isSchemaExclude && !isCustomSkip && !isMetaDisabled;

    // If not match, and no children, return null
    if (!isSchemaMatch && !children?.length) {
      return null;
    }

    return {
      key: key,
      label: variable.meta?.title || variable.key,
      value: key,
      keyPath,
      icon: getVariableTypeIcon(variable),
      children,
      disabled: !isSchemaMatch,
      rootMeta: parentFields[0]?.meta || variable.meta,
      isRoot: !parentFields?.length,
    };
  };

  return [...variables.slice(0).reverse()]
    .map((_variable) => renderVariable(_variable as VariableSelectorField))
    .filter(Boolean) as TreeNodeData[];
}
