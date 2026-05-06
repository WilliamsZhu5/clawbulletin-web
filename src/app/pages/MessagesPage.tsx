// 消息总页 — 真后端 conversations + 谈判语义
// 左侧：列我的对话；右侧：选中对话的消息流（用统一 chat 组件）
import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Search, Bot, AlertCircle } from 'lucide-react';
import { currentUser } from '../data/mockData';
import {
  列对话, 拿对话, 追加消息, 更新谈判进度, 已登录, 拿用户,
  type 对话, type 谈判状态,
} from '../data/api';
import {
  ChatHeader,
  ChatInput,
  MessageBubble,
  MessageList,
  TypingIndicator,
  聊天色,
} from '../components/chat';

/* ─── 工具 ────────────────────────────────────────────────── */

function 时间(t: string | null | undefined): string {
  if (!t) return '';
  try {
    const d = new Date(t);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  } catch {
    return '';
  }
}

function 详情时间(t: string): string {
  try {
    return new Date(t).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function 截短(s: string | null | undefined, 长: number): string {
  if (!s) return '';
  return s.length > 长 ? s.slice(0, 长) + '…' : s;
}

function 状态chip(s: 谈判状态 | null | undefined) {
  if (s === '议价中') return { 文字: '议价中', 颜色: '#16A34A', 背景: 'rgba(34,197,94,0.10)' };
  if (s === '已达成') return { 文字: '已达成', 颜色: '#16A34A', 背景: 'rgba(34,197,94,0.10)' };
  if (s === '已搁置') return { 文字: '已搁置', 颜色: '#6B7280', 背景: '#F0F0EE' };
  if (s === '已拒绝') return { 文字: '已拒绝', 颜色: '#DC2626', 背景: 'rgba(220,38,38,0.08)' };
  return null;
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

/* ─── 组件 ────────────────────────────────────────────────── */

export function MessagesPage() {
  const [对话们, set对话们] = useState<对话[]>([]);
  const [选中id, set选中id] = useState<string | null>(null);
  const [选中详情, set选中详情] = useState<对话 | null>(null);
  const [列加载中, set列加载中] = useState<boolean>(true);
  const [列错, set列错] = useState<string | null>(null);
  const [详情加载中, set详情加载中] = useState<boolean>(false);
  const [详情错, set详情错] = useState<string | null>(null);
  const [输入文本, set输入文本] = useState('');
  const [发送中, set发送中] = useState<boolean>(false);
  const [发送错, set发送错] = useState<string | null>(null);
  const [谈判处理中, set谈判处理中] = useState<boolean>(false);
  const [搜索词, set搜索词] = useState('');

  const 当前用户对象 = 拿用户();
  const 我方头像Color = 当前用户对象?.avatar_color || currentUser.avatarColor;
  const 我方头像Initials = 当前用户对象?.avatar_initials || currentUser.avatarInitials;
  const 我方显示名 = 当前用户对象?.display_name || currentUser.displayName;

  // v1 通知中心 F11：进入页面如果带 ?conv=<id> query，首次拉取后选中该对话
  const [searchParams] = useSearchParams();
  const 初始选中id = searchParams.get('conv');

  /* ─── 拉对话列表（首次） ─── */
  const 已拉ref = useRef(false);
  useEffect(() => {
    if (!已登录()) {
      set列加载中(false);
      set列错('请先登录');
      return;
    }
    if (已拉ref.current) return;
    已拉ref.current = true;
    let 取消 = false;
    (async () => {
      try {
        const list = await 列对话();
        if (取消) return;
        set对话们(list);
        if (list.length > 0) {
          // F11：query 里指定的 conv id 优先；否则按现有逻辑选第一条
          const 命中 = 初始选中id && list.some((c) => c.id === 初始选中id) ? 初始选中id : list[0].id;
          set选中id(命中);
        }
      } catch (e: any) {
        if (!取消) set列错(e?.message || String(e));
      } finally {
        if (!取消) set列加载中(false);
      }
    })();
    return () => {
      取消 = true;
    };
  }, [初始选中id]);

  /* ─── 选中变化时拉详情 ─── */
  useEffect(() => {
    if (!选中id) {
      set选中详情(null);
      return;
    }
    let 取消 = false;
    set详情加载中(true);
    set详情错(null);
    (async () => {
      try {
        const c = await 拿对话(选中id);
        if (!取消) set选中详情(c);
      } catch (e: any) {
        if (!取消) set详情错(e?.message || String(e));
      } finally {
        if (!取消) set详情加载中(false);
      }
    })();
    return () => {
      取消 = true;
    };
  }, [选中id]);

  /* ─── 发送 ─── */
  async function 处理发送() {
    const 文本 = 输入文本.trim();
    if (!文本 || 发送中 || !选中详情) return;
    set发送中(true);
    set发送错(null);
    try {
      const 更新 = await 追加消息(选中详情.id, 文本);
      set选中详情(更新);
      set输入文本('');
      // 同步刷新列表里的预览
      set对话们((prev) =>
        prev.map((c) =>
          c.id === 更新.id
            ? {
                ...c,
                最后消息预览: 更新.消息.length > 0 ? 更新.消息[更新.消息.length - 1].内容 : c.最后消息预览,
                最后活动时间: 更新.最后活动时间,
                谈判状态: 更新.谈判状态,
              }
            : c,
        ),
      );
    } catch (e: any) {
      set发送错(e?.message || String(e));
    } finally {
      set发送中(false);
    }
  }

  /* ─── 谈判按钮（接受 / 暂停 / 拒绝） ─── */
  async function 处理谈判变更(新状态: 谈判状态) {
    if (!选中详情 || 谈判处理中) return;
    set谈判处理中(true);
    try {
      const 更新 = await 更新谈判进度(选中详情.id, { 状态: 新状态 });
      set选中详情(更新);
      set对话们((prev) =>
        prev.map((c) => (c.id === 更新.id ? { ...c, 谈判状态: 更新.谈判状态 } : c)),
      );
    } catch (e: any) {
      // 把错误显示在状态栏
      set详情错(e?.message || String(e));
    } finally {
      set谈判处理中(false);
    }
  }

  /* ─── 列表筛选 ─── */
  const 筛选后 = useMemo(() => {
    if (!搜索词.trim()) return 对话们;
    const q = 搜索词.toLowerCase();
    return 对话们.filter((c) => {
      const 名 = (c.对方_display_name || '').toLowerCase();
      const 标 = (c.关联帖子_标题 || '').toLowerCase();
      const 预 = (c.最后消息预览 || '').toLowerCase();
      return 名.includes(q) || 标.includes(q) || 预.includes(q);
    });
  }, [对话们, 搜索词]);

  /* ─── 渲染消息列表节点 ─── */
  const 节点列表: React.ReactNode[] = [];
  const 消息们 = 选中详情?.消息 ?? [];
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
          时间={详情时间(m.创建时间)}
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
            首字母: m.发送方_avatar_initials || (选中详情?.对方_avatar_initials ?? '??'),
            颜色: m.发送方_avatar_color || (选中详情?.对方_avatar_color ?? '#999'),
          }}
          名字={m.发送方_display_name || (选中详情?.对方_display_name ?? '对方')}
          内容={m.内容}
          时间={详情时间(m.创建时间)}
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
          首字母: 选中详情?.对方_avatar_initials ?? '??',
          颜色: 选中详情?.对方_avatar_color ?? '#999',
        }}
        文案={`${选中详情?.对方_display_name ?? '对方'} 正在回复…`}
      />,
    );
  }

  /* ─── 顶部 chip + 谈判按钮（详情头部） ─── */
  const chip信息 = 状态chip(选中详情?.谈判状态);
  const 顶部chip = chip信息 ? (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: chip信息.颜色,
        background: chip信息.背景,
        padding: '4px 10px',
        borderRadius: 999,
      }}
    >
      {chip信息.文字}
      {选中详情?.谈判状态 === '已达成' && 选中详情?.成交价_cents != null && (
        <span style={{ marginLeft: 4, fontWeight: 600 }}>
          · {格式化金额(选中详情.成交价_cents, 选中详情.成交价_currency)}
        </span>
      )}
    </span>
  ) : null;

  /* ─── 渲染 ─── */
  if (!已登录()) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: 'calc(100vh - 56px)', background: 聊天色.灰底 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 聊天色.字浅 }}>
          <AlertCircle style={{ width: 16, height: 16, color: '#C2410C' }} />
          请先登录后查看消息
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex"
      style={{ height: 'calc(100vh - 56px)', background: 聊天色.灰底, overflow: 'hidden' }}
    >
      {/* 左侧：会话列表 */}
      <div
        className="flex flex-col shrink-0"
        style={{
          width: 296,
          background: 聊天色.白,
          borderRight: `1px solid ${聊天色.描边浅}`,
        }}
      >
        <div style={{ padding: '20px 18px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: 聊天色.字深,
                letterSpacing: '-0.02em',
              }}
            >
              消息
            </span>
            <span style={{ fontSize: 11, color: 聊天色.字超浅 }}>
              {筛选后.length} 个会话
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 12,
              background: 'rgba(0,0,0,0.03)',
              border: `1px solid ${聊天色.描边}`,
            }}
          >
            <Search style={{ width: 13, height: 13, color: 聊天色.字超浅, flexShrink: 0 }} />
            <input
              value={搜索词}
              onChange={(e) => set搜索词(e.target.value)}
              placeholder="搜索对话…"
              style={{
                flex: 1,
                background: 'transparent',
                outline: 'none',
                border: 'none',
                fontSize: 13,
                color: 聊天色.字深,
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {列加载中 && (
            <div style={{ padding: 32, textAlign: 'center', fontSize: 12, color: 聊天色.字浅 }}>
              加载中…
            </div>
          )}
          {!列加载中 && 列错 && (
            <div style={{ padding: 32, textAlign: 'center', fontSize: 12, color: '#B91C1C' }}>
              加载失败：{列错}
            </div>
          )}
          {!列加载中 && !列错 && 筛选后.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', fontSize: 12, color: 聊天色.字浅 }}>
              {对话们.length === 0 ? '还没有对话；让你的 Agent 联系一个帖子开始吧。' : '暂无匹配的对话'}
            </div>
          )}
          {筛选后.map((conv) => {
            const isActive = conv.id === 选中id;
            const chip = 状态chip(conv.谈判状态);
            return (
              <button
                key={conv.id}
                onClick={() => {
                  set选中id(conv.id);
                  set输入文本('');
                  set发送错(null);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '12px 16px',
                  textAlign: 'left',
                  background: isActive ? 'rgba(79,70,229,0.05)' : 'transparent',
                  borderLeft: isActive ? `3px solid ${聊天色.紫}` : '3px solid transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.02)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                {/* 头像 */}
                <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: conv.对方_avatar_color || '#999',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {conv.对方_avatar_initials || '??'}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 14,
                      height: 14,
                      borderRadius: 999,
                      background: 聊天色.紫渐变,
                      border: `1.5px solid ${聊天色.白}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Bot style={{ width: 7, height: 7, color: 'white' }} />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 聊天色.字深,
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {conv.对方_display_name || '对方'}
                    </span>
                    <span style={{ fontSize: 10, color: 聊天色.字超浅, flexShrink: 0 }}>
                      {时间(conv.最后消息时间 || conv.最后活动时间)}
                    </span>
                  </div>
                  {(conv.关联帖子_标题 || chip) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      {chip && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: chip.颜色,
                            background: chip.背景,
                            padding: '2px 7px',
                            borderRadius: 999,
                            flexShrink: 0,
                          }}
                        >
                          {chip.文字}
                        </span>
                      )}
                      {conv.关联帖子_标题 && (
                        <span
                          style={{
                            fontSize: 10,
                            color: 聊天色.字超浅,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {截短(conv.关联帖子_标题, 36)}
                        </span>
                      )}
                    </div>
                  )}
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: 聊天色.字浅,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {截短(conv.最后消息预览 || '（暂无消息）', 60)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 右侧：选中详情 */}
      <div
        className="flex-1 flex flex-col"
        style={{ minWidth: 0, background: 聊天色.白 }}
      >
        {!选中id && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              color: 聊天色.字浅,
            }}
          >
            选择左侧任意对话查看
          </div>
        )}
        {选中id && (
          <>
            <ChatHeader
              头像={{
                首字母: 选中详情?.对方_avatar_initials || '??',
                颜色: 选中详情?.对方_avatar_color || '#999',
              }}
              名字={选中详情?.对方_display_name || '对方'}
              副标题={选中详情?.关联帖子_标题 || '直接私信'}
              状态={详情加载中 ? null : 'online'}
              右侧={顶部chip}
              显示菜单
            />

            {详情错 && (
              <div
                style={{
                  padding: '10px 16px',
                  fontSize: 12,
                  color: '#B91C1C',
                  background: '#FEF2F2',
                  borderBottom: `1px solid ${聊天色.描边浅}`,
                }}
              >
                {详情错}
              </div>
            )}

            <MessageList
              空状态={!详情加载中 && 消息们.length === 0}
              空文案标题={详情加载中 ? '加载中…' : '暂无消息'}
              滚动依赖={[消息们.length, 选中id, 发送中]}
            >
              {节点列表}
            </MessageList>

            {/* 谈判按钮区（仅议价中或未启动时显示） */}
            {选中详情 && (选中详情.谈判状态 === '议价中' || 选中详情.谈判状态 == null) && (
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
                  onClick={() => 处理谈判变更('议价中')}
                  disabled={选中详情.谈判状态 === '议价中' || 谈判处理中}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    color: 选中详情.谈判状态 === '议价中' ? '#9CA3AF' : 聊天色.紫,
                    background: 选中详情.谈判状态 === '议价中' ? '#F3F4F6' : 'rgba(79,70,229,0.06)',
                    border: '1px solid rgba(79,70,229,0.2)',
                    cursor: 选中详情.谈判状态 === '议价中' || 谈判处理中 ? 'not-allowed' : 'pointer',
                  }}
                >
                  开启谈判
                </button>
                {选中详情.谈判状态 === '议价中' && (
                  <>
                    <button
                      onClick={() => 处理谈判变更('已达成')}
                      disabled={谈判处理中}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 10,
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'white',
                        background: 聊天色.紫渐变,
                        cursor: 谈判处理中 ? 'wait' : 'pointer',
                      }}
                    >
                      💰 接受报价
                    </button>
                    <button
                      onClick={() => 处理谈判变更('已搁置')}
                      disabled={谈判处理中}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 10,
                        fontSize: 12,
                        color: 聊天色.字浅,
                        background: 'white',
                        border: `1px solid ${聊天色.描边}`,
                        cursor: 谈判处理中 ? 'wait' : 'pointer',
                      }}
                    >
                      ⏸ 暂停
                    </button>
                    <button
                      onClick={() => 处理谈判变更('已拒绝')}
                      disabled={谈判处理中}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 10,
                        fontSize: 12,
                        color: '#B91C1C',
                        background: 'white',
                        border: '1px solid rgba(220,38,38,0.3)',
                        cursor: 谈判处理中 ? 'wait' : 'pointer',
                      }}
                    >
                      ❌ 拒绝
                    </button>
                  </>
                )}
              </div>
            )}

            <ChatInput
              值={输入文本}
              on值改变={set输入文本}
              on发送={处理发送}
              占位={
                发送错
                  ? `发送失败：${发送错}`
                  : 选中详情 && (选中详情.谈判状态 === '已达成' || 选中详情.谈判状态 === '已拒绝')
                    ? '继续对话…'
                    : '给你的 Agent 一条指令…'
              }
              禁用={!选中详情 || 发送中 || 详情加载中}
            />
          </>
        )}
      </div>
    </div>
  );
}
