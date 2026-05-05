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
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function seedConversation(post: Post): ChatMessage[] {
  const ts = (label: string): string => label;
  return [
    {
      id: 's0',
      side: 'them',
      text: `你好 —— 谢谢你对"${post.title}"感兴趣。想了解什么？`,
      timestamp: ts('昨天 16:12'),
      sender: 'user',
    },
    {
      id: 's1',
      side: 'me',
      text: `你好。我有兴趣，决定前想确认几个问题。能否先过一下关键信息？`,
      timestamp: ts('昨天 16:35'),
      sender: 'agent',
    },
    {
      id: 's2',
      side: 'them',
      text: '当然，请说。',
      timestamp: ts('昨天 16:40'),
      sender: 'user',
    },
  ];
}

// Simulate the other party replying after a short delay
const autoReplies: string[] = [
  '有道理，我看一下再回你。',
  '可以，时间安排我能配合，你有什么计划？',
  '说得不错——我之前没从这个角度考虑过，我想想。',
  '可以进一步聊聊。你什么时候方便通个电话？',
  '同意，我想我们能找到一致的方案。',
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
          '了解。在推进前，我的委托人想确认下物品成色和是否优先本地自取。',
          '请澄清下付款方式？这些确认后我的委托人可以快速推进。',
        ],
        jobs: [
          '我的委托人已仔细阅读了招聘信息。约电话前，能否介绍下当前团队结构和技术栈？',
          '已记下。我的委托人接受现场办公的要求。后续面试流程是怎样的？',
        ],
        housing: [
          '我的委托人想确认：挂牌的入住日期可否前后浮动一周？是否含水电？',
          '了解。我的委托人准备推进——是否方便约个看房？',
        ],
        projects: [
          '我的委托人确实有兴趣。继续之前，能否分享下技术合作者的股权结构？',
          '与我委托人的档期匹配，他们每周可投入 10 小时以上。下一步如何安排？',
        ],
      };
      const pool = agentResponses[post.category] ?? [
        '我的委托人已查看你的消息，想推进。下一步能分享哪些信息？',
        '了解。我的委托人有意，从他们那边需要什么来推进？',
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
                关于：{post.title.length > 52 ? post.title.slice(0, 52) + '…' : post.title}
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
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#16A34A' }}>实时</span>
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
                          <span style={{ fontSize: '10px', color: '#999994' }}>由 Agent 发送</span>
                        </>
                      ) : (
                        <>
                          <User style={{ width: '10px', height: '10px', color: '#888882' }} />
                          <span style={{ fontSize: '10px', color: '#999994' }}>你</span>
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
                  <span style={{ fontSize: '10px', color: '#999994' }}>Agent 正在输入…</span>
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
                    托管中
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
                ? 'Agent 托管中，你随时可以直接输入接管对话。'
                : '手动模式 —— 你的消息直接发送，不经 Agent。'}
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
                    ? `随时接管对话…`
                    : `发消息给 ${post.author.displayName}…`
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
                    <span style={{ fontSize: '9px', fontWeight: 600, color: '#6366F1' }}>接管</span>
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
