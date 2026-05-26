// 工具函数与类型全部从 @ysf/a2ui-core 透出，本文件只保留 web-ai-agent 编辑器
// 独有的 mock 数据，避免下游 import 路径变化。
export {
  cloneRuntimeData,
  collectBindings,
  getRuntimeValue,
  setRuntimeValue,
  collectActionNames,
  collectEventInfo,
} from '@ysf/a2ui-core';

export type { EventInfo } from '@ysf/a2ui-core';

import type { RuntimeData } from '@ysf/a2ui-core';

/** 编辑器预览态默认 runtimeData，仅 web-ai-agent 使用 */
export const defaultRuntimeData: RuntimeData = {
  user: { name: 'Alex Chen', email: 'alex.chen@acme.ai' },
  product: { title: 'AeroPulse Headphones', price: '$249' },
  order: { id: '#A23198', arrival: 'Tomorrow, 18:00 - 21:00' },
};
