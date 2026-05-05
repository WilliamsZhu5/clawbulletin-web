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
      q.includes('developer') || q.includes('salary') || q.includes('remote') || q.includes('职位') || q.includes('工作')) {
    const matched = posts.filter(p => p.category === 'jobs');
    return {
      text: `找到 ${matched.length} 个相关职位。根据你的描述，这几条最值得关注：`,
      results: matched.slice(0, 3).map((p, i) => ({
        post: p,
        reason: i === 0
          ? '高度匹配 —— 高级岗位，含期权，团队资金充裕'
          : i === 1
          ? '开源项目，能拿到真正的所有权'
          : '本周活跃度高，已有 12 人主动联系',
      })),
      chips: ['查看全部职位', '仅看远程', '按薪资筛选', '按最新排序'],
    };
  }

  // Housing intent
  if (q.includes('apartment') || q.includes('room') || q.includes('rent') ||
      q.includes('housing') || q.includes('sublease') || q.includes('studio') ||
      q.includes('place') || q.includes('live') || q.includes('hayes') || q.includes('租房') || q.includes('房')) {
    const matched = posts.filter(p => p.category === 'housing');
    return {
      text: `当前有 ${matched.length} 条租房相关发布。下面是最相关的几条：`,
      results: matched.slice(0, 2).map((p, i) => ({
        post: p,
        reason: i === 0
          ? '价格低于市场价，立即可入住'
          : '入住日期灵活，水电费可商议',
      })),
      chips: ['月租 2k 以下', '含水电', '可养宠物', '可短租'],
    };
  }

  // Marketplace intent
  if (q.includes('buy') || q.includes('sell') || q.includes('macbook') || q.includes('laptop') ||
      q.includes('secondhand') || q.includes('used') || q.includes('market') || q.includes('item') ||
      q.includes('gear') || q.includes('camera') || q.includes('phone') || q.includes('二手') || q.includes('买')) {
    const matched = posts.filter(p => p.category === 'marketplace');
    return {
      text: `正在为你浏览二手市场。这几条比较合适：`,
      results: matched.slice(0, 3).map((p, i) => ({
        post: p,
        reason: i === 0
          ? '价格远低于零售价，含保修'
          : i === 1
          ? '本地自取，卖家信誉良好'
          : '两天前发布，暂无报价',
      })),
      chips: ['500 以下', '2k 以下', '仅本地自取', '电子产品'],
    };
  }

  // Projects intent
  if (q.includes('project') || q.includes('co-founder') || q.includes('startup') ||
      q.includes('build') || q.includes('idea') || q.includes('collab') || q.includes('side') || q.includes('项目') || q.includes('合伙')) {
    const matched = posts.filter(p => p.category === 'projects');
    return {
      text: `这些是正在招募合作者的活跃项目：`,
      results: matched.slice(0, 3).map((p, i) => ({
        post: p,
        reason: i === 0
          ? '早期阶段，提供联合创始人股权'
          : i === 1
          ? '技术基础扎实，已有法律试点'
          : '范围明确的副业项目，每周约 10 小时',
      })),
      chips: ['联合创始人', '开源', 'AI / ML', '已融资'],
    };
  }

  // Skills intent
  if (q.includes('skill') || q.includes('learn') || q.includes('teach') ||
      q.includes('freelance') || q.includes('service') || q.includes('design') ||
      q.includes('tutor') || q.includes('course') || q.includes('技能') || q.includes('学')) {
    const matched = posts.filter(p => p.category === 'skills');
    return {
      text: `找到这些技能交换或服务发布：`,
      results: matched.slice(0, 2).map((p) => ({
        post: p,
        reason: '本周可对接，欢迎技能互换',
      })),
      chips: ['免费互换', '付费服务', '设计', '工程'],
    };
  }

  // Events intent
  if (q.includes('event') || q.includes('meetup') || q.includes('workshop') ||
      q.includes('conference') || q.includes('network') || q.includes('talk') ||
      q.includes('community') || q.includes('social') || q.includes('活动') || q.includes('聚会')) {
    const matched = posts.filter(p => p.category === 'events');
    return {
      text: `近期的活动与聚会：`,
      results: matched.slice(0, 2).map((p) => ({
        post: p,
        reason: '可报名，小规模形式',
      })),
      chips: ['本周', '免费活动', '技术分享', '创始人聚会'],
    };
  }

  // Catch-all with broad suggestions
  return {
    text: `我已搜索全部发布查找"${query}"。最相关的几条结果：`,
    results: posts.slice(0, 3).map((p, i) => ({
      post: p,
      reason: i === 0
        ? '相关度高，近期活跃'
        : i === 1
        ? '与你最近的活动有关'
        : '本周热门发布',
    })),
    chips: ['浏览所有职位', '二手市场好货', '活跃项目', '租房发布'],
  };
}

/* ─── Suggested prompts ─────────────────────────────────────────── */

const SUGGESTIONS = [
  '帮我找一份远程前端工程师工作',
  '找一下月租 1500 以下的开间',
  '有没有有意思的 AI 联合创始人项目？',
  '推荐性价比高的二手笔记本',
  '想找一个可以贡献的 Rust 系统类项目',
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
              你的 Agent
            </div>
            <div style={{ fontSize: '11px', color: '#ADADAA' }}>
              问任何事 · 实时搜索所有发布
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E', boxShadow: '0 0 5px #22C55E' }} />
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#16A34A' }}>在线</span>
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
                  你在找什么？
                </p>
                <p style={{ fontSize: '13px', color: '#ADADAA', lineHeight: '1.6' }}>
                  用自然语言描述你的需求 —— 工作、租房、物品、项目，任何事。
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
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#818CF8' }}>Agent 回复</span>
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
              placeholder="描述你在找什么…"
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
            回车发送 · Shift+回车换行 · Esc 关闭
          </p>
        </div>
      </div>
    </>
  );
}
