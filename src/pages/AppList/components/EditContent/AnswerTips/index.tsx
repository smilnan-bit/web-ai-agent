import React from 'react';
import { Input } from 'antd';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useDebounceFn } from 'ahooks';
import { CurrentAppState } from '@/model';
import { AppEventBus } from '@/pages/AppList/event';
import { EventTypeEnum } from '@/constants/eventType';
import useAgentHistory from '@/pages/AppList/components/EditContent/History/useAgentHistory';
import MultipleEdit from '../MutipleEdit';

const ANSWER_TIPS_MAX_LENGTH = 50;

const AnswerTips: React.FC = () => {
  const { answerTipsSetting } = useRecoilValue(CurrentAppState) || {};
  const setCurrentApp = useSetRecoilState(CurrentAppState);
  const { isHistoryMode } = useAgentHistory();

  const { run: debounceSave } = useDebounceFn(
    (answerTips: string) => {
      // 清空时传 { answerTips: "" }，后端会清除该值
      AppEventBus.emit(EventTypeEnum.saveAppData, { answerTipsSetting: { answerTips } }, true, false);
    },
    { wait: 800 },
  );

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const answerTips = e.target.value;
    setCurrentApp((pre) => ({ ...pre, answerTipsSetting: { answerTips } }));
    debounceSave(answerTips);
  };

  return (
    <MultipleEdit
      title="应答提示"
      customContent={
        <div style={{ padding: '8px 16px' }}>
          <Input.TextArea
            value={answerTipsSetting?.answerTips ?? ''}
            onChange={onChange}
            placeholder={`可填写当前Agent的应答提示语，当Agent发送消息后，该提示语会作为尾缀，优先级（Agent>大模型应答提示）例如"此消息由AI生成"`}
            maxLength={ANSWER_TIPS_MAX_LENGTH}
            showCount
            bordered={false}
            autoSize={{ minRows: 5, maxRows: 5 }}
            disabled={isHistoryMode}
          />
        </div>
      }
      showAdd={false}
    />
  );
};

export default AnswerTips;
