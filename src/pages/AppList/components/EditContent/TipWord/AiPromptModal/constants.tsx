export enum AIPromptType {
  OPTIMIZE = 'OPTIMIZE',
  GENERATE = 'GENERATE',
}

export const DEFAUlT_PLACEHOLDER = {
  [AIPromptType.OPTIMIZE]: '请描述您希望如何优化提示词。比如：帮我将提示词优化的更结构化些。',
  [AIPromptType.GENERATE]:
    '比如：帮我生成一段可以处理退货挽留的提示词，当客户提出要退货时，请帮我优先调用工具查询物流状态，若物流状态为未收货时，请进行极力挽留。人设希望是萌萌的女孩子。',
};
