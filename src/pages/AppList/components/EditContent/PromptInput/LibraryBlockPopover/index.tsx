import React, { useEffect, useMemo, useState } from 'react';
import { DEFAULT_TRIGGER_CHARACTERS } from '@/constants/config';

import {
  Mention,
  getCurrentMentionReplaceRange,
  type MentionOpenChangeEvent,
  useEditor,
  PositionMirror,
  // @ts-ignore - Module resolution issue with exports subpath
} from '@flowgram.ai/coze-editor/react';
// @ts-ignore - Module resolution issue with exports subpath
import type { EditorAPI } from '@flowgram.ai/coze-editor/preset-prompt';
import { Popover } from '@douyinfe/semi-ui';
import { CurrentAppState } from '@/model';
import { useRecoilValue } from 'recoil';
import { useMemoizedFn } from 'ahooks';
import { Button, message } from 'antd';
import { TemplateParser } from '../TemplateParser';
import type { LibraryType } from '../type';
import type { AppsNS } from '@/types/Apps';
import { LibraryConfig } from '../utils';
import { nanoid } from 'nanoid';

const templateParser = new TemplateParser({ mark: 'InputSlot' });
const Content = ({
  onAdd,
}: {
  onAdd: (item: AppsNS.ILibraryItem, libraryType: LibraryType) => void;
}) => {
  const { toolList, workflowList, ysKnowledgeList } = useRecoilValue(CurrentAppState);
  const isEmpty = useMemo(() => {
    return !toolList?.length && !workflowList?.length && !ysKnowledgeList?.length;
  }, [toolList, workflowList, ysKnowledgeList]);

  const renderPLuginList = useMemoizedFn(
    ({
      list = [],
      name,
      libraryType,
    }: {
      list?: AppsNS.ILibraryItem[];
      name: string;
      libraryType: LibraryType;
    }) => {
      return (
        <div tw="[&:not(:last-of-type)]:mb-[14px]">
          <div tw="text-[#00000073]">{name}</div>
          {list.map((item) => {
            return (
              <div key={item[LibraryConfig[libraryType].idKey]} tw="flex items-center justify-between mt-[14px]">
                <span tw="max-w-[260px] text-ellipsis overflow-hidden whitespace-nowrap">
                  {item[LibraryConfig[libraryType].nameKey]}
                </span>
                <Button onClick={() => onAdd(item, libraryType)}>添加</Button>
              </div>
            );
          })}
        </div>
      );
    },
  );

  return isEmpty ? (
    <div tw="flex items-center justify-center text-[rgba(0, 0, 0, 0.25)] p-[8px]">暂无数据</div>
  ) : (
    <div tw="px-[12px] py-[10px]">
      {!!toolList?.length && renderPLuginList({ list: toolList, name: '工具', libraryType: 'tool' })}
      {!!workflowList?.length &&
        renderPLuginList({
          list: workflowList,
          name: '工作流',
          libraryType: 'workflow',
        })}
      {!!ysKnowledgeList?.length &&
        renderPLuginList({
          list: ysKnowledgeList,
          name: '知识库',
          libraryType: 'knowledge',
        })}
    </div>
  );
};

const LibraryBlockPopover = ({ triggerCharacters = DEFAULT_TRIGGER_CHARACTERS }) => {
  const [posKey, setPosKey] = useState('');
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState(-1);
  const editor = useEditor<EditorAPI>();

  function insert(item: AppsNS.ILibraryItem, libraryType: LibraryType) {
    const range = getCurrentMentionReplaceRange(editor.$view.state);

    if (!range) {
      return;
    }

    /**
     * When user input {{xxxx}}, {{{xxx}}}(more brackets if possible), replace all brackets with {{xxxx}}
     */
    let { from, to } = range;
    while (editor.$view.state.doc.sliceString(from - 1, from) === '{') {
      from--;
    }
    while (editor.$view.state.doc.sliceString(to, to + 1) === '}') {
      to++;
    }

    const template = templateParser.generateTemplate({
      content: item[LibraryConfig[libraryType].nameKey],
      data: {
        id: item[LibraryConfig[libraryType].idKey],
        uuid: nanoid(),
        type: libraryType,
      },
    });
    setVisible(false);
    message.success('添加成功');
    templateParser.insertTemplateByRange(editor, template, { from, to });
  }

  function handleOpenChange(e: MentionOpenChangeEvent) {
    setPosition(e.state.selection.main.head);
    setVisible(e.value);
  }

  useEffect(() => {
    if (!editor) {
      return;
    }
  }, [editor, visible]);

  return (
    <>
      <Mention triggerCharacters={triggerCharacters} onOpenChange={handleOpenChange} />

      <Popover
        visible={visible}
        trigger="custom"
        position="topLeft"
        rePosKey={posKey}
        content={<Content onAdd={insert} />}
        style={{ width: 360, maxHeight: '500px', overflowY: 'auto' }}
      >
        {/* PositionMirror allows the Popover to appear at the specified cursor position */}
        <PositionMirror
          position={position}
          // When Doc scroll, update position
          onChange={() => setPosKey(String(Math.random()))}
        />
      </Popover>
    </>
  );
};

export default LibraryBlockPopover;
