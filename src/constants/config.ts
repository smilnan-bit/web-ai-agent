// 导航的ICON地址
export const BRAND_LOGO_URL = require('@/assets/logo-agent-studio.png');

/** form布局 label为4 */
export const formItemLayout2 = { labelCol: { span: 4 }, wrapperCol: { span: 20 } };

export const DEFAULT_AVATAR_URL = 'https://res.qiyukf.net/operation/fea62502540df36aefd4a771ae821943';

export const DEFAULT_AVATAR_URL_2 = 'https://res.qiyukf.net/storage/f5975104-b57d-4c16-999a-8381a8328592.png';

export const DEFAULT_BOT_URL = 'https://res.qiyukf.net/storage/9f8d48f3-08d2-4934-b65a-62d4bc9f0d17.png';

export const trimPattern = /^(?!\s)(?![\s\S]*\s$)/;

export const APP_GUID = { test: '63b6a1f85a6f4436af62bf08ab34451c', online: 'a7bcd457c369475faf96464b0216024b' };

export const httpsUrlPattern = /^https:\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;

export const ParamNameValidator = { pattern: /^[A-Za-z0-9_]*$/, message: '变量名称只能包含字母、数字、下划线' };

export const ArrayItemName = '[Array Item]';

// 名称校验正则
export const ToolNameValidator = {
  pattern: /^[A-Za-z0-9_\-]*$/,
  message: '仅支持输入：字母（大小写）、数字、下划线_、连字符-',
};

// 导入配置地址
export const nosConfig = {
  nosLocation: 'https://nos.netease.com/ysf',
  nosDLL: 'https://ysf.nosdn.127.net/',
  nosTokenApi: '/agent/api/nos/token',
};

export const selectedCardStyle = {
  height: '100%',
  border: '1px solid #5983ff',
  backgroundColor: '#fff',
};

export const notSelectedCardStyle = {
  height: '100%',
  border: '1px solid #d9d9d9',
  backgroundColor: '#fff',
};

export const disabledCardStyle = {
  backgroundColor: '#f5f5f5',
  cursor: 'not-allowed',
};

// 触发浮层的字符
export const DEFAULT_TRIGGER_CHARACTERS = ['{', '{}'];
