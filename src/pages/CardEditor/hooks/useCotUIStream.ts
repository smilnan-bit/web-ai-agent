import { useCallback, useRef, useState } from 'react';
import { fetchAIStream } from '@/api/sseRequest';
import { resolveChatGeneration } from '../utils/chat-response';
import type { ChatMessage, PreviewSpec } from '../types';

const CHAT_SSE_URL = '/agent/api/cotui/chat/stream';

export interface CotUIStreamCallbacks {
  /** 每次收到 answer 片段时触发，参数为当前累积的全量文本 */
  onChunk?: (accumulated: string) => void;
  /** SSE 流结束且解析完成后触发 */
  onResolved: (result: ReturnType<typeof resolveChatGeneration>, history: ChatMessage[]) => void;
  /** 发生错误时触发 */
  onError?: (errMsg: string) => void;
}

export interface SendStreamParams {
  message: string;
  currentSpec: PreviewSpec;
  messages: ChatMessage[];
  sessionId: string;
}

/**
 * 封装卡片生成 SSE 流的公共逻辑。
 * - 管理 streamBuffer ref，避免闭包陈旧值
 * - 在 answer 事件时累积 buffer 并回调 onChunk（可选）
 * - 在 end 事件时调用 resolveChatGeneration 并回调 onResolved
 * - 在 error 事件或异常时回调 onError（可选）
 */
export function useCotUIStream({ onChunk, onResolved, onError }: CotUIStreamCallbacks) {
  const [loading, setLoading] = useState(false);
  const bufferRef = useRef('');

  const sendStream = useCallback(
    async ({ message, currentSpec, messages, sessionId }: SendStreamParams) => {
      bufferRef.current = '';
      setLoading(true);

      try {
        await fetchAIStream({
          params: { message, currentSpec, messages, sessionId },
          requestUrl: CHAT_SSE_URL,
          uid: sessionId,
          onMessage: (msg) => {
            if (msg.taskType === 'answer' || msg.eventName === 'answer') {
              bufferRef.current += msg.content ?? '';
              onChunk?.(bufferRef.current);
            }

            if (msg.taskType === 'end' || msg.eventName === 'end') {
              console.log('bufferRef.current', bufferRef.current);
              const resolved = resolveChatGeneration(bufferRef.current, currentSpec);
              onResolved(resolved, messages);
              setLoading(false);
            }

            if (msg.taskType === 'error' || msg.eventName === 'error') {
              onError?.(msg.content || '生成失败，请稍后重试。');
              setLoading(false);
            }
          },
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : '请求失败，请稍后重试。';
        onError?.(errMsg);
        setLoading(false);
      }
    },
    [onChunk, onResolved, onError],
  );

  return { sendStream, loading };
}
