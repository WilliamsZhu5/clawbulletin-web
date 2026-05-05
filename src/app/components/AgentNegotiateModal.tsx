// Agent 谈判 modal — 真后端 conversations + 谈判语义（议价中 / 已达成 / 已搁置 / 已拒绝）
// 双 stage：briefing（指令录入）→ active（真 agent 对话 + 谈判按钮）
import { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Check, AlertCircle, X as XIcon, Pause, HandCoins } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { Post } from '../data/mockData';
import { currentUser } from '../data/mockData';
import {
  发起对话, 追加消息, 拿对话, 更新谈判进度, 已登录, 拿用户,
  type ApiPost, type 对话, type 谈判状态,
} from '../data/api';
import {
  ChatHeader,
  ChatInput,
  MessageBubble,
  MessageList,
  TypingIndicator,
  聊天色,
} from './chat';

type Stage = 'briefing' | 'active';

interface Props {
  post: Post;
  apiPost?: ApiPost;             // 真 ApiPost（含 author_agent_id）— 必须才能起真对话
  existingConversationId?: string;
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

function 格式化金额(cents: number | null | undefined, currency: string | null | undefined): string {
  if (cents == null) return '';
  const 元 = cents / 100;
  const 单位 = (currency || '').toUpperCase();
  if (单位 === 'USD') return `$${元.toFixed(2)}`;
  if (!单位 || 单位 === 'CNY' || 单位 === 'RMB') {
    return Number.isInteger(元) ? `¥${元.toLocaleString()}` : `¥${元.toFixed(2)}`;
  }
  return `${单位} ${元.toFixed(2)}`;
}

function 状态chip(s: 谈判状态 | null | undefined) {
  if (s === '议价中') {
    return {
      文字: '议价中',
      颜色: '#16A34A',
      背景: 'rgba(34,197,94,0.10)',
      点: true,
    };
  }
  if (s === '已达成') {
    return {
      文字: '已达成',
      颜色: '#16A34A',
      背景: 'rgba(34,197,94,0.10)',
      点: false,
    };
  }
  if (s === '已搁置') {
    return {
      文字: '已搁置',
      颜色: '#6B7280',
      背景: '#F0F0EE',
      点: false,
    };
  }
  if (s === '已拒绝') {
    return {
      文字: '已拒绝',
      颜色: '#DC2626',
      背景: 'rgba(220,38,38,0.08)',
      点: false,
    };
  }
  return {
    文字: '未启动',
    颜色: '#6B7280',
    背景: '#F0F0EE',
    点: false,
  };
}

/* ─── 组件 ────────────────────────────────────────────────── */

export function AgentNegotiateModal({ post, apiPost, existingConversationId, onClose }: Props) {
  const { t } = useLanguage();
  const [stage, setStage] = useState<Stage>(existingConversationId ? 'active' : 'briefing');
  const [instruction, setInstruction] = useState('');

  // 真对话状态
  const [对话状态, set对话状态] = useState<对话 | null>(null);
  const [初始化中, set初始化中] = useState<boolean>(false);
  const [初始化错, set初始化错] = useState<string | null>(null);
  const [发送中, set发送中] = useState<boolean>(false);
  const [发送错, set发送错] = useState<string | null>(null);
  const [输入文本, set输入文本] = useState('');
  const [谈判处理中, set谈判处理中] = useState<boolean>(false);
  const [谈判错, set谈判错] = useState<string | null>(null);
  const [报价dialog开, set报价dialog开] = useState<boolean>(false);
  const [报价输入, set报价输入] = useState<string>('');

  const 当前用户对象 = 拿用户();
  const 我方头像Color = 当前用户对象?.avatar_color || currentUser.avatarColor;
  const 我方头像Initials = 当前用户对象?.avatar_initials || currentUser.avatarInitials;
  const 我方显示名 = 当前用户对象?.display_name || currentUser.displayName;

  const 真对话可用 = !!(apiPost && apiPost.author_agent_id && 已登录());
  const 对方未绑agent = !!(apiPost && !apiPost.author_agent_id);

  /* ─── briefing → active 时起真对话 ─── */
  const 已发起ref = useRef(false);
  useEffect(() => {
    if (stage !== 'active') return;
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
          const c = await 发起对话({
            对方agent_id: apiPost!.author_agent_id!,
            关联帖子_id: apiPost!.id,
            首条消息: instruction.trim() || undefined,
          });
          if (!取消) set对话状态(c);
          // 自动把谈判进入"议价中"，让 chip + 系统消息出现
          if (!取消 && c) {
            try {
              const c2 = await 更新谈判进度(c.id, { 状态: '议价中' });
              if (!取消) set对话状态(c2);
            } catch (e: any) {
              // 忽略 — 用户后续可以手动点
              if (!取消) set谈判错(e?.message || String(e));
            }
          }
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
  }, [stage]);

  /* ─── 发送一条消息 ─── */
  async function 处理发送() {
    const 文本 = 输入文本.trim();
    if (!文本 || 发送中 || !对话状态) return;
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

  /* ─── 谈判进度变更 ─── */
  async function 处理谈判变更(新状态: 谈判状态, 成交价_cents?: number, 成交价_currency?: string) {
    if (!对话状态 || 谈判处理中) return;
    set谈判处理中(true);
    set谈判错(null);
    try {
      const 更新 = await 更新谈判进度(对话状态.id, {
        状态: 新状态,
        ...(成交价_cents != null ? { 成交价_cents } : {}),
        ...(成交价_currency ? { 成交价_currency } : {}),
      });
      set对话状态(更新);
    } catch (e: any) {
      set谈判错(e?.message || String(e));
    } finally {
      set谈判处理中(false);
    }
  }

  function 处理接受报价() {
    void 处理谈判变更('已达成', 对话状态?.成交价_cents ?? undefined, 对话状态?.成交价_currency ?? 'CNY');
  }
  function 处理暂停() {
    void 处理谈判变更('已搁置');
  }
  function 处理拒绝() {
    void 处理谈判变更('已拒绝');
  }
  function 处理打开报价dialog() {
    set报价dialog开(true);
    set报价输入('');
  }
  async function 处理提交报价() {
    const 数 = Number(报价输入);
    if (!Number.isFinite(数) || 数 <= 0) {
      set谈判错('请填写成交价');
      return;
    }
    set报价dialog开(false);
    await 处理谈判变更('已达成', Math.round(数 * 100), 'CNY');
  }

  /* ─── 渲染消息 ─── */
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
          名字={m.发送方_display_name || `${post.author.displayName} 的 Agent`}
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
        头像={{ 首字母: post.author.avatarInitials, 颜色: post.author.avatarColor }}
        文案="对方 Agent 正在回复…"
      />,
    );
  }

