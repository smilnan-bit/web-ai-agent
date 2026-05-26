import React, { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { IconGuanbi, IconPeizhi, Yulan } from '@/assets/icons';
import { InputParamsPanel } from './input-params-panel';
import { SidebarContext } from '../../context';
import SimulateSessionPanel from '@/components/SimulateSessionPanel';
import { useSetRecoilState } from 'recoil';
import { TestRunDataState } from '../../model';
import TestChatPanel from './test-chat-panel';
import { useGetWorkflowInput } from '../../hooks/use-get-workflow-input';
import { INPUT_PARAM_FILTER_DEFAULT } from '../../constants';

type PanelType = 'inputParams' | 'chat';
const TestRunPanel = () => {
  const { showTestRunPanel, setShowTestRunPanel, currentVersion } = useContext(SidebarContext);
  const [showPanelType, setShowPanelType] = useState<PanelType>('inputParams');
  const [showSimulateSession, setShowSimulateSession] = useState(false);
  const [simulateInfo, setSimulateInfo] = useState<{ sessionId?: string; startNodeParams?: Record<string, any> }>({
    sessionId: '',
    startNodeParams: {},
  });
  const setTestRunData = useSetRecoilState(TestRunDataState);
  const getWorkflowInput = useGetWorkflowInput();

  // 获取 inputParam，每次渲染时调用以获取最新值
  // 在版本改变时，可以通过重新渲染来获取最新参数
  const workflowInput = getWorkflowInput();
  const { inputParam } = workflowInput;

  // 使用序列化字符串作为依赖，确保只有在内容真正变化时才更新引用
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const inputParamFilterDefault = useMemo(() => {
    return inputParam?.slice(INPUT_PARAM_FILTER_DEFAULT.length);
  }, [JSON.stringify(inputParam)]);
  const prevShowTestRunPanelRef = useRef(false);
  const prevVersionRef = useRef<number | undefined>(currentVersion);

  // 监听版本变化，当版本切换后重新获取输入参数并更新面板类型
  useEffect(() => {
    // 如果版本发生变化（包括从 undefined 到有值，或从有值到 undefined）
    if (prevVersionRef.current !== currentVersion) {
      prevVersionRef.current = currentVersion;
      // 版本变化后，重新获取输入参数并更新面板类型
      // 延迟一下确保画布已经加载完成（workflow-history 中 reload 后也有 100ms 的 fitView 延迟）
      const timer = setTimeout(() => {
        const latestInput = getWorkflowInput();
        const latestInputParam = latestInput.inputParam;
        const latestInputParamFilterDefault = latestInputParam?.slice(INPUT_PARAM_FILTER_DEFAULT.length);
        // 根据最新的输入参数决定显示哪个面板
        if (latestInputParamFilterDefault?.length) {
          setShowPanelType('inputParams');
        } else {
          setShowPanelType('chat');
          setSimulateInfo((prev) => ({ ...prev, startNodeParams: {} }));
        }
      }, 200); // 等待画布加载完成（比 workflow-history 中的 fitView 延迟稍长）

      return () => {
        clearTimeout(timer);
      };
    }
  }, [currentVersion, getWorkflowInput]);

  useEffect(() => {
    if (showTestRunPanel && !prevShowTestRunPanelRef.current) {
      // 只在面板首次打开时自动设置面板类型
      inputParamFilterDefault?.length ? setShowPanelType('inputParams') : setShowPanelType('chat');
    }
    prevShowTestRunPanelRef.current = showTestRunPanel;
  }, [showTestRunPanel, inputParamFilterDefault]);

  const onStartChat = useCallback((values: Record<string, any>) => {
    setSimulateInfo((prev) => ({ ...prev, startNodeParams: values }));
    setShowPanelType('chat');
  }, []);

  return (
    <div style={{ display: showTestRunPanel ? 'block' : 'none' }} tw="bg-white h-full">
      <div tw="px-[16px] py-[12px] font-bold text-[18px] flex items-center border-0 border-t-[3px] border-t-[#12b76a] border-solid border-b-[1px] border-b-[rgba(0,0,0,0.06)]">
        <span tw="flex items-center">
          <Yulan size={20} color="#12b76a" style={{ marginRight: 8 }} />
          调试和预览
        </span>
        <div tw="ml-auto flex items-center">
          <IconPeizhi
            color={showSimulateSession ? '#337EFF' : '#000'}
            onClick={() => setShowSimulateSession((prev) => !prev)}
            tw="mr-2 cursor-pointer"
          />
          <IconGuanbi
            onClick={() => {
              // 只需关闭面板，readonly 状态由 editor.tsx 统一管理
              setShowTestRunPanel(false);
            }}
            tw="cursor-pointer"
          />
        </div>
      </div>
      {showPanelType === 'inputParams' && <InputParamsPanel onStartChat={onStartChat} />}
      {showPanelType === 'chat' && <TestChatPanel onListChange={setTestRunData} simulateInfo={simulateInfo} />}
      {showSimulateSession && (
        <SimulateSessionPanel
          onSave={(_info) => {
            setSimulateInfo((prev) => ({ ...prev, ..._info }));
            setShowSimulateSession(false);
          }}
          onCancel={() => setShowSimulateSession(false)}
          simulateSessionInfo={{ sessionId: simulateInfo.sessionId }}
        />
      )}
    </div>
  );
};

export default TestRunPanel;
