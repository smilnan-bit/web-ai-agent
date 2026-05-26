import { type FC, type CSSProperties, useEffect, useRef, useState, useMemo } from 'react';

import { usePlayground } from '@flowgram.ai/free-layout-editor';

import type { CommentEditorModel } from '../model';
import { CommentEditorEvent } from '../constant';
import React from 'react';

interface ICommentEditor {
  model: CommentEditorModel;
  style?: CSSProperties;
  value?: string;
  onChange?: (value: string) => void;
}

const MAX_LENGTH = 2000;

export const CommentEditor: FC<ICommentEditor> = (props) => {
  const { model, style, onChange } = props;
  const playground = usePlayground();
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const placeholder = model.value || model.focused ? undefined : '输入要添加的注释...';

  // 同步编辑器内部值变化
  useEffect(() => {
    const disposer = model.on((params) => {
      if (params.type !== CommentEditorEvent.Change) {
        return;
      }
      onChange?.(model.value);
    });
    return () => disposer.dispose();
  }, [model, onChange]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    model.element = editorRef.current;
  }, [editorRef]);

  return (
    <div className="workflow-comment-editor">
      <p className="workflow-comment-editor-placeholder">{placeholder}</p>
      <textarea
        className="workflow-comment-editor-textarea"
        ref={editorRef}
        style={style}
        maxLength={MAX_LENGTH}
        readOnly={playground.config.readonly}
        onChange={(e) => {
          const { value } = e.target;
          model.setValue(value);
        }}
        onFocus={() => {
          model.setFocus(true);
        }}
        onBlur={() => {
          model.setFocus(false);
        }}
      />
    </div>
  );
};
