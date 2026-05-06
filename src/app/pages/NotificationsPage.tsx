// 通知中心 feed 页面（v1 通知中心 F6）
// 进入页面 → 调 useNotifications().刷新() 拉全量
// 单条点击 → 调"标记该条已读"+ 按 type 跳转
//   comment_created       → /post/{post_id}
//   conversation_started  → /messages?conv={conversation_id}
//   message_received      → /messages?conv={conversation_id}
//   negotiation_updated   → /messages?conv={conversation_id}
// 已读 / 未读视觉区分：未读条左侧蓝色小圆点 + 加粗；已读弱化
// 时间显示用相对时间，hover 显示绝对时间
//
// 注意：复用 chat 组件视觉 token（聊天色 / 聊天圆 / 聊天阴影）保持站内一致

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Bell, AlertCircle, MessageCircle, MessageSquare, Handshake } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { 已登录, type 通知 } from '../data/api';
import { 聊天色 } from '../components/chat/聊天令牌';

// 设计 token —— 复用 chat 组件 + 保持视觉一致
const 紫 = 聊天色.紫;
const 卡白 = 聊天色.白;
const 字深 = 聊天色.字深;
const 字浅 = 聊天色.字浅;
const 字超浅 = 聊天色.字超浅;
const 描边 = 聊天色.描边浅;
const 灰底 = '#FAFAFB';
const 未读高亮底 = 'rgba(79,70,229,0.04)';

// 相对时间格式：刚刚 / N 分钟前 / N 小时前 / 昨天 / N 天前 / N 月 N 日
function 相对时间(t: string): string {
  try {
    const ms = Date.now() - new Date(t).getTime();
    if (ms < 0) return '刚刚';
    const sec = Math.floor(ms / 1000);
    if (sec < 60) return '刚刚';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} 分钟前`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} 小时前`;
    const day = Math.floor(hr / 24);
    if (day === 1) return '昨天';
    if (day < 7) return `${day} 天前`;
    const d = new Date(t);
    return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  } catch {
    return '';
  }
}

function 绝对时间(t: string): string {
  try {
    return new Date(t).toLocaleString('zh-CN');
  } catch {
    return t;
  }
}

// 根据 type 拿 icon —— 视觉区分类型
function _图标(type: string): React.ReactNode {
  if (type === 'comment_created') {
    return <MessageCircle style={{ width: 16, height: 16, color: '#16A34A' }} strokeWidth={1.75} />;
  }
  if (type === 'conversation_started' || type === 'message_received') {
    return <MessageSquare style={{ width: 16, height: 16, color: 紫 }} strokeWidth={1.75} />;
  }
  if (type === 'negotiation_updated') {
    return <Handshake style={{ width: 16, height: 16, color: '#F97316' }} strokeWidth={1.75} />;
  }
  return <Bell style={{ width: 16, height: 16, color: 字浅 }} strokeWidth={1.75} />;
}

