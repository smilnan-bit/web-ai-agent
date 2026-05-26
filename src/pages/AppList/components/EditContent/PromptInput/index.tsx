import React, { useMemo } from 'react';
import { PromptEditor } from '@flowgram.ai/form-materials';
import LibraryBlockPopover from './LibraryBlockPopover';
import { CurrentAppState, GlobalConfigState } from '@/model';
import { useRecoilValue } from 'recoil';
import { LibraryBlockWidget } from './LibraryBlockWidget';
import type { ILibraryList } from './type';
import { message } from 'antd';

const PromptInput = ({ value, onChange }: { value?: string; onChange?: (value?: string) => void }) => {
  const globalConfig = useRecoilValue(GlobalConfigState) || {};
  const { toolList, workflowList, ysKnowledgeList } = useRecoilValue(CurrentAppState);
  const librarys: ILibraryList[] = useMemo(
    () => [
      { type: 'tool', list: toolList ?? [] },
      { type: 'workflow', list: workflowList ?? [] },
      { type: 'knowledge', list: ysKnowledgeList ?? [] },
    ],
    [toolList, workflowList, ysKnowledgeList],
  );
  return (
    <PromptEditor
      value={{ type: 'template', content: value || '' }}
      onChange={(tpl) => {
        if (tpl?.content?.length && tpl?.content?.length >= globalConfig.promptLimit) {
          message.error(`提示词长度不能超过${globalConfig.promptLimit}`);
        } else {
          onChange?.(tpl?.content);
        }
      }}
      placeholder={`请填写AI Agent的人设、功能逻辑、条件限制等内容；\n支持通过输入“#+空格”的方式，将 Markdown 格式标亮；\n支持通过输入“{”的方式，引用“工具/工作流/知识”；`}
    >
      <LibraryBlockPopover />
      <LibraryBlockWidget librarys={librarys} />
    </PromptEditor>
  );
};

export default PromptInput;
