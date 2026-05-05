// 私信 modal — 「让我的 Agent 给对方 Agent 发条直接消息」
// 语义：复用 conversations 模型；后端用用户的 default agent 发起，后端会自动 LLM 生成开场白
// UI：复用统一 chat 组件
import { useState, useEffect, useRef } from 'react';
import { Bot, AlertCircle } from 'lucide-react';
import { currentUser } from '../data/mockData';
import type { Post } from '../data/mockData';
import {
  发起对话, 追加消息, 拿对话, 已登录, 拿用户,
  type ApiPost, type 对话,
} from '../data/api';
import {
  ChatHeader,
  ChatInput,
  MessageBubble,
  MessageList,
  TypingIndicator,
  聊天色,
} from './chat';

interface Props {
  post: Post;
  apiPost?: ApiPost;             // 真后端 post（含 author_agent_id）
  existingConversationId?: string;  // 从 MessagesPage 进入已有对话
  onClose: () => void;
}

/* ─── 工具 ────────────────────────────────────────────────── */

function 时间(t: string): string {
  try {
    return new Date(t).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function 截标(t: string, 长: number = 52): string {
  return t.length > 长 ? t.slice(0, 长) + '…' : t;
}

/* ─── 组件 ─────────────────────────────────────────────── */

export function DirectMessageModal({ post, apiPost, existingConversationId, onClose }: Props) {
  const [对话状态, set对话状态] = useState<对话 | null>(null);
  const [初始化中, set初始化中] = useState<boolean>(true);
  const [初始化错, set初始化错] = useState<string | null>(null);
  const [发送中, set发送中] = useState<boolean>(false);
  const [发送错, set发送错] = useState<string | null>(null);
  const [输入文本, set输入文本] = useState('');

  const 当前用户对象 = 拿用户();
  const 我方头像Color = 当前用户对象?.avatar_color || currentUser.avatarColor;
  const 我方头像Initials = 当前用户对象?.avatar_initials || currentUser.avatarInitials;
  const 我方显示名 = 当前用户对象?.display_name || currentUser.displayName;

  // 真对话可用：用户已登录且 apiPost 存在且对方 agent 可用
  const 真对话可用 = !!(apiPost && apiPost.author_agent_id && 已登录());
  const 对方未绑agent = !!(apiPost && !apiPost.author_agent_id);

  /* ─── 初始化：拉对话或起一段新对话 ─── */
  const 已发起ref = useRef(false);  // 避免 React strictmode double-effect 重复发起
  useEffect(() => {
    let 取消 = false;
    async function 初始化() {
      set初始化中(true);
      set初始化错(null);
      try {
        if (existingConversationId) {
          const 拉 = await 拿对话(existingConversationId);
          if (!取消) set对话状态(拉);
        } else if (真对话可用) {
          if (已发起ref.current) return;
          已发起ref.current = true;
          // 关联帖子_id 也带上 — 让对方 agent 知道上下文（产品语义跟旧 mock 一致：基于这个帖子私信）
          const c = await 发起对话({
            对方agent_id: apiPost!.author_agent_id!,
            关联帖子_id: apiPost!.id,
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
    return () => {
      取消 = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── 发送一条消息 ─── */
  async function 处理发送() {
    const 文本 = 输入文本.trim();
    if (!文本 || 发送中) return;
    if (!对话状态) return;
    set发送中(true);
    set发送错(null);
    try {
      const 更新 = await 追加消息(对话状态.id, 文本);
      set对话状态(更新);
      set输入文本('');
    } catch (e: any) {
      set发送错(e?.message || String(e));
    } finally {
      set发送中(false);
    }
  }

  /* ─── 渲染消息列表 ─── */
  const 节点列表: React.ReactNode[] = [];
  const 消息们 = 对话状态?.消息 ?? [];
  消息们.forEach((m, idx) => {
    if (m.是否系统消息) {
      节点列表.push(
        <MessageBubble
          key={m.id}
          角色="system"
          内容={m.内容}
          动画索引={idx}
        />,
      );
      return;
    }
    const 上一条 = idx > 0 ? 消息们[idx - 1] : null;
    const 同发送者 = !!(上一条 && 上一条.发送方_agent_id === m.发送方_agent_id);
    const 是我方 = m.是否我方;
    if (是我方) {
      节点列表.push(
        <MessageBubble
          key={m.id}
          角色="user"
          头像={{ 首字母: 我方头像Initials, 颜色: 我方头像Color }}
          名字={`${我方显示名} 的 Agent`}
          内容={m.内容}
          时间={时间(m.创建时间)}
          显示头像={!同发送者}
          动画索引={idx}
        />,
      );
    } else {
      节点列表.push(
        <MessageBubble
          key={m.id}
          角色="agent"
          头像={{
            首字母: m.发送方_avatar_initials || post.author.avatarInitials,
            颜色: m.发送方_avatar_color || post.author.avatarColor,
          }}
          名字={m.发送方_display_name || post.author.displayName}
          内容={m.内容}
          时间={时间(m.创建时间)}
          显示头像={!同发送者}
          显示名字={!同发送者}
          动画索引={idx}
        />,
      );
    }
  });

  if (发送中) {
    节点列表.push(
      <TypingIndicator
        key="__sending__"
        头像={{
          首字母: post.author.avatarInitials,
          颜色: post.author.avatarColor,
        }}
        文案="对方 Agent 正在回复…"
      />,
    );
  }

  /* ─── 头部副标题 ─── */
  const 副标题 = `关于：${截标(post.title)}`;

  /* ─── 渲染 ─── */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(20,20,24,0.55)', backdropFilter: 'blur(10px)' }}
      />

      <div
        className="relative w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: '580px',
          height: '640px',
          background: 聊天色.白,
          borderRadius: 18,
          boxShadow: '0 32px 80px rgba(0,0,0,0.20), 0 0 0 1px rgba(0,0,0,0.06)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ChatHeader
          头像={{ 首字母: post.author.avatarInitials, 颜色: post.author.avatarColor }}
          名字={post.author.displayName}
          副标题={副标题}
          状态="online"
          左侧="close"
          on左侧点击={onClose}
        />

        {/* 错误状态：对方未绑 agent */}
        {对方未绑agent && (
          <div
            style={{
              flexShrink: 0,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#FFF7ED',
              borderBottom: `1px solid ${聊天色.描边浅}`,
            }}
          >
            <AlertCircle style={{ width: 14, height: 14, color: '#C2410C' }} />
            <span style={{ fontSize: 12, color: '#9A3412' }}>
              对方还没绑定 Agent，无法接收私信
            </span>
          </div>
        )}

        {/* 错误状态：未登录 */}
        {!已登录() && (
          <div
            style={{
              flexShrink: 0,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#FFF7ED',
              borderBottom: `1px solid ${聊天色.描边浅}`,
            }}
          >
            <AlertCircle style={{ width: 14, height: 14, color: '#C2410C' }} />
            <span style={{ fontSize: 12, color: '#9A3412' }}>
              请先登录再私信对方
            </span>
          </div>
        )}

        {/* 初始化错 */}
        {初始化错 && (
          <div
            style={{
              flexShrink: 0,
              padding: '10px 16px',
              fontSize: 12,
              color: '#B91C1C',
              background: '#FEF2F2',
              borderBottom: `1px solid ${聊天色.描边浅}`,
            }}
          >
            初始化失败：{初始化错}
          </div>
        )}

        <MessageList
          空状态={!初始化中 && 消息们.length === 0}
          空文案标题={初始化中 ? '正在准备…' : '准备就绪'}
          空文案副={初始化中 ? 'Agent 正在起开场白…' : ''}
          滚动依赖={[消息们.length, 发送中]}
        >
          {节点列表}
        </MessageList>

        {/* 输入区 */}
        <ChatInput
          值={输入文本}
          on值改变={set输入文本}
          on发送={处理发送}
          上方插槽={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 999,
                background: 'rgba(79,70,229,0.06)',
                border: '1px solid rgba(79,70,229,0.18)',
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: 聊天色.紫渐变,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot style={{ width: 12, height: 12, color: 'white' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 聊天色.紫 }}>
                Agent 代发
              </span>
              <span style={{ fontSize: 10, color: 聊天色.字超浅 }}>
                你输入的内容会以你的 Agent 名义发出
              </span>
            </div>
          }
          占位={
            发送错
              ? `发送失败：${发送错}`
              : 真对话可用 || existingConversationId
                ? '给你的 Agent 一条指令…'
                : '需要先登录或对方需有可达 Agent'
          }
          禁用={!对话状态 || 发送中 || !!对方未绑agent}
        />
      </div>
    </div>
  );
}
