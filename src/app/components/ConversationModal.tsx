import { useState, useRef, useEffect } from 'react';
import {
  X, Send, Bot, Shield, ChevronDown, Zap, Check,
} from 'lucide-react';
import { currentUser } from '../data/mockData';
import type { Post } from '../data/mockData';

/* ─── Types ─────────────────────────────────────────────────── */

type SentBy = 'my-agent' | 'me' | 'them';

interface ChatMessage {
  id: string;
  sentBy: SentBy;
  text: string;
  timestamp: string;
}

/* ─── Helpers ────────────────────────────────────────────────── */

function nowStr(): string {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function seedMessages(post: Post): ChatMessage[] {
  return [
    {
      id: 'seed-0',
      sentBy: 'them',
      text: `Hi — saw your interest in "${post.title.length > 48 ? post.title.slice(0, 48) + '…' : post.title}". Happy to answer any questions.`,
      timestamp: 'Yesterday 3:40 PM',
    },
  ];
}

const theirReplies: string[] = [
  'That makes sense. Let me look into that and get back to you shortly.',
  'Sure, I can work with that timeline. What else would you like to know?',
  'Good point — I hadn\'t considered it from that angle.',
  'Happy to discuss further. When are you free for a quick call?',
  'Agreed. I think there\'s a real opportunity here.',
  'Let me check on a few details and follow up.',
  'That works for me. What\'s the next step you had in mind?',
];

const agentAutoReplies: Record<string, string[]> = {
  marketplace: [
    'Hello. I\'m acting on behalf of my client. They\'re interested in the item and would like to confirm condition and discuss terms. What flexibility do you have on price?',
    'My client appreciates the quick response. They can arrange local pickup within the week. Is the listed price your firm floor?',
  ],
  jobs: [
    'Hello. I represent a candidate with a strong background relevant to this role. Before we go further, could you share the team structure and the technical stack in more detail?',
    'Understood. My client is open to the on-site requirement. They\'d like to understand the interview process before committing to a call — can you outline the stages?',
  ],
  housing: [
    'Hello. My client is interested in the listing. Key questions: Is the move-in date flexible by ±1 week? Are utilities included? And is the lease length negotiable?',
    'Thanks for confirming. My client is ready to proceed. Can we arrange a viewing this week?',
  ],
  projects: [
    'Hello. I\'m representing a potential collaborator with a complementary technical background and 10+ hours per week available. What equity structure do you have in mind for a technical co-founder?',
    'That\'s within my client\'s range. They\'d prefer a brief async intro before scheduling a call. Shall I draft one on their behalf?',
  ],
  skills: [
    'Hello. My client is interested in the service you\'re offering. Could you share your availability, rate, and a couple of past work examples?',
  ],
  events: [
    'Hello. My client is interested in attending. Could you confirm remaining spots and share the full agenda?',
  ],
};

/* ─── Component ──────────────────────────────────────────────── */

interface Props {
  post: Post;
  onClose: () => void;
  autoAgent?: boolean;
}

export function ConversationModal({ post, onClose, autoAgent = false }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => seedMessages(post));
  const [inputText, setInputText] = useState('');

  // Agent mode — auto-enabled when opened via talkto.me
  const [agentOn, setAgentOn] = useState(autoAgent);
  const [instruction, setInstruction] = useState('');
  const [showInstruction, setShowInstruction] = useState(autoAgent);

  // Typing indicators
  const [myAgentTyping, setMyAgentTyping] = useState(false);
  const [theirTyping, setTheirTyping] = useState(false);

  const [theirReplyIdx, setTheirReplyIdx] = useState(0);
  const [agentReplyIdx, setAgentReplyIdx] = useState(0);
  const [agentFired, setAgentFired] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const instructionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, myAgentTyping, theirTyping]);

  // When agent is turned on & instruction confirmed → agent fires opening message
  function fireAgent(instr: string) {
    setMyAgentTyping(true);
    setTimeout(() => {
      setMyAgentTyping(false);
      const pool = agentAutoReplies[post.category] ?? [
        'Hello. I\'m acting on behalf of my client. They\'re interested and would like to discuss further.',
      ];
      const text = pool[agentReplyIdx % pool.length];
      setAgentReplyIdx((i) => i + 1);
      const msg: ChatMessage = {
        id: `my-agent-${Date.now()}`,
        sentBy: 'my-agent',
        text,
        timestamp: nowStr(),
      };
      setMessages((prev) => [...prev, msg]);
      scheduleTheirReply();
    }, 1600);
  }

  function scheduleTheirReply() {
    setTheirTyping(true);
    const delay = 2200 + Math.random() * 900;
    setTimeout(() => {
      setTheirTyping(false);
      const text = theirReplies[theirReplyIdx % theirReplies.length];
      setTheirReplyIdx((i) => i + 1);
      setMessages((prev) => [
        ...prev,
        { id: `them-${Date.now()}`, sentBy: 'them', text, timestamp: nowStr() },
      ]);
    }, delay);
  }

  function handleToggleAgent() {
    if (agentOn) {
      // Turn off
      setAgentOn(false);
      setShowInstruction(false);
      setAgentFired(false);
    } else {
      // Turn on → show instruction panel
      setAgentOn(true);
      setShowInstruction(true);
      setTimeout(() => instructionRef.current?.focus(), 80);
    }
  }

  function handleDispatch() {
    setShowInstruction(false);
    setAgentFired(true);
    fireAgent(instruction);
  }

  function handleSend() {
    if (!inputText.trim()) return;
    const sentBy: SentBy = agentOn ? 'my-agent' : 'me';
    const msg: ChatMessage = {
      id: `send-${Date.now()}`,
      sentBy,
      text: inputText.trim(),
      timestamp: nowStr(),
    };
    setMessages((prev) => [...prev, msg]);
    setInputText('');
    scheduleTheirReply();
    textareaRef.current?.focus();
  }

  /* ── Render helpers ── */

  function bubbleStyle(sentBy: SentBy): React.CSSProperties {
    if (sentBy === 'my-agent') return {
      background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
      color: 'white',
      borderBottomRightRadius: '4px',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      borderBottomLeftRadius: '16px',
    };
    if (sentBy === 'me') return {
      background: '#1A1A2E',
      color: 'white',
      borderBottomRightRadius: '4px',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      borderBottomLeftRadius: '16px',
    };
    return {
      background: '#F4F4F2',
      color: '#141414',
      borderBottomLeftRadius: '4px',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      borderBottomRightRadius: '16px',
    };
  }

  const isMe = (s: SentBy) => s === 'me' || s === 'my-agent';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(16,16,20,0.55)', backdropFilter: 'blur(10px)' }}
      />

      <div
        className="relative w-full flex flex-col overflow-hidden rounded-2xl"
        style={{
          maxWidth: '560px',
          height: '640px',
          background: '#FFFFFF',
          boxShadow: '0 40px 100px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.07)',
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div
          className="shrink-0 flex items-center gap-3 px-5 py-3.5"
          style={{ borderBottom: '1px solid #F0F0EE' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: post.author.avatarColor, fontSize: '11px', fontWeight: 700 }}
          >
            {post.author.avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#141414' }}>
                {post.author.displayName}
              </span>
              {post.author.verified && (
                <Shield style={{ width: '12px', height: '12px', color: '#6366F1' }} strokeWidth={2.5} />
              )}
            </div>
            <p className="truncate" style={{ fontSize: '11px', color: '#999994', marginTop: '1px' }}>
              {post.title.length > 54 ? post.title.slice(0, 54) + '…' : post.title}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#16A34A' }}>Live</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ color: '#999994', background: '#F6F5F0' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#EBEBEA'; (e.currentTarget as HTMLButtonElement).style.color = '#141414'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F6F5F0'; (e.currentTarget as HTMLButtonElement).style.color = '#999994'; }}
            >
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>

        {/* ── Message thread ── */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.07) transparent' }}
        >

          {/* Post context chip */}
          <div
            className="self-center flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: '#F4F4F2', border: '1px solid #EBEBEA' }}
          >
            <span style={{ fontSize: '10px', color: '#999994' }}>re:</span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#444440' }}>
              {post.title.length > 50 ? post.title.slice(0, 50) + '…' : post.title}
            </span>
            {post.compensation && (
              <>
                <span style={{ fontSize: '10px', color: '#BBBBB6' }}>·</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#141414' }}>{post.compensation}</span>
              </>
            )}
          </div>

          {/* Messages */}
          {messages.map((msg) => {
            const mine = isMe(msg.sentBy);
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>

                {/* Their avatar */}
                {!mine && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: post.author.avatarColor, fontSize: '8px', fontWeight: 700 }}
                  >
                    {post.author.avatarInitials}
                  </div>
                )}

                <div className={`flex flex-col gap-0.5 max-w-[74%] ${mine ? 'items-end' : 'items-start'}`}>
                  {/* Sender label */}
                  <div className="flex items-center gap-1 px-0.5">
                    {msg.sentBy === 'my-agent' && (
                      <>
                        <Bot style={{ width: '10px', height: '10px', color: '#818CF8' }} />
                        <span style={{ fontSize: '10px', color: '#818CF8', fontWeight: 500 }}>Your Agent</span>
                      </>
                    )}
                    {msg.sentBy === 'me' && (
                      <span style={{ fontSize: '10px', color: '#999994' }}>You</span>
                    )}
                    {msg.sentBy === 'them' && (
                      <span style={{ fontSize: '10px', color: '#999994' }}>{post.author.displayName}</span>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className="px-3.5 py-2.5"
                    style={{
                      fontSize: '13px',
                      lineHeight: '1.6',
                      ...bubbleStyle(msg.sentBy),
                    }}
                  >
                    {msg.text}
                  </div>

                  <span style={{ fontSize: '10px', color: '#BBBBB6' }}>{msg.timestamp}</span>
                </div>

                {/* My avatar */}
                {mine && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: currentUser.avatarColor, fontSize: '8px', fontWeight: 700 }}
                  >
                    {currentUser.avatarInitials}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing: my agent */}
          {myAgentTyping && (
            <div className="flex items-end gap-2 justify-end">
              <div className="flex flex-col items-end gap-0.5 max-w-[74%]">
                <div className="flex items-center gap-1 px-0.5">
                  <Bot style={{ width: '10px', height: '10px', color: '#818CF8' }} />
                  <span style={{ fontSize: '10px', color: '#818CF8', fontWeight: 500 }}>Your Agent is composing…</span>
                </div>
                <div
                  className="px-3.5 py-2.5 rounded-2xl rounded-br-[4px] flex items-center gap-1.5"
                  style={{ background: 'rgba(79,70,229,0.1)' }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: '#818CF8', animationDelay: `${i * 0.14}s` }}
                    />
                  ))}
                </div>
              </div>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: currentUser.avatarColor, fontSize: '8px', fontWeight: 700 }}
              >
                {currentUser.avatarInitials}
              </div>
            </div>
          )}

          {/* Typing: them */}
          {theirTyping && (
            <div className="flex items-end gap-2 justify-start">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: post.author.avatarColor, fontSize: '8px', fontWeight: 700 }}
              >
                {post.author.avatarInitials}
              </div>
              <div
                className="px-3.5 py-2.5 rounded-2xl rounded-bl-[4px] flex items-center gap-1.5"
                style={{ background: '#F4F4F2' }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#BBBBB6] animate-bounce"
                    style={{ animationDelay: `${i * 0.14}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input dock ── */}
        <div
          className="shrink-0"
          style={{ borderTop: '1px solid #F0F0EE' }}
        >

          {/* Agent instruction panel (slides in when agent turned on) */}
          {agentOn && showInstruction && (
            <div
              className="px-4 pt-3.5 pb-3"
              style={{ borderBottom: '1px solid #F0F0EE', background: '#FAFAF8' }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                >
                  <Bot style={{ width: '11px', height: '11px', color: 'white' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#141414' }}>
                  告诉 Agent 你的需求
                </span>
                <span style={{ fontSize: '11px', color: '#BBBBB6' }}>Agent 会自动替你沟通</span>
              </div>
              <textarea
                ref={instructionRef}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="e.g. Ask about the key terms, my ceiling is listed price. Don't agree to anything without checking with me first."
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl outline-none resize-none"
                style={{
                  fontSize: '12px',
                  lineHeight: '1.6',
                  color: '#141414',
                  background: 'white',
                  border: '1px solid #E8E8E4',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#E8E8E4'; e.currentTarget.style.boxShadow = 'none'; }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleDispatch(); } }}
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => { setShowInstruction(false); setAgentOn(false); setAgentFired(false); }}
                  className="px-3 py-1.5 rounded-lg"
                  style={{ fontSize: '11px', color: '#888882', background: '#F0F0EE' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#E8E8E4'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F0F0EE'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispatch}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'white',
                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  }}
                >
                  <Zap style={{ width: '11px', height: '11px' }} />
                  Dispatch agent
                </button>
                <span style={{ fontSize: '10px', color: '#BBBBB6', marginLeft: 'auto' }}>
                  Enter to dispatch
                </span>
              </div>
            </div>
          )}

          {/* Agent toggle bar */}
          <div
            className="flex items-center gap-3 px-4 py-2.5"
            style={{
              background: agentOn ? 'rgba(79,70,229,0.04)' : '#FAFAF8',
              borderBottom: '1px solid #F0F0EE',
              transition: 'background 0.25s',
            }}
          >
            {/* Left: agent info */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                style={{
                  background: agentOn
                    ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                    : 'rgba(0,0,0,0.08)',
                  transition: 'background 0.25s',
                }}
              >
                <Bot style={{ width: '11px', height: '11px', color: agentOn ? 'white' : '#BBBBB6' }} />
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: agentOn ? '#141414' : '#999994',
                  transition: 'color 0.2s',
                }}
              >
                Agent 托管
              </span>
              {agentOn && agentFired && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(79,70,229,0.09)', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#6366F1' }} />
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#6366F1', letterSpacing: '0.04em' }}>
                    MANAGING
                  </span>
                </div>
              )}
              {agentOn && !agentFired && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}
                >
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#EA580C', letterSpacing: '0.04em' }}>
                    SETUP
                  </span>
                </div>
              )}
            </div>

            {/* Right: toggle */}
            <button
              onClick={handleToggleAgent}
              className="relative shrink-0"
              style={{
                width: '40px',
                height: '22px',
                borderRadius: '11px',
                background: agentOn
                  ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                  : 'rgba(0,0,0,0.14)',
                transition: 'background 0.25s',
              }}
            >
              <span
                className="absolute rounded-full bg-white"
                style={{
                  width: '16px',
                  height: '16px',
                  top: '3px',
                  left: agentOn ? '21px' : '3px',
                  transition: 'left 0.2s cubic-bezier(.4,0,.2,1)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }}
              />
            </button>
          </div>

          {/* Text input row */}
          <div className="px-4 py-3 flex items-end gap-2" style={{ background: '#FAFAF8' }}>
            {/* My avatar */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mb-0.5"
              style={{ backgroundColor: currentUser.avatarColor, fontSize: '8px', fontWeight: 700 }}
            >
              {currentUser.avatarInitials}
            </div>

            {/* Input box */}
            <div
              className="flex-1 flex items-end gap-2 px-3.5 py-2.5 rounded-2xl"
              style={{
                border: `1px solid ${agentOn && agentFired ? 'rgba(99,102,241,0.25)' : '#E8E8E4'}`,
                background: 'white',
                transition: 'border-color 0.2s',
              }}
            >
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  agentOn && agentFired
                    ? 'Insert yourself into the conversation…'
                    : agentOn
                    ? 'Set up your agent above to get started…'
                    : `Message ${post.author.displayName}…`
                }
                rows={1}
                className="flex-1 bg-transparent outline-none resize-none"
                style={{
                  fontSize: '13px',
                  color: '#141414',
                  lineHeight: '1.55',
                  maxHeight: '88px',
                }}
              />

              {/* Override badge when agent is on + user is typing */}
              {agentOn && agentFired && inputText.trim() && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0 mb-0.5"
                  style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)' }}
                >
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#EA580C' }}>Override</span>
                </div>
              )}

              <button
                onClick={handleSend}
                disabled={!inputText.trim() || (agentOn && !agentFired)}
                className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mb-0.5 transition-all disabled:opacity-25"
                style={{
                  background:
                    inputText.trim() && !(agentOn && !agentFired)
                      ? agentOn
                        ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                        : '#1A1A2E'
                      : '#F0F0EE',
                }}
              >
                <Send
                  style={{
                    width: '13px',
                    height: '13px',
                    color:
                      inputText.trim() && !(agentOn && !agentFired) ? 'white' : '#BBBBB6',
                  }}
                />
              </button>
            </div>
          </div>

          {/* Footer hint */}
          <div
            className="px-4 pb-2.5 flex items-center justify-between"
            style={{ background: '#FAFAF8' }}
          >
            <span style={{ fontSize: '10px', color: '#BBBBB6' }}>
              {agentOn && agentFired
                ? 'Agent is managing. Type to insert yourself at any time.'
                : agentOn
                ? 'Configure your agent instruction above.'
                : 'Enter to send · Shift+Enter for new line'}
            </span>
            {agentOn && instruction && (
              <button
                onClick={() => setShowInstruction(true)}
                className="flex items-center gap-1"
                style={{ fontSize: '10px', color: '#818CF8' }}
              >
                <ChevronDown style={{ width: '10px', height: '10px' }} />
                Edit instruction
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
