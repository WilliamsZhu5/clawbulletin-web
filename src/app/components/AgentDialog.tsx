import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Bot, Send, ArrowUpRight, Sparkles } from 'lucide-react';
import { posts } from '../data/mockData';
import type { Post } from '../data/mockData';

/* ─── Types ────────────────────────────────────────────────────── */

interface ResultCard {
  post: Post;
  reason: string;
}

interface Message {
  id: string;
  role: 'user' | 'agent';
  text: string;
  results?: ResultCard[];
  chips?: string[];
  timestamp: Date;
}

/* ─── Mock agent brain ──────────────────────────────────────────── */

const categoryColor: Record<string, string> = {
  jobs:        '#818CF8',
  projects:    '#A78BFA',
  marketplace: '#FB923C',
  skills:      '#4ADE80',
  housing:     '#2DD4BF',
  events:      '#FB7185',
};

function agentRespond(query: string): { text: string; results?: ResultCard[]; chips?: string[] } {
  const q = query.toLowerCase();

  // Jobs intent
  if (q.includes('job') || q.includes('work') || q.includes('hire') || q.includes('engineer') ||
      q.includes('engineer') || q.includes('rust') || q.includes('frontend') || q.includes('backend') ||
      q.includes('developer') || q.includes('salary') || q.includes('remote')) {
    const matched = posts.filter(p => p.category === 'jobs');
    return {
      text: `Found ${matched.length} job listings that match. Here's what stands out based on your query:`,
      results: matched.slice(0, 3).map((p, i) => ({
        post: p,
        reason: i === 0
          ? 'Strong match — senior role with equity, well-funded team'
          : i === 1
          ? 'Open-source opportunity with real ownership'
          : 'High activity, 12 people reached out this week',
      })),
      chips: ['Show all jobs', 'Remote only', 'Filter by salary', 'Sort by newest'],
    };
  }

  // Housing intent
  if (q.includes('apartment') || q.includes('room') || q.includes('rent') ||
      q.includes('housing') || q.includes('sublease') || q.includes('studio') ||
      q.includes('place') || q.includes('live') || q.includes('hayes')) {
    const matched = posts.filter(p => p.category === 'housing');
    return {
      text: `I found ${matched.length} housing listing${matched.length !== 1 ? 's' : ''} right now. Let me surface the most relevant:`,
      results: matched.slice(0, 2).map((p, i) => ({
        post: p,
        reason: i === 0
          ? 'Below market rate, available immediately'
          : 'Flexible move-in date, utilities negotiable',
      })),
      chips: ['Under $2k/mo', 'Include utilities', 'Pet friendly', 'Short-term ok'],
    };
  }

  // Marketplace intent
  if (q.includes('buy') || q.includes('sell') || q.includes('macbook') || q.includes('laptop') ||
      q.includes('secondhand') || q.includes('used') || q.includes('market') || q.includes('item') ||
      q.includes('gear') || q.includes('camera') || q.includes('phone')) {
    const matched = posts.filter(p => p.category === 'marketplace');
    return {
      text: `Browsing marketplace listings for you. These look like good fits:`,
      results: matched.slice(0, 3).map((p, i) => ({
        post: p,
        reason: i === 0
          ? 'Price well below retail, includes warranty'
          : i === 1
          ? 'Local pickup, seller has good track record'
          : 'Listed 2 days ago, no offers yet',
      })),
      chips: ['Under $500', 'Under $2k', 'Local pickup only', 'Electronics'],
    };
  }

  // Projects intent
  if (q.includes('project') || q.includes('co-founder') || q.includes('startup') ||
      q.includes('build') || q.includes('idea') || q.includes('collab') || q.includes('side')) {
    const matched = posts.filter(p => p.category === 'projects');
    return {
      text: `Here are active projects looking for collaborators:`,
      results: matched.slice(0, 3).map((p, i) => ({
        post: p,
        reason: i === 0
          ? 'Early stage, co-founder equity available'
          : i === 1
          ? 'Strong technical foundation, legal pilots lined up'
          : 'Well-scoped side project, 10h/week commitment',
      })),
      chips: ['Co-founder roles', 'Open source', 'AI / ML', 'With funding'],
    };
  }

  // Skills intent
  if (q.includes('skill') || q.includes('learn') || q.includes('teach') ||
      q.includes('freelance') || q.includes('service') || q.includes('design') ||
      q.includes('tutor') || q.includes('course')) {
    const matched = posts.filter(p => p.category === 'skills');
    return {
      text: `Found skill exchange and service listings that match:`,
      results: matched.slice(0, 2).map((p) => ({
        post: p,
        reason: 'Available this week, open to skill exchange',
      })),
      chips: ['Free exchange', 'Paid services', 'Design', 'Engineering'],
    };
  }

  // Events intent
  if (q.includes('event') || q.includes('meetup') || q.includes('workshop') ||
      q.includes('conference') || q.includes('network') || q.includes('talk') ||
      q.includes('community') || q.includes('social')) {
    const matched = posts.filter(p => p.category === 'events');
    return {
      text: `Here are upcoming events and meetups:`,
      results: matched.slice(0, 2).map((p) => ({
        post: p,
        reason: 'RSVP open, small group format',
      })),
      chips: ['This week', 'Free events', 'Technical talks', 'Founder meetups'],
    };
  }

  // Catch-all with broad suggestions
  return {
    text: `I searched across all listings for "${query}". Here are the most relevant results I found:`,
    results: posts.slice(0, 3).map((p, i) => ({
      post: p,
      reason: i === 0
        ? 'High relevance, recently active'
        : i === 1
        ? 'Matches some of your recent activity'
        : 'Popular listing this week',
    })),
    chips: ['Browse all jobs', 'Marketplace deals', 'Active projects', 'Housing listings'],
  };
}

