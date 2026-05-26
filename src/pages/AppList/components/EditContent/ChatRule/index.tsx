import React from 'react';
import { InputNumber, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useDebounceFn } from 'ahooks';
import { CurrentAppState } from '@/model';
import { AppEventBus } from '@/pages/AppList/event';
import { EventTypeEnum } from '@/constants/eventType';
import useAgentHistory from '@/pages/AppList/components/EditContent/History/useAgentHistory';
import MultipleEdit from '../MutipleEdit';

const ChatRule: React.FC = () => {
  const { sessionSetting } = useRecoilValue(CurrentAppState);
  const setCurrentApp = useSetRecoilState(CurrentAppState);
  const [err, setErr] = React.useState('');
  const { isHistoryMode } = useAgentHistory();

  const { run: debounceSave } = useDebounceFn(
    (contextRound) => {
      if ([undefined, null].includes(contextRound) || contextRound < 0 || contextRound > 30) {
        setErr('仅可输入0-30');
        return;
      }
      setErr('');
      AppEventBus.emit(
        EventTypeEnum.saveAppData,
        {
          sessionSetting: { contextRound },
        },
        true,
        false,
      );
    },
    { wait: 800 },
  );
  const onChange = (contextRound) => {
    setCurrentApp((pre) => ({ ...pre, sessionSetting: { contextRound } }));
    debounceSave(contextRound);
  };

  return (
    <MultipleEdit
      title="对话规则"
      customContent={
        <>
          <div style={{ padding: '12px 16px' }}>
            携带上下文轮数：
            <Tooltip title="将当前会话中的前X轮对话内容给到Agent做上下文理解">
              <InfoCircleOutlined style={{ color: 'var(--tip-color)' }} />
            </Tooltip>
            <InputNumber
              style={{ marginLeft: 8, marginRight: 8, width: 64 }}
              precision={0}
              controls={false}
              value={sessionSetting?.contextRound}
              onChange={onChange}
              disabled={isHistoryMode}
            />
            轮{err && <div style={{ color: 'red', marginTop: 4 }}>{err}</div>}
          </div>
        </>
      }
      showAdd={false}
    />
  );
};

export default ChatRule;
