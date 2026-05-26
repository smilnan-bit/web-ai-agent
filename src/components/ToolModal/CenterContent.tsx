import React, { useCallback, useRef, useState } from 'react';
import { Button, Input, Popover } from 'antd';
import Ellipsis from '@ysf/ellipsis';
import classnames from 'classnames';
import { getToolList } from '@/api/tool';
import { ToolParamsTypeEnum, ToolStatusEnum, ToolboxTypeEnum } from '@/constants';
import type { ToolNS } from '@/types/Tools';
import type { AppsNS } from '@/types/Apps';
import ToolboxIcon from '@/pages/tools/ToolboxIcon';
import { IconCanshu, IconXiajiantou } from '@/assets/icons';
import './index.less';
import { VARIABLE_TYPE_ALIAS_MAP } from '@/constants';

interface CenterContentProps {
  toolboxList: ToolNS.ToolBoxDetailType[];
  onAdd: (tool: Partial<AppsNS.ToolType>) => void;
  onDelete: (tool: { toolId: number }) => void;
  hasAddedList: AppsNS.ToolType[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

const ModuleName = 'ToolModal-CenterContent';

const getParamTypeLabel = (type: ToolParamsTypeEnum, subType?: ToolParamsTypeEnum) => {
  switch (type) {
    case ToolParamsTypeEnum.array:
      return `${VARIABLE_TYPE_ALIAS_MAP[ToolParamsTypeEnum.array]}<${getParamTypeLabel(subType || ToolParamsTypeEnum.string)}> `;
    default:
      return VARIABLE_TYPE_ALIAS_MAP[type];
  }
};

const renderParamSection = (title: string, params?: ToolNS.ToolParamsType[]) => {
  if (!params || params.length === 0) return null;

  return (
    <div className="ToolModal-ParamsPopover-section">
      <div className="ToolModal-ParamsPopover-sectionTitle">{title}</div>
      {params.map((param) => (
        <div key={param.name} className="ToolModal-ParamsPopover-item">
          <div className="ToolModal-ParamsPopover-itemMain">
            <span className="ToolModal-ParamsPopover-itemName">{param.name}</span>
            <span className="ToolModal-ParamsPopover-itemType">{getParamTypeLabel(param.type, param.subType)}</span>
          </div>
          {param.desc ? <div className="ToolModal-ParamsPopover-itemDesc">{param.desc}</div> : null}
        </div>
      ))}
    </div>
  );
};

const paramsPopoverContent = ({
  requestParams,
  responseParams,
}: {
  requestParams?: ToolNS.ToolParamsType[];
  responseParams?: ToolNS.ToolParamsType[];
}) => {
  if (!requestParams?.length && !responseParams?.length) {
    return null;
  }

  return (
    <div className="ToolModal-ParamsPopover">
      {renderParamSection('输入参数', requestParams)}
      {renderParamSection('输出参数', responseParams)}
    </div>
  );
};

const CenterContent: React.FC<CenterContentProps> = ({
  toolboxList,
  onAdd,
  onDelete,
  hasAddedList,
  searchValue,
  onSearchChange,
  scrollContainerRef,
}) => {
  const [expandedToolboxIds, setExpandedToolboxIds] = useState<Set<string | number>>(new Set());
  const [toolMap, setToolMap] = useState<Record<string | number, ToolNS.ToolType[]>>({});
  const [hoveringToolId, setHoveringToolId] = useState<string | number>();
  const loadingRef = useRef<Set<string | number>>(new Set());

  // 加载工具列表
  const loadTools = useCallback(
    async (toolboxId: string | number) => {
      // 如果正在加载或已加载，直接返回
      if (loadingRef.current.has(toolboxId) || toolMap[toolboxId]) {
        return;
      }

      loadingRef.current.add(toolboxId);

      try {
        const { data } = await getToolList({ toolboxId });
        if (data?.list) {
          setToolMap((prev) => {
            // 再次检查，避免并发请求重复设置
            if (prev[toolboxId]) {
              return prev;
            }
            return { ...prev, [toolboxId]: data.list };
          });
        }
      } catch (error) {
        console.error('Failed to load tools:', error);
      } finally {
        loadingRef.current.delete(toolboxId);
      }
    },
    [toolMap],
  );

  // 切换展开/折叠
  const toggleToolbox = useCallback(
    (toolboxId: string | number) => {
      setExpandedToolboxIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(toolboxId)) {
          newSet.delete(toolboxId);
        } else {
          newSet.add(toolboxId);
          // 如果工具列表未加载，则加载
          if (!toolMap[toolboxId]) {
            loadTools(toolboxId);
          }
        }
        return newSet;
      });
    },
    [loadTools, toolMap],
  );

  // 添加工具
  const handleAddTool = useCallback(
    (tool: ToolNS.ToolType, toolbox: ToolNS.ToolBoxDetailType) => {
      onAdd({
        toolId: Number(tool.toolId),
        name: tool.name,
        desc: tool.desc,
        toolboxId: Number(toolbox.toolboxId),
        toolboxType: toolbox.type,
        supportBindCard: tool.supportBindCard,
        supportToolSetting: tool.supportToolSetting,
        isTemplateTool: tool.isTemplateTool,
      });
    },
    [onAdd],
  );

  // 删除工具
  const handleDeleteTool = useCallback(
    (toolId: string | number) => {
      onDelete({ toolId: Number(toolId) });
    },
    [onDelete],
  );

  return (
    <div className={ModuleName}>
      <div className={`${ModuleName}-header`}>
        <Input.Search
          className={`${ModuleName}-search`}
          placeholder="搜索工具组名称"
          allowClear
          onSearch={(value) => onSearchChange(value)}
        />
      </div>
      <div className={`${ModuleName}-list`} ref={scrollContainerRef}>
        {toolboxList.map((toolbox) => {
          const isExpanded = expandedToolboxIds.has(toolbox.toolboxId);
          const tools = toolMap[toolbox.toolboxId] || [];
          const toolCount = toolbox.toolNames?.length || tools.length || 0;

          return (
            <div
              key={toolbox.toolboxId}
              data-toolbox-id={toolbox.toolboxId}
              data-toolbox-item
              className={classnames(`${ModuleName}-item`, {
                expanded: isExpanded,
              })}
            >
              <div className={`${ModuleName}-item-header`} onClick={() => toggleToolbox(toolbox.toolboxId)}>
                <div className={`${ModuleName}-item-main`}>
                  <ToolboxIcon
                    toolboxType={toolbox.type}
                    style={{ width: 40, height: 40 }}
                    imageUrl={toolbox.imageUrl}
                  />
                  <div className={`${ModuleName}-item-info`}>
                    <div className={`${ModuleName}-item-title`}>{toolbox.name}</div>
                    <div className={`${ModuleName}-item-desc`}>
                      <Ellipsis lines={1} tooltipProps={{ mouseEnterDelay: 1 }}>
                        {toolbox.desc || ''}
                      </Ellipsis>
                    </div>
                    <div className={`${ModuleName}-item-tags`}>
                      {toolbox.type === ToolboxTypeEnum.default && (
                        <span className={`${ModuleName}-item-tag builtin`}>内置工具</span>
                      )}
                      <span className={`${ModuleName}-item-tag count`}>工具数 {toolCount}</span>
                    </div>
                  </div>
                </div>
                <div className={`${ModuleName}-item-arrow`}>
                  <IconXiajiantou
                    style={{
                      transform: !isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                    }}
                    color="var(--tip-color)"
                  />
                </div>
              </div>
              {isExpanded && (
                <div className={`${ModuleName}-item-content`}>
                  {tools.map((tool) => {
                    const hasBeenAdded = hasAddedList?.some((item) => item.toolId === tool.toolId);
                    const showRemove = hoveringToolId === tool.toolId && hasBeenAdded;

                    return (
                      <div
                        key={tool.toolId}
                        className={`${ModuleName}-tool-item`}
                        onMouseEnter={() => setHoveringToolId(tool.toolId)}
                        onMouseLeave={() => setHoveringToolId(undefined)}
                      >
                        <div className={`${ModuleName}-tool-info`}>
                          <div className={`${ModuleName}-tool-title`}>
                            <Ellipsis width={'calc(100% - 24px)'} tooltipProps={{ mouseEnterDelay: 1 }}>
                              {tool.name}
                            </Ellipsis>
                            {(tool.requestParams?.length || tool.responseParams?.length) && (
                              <Popover
                                content={paramsPopoverContent({
                                  requestParams: tool.requestParams,
                                  responseParams: tool.responseParams,
                                })}
                                getPopupContainer={() =>
                                  (document.getElementsByClassName(ModuleName)[0] as HTMLElement) || document.body
                                }
                                overlayInnerStyle={{ maxHeight: 500, overflowY: 'auto' }}
                              >
                                <IconCanshu size={16} tw="cursor-pointer" color="var(--primary-color)" />
                              </Popover>
                            )}
                          </div>
                          <div className={`${ModuleName}-tool-desc`}>
                            <Ellipsis lines={1} tooltipProps={{ mouseEnterDelay: 1 }}>
                              {tool.desc || ''}
                            </Ellipsis>
                          </div>
                        </div>
                        {!tool.enabled ? (
                          <Button disabled>已停用</Button>
                        ) : !showRemove ? (
                          <Button onClick={() => handleAddTool(tool, toolbox)} disabled={!!hasBeenAdded}>
                            {hasBeenAdded ? '已添加' : '添加'}
                          </Button>
                        ) : (
                          <Button danger onClick={() => tool.toolId && handleDeleteTool(tool.toolId)}>
                            移除
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CenterContent;
