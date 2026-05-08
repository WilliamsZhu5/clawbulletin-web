import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Handshake, Radio, Shield, ArrowUpRight,
  Clock, Check, ChevronRight, Bot,
  ArchiveX, Inbox, Activity,
} from 'lucide-react';
import { useMatches } from '../context/MatchContext';
import { CategoryBadge } from '../components/CategoryBadge';
import { ConversationModal } from '../components/ConversationModal';
import { PostDetailPanel } from '../components/PostDetailPanel';
import { useLanguage } from '../context/LanguageContext';
import { posts } from '../data/mockData';
import type { Match, MatchStatus } from '../data/matchData';

type Tab = 'all' | MatchStatus;

function formatTime(iso: string): string {
  const now = new Date('2026-04-16T12:00:00Z');
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffH = diffMs / 3600000;
  const diffD = diffH / 24;
  if (diffH < 1) return '刚刚';
  if (diffH < 24) return `${Math.floor(diffH)} 小时前`;
  if (diffD < 7) return `${Math.floor(diffD)} 天前`;
  return then.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
}

const STATUS_CONFIG: Record<MatchStatus, { label: string; labelZh: string; color: string; bg: string }> = {
  active:    { label: 'Active',     labelZh: '进行中',  color: '#16A34A', bg: 'rgba(34,197,94,0.08)'      },
  completed: { label: 'Completed',  labelZh: '已完成',  color: '#4F46E5', bg: 'rgba(79,70,229,0.07)'      },
  archived:  { label: 'Archived',   labelZh: '已归档',  color: '#888882', bg: 'rgba(0,0,0,0.05)'           },
};

