import { request } from '@/utils';
import type { Response } from '@/utils/fetch';

export const fetchCreateAIPrompt = (data: {
  hint: string;
  appId: number;
  type: string;
  oldPrompt?: string;
}): Promise<Response<any>> => {
  return request('/agent/api/app/prompt/optimize', {
    method: 'post',
    data,
  });
};
