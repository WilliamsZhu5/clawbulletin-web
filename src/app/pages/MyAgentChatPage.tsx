// 跟"我的 Agent"聊天的主页面（A1）
// 用户自然语言 → 后端 LLM tool calling（搜帖 / 起对话）→ 渲染消息流
// UI：复用 src/app/components/chat 下的统一 chat 组件
import { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import {
  我的agent_新建会话,
  我的agent_拉最新会话,
  我的agent_发送,
  type 我的agent会话,
  type 我的agent消息,
} from '../data/api';
import {
  ChatHeader,
  ChatInput,
  MessageBubble,
  MessageList,
  ToolCallCard,
  TypingIndicator,
  聊天色,
} from '../components/chat';

// ─── 工具消息：解析后端 tool 返回 → ToolCallCard ────────────────
function 工具结果摘要(消息: 我的agent消息): { 摘要: string; 状态: 'success' | 'error' | null } {
  let 概览 = '';
  let 是否成功: 'success' | 'error' | null = 'success';
  try {
    const 体 = JSON.parse(消息.内容 || '{}');
    if (!体.ok) {
      是否成功 = 'error';
      概览 = `失败：${体.错误 ?? '未知'}`;
    } else {
      const 数据 = 体.数据;
      if (Array.isArray(数据)) {
        概览 = `返回 ${数据.length} 条结果`;
      } else if (数据 && typeof 数据 === 'object') {
        if (数据.成功 === false) {
          是否成功 = 'error';
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
    是否成功 = 'error';
  }
  return { 摘要: 概览, 状态: 是否成功 };
}

// 工具调用（assistant 发起）摘要
function 工具调用摘要(工具名: string, 参数: string): string {
  try {
    const 解 = JSON.parse(参数 || '{}');
    if (工具名 === '搜帖') return `关键词「${解.关键词 ?? ''}」`;
    if (工具名 === '起对话') return `给帖子作者起对话`;
    return JSON.stringify(解).slice(0, 60);
  } catch {
    return '(参数解析失败)';
  }
}

// ─── loading 文案推断 ────────────────────────────────────────
function 推断loading文案(最近消息: 我的agent消息[]): string {
  for (let i = 最近消息.length - 1; i >= 0; i--) {
    const m = 最近消息[i];
    if (m.角色 === 'assistant' && m.工具调用 && m.工具调用.length > 0) {
      const 名 = m.工具调用[0].function.name;
      if (名 === '搜帖') return 'Agent 正在搜索…';
      if (名 === '起对话') return 'Agent 正在联系对方…';
      return `Agent 正在执行工具「${名}」…`;
    }
    if (m.角色 === 'tool') return 'Agent 正在思考…';
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
    } finally {
      set发送中(false);
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

  const agent名 = 会话?.用户的_agent名 || '我的 Agent';

  // ── 渲染消息列表为统一气泡组件 ──
  const 节点列表: React.ReactNode[] = [];
  消息列表.forEach((m, idx) => {
    const 上一条 = idx > 0 ? 消息列表[idx - 1] : null;
    const 同一发送者 = !!(上一条 && 上一条.角色 === m.角色);

    if (m.角色 === 'user') {
      节点列表.push(
        <MessageBubble
          key={m.id}
          角色="user"
          头像={{ 颜色: 聊天色.紫渐变 }}
          内容={m.内容 ?? ''}
          时间={m.创建时间}
          状态={m.id.startsWith('local-') ? 'sending' : 'sent'}
          显示头像={!同一发送者}
          动画索引={idx}
        />
      );
    } else if (m.角色 === 'assistant') {
      // assistant 可能既有文本又有 tool_calls；分两块展示，但同一头像
      const 文本节点 = m.内容 ? (
        <MessageBubble
          key={`${m.id}-txt`}
          角色="agent"
          头像={{ 颜色: 聊天色.紫渐变 }}
          名字={agent名}
          内容={m.内容}
          时间={m.创建时间}
          显示头像={!同一发送者}
          显示名字={!同一发送者}
          动画索引={idx}
        />
      ) : null;
      节点列表.push(文本节点);
      if (m.工具调用 && m.工具调用.length > 0) {
        m.工具调用.forEach((tc) => {
          const 摘要 = 工具调用摘要(tc.function.name, tc.function.arguments);
          节点列表.push(
            <MessageBubble
              key={`${m.id}-tc-${tc.id}`}
              角色="tool"
              内容={
                <ToolCallCard
                  工具名={tc.function.name}
                  摘要={摘要}
                  输入={tc.function.arguments}
                  状态="running"
                />
              }
              动画索引={idx}
              显示头像={false}
            />
          );
        });
      }
    } else if (m.角色 === 'tool') {
      const { 摘要, 状态 } = 工具结果摘要(m);
      节点列表.push(
        <MessageBubble
          key={m.id}
          角色="tool"
          内容={
            <ToolCallCard
              工具名={m.工具名 ?? '工具返回'}
              摘要={摘要}
              输出={m.内容 ?? ''}
              状态={状态}
            />
          }
          动画索引={idx}
          显示头像={false}
        />
      );
    }
  });

  if (发送中) {
    节点列表.push(
      <TypingIndicator
        key="__typing__"
        头像={{ 颜色: 聊天色.紫渐变 }}
        文案={推断loading文案(消息列表)}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 56px - 48px)',
        display: 'flex',
        flexDirection: 'column',
        background: 聊天色.灰底,
        borderRadius: 14,
        overflow: 'hidden',
        border: `1px solid ${聊天色.描边}`,
      }}
    >
      <ChatHeader
        头像={{ 颜色: 聊天色.紫渐变, 首字母: '' }}
        名字={`跟 ${agent名} 聊`}
        副标题="可以让它帮你搜帖、主动联系帖子作者"
        状态="online"
        右侧={
          <button
            type="button"
            onClick={新建会话}
            style={{
              fontSize: 11,
              color: 聊天色.字中,
              border: `1px solid ${聊天色.描边}`,
              background: 'transparent',
              borderRadius: 8,
              padding: '6px 12px',
              cursor: 'pointer',
            }}
          >
            新建会话
          </button>
        }
      />

      <MessageList
        加载中={初始加载中}
        空状态={!初始加载中 && 消息列表.length === 0}
        空文案标题="这是你的私人 Agent"
        空文案副={'试试：「帮我找跟买电脑有关的帖子」\n或：「帮我看有没有翻译相关的工作」'}
        空状态图标={<Bot style={{ width: 40, height: 40, color: 聊天色.紫, opacity: 0.7 }} />}
        滚动依赖={[消息列表.length, 发送中]}
      >
        {节点列表}
      </MessageList>

      {错误 && (
        <div
          style={{
            background: '#FEE2E2',
            borderTop: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '8px 16px',
            fontSize: 12,
          }}
        >
          {错误}
        </div>
      )}

      <ChatInput
        值={输入}
        on值改变={set输入}
        on发送={发送}
        发送中={发送中}
        禁用={!会话}
        占位="输入消息…（Enter 发送，Shift+Enter 换行）"
      />
    </div>
  );
}

export default MyAgentChatPage;
