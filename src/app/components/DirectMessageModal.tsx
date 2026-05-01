import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Radio, Sparkles, Shield } from 'lucide-react';
import { currentUser } from '../data/mockData';
import type { Post } from '../data/mockData';

interface ChatMessage {
  id: string;
  side: 'me' | 'them';
  text: string;
  timestamp: string;
  sender: 'user' | 'agent'; // who on "my side" sent it
}

function now(): string {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function seedConversation(post: Post): ChatMessage[] {
  const ts = (label: string): string => label;
  return [
    {
      id: 's0',
      side: 'them',
      text: `Hi — thanks for reaching out about "${post.title}". What would you like to know?`,
      timestamp: ts('Yesterday 4:12 PM'),
      sender: 'user',
    },
    {
      id: 's1',
      side: 'me',
      text: `Hello. I'm interested and had a few questions before committing. Can we go over the key details?`,
      timestamp: ts('Yesterday 4:35 PM'),
      sender: 'agent',
    },
    {
      id: 's2',
      side: 'them',
      text: 'Of course. Go ahead.',
      timestamp: ts('Yesterday 4:40 PM'),
      sender: 'user',
    },
  ];
}

// Simulate the other party replying after a short delay
const autoReplies: string[] = [
  'That makes sense. Let me check on that and get back to you.',
  'Sure, I can work with that. What timeline are you thinking?',
  'Good point — I hadn\'t considered that. Let me think about it.',
  'Happy to discuss further. When are you available for a quick call?',
  'Agreed. I think we can find common ground here.',
];

interface Props {
  post: Post;
  onClose: () => void;
}

export function DirectMessageModal({ post, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => seedConversation(post));
  const [inputText, setInputText] = useState('');
  const [agentManaged, setAgentManaged] = useState(true);
  const [agentTyping, setAgentTyping] = useState(false);
  const [theirTyping, setTheirTyping] = useState(false);
  const [replyIndex, setReplyIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, agentTyping, theirTyping]);

  // When agent mode is turned on, simulate agent composing a message after 1.5s
  useEffect(() => {
    if (!agentManaged) return;
    // Check if last message was from "them" — if so, agent auto-responds
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.side !== 'them') return;

    setAgentTyping(true);
    const t = setTimeout(() => {
      setAgentTyping(false);
      const agentResponses: Record<string, string[]> = {
        marketplace: [
          'Understood. My client would like to confirm the item condition and whether local pickup is preferred before we move forward.',
          'Could you clarify the payment terms? My client is ready to proceed quickly if those are confirmed.',
        ],
        jobs: [
          'My client has reviewed the listing carefully. Before scheduling a call, could you share the current team structure and any technical stack details?',
          'Noted. My client is open to the on-site requirement. What does the interview process look like from here?',
        ],
        housing: [
          'My client would like to confirm: is the listed move-in date flexible by a week? And are any utilities included?',
          'Understood. My client is prepared to move forward — shall we schedule a viewing?',
        ],
        projects: [
          'My client is genuinely interested. Before going further, can you share what the equity structure looks like for a technical collaborator?',
          'That aligns well with my client\'s availability. They can commit 10+ hours per week. What\'s the next step?',
        ],
      };
      const pool = agentResponses[post.category] ?? [
        'My client has reviewed your message and would like to proceed. What information can you share next?',
        'Understood. My client is interested — what would you need from them to move this forward?',
      ];
      const text = pool[Math.floor(Math.random() * pool.length)];
      const msg: ChatMessage = {
        id: `agent-${Date.now()}`,
        side: 'me',
        text,
        timestamp: now(),
        sender: 'agent',
      };
      setMessages((prev) => [...prev, msg]);
      // Trigger their reply
      simulateTheirReply();
    }, 1800);
    return () => clearTimeout(t);
  }, [agentManaged]);

  function simulateTheirReply() {
    setTheirTyping(true);
    setTimeout(() => {
      setTheirTyping(false);
      const text = autoReplies[replyIndex % autoReplies.length];
      setReplyIndex((i) => i + 1);
      setMessages((prev) => [
        ...prev,
        { id: `them-${Date.now()}`, side: 'them', text, timestamp: now(), sender: 'user' },
      ]);
    }, 2400 + Math.random() * 1000);
  }

  function handleSend() {
    if (!inputText.trim()) return;
    const msg: ChatMessage = {
      id: `me-${Date.now()}`,
      side: 'me',
      text: inputText.trim(),
      timestamp: now(),
      sender: agentManaged ? 'agent' : 'user', // if agent managed mode, label it agent even if user typed
    };
    setMessages((prev) => [...prev, msg]);
    setInputText('');
    // Simulate their reply
    simulateTheirReply();
    textareaRef.current?.focus();
  }

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
          maxWidth: '560px',
          height: '600px',
          background: '#FFFFFF',
          boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.07)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="shrink-0 px-5 py-3.5 flex items-center justify-between gap-3"
          style={{ borderBottom: '1px solid #F0F0EE' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: post.author.avatarColor, fontSize: '11px', fontWeight: 700 }}
            >
              {post.author.avatarInitials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#141414' }}>
                  {post.author.displayName}
                </span>
                {post.author.verified && (
                  <Shield style={{ width: '12px', height: '12px', color: '#6366F1' }} strokeWidth={2.5} />
                )}
              </div>
              <p className="truncate" style={{ fontSize: '11px', color: '#999994', marginTop: '1px' }}>
                re: {post.title.length > 52 ? post.title.slice(0, 52) + '…' : post.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Live indicator */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#16A34A' }}>Live</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ color: '#999994', background: '#F6F5F0' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#EBEBEA'; (e.currentTarget as HTMLButtonElement).style.color = '#141414'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F6F5F0'; (e.currentTarget as HTMLButtonElement).style.color = '#999994'; }}
            >
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>

        {/* ── Message stream ── */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.08) transparent' }}
        >
          {messages.map((msg) => {
            const isMe = msg.side === 'me';
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {/* Their avatar */}
                {!isMe && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mb-0.5"
                    style={{ backgroundColor: post.author.avatarColor, fontSize: '8px', fontWeight: 700 }}
                  >
                    {post.author.avatarInitials}
                  </div>
                )}

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {/* Sender label */}
                  {isMe && (
                    <div className="flex items-center gap-1 mb-1">
                      {msg.sender === 'agent' ? (
                        <>
                          <Bot style={{ width: '10px', height: '10px', color: '#818CF8' }} />
                          <span style={{ fontSize: '10px', color: '#999994' }}>via Agent</span>
                        </>
                      ) : (
                        <>
                          <User style={{ width: '10px', height: '10px', color: '#888882' }} />
                          <span style={{ fontSize: '10px', color: '#999994' }}>You</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className="px-3.5 py-2.5 rounded-2xl"
                    style={{
                      fontSize: '13px',
                      lineHeight: '1.6',
                      color: isMe ? 'white' : '#141414',
                      background: isMe
                        ? msg.sender === 'agent'
                          ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                          : '#1A1A2E'
                        : '#F4F4F2',
                      borderBottomRightRadius: isMe ? '4px' : '16px',
                      borderBottomLeftRadius: isMe ? '16px' : '4px',
                    }}
                  >
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '10px', color: '#BBBBB6', marginTop: '3px' }}>
                    {msg.timestamp}
                  </span>
                </div>

                {/* My avatar */}
                {isMe && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mb-0.5"
                    style={{ backgroundColor: currentUser.avatarColor, fontSize: '8px', fontWeight: 700 }}
                  >
                    {currentUser.avatarInitials}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicators */}
          {agentTyping && (
            <div className="flex items-end gap-2 justify-end">
              <div className="flex flex-col items-end max-w-[75%]">
                <div className="flex items-center gap-1 mb-1">
                  <Bot style={{ width: '10px', height: '10px', color: '#818CF8' }} />
                  <span style={{ fontSize: '10px', color: '#999994' }}>Agent composing…</span>
                </div>
                <div
                  className="px-3.5 py-2.5 rounded-2xl rounded-br-[4px] flex items-center gap-1.5"
                  style={{ background: 'rgba(79,70,229,0.12)' }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mb-0.5"
                style={{ backgroundColor: currentUser.avatarColor, fontSize: '8px', fontWeight: 700 }}
              >
                {currentUser.avatarInitials}
              </div>
            </div>
          )}

          {theirTyping && (
            <div className="flex items-end gap-2 justify-start">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mb-0.5"
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
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input area ── */}
        <div
          className="shrink-0"
          style={{ borderTop: '1px solid #F0F0EE', background: '#FAFAF8' }}
        >
          {/* Agent 托管 toggle bar */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: '1px solid #F0F0EE' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{
                  background: agentManaged
                    ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                    : 'rgba(0,0,0,0.08)',
                  transition: 'background 0.25s',
                }}
              >
                <Bot style={{ width: '11px', height: '11px', color: agentManaged ? 'white' : '#BBBBB6' }} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: agentManaged ? '#141414' : '#999994' }}>
                Agent 托管
              </span>
              {agentManaged && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.14)' }}
                >
                  <Radio style={{ width: '8px', height: '8px', color: '#6366F1' }} />
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#6366F1', letterSpacing: '0.04em' }}>
                    ACTIVE
                  </span>
                </div>
              )}
            </div>

            {/* Toggle switch */}
            <button
              onClick={() => setAgentManaged((v) => !v)}
              className="relative flex items-center transition-all"
              style={{
                width: '40px',
                height: '22px',
                borderRadius: '11px',
                background: agentManaged
                  ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                  : 'rgba(0,0,0,0.14)',
                transition: 'background 0.25s',
              }}
            >
              <span
                className="absolute rounded-full bg-white shadow-sm"
                style={{
                  width: '16px',
                  height: '16px',
                  left: agentManaged ? '21px' : '3px',
                  transition: 'left 0.2s cubic-bezier(.4,0,.2,1)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                }}
              />
            </button>
          </div>

          {/* Mode hint */}
          <div className="px-4 pt-2.5 pb-0">
            <p style={{ fontSize: '10px', color: '#BBBBB6' }}>
              {agentManaged
                ? 'Agent is managing this conversation. You can still type to insert yourself anytime.'
                : 'Manual mode — your messages go directly without agent involvement.'}
            </p>
          </div>

          {/* Text input */}
          <div className="px-4 pt-2 pb-3 flex items-end gap-2">
            {/* Sender avatar */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mb-0.5"
              style={{ backgroundColor: currentUser.avatarColor, fontSize: '8px', fontWeight: 700 }}
            >
              {currentUser.avatarInitials}
            </div>

            <div
              className="flex-1 flex items-end gap-2 px-3 py-2 rounded-2xl"
              style={{ border: '1px solid #E8E8E4', background: 'white' }}
              onFocus={() => {}}
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
                  agentManaged
                    ? `Insert yourself into the conversation…`
                    : `Message ${post.author.displayName}…`
                }
                rows={1}
                className="flex-1 bg-transparent outline-none resize-none"
                style={{
                  fontSize: '13px',
                  color: '#141414',
                  lineHeight: '1.55',
                  maxHeight: '80px',
                }}
              />
              <div className="flex items-center gap-1.5 shrink-0">
                {agentManaged && inputText.trim() && (
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.14)' }}
                  >
                    <Sparkles style={{ width: '9px', height: '9px', color: '#6366F1' }} />
                    <span style={{ fontSize: '9px', fontWeight: 600, color: '#6366F1' }}>Override</span>
                  </div>
                )}
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="w-7 h-7 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                  style={{
                    background: inputText.trim()
                      ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                      : '#F0F0EE',
                  }}
                >
                  <Send
                    style={{
                      width: '13px',
                      height: '13px',
                      color: inputText.trim() ? 'white' : '#BBBBB6',
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