/* ─── Suggested prompts ─────────────────────────────────────────── */

const SUGGESTIONS = [
  'Find me a remote frontend engineering job',
  'Look for studio apartments under $1,500',
  'Any interesting AI co-founder projects?',
  'Show me good deals on used laptops',
  'I want to find a Rust systems project to contribute to',
];

/* ─── Component ─────────────────────────────────────────────────── */

export function AgentDialog({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const send = useCallback((text: string) => {
    if (!text.trim() || loading) return;
    setStarted(true);
    setInput('');

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const delay = 900 + Math.random() * 600;
    setTimeout(() => {
      const response = agentRespond(text);
      const agentMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'agent',
        text: response.text,
        results: response.results,
        chips: response.chips,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMsg]);
      setLoading(false);
    }, delay);
  }, [loading]);

  const handleSubmit = () => send(input);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(10,10,20,0.55)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="fixed z-50 flex flex-col"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '680px',
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: '82vh',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header ── */}
        <div
          className="shrink-0 flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            <Bot style={{ width: '15px', height: '15px', color: 'white' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#141414', letterSpacing: '-0.02em' }}>
              Your Agent
            </div>
            <div style={{ fontSize: '11px', color: '#ADADAA' }}>
              Ask anything · searches all listings in real time
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E', boxShadow: '0 0 5px #22C55E' }} />
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#16A34A' }}>Online</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
            style={{ color: '#ADADAA' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.06)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <X style={{ width: '15px', height: '15px' }} />
          </button>
        </div>

        {/* ── Conversation body ── */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.07) transparent' }}
        >
          {/* Welcome / suggestions state */}
          {!started ? (
            <div className="px-6 py-8">
              <div className="mb-7 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(124,58,237,0.08))' }}
                >
                  <Sparkles style={{ width: '22px', height: '22px', color: '#6366F1' }} />
                </div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#141414', marginBottom: '6px', letterSpacing: '-0.02em' }}>
                  What are you looking for?
                </p>
                <p style={{ fontSize: '13px', color: '#ADADAA', lineHeight: '1.6' }}>
                  Describe what you need in plain language — jobs, housing, gear, projects, anything.
                </p>
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-left w-full transition-all"
                    style={{
                      background: '#F8F8F6',
                      border: '1px solid rgba(0,0,0,0.06)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,70,229,0.05)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#F8F8F6';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,0,0,0.06)';
                    }}
                  >
                    <span style={{ fontSize: '13px', color: '#444440', flex: 1 }}>{s}</span>
                    <ArrowUpRight style={{ width: '13px', height: '13px', color: '#ADADAA', flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-6 py-5 flex flex-col gap-5">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.role === 'user' ? (
                    /* User bubble */
                    <div className="flex justify-end">
                      <div
                        className="px-4 py-2.5 rounded-2xl rounded-br-[5px] max-w-[78%]"
                        style={{
                          background: '#141414',
                          color: 'white',
                          fontSize: '13px',
                          lineHeight: '1.6',
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    /* Agent response */
                    <div className="flex flex-col gap-3">
                      {/* Agent label */}
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                        >
                          <Bot style={{ width: '10px', height: '10px', color: 'white' }} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#818CF8' }}>Agent</span>
                      </div>

                      {/* Text */}
                      <p style={{ fontSize: '13px', color: '#444440', lineHeight: '1.7', paddingLeft: '2px' }}>
                        {msg.text}
                      </p>

                      {/* Result cards */}
                      {msg.results && msg.results.length > 0 && (
                        <div className="flex flex-col gap-2.5">
                          {msg.results.map(({ post, reason }) => (
                            <div
                              key={post.id}
                              className="group flex flex-col gap-1.5 px-4 py-3.5 rounded-xl cursor-pointer transition-all"
                              style={{
                                background: '#FAFAF8',
                                border: '1px solid rgba(0,0,0,0.07)',
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLDivElement).style.background = 'rgba(79,70,229,0.03)';
                                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.2)';
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLDivElement).style.background = '#FAFAF8';
                                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,0,0,0.07)';
                              }}
                            >
                              {/* Category + meta */}
                              <div className="flex items-center gap-2">
                                <div
                                  className="px-1.5 py-0.5 rounded"
                                  style={{
                                    background: `${categoryColor[post.category] ?? '#ADADAA'}14`,
                                    fontSize: '9px',
                                    fontWeight: 700,
                                    color: categoryColor[post.category] ?? '#ADADAA',
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {post.category}
                                </div>
                                {post.compensation && (
                                  <span style={{ fontSize: '11px', color: '#ADADAA' }}>{post.compensation}</span>
                                )}
                                {post.location && (
                                  <span style={{ fontSize: '11px', color: '#ADADAA' }}>· {post.location}</span>
                                )}
                                <ArrowUpRight
                                  style={{ width: '12px', height: '12px', color: '#C4C4BF', marginLeft: 'auto' }}
                                />
                              </div>

                              {/* Title */}
                              <p style={{ fontSize: '13px', fontWeight: 600, color: '#141414', lineHeight: '1.45', letterSpacing: '-0.01em' }}>
                                {post.title}
                              </p>

                              {/* Body excerpt */}
                              <p
                                style={{ fontSize: '12px', color: '#888882', lineHeight: '1.55' }}
                              >
                                {post.body.slice(0, 110).replace(/\n/g, ' ')}…
                              </p>

                              {/* Agent reason */}
                              <div
                                className="flex items-center gap-1.5 mt-0.5 pt-2.5"
                                style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}
                              >
                                <Sparkles style={{ width: '10px', height: '10px', color: '#818CF8', flexShrink: 0 }} />
                                <span style={{ fontSize: '11px', color: '#818CF8', fontStyle: 'italic' }}>{reason}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Follow-up chips */}
                      {msg.chips && msg.chips.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {msg.chips.map((chip, i) => (
                            <button
                              key={i}
                              onClick={() => send(chip)}
                              className="px-3 py-1.5 rounded-full transition-all"
                              style={{
                                fontSize: '11px',
                                fontWeight: 500,
                                color: '#6366F1',
                                background: 'rgba(79,70,229,0.06)',
                                border: '1px solid rgba(99,102,241,0.18)',
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,70,229,0.12)'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,70,229,0.06)'; }}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                    >
                      <Bot style={{ width: '10px', height: '10px', color: 'white' }} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#818CF8' }}>Agent</span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl self-start"
                    style={{ background: '#F4F4F2' }}
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: '#BBBBB6', animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Input ── */}
        <div
          className="shrink-0 px-5 py-4"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#FAFAF8' }}
        >
          <div
            className="flex items-end gap-3 px-4 py-2.5 rounded-2xl transition-all"
            style={{
              border: '1px solid rgba(0,0,0,0.1)',
              background: 'white',
            }}
            onFocus={() => {}}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Describe what you're looking for…"
              className="flex-1 bg-transparent outline-none resize-none"
              style={{
                fontSize: '14px',
                color: '#141414',
                lineHeight: '1.55',
                minHeight: '24px',
                maxHeight: '100px',
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
              className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                  : 'rgba(0,0,0,0.07)',
                boxShadow: input.trim() && !loading ? '0 2px 10px rgba(79,70,229,0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <Send style={{ width: '13px', height: '13px', color: input.trim() && !loading ? 'white' : '#C4C4BF' }} />
            </button>
          </div>
          <p style={{ fontSize: '10px', color: '#C4C4BF', marginTop: '8px', textAlign: 'center' }}>
            Press Enter to send · Shift+Enter for new line · Esc to close
          </p>
        </div>
      </div>
    </>
  );
}
