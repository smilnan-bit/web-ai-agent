// src/pages/CardEditor/components/StructurePanel.tsx

import React, { useCallback, useMemo, useState } from 'react';
import ReactJson from 'react-json-view';
import { Input, Empty, Tooltip, Tag } from 'antd';
import type { PreviewSpec, RuntimeData } from '../types';
import { collectBindings, collectEventInfo, getRuntimeValue, setRuntimeValue } from '../utils/runtime-data';
import { IconShuaxin2, IconDoubleArrowUpDown } from '@/assets/icons';
import { IconJiantoukaozuo } from '@/pages/Workflow/NewGraph/nodes/icons';

type JsonExpandMode = 'default' | 'all' | 'collapsed';

interface StructurePanelProps {
  spec: PreviewSpec;
  runtimeData: RuntimeData;
  onRuntimeDataChange: (data: RuntimeData) => void;
  isJsonPanelCollapsed: boolean;
  onJsonPanelToggle: () => void;
  isRuntimePanelCollapsed: boolean;
  onRuntimePanelToggle: () => void;
  jsonExpandMode: JsonExpandMode;
  onJsonExpandModeChange: (mode: JsonExpandMode) => void;
  onResetRuntimeData: () => void;
}

const StructurePanel: React.FC<StructurePanelProps> = ({
  spec,
  runtimeData,
  onRuntimeDataChange,
  isJsonPanelCollapsed,
  onJsonPanelToggle,
  isRuntimePanelCollapsed,
  onRuntimePanelToggle,
  jsonExpandMode,
  onJsonExpandModeChange,
  onResetRuntimeData,
}) => {
  const bindings = useMemo(() => collectBindings(spec), [spec]);
  const eventInfo = useMemo(() => collectEventInfo(spec), [spec]);
  const [isEventPanelCollapsed, setIsEventPanelCollapsed] = useState(false);

  const jsonCollapseLevel = useMemo(() => {
    if (jsonExpandMode === 'all') return false;
    if (jsonExpandMode === 'collapsed') return 1;
    return 2;
  }, [jsonExpandMode]);

  const handleRuntimeValueChange = useCallback(
    (path: string, value: string) => {
      onRuntimeDataChange(setRuntimeValue(runtimeData, path, value));
    },
    [runtimeData, onRuntimeDataChange],
  );

  const hasEventData =
    eventInfo.targetComponents.length > 0 || eventInfo.triggerActions.length > 0 || eventInfo.reportDataKeys.length > 0;

  return (
    <div tw="flex flex-col h-full overflow-hidden">
      {/* JSON 面板 */}
      <div tw="flex flex-col" style={{ flex: isJsonPanelCollapsed ? '0 0 auto' : '1 1 0', minHeight: 0 }}>
        <div tw="flex items-center justify-between px-3 py-2 border-b border-[rgba(0,0,0,0.06)]">
          {/* 左侧：折叠箭头 + 标题 */}
          <span tw="flex items-center gap-[4px] cursor-pointer select-none" onClick={onJsonPanelToggle}>
            <IconJiantoukaozuo
              size={18}
              style={{
                color: '#1a1a1a',
                transform: isJsonPanelCollapsed ? 'rotate(90deg)' : 'rotate(270deg)',
                transformOrigin: '30% 50%',
              }}
            />
            <span tw="text-[16px] font-semibold text-[#1a1a1a]">实时 JSON</span>
          </span>
          {/* 右侧：图标按钮组 */}
          {!isJsonPanelCollapsed && (
            <div tw="flex items-center gap-1">
              <Tooltip title={jsonExpandMode === 'collapsed' ? '全部展开' : '全部折叠'}>
                <span
                  tw="text-ysf-secondary cursor-pointer hover:text-primary"
                  onClick={() => onJsonExpandModeChange(jsonExpandMode === 'collapsed' ? 'all' : 'collapsed')}
                >
                  <IconDoubleArrowUpDown size={16} />
                </span>
              </Tooltip>
            </div>
          )}
        </div>
        {!isJsonPanelCollapsed && (
          <div tw="flex-1 overflow-auto p-2 text-[12px]" style={{ minHeight: 0 }}>
            <ReactJson
              src={spec}
              name={false}
              collapsed={jsonCollapseLevel}
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={false}
              style={{ fontFamily: 'monospace', fontSize: 12, background: 'transparent' }}
            />
          </div>
        )}
      </div>
      <div tw="h-[1px] w-full bg-ysf-line-light" />
      {/* 动态数据面板 */}
      <div tw="flex flex-col border-0" style={{ flex: isRuntimePanelCollapsed ? '0 0 auto' : '0 0 200px' }}>
        <div tw="flex items-center justify-between px-3 py-2 border-b border-[rgba(0,0,0,0.06)]">
          <span tw="text-[16px] font-semibold flex gap-[4px] items-center">
            <IconJiantoukaozuo
              size={18}
              style={{
                transform: isRuntimePanelCollapsed ? 'rotate(90deg)' : 'rotate(270deg)',
                transformOrigin: '30% 50%',
              }}
              onClick={onRuntimePanelToggle}
            />
            动态数据
          </span>
          <div tw="flex items-center gap-1">
            {!isRuntimePanelCollapsed && (
              <span
                onClick={onResetRuntimeData}
                tw="text-ysf-secondary cursor-pointer hover:text-primary"
                style={!bindings?.length ? { color: 'var(--color-ysf-disabled)' } : {}}
              >
                <IconShuaxin2 color="currentColor" tw="align-middle" />
              </span>
            )}
          </div>
        </div>
        {!isRuntimePanelCollapsed && (
          <div tw="flex-1 overflow-auto p-3 flex flex-col gap-2" style={{ minHeight: 0 }}>
            {bindings.length > 0 ? (
              bindings.map((binding) => (
                <label tw="flex flex-col gap-1" key={binding.path}>
                  <span tw="text-[12px] text-[rgba(0,0,0,0.45)] font-mono">{binding.path}</span>
                  <Input
                    size="small"
                    value={getRuntimeValue(runtimeData, binding.path)}
                    placeholder={binding.fallback || '请输入动态值'}
                    onChange={(e) => handleRuntimeValueChange(binding.path, e.target.value)}
                  />
                </label>
              ))
            ) : (
              <Empty description={<span tw="text-ysf-third">暂无数据</span>} />
            )}
          </div>
        )}
      </div>
      <div tw="h-[1px] w-full bg-ysf-line-light" />
      {/* 事件及上报数据面板 */}
      <div tw="flex flex-col border-0" style={{ flex: isEventPanelCollapsed ? '0 0 auto' : '0 0 auto' }}>
        <div tw="flex items-center justify-between px-3 py-2 border-b border-[rgba(0,0,0,0.06)]">
          <span
            tw="text-[16px] font-semibold flex gap-[4px] items-center cursor-pointer select-none"
            onClick={() => setIsEventPanelCollapsed((v) => !v)}
          >
            <IconJiantoukaozuo
              size={18}
              style={{
                transform: isEventPanelCollapsed ? 'rotate(90deg)' : 'rotate(270deg)',
                transformOrigin: '30% 50%',
              }}
            />
            事件及上报数据
          </span>
          <Tooltip title="目标组件触发动作时，上报数据 key 会作为工作流节点的输出参数">
            <span tw="text-[12px] text-[rgba(0,0,0,0.35)] cursor-help">ⓘ</span>
          </Tooltip>
        </div>
        {!isEventPanelCollapsed && (
          <div tw="overflow-auto p-3 flex flex-col gap-3" style={{ minHeight: 0 }}>
            {hasEventData ? (
              <>
                {/* 目标组件 */}
                <div tw="flex items-start gap-2">
                  <span tw="text-[12px] text-[rgba(0,0,0,0.45)] whitespace-nowrap leading-[22px]">目标组件</span>
                  <div tw="flex flex-wrap gap-1">
                    {eventInfo.targetComponents.length > 0 ? (
                      eventInfo.targetComponents.map((name) => (
                        <Tag key={name} tw="m-0 text-[12px]">
                          {name}
                        </Tag>
                      ))
                    ) : (
                      <span tw="text-[12px] text-[rgba(0,0,0,0.25)]">无</span>
                    )}
                  </div>
                </div>
                {/* 触发动作 */}
                <div tw="flex items-start gap-2">
                  <span tw="text-[12px] text-[rgba(0,0,0,0.45)] whitespace-nowrap leading-[22px]">触发动作</span>
                  <div tw="flex flex-wrap gap-1">
                    {eventInfo.triggerActions.length > 0 ? (
                      eventInfo.triggerActions.map((action) => (
                        <Tag key={action} tw="m-0 text-[12px]">
                          {action}
                        </Tag>
                      ))
                    ) : (
                      <span tw="text-[12px] text-[rgba(0,0,0,0.25)]">无</span>
                    )}
                  </div>
                </div>
                {/* 上报数据 */}
                <div tw="flex items-start gap-2">
                  <span tw="text-[12px] text-[rgba(0,0,0,0.45)] whitespace-nowrap leading-[22px]">上报数据</span>
                  <div tw="flex flex-wrap gap-1">
                    {eventInfo.reportDataKeys.length > 0 ? (
                      eventInfo.reportDataKeys.map((key) => (
                        <Tag key={key} color="blue" tw="m-0 text-[12px]">
                          {key}
                        </Tag>
                      ))
                    ) : (
                      <span tw="text-[12px] text-[rgba(0,0,0,0.25)]">无交互字段</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <Empty description={<span tw="text-ysf-third">暂无事件配置</span>} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StructurePanel;
