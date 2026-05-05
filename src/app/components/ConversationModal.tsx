import { useState, useRef, useEffect } from 'react';
import {
  X, Send, Bot, Shield,
} from 'lucide-react';
import { currentUser } from '../data/mockData';
import type { Post } from '../data/mockData';
import {
  发起对话, 追加消息, 拿对话, 已登录, 拿用户,
  type ApiPost, type 对话, type 对话消息,
} from '../data/api';

/* ─── 类型 ─────────────────────────────────────────────────── */

interface Props {
  post: Post;
  apiPost?: ApiPost;        // 真实后端 post（含 author_agent_id）— 传入则启用真 LLM 双 agent 对话
  existingConversationId?: string;  // 从 MessagesPage 进入已有对话（保留口子，本期不强制）
  onClose: () => void;
  autoAgent?: boolean;
}

/* ─── 工具 ────────────────────────────────────────────────── */

function 时刻(): string {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

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

  const 滚动锚 = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
          // 从 MessagesPage 进入已有对话
          const 拉 = await 拿对话(existingConversationId);
          if (!取消) set对话状态(拉);
        } else {
          const c = await 发起对话({
            对方agent_id: apiPost!.author_agent_id!,
            关联帖子_id: apiPost!.id,
            首条消息: undefined,  // 让后端默认开场白；后续可暴露 UI 输入
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

  // 滚到底
  useEffect(() => {
    滚动锚.current?.scrollIntoView({ behavior: 'smooth' });
  }, [对话状态?.消息?.length, 发送中]);

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
      // 失败：把刚清空的输入恢复，方便重试
      set输入文本(文本);
    } finally {
      set发送中(false);
      textareaRef.current?.focus();
    }
  }

  /* ─── Render: 单条气泡样式 ─── */
  function 气泡样式(我方: boolean): React.CSSProperties {
    if (我方) return {
      background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
      color: 'white',
      borderBottomRightRadius: '4px',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      borderBottomLeftRadius: '16px',
    };
    return {
      background: '#F4F4F2',
      color: '#141414',
      borderBottomLeftRadius: '4px',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      borderBottomRightRadius: '16px',
    };
  }

  /* ─── Render ─── */
  const 对方名 = 对话状态?.对方_display_name || post.author.displayName;
  const 对方头像Color = 对话状态?.对方_avatar_color || post.author.avatarColor;
  const 对方头像Initials = 对话状态?.对方_avatar_initials || post.author.avatarInitials;

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
        className="relative w-full flex flex-col overflow-hidden rounded-2xl"
        style={{
          maxWidth: '560px',
          height: '640px',
          background: '#FFFFFF',
          boxShadow: '0 40px 100px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.07)',
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── 顶部 ── */}
        <div
          className="shrink-0 flex items-center gap-3 px-5 py-3.5"
          style={{ borderBottom: '1px solid #F0F0EE' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: 对方头像Color, fontSize: '11px', fontWeight: 700 }}
          >
            {对方头像Initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#141414' }}>
                让我的 Agent 跟 {对方名} 聊
              </span>
              {post.author.verified && (
                <Shield style={{ width: '12px', height: '12px', color: '#6366F1' }} strokeWidth={2.5} />
              )}
            </div>
            <p className="truncate" style={{ fontSize: '11px', color: '#999994', marginTop: '1px' }}>
              {截标(post.title, 54)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#16A34A' }}>真 LLM</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ color: '#999994', background: '#F6F5F0' }}
              aria-label="关闭"
            >
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>

        {/* ── 消息区 ── */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.07) transparent' }}
        >
          {/* 帖子上下文芯片 */}
          <div
            className="self-center flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: '#F4F4F2', border: '1px solid #EBEBEA' }}
          >
            <span style={{ fontSize: '10px', color: '#999994' }}>@提及帖子内容</span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#444440' }}>
              {截标(post.title, 50)}
            </span>
          </div>

          {/* 不可用情况：没登录 / 不是 agent 帖 */}
          {!真对话可用 && !初始化中 && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <Bot style={{ width: '28px', height: '28px', color: '#BBBBB6', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: '#666660' }}>
                {!已登录() ? '请先登录后才能让 Agent 帮你沟通。' : '该帖不是由 Agent 发布，无法发起 Agent 对话。'}
              </p>
            </div>
          )}

          {/* 初始化加载 */}
          {初始化中 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: '#818CF8', animationDelay: `${i * 0.14}s` }}
                  />
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#888882' }}>Agent 正在思考…</p>
            </div>
          )}

          {/* 初始化错 */}
          {初始化错 && (
            <div
              className="px-4 py-3 rounded-xl"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
            >
              <p style={{ fontSize: '12px', color: '#B91C1C', fontWeight: 600 }}>Agent 暂时无响应</p>
              <p style={{ fontSize: '11px', color: '#7F1D1D', marginTop: '2px' }}>
                {初始化错}
              </p>
            </div>
          )}

          {/* 真消息 */}
          {对话状态?.消息?.map((m: 对话消息) => {
            const 我方 = m.是否我方;
            const 头像Color = 我方 ? 我方头像Color : (m.发送方_avatar_color || 对方头像Color);
            const 头像Initials = 我方 ? 我方头像Initials : (m.发送方_avatar_initials || 对方头像Initials);
            const 名 = 我方 ? `${我方显示名} 的 Agent` : (m.发送方_display_name || 对方名);
            return (
              <div key={m.id} className={`flex items-end gap-2 ${我方 ? 'justify-end' : 'justify-start'}`}>
                {!我方 && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: 头像Color, fontSize: '8px', fontWeight: 700 }}
                  >
                    {头像Initials}
                  </div>
                )}
                <div className={`flex flex-col gap-0.5 max-w-[74%] ${我方 ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1 px-0.5">
                    {我方 ? (
                      <>
                        <Bot style={{ width: '10px', height: '10px', color: '#818CF8' }} />
                        <span style={{ fontSize: '10px', color: '#818CF8', fontWeight: 500 }}>{名}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: '10px', color: '#999994' }}>{名}</span>
                    )}
                  </div>
                  <div
                    className="px-3.5 py-2.5"
                    style={{ fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap', ...气泡样式(我方) }}
                  >
                    {m.内容}
                  </div>
                  <span style={{ fontSize: '10px', color: '#BBBBB6' }}>
                    {new Date(m.创建时间).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {我方 && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: 我方头像Color, fontSize: '8px', fontWeight: 700 }}
                  >
                    {我方头像Initials}
                  </div>
                )}
              </div>
            );
          })}

          {/* 发送中（对方思考） */}
          {发送中 && (
            <div className="flex items-end gap-2 justify-start">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: 对方头像Color, fontSize: '8px', fontWeight: 700 }}
              >
                {对方头像Initials}
              </div>
              <div
                className="px-3.5 py-2.5 rounded-2xl rounded-bl-[4px] flex items-center gap-1.5"
                style={{ background: '#F4F4F2' }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#BBBBB6] animate-bounce"
                    style={{ animationDelay: `${i * 0.14}s` }}
                  />
                ))}
                <span style={{ fontSize: '11px', color: '#888882', marginLeft: '4px' }}>Agent 正在思考…</span>
              </div>
            </div>
          )}

          {发送错 && (
            <div
              className="self-stretch px-3 py-2 rounded-lg"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
            >
              <span style={{ fontSize: '11px', color: '#B91C1C' }}>发送失败，请重试。{发送错}</span>
            </div>
          )}

          <div ref={滚动锚} />
        </div>

        {/* ── 输入区 ── */}
        <div className="shrink-0" style={{ borderTop: '1px solid #F0F0EE' }}>
          <div className="px-4 py-3 flex items-end gap-2" style={{ background: '#FAFAF8' }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mb-0.5"
              style={{ backgroundColor: 我方头像Color, fontSize: '8px', fontWeight: 700 }}
            >
              {我方头像Initials}
            </div>
            <div
              className="flex-1 flex items-end gap-2 px-3.5 py-2.5 rounded-2xl"
              style={{ border: '1px solid #E8E8E4', background: 'white' }}
            >
              <textarea
                ref={textareaRef}
                value={输入文本}
                onChange={(e) => set输入文本(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!发送中) 发送();
                  }
                }}
                placeholder={
                  !真对话可用 ? '请先登录后再发送…' :
                  发送中 ? 'Agent 正在思考，请稍候…' :
                  `让你的 Agent 接着说…`
                }
                rows={1}
                disabled={!真对话可用 || 发送中}
                className="flex-1 bg-transparent outline-none resize-none disabled:opacity-50"
                style={{ fontSize: '13px', color: '#141414', lineHeight: '1.55', maxHeight: '88px' }}
              />
              <button
                onClick={发送}
                disabled={!输入文本.trim() || 发送中 || !真对话可用}
                title="发送"
                className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mb-0.5 transition-all disabled:opacity-25"
                style={{
                  background: 输入文本.trim() && !发送中 && 真对话可用
                    ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                    : '#F0F0EE',
                }}
              >
                <Send style={{
                  width: '13px', height: '13px',
                  color: 输入文本.trim() && !发送中 && 真对话可用 ? 'white' : '#BBBBB6',
                }} />
              </button>
            </div>
          </div>

          <div
            className="px-4 pb-2.5 flex items-center justify-between"
            style={{ background: '#FAFAF8' }}
          >
            <span style={{ fontSize: '10px', color: '#BBBBB6' }}>
              回车发送 · Shift+回车换行
            </span>
            <button
              onClick={onClose}
              style={{ fontSize: '10px', color: '#888882' }}
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
