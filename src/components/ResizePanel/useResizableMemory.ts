import { useCallback, useEffect, useState } from 'react';
import { Storage } from '@ysf/helper';

const { Local } = Storage;

interface ResizableSize {
  width: number | string;
  height: number | string;
}

interface UseResizableMemoryOptions {
  /** 存储的 key，用于区分不同的 Resizable 组件 */
  storageKey: string;
  /** 默认宽度 */
  defaultWidth: number;
  /** 默认高度 */
  defaultHeight: number | string;
  /** 最小宽度 */
  minWidth?: number;
  /** 最大宽度 */
  maxWidth?: number | string;
  /** 是否启用记忆功能，默认为 true */
  enableMemory?: boolean;
}

/**
 * Resizable 组件记忆功能 Hook
 * 用于记住用户调整的 Resizable 组件大小，刷新浏览器后保持之前设置的大小
 */
export const useResizableMemory = (options: UseResizableMemoryOptions) => {
  const { storageKey, defaultWidth, defaultHeight, minWidth = 0, maxWidth = '100vw', enableMemory = true } = options;

  // 从本地存储获取保存的大小
  const getStoredSize = useCallback((): ResizableSize => {
    if (!enableMemory) {
      return { width: defaultWidth, height: defaultHeight };
    }

    try {
      const stored = Local.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 确保宽度在合理范围内
        let width = parsed.width || defaultWidth;
        if (minWidth && width < minWidth) {
          width = minWidth;
        }
        if (typeof maxWidth === 'number' && width > maxWidth) {
          width = maxWidth;
        }
        return {
          width,
          height: parsed.height || defaultHeight,
        };
      }
    } catch (error) {
      console.warn(`Failed to parse stored size for key "${storageKey}":`, error);
    }

    return { width: defaultWidth, height: defaultHeight };
  }, [storageKey, defaultWidth, defaultHeight, minWidth, maxWidth, enableMemory]);

  const [size, setSize] = useState<ResizableSize>(getStoredSize);

  // 保存大小到本地存储
  const saveSize = useCallback(
    (newSize: ResizableSize) => {
      if (!enableMemory) return;

      try {
        Local.setItem(storageKey, JSON.stringify(newSize));
      } catch (error) {
        console.warn(`Failed to save size for key "${storageKey}":`, error);
      }
    },
    [storageKey, enableMemory],
  );

  // 处理大小变化
  const handleSizeChange = useCallback(
    (newSize: ResizableSize) => {
      setSize(newSize);
      saveSize(newSize);
    },
    [saveSize],
  );

  // 重置为默认大小
  const resetSize = useCallback(() => {
    const defaultSize = { width: defaultWidth, height: defaultHeight };
    setSize(defaultSize);
    if (enableMemory) {
      Local.removeItem(storageKey);
    }
  }, [defaultWidth, defaultHeight, storageKey, enableMemory]);

  // 组件挂载时从存储中恢复大小
  useEffect(() => {
    const storedSize = getStoredSize();
    setSize(storedSize);
  }, [getStoredSize]);

  return {
    size,
    handleSizeChange,
    resetSize,
  };
};

export default useResizableMemory;