  /* ─── 状态 chip ─── */
  const chip信息 = 状态chip(对话状态?.谈判状态);
  const 进度chip = (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: chip信息.颜色,
        background: chip信息.背景,
        padding: '4px 10px',
        borderRadius: 999,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
      }}
    >
      {chip信息.点 && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
      {chip信息.文字}
      {对话状态?.谈判状态 === '已达成' && 对话状态?.成交价_cents != null && (
        <span style={{ marginLeft: 4, fontWeight: 600, opacity: 0.85 }}>
          · {格式化金额(对话状态.成交价_cents, 对话状态.成交价_currency)}
        </span>
      )}
    </span>
  );

  /* ─── 谈判按钮区（active 阶段、状态非终态时） ─── */
  const 当前状态 = 对话状态?.谈判状态;
  const 可操作 = !!对话状态 && (当前状态 === '议价中' || 当前状态 == null);
  const 终态 = 当前状态 === '已达成' || 当前状态 === '已拒绝';

  const 按钮区 = 可操作 && !终态 && (
    <div
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        padding: '10px 14px',
        background: 'rgba(79,70,229,0.04)',
        borderTop: `1px solid ${聊天色.描边浅}`,
        borderBottom: `1px solid ${聊天色.描边浅}`,
      }}
    >
      <button
        onClick={处理接受报价}
        disabled={谈判处理中}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 13px',
          borderRadius: 10,
          border: 'none',
          fontSize: 12,
          fontWeight: 700,
          color: 'white',
          background: 谈判处理中 ? '#A5A5A0' : 聊天色.紫渐变,
          cursor: 谈判处理中 ? 'wait' : 'pointer',
          boxShadow: '0 2px 8px rgba(79,70,229,0.28)',
        }}
      >
        <Check style={{ width: 13, height: 13 }} />
        💰 接受报价
      </button>
      <button
        onClick={处理打开报价dialog}
        disabled={谈判处理中}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 13px',
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 600,
          color: 聊天色.紫,
          background: 'rgba(79,70,229,0.06)',
          border: '1px solid rgba(79,70,229,0.2)',
          cursor: 谈判处理中 ? 'wait' : 'pointer',
        }}
      >
        <HandCoins style={{ width: 13, height: 13 }} />
        🤝 提议成交价
      </button>
      <button
        onClick={处理暂停}
        disabled={谈判处理中}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 13px',
          borderRadius: 10,
          fontSize: 12,
          color: 聊天色.字浅,
          background: 'white',
          border: `1px solid ${聊天色.描边}`,
          cursor: 谈判处理中 ? 'wait' : 'pointer',
        }}
      >
        <Pause style={{ width: 13, height: 13 }} />
        ⏸ 暂停谈判
      </button>
      <button
        onClick={处理拒绝}
        disabled={谈判处理中}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 13px',
          borderRadius: 10,
          fontSize: 12,
          color: '#B91C1C',
          background: 'white',
          border: '1px solid rgba(220,38,38,0.3)',
          cursor: 谈判处理中 ? 'wait' : 'pointer',
        }}
      >
        <XIcon style={{ width: 13, height: 13 }} />
        ❌ 拒绝
      </button>
      {谈判错 && (
        <span style={{ fontSize: 11, color: '#B91C1C', alignSelf: 'center' }}>
          {谈判错}
        </span>
      )}
    </div>
  );

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
          maxWidth: '620px',
          maxHeight: '88vh',
          background: 聊天色.白,
          borderRadius: 18,
          boxShadow: '0 32px 80px rgba(0,0,0,0.20), 0 0 0 1px rgba(0,0,0,0.06)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ChatHeader
          头像={{ 首字母: post.author.avatarInitials, 颜色: post.author.avatarColor }}
          名字={`Agent 谈判 · ${post.author.displayName}`}
          副标题={post.title.length > 50 ? post.title.slice(0, 50) + '…' : post.title}
          状态={stage === 'active' ? 'online' : null}
          左侧="close"
          on左侧点击={onClose}
          右侧={进度chip}
        />

        {/* 错误：对方未绑 agent */}
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
              对方还没绑定 Agent，无法发起谈判
            </span>
          </div>
        )}

        {/* Briefing 阶段：保留指令录入 UI（精简后） */}
        {stage === 'briefing' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: 聊天色.灰底 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: 14,
                  borderRadius: 14,
                  background: 聊天色.白,
                  border: `1px solid ${聊天色.描边}`,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: 聊天色.紫渐变,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bot style={{ width: 14, height: 14, color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 聊天色.字深, marginBottom: 4 }}>
                    告诉你的 Agent 需求，剩下的它来搞定
                  </div>
                  <div style={{ fontSize: 12, color: 聊天色.字浅, lineHeight: 1.6 }}>
                    Agent 会通过 talkto.me A2A 协议自动联系对方 Agent，替你谈判、追问细节、过滤无效回复。需要你拍板时会来找你。
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 聊天色.字深,
                    marginBottom: 4,
                  }}
                >
                  你的需求 · 告诉 Agent 怎么做
                </label>
                <textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder={t('agent.negotiate.placeholder') || '比如：请压价到标价的 90%，问清成色和是否可包邮…'}
                  rows={3}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    outline: 'none',
                    resize: 'none',
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: 聊天色.字深,
                    background: 聊天色.白,
                    border: `1px solid ${聊天色.描边}`,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                flexShrink: 0,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                borderTop: `1px solid ${聊天色.描边浅}`,
                background: 聊天色.白,
              }}
            >
              <span style={{ fontSize: 11, color: 聊天色.字超浅 }}>
                发送后 Agent 立即接管，全程自动沟通。
              </span>
              <button
                onClick={() => {
                  if (!真对话可用) return;
                  setStage('active');
                }}
                disabled={!真对话可用 || !instruction.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  borderRadius: 12,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'white',
                  background: 真对话可用 && instruction.trim() ? 聊天色.紫渐变 : '#E8E8E4',
                  cursor: 真对话可用 && instruction.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                <Sparkles style={{ width: 13, height: 13 }} />
                启动 Agent
              </button>
            </div>
          </div>
        )}

        {/* Active 阶段：真对话 + 谈判按钮 + 输入区 */}
        {stage === 'active' && (
          <>
            {初始化错 && (
              <div
                style={{
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
              空文案标题={初始化中 ? 'Agent 接管中…' : '准备就绪'}
              空文案副={初始化中 ? '正在与对方 Agent 建立通道…' : ''}
              滚动依赖={[消息们.length, 发送中]}
              背景={聊天色.灰底}
            >
              {节点列表}
            </MessageList>

            {按钮区}

            {终态 && (
              <div
                style={{
                  padding: '10px 16px',
                  fontSize: 12,
                  color: 聊天色.字浅,
                  background: 'rgba(0,0,0,0.02)',
                  borderTop: `1px solid ${聊天色.描边浅}`,
                }}
              >
                谈判已结束（{chip信息.文字}）；可继续对话但不能再变更状态。
              </div>
            )}

            <ChatInput
              值={输入文本}
              on值改变={set输入文本}
              on发送={处理发送}
              占位={
                发送错
                  ? `发送失败：${发送错}`
                  : 终态
                    ? '继续对话…'
                    : '给你的 Agent 一条指令…'
              }
              禁用={!对话状态 || 发送中}
            />
          </>
        )}

        {/* 报价 dialog */}
        {报价dialog开 && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center p-4"
            style={{ background: 'rgba(20,20,24,0.40)' }}
            onClick={() => set报价dialog开(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 360,
                background: 'white',
                borderRadius: 16,
                padding: 18,
                boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 聊天色.字深 }}>
                提议成交价
              </div>
              <div style={{ fontSize: 12, color: 聊天色.字浅, marginBottom: 12 }}>
                请填写成交价（人民币元）。提交后会标记为「已达成」。
              </div>
              <input
                type="number"
                inputMode="numeric"
                value={报价输入}
                onChange={(e) => set报价输入(e.target.value)}
                placeholder="例如 5000"
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `1px solid ${聊天色.描边}`,
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
                <button
                  onClick={() => set报价dialog开(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: 12,
                    color: 聊天色.字中,
                    background: 'white',
                    border: `1px solid ${聊天色.描边}`,
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={处理提交报价}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'white',
                    background: 聊天色.紫渐变,
                    cursor: 'pointer',
                  }}
                >
                  提交
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
