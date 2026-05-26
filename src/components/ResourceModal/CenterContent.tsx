import React, { useCallback, useRef, useState } from 'react';
import { Button, Input, Empty } from 'antd';
import Ellipsis from '@ysf/ellipsis';
import classnames from 'classnames';
import { IconXiajiantou } from '@/assets/icons';
import './index.less';

/** 分组数据（工具组 / Skill 条目）的最小约束 */
export interface GroupBase {
  [key: string]: any;
}

/** 子项数据（工具）的最小约束 */
export interface ItemBase {
  [key: string]: any;
}

export interface CenterContentProps<G extends GroupBase, I extends ItemBase = G> {
  /** 分组列表（工具组列表 / Skill 列表） */
  groupList: G[];
  /** 分组 id 字段名，默认 'id' */
  groupIdKey?: keyof G;
  groupNameKey?: keyof G;
  groupDescKey?: keyof G;
  /** 是否有子级（Tool=true 展开子工具，Skill=false 卡片本身即条目） */
  hasChildren?: boolean;
  /** 有子级时：异步加载子项的函数 */
  fetchItems?: (groupId: string | number) => Promise<{ data?: { list?: I[] } }>;
  /** 子项 id 字段名，默认与 groupIdKey 相同 */
  itemIdKey?: keyof I;
  /** 搜索框占位符 */
  searchPlaceholder?: string;
  /** 已添加列表，用于判断"已添加"状态 */
  hasAddedGroupList?: Array<Record<string, any>>;
  hasAddedItemList?: Array<Record<string, any>>;
  /** 添加回调 */
  onAddGroup?: (group: G) => void;
  onAddItem?: (item: I, group: G) => void;
  /** 删除回调 */
  onDeleteGroup?: (groupId: string | number) => void;
  onDeleteItem?: (itemId: string | number) => void;
  /** 搜索变化回调（向上传递，由父组件控制 groupList 的数据源） */
  onSearchChange: (value: string) => void;
  /** 自定义分组头部左侧图标区域 */
  renderGroupIcon?: (group: G) => React.ReactNode;
  /** 自定义分组标签区（如"内置工具"标签、工具数量标签） */
  renderGroupTags?: (group: G) => React.ReactNode;
  /** 自定义子项的额外内容（如参数 Popover 图标） */
  renderItemExtra?: (item: I) => React.ReactNode;
  /** 子项是否禁用（如工具已停用） */
  isItemDisabled?: (item: I) => boolean;
  /** 禁用时的按钮文案 */
  itemDisabledText?: string;
  /** 滚动容器 ref，用于锚点目录联动 */
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

const ANCHOR_ATTR = 'data-anchor-id';

function CenterContent<G extends GroupBase, I extends ItemBase = G>({
  groupList,
  groupIdKey = 'id' as keyof G,
  groupNameKey = 'name' as keyof G,
  groupDescKey = 'desc' as keyof G,
  hasChildren = false,
  fetchItems,
  itemIdKey,
  searchPlaceholder = '搜索',
  hasAddedGroupList = [],
  hasAddedItemList = [],
  onAddGroup,
  onAddItem,
  onDeleteGroup,
  onDeleteItem,
  onSearchChange,
  renderGroupIcon,
  renderGroupTags,
  renderItemExtra,
  isItemDisabled,
  itemDisabledText = '已停用',
  scrollContainerRef,
}: CenterContentProps<G, I>) {
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());
  const [itemMap, setItemMap] = useState<Record<string | number, I[]>>({});
  const [hoveringGroupId, setHoveringGroupId] = useState<string | number>();
  const [hoveringItemId, setHoveringItemId] = useState<string | number>();
  const loadingRef = useRef<Set<string | number>>(new Set());

  const resolvedItemIdKey = (itemIdKey ?? groupIdKey) as keyof I;

  const getGroupId = (group: G) => group[groupIdKey] as string | number;
  const getItemId = (item: I) => item[resolvedItemIdKey] as string | number;

  // 加载子项
  const loadItems = useCallback(
    async (groupId: string | number) => {
      if (!fetchItems || loadingRef.current.has(groupId) || itemMap[groupId]) return;
      loadingRef.current.add(groupId);
      try {
        const res = await fetchItems(groupId);
        if (res?.data?.list) {
          setItemMap((prev) => {
            if (prev[groupId]) return prev;
            return { ...prev, [groupId]: res.data!.list! };
          });
        }
      } catch (e) {
        console.error('Failed to load items:', e);
      } finally {
        loadingRef.current.delete(groupId);
      }
    },
    [fetchItems, itemMap],
  );

