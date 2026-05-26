import { request } from '@/utils';
export const fetchLLMOptions = () => request('/agent/api/workflow/canvas/model/get');
