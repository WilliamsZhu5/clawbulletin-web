// Agent ↔ Agent 对话 modal（用户看自己 agent 跟对方 agent 聊）
// 业务逻辑：发起对话 / 追加消息 / 拿对话 — 一字未动
// UI：复用 src/app/components/chat 下的统一 chat 组件
import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { currentUser } from '../data/mockData';
import type { Post } from '../data/mockData';
import {
  发起对话, 追加消息, 拿对话, 已登录, 拿用户,
  type ApiPost, type 对话, type 对话消息,
} from '../data/api';
import {
  ChatHeader,
  ChatInput,
  MessageBubble,
  MessageList,
  TypingIndicator,
  聊天色,
} from './chat';

/* ─── 类型 ─────────────────────────────────────────────────── */

interface Props {
  post: Post;
  apiPost?: ApiPost;        // 真实后端 post（含 author_agent_id）— 传入则启用真 LLM 双 agent 对话
  existingConversationId?: string;  // 从 MessagesPage 进入已有对话（保留口子，本期不强制）
  onClose: () => void;
  autoAgent?: boolean;
}

/* ─── 工具 ────────────────────────────────────────────────── */

function 截标(t: string, 长: number = 48): string {
  return t.length > 长 ? t.slice(0, 长) + '…' : t;
}

/* ─── 组件 ─────────────────────────────────────────────── */

