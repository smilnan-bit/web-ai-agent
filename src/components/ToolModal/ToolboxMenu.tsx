import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import type { ToolNS } from '@/types/Tools';
import './index.less';

interface ToolboxMenuProps {
  toolboxList: ToolNS.ToolBoxDetailType[];
  activeToolboxId?: string | number;
  onToolboxClick?: (toolbox: ToolNS.ToolBoxDetailType) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

const ToolboxMenu: React.FC<ToolboxMenuProps> = ({
  toolboxList,
  activeToolboxId,
  onToolboxClick,
  scrollContainerRef,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isScrollingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollCheckTimerRef = useRef<number | null>(null);
  const targetScrollTopRef = useRef<number | null>(null);

  // 监听中间容器的滚动，同步右侧菜单的选中状态
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !menuRef.current) return;

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const containerRect = scrollContainer.getBoundingClientRect();
      const toolboxItems = scrollContainer.querySelectorAll('[data-toolbox-item]');

      // 检查是否滚动到底部（允许1px的误差）
      const isScrolledToBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - containerRect.height <= 1;

      let currentIndex = 0;
      if (isScrolledToBottom) {
        // 如果滚动到底部，选中最后一个菜单项
        currentIndex = toolboxItems.length - 1;
      } else {
        // 否则，找到当前可见的第一个菜单项
        toolboxItems.forEach((item, index) => {
          const rect = item.getBoundingClientRect();
          if (rect.top <= containerRect.top + 100) {
            currentIndex = index;
          }
        });
      }

      // 防抖更新 activeIndex
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        setActiveIndex(currentIndex);
      }, 50);

      // 同步滚动右侧菜单
      const menuItem = menuRef.current?.children[currentIndex] as HTMLElement;
      if (menuItem && menuRef.current) {
        if (isScrolledToBottom) {
          // 如果滚动到底部，将右侧菜单滚动到最后一个菜单项
          const lastItemTop = menuItem.offsetTop;
          const menuHeight = menuRef.current.clientHeight;
          const lastItemHeight = menuItem.offsetHeight;
          menuRef.current.scrollTo({
            top: lastItemTop + lastItemHeight - menuHeight,
            behavior: 'smooth',
          });
        } else {
          // 否则，保持原有逻辑，确保当前项可见
          const menuRect = menuRef.current.getBoundingClientRect();
          const itemRect = menuItem.getBoundingClientRect();
          const itemTop = itemRect.top - menuRect.top + menuRef.current.scrollTop;
          const menuHeight = menuRef.current.clientHeight;
          const itemOffsetTop = itemTop - menuRef.current.scrollTop;

          if (itemOffsetTop < 0) {
            menuRef.current.scrollTo({ top: itemTop, behavior: 'smooth' });
          } else if (itemOffsetTop + itemRect.height > menuHeight) {
            menuRef.current.scrollTo({
              top: itemTop + itemRect.height - menuHeight,
              behavior: 'smooth',
            });
          }
        }
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始计算

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      // 清理防抖定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // 清理滚动检测定时器
      if (scrollCheckTimerRef.current) {
        cancelAnimationFrame(scrollCheckTimerRef.current);
      }
    };
  }, [scrollContainerRef]);

  const handleMenuItemClick = (toolbox: ToolNS.ToolBoxDetailType, index: number) => {
    // 设置滚动标志，阻止 handleScroll 执行
    isScrollingRef.current = true;
    setActiveIndex(index);

    if (onToolboxClick) {
      onToolboxClick(toolbox);
    }

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      isScrollingRef.current = false;
      return;
    }

    const toolboxItem = scrollContainer.querySelector(`[data-toolbox-id="${toolbox.toolboxId}"]`) as HTMLElement;
    if (!toolboxItem) {
      isScrollingRef.current = false;
      return;
    }

    // 计算目标滚动位置
    const containerRect = scrollContainer.getBoundingClientRect();
    const itemRect = toolboxItem.getBoundingClientRect();
    const targetScrollTop = scrollContainer.scrollTop + itemRect.top - containerRect.top - 24; // 24px 偏移
    targetScrollTopRef.current = targetScrollTop;

    // 清除之前的检测定时器
    if (scrollCheckTimerRef.current) {
      cancelAnimationFrame(scrollCheckTimerRef.current);
      scrollCheckTimerRef.current = null;
    }

    // 开始滚动
    scrollContainer.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth',
    });

    // 使用 requestAnimationFrame 检测滚动是否到达目标位置
    const startTime = Date.now();
    const maxWaitTime = 2000; // 最大等待时间 2 秒
    const tolerance = 5; // 允许的误差范围（像素）

    const checkScrollComplete = () => {
      const currentScrollTop = scrollContainer.scrollTop;
      const distance = Math.abs(currentScrollTop - targetScrollTop);
      const elapsedTime = Date.now() - startTime;

      // 如果已经到达目标位置（允许误差），或者超过最大等待时间，认为滚动完成
      if (distance <= tolerance || elapsedTime >= maxWaitTime) {
        isScrollingRef.current = false;
        targetScrollTopRef.current = null;
        scrollCheckTimerRef.current = null;
        return;
      }

      // 继续检测
      scrollCheckTimerRef.current = requestAnimationFrame(checkScrollComplete);
    };

    // 开始检测
    scrollCheckTimerRef.current = requestAnimationFrame(checkScrollComplete);
  };

  useEffect(() => {
    setActiveIndex(toolboxList.findIndex((toolbox) => toolbox.toolboxId === activeToolboxId));
  }, [activeToolboxId, toolboxList]);

  return (
    <div className="ToolModal-ToolboxMenu" ref={menuRef}>
      {toolboxList.map((toolbox, index) => (
        <div
          key={toolbox.toolboxId}
          className={classnames('ToolModal-ToolboxMenu-item', {
            active: activeIndex === index,
          })}
          onClick={() => handleMenuItemClick(toolbox, index)}
        >
          {toolbox.name}
        </div>
      ))}
    </div>
  );
};

export default ToolboxMenu;
