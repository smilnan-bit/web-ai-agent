import { type RequestResultType, request } from '@/utils';

export const getGlobalConfig: () => RequestResultType<basicNS.GlobalConfigType> = () => {
  return request('/agent/api/app/setting');
};
