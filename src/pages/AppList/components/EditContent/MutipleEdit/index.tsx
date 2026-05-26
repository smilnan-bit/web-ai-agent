import React, { useState } from 'react';
import { Tag, Tooltip } from 'antd';
import Ellipsis from '@ysf/ellipsis';
import { DownOutlined, MinusCircleOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import type { AppsNS } from '@/types/Apps';
import useAgentHistory from '@/pages/AppList/components/EditContent/History/useAgentHistory';
import { IconJingshi, IconYichu } from '@/assets/icons';
import './index.less';

type ItemType = AppsNS.ToolType | AppsNS.KnowledgeType | AppsNS.WorkflowType | AppsNS.MemoryRepositoryType;

interface MultipleEditProps {
  title: string;
  list?: ItemType[];
  onAdd?: () => void;
  onDelete?: (item: ItemType) => void;
  emptyText?: string;
  addLimit?: number;
  nameKey?: string; // 取name所用的key
  descKey?: string; // 取desc所用的key
  isGrayItem?: (item: any) => boolean; // 该项是否置灰
  onTitleClick?: () => void;
  onItemTitleClick?: (item: ItemType) => void;
  enableClick?: (item: any) => boolean;
  getExtraOperate?: (item: ItemType) => React.ReactNode;
  titleExtra?: React.ReactNode;
  customContent?: React.ReactNode;
  showAdd?: boolean;
  warningText?: string; // 警告提醒文字
  isWarning?: (item: ItemType) => boolean; // 是否显示警告图标
}

const MultipleEdit: React.FC<MultipleEditProps> = ({
  title,
  list = [],
  onAdd,
  onDelete,
  emptyText = '暂无数据',
  addLimit,
  nameKey = 'name',
  descKey,
  isGrayItem,
  onTitleClick,
  onItemTitleClick,
  enableClick = () => true,
  getExtraOperate,
  titleExtra,
  showAdd = true,
  customContent,
  warningText = '该项已停用',
  isWarning = () => false,
}) => {
  const [expand, setExpand] = useState(true);
  const { isHistoryMode } = useAgentHistory();

  return (
    <div className="MultipleEdit">
      <div className="MultipleEdit-title">
        <span>
          {expand ? (
            <DownOutlined onClick={() => setExpand(false)} style={{ color: '#00000073', marginRight: 8 }} />
          ) : (
            <RightOutlined onClick={() => setExpand(true)} style={{ color: '#00000073', marginRight: 8 }} />
          )}
          <span className={`MultipleEdit-title-name ${onTitleClick ? 'enable-click' : ''}`} onClick={onTitleClick}>
            {title}
          </span>
        </span>
        {titleExtra}
        {showAdd && (addLimit === undefined || list?.length < addLimit) && !isHistoryMode && (
          <span className="MultipleEdit-add AiAgent-link" onClick={onAdd}>
            <PlusOutlined style={{ marginRight: 4 }} />
            添加
          </span>
        )}
      </div>
      {expand &&
        (customContent || (
          <div className="MultipleEdit-list">
            {list?.length === 0 && <div style={{ color: '#BFBFBF', padding: '8px 0' }}>{emptyText}</div>}
            {list?.map((item, index) => {
              const showGray = isGrayItem?.(item) || false;
              const showWarning = (isWarning?.(item) && isHistoryMode) || false;
              return (
                <div key={index} className="MultipleEdit-list-item">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {showGray && <Tag>已停用</Tag>}
                      <Ellipsis lines={1} tooltipProps={{ mouseEnterDelay: 1 }}>
                        {!showWarning ? (
                          <span
                            style={showGray ? { color: '#00000040' } : {}}
                            className={enableClick(item) ? 'enable-click' : ''}
                            onClick={() => enableClick(item) && onItemTitleClick?.(item)}
                          >
                            {item[nameKey]}
                          </span>
                        ) : (
                          <span className={'disable-click'}>{item[nameKey]}</span>
                        )}
                      </Ellipsis>
                      {showWarning ? (
                        <span style={{ display: 'inline-flex', marginLeft: '4px' }}>
                          <Tooltip placement={'bottom'} title={warningText}>
                            <IconJingshi size={14} color={'#FF8000'} />
                          </Tooltip>
                        </span>
                      ) : null}
                    </div>
                    {descKey && (
                      <div
                        style={{ color: showGray ? '#00000040' : 'rgba(0, 0, 0, 0.45)', fontSize: 13, paddingTop: 2 }}
                      >
                        <Ellipsis lines={1} tooltipProps={{ mouseEnterDelay: 1 }}>
                          {item[descKey]}
                        </Ellipsis>
                      </div>
                    )}
                  </div>
                  {getExtraOperate?.(item)}
                  {!isHistoryMode ? (
                    <span className="MultipleEdit-opeicon AiAgent-link " tw="flex items-center">
                      <IconYichu onClick={() => onDelete?.(item)} color="currentColor" />
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
};

export default MultipleEdit;