  // 展开 / 折叠分组
  const toggleGroup = useCallback(
    (groupId: string | number) => {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(groupId)) {
          next.delete(groupId);
        } else {
          next.add(groupId);
          if (!itemMap[groupId]) loadItems(groupId);
        }
        return next;
      });
    },
    [loadItems, itemMap],
  );

  const isGroupAdded = (group: G) =>
    hasAddedGroupList.some((added) => added[groupIdKey as string] === getGroupId(group));

  const isItemAdded = (item: I) =>
    hasAddedItemList.some((added) => added[resolvedItemIdKey as string] === getItemId(item));

  const ModuleName = 'ResourceModal-CenterContent';

  return (
    <div className={ModuleName}>
      <div className={`${ModuleName}-header`}>
        <Input.Search
          className={`${ModuleName}-search`}
          placeholder={searchPlaceholder}
          allowClear
          onSearch={onSearchChange}
        />
      </div>
      {!groupList?.length ? (
        <div tw="h-full flex items-center justify-center mt-[-16px]">
          <Empty />
        </div>
      ) : (
        <div className={`${ModuleName}-list`} ref={scrollContainerRef}>
          {groupList.map((group) => {
            const groupId = getGroupId(group);
            const isExpanded = expandedIds.has(groupId);
            const items = itemMap[groupId] || [];
            const added = isGroupAdded(group);
            const showGroupRemove = !hasChildren && hoveringGroupId === groupId && added;

            return (
              <div
                key={groupId}
                className={`${ModuleName}-group`}
                {...{ [ANCHOR_ATTR]: groupId }}
                onMouseEnter={() => !hasChildren && setHoveringGroupId(groupId)}
                onMouseLeave={() => !hasChildren && setHoveringGroupId(undefined)}
              >
                {/* 分组卡片头部 */}
                <div
                  className={classnames(`${ModuleName}-group-header`, { clickable: hasChildren })}
                  onClick={() => hasChildren && toggleGroup(groupId)}
                >
                  <div className={`${ModuleName}-group-main`}>
                    {renderGroupIcon && renderGroupIcon(group)}
                    <div className={`${ModuleName}-group-info`}>
                      <div className={`${ModuleName}-group-title`}>
                        <Ellipsis width="100%" tooltipProps={{ mouseEnterDelay: 1 }}>
                          {group[groupNameKey]}
                        </Ellipsis>
                      </div>
                      {group[groupDescKey] && (
                        <div className={`${ModuleName}-group-desc`}>
                          <Ellipsis lines={1} tooltipProps={{ mouseEnterDelay: 1 }}>
                            {group[groupDescKey]}
                          </Ellipsis>
                        </div>
                      )}
                      {renderGroupTags && <div className={`${ModuleName}-group-tags`}>{renderGroupTags(group)}</div>}
                    </div>
                  </div>

                  {/* 右侧：展开箭头（hasChildren 模式） or 添加/移除按钮（非 hasChildren 模式） */}
                  {hasChildren ? (
                    <div className={`${ModuleName}-group-arrow`}>
                      <IconXiajiantou
                        style={{
                          transform: !isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                        }}
                        color="var(--tip-color)"
                      />
                    </div>
                  ) : (
                    <div className={`${ModuleName}-group-action`}>
                      {!showGroupRemove ? (
                        <Button onClick={() => onAddGroup?.(group)} disabled={added}>
                          {added ? '已添加' : '添加'}
                        </Button>
                      ) : (
                        <Button danger onClick={() => onDeleteGroup?.(groupId)}>
                          移除
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* 子项列表（hasChildren 模式且已展开） */}
                {hasChildren && isExpanded && (
                  <div className={`${ModuleName}-group-children`}>
                    {items.map((item) => {
                      const itemId = getItemId(item);
                      const itemAdded = isItemAdded(item);
                      const disabled = isItemDisabled?.(item);
                      const showItemRemove = hoveringItemId === itemId && itemAdded;

                      return (
                        <div
                          key={itemId}
                          className={`${ModuleName}-item`}
                          onMouseEnter={() => setHoveringItemId(itemId)}
                          onMouseLeave={() => setHoveringItemId(undefined)}
                        >
                          <div className={`${ModuleName}-item-info`}>
                            <div className={`${ModuleName}-item-title`}>
                              <Ellipsis width="calc(100% - 24px)" tooltipProps={{ mouseEnterDelay: 1 }}>
                                {item.name}
                              </Ellipsis>
                              {renderItemExtra?.(item)}
                            </div>
                            {item.desc && (
                              <div className={`${ModuleName}-item-desc`}>
                                <Ellipsis lines={1} tooltipProps={{ mouseEnterDelay: 1 }}>
                                  {item.desc}
                                </Ellipsis>
                              </div>
                            )}
                          </div>
                          {disabled ? (
                            <Button disabled>{itemDisabledText}</Button>
                          ) : !showItemRemove ? (
                            <Button onClick={() => onAddItem?.(item, group)} disabled={itemAdded}>
                              {itemAdded ? '已添加' : '添加'}
                            </Button>
                          ) : (
                            <Button danger onClick={() => onDeleteItem?.(itemId)}>
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
      )}
    </div>
  );
}

export { ANCHOR_ATTR };
export default CenterContent;
