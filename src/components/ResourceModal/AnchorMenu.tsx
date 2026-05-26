import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import './index.less';

export interface AnchorItem {
  id: string | number;
  name: string;
}

interface AnchorMenuProps {
  items: AnchorItem[];
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  /** data 属性名，用于在滚动容器中定位对应 DOM，默认 'data-anchor-id' */
  anchorAttr?: string;
}

const AnchorMenu: React.FC<AnchorMenuProps> = ({ items, scrollContainerRef, anchorAttr = 'data-anchor-id' }) => {
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
      const anchorItems = scrollContainer.querySelectorAll(`[${anchorAttr}]`);
      const isScrolledToBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - containerRect.height <= 1;

      let currentIndex = 0;
      if (isScrolledToBottom) {
        currentIndex = anchorItems.length - 1;
      } else {
        anchorItems.forEach((item, index) => {
          const rect = item.getBoundingClientRect();
          if (rect.top <= containerRect.top + 100) {
            currentIndex = index;
          }
        });
      }

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => setActiveIndex(currentIndex), 50);

      // 同步右侧菜单滚动
      const menuItem = menuRef.current?.children[currentIndex] as HTMLElement;
      if (menuItem && menuRef.current) {
        if (isScrolledToBottom) {
          const lastItemTop = menuItem.offsetTop;
          const menuHeight = menuRef.current.clientHeight;
          const lastItemHeight = menuItem.offsetHeight;
          menuRef.current.scrollTo({ top: lastItemTop + lastItemHeight - menuHeight, behavior: 'smooth' });
        } else {
          const menuRect = menuRef.current.getBoundingClientRect();
          const itemRect = menuItem.getBoundingClientRect();
          const itemTop = itemRect.top - menuRect.top + menuRef.current.scrollTop;
          const menuHeight = menuRef.current.clientHeight;
          const itemOffsetTop = itemTop - menuRef.current.scrollTop;
          if (itemOffsetTop < 0) {
            menuRef.current.scrollTo({ top: itemTop, behavior: 'smooth' });
          } else if (itemOffsetTop + itemRect.height > menuHeight) {
            menuRef.current.scrollTo({ top: itemTop + itemRect.height - menuHeight, behavior: 'smooth' });
          }
        }
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (scrollCheckTimerRef.current) cancelAnimationFrame(scrollCheckTimerRef.current);
    };
  }, [scrollContainerRef, anchorAttr]);

  const handleMenuItemClick = (item: AnchorItem, index: number) => {
    isScrollingRef.current = true;
    setActiveIndex(index);

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      isScrollingRef.current = false;
      return;
    }

    const anchorEl = scrollContainer.querySelector(`[${anchorAttr}="${item.id}"]`) as HTMLElement;
    if (!anchorEl) {
      isScrollingRef.current = false;
      return;
    }

    const containerRect = scrollContainer.getBoundingClientRect();
    const itemRect = anchorEl.getBoundingClientRect();
    const targetScrollTop = scrollContainer.scrollTop + itemRect.top - containerRect.top - 24;
    targetScrollTopRef.current = targetScrollTop;

    if (scrollCheckTimerRef.current) {
      cancelAnimationFrame(scrollCheckTimerRef.current);
      scrollCheckTimerRef.current = null;
    }

    scrollContainer.scrollTo({ top: targetScrollTop, behavior: 'smooth' });

    const startTime = Date.now();
    const maxWaitTime = 2000;
    const tolerance = 5;

    const checkScrollComplete = () => {
      const distance = Math.abs(scrollContainer.scrollTop - targetScrollTop);
      const elapsedTime = Date.now() - startTime;
      if (distance <= tolerance || elapsedTime >= maxWaitTime) {
        isScrollingRef.current = false;
        targetScrollTopRef.current = null;
        scrollCheckTimerRef.current = null;
        return;
      }
      scrollCheckTimerRef.current = requestAnimationFrame(checkScrollComplete);
    };
    scrollCheckTimerRef.current = requestAnimationFrame(checkScrollComplete);
  };

  return (
    <div className="ResourceModal-AnchorMenu" ref={menuRef}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={classnames('ResourceModal-AnchorMenu-item', { active: activeIndex === index })}
          onClick={() => handleMenuItemClick(item, index)}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
};

export default AnchorMenu;
