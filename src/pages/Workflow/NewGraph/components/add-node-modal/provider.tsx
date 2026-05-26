import React, { useEffect, useState } from 'react';

import { AddNodeModalContext } from '../../context';
import type { WorkflowNodeJSON } from '@flowgram.ai/free-layout-editor';
import type { WorkflowNodeType } from '../../nodes';
import { WorkflowEventNameEnum, workflowGlobalRegister, workflowGlobalUnregister } from '../../event';

export function AddNodeModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<boolean>(false);
  const [nodeType, setNodeType] = useState<WorkflowNodeType>();
  const [onAdd, setOnAdd] = useState<((addJson: WorkflowNodeJSON) => void) | undefined>();

  useEffect(() => {
    const cb = (payload: { open: boolean; nodeType: WorkflowNodeType; onAdd: (addJson: WorkflowNodeJSON) => void }) => {
      setOpen(payload.open);
      setNodeType(payload.nodeType);
      setOnAdd(() => payload.onAdd);
    };
    workflowGlobalRegister(WorkflowEventNameEnum.ADD_NODE_MODAL_OPEN, cb);
    return () => {
      workflowGlobalUnregister(WorkflowEventNameEnum.ADD_NODE_MODAL_OPEN, cb);
    };
  }, []);

  return (
    <AddNodeModalContext.Provider
      value={{
        open,
        setOpen,
        setNodeType,
        nodeType,
        onAdd,
        setOnAdd,
      }}
    >
      {children}
    </AddNodeModalContext.Provider>
  );
}