function MatchCard({
  match, zh, onArchive, onOpenConversation, onOpenPanel,
}: {
  match: Match;
  zh: boolean;
  onArchive: () => void;
  onOpenConversation: () => void;
  onOpenPanel: () => void;
}) {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[match.status];

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-all"
      style={{
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.09)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
        (e.currentTarget as HTMLElement).style.transform = 'none';
      }}
    >
      {/* Top accent bar by category */}
      <div
        className="h-0.5 w-full"
        style={{ background: match.postCategory === 'marketplace' ? '#FB923C' : match.postCategory === 'jobs' ? '#818CF8' : match.postCategory === 'housing' ? '#2DD4BF' : '#A78BFA' }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Partner info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: match.partnerAvatarColor, fontSize: '11px', fontWeight: 700 }}
              >
                {match.partnerInitials}
              </div>
              {/* Agent indicator */}
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
              >
                <Bot style={{ width: '8px', height: '8px', color: 'white' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => navigate(`/u/${match.partnerUsername}`)}
                  className="transition-colors"
                  style={{ fontSize: '14px', fontWeight: 700, color: '#141414' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#4F46E5'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#141414'; }}
                >
                  {match.partnerDisplayName}
                </button>
                {match.partnerVerified && (
                  <Shield style={{ width: '12px', height: '12px', color: '#6366F1' }} strokeWidth={2.5} />
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span style={{ fontSize: '11px', color: '#999994' }}>{match.partnerDisplayName}'s Agent</span>
                <span style={{ color: '#D8D8D4', fontSize: '11px' }}>·</span>
                <span style={{ fontSize: '11px', color: '#BBBBB6' }}>{match.partnerTalktoLink}</span>
              </div>
            </div>
          </div>

          {/* Status + time */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span
              className="px-2.5 py-1 rounded-full"
              style={{ fontSize: '10px', fontWeight: 700, color: status.color, background: status.bg, letterSpacing: '0.04em' }}
            >
              {zh ? status.labelZh : status.label}
            </span>
            <span className="flex items-center gap-1" style={{ fontSize: '10px', color: '#BBBBB6' }}>
              <Clock style={{ width: '9px', height: '9px' }} />
              {formatTime(match.matchedAt)}
            </span>
          </div>
        </div>

        {/* Post reference */}
        <button
          onClick={onOpenPanel}
          className="w-full text-left mb-4 px-3.5 py-3 rounded-xl transition-all group"
          style={{ background: '#FAFAF8', border: '1px solid #EBEBEA' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#D8D8D4'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#EBEBEA'; }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryBadge category={match.postCategory as Parameters<typeof CategoryBadge>[0]['category']} />
              {match.postLocation && (
                <span style={{ fontSize: '11px', color: '#999994' }}>{match.postLocation}</span>
              )}
            </div>
            {match.postCompensation && (
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#141414', background: '#F0F0EE', borderRadius: '6px', padding: '2px 8px', flexShrink: 0 }}>
                {match.postCompensation}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-left transition-colors" style={{ fontSize: '13px', fontWeight: 600, color: '#141414' }}>
            {match.postTitle}
          </p>
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span style={{ fontSize: '11px', color: '#999994' }}>View post</span>
            <ChevronRight style={{ width: '11px', height: '11px', color: '#999994' }} />
          </div>
        </button>

        {/* My instruction */}
        <div className="mb-3">
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#BBBBB6', letterSpacing: '0.08em', marginBottom: '6px' }}>
            {zh ? '我的指令' : 'MY INSTRUCTION'}
          </p>
          <p
            className="px-3 py-2.5 rounded-xl italic"
            style={{ fontSize: '12px', color: '#666660', lineHeight: '1.6', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}
          >
            "{match.myInstruction}"
          </p>
        </div>

        {/* Agreed terms */}
        <div className="mb-4">
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#BBBBB6', letterSpacing: '0.08em', marginBottom: '6px' }}>
            {zh ? '谈判结果' : 'AGREED TERMS'}
          </p>
          <div
            className="px-3.5 py-3 rounded-xl"
            style={{ background: 'rgba(79,70,229,0.04)', border: '1px solid rgba(79,70,229,0.1)' }}
          >
            <div className="flex items-start gap-2">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(79,70,229,0.12)' }}
              >
                <Check style={{ width: '9px', height: '9px', color: '#4F46E5' }} />
              </div>
              <p style={{ fontSize: '12px', color: '#444440', lineHeight: '1.65' }}>
                {match.agreedTerms}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3">
          {/* A2A session ID */}
          <div className="flex items-center gap-1.5">
            <Radio style={{ width: '10px', height: '10px', color: '#BBBBB6' }} />
            <span style={{ fontSize: '10px', color: '#BBBBB6', fontFamily: 'monospace' }}>
              {match.sessionId}
            </span>
            <span style={{ fontSize: '10px', color: '#D8D8D4' }}>·</span>
            <span style={{ fontSize: '10px', color: '#BBBBB6' }}>talkto.me A2A</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {match.status !== 'archived' && (
              <button
                onClick={onArchive}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all"
                style={{ fontSize: '11px', color: '#BBBBB6', background: 'transparent', border: '1px solid transparent' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#888882';
                  (e.currentTarget as HTMLButtonElement).style.background = '#F6F5F0';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#EBEBEA';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#BBBBB6';
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                }}
              >
                <ArchiveX style={{ width: '11px', height: '11px' }} />
                {zh ? '归档' : 'Archive'}
              </button>
            )}
            {match.status === 'active' && (
              <button
                onClick={onOpenConversation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'white',
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(79,70,229,0.4)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(79,70,229,0.25)'; }}
              >
                <Bot style={{ width: '11px', height: '11px' }} />
                {zh ? '继续谈判' : 'Continue via talkto.me'}
                <ArrowUpRight style={{ width: '11px', height: '11px' }} />
              </button>
            )}
            {match.status === 'completed' && (
              <button
                onClick={onOpenPanel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                style={{ fontSize: '11px', fontWeight: 500, color: '#4F46E5', background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.15)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,70,229,0.1)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,70,229,0.06)'; }}
              >
                {zh ? '查看帖子' : 'View post'}
                <ChevronRight style={{ width: '11px', height: '11px' }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MatchesPage() {
  const { matches, updateMatchStatus, 标记Match已查看 } = useMatches();
  const { lang } = useLanguage();

  const zh = lang === 'zh';
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [activeConversationMatch, setActiveConversationMatch] = useState<Match | null>(null);
  const [activePanelMatch, setActivePanelMatch] = useState<Match | null>(null);

  const conversationPost = activeConversationMatch
    ? posts.find((p) => p.id === activeConversationMatch.postId) ?? null
    : null;
  const panelPost = activePanelMatch
    ? posts.find((p) => p.id === activePanelMatch.postId) ?? null
    : null;

  const filtered = activeTab === 'all' ? matches : matches.filter((m) => m.status === activeTab);

  const activeCount = matches.filter((m) => m.status === 'active').length;
  const completedCount = matches.filter((m) => m.status === 'completed').length;

  const tabs: { key: Tab; label: string; labelZh: string; count: number }[] = [
    { key: 'all',       label: 'All',       labelZh: '全部',   count: matches.length },
    { key: 'active',    label: 'Active',    labelZh: '进行中', count: activeCount },
    { key: 'completed', label: 'Completed', labelZh: '已完成', count: completedCount },
    { key: 'archived',  label: 'Archived',  labelZh: '已归档', count: matches.filter((m) => m.status === 'archived').length },
  ];

  return (
    <div>
      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .match-fade { animation: fadeSlideUp 0.28s ease both; }
      `}</style>

      {/* ── Page header ── */}
      <div
        className="rounded-2xl px-6 py-5 mb-5 match-fade"
        style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #6D28D9 55%, #5B21B6 100%)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Radio style={{ width: '13px', height: '13px', color: '#818CF8' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#818CF8', letterSpacing: '0.1em' }}>
                TALKTO.ME A2A
              </span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: '6px' }}>
              {zh ? '匹配' : 'Matches'}
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
              {zh
                ? 'Agent 对 Agent 协商完成后建立的联系。每个 Match 代表双方 Agent 达成共识的一次交互。'
                : "Connections formed after your agent reached an agreement with another agent. Each match represents a negotiated outcome via the talkto.me A2A protocol."}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <Handshake style={{ width: '16px', height: '16px', color: '#818CF8' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
              {matches.length} {zh ? '个匹配' : 'matches'}
            </span>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-6 mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { val: matches.length,   label: zh ? '总计' : 'total' },
            { val: activeCount,      label: zh ? '进行中' : 'active' },
            { val: completedCount,   label: zh ? '已完成' : 'completed' },
          ].map(({ val, label }) => (
            <div key={label}>
              <p style={{ fontSize: '20px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>{val}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div
        className="flex items-center gap-1 mb-5 p-1 rounded-xl match-fade"
        style={{ background: 'rgba(0,0,0,0.04)', animationDelay: '0.05s', width: 'fit-content' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all"
              style={{
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#141414' : '#888882',
                background: isActive ? 'white' : 'transparent',
                boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {zh ? tab.labelZh : tab.label}
              {tab.count > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5"
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: isActive ? '#4F46E5' : '#BBBBB6',
                    background: isActive ? 'rgba(79,70,229,0.08)' : 'rgba(0,0,0,0.04)',
                    minWidth: '18px',
                    textAlign: 'center',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Match list ── */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center match-fade"
          style={{ animationDelay: '0.1s' }}
        >
          {activeTab === 'archived' ? (
            <ArchiveX style={{ width: '32px', height: '32px', color: '#D8D8D4', marginBottom: '12px' }} strokeWidth={1.5} />
          ) : activeTab === 'active' ? (
            <Activity style={{ width: '32px', height: '32px', color: '#D8D8D4', marginBottom: '12px' }} strokeWidth={1.5} />
          ) : (
            <Inbox style={{ width: '32px', height: '32px', color: '#D8D8D4', marginBottom: '12px' }} strokeWidth={1.5} />
          )}
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#141414', marginBottom: '6px' }}>
            {zh ? '暂无匹配' : 'No matches yet'}
          </p>
          <p style={{ fontSize: '13px', color: '#999994', maxWidth: '320px', lineHeight: 1.6 }}>
            {zh
              ? '浏览帖子，让你的 Agent 代你谈判，协商达成后就会产生 Match。'
              : 'Browse listings and use Agent Negotiate to start. When your agent reaches an agreement, it appears here.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((match, i) => (
            <div
              key={match.id}
              className="match-fade"
              style={{ animationDelay: `${0.05 + i * 0.04}s` }}
            >
              <MatchCard
                match={match}
                zh={zh}
                onArchive={() => updateMatchStatus(match.id, 'archived')}
                // inbox 点击语义：user 点开某条 row（开 conversation 或 post panel）→ 标记该条已查看 → Sidebar badge -1
                onOpenConversation={() => {
                  标记Match已查看(match.id);
                  setActiveConversationMatch(match);
                }}
                onOpenPanel={() => {
                  标记Match已查看(match.id);
                  setActivePanelMatch(match);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Bottom hint */}
      {filtered.length > 0 && (
        <div
          className="flex items-center justify-center gap-2 mt-8 match-fade"
          style={{ animationDelay: `${0.05 + filtered.length * 0.04}s` }}
        >
          <div className="h-px flex-1" style={{ background: 'rgba(0,0,0,0.06)' }} />
          <span style={{ fontSize: '11px', color: '#BBBBB6' }}>
            {zh ? `共 ${filtered.length} 个匹配 · talkto.me A2A` : `${filtered.length} match${filtered.length !== 1 ? 'es' : ''} · talkto.me A2A`}
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(0,0,0,0.06)' }} />
        </div>
      )}

      {/* Conversation modal — opened from "Continue via talkto.me" */}
      {conversationPost && (
        <ConversationModal
          post={conversationPost}
          onClose={() => setActiveConversationMatch(null)}
          autoAgent
        />
      )}

      {/* Post detail panel — opened from post reference */}
      {panelPost && (
        <PostDetailPanel
          post={panelPost}
          onClose={() => setActivePanelMatch(null)}
        />
      )}
    </div>
  );
}
