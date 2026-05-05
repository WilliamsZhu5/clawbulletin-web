// 消息列表容器：自动滚到最新 + 空状态 + 加载更多占位
// 子节点由调用方传入（通常是一组 MessageBubble / ToolCallCard / TypingIndicator）

import React, { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { 聊天色, 聊天间距 } from './聊天令牌';

export interface MessageListProps {
  children: React.ReactNode;
  // 是否在初始加载（显示骨架）
  加载中?: boolean;
  // 是否空状态
  空状态?: boolean;
  // 空状态文案
  空文案标题?: string;
  空文案副?: string;
  空状态图标?: React.ReactNode;
  // 触发自动滚动的依赖（典型传消息数组长度或 typing flag）
  滚动依赖?: any[];
  // 顶部"加载更多"占位（暂时只占位，不接分页）
  显示加载更多?: boolean;
  // 容器背景（默认浅灰）
  背景?: string;
}

export function MessageList({
  children,
  加载中 = false,
  空状态 = false,
  空文案标题 = '开始对话吧',
  空文案副,
  空状态图标,
  滚动依赖 = [],
  显示加载更多 = false,
  背景 = 聊天色.灰底,
}: MessageListProps) {
  const 锚 = useRef<HTMLDivElement | null>(null);
  const 容器 = useRef<HTMLDivElement | null>(null);

  // 平滑滚到底（使用 requestAnimationFrame 让新增节点先布局）
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      锚.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, 滚动依赖);

  return (
    <div
      ref={容器}
      style={{
        flex: 1,
        overflowY: 'auto',
        background: 背景,
        padding: `${聊天间距.容器padY}px ${聊天间距.容器padX}px 8px`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {显示加载更多 && (
        <div
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: 聊天色.字超浅,
            padding: '4px 0 12px',
          }}
        >
          暂无更多消息
        </div>
      )}

      {加载中 && (
        <div
          style={{
            textAlign: 'center',
            color: 聊天色.字浅,
            fontSize: 12,
            padding: 32,
          }}
        >
          加载中…
        </div>
      )}

      {!加载中 && 空状态 && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 聊天色.字浅,
            padding: '40px 20px',
            gap: 8,
          }}
        >
          {空状态图标 ?? (
            <Bot style={{ width: 36, height: 36, color: 聊天色.紫, opacity: 0.7 }} />
          )}
          <div style={{ fontSize: 14, fontWeight: 600, color: 聊天色.字中, marginTop: 6 }}>
            {空文案标题}
          </div>
          {空文案副 && (
            <div style={{ fontSize: 12, color: 聊天色.字浅, textAlign: 'center', lineHeight: 1.6 }}>
              {空文案副}
            </div>
          )}
        </div>
      )}

      {!加载中 && !空状态 && children}

      <div ref={锚} />
    </div>
  );
}

export default MessageList;
