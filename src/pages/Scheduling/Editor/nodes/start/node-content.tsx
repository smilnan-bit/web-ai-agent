import React from 'react';
import { NodeCardBody, NodeRow, VarChip } from '../../components/NodeCardHelpers';

export function StartNodeContent() {
  return (
    <NodeCardBody>
      <NodeRow label="输入">
        <VarChip name="BOT_USER_INPUT" />
        <VarChip name="HISTORY_CONTEXT" />
      </NodeRow>
    </NodeCardBody>
  );
}
