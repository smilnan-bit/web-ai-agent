import ToolModal from '@/components/ToolModal';
import React, { useContext, useMemo } from 'react';
import { AddNodeModalContext } from '../../context/add-node-modal-context';
import { WorkflowNodeType } from '../../nodes';
import { getToolDetail } from '@/api';
import type { AppsNS } from '@/types/Apps';
import { useMemoizedFn } from 'ahooks';
import { nanoid } from 'nanoid';
import { getNodeTitle, initSubWorkflowOutputParam, initWorkflowToolParam } from '../../utils';
import { useClientContext } from '@flowgram.ai/free-layout-editor';
import { text2object } from '@/utils';
import SubWorkflowModal from '../../nodes/sub-workflow/sub-workflow-select-modal';
import { useRecoilValue } from 'recoil';
import { BasicInfoState } from '../../model';
import { getGraphInfo, type SubWorkflowItem } from '../../api';
import { SubWorkflowNodeErrorEnum } from '../../nodes/sub-workflow/types';
import { textOutputParam } from '../../nodes/sub-workflow/config';
import { EndOutputTypeEnum } from '../../nodes/end/form';
import { INPUT_PARAM_FILTER_DEFAULT } from '../../constants';

const MODAL_Z_INDEX = 1000000;

export const AddNodeModal = () => {
  const { open, onAdd, setOpen, nodeType } = useContext(AddNodeModalContext);
  const ctx = useClientContext();
  const basicInfo = useRecoilValue(BasicInfoState);

  const modalCommonProps = {
    open,
    onCancel: () => setOpen(false),
    zIndex: MODAL_Z_INDEX,
  };

  const onToolAdd = useMemoizedFn(async (toolItem: Partial<AppsNS.ToolType>) => {
    if (!toolItem.toolId || !toolItem.toolboxId) {
      return;
    }
    const {
      data: { name, requestParams, toolId, responseParams, isTemplateTool } = {},
    } = await getToolDetail({ toolId: toolItem.toolId, toolboxId: toolItem.toolboxId });

    if (!onAdd) {
      console.error('onAdd function is not defined!');
      return;
    }

    onAdd({
      data: {
        name,
        title: getNodeTitle(WorkflowNodeType.Tool, ctx, name),
        toolId,
        toolboxId: toolItem.toolboxId,
        inputParam: requestParams?.map(initWorkflowToolParam) || [],
        outputParam:
          responseParams?.map(({ name, type, desc, subParams, subType }) => ({
            name,
            type,
            desc,
            subParams,
            subType,
          })) || [],
        isTemplateTool,
      },
      type: WorkflowNodeType.Tool,
      id: nanoid(),
    });
    setOpen(false);
  });

  const onSubWorkflowAdd = useMemoizedFn(async (subWorkflowItem: Partial<SubWorkflowItem>) => {
    if (!subWorkflowItem.workflowId) {
      return;
    }
    if (!onAdd) {
      console.error('onAdd function is not defined!');
      return;
    }

    const { data } = await getGraphInfo({ workflowId: subWorkflowItem.workflowId });
    const { workflowNodeList } = data || {};
    const startNode = workflowNodeList?.find((item) => item.nodeType === WorkflowNodeType.Start);
    const endNode = workflowNodeList?.find((item) => item.nodeType === WorkflowNodeType.End);
    const endNodeData = text2object(endNode?.action)?.param;
    const workflowOutputParams =
      endNodeData?.returnType === EndOutputTypeEnum.text
        ? textOutputParam
        : endNodeData?.returnType === EndOutputTypeEnum.silence
          ? []
          : initSubWorkflowOutputParam(endNodeData?.outputParam);

    const workflowInputParams =
      text2object(startNode?.action)?.param.inputParam?.slice(INPUT_PARAM_FILTER_DEFAULT.length) || [];

    onAdd({
      type: WorkflowNodeType.SubWorkflow,
      id: nanoid(),
      data: {
        title: getNodeTitle(WorkflowNodeType.SubWorkflow, ctx),
        refWorkflowId: subWorkflowItem.workflowId,
        workflowName: data?.workflowName,
        workflowDesc: data?.workflowDesc,
        inputParam: workflowInputParams?.map(initWorkflowToolParam) || [],
        outputParam: workflowOutputParams,
        returnType: endNodeData?.returnType,
        settingOnError: {
          processType: SubWorkflowNodeErrorEnum.break,
        },
      },
    });
    setOpen(false);
  });

  const NodeModal = useMemo(() => {
    if (!onAdd) return null;
    if (nodeType === WorkflowNodeType.Tool) {
      return <ToolModal onAdd={onToolAdd} onDelete={() => {}} hasAddedList={[]} {...modalCommonProps} />;
    } else if (nodeType === WorkflowNodeType.SubWorkflow) {
      return (
        <SubWorkflowModal
          onConfirm={onSubWorkflowAdd}
          currentWorkflowId={basicInfo?.workflowId}
          {...modalCommonProps}
        />
      );
    }
    return null;
  }, [nodeType, onAdd, open, setOpen, onToolAdd, onSubWorkflowAdd, basicInfo?.workflowId]);
  return NodeModal;
};
