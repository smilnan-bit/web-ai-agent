import type { FC } from 'react';
import { ConditionTag } from './condition-tag';
import { useVar } from '../../hooks/use-var';
import React from 'react';

export const VariableDisplay: FC<{
  keyPath?: string;
}> = ({ keyPath }) => {
  const { getVarInfo } = useVar();
  const { fromNodeName, varName, valid } = getVarInfo(keyPath);
  const name = keyPath ? `${fromNodeName} - ${varName}` : varName;
  return (
    <ConditionTag invalid={!valid} tooltip={name}>
      {name}
    </ConditionTag>
  );
};
