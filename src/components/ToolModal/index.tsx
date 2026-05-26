import React, { useCallback, useState } from 'react';
import type { ModalProps } from 'antd';
import { Button, Popover } from 'antd';
import { ToolboxTypeEnum, ToolParamsTypeEnum, VARIABLE_TYPE_ALIAS_MAP } from '@/constants';
import { getToolboxList, getToolList } from '@/api/tool';
import type { ToolNS } from '@/types/Tools';
import type { AppsNS } from '@/types/Apps';
import ToolboxIcon from '@/pages/tools/ToolboxIcon';
import { IconCanshu, IconNeizhigongju, IconQuanbu, IconZidingyi } from '@/assets/icons';
import ResourceModal from '@/components/ResourceModal';
import type { CategoryItem } from '@/components/ResourceModal';
import './index.less';

const TOOL_CATEGORIES: CategoryItem<ToolboxTypeEnum>[] = [
  { type: ToolboxTypeEnum.all, label: '全部', icon: <IconQuanbu color="currentColor" /> },
  { type: ToolboxTypeEnum.default, label: '内置工具', icon: <IconNeizhigongju color="currentColor" /> },
  { type: ToolboxTypeEnum.custom, label: '自定义工具', icon: <IconZidingyi color="currentColor" /> },
];

const getParamTypeLabel = (type: ToolParamsTypeEnum, subType?: ToolParamsTypeEnum): string => {
  if (type === ToolParamsTypeEnum.array) {
    return `${VARIABLE_TYPE_ALIAS_MAP[ToolParamsTypeEnum.array]}<${getParamTypeLabel(subType || ToolParamsTypeEnum.string)}>`;
  }
  return VARIABLE_TYPE_ALIAS_MAP[type];
};

const renderParamSection = (title: string, params?: ToolNS.ToolParamsType[]) => {
  if (!params?.length) return null;
  return (
    <div className="ToolModal-ParamsPopover-section">
      <div className="ToolModal-ParamsPopover-sectionTitle">{title}</div>
      {params.map((param) => (
        <div key={param.name} className="ToolModal-ParamsPopover-item">
          <div className="ToolModal-ParamsPopover-itemMain">
            <span className="ToolModal-ParamsPopover-itemName">{param.name}</span>
            <span className="ToolModal-ParamsPopover-itemType">{getParamTypeLabel(param.type, param.subType)}</span>
          </div>
          {param.desc && <div className="ToolModal-ParamsPopover-itemDesc">{param.desc}</div>}
        </div>
      ))}
    </div>
  );
};

const ToolModal: React.FC<
  Omit<ModalProps, 'title'> & {
    onAdd: (tool: Partial<AppsNS.ToolType>) => void;
    onDelete: (tool: { toolId: number }) => void;
    hasAddedList: AppsNS.ToolType[];
  }
> = ({ onAdd, onDelete, hasAddedList, ...modalProps }) => {
  const [currentType, setCurrentType] = useState<ToolboxTypeEnum>(ToolboxTypeEnum.all);

  const handleAddItem = useCallback(
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

  const handleDeleteItem = useCallback(
    (toolId: string | number) => {
      onDelete({ toolId: Number(toolId) });
    },
    [onDelete],
  );

  return (
    <ResourceModal<ToolboxTypeEnum, ToolNS.ToolBoxDetailType, ToolNS.ToolType>
      title="添加工具"
      categories={TOOL_CATEGORIES}
      currentType={currentType}
      onTypeChange={setCurrentType}
      actionSlot={
        <Button type="primary" block onClick={() => window.open('/ai-agent/toolboxs', '_blank')}>
          创建工具
        </Button>
      }
      fetchGroups={({ currentType: type, searchName }) =>
        getToolboxList({
          toolboxType: type,
          fastQuery: true,
          pageNo: 1,
          pageSize: 10000,
          name: searchName || undefined,
        })
      }
      groupToAnchor={(toolbox) => ({ id: toolbox.toolboxId, name: toolbox.name })}
      centerContentProps={{
        groupIdKey: 'toolboxId',
        hasChildren: true,
        fetchItems: (toolboxId) => getToolList({ toolboxId }),
        itemIdKey: 'toolId',
        searchPlaceholder: '搜索工具组名称',
        hasAddedItemList: hasAddedList,
        onAddItem: handleAddItem,
        onDeleteItem: handleDeleteItem,
        isItemDisabled: (tool: ToolNS.ToolType) => !tool.enabled,
        renderGroupIcon: (toolbox: ToolNS.ToolBoxDetailType) => (
          <ToolboxIcon toolboxType={toolbox.type} style={{ width: 40, height: 40 }} imageUrl={toolbox.imageUrl} />
        ),
        renderGroupTags: (toolbox: ToolNS.ToolBoxDetailType) => (
          <>
            {toolbox.type === ToolboxTypeEnum.default && (
              <span className="ResourceModal-CenterContent-group-tag builtin">内置工具</span>
            )}
            <span className="ResourceModal-CenterContent-group-tag count">工具数 {toolbox.toolNames?.length || 0}</span>
          </>
        ),
        renderItemExtra: (tool: ToolNS.ToolType) => {
          const content = (
            <div className="ToolModal-ParamsPopover">
              {renderParamSection('输入参数', tool.requestParams)}
              {renderParamSection('输出参数', tool.responseParams)}
            </div>
          );
          if (!tool.requestParams?.length && !tool.responseParams?.length) return null;
          return (
            <Popover content={content} overlayInnerStyle={{ maxHeight: 500, overflowY: 'auto' }}>
              <IconCanshu size={16} tw="cursor-pointer" color="var(--primary-color)" />
            </Popover>
          );
        },
      }}
      {...modalProps}
    />
  );
};

export default ToolModal;
