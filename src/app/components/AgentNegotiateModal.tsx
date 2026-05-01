import { useState, useEffect, useRef } from 'react';
import { X, Bot, Zap, Check, Radio, Sparkles, Handshake, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router';
import type { Post } from '../data/mockData';
import { currentUser } from '../data/mockData';
import { useMatches } from '../context/MatchContext';
import type { Match } from '../data/matchData';

type Stage = 'briefing' | 'active' | 'resolved';
type Outcome = 'accepted' | 'declined' | 'drafting' | null;

interface AgentMessage {
  id: string;
  from: 'your-agent' | 'their-agent' | 'system' | 'decision';
  content: string;
  timestamp: string;
  isProcessing?: boolean;
}

function getTimestamp(offsetMs: number): string {
  const d = new Date(Date.now() + offsetMs);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function generateConversation(post: Post, instruction: string): AgentMessage[] {
  const ts = (s: number) => getTimestamp(s * 1000);
  const authorName = post.author.displayName;

  if (post.category === 'marketplace') {
    const price = post.compensation || 'listed price';
    return [
      { id: 'm0', from: 'system', content: `Establishing A2A channel → ${authorName}'s Agent via talkto.me`, timestamp: ts(0) },
      { id: 'm1', from: 'system', content: 'Secure channel established. End-to-end encrypted.', timestamp: ts(2) },
      { id: 'm2', from: 'your-agent', content: `Hello. I'm ${currentUser.displayName}'s Agent. My client is interested in "${post.title}" listed at ${price}. They'd like to discuss terms.`, timestamp: ts(4) },
      { id: 'm3', from: 'their-agent', content: `Hi. I'm ${authorName}'s Agent. I can confirm the item is still available. The seller has set parameters I'm working within. What is your client's position?`, timestamp: ts(8) },
      { id: 'm4', from: 'your-agent', content: `Client instruction: "${instruction}". Based on this, I'm authorised to negotiate. What's the seller's best price for a prompt transaction?`, timestamp: ts(12) },
      { id: 'm5', from: 'their-agent', content: `Processing seller parameters...`, timestamp: ts(15), isProcessing: true },
      { id: 'm6', from: 'their-agent', content: `The seller can offer a 5% reduction from listing price, conditional on local pickup within 5 days. The AppleCare+ transfer is included in that figure.`, timestamp: ts(19) },
      { id: 'm7', from: 'your-agent', content: `Understood. The offer is within range but I want to confirm one variable before accepting. Flagging for client decision.`, timestamp: ts(22) },
      { id: 'm8', from: 'decision', content: `Counter-offer received: ${price} → −5% (approx). Condition: local pickup within 5 days. AppleCare+ included in transfer. Your agent assesses this as within your stated parameters. How would you like to proceed?`, timestamp: ts(25) },
    ];
  }

  if (post.category === 'jobs') {
    return [
      { id: 'm0', from: 'system', content: `Establishing A2A channel → ${authorName}'s Agent via talkto.me`, timestamp: ts(0) },
      { id: 'm1', from: 'system', content: 'Secure channel established.', timestamp: ts(2) },
      { id: 'm2', from: 'your-agent', content: `Hello. I'm ${currentUser.displayName}'s Agent. My client has reviewed the "${post.title}" listing and is a strong fit. I'd like to surface key questions before requesting a direct conversation.`, timestamp: ts(5) },
      { id: 'm3', from: 'their-agent', content: `Hi. I'm ${authorName}'s Agent. I screen initial interest before escalating to the team. Please share your client's core relevant background and primary questions.`, timestamp: ts(9) },
      { id: 'm4', from: 'your-agent', content: `Client instruction: "${instruction}". My client's background aligns with the technical requirements listed. Key questions: remote flexibility, equity band, and current team size.`, timestamp: ts(13) },
      { id: 'm5', from: 'their-agent', content: `Running fit assessment against poster's criteria...`, timestamp: ts(16), isProcessing: true },
      { id: 'm6', from: 'their-agent', content: `Fit signal is positive. On your questions: the role is on-site in SF 4 days/week, equity is 0.5–1.5% based on level, team is currently 6 people pre-Series A. The founders want a direct call before further info exchange.`, timestamp: ts(21) },
      { id: 'm7', from: 'your-agent', content: `Parameters noted. My client is open to the on-site requirement. Before I propose availability windows, I need to confirm one item.`, timestamp: ts(24) },
      { id: 'm8', from: 'decision', content: `Role parameters confirmed: SF on-site 4d/week, 0.5–1.5% equity, 6-person team pre-Series A. Team wants a direct intro call first. Your agent recommends proceeding. Confirm scheduling?`, timestamp: ts(27) },
    ];
  }

  if (post.category === 'projects' || post.subcategory === 'Co-founder') {
    return [
      { id: 'm0', from: 'system', content: `Establishing A2A channel → ${authorName}'s Agent via talkto.me`, timestamp: ts(0) },
      { id: 'm1', from: 'system', content: 'Secure channel established.', timestamp: ts(2) },
      { id: 'm2', from: 'your-agent', content: `Hello. I'm ${currentUser.displayName}'s Agent. My client is interested in collaborating on "${post.title}". I'll share a fit signal before requesting further time from the poster.`, timestamp: ts(5) },
      { id: 'm3', from: 'their-agent', content: `Hi. I'm ${authorName}'s Agent. The poster filters incoming collaboration inquiries carefully. Please share your client's relevant profile and availability.`, timestamp: ts(9) },
      { id: 'm4', from: 'your-agent', content: `Client instruction: "${instruction}". My client has complementary technical skills, 10+ hrs/week available, no conflicting commitments. They're willing to share a GitHub link.`, timestamp: ts(14) },
      { id: 'm5', from: 'their-agent', content: `Assessing against poster's criteria...`, timestamp: ts(17), isProcessing: true },
      { id: 'm6', from: 'their-agent', content: `The poster's response: genuine interest. They prefer an async intro note first — 3–5 sentences on your client's relevant background — before committing to a call. Standard filter.`, timestamp: ts(22) },
      { id: 'm7', from: 'your-agent', content: `Understood. I can draft the intro note from my client's profile, or wait for manual input. Pausing for decision.`, timestamp: ts(25) },
      { id: 'm8', from: 'decision', content: `Poster is interested. Requests a short async intro note (3–5 sentences) before scheduling a call. Your agent can draft this from your profile. Approve agent-drafted intro, or write it yourself?`, timestamp: ts(28) },
    ];
  }

  if (post.category === 'housing') {
    return [
      { id: 'm0', from: 'system', content: `Establishing A2A channel → ${authorName}'s Agent via talkto.me`, timestamp: ts(0) },
      { id: 'm1', from: 'system', content: 'Secure channel established.', timestamp: ts(2) },
      { id: 'm2', from: 'your-agent', content: `Hello. I'm ${currentUser.displayName}'s Agent. My client is interested in the housing listing "${post.title}". I'd like to confirm availability and key terms.`, timestamp: ts(5) },
      { id: 'm3', from: 'their-agent', content: `Hi. I'm ${authorName}'s Agent. The listing is still available. What are your client's primary questions?`, timestamp: ts(8) },
      { id: 'm4', from: 'your-agent', content: `Client instruction: "${instruction}". Key questions: earliest available move-in date, whether utilities are included, and flexibility on lease length.`, timestamp: ts(12) },
      { id: 'm5', from: 'their-agent', content: `Checking with the poster on those parameters...`, timestamp: ts(15), isProcessing: true },
      { id: 'm6', from: 'their-agent', content: `Poster's responses: earliest move-in is flexible within ±1 week of listed date; utilities not included (est. $100–130/mo); lease is fixed-term but a 1-month extension after the term is negotiable.`, timestamp: ts(20) },
      { id: 'm7', from: 'your-agent', content: `Terms noted and within my client's parameters. Flagging for confirmation before proceeding to intro call.`, timestamp: ts(23) },
      { id: 'm8', from: 'decision', content: `Housing terms confirmed: flexible move-in, utilities ~$100–130/mo separate, lease extension negotiable. Poster is open to a brief call. Your agent recommends scheduling. Proceed?`, timestamp: ts(26) },
    ];
  }

  return [
    { id: 'm0', from: 'system', content: `Establishing A2A channel → ${authorName}'s Agent via talkto.me`, timestamp: ts(0) },
    { id: 'm1', from: 'system', content: 'Secure channel established.', timestamp: ts(2) },
    { id: 'm2', from: 'your-agent', content: `Hello. I'm ${currentUser.displayName}'s Agent. My client is interested in "${post.title}". Client instruction: "${instruction}". How would you like to proceed?`, timestamp: ts(5) },
    { id: 'm3', from: 'their-agent', content: `Hi. I'm ${authorName}'s Agent. I'll relay this to the poster and return with context.`, timestamp: ts(9) },
    { id: 'm4', from: 'their-agent', content: `Checking...`, timestamp: ts(11), isProcessing: true },
    { id: 'm5', from: 'their-agent', content: `Poster is open to connecting. They'd prefer a direct message via talkto.me with more specific context. I can flag your client as a priority contact.`, timestamp: ts(16) },
    { id: 'm6', from: 'your-agent', content: `Understood. I'll prepare a context summary. Pausing to confirm next steps with my client.`, timestamp: ts(19) },
    { id: 'm7', from: 'decision', content: `Poster is open to connecting. Their agent can flag your client as priority. Your agent can draft a context message and send it via talkto.me. Approve?`, timestamp: ts(22) },
  ];
}

interface Props {
  post: Post;
  onClose: () => void;
}

const REVEAL_DELAYS_MS = [0, 2000, 4200, 7800, 11500, 15500, 19800, 23200, 26500, 29500];

export function AgentNegotiateModal({ post, onClose }: Props) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { addMatch } = useMatches();
  const [stage, setStage] = useState<Stage>('briefing');
  const [instruction, setInstruction] = useState('');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [matchSaved, setMatchSaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage !== 'active') return;
    const conversation = generateConversation(post, instruction);
    setMessages(conversation);
    setVisibleCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    conversation.forEach((_, i) => {
      const delay = REVEAL_DELAYS_MS[i] ?? REVEAL_DELAYS_MS[REVEAL_DELAYS_MS.length - 1] + (i - REVEAL_DELAYS_MS.length + 1) * 2500;
      timers.push(setTimeout(() => setVisibleCount(i + 1), delay));
    });
    return () => timers.forEach(clearTimeout);
  }, [stage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleCount]);

  const quickSuggestions: Record<string, string[]> = {
    marketplace: ['Ask for a discount — my ceiling is listed price minus 10%', 'Ask about condition and can they deliver', 'Check if price is negotiable'],
    jobs: ['Ask about remote flexibility and equity band', 'Understand team size and funding stage', 'Get more details before committing to a call'],
    projects: ['Understand equity offer and time commitment', 'Ask for a brief async intro before a call', 'Check if this is paid or equity only'],
    housing: ['Ask about earliest move-in and utilities', 'Ask if lease length is flexible', 'Confirm what is included in rent'],
    skills: ['Confirm availability and hourly rate', 'Ask about past work examples', 'Understand engagement structure'],
    events: ['Ask if there are any spots remaining', 'Request the full agenda details', 'Ask about the speaker lineup'],
  };

  const suggestions = quickSuggestions[post.category] ?? ['Get more details first', 'Ask about availability', 'Request terms'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(20,20,24,0.5)', backdropFilter: 'blur(8px)' }}
      />

      <div
        className="relative rounded-2xl w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: '600px',
          maxHeight: '88vh',
          background: '#FFFFFF',
          boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.07)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="shrink-0 px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid #F0F0EE', background: '#FAFAF8' }}
        >
          <div className="flex items-center gap-3">
            {/* talkto.me wordmark pill */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl relative shrink-0"
              style={{ background: '#141414', boxShadow: '0 2px 10px rgba(0,0,0,0.18)' }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: 'white',
                  letterSpacing: '-0.04em',
                  fontFamily: 'ui-monospace, monospace',
                  lineHeight: 1,
                }}
              >
                talkto.me
              </span>
              {stage === 'active' && (
                <span
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: '#22C55E', border: '2px solid white' }}
                />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#141414' }}>
                  Agent 托管
                </span>
                {stage === 'briefing' && (
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ fontSize: '10px', fontWeight: 600, color: '#888882', background: '#F0F0EE' }}
                  >
                    待指令
                  </span>
                )}
                {stage === 'active' && (
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ fontSize: '10px', fontWeight: 700, color: '#16A34A', background: 'rgba(34,197,94,0.1)', letterSpacing: '0.04em' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    托管中
                  </span>
                )}
                {stage === 'resolved' && outcome === 'accepted' && (
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ fontSize: '10px', fontWeight: 700, color: '#16A34A', background: 'rgba(34,197,94,0.1)' }}
                  >
                    <Check style={{ width: '10px', height: '10px' }} />
                    已完成
                  </span>
                )}
              </div>
              <p style={{ fontSize: '11px', color: '#999994', marginTop: '1px' }}>
                {post.author.displayName} · {post.title.length > 40 ? post.title.slice(0, 40) + '…' : post.title}
              </p>
            </div>
          </div>

          {/* A2A badge + close */}
          <div className="flex items-center gap-2">
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.12)' }}
            >
              <Radio style={{ width: '10px', height: '10px', color: '#4F46E5' }} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#4F46E5' }}>A2A Protocol</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ color: '#999994', background: '#F0F0EE' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#EBEBEA'; (e.currentTarget as HTMLButtonElement).style.color = '#141414'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F0F0EE'; (e.currentTarget as HTMLButtonElement).style.color = '#999994'; }}
            >
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>

        {/* ── Briefing stage ── */}
        {stage === 'briefing' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ scrollbarWidth: 'none' }}>

              {/* How it works banner */}
              <div
                className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(20,20,20,0.04)', border: '1px solid rgba(0,0,0,0.07)' }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: '#141414' }}
                >
                  <Bot style={{ width: '13px', height: '13px', color: 'white' }} />
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#141414', marginBottom: '3px' }}>
                    告诉你的 Agent 需求，剩下的它来搞定
                  </p>
                  <p style={{ fontSize: '11px', color: '#888882', lineHeight: 1.6 }}>
                    Agent 会通过 talkto.me A2A 协议自动联系对方 Agent，
                    替你谈判、追问细节、过滤无效回复。
                    需要你拍板时会来找你。
                  </p>
                </div>
              </div>

              {/* Two-agent diagram */}
              <div
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                style={{ background: '#F6F5F0', border: '1px solid rgba(0,0,0,0.06)' }}
              >
                {/* Your agent */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: currentUser.avatarColor, fontSize: '10px', fontWeight: 700 }}
                    >
                      {currentUser.avatarInitials}
                    </div>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                      style={{ background: '#141414', border: '1.5px solid #F6F5F0' }}
                    >
                      <Bot style={{ width: '7px', height: '7px', color: 'white' }} />
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#141414', lineHeight: 1 }}>你的 Agent</p>
                    <p style={{ fontSize: '10px', color: '#999994', marginTop: '1px' }}>{currentUser.displayName}</p>
                  </div>
                </div>

                {/* Arrow + protocol */}
                <div className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1.5 w-full">
                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(20,20,20,0.2), rgba(20,20,20,0.08))' }} />
                    <div
                      className="px-2 py-0.5 rounded-full"
                      style={{ background: '#141414' }}
                    >
                      <span style={{ fontSize: '9px', fontWeight: 700, color: 'white', letterSpacing: '0.04em', fontFamily: 'ui-monospace, monospace' }}>A2A</span>
                    </div>
                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(20,20,20,0.08), rgba(20,20,20,0.2))' }} />
                  </div>
                  <p style={{ fontSize: '9px', color: '#BBBBB6', fontFamily: 'ui-monospace, monospace' }}>talkto.me</p>
                </div>

                {/* Their agent */}
                <div className="flex items-center gap-2">
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#141414', lineHeight: 1 }}>对方 Agent</p>
                    <p style={{ fontSize: '10px', color: '#999994', marginTop: '1px' }}>{post.author.displayName}</p>
                  </div>
                  <div className="relative">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: post.author.avatarColor, fontSize: '10px', fontWeight: 700 }}
                    >
                      {post.author.avatarInitials}
                    </div>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                      style={{ background: '#141414', border: '1.5px solid #F6F5F0' }}
                    >
                      <Bot style={{ width: '7px', height: '7px', color: 'white' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Post reference */}
              <div className="px-4 py-3 rounded-xl" style={{ background: '#FAFAF8', border: '1px solid #EBEBEA' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, color: '#BBBBB6', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  REGARDING
                </p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#141414', marginBottom: '4px' }}>
                  {post.title}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: '11px', color: '#888882', fontFamily: 'ui-monospace, monospace' }}>{post.author.talktoLink}</span>
                  {post.compensation && (
                    <span
                      className="px-2 py-0.5 rounded-md"
                      style={{ fontSize: '11px', fontWeight: 600, color: '#141414', background: '#F0F0EE' }}
                    >
                      {post.compensation}
                    </span>
                  )}
                </div>
              </div>

              {/* Instruction input */}
              <div>
                <label
                  className="block mb-1.5"
                  style={{ fontSize: '12px', fontWeight: 700, color: '#141414' }}
                >
                  你的需求 · 告诉 Agent 怎么做
                </label>
                <p style={{ fontSize: '11px', color: '#999994', marginBottom: '8px', lineHeight: 1.5 }}>
                  Agent 会自动托管整个沟通过程，在关键节点找你确认。
                </p>
                <textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder={t('agent.negotiate.placeholder')}
                  rows={3}
                  autoFocus
                  className="w-full px-3.5 py-3 rounded-xl outline-none resize-none transition-all"
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.65',
                    color: '#141414',
                    background: 'white',
                    border: '1px solid #E8E8E4',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#141414'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20,20,20,0.06)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#E8E8E4'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setInstruction(s)}
                      className="px-2.5 py-1.5 rounded-full transition-all text-left"
                      style={{ fontSize: '11px', color: '#666660', background: '#F4F4F2', border: '1px solid transparent' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#EBEBEA'; (e.currentTarget as HTMLButtonElement).style.color = '#141414'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F4F4F2'; (e.currentTarget as HTMLButtonElement).style.color = '#666660'; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="shrink-0 px-5 py-4 flex items-center justify-between gap-3"
              style={{ borderTop: '1px solid #F0F0EE', background: '#FAFAF8' }}
            >
              <p style={{ fontSize: '11px', color: '#BBBBB6', lineHeight: 1.55 }}>
                发送后 Agent 立即接管，全程自动沟通。
              </p>
              <button
                onClick={() => { if (instruction.trim()) setStage('active'); }}
                disabled={!instruction.trim()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'white',
                  background: '#141414',
                  boxShadow: instruction.trim() ? '0 4px 14px rgba(0,0,0,0.22)' : 'none',
                  fontFamily: 'ui-monospace, monospace',
                  letterSpacing: '-0.02em',
                }}
              >
                <Sparkles style={{ width: '14px', height: '14px' }} />
                启动 Agent
              </button>
            </div>
          </div>
        )}

        {/* ── Active / Resolved stage ── */}
        {(stage === 'active' || stage === 'resolved') && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Instruction pill */}
            <div
              className="shrink-0 px-5 py-2.5 flex items-center gap-2"
              style={{ background: 'rgba(20,20,20,0.03)', borderBottom: '1px solid #F0F0EE' }}
            >
              <div
                className="flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-md"
                style={{ background: '#141414' }}
              >
                <Bot style={{ width: '9px', height: '9px', color: 'white' }} />
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'white', letterSpacing: '0.04em' }}>指令</span>
              </div>
              <span
                className="truncate px-2.5 py-0.5 rounded-full"
                style={{ fontSize: '11px', fontWeight: 500, color: '#444440', background: '#EBEBEA', maxWidth: '380px' }}
              >
                {instruction}
              </span>
              <div
                className="ml-auto flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#16A34A', letterSpacing: '0.04em' }}>Agent 托管中</span>
              </div>
            </div>

            {/* Message stream */}
            <div
              className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.08) transparent' }}
            >
              {messages.slice(0, visibleCount).map((msg) => {

                /* ── System message ── */
                if (msg.from === 'system') {
                  return (
                    <div key={msg.id} className="flex items-center gap-3 py-0.5">
                      <div className="flex-1 h-px" style={{ background: '#F0F0EE' }} />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Radio style={{ width: '9px', height: '9px', color: '#BBBBB6' }} />
                        <span style={{ fontSize: '10px', color: '#BBBBB6' }}>{msg.content}</span>
                      </div>
                      <div className="flex-1 h-px" style={{ background: '#F0F0EE' }} />
                    </div>
                  );
                }

                /* ── Decision card ── */
                if (msg.from === 'decision') {
                  return (
                    <div key={msg.id} className="mt-1">
                      <div
                        className="rounded-xl p-4"
                        style={{ background: '#FFFBF5', border: '2px solid #FB923C' }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
                          >
                            <Zap style={{ width: '12px', height: '12px', color: 'white' }} />
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#C2410C', letterSpacing: '0.06em' }}>
                            {t('agent.negotiate.status.decision').toUpperCase()}
                          </span>
                          <span style={{ fontSize: '10px', color: '#BBBBB6', marginLeft: 'auto' }}>{msg.timestamp}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#1C1C1C', lineHeight: '1.65', marginBottom: '16px' }}>
                          {msg.content}
                        </p>

                        {outcome === null && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => {
                                // Build and save the match
                                const newMatch: Match = {
                                  id: `match-${Date.now()}`,
                                  postId: post.id,
                                  postTitle: post.title,
                                  postCategory: post.category,
                                  postCompensation: post.compensation,
                                  postLocation: post.location,
                                  partnerUsername: post.author.username,
                                  partnerDisplayName: post.author.displayName,
                                  partnerInitials: post.author.avatarInitials,
                                  partnerAvatarColor: post.author.avatarColor,
                                  partnerTalktoLink: post.author.talktoLink,
                                  partnerVerified: post.author.verified,
                                  myInstruction: instruction,
                                  agreedTerms: messages.find((m) => m.from === 'decision')?.content ?? 'Terms agreed via A2A protocol.',
                                  matchedAt: new Date().toISOString(),
                                  status: 'active',
                                  sessionId: `a2a_${Math.random().toString(36).slice(2, 8)}`,
                                };
                                addMatch(newMatch);
                                setMatchSaved(true);
                                setOutcome('accepted');
                                setStage('resolved');
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all"
                              style={{ fontSize: '12px', fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 2px 8px rgba(79,70,229,0.25)' }}
                            >
                              <Check style={{ width: '13px', height: '13px' }} />
                              {t('agent.negotiate.accept')}
                            </button>
                            <button
                              onClick={() => { setOutcome('drafting'); setStage('resolved'); }}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all"
                              style={{ fontSize: '12px', fontWeight: 500, color: '#4F46E5', background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.2)' }}
                            >
                              <Bot style={{ width: '13px', height: '13px' }} />
                              {t('agent.negotiate.draftReply')}
                            </button>
                            <button
                              onClick={() => { setOutcome('declined'); setStage('resolved'); }}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all"
                              style={{ fontSize: '12px', color: '#888882', background: 'white', border: '1px solid #E8E8E4' }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#C8C8C4'; (e.currentTarget as HTMLButtonElement).style.color = '#444440'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E8E8E4'; (e.currentTarget as HTMLButtonElement).style.color = '#888882'; }}
                            >
                              {t('agent.negotiate.decline')}
                            </button>
                          </div>
                        )}
                        {outcome === 'accepted' && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ fontSize: '12px', fontWeight: 600, color: '#16A34A', background: 'rgba(34,197,94,0.08)' }}>
                            <Check style={{ width: '13px', height: '13px' }} />
                            {t('agent.negotiate.result.accepted')}
                          </div>
                        )}
                        {outcome === 'drafting' && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ fontSize: '12px', fontWeight: 500, color: '#2563EB', background: 'rgba(37,99,235,0.06)' }}>
                            <Bot style={{ width: '13px', height: '13px' }} />
                            {t('agent.negotiate.result.drafting')}
                          </div>
                        )}
                        {outcome === 'declined' && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ fontSize: '12px', color: '#888882', background: '#F6F5F0' }}>
                            {t('agent.negotiate.result.declined')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                /* ── Agent chat bubble ── */
                const isYours = msg.from === 'your-agent';
                return (
                  <div key={msg.id} className={`flex items-end gap-2.5 ${isYours ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white"
                      style={{
                        backgroundColor: isYours ? '#141414' : post.author.avatarColor,
                        fontSize: '9px',
                        fontWeight: 700,
                      }}
                    >
                      {isYours ? currentUser.avatarInitials : post.author.avatarInitials}
                    </div>

                    <div className={`flex flex-col gap-1 max-w-[76%] ${isYours ? 'items-end' : 'items-start'}`}>
                      {/* Name + time */}
                      <div className={`flex items-center gap-2 ${isYours ? 'flex-row-reverse' : ''}`}>
                        <span style={{ fontSize: '10px', fontWeight: 500, color: '#999994' }}>
                          {isYours ? `${currentUser.displayName}'s Agent` : `${post.author.displayName}'s Agent`}
                        </span>
                        <span style={{ fontSize: '10px', color: '#D8D8D4' }}>{msg.timestamp}</span>
                      </div>

                      {/* Bubble */}
                      {msg.isProcessing ? (
                        <div
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl"
                          style={{
                            background: '#F6F5F0',
                            border: '1px solid #EBEBEA',
                            borderRadius: isYours ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          }}
                        >
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full animate-bounce"
                              style={{ background: '#BBBBB6', animationDelay: `${i * 150}ms` }}
                            />
                          ))}
                          <span style={{ fontSize: '12px', color: '#BBBBB6', marginLeft: '4px' }}>{msg.content}</span>
                        </div>
                      ) : (
                        <div
                          className="px-3.5 py-2.5"
                          style={
                            isYours
                              ? {
                                  background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
                                  color: 'white',
                                  borderRadius: '14px 14px 2px 14px',
                                  boxShadow: '0 2px 10px rgba(79,70,229,0.2)',
                                  fontSize: '13px',
                                  lineHeight: '1.65',
                                }
                              : {
                                  background: 'white',
                                  color: '#1C1C1C',
                                  border: '1px solid #E8E8E4',
                                  borderRadius: '14px 14px 14px 2px',
                                  fontSize: '13px',
                                  lineHeight: '1.65',
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                }
                          }
                        >
                          {msg.content}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator while loading next */}
              {stage === 'active' && visibleCount < messages.length && (
                <div className="flex items-end gap-2.5">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: post.author.avatarColor, fontSize: '9px', fontWeight: 700 }}
                  >
                    {post.author.avatarInitials}
                  </div>
                  <div
                    className="flex items-center gap-1 px-3.5 py-2.5 rounded-2xl"
                    style={{ background: 'white', border: '1px solid #E8E8E4', borderRadius: '14px 14px 14px 2px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: '#BBBBB6', animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div
              className="shrink-0 px-5 py-3 flex items-center justify-between gap-3"
              style={{ borderTop: '1px solid #F0F0EE', background: outcome === 'accepted' ? 'rgba(79,70,229,0.03)' : '#FAFAF8' }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage === 'active' ? '#22C55E' : outcome === 'accepted' ? '#4F46E5' : '#BBBBB6' }} />
                <span style={{ fontSize: '11px', color: '#888882' }}>
                  {stage === 'active'
                    ? `Agent 正在沟通中 · ${visibleCount} / ${messages.length} 条消息`
                    : outcome === 'accepted'
                    ? '已保存至 Matches'
                    : outcome === 'declined'
                    ? '已拒绝'
                    : '等待你的决定'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {outcome === 'accepted' && matchSaved && (
                  <button
                    onClick={() => { onClose(); navigate('/matches'); }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all"
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'white',
                      background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                      boxShadow: '0 2px 10px rgba(79,70,229,0.3)',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 18px rgba(79,70,229,0.45)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 10px rgba(79,70,229,0.3)'; }}
                  >
                    <Handshake style={{ width: '13px', height: '13px' }} />
                    View in Matches
                    <ArrowUpRight style={{ width: '12px', height: '12px' }} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl transition-all"
                  style={{ fontSize: '12px', fontWeight: 500, color: '#666660', background: 'white', border: '1px solid #E8E8E4' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#C8C8C4'; (e.currentTarget as HTMLButtonElement).style.color = '#141414'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E8E8E4'; (e.currentTarget as HTMLButtonElement).style.color = '#666660'; }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}