// 统一消息气泡（user / agent / system / tool）
// 所有 chat 界面共用这一组件，保证视觉一致

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bot } from 'lucide-react';
import { 聊天色, 聊天圆, 聊天间距, 聊天阴影 } from './聊天令牌';

export type 气泡角色 = 'user' | 'agent' | 'system' | 'tool';

export interface 气泡头像 {
  // 优先用文字首字母 + 背景色（element 多色保留）
  首字母?: string;
  颜色?: string;
}

export interface MessageBubbleProps {
  角色: 气泡角色;
  // user / agent / tool 都可有头像；system 居中无头像
  头像?: 气泡头像;
  名字?: string;
  // 内容可以是字符串或 ReactNode（比如内嵌的 ToolCallCard）
  内容: React.ReactNode;
  时间?: Date | string | null;
  状态?: 'sending' | 'sent' | 'error';
  // 是否显示头像（连续同发送者时可隐藏，以更紧凑）
  显示头像?: boolean;
  // 是否显示名字（连续同发送者时可隐藏）
  显示名字?: boolean;
  // 入场动画索引（用于 stagger）
  动画索引?: number;
}

// 时间格式：今天用 HH:mm，昨天用「昨天 HH:mm」，更早显示日期
function 格式化时间(时: Date | string): string {
  try {
    const d = typeof 时 === 'string' ? new Date(时) : 时;
    const 现 = new Date();
    const 是今天 =
      d.getFullYear() === 现.getFullYear() &&
      d.getMonth() === 现.getMonth() &&
      d.getDate() === 现.getDate();
    const hm = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    if (是今天) return hm;
    const 昨 = new Date(现);
    昨.setDate(昨.getDate() - 1);
    const 是昨天 =
      d.getFullYear() === 昨.getFullYear() &&
      d.getMonth() === 昨.getMonth() &&
      d.getDate() === 昨.getDate();
    if (是昨天) return `昨天 ${hm}`;
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' + hm;
  } catch {
    return String(时);
  }
}

// 头像小球
function 头像小球({ 头像, 大小 = 32 }: { 头像?: 气泡头像; 大小?: number }) {
  const 字号 = 大小 <= 24 ? 9 : 大小 <= 28 ? 10 : 11;
  if (!头像) {
    return (
      <div
        style={{
          width: 大小,
          height: 大小,
          borderRadius: '50%',
          background: 聊天色.紫渐变,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          flexShrink: 0,
        }}
      >
        <Bot style={{ width: 大小 * 0.5, height: 大小 * 0.5 }} />
      </div>
    );
  }
  return (
    <div
      style={{
        width: 大小,
        height: 大小,
        borderRadius: '50%',
        background: 头像.颜色 || 聊天色.紫渐变,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 字号,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {头像.首字母 || ''}
    </div>
  );
}

export function MessageBubble({
  角色,
  头像,
  名字,
  内容,
  时间,
  状态,
  显示头像 = true,
  显示名字 = true,
  动画索引 = 0,
}: MessageBubbleProps) {
  const [鼠标在上, set鼠标在上] = useState(false);

  // ── system：居中淡灰 ──
  if (角色 === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: Math.min(动画索引 * 0.04, 0.3) }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          margin: '8px 0',
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: 聊天色.字浅,
            background: 'rgba(0,0,0,0.03)',
            padding: '4px 12px',
            borderRadius: 999,
            maxWidth: '80%',
            textAlign: 'center',
          }}
        >
          {内容}
        </div>
      </motion.div>
    );
  }

  // ── tool：左对齐折叠卡（内容由调用方传入 ToolCallCard） ──
  if (角色 === 'tool') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: Math.min(动画索引 * 0.04, 0.3) }}
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginBottom: 聊天间距.消息间隔 - 4,
          paddingLeft: 显示头像 ? 0 : 44, // 跟 agent 气泡对齐
        }}
      >
        <div style={{ maxWidth: '78%' }}>{内容}</div>
      </motion.div>
    );
  }

  const isUser = 角色 === 'user';
  const 气泡背景 = isUser ? 聊天色.紫 : 聊天色.白;
  const 气泡字色 = isUser ? '#FFFFFF' : 聊天色.字深;
  const 气泡边框 = isUser ? 'none' : `1px solid ${聊天色.描边}`;
  const 气泡阴影 = isUser ? 'none' : 聊天阴影.气泡;
  // 圆角：发送侧的"尾巴"角变小
  const 气泡圆角 = isUser
    ? `${聊天圆.气泡} ${聊天圆.气泡} ${聊天圆.气泡尾} ${聊天圆.气泡}`
    : `${聊天圆.气泡} ${聊天圆.气泡} ${聊天圆.气泡} ${聊天圆.气泡尾}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(动画索引 * 0.04, 0.3) }}
      onMouseEnter={() => set鼠标在上(true)}
      onMouseLeave={() => set鼠标在上(false)}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        gap: 8,
        marginBottom: 聊天间距.消息间隔,
        alignItems: 'flex-end',
      }}
    >
      {/* 左侧头像（agent） */}
      {!isUser && (
        <div style={{ width: 32, flexShrink: 0 }}>
          {显示头像 && <头像小球 头像={头像} 大小={32} />}
        </div>
      )}

      <div
        style={{
          maxWidth: '70%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start',
          gap: 3,
        }}
      >
        {/* 名字（仅 agent 侧、显示名字 时渲染） */}
        {!isUser && 显示名字 && 名字 && (
          <div
            style={{
              fontSize: 11,
              color: 聊天色.字浅,
              fontWeight: 500,
              paddingLeft: 4,
            }}
          >
            {名字}
          </div>
        )}

        {/* 气泡 */}
        <div
          style={{
            background: 气泡背景,
            color: 气泡字色,
            border: 气泡边框,
            borderRadius: 气泡圆角,
            padding: `${聊天间距.气泡内padY}px ${聊天间距.气泡内padX}px`,
            fontSize: 13.5,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            boxShadow: 气泡阴影,
            opacity: 状态 === 'sending' ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {内容}
        </div>

        {/* 时间 + 状态：hover 才显示，避免视觉打扰 */}
        <div
          style={{
            fontSize: 10,
            color: 状态 === 'error' ? 聊天色.红 : 聊天色.字超浅,
            paddingLeft: isUser ? 0 : 4,
            paddingRight: isUser ? 4 : 0,
            opacity: 鼠标在上 || 状态 === 'error' || 状态 === 'sending' ? 1 : 0,
            transition: 'opacity 0.18s',
            height: 14,
          }}
        >
          {状态 === 'sending' && '发送中…'}
          {状态 === 'error' && '发送失败'}
          {(!状态 || 状态 === 'sent') && 时间 && 格式化时间(时间)}
        </div>
      </div>

      {/* 右侧头像（user） */}
      {isUser && (
        <div style={{ width: 32, flexShrink: 0 }}>
          {显示头像 && <头像小球 头像={头像} 大小={32} />}
        </div>
      )}
    </motion.div>
  );
}

export default MessageBubble;
