import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Bianpai, IconPeizhi, Yulan } from '@/assets/icons';
import AgentHistory from '@/pages/AppList/components/EditContent/History';
import useAgentHistory from '@/pages/AppList/components/EditContent/History/useAgentHistory';
import { CurrentAppState, GlobalConfigState } from '@/model';
import { AgentModeEnum } from '@/constants';
import TipWord from './TipWord';
import Knowledge from './Knowledge';
import Memory from './Memory';
import Tools from './Tools';
import AppDebugChat from './AppDebugChat';
import Workflow from './Workflow';
import WorkflowBind from './WorkflowBind';
import Skills from './Skills';
import './index.less';
import ChatRule from './ChatRule';
import LLMSet from './LLMSet';
import AnswerTips from './AnswerTips';

const EditContent: React.FC = () => {
  const [showSimulateSession, setShowSimulateSession] = useState(false);
  const { isHistoryMode } = useAgentHistory();
  const { mode } = useRecoilValue(CurrentAppState) || {};
  console.log('mode', mode);
  const isWorkflowMode = mode === AgentModeEnum.workflow;
  const globalConfig = useRecoilValue(GlobalConfigState) || {};

  return (
    <div className="EditContent">
      <div className="EditContent-edit">
        <div className="EditContent-edit-title">
          <Bianpai color="#337eff" size={20} style={{ marginRight: 8, marginLeft: 0 }} />
          编排
        </div>
        <div className="EditContent-edit-content">
          {!isWorkflowMode && (
            <div className="EditContent-edit-content-left">
              <TipWord />
            </div>
          )}
          <div className="EditContent-edit-content-right">
            {isWorkflowMode ? (
              <>
                <WorkflowBind />
                <LLMSet />
                <ChatRule />
                <AnswerTips />
              </>
            ) : (
              <>
                <LLMSet />
                <Tools />
                {globalConfig.agentSkillEnabled && <Skills />}
                <Workflow />
                <Knowledge />
                {globalConfig?.agentMemoryPermission && <Memory />}
                <ChatRule />
                <AnswerTips />
              </>
            )}
          </div>
        </div>
      </div>
      <div className="EditContent-preview">
        <div className="EditContent-preview-title">
          <span tw="flex items-center">
            <Yulan size={20} color="#12b76a" style={{ marginRight: 8 }} />
            调试和预览
          </span>
          <IconPeizhi
            color={showSimulateSession ? '#337EFF' : '#000'}
            onClick={() => setShowSimulateSession((prev) => !prev)}
          />
        </div>
        <AppDebugChat showSimulateSession={showSimulateSession} setShowSimulateSession={setShowSimulateSession} />
      </div>
      {isHistoryMode ? <AgentHistory className={'EditContent-history'} /> : null}
    </div>
  );
};

export default EditContent;
