import type { ParsedEvent, ReconnectInterval } from 'eventsource-parser';
import { createParser } from 'eventsource-parser';
// import type { ISteamMessage } from './type';

const onlineUrl = '/openapi/agent/chat';

export const fetchAIStream = async ({
  params,
  onMessage,
  requestUrl,
  requestConfig = { headers: {} } as
    | { headers: Record<string, string> }
    | ((prompt: string) => { headers: Record<string, string> }),
  uid,
}) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const { headers = {}, ...otherConfig } = typeof requestConfig === 'function' ? requestConfig(params) : requestConfig;
  const res = await fetch(requestUrl || onlineUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    method: 'POST',
    body: JSON.stringify(params),
    ...otherConfig,
  });
  if (res.status !== 200) {
    throw new Error('网络连接异常，请稍后再试');
  }
  const contentType = res.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    const jsonData = await res.json();
    if (jsonData.code === 302) {
      throw new Error('__LOGIN_REQUIRED__:' + (jsonData.data || ''));
    }
    if (jsonData?.code === 400) {
      throw new Error(jsonData.message || '请求错误');
    }
  } else {
    const stream = new ReadableStream({
      async start(controller) {
        const onParse = (event: ParsedEvent | ReconnectInterval) => {
          if (event.type === 'event') {
            const data = event.data;
            if (data === '[DONE]') {
              controller.close();
              return;
            }

            try {
              // const json: ISteamMessage = JSON.parse(data);
              const json = JSON.parse(data);
              if (onMessage) {
                onMessage(json, uid);
              }
              const queue = encoder.encode(data);
              controller.enqueue(queue);
            } catch (e) {
              controller.error(e);
            }
          }
        };

        const parser = createParser(onParse);

        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      },
    });

    return stream;
  }
};
