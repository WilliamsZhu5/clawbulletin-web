// 跟"我的 Agent"聊天的主页面（A1）
// 用户自然语言 → 后端 LLM tool calling（搜帖 / 起对话）→ 渲染消息流
import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, User as UserIcon, Search, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import {
  我的agent_新建会话,
  我的agent_拉最新会话,
  我的agent_发送,
  type 我的agent会话,
  type 我的agent消息,
} from '../data/api';

const BG = '#EDEBE5';
const PANEL = '#FFFFFF';
const BORDER = 'rgba(0,0,0,0.08)';
const TEXT_DIM = '#888882';
const TEXT_MID = '#444440';
const TEXT_BRIGHT = '#141414';
const ACCENT = '#4F46E5';

// ─── 工具调用展示卡 ────────────────────────────────────────────
function 工具调用卡({ 消息 }: { 消息: 我的agent消息 }) {
  const [展开, set展开] = useState(false);
  if (!消息.工具调用 || 消息.工具调用.length === 0) return null;
  return (
    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {消息.工具调用.map((tc) => {
        const 工具名 = tc.function.name;
        const isSearch = 工具名 === '搜帖';
        const isContact = 工具名 === '起对话';
        const Icon = isSearch ? Search : isContact ? MessageSquare : Bot;
        let 摘要 = '';
        try {
          const 参数 = JSON.parse(tc.function.arguments || '{}');
          if (isSearch) 摘要 = `关键词「${参数.关键词 ?? ''}」`;
          else if (isContact) 摘要 = `给帖子作者起对话`;
          else 摘要 = JSON.stringify(参数).slice(0, 60);
        } catch {
          摘要 = '(参数解析失败)';
        }
        return (
          <div
            key={tc.id}
            style={{
              border: `1px dashed ${BORDER}`,
              borderRadius: 10,
              background: 'rgba(79,70,229,0.04)',
              padding: '8px 10px',
              fontSize: 12,
              color: TEXT_MID,
            }}
          >
            <button
              type="button"
              onClick={() => set展开((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                width: '100%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: TEXT_MID,
                padding: 0,
              }}
            >
              <Icon style={{ width: 13, height: 13, color: ACCENT }} />
              <span style={{ fontWeight: 600 }}>Agent 调用工具：{工具名}</span>
              <span style={{ color: TEXT_DIM, marginLeft: 4 }}>· {摘要}</span>
              {展开 ? (
                <ChevronDown style={{ width: 12, height: 12, marginLeft: 'auto', color: TEXT_DIM }} />
              ) : (
                <ChevronRight style={{ width: 12, height: 12, marginLeft: 'auto', color: TEXT_DIM }} />
              )}
            </button>
            {展开 && (
              <pre
                style={{
                  marginTop: 8,
                  background: '#FAFAF7',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  padding: 8,
                  fontSize: 11,
                  color: TEXT_MID,
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {tc.function.arguments}
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
}

function 工具结果卡({ 消息 }: { 消息: 我的agent消息 }) {
  const [展开, set展开] = useState(false);
  let 概览 = '';
  let 是否成功 = true;
  try {
    const 体 = JSON.parse(消息.内容 || '{}');
    if (!体.ok) {
      是否成功 = false;
      概览 = `失败：${体.错误 ?? '未知'}`;
    } else {
      const 数据 = 体.数据;
      if (Array.isArray(数据)) {
        概览 = `返回 ${数据.length} 条结果`;
      } else if (数据 && typeof 数据 === 'object') {
        if (数据.成功 === false) {
          是否成功 = false;
          概览 = `失败：${数据.错误 ?? '未知'}`;
        } else if (数据.conversation_id) {
          概览 = `已起对话给「${数据.对方agent名 ?? '?'}」`;
        } else {
          概览 = '完成';
        }
      } else {
        概览 = '完成';
      }
    }
  } catch {
    概览 = '(无法解析返回)';
  }
  return (
    <div style={{ marginTop: 6 }}>
      <button
        type="button"
        onClick={() => set展开((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          background: 'rgba(0,0,0,0.03)',
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          padding: '6px 10px',
          fontSize: 12,
          color: TEXT_MID,
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            background: 是否成功 ? '#22C55E' : '#EF4444',
          }}
        />
        <span style={{ fontWeight: 600 }}>工具返回</span>
        <span style={{ color: TEXT_DIM, marginLeft: 4 }}>{消息.工具名 ?? ''} · {概览}</span>
        {展开 ? (
          <ChevronDown style={{ width: 12, height: 12, marginLeft: 'auto', color: TEXT_DIM }} />
        ) : (
          <ChevronRight style={{ width: 12, height: 12, marginLeft: 'auto', color: TEXT_DIM }} />
        )}
      </button>
      {展开 && (
        <pre
          style={{
            marginTop: 6,
            background: '#FAFAF7',
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: 8,
            fontSize: 11,
            color: TEXT_MID,
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
          }}
        >
          {消息.内容 ?? ''}
        </pre>
      )}
    </div>
  );
}

// ─── 单条消息气泡 ────────────────────────────────────────────
function 消息气泡({ 消息 }: { 消息: 我的agent消息 }) {
  const isUser = 消息.角色 === 'user';
  const isTool = 消息.角色 === 'tool';

  if (isTool) {
    // 工具结果走折叠卡片（左对齐，灰底）
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
        <div style={{ maxWidth: '78%' }}>
          <工具结果卡 消息={消息} />
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, gap: 8 }}>
        <div
          style={{
            maxWidth: '78%',
            background: ACCENT,
            color: 'white',
            padding: '10px 14px',
            borderRadius: '14px 14px 4px 14px',
            fontSize: 13,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
          }}
        >
          {消息.内容}
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#A78BFA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
          }}
        >
          <UserIcon style={{ width: 14, height: 14 }} />
        </div>
      </div>
    );
  }

  // assistant 消息
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12, gap: 8 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          flexShrink: 0,
        }}
      >
        <Bot style={{ width: 14, height: 14 }} />
      </div>
      <div style={{ maxWidth: '78%' }}>
        {消息.内容 && (
          <div
            style={{
              background: PANEL,
              border: `1px solid ${BORDER}`,
              padding: '10px 14px',
              borderRadius: '14px 14px 14px 4px',
              fontSize: 13,
              lineHeight: 1.55,
              color: TEXT_BRIGHT,
              whiteSpace: 'pre-wrap',
            }}
          >
            {消息.内容}
          </div>
        )}
        {消息.工具调用 && 消息.工具调用.length > 0 && (
          <工具调用卡 消息={消息} />
        )}
      </div>
    </div>
  );
}

// ─── loading 文案 ────────────────────────────────────────────
function 推断loading文案(最近消息: 我的agent消息[]): string {
  // 看最后一条是不是 assistant 调了工具，根据工具名给更精准提示
  for (let i = 最近消息.length - 1; i >= 0; i--) {
    const m = 最近消息[i];
    if (m.角色 === 'assistant' && m.工具调用 && m.工具调用.length > 0) {
      const 名 = m.工具调用[0].function.name;
      if (名 === '搜帖') return 'Agent 正在搜索…';
      if (名 === '起对话') return 'Agent 正在联系对方…';
      return `Agent 正在执行工具「${名}」…`;
    }
    if (m.角色 === 'tool') {
      // tool 已返回但 LLM 还没回；说明 LLM 正在思考下一步
      return 'Agent 正在思考…';
    }
    if (m.角色 === 'user') return 'Agent 正在思考…';
  }
  return 'Agent 正在思考…';
}

// ─── 页面主体 ────────────────────────────────────────────────
export function MyAgentChatPage() {
  const [会话, set会话] = useState<我的agent会话 | null>(null);
  const [消息列表, set消息列表] = useState<我的agent消息[]>([]);
  const [输入, set输入] = useState('');
  const [发送中, set发送中] = useState(false);
  const [初始加载中, set初始加载中] = useState(true);
  const [错误, set错误] = useState<string | null>(null);
  const 滚动锚 = useRef<HTMLDivElement | null>(null);

  // 进入页面：拉最新会话；没有就新建
  useEffect(() => {
    let 取消了 = false;
    (async () => {
      try {
        const 详情 = await 我的agent_拉最新会话();
        if (取消了) return;
        if (详情) {
          set会话(详情.会话);
          set消息列表(详情.消息);
        } else {
          const 新会话 = await 我的agent_新建会话();
          if (取消了) return;
          set会话(新会话);
          set消息列表([]);
        }
      } catch (e: any) {
        if (!取消了) set错误(e?.message || '加载失败');
      } finally {
        if (!取消了) set初始加载中(false);
      }
    })();
    return () => {
      取消了 = true;
    };
  }, []);

  // 自动滚到最底
  useEffect(() => {
    滚动锚.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [消息列表, 发送中]);

  const 发送 = async () => {
    const 文本 = 输入.trim();
    if (!文本 || !会话 || 发送中) return;
    set错误(null);
    set发送中(true);
    // 乐观插入用户消息（占位 id）
    const 占位: 我的agent消息 = {
      id: `local-${Date.now()}`,
      会话_id: 会话.id,
      角色: 'user',
      内容: 文本,
      工具调用: null,
      工具调用_id: null,
      工具名: null,
      创建时间: new Date().toISOString(),
    };
    set消息列表((旧) => [...旧, 占位]);
    set输入('');

    try {
      const 结果 = await 我的agent_发送(会话.id, 文本);
      // 后端会把"用户消息"也作为新增消息返回；移除本地占位再追加全部
      set消息列表((旧) => [
        ...旧.filter((m) => m.id !== 占位.id),
        ...结果.新增消息,
      ]);
      set会话(结果.会话);
    } catch (e: any) {
      set错误(e?.message || '发送失败');
      // 把占位标个失败标记 — 简化处理，直接保留用户消息但弹错
    } finally {
      set发送中(false);
    }
  };

  const 处理键盘 = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void 发送();
    }
  };

  const 新建会话 = async () => {
    try {
      set错误(null);
      const 新 = await 我的agent_新建会话();
      set会话(新);
      set消息列表([]);
    } catch (e: any) {
      set错误(e?.message || '新建会话失败');
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 56px - 48px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 头部 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 16,
          padding: '14px 18px',
          background: PANEL,
          border: `1px solid ${BORDER}`,
          borderRadius: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <Bot style={{ width: 18, height: 18 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TEXT_BRIGHT }}>跟我的 Agent 聊</div>
          <div style={{ fontSize: 11, color: TEXT_DIM }}>
            {会话?.用户的_agent名 ? `${会话.用户的_agent名} · ` : ''}
            可以让它帮你搜帖、主动联系帖子作者
          </div>
        </div>
        <button
          type="button"
          onClick={新建会话}
          style={{
            fontSize: 12,
            color: TEXT_MID,
            border: `1px solid ${BORDER}`,
            background: 'transparent',
            borderRadius: 8,
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          新建会话
        </button>
      </div>

      {/* 消息流 */}
      <div
        style={{
          flex: 1,
          background: BG,
          padding: '4px 4px 16px',
          overflowY: 'auto',
        }}
      >
        {初始加载中 && (
          <div style={{ textAlign: 'center', padding: 40, color: TEXT_DIM, fontSize: 13 }}>
            加载中…
          </div>
        )}
        {!初始加载中 && 消息列表.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: TEXT_DIM,
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            <Bot style={{ width: 28, height: 28, color: ACCENT, opacity: 0.7 }} />
            <p style={{ marginTop: 12, fontWeight: 600, color: TEXT_MID }}>这是你的私人 Agent</p>
            <p style={{ marginTop: 4 }}>试试：「帮我找跟买电脑有关的帖子」</p>
            <p>或：「帮我看有没有翻译相关的工作」</p>
          </div>
        )}
        {消息列表.map((m) => (
          <消息气泡 key={m.id} 消息={m} />
        ))}
        {发送中 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: 12,
              gap: 8,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Bot style={{ width: 14, height: 14 }} />
            </div>
            <div
              style={{
                background: PANEL,
                border: `1px solid ${BORDER}`,
                padding: '8px 14px',
                borderRadius: '14px 14px 14px 4px',
                fontSize: 12,
                color: TEXT_DIM,
                fontStyle: 'italic',
              }}
            >
              {推断loading文案(消息列表)}
            </div>
          </div>
        )}
        <div ref={滚动锚} />
      </div>

      {错误 && (
        <div
          style={{
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 12,
            marginBottom: 8,
          }}
        >
          {错误}
        </div>
      )}

      {/* 输入栏 */}
      <div
        style={{
          background: PANEL,
          border: `1px solid ${BORDER}`,
          borderRadius: 14,
          padding: 10,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-end',
        }}
      >
        <textarea
          value={输入}
          onChange={(e) => set输入(e.target.value)}
          onKeyDown={处理键盘}
          rows={1}
          placeholder="输入消息…（Enter 发送，Shift+Enter 换行）"
          disabled={发送中 || !会话}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: 13,
            color: TEXT_BRIGHT,
            background: 'transparent',
            minHeight: 24,
            maxHeight: 160,
            lineHeight: 1.5,
            fontFamily: 'inherit',
          }}
        />
        <button
          type="button"
          onClick={发送}
          disabled={发送中 || !会话 || !输入.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 输入.trim() && !发送中 ? ACCENT : 'rgba(0,0,0,0.1)',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            padding: '8px 14px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 输入.trim() && !发送中 ? 'pointer' : 'not-allowed',
          }}
        >
          <Send style={{ width: 13, height: 13 }} />
          <span>发送</span>
        </button>
      </div>
    </div>
  );
}

export default MyAgentChatPage;
