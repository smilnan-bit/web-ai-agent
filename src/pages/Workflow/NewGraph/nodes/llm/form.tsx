import React, { useCallback, useEffect, useState } from 'react';
import { useWatch, type InputParamsType, type OutputParamsType } from '@form';
import { ParamsFormWithValue } from '@form/input-output';
import { v4 as uuidv4 } from 'uuid';
import { SelectModel } from './model';
import { ParamsForm } from '../../form-components/input-output/form';
import FormPrompt from '../../form-components/form-prompt';
import FormFragment from '../../components/form-fragment';
import { PLACEHOLDER_TEXT } from '@/constants/placeholderText';
import { NodeDebugPanel } from '../../components/node-debug-panel';

import { useRecoilValue } from 'recoil';
import { BasicInfoState } from '../../model';
import { WorkflowEventNameEnum, workflowGlobalRegister, workflowGlobalUnregister } from '../../event';
import { useNodeRenderContext } from '../../hooks';
import { type MsgProps, useSteamMsg } from '@/utils';

export type LlmFormData = {
  mode: number;
  tipWord: string;
  temperature: number;
  inputParam: InputParamsType[];
  outputParam: OutputParamsType[];
};

const FormContent = () => {
  const [debugPanelVisible, setDebugPanelVisible] = useState(false);
  const basicInfo = useRecoilValue(BasicInfoState);
  const { workflowId } = basicInfo || {};
  const { node } = useNodeRenderContext();

  const mode = useWatch<LlmFormData['mode']>('mode');
  const tipWord = useWatch<LlmFormData['tipWord']>('tipWord');
  const temperature = useWatch<LlmFormData['temperature']>('temperature');
  const inputParam = useWatch<LlmFormData['inputParam']>('inputParam') || [];
  const outputParam = useWatch<LlmFormData['outputParam']>('outputParam') || [];

  const [debugLoading, setDebugLoading] = useState(false);
  const [debugUuid, setDebugUuid] = useState('');
  const [errorMsg, setErrorMsg] = useState<MsgProps>();

  const { msg, finish, requestMsg } = useSteamMsg({
    loading: debugLoading,
    setLoading: setDebugLoading,
    uuid: debugUuid,
    requestUrl: '/agent/api/workflow/debug/executeLlmNode',
    onError: setErrorMsg,
  });

  // 监听 FormHeader 的测试按钮点击事件
  useEffect(() => {
    const handleDebugPanelOpen = (nodeId: string) => {
      if (nodeId === node?.id) {
        setDebugPanelVisible(true);
        const newUuid = uuidv4();
        setDebugUuid(newUuid);
      }
    };
    workflowGlobalRegister(WorkflowEventNameEnum.NODE_DEBUG_PANEL_OPEN, handleDebugPanelOpen);
    return () => {
      workflowGlobalUnregister(WorkflowEventNameEnum.NODE_DEBUG_PANEL_OPEN, handleDebugPanelOpen);
    };
  }, [node?.id]);

  const handleExecute = useCallback(
    async (params: Record<string, any>) => {
      if (!workflowId) return;
      setErrorMsg(undefined);
      // 调用 SSE 请求
      requestMsg({
        workflowId,
        mode,
        tipWord,
        temperature,
        inputParams: params,
        outputParams: outputParam,
      });

      // 返回 undefined 表示使用流式输出
      return undefined;
    },
    [workflowId, mode, tipWord, temperature, outputParam, requestMsg],
  );

  return (
    <>
      <SelectModel />
      <ParamsFormWithValue />
      <FormFragment title="提示词" required>
        <div tw="pt-4">
          <FormPrompt name="tipWord" placeholder={`用户提示词, ${PLACEHOLDER_TEXT}`} />
        </div>
      </FormFragment>
      <ParamsForm />
      {debugPanelVisible && (
        <NodeDebugPanel
          inputParam={inputParam}
          onExecute={handleExecute}
          onClose={() => setDebugPanelVisible(false)}
          disabled={!tipWord}
          streamingOutput={errorMsg?.content || msg}
          isStreaming={!finish}
        />
      )}
    </>
  );
};

export default FormContent;
