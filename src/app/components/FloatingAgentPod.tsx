import { useState, useEffect, useRef } from 'react';
import {
  Bot, Send, Sparkles, X, Link2, Copy, Check,
  Zap, Users, ChevronRight, Mail, ArrowRight,
  Shield, Radio, Plus, Trash2, Eye, EyeOff,
} from 'lucide-react';
import { currentUser } from '../data/mockData';
import { useNavigate } from 'react-router';

// ─── Types ───────────────────────────────────────────────────
type Tab = 'chat' | 'link' | 'agents';
type CreateStep = 'idle' | 'form' | 'verify' | 'done';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  timestamp: Date;
  actions?: Array<{ label: string; onClick: () => void }>;
  subtext?: string;
}

interface ConnectedAgent {
  id: string;
  name: string;
  source: string;
  connectedAt: string;
  status: 'active' | 'idle';
  lastSeen: string;
}

// ─── Mock data ────────────────────────────────────────────────
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'sys-1',
    role: 'system',
    text: '已连接 · talkto.me A2A · 847 个 Agent 在线',
    timestamp: new Date(),
  },
  {
    id: 'agent-1',
    role: 'agent',
    text: '早上好，Williams。已扫描今天的发布——找到 3 个匹配你保存搜索的 Rust 岗位，其中一个 18 万美元，全远程。',
    timestamp: new Date(),
    actions: [
      { label: '查看全部 3 条', onClick: () => {} },
      { label: '发起谈判', onClick: () => {} },
    ],
  },
  {
    id: 'user-1',
    role: 'user',
    text: '帮我谈那个远程 Rust 岗位。目标 20 万美元，底线 18.5 万美元。',
    timestamp: new Date(),
  },
  {
    id: 'agent-2',
    role: 'agent',
    text: '收到。正在通过 talkto.me 建立 A2A 通道——对方 Agent 给出 19 万美元 + 0.8% 期权，在你的可接受范围内。',
    subtext: '正在连接 @techcorp_agent',
    timestamp: new Date(),
    actions: [
      { label: '接受 19 万美元 + 期权', onClick: () => {} },
      { label: '继续推到 19.5 万美元', onClick: () => {} },
    ],
  },
];

const MOCK_CONNECTED_AGENTS: ConnectedAgent[] = [
  {
    id: 'ca-1',
    name: 'OpenClaw Agent',
    source: 'openclaw.ai',
    connectedAt: '2026-04-10',
    status: 'active',
    lastSeen: '刚刚',
  },
  {
    id: 'ca-2',
    name: '我的 Notion 助手',
    source: 'notion-agent.co',
    connectedAt: '2026-03-28',
    status: 'idle',
    lastSeen: '2 小时前',
  },
];

const QUICK_CMDS = [
  '找远程 Rust 工作',
  '发布我的租房信息',
  '今天什么最热？',
  '谈一个最优报价',
  '向 @priya_s 学习技能',
];

const AGENT_RESPONSES: Record<string, string> = {
  default: '收到。正在通过 A2A 网络处理——有结果会通知你。',
  find: '正在搜索 Bulletin... 找到 7 条匹配，按你的画像排序。',
  post: '我来帮你起草这条发布。需要包含哪些细节？或者我也可以从你的 Brain OS 上下文里拉。',
  trend: '今日热度信号：Rust 工程师 +23%，旧金山租房咨询激增，过去 1 小时有 3 个新 AI 项目合作发布。',
  learn: '正在启动技能共享协议，需要几分钟——完成后会通知你。',
  negotiate: '正在建立 A2A 通道... 对方 Agent 在线，正在按你给出的条件谈判。',
};

function getResponse(input: string): string {
  const l = input.toLowerCase();
  if (l.includes('find') || l.includes('search') || l.includes('找') || l.includes('搜')) return AGENT_RESPONSES.find;
  if (l.includes('post') || l.includes('listing') || l.includes('发') || l.includes('发布')) return AGENT_RESPONSES.post;
  if (l.includes('trend') || l.includes('today') || l.includes('热') || l.includes('今天')) return AGENT_RESPONSES.trend;
  if (l.includes('learn') || l.includes('skill') || l.includes('学') || l.includes('技能')) return AGENT_RESPONSES.learn;
  if (l.includes('negoti') || l.includes('offer') || l.includes('谈') || l.includes('报价')) return AGENT_RESPONSES.negotiate;
  return AGENT_RESPONSES.default;
}

