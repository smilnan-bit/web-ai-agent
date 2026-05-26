import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMemoizedFn, useThrottleFn } from 'ahooks';
import { produce } from 'immer';
import { message } from 'antd';
import { fetchAIStream } from '@/api/sseRequest';
import { TypeWriter } from '@/pages/AppList/components/EditContent/TipWord/AiPromptModal/TypeWriter';

enum TaskTypeEnum {
  END = 'end',
  START = 'start',
  ANSWER = 'answer',
  ERROR = 'error',
}

export interface MsgProps {
  eventName: TaskTypeEnum;
  taskType?: TaskTypeEnum;
  taskState?: string;
  content: string;
  traceId: string;
}

/**
 * useSteamMsg
 * @param loading - 是否正在加载
 * @param setLoading - 设置加载状态
 * @param uuid  - 唯一标识符
 */
export function useSteamMsg({
  loading,
  setLoading,
  uuid,
  requestUrl,
  onError,
}: {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  uuid: string;
  requestUrl: string;
  onError?: (msg: MsgProps) => void;
}) {
  const [string, setString] = useState('');

  const [isDone, setIsDone] = useState(true);

  const writeRef = useRef<any>(null);

  const loadingRef = useRef(loading); // 用于存储最新的 loading 状态

  const uuidRef = useRef<string>(''); // 用于存储最新的 uuid

  const setAnswer = useCallback(
    (content: string) => {
      setString(produce((pre) => pre + content));
    },
    [setString],
  );

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    uuidRef.current = uuid;
  }, [uuid]);

  const onMessage = (msg: MsgProps, uid: string) => {
    // 如果不是同一此modal创建的消息，则忽略
    if (uid !== uuidRef.current) return;
    console.log('msg', msg);
    if ([msg.eventName, msg.taskType].includes(TaskTypeEnum.ANSWER) && msg.taskState === undefined && msg.content) {
      writeRef.current?.add(msg.content);
      if (loadingRef?.current) setLoading && setLoading(false);
    }

    if ([msg.eventName, msg.taskType].includes(TaskTypeEnum.END)) {
      setTimeout(() => {
        writeRef.current?.done();
        setLoading && setLoading(false);
        // setString(produce((prev) => prev + content));
        setIsDone(true);
      }, 1500);
    }
    if ([msg.eventName, msg.taskType].includes(TaskTypeEnum.ERROR)) {
      setTimeout(() => {
        writeRef.current?.done();
        setLoading && setLoading(false);
        // setString(produce((prev) => prev + content));
        setIsDone(true);
      }, 1500);
      onError && onError(msg);
    }
  };

  const handleRequestMessage = useMemoizedFn((params) => {
    writeRef.current.start();
    setString('');
    setLoading && setLoading(true);
    setIsDone(false);
    fetchAIStream({ params, onMessage, requestUrl, uid: uuid }).catch((e) => {
      console.log('fetchAIStream error', e);
      message.error(e.message || '生成失败，请稍后再试。');
      setLoading(false);
      setIsDone(true);
    });
  });

  const handleClear = useMemoizedFn(() => {
    writeRef.current?.done();
    loadingRef.current = false;
    uuidRef.current = '';
    setString('');
    setIsDone(true);
  });

  useEffect(() => {
    writeRef.current = new TypeWriter(setAnswer);
    return () => {
      writeRef.current = null;
    };
  }, [setAnswer]);

  return {
    msg: string,
    requestMsg: handleRequestMessage,
    clear: handleClear,
    finish: isDone,
  };
}
