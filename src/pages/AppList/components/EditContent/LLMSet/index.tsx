import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { InputNumber, Select, Slider } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Tooltip from 'antd/es/tooltip';
import { useDebounceFn } from 'ahooks';
import { CurrentAppState } from '@/model';
import { AgentLLMModeConfig, AgentLLMModeEnum } from '@/constants';
import { AppEventBus } from '@/pages/AppList/event';
import { EventTypeEnum } from '@/constants/eventType';
import useAgentHistory from '@/pages/AppList/components/EditContent/History/useAgentHistory';
import MultipleEdit from '../MutipleEdit';

const LLMSet: React.FC = () => {
  const {
    modelSetting: { mode, temperature } = {},
  } = useRecoilValue(CurrentAppState);
  const setCurrentApp = useSetRecoilState(CurrentAppState);
  const { isHistoryMode } = useAgentHistory();

  const [err, setErr] = React.useState('');

  const { run: debounceSave } = useDebounceFn(
    (_temperature) => {
      if ([undefined, null].includes(_temperature) || _temperature < 0 || _temperature > 1) {
        setErr('仅可输入0-1');
        return;
      }
      setErr('');
      AppEventBus.emit(
        EventTypeEnum.saveAppData,
        {
          modelSetting: { temperature: _temperature, mode: mode || AgentLLMModeEnum.strict },
        },
        true,
        false,
      );
    },
    { wait: 800 },
  );
  const onTemperatureChange = (_temperature) => {
    setCurrentApp((pre) => ({ ...pre, modelSetting: { temperature: _temperature, mode } }));
    debounceSave(_temperature);
  };

  const onModeChangd = (_mode) => {
    setCurrentApp((pre) => ({ ...pre, modelSetting: { temperature, mode: _mode } }));
    AppEventBus.emit(
      EventTypeEnum.saveAppData,
      {
        modelSetting: { temperature, mode: _mode },
      },
      true,
      false,
    );
  };

  return (
    <MultipleEdit
      title="模型"
      customContent={
        <div style={{ padding: 16 }}>
          <div>
            生成模式
            <Tooltip
              title={
                <>
                  <div>
                    1、通过调整“大模型温度”参数来控制AI生成内容的随机程度。温度越高，大模型生成的内容随机性越高。
                  </div>
                  <div> 2、这个参数就像控制AI的“脑洞大小”，调太低会变成死板的学霸，调太高会变成放飞自我的艺术家~ </div>
                  <div>3、日常使用建议：</div>
                  <div> - 需要可靠答案？→ 严谨模式（确保准确性） </div>
                  <div> - 日常使用？→ 标准模式（平衡创意与可靠） </div>
                  <div> - 想要创意灵感？→ 开放模式（激发灵感） </div>
                </>
              }
            >
              <ExclamationCircleOutlined className="AiAgent-link" style={{ marginLeft: 4 }} />
            </Tooltip>
            <Select
              style={{ width: 150, marginLeft: 12 }}
              value={mode || AgentLLMModeEnum.strict}
              onChange={onModeChangd}
              disabled={isHistoryMode}
            >
              {Object.entries(AgentLLMModeConfig).map(([key, label]) => (
                <Select.Option key={key} value={Number(key)}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </div>
          {mode === AgentLLMModeEnum.custom && (
            <>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center' }}>
                大模型温度
                <Slider
                  min={0}
                  max={1}
                  onChange={onTemperatureChange}
                  value={typeof temperature === 'number' ? temperature : 0}
                  step={0.01}
                  style={{ width: 'calc(100% - 300px)', display: 'inline-block', marginLeft: 16 }}
                  disabled={isHistoryMode}
                />
                <InputNumber
                  min={0}
                  max={1}
                  style={{ margin: '0 16px', width: 120 }}
                  value={temperature}
                  onChange={onTemperatureChange}
                  precision={2}
                  step={0.01}
                  disabled={isHistoryMode}
                />
              </div>
              {err && <div style={{ color: 'red', marginTop: 4 }}>{err}</div>}
            </>
          )}
        </div>
      }
      showAdd={false}
    />
  );
};

export default LLMSet;
