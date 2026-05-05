// 统一 chat 顶部 — 头像 + 名字 + 状态 + 右侧菜单/关闭

import React, { useState } from 'react';
import { ChevronLeft, X, MoreHorizontal } from 'lucide-react';
import { 聊天色 } from './聊天令牌';

export interface ChatHeaderProps {
  // 对方头像
  头像?: { 首字母?: string; 颜色?: string };
  名字: string;
  // 副标题（比如帖子标题、谈判进度）
  副标题?: React.ReactNode;
  // 在线状态
  状态?: 'online' | 'typing' | 'offline' | null;
  // 左侧按钮：返回 / 关闭 / 无
  左侧?: 'back' | 'close' | 'none';
  on左侧点击?: () => void;
  // 右侧自定义节点（典型放 chip 或 menu）
  右侧?: React.ReactNode;
  // 是否显示 ⋯ 菜单按钮（占位，点开下拉）
  显示菜单?: boolean;
  on菜单点击?: () => void;
}

export function ChatHeader({
  头像,
  名字,
  副标题,
  状态,
  左侧 = 'none',
  on左侧点击,
  右侧,
  显示菜单 = false,
  on菜单点击,
}: ChatHeaderProps) {
  const [菜单悬停, set菜单悬停] = useState(false);

  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: 聊天色.白,
        borderBottom: `1px solid ${聊天色.描边浅}`,
        minHeight: 60,
      }}
    >
      {/* 左侧按钮 */}
      {左侧 !== 'none' && (
        <button
          type="button"
          onClick={on左侧点击}
          aria-label={左侧 === 'back' ? '返回' : '关闭'}
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            border: 'none',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 聊天色.字浅,
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.04)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          {左侧 === 'back' ? (
            <ChevronLeft style={{ width: 18, height: 18 }} />
          ) : (
            <X style={{ width: 16, height: 16 }} />
          )}
        </button>
      )}

      {/* 头像 */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 头像?.颜色 || 聊天色.紫渐变,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {头像?.首字母 || ''}
      </div>

      {/* 名字 + 副标题 + 状态 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 聊天色.字深,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {名字}
          </span>
          {状态 === 'online' && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: 聊天色.绿,
                flexShrink: 0,
              }}
            />
          )}
        </div>
        {副标题 && (
          <div
            style={{
              fontSize: 11,
              color: 状态 === 'typing' ? 聊天色.紫 : 聊天色.字浅,
              marginTop: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontStyle: 状态 === 'typing' ? 'italic' : 'normal',
            }}
          >
            {状态 === 'typing' ? '正在输入…' : 副标题}
          </div>
        )}
      </div>

      {/* 右侧自定义 */}
      {右侧 && <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>{右侧}</div>}

      {/* ⋯ 菜单（占位） */}
      {显示菜单 && (
        <button
          type="button"
          onClick={on菜单点击}
          aria-label="更多操作"
          onMouseEnter={() => set菜单悬停(true)}
          onMouseLeave={() => set菜单悬停(false)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            border: 'none',
            background: 菜单悬停 ? 'rgba(0,0,0,0.04)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 聊天色.字浅,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <MoreHorizontal style={{ width: 16, height: 16 }} />
        </button>
      )}
    </div>
  );
}

export default ChatHeader;