// 根据 type + payload 拿跳转目标
function 拿跳转(n: 通知): string | null {
  const p = n.payload || {};
  if (n.type === 'comment_created' && p.post_id) {
    return `/post/${p.post_id}`;
  }
  if (
    (n.type === 'conversation_started' ||
      n.type === 'message_received' ||
      n.type === 'negotiation_updated') &&
    p.conversation_id
  ) {
    return `/messages?conv=${encodeURIComponent(p.conversation_id)}`;
  }
  return null;
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { 通知列表, 未读数, 加载中, 错, 刷新, 标记已读, 标记全部已读 } = useNotifications();

  // 进入页面拉全量；防 StrictMode 双调用
  const 已拉ref = useRef(false);
  useEffect(() => {
    if (!已登录()) return;
    if (已拉ref.current) return;
    已拉ref.current = true;
    刷新().catch(() => {});
  }, [刷新]);

  // 全部标为已读处理 —— 失败时把错放 alert（轻量，避免乐观更新）
  const [全标处理中, set全标处理中] = React.useState(false);
  const 处理标全部 = async () => {
    if (未读数 === 0 || 全标处理中) return;
    set全标处理中(true);
    try {
      await 标记全部已读();
    } catch (e: any) {
      window.alert(e?.message || String(e));
    } finally {
      set全标处理中(false);
    }
  };

  // 单条点击：先标记已读 → 再跳转
  const 处理点击单条 = async (n: 通知) => {
    const 目标 = 拿跳转(n);
    try {
      if (!n.read_at) await 标记已读(n.id);
    } catch {
      // 标记失败不阻塞跳转 —— 用户体感先跳过去更好
    }
    if (目标) navigate(目标);
  };

  if (!已登录()) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: 'calc(100vh - 120px)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 字浅 }}>
          <AlertCircle style={{ width: 16, height: 16, color: '#C2410C' }} />
          请先登录后查看通知
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto" style={{ padding: '4px 0' }}>
      {/* 顶部 header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 4px 14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bell style={{ width: 22, height: 22, color: 字深 }} strokeWidth={1.75} />
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: 字深,
              letterSpacing: '-0.02em',
            }}
          >
            通知
          </h1>
          {未读数 > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'white',
                background: '#DC2626',
                padding: '2px 8px',
                borderRadius: 999,
                marginLeft: 4,
              }}
            >
              {未读数 > 99 ? '99+' : 未读数}
            </span>
          )}
        </div>
        <button
          onClick={处理标全部}
          disabled={未读数 === 0 || 全标处理中 || 加载中}
          style={{
            padding: '7px 14px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            color: 未读数 === 0 ? 字超浅 : 紫,
            background: 未读数 === 0 ? '#F4F4F2' : 'rgba(79,70,229,0.08)',
            border: 未读数 === 0 ? `1px solid ${描边}` : '1px solid rgba(79,70,229,0.2)',
            cursor: 未读数 === 0 || 全标处理中 ? 'not-allowed' : 'pointer',
            transition: 'all 120ms ease',
          }}
          onMouseEnter={(e) => {
            if (未读数 > 0 && !全标处理中) {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,70,229,0.14)';
            }
          }}
          onMouseLeave={(e) => {
            if (未读数 > 0 && !全标处理中) {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,70,229,0.08)';
            }
          }}
        >
          {全标处理中 ? '处理中…' : '全部标为已读'}
        </button>
      </div>

      {/* 错 / loading / 空态 / 列表 */}
      {错 && (
        <div
          style={{
            padding: '12px 14px',
            background: '#FEF2F2',
            border: '1px solid rgba(220,38,38,0.2)',
            borderRadius: 12,
            color: '#B91C1C',
            fontSize: 12,
            marginBottom: 12,
          }}
        >
          加载失败：{错}
        </div>
      )}

      {加载中 && 通知列表.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: 字浅,
            fontSize: 13,
            background: 卡白,
            border: `1px solid ${描边}`,
            borderRadius: 16,
          }}
        >
          加载中…
        </div>
      )}

      {!加载中 && 通知列表.length === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 20px',
            background: 卡白,
            border: `1px solid ${描边}`,
            borderRadius: 16,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#F4F4F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <Bell style={{ width: 24, height: 24, color: 字超浅 }} strokeWidth={1.5} />
          </div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 字深 }}>暂无通知</p>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 12,
              color: 字浅,
              maxWidth: 360,
              lineHeight: 1.55,
            }}
          >
            当别人评论你的帖子、给你 Agent 发起对话、或你的谈判有进展时，会显示在这里。
          </p>
        </div>
      )}

      {通知列表.length > 0 && (
        <div
          style={{
            background: 卡白,
            border: `1px solid ${描边}`,
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {通知列表.map((n, i) => {
            const 未读 = !n.read_at;
            const 可点 = !!拿跳转(n);
            return (
              <button
                key={n.id}
                onClick={() => 处理点击单条(n)}
                title={绝对时间(n.created_at)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '14px 16px',
                  background: 未读 ? 未读高亮底 : 'transparent',
                  borderTop: i === 0 ? 'none' : `1px solid ${描边}`,
                  textAlign: 'left',
                  border: 'none',
                  borderLeft: 未读 ? `0px` : '0px',
                  cursor: 可点 ? 'pointer' : 'default',
                  transition: 'background 120ms ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 未读
                    ? 'rgba(79,70,229,0.08)'
                    : 'rgba(0,0,0,0.02)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 未读 ? 未读高亮底 : 'transparent';
                }}
              >
                {/* 未读小圆点 —— 紫色（与 brand accent 一致） */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 未读 ? 紫 : 'transparent',
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                {/* type icon */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: '#F4F4F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {_图标(n.type)}
                </div>
                {/* 文案 + 时间 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: 未读 ? 字深 : 字浅,
                      fontWeight: 未读 ? 600 : 400,
                      // 长文本截断：最多两行
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {n.文案}
                  </p>
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: 11,
                      color: 字超浅,
                    }}
                  >
                    {相对时间(n.created_at)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <span style={{ display: 'none' }}>{灰底}</span>
    </div>
  );
}