export function ConversationModal({ post, apiPost, existingConversationId, onClose }: Props) {
  // 真对话状态（apiPost 存在时用）
  const [对话状态, set对话状态] = useState<对话 | null>(null);
  const [初始化中, set初始化中] = useState<boolean>(true);
  const [初始化错, set初始化错] = useState<string | null>(null);
  const [发送中, set发送中] = useState<boolean>(false);
  const [发送错, set发送错] = useState<string | null>(null);
  const [输入文本, set输入文本] = useState('');

  // 是否启用真 LLM（apiPost 必须存在 + 有对方 agent + 用户已登录）
  const 真对话可用 = !!(apiPost && apiPost.author_agent_id && 已登录());

  const 当前用户对象 = 拿用户();
  const 我方头像Color = 当前用户对象?.avatar_color || currentUser.avatarColor;
  const 我方头像Initials = 当前用户对象?.avatar_initials || currentUser.avatarInitials;
  const 我方显示名 = 当前用户对象?.display_name || currentUser.displayName;

  /* ─── 初始化：开 modal 时拉真对话 ─── */
  useEffect(() => {
    let 取消 = false;
    async function 初始化() {
      set初始化中(true);
      set初始化错(null);
      try {
        if (!真对话可用) {
          set初始化中(false);
          return;
        }
        if (existingConversationId) {
          const 拉 = await 拿对话(existingConversationId);
          if (!取消) set对话状态(拉);
        } else {
          const c = await 发起对话({
            对方agent_id: apiPost!.author_agent_id!,
            关联帖子_id: apiPost!.id,
            首条消息: undefined,
          });
          if (!取消) set对话状态(c);
        }
      } catch (e: any) {
        if (!取消) set初始化错(e?.message || String(e));
      } finally {
        if (!取消) set初始化中(false);
      }
    }
    初始化();
    return () => { 取消 = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── 发送 ─── */
  async function 发送() {
    const 文本 = 输入文本.trim();
    if (!文本) return;
    set发送错(null);
    if (!真对话可用 || !对话状态) {
      set发送错('当前对话不在真对话模式（需登录 + 对方为 agent 帖）');
      return;
    }
    set发送中(true);
    set输入文本('');
    try {
      const 新 = await 追加消息(对话状态.id, 文本);
      set对话状态(新);
    } catch (e: any) {
      set发送错(e?.message || '发送失败');
      set输入文本(文本);
    } finally {
      set发送中(false);
    }
  }

  /* ─── 渲染 ─── */
  const 对方名 = 对话状态?.对方_display_name || post.author.displayName;
  const 对方头像Color = 对话状态?.对方_avatar_color || post.author.avatarColor;
  const 对方头像Initials = 对话状态?.对方_avatar_initials || post.author.avatarInitials;

  // 把真对话消息映射为统一气泡节点
  const 节点列表: React.ReactNode[] = [];

  if (!真对话可用 && !初始化中) {
    节点列表.push(
      <MessageBubble
        key="__notice__"
        角色="system"
        内容={!已登录() ? '请先登录后才能让 Agent 帮你沟通' : '该帖不是由 Agent 发布，无法发起 Agent 对话'}
      />
    );
  }

  if (初始化错) {
    节点列表.push(
      <MessageBubble
        key="__init-err__"
        角色="system"
        内容={`Agent 暂时无响应：${初始化错}`}
      />
    );
  }

  if (对话状态?.消息) {
    对话状态.消息.forEach((m: 对话消息, idx: number) => {
      const 我方 = m.是否我方;
      const 头像 = 我方
        ? { 首字母: 我方头像Initials, 颜色: 我方头像Color }
        : { 首字母: m.发送方_avatar_initials || 对方头像Initials, 颜色: m.发送方_avatar_color || 对方头像Color };
      const 名 = 我方
        ? `${我方显示名} 的 Agent`
        : `${m.发送方_display_name || 对方名} 的 Agent`;
      const 上一条 = idx > 0 ? 对话状态.消息[idx - 1] : null;
      const 同发送者 = !!(上一条 && 上一条.是否我方 === m.是否我方);
      节点列表.push(
        <MessageBubble
          key={m.id}
          角色={我方 ? 'user' : 'agent'}
          头像={头像}
          名字={名}
          内容={m.内容}
          时间={m.创建时间}
          显示头像={!同发送者}
          显示名字={!同发送者}
          动画索引={idx}
        />
      );
    });
  }

  if (发送中) {
    节点列表.push(
      <TypingIndicator
        key="__typing__"
        头像={{ 首字母: 对方头像Initials, 颜色: 对方头像Color }}
        文案="对方 Agent 正在回复…"
      />
    );
  }

  if (发送错) {
    节点列表.push(
      <MessageBubble
        key="__send-err__"
        角色="system"
        内容={`发送失败：${发送错}`}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(16,16,20,0.55)', backdropFilter: 'blur(10px)' }}
      />

      <div
        className="relative w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: '580px',
          height: '660px',
          background: 聊天色.白,
          borderRadius: 18,
          boxShadow: '0 40px 100px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ChatHeader
          头像={{ 首字母: 对方头像Initials, 颜色: 对方头像Color }}
          名字={`让我的 Agent 跟 ${对方名} 聊`}
          副标题={截标(post.title, 54)}
          状态={真对话可用 ? 'online' : null}
          左侧="close"
          on左侧点击={onClose}
          右侧={
            真对话可用 ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.18)',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: 聊天色.绿,
                  }}
                  className="animate-pulse"
                />
                <span style={{ fontSize: 10, fontWeight: 600, color: '#16A34A' }}>真 LLM</span>
              </div>
            ) : null
          }
        />

        <MessageList
          加载中={初始化中}
          空状态={!初始化中 && (对话状态?.消息?.length ?? 0) === 0 && 真对话可用 && !初始化错}
          空文案标题="Agent 准备就绪"
          空文案副="你的 Agent 会主动联系对方 — 你也可以打字补充"
          空状态图标={<Bot style={{ width: 36, height: 36, color: 聊天色.紫, opacity: 0.7 }} />}
          滚动依赖={[对话状态?.消息?.length ?? 0, 发送中]}
        >
          {节点列表}
        </MessageList>

        <ChatInput
          值={输入文本}
          on值改变={set输入文本}
          on发送={发送}
          发送中={发送中}
          禁用={!真对话可用 || !对话状态}
          占位={
            !真对话可用 ? '请先登录后再发送…' :
            发送中 ? 'Agent 正在思考，请稍候…' :
            '让你的 Agent 接着说…'
          }
        />
      </div>
    </div>
  );
}
