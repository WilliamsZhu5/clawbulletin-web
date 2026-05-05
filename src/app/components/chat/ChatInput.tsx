// 统一输入框组件 — 自动 grow textarea + 紫色圆角发送按钮
// Enter 发送，Shift+Enter 换行；发送中 disabled + spinner

import React, { useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { 聊天色, 聊天圆 } from './聊天令牌';

export interface ChatInputProps {
  值: string;
  on值改变: (新值: string) => void;
  on发送: () => void;
  发送中?: boolean;
  禁用?: boolean;
  占位?: string;
  // 上方"附加"槽（典型用于 typing indicator 嵌入或模式切换 chip）
  上方插槽?: React.ReactNode;
  // 提示行（输入框下方的小字，比如「回车发送 · Shift+回车换行」）
  提示文?: string;
  // 自动 focus
  自动聚焦?: boolean;
  最大行数?: number;
}

export function ChatInput({
  值,
  on值改变,
  on发送,
  发送中 = false,
  禁用 = false,
  占位 = '输入消息…',
  上方插槽,
  提示文 = '回车发送 · Shift+回车换行',
  自动聚焦 = false,
  最大行数 = 6,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // textarea 自动 grow（基于 scrollHeight，封顶 max 行）
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const 行高 = 22; // 视觉上一行 ~22px（fontSize 13.5 * lineHeight 1.6）
    const 上限 = 行高 * 最大行数 + 16;
    ta.style.height = Math.min(ta.scrollHeight, 上限) + 'px';
  }, [值, 最大行数]);

  useEffect(() => {
    if (自动聚焦) textareaRef.current?.focus();
  }, [自动聚焦]);

  const 处理键盘 = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!发送中 && !禁用 && 值.trim()) on发送();
    }
  };

  const 可发送 = !!值.trim() && !发送中 && !禁用;

  return (
    <div
      style={{
        background: 聊天色.白,
        borderTop: `1px solid ${聊天色.描边浅}`,
        padding: '12px 16px 14px',
      }}
    >
      {上方插槽 && <div style={{ marginBottom: 8 }}>{上方插槽}</div>}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 10,
          background: '#FAFAF8',
          border: `1px solid ${聊天色.描边}`,
          borderRadius: 聊天圆.输入框,
          padding: '10px 12px',
          transition: 'border-color 0.18s, box-shadow 0.18s',
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(79,70,229,0.5)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)';
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 聊天色.描边;
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        }}
      >
        <textarea
          ref={textareaRef}
          value={值}
          onChange={(e) => on值改变(e.target.value)}
          onKeyDown={处理键盘}
          rows={1}
          placeholder={占位}
          disabled={禁用}
          aria-label="消息输入"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            background: 'transparent',
            fontSize: 13.5,
            lineHeight: 1.6,
            color: 聊天色.字深,
            fontFamily: 'inherit',
            maxHeight: 22 * 最大行数 + 16,
            minHeight: 22,
            padding: 0,
          }}
        />
        <button
          type="button"
          onClick={() => 可发送 && on发送()}
          disabled={!可发送}
          aria-label="发送"
          title="发送（回车）"
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            border: 'none',
            background: 可发送 ? 聊天色.紫 : '#E8E8E4',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 可发送 ? 'pointer' : 'not-allowed',
            flexShrink: 0,
            boxShadow: 可发送 ? '0 2px 8px rgba(79,70,229,0.32)' : 'none',
            transition: 'all 0.18s',
          }}
        >
          {发送中 ? (
            <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />
          ) : (
            <Send style={{ width: 15, height: 15 }} />
          )}
        </button>
      </div>

      {提示文 && (
        <div
          style={{
            marginTop: 6,
            paddingLeft: 4,
            fontSize: 10,
            color: 聊天色.字超浅,
          }}
        >
          {提示文}
        </div>
      )}
    </div>
  );
}

export default ChatInput;