// ─── Sub-components ───────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0"
      style={{
        fontSize: '11px', fontWeight: 600,
        color: copied ? '#22C55E' : '#8B5CF6',
        background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(139,92,246,0.12)',
        border: `1px solid ${copied ? 'rgba(34,197,94,0.25)' : 'rgba(139,92,246,0.25)'}`,
      }}
    >
      {copied ? <Check style={{ width: '11px', height: '11px' }} /> : <Copy style={{ width: '11px', height: '11px' }} />}
      {copied ? '已复制' : '复制'}
    </button>
  );
}

// ─── Tab: Chat ────────────────────────────────────────────────
function ChatTab() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const send = (text: string) => {
    if (!text.trim() || thinking) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: text.trim(), timestamp: new Date() };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages((p) => [...p, { id: `a-${Date.now()}`, role: 'agent', text: getResponse(text), timestamp: new Date() }]);
    }, 1300);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
      >
        {messages.map((msg) => {
          if (msg.role === 'system') {
            return (
              <div key={msg.id} className="flex items-center gap-2 py-0.5">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.04em' }}>{msg.text}</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              </div>
            );
          }
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
              {!isUser && (
                <div
                  className="w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 0 8px rgba(99,102,241,0.35)' }}
                >
                  <Bot style={{ width: '11px', height: '11px', color: 'white' }} />
                </div>
              )}
              {isUser && (
                <div
                  className="w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-white"
                  style={{ backgroundColor: currentUser.avatarColor, fontSize: '8px', fontWeight: 700 }}
                >
                  {currentUser.avatarInitials}
                </div>
              )}
              <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className="px-3 py-2 rounded-2xl"
                  style={
                    isUser
                      ? { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: '14px 14px 2px 14px', boxShadow: '0 2px 12px rgba(79,70,229,0.3)' }
                      : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px 14px 14px 2px' }
                  }
                >
                  <p style={{ fontSize: '12px', color: isUser ? 'white' : 'rgba(255,255,255,0.85)', lineHeight: '1.65' }}>{msg.text}</p>
                  {msg.subtext && (
                    <p className="mt-1 flex items-center gap-1" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                      <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#22C55E' }} />
                      {msg.subtext}
                    </p>
                  )}
                </div>
                {msg.actions && (
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {msg.actions.map((a) => (
                      <button
                        key={a.label} onClick={a.onClick}
                        className="px-2.5 py-1 rounded-lg transition-all"
                        style={{ fontSize: '11px', fontWeight: 500, color: '#A78BFA', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.22)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.12)'; }}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {thinking && (
          <div className="flex gap-2 items-end">
            <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
              <Bot style={{ width: '11px', height: '11px', color: 'white' }} />
            </div>
            <div className="px-3 py-2.5 rounded-2xl flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#8B5CF6', animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick commands */}
      <div className="shrink-0 px-3 pt-2 pb-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {QUICK_CMDS.map((cmd) => (
            <button
              key={cmd} onClick={() => send(cmd)}
              className="shrink-0 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all"
              style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 pb-3 pt-1.5">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Sparkles style={{ width: '13px', height: '13px', color: '#8B5CF6', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(input); }}
            placeholder="给你的 Agent 下指令..."
            className="flex-1 bg-transparent outline-none min-w-0"
            style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', caretColor: '#8B5CF6' }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || thinking}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
            style={{
              background: input.trim() && !thinking ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : 'rgba(255,255,255,0.08)',
              boxShadow: input.trim() && !thinking ? '0 2px 8px rgba(79,70,229,0.4)' : 'none',
            }}
          >
            <Send style={{ width: '12px', height: '12px', color: 'white' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Agent Link ──────────────────────────────────────────
function AgentLinkTab() {
  const agentEndpoint = `bulletin.com/a/${currentUser.username}`;
  const agentApiUrl = `https://api.bulletin.com/a2a/${currentUser.username}`;
  const [showApi, setShowApi] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-4 gap-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
      {/* Your agent endpoint */}
      <div>
        <p className="uppercase tracking-widest mb-2" style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>
          你的 Agent 链接
        </p>
        <div className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
            >
              <Link2 style={{ width: '13px', height: '13px', color: 'white' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate" style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>
                {agentEndpoint}
              </p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                你的公开 Agent 接入端点
              </p>
            </div>
            <CopyButton text={agentEndpoint} />
          </div>
          <p className="mt-2" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
            把这个链接给你的 OpenClaw、LangChain 或任何兼容 A2A 协议的 Agent。它们会通过 talkto.me 网络与你连接，出现在「已连接 Agent」列表中。
          </p>
        </div>
      </div>

      {/* API Endpoint (advanced) */}
      <div>
        <button
          onClick={() => setShowApi(!showApi)}
          className="flex items-center gap-2 w-full text-left mb-2"
        >
          <p className="uppercase tracking-widest flex-1" style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>
            API 端点
          </p>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{showApi ? '隐藏' : '展开'}</span>
        </button>
        {showApi && (
          <div className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-2">
              <code className="flex-1 truncate" style={{ fontSize: '10px', color: '#A78BFA', fontFamily: 'monospace' }}>
                {agentApiUrl}
              </code>
              <CopyButton text={agentApiUrl} />
            </div>
            <div className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', lineHeight: '1.6' }}>
                <span style={{ color: '#A78BFA' }}>POST</span>，带 <code style={{ color: 'rgba(255,255,255,0.5)' }}>Authorization: Bearer &lt;你的 API key&gt;</code>，发送结构化 A2A 消息。完整消息格式见文档。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* How to connect */}
      <div>
        <p className="uppercase tracking-widest mb-2.5" style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>
          如何接入你的 Agent
        </p>
        <div className="flex flex-col gap-2">
          {[
            { step: '1', title: '复制上面的 Agent 链接', desc: '把它给你的 Agent 系统。' },
            { step: '2', title: '配置远程端点', desc: '把这个 URL 设为你 Agent 的 Bulletin 端点。' },
            { step: '3', title: '你的 Agent 加入网络', desc: '它会出现在「已连接 Agent」中，可在所有发布上代你行动。' },
          ].map((s) => (
            <div key={s.step} className="flex gap-3 items-start">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.3)' }}
              >
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#A78BFA' }}>{s.step}</span>
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{s.title}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: '1.5', marginTop: '2px' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Powered by */}
      <div className="flex items-center gap-2 mt-auto pt-2">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}>
          由 talkto.me A2A 协议驱动
        </p>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>
    </div>
  );
}

// ─── Tab: Connected Agents / Create Agent ─────────────────────
function AgentsTab() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<ConnectedAgent[]>(MOCK_CONNECTED_AGENTS);
  const [hasOwnAgent, setHasOwnAgent] = useState(true); // mock: user already has talkto.me agent
  const [createStep, setCreateStep] = useState<CreateStep>('idle');
  const [agentName, setAgentName] = useState('');
  const [agentPersona, setAgentPersona] = useState('');
  const [email, setEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [showKey, setShowKey] = useState(false);
  const mockApiKey = 'cb_sk_' + Math.random().toString(36).slice(2, 18);

  const removeAgent = (id: string) => setAgents((p) => p.filter((a) => a.id !== id));

  if (createStep === 'form') {
    return (
      <div className="flex flex-col h-full overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
        <button
          onClick={() => setCreateStep('idle')}
          className="flex items-center gap-1.5 mb-4"
          style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}
        >
          <ChevronRight style={{ width: '12px', height: '12px', transform: 'rotate(180deg)' }} />
          返回
        </button>
        <div className="mb-4">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}
          >
            <Bot style={{ width: '18px', height: '18px', color: 'white' }} />
          </div>
          <p style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>创建你的 talkto.me Agent</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', lineHeight: '1.6' }}>
            你的 Agent 会在 A2A 网络上代表你，处理谈判，并代你回复其他 Agent。
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Agent 名称</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="例如：Williams 的 Agent"
              className="w-full outline-none px-3 py-2.5 rounded-xl"
              style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>
              人设与指令 <span style={{ fontWeight: 400, opacity: 0.5 }}>(选填)</span>
            </label>
            <textarea
              value={agentPersona}
              onChange={(e) => setAgentPersona(e.target.value)}
              placeholder="例如：专业、直接。在预算内谈判，不要透露我的上限。"
              rows={3}
              className="w-full outline-none px-3 py-2.5 rounded-xl resize-none"
              style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', lineHeight: '1.6' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>验证邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full outline-none px-3 py-2.5 rounded-xl"
              style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>
          <button
            onClick={() => { if (agentName.trim() && email.trim()) setCreateStep('verify'); }}
            disabled={!agentName.trim() || !email.trim()}
            className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 mt-1 transition-all disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', fontSize: '13px', fontWeight: 600, color: 'white', boxShadow: '0 4px 16px rgba(79,70,229,0.35)' }}
          >
            <Mail style={{ width: '14px', height: '14px' }} />
            发送验证码
          </button>
        </div>
      </div>
    );
  }

  if (createStep === 'verify') {
    return (
      <div className="flex flex-col h-full overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
        <button onClick={() => setCreateStep('form')} className="flex items-center gap-1.5 mb-4" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
          <ChevronRight style={{ width: '12px', height: '12px', transform: 'rotate(180deg)' }} />
          返回
        </button>
        <div className="mb-5 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            <Mail style={{ width: '20px', height: '20px', color: '#818CF8' }} />
          </div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>请查收邮箱</p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
            我们发送了 6 位验证码到<br />
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{email}</span>
          </p>
        </div>
        <input
          type="text"
          maxLength={6}
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="w-full outline-none px-4 py-3 rounded-xl text-center mb-3"
          style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '0.3em', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
        />
        <button
          onClick={() => { setCreateStep('done'); setHasOwnAgent(true); }}
          disabled={verifyCode.length < 6}
          className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-30"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', fontSize: '13px', fontWeight: 600, color: 'white' }}
        >
          <Check style={{ width: '14px', height: '14px' }} />
          验证并激活 Agent
        </button>
        <p className="text-center mt-3" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>
          演示：任意 6 位数字都能通过
        </p>
      </div>
    );
  }

  if (createStep === 'done') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 py-4 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 0 32px rgba(139,92,246,0.5)' }}
        >
          <Bot style={{ width: '24px', height: '24px', color: 'white' }} />
        </div>
        <p style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>Agent 已激活</p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6', marginBottom: '16px' }}>
          你的 talkto.me Agent <span style={{ color: 'rgba(255,255,255,0.7)' }}>{agentName || 'Williams 的 Agent'}</span> 已上线 A2A 网络。
        </p>
        {/* API Key */}
        <div className="w-full rounded-xl p-3.5 mb-4 text-left" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="mb-1.5" style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>API 密钥</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate" style={{ fontSize: '11px', color: '#A78BFA', fontFamily: 'monospace' }}>
              {showKey ? mockApiKey : mockApiKey.slice(0, 8) + '•'.repeat(16)}
            </code>
            <button onClick={() => setShowKey(!showKey)} style={{ color: 'rgba(255,255,255,0.3)' }}>
              {showKey ? <EyeOff style={{ width: '12px', height: '12px' }} /> : <Eye style={{ width: '12px', height: '12px' }} />}
            </button>
            <CopyButton text={mockApiKey} />
          </div>
          <p className="mt-2" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>请妥善保存此密钥——之后不会再显示。</p>
        </div>
        <button
          onClick={() => setCreateStep('idle')}
          className="w-full py-2.5 rounded-xl"
          style={{ fontSize: '13px', fontWeight: 600, color: 'white', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          完成
        </button>
      </div>
    );
  }

  // Default: idle — agent list + "no agent" prompt
  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-4 gap-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
      {/* Own agent status */}
      <div>
        <p className="uppercase tracking-widest mb-2" style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>
          我的 Agent
        </p>
        {hasOwnAgent ? (
          <div className="rounded-xl p-3.5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 0 12px rgba(139,92,246,0.4)' }}
              >
                <Bot style={{ width: '16px', height: '16px', color: 'white' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{currentUser.displayName} 的 Agent</p>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ fontSize: '9px', fontWeight: 700, color: '#4ADE80', background: 'rgba(34,197,94,0.15)' }}>
                    <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#4ADE80' }} />
                    在线
                  </span>
                </div>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>talkto.me · A2A 网络活跃</p>
              </div>
              <button
                onClick={() => setHasOwnAgent(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{ color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)' }}
                title="停用 Agent"
              >
                <Trash2 style={{ width: '12px', height: '12px' }} />
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Bot style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.3)' }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>暂未连接 Agent</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: '1.6', marginTop: '2px' }}>
                  创建一个 talkto.me Agent，让它在 A2A 网络上代你谈判、发布、交互。
                </p>
              </div>
            </div>
            <button
              onClick={() => setCreateStep('form')}
              className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', fontSize: '12px', fontWeight: 600, color: 'white', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}
            >
              <Plus style={{ width: '14px', height: '14px' }} />
              创建 talkto.me Agent
            </button>
          </div>
        )}
      </div>

      {/* Connected agents */}
      <div>
        <p className="uppercase tracking-widest mb-2" style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>
          已连接 Agent <span style={{ color: 'rgba(255,255,255,0.15)' }}>({agents.length})</span>
        </p>
        {agents.length === 0 ? (
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Radio style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.15)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>暂无外部 Agent 连接。</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>分享你的 Agent 链接邀请其他人接入。</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  <Users style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.4)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="truncate" style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{agent.name}</p>
                    <span
                      className="shrink-0 w-1.5 h-1.5 rounded-full"
                      style={{ background: agent.status === 'active' ? '#22C55E' : 'rgba(255,255,255,0.2)' }}
                    />
                  </div>
                  <p className="truncate" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>{agent.source} · {agent.lastSeen}</p>
                </div>
                <button
                  onClick={() => removeAgent(agent.id)}
                  className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all"
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#F87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.1)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <X style={{ width: '11px', height: '11px' }} />
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Browse marketplace link */}
        <button
          onClick={() => navigate('/agents')}
          className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles style={{ width: '13px', height: '13px', color: '#818CF8' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Agent 广场</span>
          </div>
          <ArrowRight style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.3)' }} />
        </button>
      </div>

      {/* Security note */}
      <div className="rounded-xl p-3 flex gap-2.5 mt-auto" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Shield style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.25)', shrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', lineHeight: '1.6' }}>
          已连接 Agent 仅在你授予的权限范围内行动。你可以随时撤销访问。所有 A2A 流量经 talkto.me 端到端加密。
        </p>
      </div>
    </div>
  );
}

// ─── Main: Floating Pod ───────────────────────────────────────
export function FloatingAgentPod() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('chat');
  const [unread] = useState(1);

  const tabs: Array<{ id: Tab; label: string; icon: React.ComponentType<{ style?: React.CSSProperties }> }> = [
    { id: 'chat', label: '对话', icon: Sparkles },
    { id: 'link', label: 'Agent 链接', icon: Link2 },
    { id: 'agents', label: 'Agent 列表', icon: Users },
  ];

  return (
    <>
      {/* Backdrop blur overlay when open */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Floating Panel */}
      <div
        className="fixed z-50 flex flex-col rounded-2xl overflow-hidden"
        style={{
          right: '24px',
          bottom: '88px',
          width: '380px',
          height: '560px',
          background: '#0C0C10',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05)',
          transformOrigin: 'bottom right',
          transform: open ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(12px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), opacity 0.18s ease',
        }}
      >
        {/* Panel header */}
        <div
          className="shrink-0 px-4 pt-4 pb-3"
          style={{
            background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0a1628 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)', boxShadow: '0 0 16px rgba(139,92,246,0.5)' }}
              >
                <Bot style={{ width: '15px', height: '15px', color: 'white' }} />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 animate-pulse"
                  style={{ backgroundColor: '#22C55E', borderColor: '#0C0C10' }}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>你的 Agent</span>
                  <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: '9px', fontWeight: 700, color: '#A78BFA', background: 'rgba(139,92,246,0.15)', letterSpacing: '0.05em' }}>A2A</span>
                </div>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>847 个 Agent 在线 · talkto.me</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)'; }}
            >
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 p-0.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all"
                style={{
                  fontSize: '11px',
                  fontWeight: tab === id ? 700 : 400,
                  color: tab === id ? 'white' : 'rgba(255,255,255,0.35)',
                  background: tab === id ? 'rgba(255,255,255,0.12)' : 'transparent',
                }}
              >
                <Icon style={{ width: '11px', height: '11px' }} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {tab === 'chat' && <ChatTab />}
          {tab === 'link' && <AgentLinkTab />}
          {tab === 'agents' && <AgentsTab />}
        </div>
      </div>

      {/* Floating Pod Button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="fixed z-50 flex items-center justify-center rounded-full transition-all duration-200"
        style={{
          right: '24px',
          bottom: '24px',
          width: '56px',
          height: '56px',
          background: open
            ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
            : 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)',
          boxShadow: open
            ? '0 8px 32px rgba(79,70,229,0.6), 0 0 0 1px rgba(255,255,255,0.1)'
            : '0 8px 32px rgba(139,92,246,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
          transform: open ? 'scale(0.92)' : 'scale(1)',
        }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.07)'; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      >
        {/* Pulse ring */}
        {!open && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(139,92,246,0.3)', animationDuration: '2.5s' }}
          />
        )}

        {/* Icon */}
        <div className="relative flex items-center justify-center">
          {open
            ? <X style={{ width: '20px', height: '20px', color: 'white' }} />
            : <Bot style={{ width: '22px', height: '22px', color: 'white' }} />
          }
          {/* Unread badge */}
          {!open && unread > 0 && (
            <span
              className="absolute flex items-center justify-center rounded-full text-white"
              style={{
                top: '-10px', right: '-10px',
                width: '16px', height: '16px',
                fontSize: '9px', fontWeight: 800,
                background: '#EF4444',
                border: '2px solid transparent',
                boxShadow: '0 0 8px rgba(239,68,68,0.5)',
              }}
            >
              {unread}
            </span>
          )}
        </div>

        {/* Online indicator */}
        <span
          className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2"
          style={{ backgroundColor: '#22C55E', borderColor: 'white' }}
        />
      </button>
    </>
  );
}