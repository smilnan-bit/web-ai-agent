import { useCallback, useEffect, useState } from 'react';
export const useCopyToClipboard = () => {
  const [copiedText, setCopiedText] = useState(null);

  const copy = useCallback(async (text, succesCb) => {
    if (!navigator.clipboard) {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'absolute';
      textArea.style.opacity = '0';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedText(text);
        succesCb?.();
        return true;
      } catch (err) {
        console.error('复制失败', err);
        return false;
      } finally {
        document.body.removeChild(textArea);
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      succesCb?.();
      return true;
    } catch (err) {
      console.error('复制失败', err);
      return false;
    }
  }, []);

  return [copiedText, copy];
};
