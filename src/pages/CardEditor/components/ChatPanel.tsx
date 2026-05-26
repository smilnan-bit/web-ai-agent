// src/pages/CardEditor/components/ChatPanel.tsx

import React, { useEffect, useRef } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Avatar, Input } from 'antd';
import type { ChatMessage } from '../types';
import { THINKING_MESSAGE_ID } from '../constants';
import { IconFasong, IconSaoba } from '@/assets/icons';
import { DEFAULT_AVATAR_URL_2, DEFAULT_BOT_URL } from '@/constants';
const { TextArea } = Input;

interface ChatPanelProps {
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onClear: () => void;
  loading: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, input, onInputChange, onSend, onClear, loading }) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = !loading && !!input.trim();

  return (
    <div tw="flex flex-col h-full overflow-hidden">
      {/* 消息列表 */}
      <div ref={listRef} tw="flex-1 overflow-auto p-3 pr-0 flex flex-col gap-3" style={{ minHeight: 0 }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            tw="flex gap-[8px]"
            style={{ flexDirection: msg.role === 'assistant' ? 'row' : 'row-reverse' }}
          >
            <Avatar src={msg.role === 'assistant' ? DEFAULT_BOT_URL : DEFAULT_AVATAR_URL_2} />
            <div
              tw="max-w-[calc(100% - 80px)] rounded-lg px-3 py-2 text-[14px] leading-relaxed whitespace-pre-wrap"
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#e0e3ff' : 'rgba(0,0,0,0.04)',
                color: msg.role === 'user' ? 'var(--ysf-main)' : 'rgba(0,0,0,0.85)',
              }}
            >
              {msg.id === THINKING_MESSAGE_ID ? (
                <span tw="flex items-center gap-2">
                  <LoadingOutlined />
                  {msg.content}
                </span>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 输入区 */}
      <div tw="flex-shrink-0 px-5 pt-3 pb-3" style={{ background: '#fff' }}>
        {/* 输入框主体 */}
        <div tw="flex items-center gap-2 mb-2">
          {/* 清除按钮 */}

          <IconSaoba onClick={onClear} />

          {/* 输入框 + 发送按钮 */}
          <div
            tw="flex-1 flex items-center"
            style={{
              border: '1px solid #505efa',
              borderRadius: 8,
              padding: '4px 4px 4px 16px',
              background: '#fff',
              minHeight: 48,
              maxHeight: 82,
            }}
          >
            <TextArea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="描述内容"
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
              bordered={false}
              style={{ flex: 1, padding: 0, resize: 'none', fontSize: 14, lineHeight: '22px' }}
            />
            {/* 竖分割线 */}
            <div tw="flex-shrink-0 mx-2" style={{ width: 1, height: 20, background: '#eaeaf2', alignSelf: 'center' }} />
            {/* 发送按钮 */}
            <button
              type="button"
              tw="flex-shrink-0 flex items-center justify-center cursor-pointer transition-opacity"
              style={{
                width: 32,
                height: 32,
                background: '#505efa',
                borderRadius: 8,
                border: 'none',
                padding: 0,
                opacity: canSend ? 1 : 0.5,
                cursor: canSend ? 'pointer' : 'not-allowed',
              }}
              onClick={canSend ? onSend : undefined}
            >
              <IconFasong color="#fff" />
            </button>
          </div>
        </div>

        {/* 底部提示文字 */}
        <p tw="text-[12px] text-center m-0" style={{ color: '#aeadb8' }}>
          内容由AI生成，无法确保真实准确，仅供参考
        </p>
      </div>
    </div>
  );
};

export default ChatPanel;
