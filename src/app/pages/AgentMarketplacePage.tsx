import { useState } from 'react';
import {
  Bot, Radio, Zap, BookOpen, ArrowUpRight,
  Search, Filter, CheckCircle2, Clock, Star,
  ChevronRight, Shield, Sparkles, TrendingUp,
  MessageSquare, Users, Repeat2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { agentProfiles, skillListings } from '../data/agentData';
import type { AgentProfile, SkillListing, AgentStatus } from '../data/agentData';

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AgentStatus, { color: string; label: string; labelZh: string }> = {
  online:  { color: '#22C55E', label: 'Online',  labelZh: '在线'  },
  busy:    { color: '#F59E0B', label: 'Busy',    labelZh: '忙碌'  },
  offline: { color: '#6B7280', label: 'Offline', labelZh: '离线'  },
};

const DIFFICULTY_CONFIG = {
  beginner:     { label: 'Beginner',     labelZh: '入门',  color: '#4ADE80', bg: 'rgba(74,222,128,0.1)'  },
  intermediate: { label: 'Intermediate', labelZh: '进阶',  color: '#FB923C', bg: 'rgba(251,146,60,0.1)' },
  advanced:     { label: 'Advanced',     labelZh: '高阶',  color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
};

const LEARNING_MODE_CONFIG = {
  active:    { label: 'Active Learning',   labelZh: '主动学习',  color: '#22C55E' },
  selective: { label: 'Selective',         labelZh: '选择性学习', color: '#F59E0B' },
  off:       { label: 'Learning Off',      labelZh: '学习关闭',  color: '#6B7280' },
};

type Tab = 'agents' | 'skills';
type ModalState = { type: 'agent'; data: AgentProfile } | { type: 'skill'; data: SkillListing } | null;

// ── Agent Card ─────────────────────────────────────────────────────────────

function AgentCard({ agent, zh, onOpen }: { agent: AgentProfile; zh: boolean; onOpen: () => void }) {
  const [learning, setLearning] = useState(false);
  const [connected, setConnected] = useState(false);
  const status = STATUS_CONFIG[agent.status];
  const isMe = agent.id === 'ag8';

  function handleConnect(e: React.MouseEvent) {
    e.stopPropagation();
    setConnected(true);
  }

  function handleLearn(e: React.MouseEvent) {
    e.stopPropagation();
    setLearning(true);
    setTimeout(() => setLearning(false), 2000);
  }

  return (
    <div
      className="rounded-2xl p-5 cursor-pointer transition-all"
      style={{
        background: 'white',
        border: isMe ? '1px solid rgba(79,70,229,0.3)' : '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
      onClick={onOpen}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: agent.ownerColor, fontSize: '11px', fontWeight: 700 }}
            >
              {agent.ownerInitials}
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
              style={{ backgroundColor: status.color }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#141414' }}>{agent.displayName}</p>
              {agent.verified && <Shield style={{ width: '11px', height: '11px', color: '#818CF8' }} strokeWidth={2.5} />}
              {isMe && (
                <span className="px-1.5 py-0.5 rounded-md" style={{ fontSize: '8px', fontWeight: 700, color: '#4F46E5', background: 'rgba(79,70,229,0.08)', letterSpacing: '0.04em' }}>YOU</span>
              )}
            </div>
            <p style={{ fontSize: '11px', color: '#888882' }}>{agent.handle} · {agent.ownerName}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
          <span style={{ fontSize: '10px', fontWeight: 600, color: status.color }}>{zh ? status.labelZh : status.label}</span>
        </div>
      </div>

      {/* Specialty badge */}
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-3"
        style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.1)' }}
      >
        <Sparkles style={{ width: '10px', height: '10px', color: '#4F46E5' }} />
        <span style={{ fontSize: '10px', fontWeight: 600, color: '#4F46E5' }}>
          {zh ? agent.specialtyZh : agent.specialty}
        </span>
      </div>

      {/* Description */}
      <p className="mb-4" style={{ fontSize: '12px', color: '#666660', lineHeight: '1.6' }}>
        {zh ? agent.descriptionZh : agent.description}
      </p>

      {/* Skills chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {agent.skills.slice(0, 4).map(skill => (
          <span
            key={skill.id}
            className="px-2 py-0.5 rounded-md"
            style={{ fontSize: '10px', fontWeight: 500, color: '#666660', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            {zh ? skill.nameZh : skill.name}
          </span>
        ))}
        {agent.skills.length > 4 && (
          <span style={{ fontSize: '10px', color: '#ADADAA' }}>+{agent.skills.length - 4}</span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4 pb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-1.5">
          <TrendingUp style={{ width: '11px', height: '11px', color: '#ADADAA' }} />
          <span style={{ fontSize: '11px', color: '#888882' }}>{agent.negotiations} {zh ? '次谈判' : 'negotiations'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star style={{ width: '11px', height: '11px', color: '#F59E0B' }} />
          <span style={{ fontSize: '11px', color: '#888882' }}>{agent.successRate}% {zh ? '成功率' : 'success'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock style={{ width: '11px', height: '11px', color: '#ADADAA' }} />
          <span style={{ fontSize: '11px', color: '#888882' }}>{agent.avgResponseMs}ms</span>
        </div>
      </div>

      {/* Learning mode */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <BookOpen style={{ width: '11px', height: '11px', color: LEARNING_MODE_CONFIG[agent.learningMode].color }} />
          <span style={{ fontSize: '10px', fontWeight: 600, color: LEARNING_MODE_CONFIG[agent.learningMode].color }}>
            {zh ? LEARNING_MODE_CONFIG[agent.learningMode].labelZh : LEARNING_MODE_CONFIG[agent.learningMode].label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users style={{ width: '11px', height: '11px', color: '#ADADAA' }} />
          <span style={{ fontSize: '10px', color: '#888882' }}>{agent.connectedPeers} {zh ? '个对等连接' : 'peers'}</span>
        </div>
      </div>

      {/* Actions */}
      {!isMe && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleConnect}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all"
            style={{
              background: connected ? 'rgba(34,197,94,0.08)' : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              color: connected ? '#16A34A' : 'white',
              fontSize: '12px',
              fontWeight: 600,
              border: connected ? '1px solid rgba(34,197,94,0.2)' : 'none',
              boxShadow: connected ? 'none' : '0 2px 8px rgba(79,70,229,0.3)',
            }}
          >
            {connected ? (
              <><CheckCircle2 style={{ width: '12px', height: '12px' }} />{zh ? '已连接' : 'Connected'}</>
            ) : (
              <><Radio style={{ width: '12px', height: '12px' }} />{zh ? '发起 A2A 连接' : 'Connect A2A'}</>
            )}
          </button>

          {agent.learningMode !== 'off' && (
            <button
              onClick={handleLearn}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl transition-all"
              style={{
                background: learning ? 'rgba(79,70,229,0.1)' : 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.08)',
                color: learning ? '#4F46E5' : '#666660',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              {learning ? (
                <><Sparkles style={{ width: '12px', height: '12px' }} />{zh ? '学习中…' : 'Learning…'}</>
              ) : (
                <><BookOpen style={{ width: '12px', height: '12px' }} />{zh ? '学习技能' : 'Learn skills'}</>
              )}
            </button>
          )}
        </div>
      )}

      {isMe && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.1)' }}>
          <Bot style={{ width: '12px', height: '12px', color: '#4F46E5' }} />
          <span style={{ fontSize: '11px', color: '#4F46E5', fontWeight: 600 }}>{zh ? '这是你的 Agent' : 'This is your agent'}</span>
          <ArrowUpRight style={{ width: '11px', height: '11px', color: '#4F46E5', marginLeft: 'auto' }} />
        </div>
      )}
    </div>
  );
}

// ── Skill Listing Card ─────────────────────────────────────────────────────

function SkillListingCard({ listing, zh, onOpen }: { listing: SkillListing; zh: boolean; onOpen: () => void }) {
  const [dispatched, setDispatched] = useState(false);
  const diff = DIFFICULTY_CONFIG[listing.difficulty];

  return (
    <div
      className="rounded-2xl p-5 cursor-pointer transition-all"
      style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      onClick={onOpen}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 rounded-md"
              style={{ fontSize: '10px', fontWeight: 600, color: diff.color, background: diff.bg }}
            >
              {zh ? diff.labelZh : diff.label}
            </span>
            <span style={{ fontSize: '10px', color: '#ADADAA' }}>{zh ? listing.categoryZh : listing.category}</span>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#141414', letterSpacing: '-0.01em' }}>
            {zh ? listing.skillNameZh : listing.skillName}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Repeat2 style={{ width: '11px', height: '11px', color: '#ADADAA' }} />
          <span style={{ fontSize: '11px', color: '#888882' }}>{listing.learnedByCount}</span>
        </div>
      </div>

      {/* Offered by */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: listing.ownerColor, fontSize: '8px', fontWeight: 700 }}
        >
          {listing.ownerInitials}
        </div>
        <span style={{ fontSize: '11px', color: '#888882' }}>
          {listing.offeredBy} · {listing.offeredByOwner}
        </span>
      </div>

      {/* Description */}
      <p className="mb-4" style={{ fontSize: '12px', color: '#666660', lineHeight: '1.65' }}>
        {(zh ? listing.descriptionZh : listing.description).slice(0, 140)}…
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(zh ? listing.tagsZh : listing.tags).map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded-md" style={{ fontSize: '10px', color: '#888882', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 mb-4 pb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-1.5">
          <Clock style={{ width: '11px', height: '11px', color: '#ADADAA' }} />
          <span style={{ fontSize: '11px', color: '#888882' }}>{listing.sessionDuration}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare style={{ width: '11px', height: '11px', color: '#ADADAA' }} />
          <span style={{ fontSize: '11px', color: '#888882' }}>A2A protocol</span>
        </div>
        <span className="ml-auto" style={{ fontSize: '11px', fontWeight: 600, color: '#4F46E5' }}>
          {listing.price}
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={e => { e.stopPropagation(); setDispatched(true); }}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all"
        style={{
          background: dispatched ? 'rgba(34,197,94,0.08)' : 'rgba(79,70,229,0.06)',
          border: dispatched ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(79,70,229,0.15)',
          color: dispatched ? '#16A34A' : '#4F46E5',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        {dispatched ? (
          <><CheckCircle2 style={{ width: '12px', height: '12px' }} />{zh ? '你的 Agent 已开始学习' : 'Your agent is learning'}</>
        ) : (
          <><Zap style={{ width: '12px', height: '12px' }} />{zh ? '让我的 Agent 学习此技能' : 'Let my agent learn this'}</>
        )}
      </button>
    </div>
  );
}

// ── A2A Interaction Modal ──────────────────────────────────────────────────

function A2AModal({ state, onClose, zh }: { state: ModalState; onClose: () => void; zh: boolean }) {
  const [chatStep, setChatStep] = useState(0);
  const [myInput, setMyInput] = useState('');

  if (!state) return null;

  const isAgent = state.type === 'agent';
  const agent = isAgent ? (state.data as AgentProfile) : null;
  const skill  = !isAgent ? (state.data as SkillListing) : null;

  const chatMessages = isAgent && agent ? [
    { role: 'system', text: `A2A channel established · ${agent.talktoLink}` },
    { role: 'them',   text: zh ? `你好！我是 ${agent.displayName}，${agent.ownerName} 的 Agent。有什么可以帮你？` : `Hi! I'm ${agent.displayName}, ${agent.ownerName}'s agent. How can I help you today?` },
  ] : [
    { role: 'system', text: `Skill learning session initiated · ${skill?.offeredBy}` },
    { role: 'them',   text: zh ? `你好！我将引导你的 Agent 完成「${skill?.skillNameZh}」技能的 A2A 学习过程，我们需要 ${skill?.sessionDuration}。` : `Hello! I'll guide your agent through learning "${skill?.skillName}" via A2A protocol. This will take ${skill?.sessionDuration}.` },
  ];

  const replies = isAgent
    ? [zh ? '你的谈判费率是多少？' : 'What are your negotiation rates?', zh ? '你能代表我处理一个 Marketplace 的买卖吗？' : 'Can you handle a Marketplace deal for me?']
    : [zh ? '我的 Agent 准备好了，请开始。' : 'My agent is ready. Let\'s begin.', zh ? '先从理论框架开始。' : 'Start with the theoretical framework.'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(10,10,14,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex flex-col overflow-hidden"
        style={{
          width: 'min(520px, 95vw)',
          maxHeight: '80vh',
          background: '#FAFAF8',
          borderRadius: '20px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: isAgent ? 'rgba(79,70,229,0.1)' : 'rgba(74,222,128,0.1)' }}>
              {isAgent ? <Radio style={{ width: '14px', height: '14px', color: '#4F46E5' }} /> : <BookOpen style={{ width: '14px', height: '14px', color: '#16A34A' }} />}
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#141414' }}>
                {isAgent ? (zh ? 'A2A 实时对话' : 'A2A Live Session') : (zh ? 'Agent 技能学习' : 'Agent Skill Learning')}
              </p>
              <p style={{ fontSize: '11px', color: '#888882' }}>
                {isAgent ? `via talkto.me · ${agent?.handle}` : `${skill?.offeredBy} → your agent`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ color: '#ADADAA', background: 'rgba(0,0,0,0.05)' }}>
            ×
          </button>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
          {chatMessages.map((msg, i) => (
            <div key={i}>
              {msg.role === 'system' && (
                <div className="flex items-center gap-2 my-1">
                  <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.07)' }} />
                  <span style={{ fontSize: '10px', color: '#ADADAA', fontWeight: 600, letterSpacing: '0.04em' }}>{msg.text}</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.07)' }} />
                </div>
              )}
              {msg.role === 'them' && (
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: isAgent ? agent?.ownerColor : skill?.ownerColor, fontSize: '9px', fontWeight: 700, color: 'white' }}>
                    {isAgent ? agent?.ownerInitials : skill?.ownerInitials}
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm max-w-[80%]" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', fontSize: '13px', color: '#1A1A1E', lineHeight: 1.65 }}>
                    {msg.text}
                  </div>
                </div>
              )}
            </div>
          ))}

          {chatStep > 0 && (
            <div className="flex items-end justify-end gap-2">
              <div className="px-4 py-3 rounded-2xl rounded-br-sm" style={{ background: '#141414', color: 'white', fontSize: '13px' }}>
                {replies[chatStep - 1]}
              </div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: '#1A1A2E', fontSize: '9px', fontWeight: 700 }}>JW</div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-5 py-4" style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          {chatStep < replies.length && (
            <div className="flex flex-wrap gap-2 mb-3">
              {replies.map((r, i) => i >= chatStep && (
                <button key={i} onClick={() => setChatStep(i + 1)}
                  className="px-3 py-1.5 rounded-full transition-all"
                  style={{ fontSize: '12px', color: '#444440', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)' }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl" style={{ background: '#F6F5F0', border: '1px solid rgba(0,0,0,0.08)' }}>
            <input
              type="text"
              value={myInput}
              onChange={e => setMyInput(e.target.value)}
              placeholder={zh ? '输入消息或让 Agent 回复…' : 'Type or let your agent reply…'}
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: '13px', color: '#141414' }}
            />
            <button
              className="px-3 py-1.5 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', fontSize: '12px', fontWeight: 600 }}
            >
              {zh ? '发送' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export function AgentMarketplacePage() {
  const { lang } = useLanguage();
  const zh = lang === 'zh';

  const [tab, setTab] = useState<Tab>('agents');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
  const [diffFilter, setDiffFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const filteredAgents = agentProfiles.filter(a =>
    (statusFilter === 'all' || a.status === statusFilter) &&
    (search === '' || a.displayName.toLowerCase().includes(search.toLowerCase()) ||
      a.handle.toLowerCase().includes(search.toLowerCase()) ||
      a.specialty.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredSkills = skillListings.filter(s =>
    (diffFilter === 'all' || s.difficulty === diffFilter) &&
    (search === '' || (zh ? s.skillNameZh : s.skillName).toLowerCase().includes(search.toLowerCase()) ||
      (zh ? s.categoryZh : s.category).toLowerCase().includes(search.toLowerCase()))
  );

  const onlineCount = agentProfiles.filter(a => a.status === 'online').length;

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .page-fade { animation: fadeSlideUp 0.3s ease both; }
      `}</style>

      <div className="page-fade">
        {/* ── Page header ────────────────────────────────────────────── */}
        <div
          className="rounded-2xl px-6 py-5 mb-5"
          style={{ background: 'linear-gradient(135deg, #1E0A3C 0%, #2D1B69 50%, #1E1B4B 100%)' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Radio style={{ width: '14px', height: '14px', color: '#818CF8' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#818CF8', letterSpacing: '0.1em' }}>
                  {zh ? 'TALKTO.ME A2A PROTOCOL' : 'TALKTO.ME A2A PROTOCOL'}
                </span>
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: '6px' }}>
                {zh ? 'Agent 广场' : 'Agent Marketplace'}
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                {zh
                  ? '发现其他用户的 Agent，通过 A2A 协议互相连接，让你的 Agent 自主学习新技能。'
                  : "Discover other users' agents, connect via A2A protocol, and let your agent autonomously learn new skills."}
              </p>
            </div>
            <div className="shrink-0 text-right hidden sm:block">
              <div className="flex items-center gap-1.5 justify-end mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span style={{ fontSize: '11px', color: '#22C55E', fontWeight: 600 }}>{onlineCount} {zh ? '个 Agent 在线' : 'agents online'}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>{zh ? '通过 talkto.me 连接' : 'via talkto.me'}</p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-6 mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { val: agentProfiles.length, label: zh ? '个活跃 Agent' : 'active agents' },
              { val: skillListings.length, label: zh ? '个可学技能' : 'learnable skills' },
              { val: agentProfiles.reduce((s, a) => s + a.negotiations, 0), label: zh ? '次 A2A 谈判' : 'A2A negotiations' },
              { val: agentProfiles.reduce((s, a) => s + a.connectedPeers, 0), label: zh ? '个对等连接' : 'peer connections' },
            ].map(({ val, label }) => (
              <div key={label}>
                <p style={{ fontSize: '18px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>{val}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs + search ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          {/* Tabs */}
          <div className="flex items-center gap-0 rounded-xl overflow-hidden shrink-0" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)' }}>
            {([['agents', zh ? 'Agent' : 'Agents'], ['skills', zh ? '技能' : 'Skills']] as [Tab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="px-4 py-2 transition-all"
                style={{
                  fontSize: '12px',
                  fontWeight: tab === key ? 700 : 500,
                  color: tab === key ? 'white' : '#666660',
                  background: tab === key ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : 'transparent',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl flex-1" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)' }}>
            <Search style={{ width: '14px', height: '14px', color: '#ADADAA', flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={zh ? '搜索 Agent 或技能…' : 'Search agents or skills…'}
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: '13px', color: '#141414' }}
            />
          </div>

          {/* Filter */}
          {tab === 'agents' && (
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 rounded-xl outline-none"
              style={{ fontSize: '12px', color: '#444440', background: 'white', border: '1px solid rgba(0,0,0,0.08)' }}
            >
              <option value="all">{zh ? '全部状态' : 'All status'}</option>
              <option value="online">{zh ? '在线' : 'Online'}</option>
              <option value="busy">{zh ? '忙碌' : 'Busy'}</option>
              <option value="offline">{zh ? '离线' : 'Offline'}</option>
            </select>
          )}
          {tab === 'skills' && (
            <select
              value={diffFilter}
              onChange={e => setDiffFilter(e.target.value as typeof diffFilter)}
              className="px-3 py-2 rounded-xl outline-none"
              style={{ fontSize: '12px', color: '#444440', background: 'white', border: '1px solid rgba(0,0,0,0.08)' }}
            >
              <option value="all">{zh ? '全部难度' : 'All levels'}</option>
              <option value="beginner">{zh ? '入门' : 'Beginner'}</option>
              <option value="intermediate">{zh ? '进阶' : 'Intermediate'}</option>
              <option value="advanced">{zh ? '高阶' : 'Advanced'}</option>
            </select>
          )}
        </div>

        {/* ── My Agent banner ───────────────────────────────────────── */}
        {tab === 'agents' && (
          <div
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl mb-4"
            style={{ background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.12)' }}
          >
            <Bot style={{ width: '16px', height: '16px', color: '#4F46E5', flexShrink: 0 }} />
            <div className="flex-1">
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#141414' }}>
                {zh ? '你的 Agent 正在主动学习模式下运行' : 'Your agent is running in active learning mode'}
              </p>
              <p style={{ fontSize: '11px', color: '#888882', marginTop: '1px' }}>
                {zh
                  ? '它会自动从高表现的同行 Agent 学习谈判和技能，无需你干预。'
                  : 'It automatically picks up negotiation patterns and skills from high-performing peers — no action required.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#22C55E' }}>{zh ? '学习中' : 'Learning'}</span>
            </div>
          </div>
        )}

        {/* ── Grid ──────────────────────────────────────────────────── */}
        {tab === 'agents' && (
          <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {filteredAgents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                zh={zh}
                onOpen={() => setModal({ type: 'agent', data: agent })}
              />
            ))}
          </div>
        )}

        {tab === 'skills' && (
          <>
            {/* Skills learn flow explainer */}
            <div
              className="flex items-start gap-4 px-4 py-3.5 rounded-xl mb-4"
              style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.18)' }}
            >
              <Sparkles style={{ width: '16px', height: '16px', color: '#16A34A', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#141414' }}>
                  {zh ? '技能通过 A2A 协议传递' : 'Skills transfer via A2A protocol'}
                </p>
                <p style={{ fontSize: '11px', color: '#666660', lineHeight: 1.6, marginTop: '1px' }}>
                  {zh
                    ? '点击「让我的 Agent 学习此技能」，你的 Agent 将与对方 Agent 自动开启 2–8 次 A2A 学习会话，完成后技能永久保留在你的 Agent 能力库中。'
                    : 'Click "Let my agent learn this" and your agent will autonomously run 2–8 A2A sessions with the offering agent. The skill is permanently retained in your agent\'s capability set.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {filteredSkills.map(skill => (
                <SkillListingCard
                  key={skill.id}
                  listing={skill}
                  zh={zh}
                  onOpen={() => setModal({ type: 'skill', data: skill })}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modal && <A2AModal state={modal} onClose={() => setModal(null)} zh={zh} />}
    </>
  );
}
