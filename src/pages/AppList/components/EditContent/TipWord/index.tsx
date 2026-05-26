import { Input, Tooltip } from 'antd';
import React, { useCallback, useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import debounce from 'lodash/debounce';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { CurrentAppState, GlobalConfigState } from '@/model';
import { AppEventBus } from '@/pages/AppList/event';
import { EventTypeEnum } from '@/constants/eventType';
import DiffComp from '@/pages/AppList/components/EditContent/DiffComp';
import useAgentHistory from '@/pages/AppList/components/EditContent/History/useAgentHistory';

import AiPromptModal from '@/pages/AppList/components/EditContent/TipWord/AiPromptModal';
import type { AiPromptModalRef } from '@/pages/AppList/components/EditContent/TipWord/AiPromptModal';
import { IconAIfuzhu } from '@/assets/icons';
import PromptInput from '../PromptInput';

import './index.less';

const TipWord: React.FC = () => {
  const [currentApp, setCurrentApp] = useRecoilState(CurrentAppState);
  const { isHistoryMode } = useAgentHistory();

  const AiPromptRef = React.useRef<AiPromptModalRef>(null);

  const saveData = useCallback(
    (value) => AppEventBus.emit(EventTypeEnum.saveAppData, { prompt: value }, false, false),
    [],
  );
  const debounceSave = useMemo(() => debounce(saveData, 1500), [saveData]);

  const onInputChange = useCallback(
    (value) => {
      setCurrentApp((pre) => ({ ...pre, prompt: value }));
      debounceSave(value);
    },
    [debounceSave, setCurrentApp],
  );

  const handleOpenAiPrompt = useCallback(() => {
    AiPromptRef.current?.open();
  }, []);

  return (
    <div className="TipWord">
      <div className="TipWord-title">
        <div>
          <span>提示词</span>
          <Tooltip title="提示词用于对AI Agent的回复作出一系列约束和指令。你可以在这里定义AI Agent的人设、技能及其思维逻辑、工作流程、条件限制等，这些提示词内容不会被最终用户看到">
            <QuestionCircleOutlined style={{ marginLeft: 8, color: '#00000073' }} />
          </Tooltip>
        </div>
        {!isHistoryMode ? <IconAIfuzhu size={18} onClick={handleOpenAiPrompt} style={{ cursor: 'pointer' }} /> : null}
      </div>
      <div className="TipWord-text">
        {!isHistoryMode ? <PromptInput value={currentApp.prompt} onChange={onInputChange} /> : <DiffComp />}
      </div>
      <AiPromptModal ref={AiPromptRef} />
    </div>
  );
};

export default TipWord;
