import React, { useEffect, useState } from 'react';
import { IconButton, Resizable } from '@douyinfe/semi-ui';
import { IconClose } from '@douyinfe/semi-icons';
import { useService, WorkflowDocument } from '@flowgram.ai/free-layout-editor';
import { useMemoizedFn } from 'ahooks';
import { debounce } from 'lodash-es';
import type { ValidateError } from '../../services';
import { workflowGlobalRegister, WorkflowEventNameEnum, workflowGlobalUnregister } from '../../event';
import { ProblemGroup } from './problem-list';
import { useWorkflowCheck } from '../../hooks';
import { ProblemPanelShowState } from '../../model';
import { useRecoilState } from 'recoil';
/**
 * 校验的触发频率
 */
const DEBOUNCE_TIME = 2000;
export const useWatchValidateWorkflow = (start) => {
  const { validateWorkflow } = useWorkflowCheck();
  const workflowDocument = useService<WorkflowDocument>(WorkflowDocument);
  const [errorList, setErrorList] = useState<ValidateError[]>([]);
  const func = useMemoizedFn(async () => {
    const result = await validateWorkflow();
    setErrorList(result.allErrors);
  });

  // 防抖优化，避免频繁校验
  const debounceValidate = useMemoizedFn(debounce(func, DEBOUNCE_TIME));

  useEffect(() => {
    let contentChangeDispose;
    if (start) {
      // 监听工作流文档内容变化
      contentChangeDispose = workflowDocument.onContentChange(() => {
        debounceValidate(); // 触发校验
      });
    }

    return () => {
      contentChangeDispose?.dispose();
    };
  }, [workflowDocument, start]);
  return { errorList, setErrorList };
};

const CheckList = () => {
  const [show, setShow] = useRecoilState(ProblemPanelShowState);
  const { errorList, setErrorList } = useWatchValidateWorkflow(show);
  const onClose = () => {
    setShow(false);
  };
  useEffect(() => {
    const cb = (errorList?: ValidateError[]) => {
      setShow(true);
      if ((errorList || []).length > 0) {
        setErrorList(errorList || []);
      }
    };
    const hideCb = () => {
      setShow(false);
    };
    workflowGlobalRegister(WorkflowEventNameEnum.PROBLEM_PANEL_SHOW, cb);
    workflowGlobalRegister(WorkflowEventNameEnum.PROBLEM_PANEL_HIDE, hideCb);
    return () => {
      workflowGlobalUnregister(WorkflowEventNameEnum.PROBLEM_PANEL_SHOW, cb);
      workflowGlobalUnregister(WorkflowEventNameEnum.PROBLEM_PANEL_HIDE, hideCb);
    };
  }, [setErrorList]);
  if (!show) {
    return null;
  }
  return (
    <div tw="w-full bg-white border border-solid border-[rgba(0, 0, 0, 0.06)] shadow-[0_2px_6px_0_rgba(0,0,0,0.12)] rounded-[4px] box-border">
      <Resizable
        enable={{
          top: true,
          left: false,
          right: false,
          bottom: false,
        }}
        minHeight={200}
        maxHeight={'80vh'}
        defaultSize={{
          height: 300,
        }}
        onChange={() => {}}
      >
        <div tw="flex flex-col h-full">
          <div
            tw="h-12 flex items-center justify-between px-4 py-3 flex-shrink-0 gap-2"
            style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}
          >
            <div tw="text-[16px] leading-[22px] font-medium">错误列表</div>
            <IconButton
              icon={<IconClose tw="text-[16px] text-[rgba(0, 0, 0, 0.45)]" />}
              type="tertiary"
              theme="borderless"
              onClick={onClose}
            />
          </div>
          <ProblemGroup list={errorList} />
        </div>
      </Resizable>
    </div>
  );
};

export default React.memo(CheckList);
