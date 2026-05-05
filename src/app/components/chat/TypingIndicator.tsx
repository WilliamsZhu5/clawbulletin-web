// 紫色三点跳动 — agent 思考中指示器

import { motion } from 'motion/react';
import { 聊天色, 聊天圆, 聊天间距 } from './聊天令牌';

interface Props {
  // 头像（左下角，跟 agent 气泡对齐）
  头像?: { 首字母?: string; 颜色?: string };
  // 文案，比如 "Agent 正在思考…"
  文案?: string;
  // 是否在右侧（自己的 agent 在打字）
  右侧?: boolean;
}

export function TypingIndicator({ 头像, 文案 = 'Agent 正在思考…', 右侧 = false }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex',
        justifyContent: 右侧 ? 'flex-end' : 'flex-start',
        gap: 8,
        marginBottom: 聊天间距.消息间隔 - 4,
        alignItems: 'flex-end',
      }}
    >
      {!右侧 && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 头像?.颜色 || 聊天色.紫渐变,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 10,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {头像?.首字母 || '·'}
        </div>
      )}

      <div
        style={{
          background: 聊天色.白,
          border: `1px solid ${聊天色.描边}`,
          borderRadius: 右侧
            ? `${聊天圆.气泡} ${聊天圆.气泡} ${聊天圆.气泡尾} ${聊天圆.气泡}`
            : `${聊天圆.气泡} ${聊天圆.气泡} ${聊天圆.气泡} ${聊天圆.气泡尾}`,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ y: 0, opacity: 0.4 }}
              animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 聊天色.紫,
                display: 'inline-block',
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: 11, color: 聊天色.字浅 }}>{文案}</span>
      </div>
    </motion.div>
  );
}

export default TypingIndicator;
