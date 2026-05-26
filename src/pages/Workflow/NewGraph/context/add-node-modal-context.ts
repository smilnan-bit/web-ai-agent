import React from 'react';
import type { WorkflowNodeType } from '../nodes';
import type { IPoint, WorkflowNodeJSON } from '@flowgram.ai/free-layout-editor';

export type OtherAddParams = {
  nodeType?: WorkflowNodeType;
  position?: IPoint;
  containerId?: string;
};

export const AddNodeModalContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  nodeType?: WorkflowNodeType;
  setNodeType?: (nodeType: WorkflowNodeType) => void;
  onAdd?: (addJson: WorkflowNodeJSON) => void;
  setOnAdd?: (onAdd: (addJson: WorkflowNodeJSON) => void) => void;
}>({ open: false, setOpen: () => {} });
