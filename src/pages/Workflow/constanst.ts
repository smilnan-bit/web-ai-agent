export const copiedForbiddenTipsMap: Record<string, string> = {
  noPublish: '仅支持复制已发布的工作流，当前工作流未发布，无法复制。',
  isOld: '仅支持复制新版本的工作流，当前工作流为老版本，无法复制。请使用新画布进行工作流的配置。',
  normal: '复制',
};

export const copyDisabledMap: Record<string, boolean> = {
  noPublish: true,
  isOld: true,
  normal: false,
};
