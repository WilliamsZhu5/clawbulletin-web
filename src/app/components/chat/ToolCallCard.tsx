// 工具调用折叠卡（agent tool calling 展示）
// 折叠：紫色 icon + 工具名 + 摘要
// 展开：显示输入参数 + 输出结果（motion 平滑展开）

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, Search, MessageSquare, Bot } from 'lucide-react';
import { 聊天色, 聊天圆 } from './聊天令牌';

export interface ToolCallCardProps {
  // 展示用：紫色 icon
  工具名: string;
  // 折叠状态主文案（如「关键词「买电脑」」、「已找到 5 条结果」）
  摘要: string;
  // 输入参数（JSON 字符串或对象）
  输入?: string | object | null;
  // 输出结果（JSON 字符串或对象）
  输出?: string | object | null;
  // 状态：成功 / 失败 / 进行中（用色块表示）
  状态?: 'success' | 'error' | 'running' | null;
  // 默认是否展开
  默认展开?: boolean;
}

function 工具图标(工具名: string) {
  if (工具名 === '搜帖' || 工具名.includes('search')) return Search;
  if (工具名 === '起对话' || 工具名.includes('contact') || 工具名.includes('message')) return MessageSquare;
  return Bot;
}

function 转字符串(v: string | object | null | undefined): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') {
    // 尝试 pretty print
    try {
      return JSON.stringify(JSON.parse(v), null, 2);
    } catch {
      return v;
    }
  }
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export function ToolCallCard({
  工具名,
  摘要,
  输入,
  输出,
  状态,
  默认展开 = false,
}: ToolCallCardProps) {
  const [展开, set展开] = useState(默认展开);
  const Icon = 工具图标(工具名);

  const 状态色 =
    状态 === 'success'
      ? 聊天色.绿
      : 状态 === 'error'
      ? 聊天色.红
      : 状态 === 'running'
      ? 聊天色.橙
      : null;

  return (
    <div
      style={{
        background: 'rgba(79,70,229,0.04)',
        border: `1px solid rgba(79,70,229,0.14)`,
        borderRadius: 聊天圆.卡片,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => set展开((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 12px',
          color: 聊天色.字中,
          fontSize: 12,
          textAlign: 'left',
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: 聊天色.紫,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon style={{ width: 12, height: 12, color: 'white' }} />
        </div>
        <span style={{ fontWeight: 600, color: 聊天色.字深 }}>{工具名}</span>
        <span
          style={{
            color: 聊天色.字浅,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          · {摘要}
        </span>
        {状态色 && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: 状态色,
              flexShrink: 0,
            }}
          />
        )}
        {展开 ? (
          <ChevronDown style={{ width: 13, height: 13, color: 聊天色.字浅, flexShrink: 0 }} />
        ) : (
          <ChevronRight style={{ width: 13, height: 13, color: 聊天色.字浅, flexShrink: 0 }} />
        )}
      </button>

      <AnimatePresence initial={false}>
        {展开 && (输入 || 输出) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '0 12px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {输入 != null && 输入 !== '' && (
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 聊天色.字超浅,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 4,
                    }}
                  >
                    输入参数
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      background: '#FAFAF7',
                      border: `1px solid ${聊天色.描边}`,
                      borderRadius: 8,
                      padding: 8,
                      fontSize: 11,
                      color: 聊天色.字中,
                      overflowX: 'auto',
                      whiteSpace: 'pre-wrap',
                      maxHeight: 180,
                    }}
                  >
                    {转字符串(输入)}
                  </pre>
                </div>
              )}
              {输出 != null && 输出 !== '' && (
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 聊天色.字超浅,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 4,
                    }}
                  >
                    输出结果
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      background: '#FAFAF7',
                      border: `1px solid ${聊天色.描边}`,
                      borderRadius: 8,
                      padding: 8,
                      fontSize: 11,
                      color: 聊天色.字中,
                      overflowX: 'auto',
                      whiteSpace: 'pre-wrap',
                      maxHeight: 240,
                    }}
                  >
                    {转字符串(输出)}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ToolCallCard;
