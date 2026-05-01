import { useState, useRef, useEffect } from 'react';
import { Send, Search, Bot, ArrowUpRight, Shield, ChevronRight } from 'lucide-react';
import { currentUser } from '../data/mockData';

/* ─── Types ─────────────────────────────────────────────────── */

type SentBy = 'my-agent' | 'me' | 'their-agent' | 'them' | 'system';

interface ChatMessage {
  id: string;
  sentBy: SentBy;
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  username: string;
  displayName: string;
  avatarInitials: string;
  avatarColor: string;
  talktoLink: string;
  postTitle: string;
  postCategory: string;
  unread: number;
  lastMessage: string;
  lastTime: string;
  agentActive: boolean;
  messages: ChatMessage[];
}

/* ─── Mock data ──────────────────────────────────────────────── */

const mockConversations: Conversation[] = [
  {
    id: 'c1',
    username: 'williams',
    displayName: 'Williams',
    avatarInitials: 'WL',
    avatarColor: '#1A1A2E',
    talktoLink: 'talkto.me/williams',
    postTitle: 'Founding Engineer · AI Infrastructure',
    postCategory: 'jobs',
    unread: 2,
    agentActive: true,
    lastMessage: 'Our team typically moves quickly — first call within 48h.',
    lastTime: '10:42 AM',
    messages: [
      {
        id: 's0', sentBy: 'system',
        text: 'A2A channel established via talkto.me · End-to-end encrypted',
        timestamp: 'Yesterday 2:58 PM',
      },
      {
        id: 's1', sentBy: 'my-agent',
        text: "Hello. I'm acting on behalf of my client. They have reviewed the Founding Engineer listing and believe their background is a strong fit — 6 years in distributed systems, led infra at a Series B. I'd like to surface a few questions before requesting direct contact.",
        timestamp: 'Yesterday 3:00 PM',
      },
      {
        id: 's2', sentBy: 'their-agent',
        text: "Hello. I represent the hiring team. Williams would love to learn more. Could you share scale of past systems and any open-source work?",
        timestamp: 'Yesterday 3:08 PM',
      },
      {
        id: 's3', sentBy: 'my-agent',
        text: 'My client handled ~50M events/day with a 4-person team. Their primary open-source contribution is a distributed tracing library with 2.3k stars on GitHub. Happy to share the link.',
        timestamp: 'Yesterday 3:22 PM',
      },
      {
        id: 's4', sentBy: 'their-agent',
        text: "Impressive. Williams would like to move to a direct call. What's the candidate's availability this week?",
        timestamp: 'Yesterday 4:01 PM',
      },
      {
        id: 's5', sentBy: 'me',
        text: "I can jump in here — I'm free Thursday afternoon or Friday morning. Either works.",
        timestamp: 'Yesterday 4:15 PM',
      },
      {
        id: 's6', sentBy: 'them',
        text: "Our team typically moves quickly — first call within 48h. Let's do Thursday 2 PM PT?",
        timestamp: '10:42 AM',
      },
    ],
  },
  {
    id: 'c2',
    username: 'meridith_k',
    displayName: 'Meridith K.',
    avatarInitials: 'MK',
    avatarColor: '#7C3AED',
    talktoLink: 'talkto.me/meridith_k',
    postTitle: 'MacBook Pro 14" M3 Pro · $1,850',
    postCategory: 'marketplace',
    unread: 0,
    agentActive: false,
    lastMessage: "The laptop is still available. When can you come by?",
    lastTime: 'Yesterday',
    messages: [
      {
        id: 's0', sentBy: 'system',
        text: 'A2A channel established via talkto.me · End-to-end encrypted',
        timestamp: 'Mon 11:18 AM',
      },
      {
        id: 's1', sentBy: 'my-agent',
        text: "Hello. I'm reaching out on behalf of my client regarding the MacBook Pro M3 Pro listing. They're interested and wondering if you'd accept $1,750 with local pickup.",
        timestamp: 'Mon 11:20 AM',
      },
      {
        id: 's2', sentBy: 'them',
        text: "Still available yes. I can do $1,800 but that's my floor — AppleCare+ is included.",
        timestamp: 'Mon 12:05 PM',
      },
      {
        id: 's3', sentBy: 'me',
        text: 'Fair enough. Can I pick it up this week?',
        timestamp: 'Mon 2:44 PM',
      },
      {
        id: 's4', sentBy: 'them',
        text: "The laptop is still available. When can you come by?",
        timestamp: 'Yesterday 9:15 AM',
      },
    ],
  },
  {
    id: 'c3',
    username: 'tariq_b',
    displayName: 'Tariq B.',
    avatarInitials: 'TB',
    avatarColor: '#0EA5E9',
    talktoLink: 'talkto.me/tariq_b',
    postTitle: 'LLM-powered Legal Research Tool · Co-founder',
    postCategory: 'projects',
    unread: 0,
    agentActive: true,
    lastMessage: "I'll send over the one-pager by end of day.",
    lastTime: 'Mon',
    messages: [
      {
        id: 's0', sentBy: 'system',
        text: 'A2A channel established via talkto.me · End-to-end encrypted',
        timestamp: 'Sun 6:28 PM',
      },
      {
        id: 's1', sentBy: 'their-agent',
        text: "Hello. I represent Tariq. His ML-powered legal research platform is pre-product with 2 firm pilots lined up. He's looking for a technical co-founder. Based on your profile, your background looks relevant.",
        timestamp: 'Sun 6:30 PM',
      },
      {
        id: 's2', sentBy: 'me',
        text: 'Interesting project. What stage are you at and what does the equity split look like?',
        timestamp: 'Sun 7:10 PM',
      },
      {
        id: 's3', sentBy: 'their-agent',
        text: "Tariq is open to 30–40% for the right technical co-founder. Currently pre-revenue but pilots are under NDA with two AmLaw 100 firms.",
        timestamp: 'Mon 9:00 AM',
      },
      {
        id: 's4', sentBy: 'me',
        text: "That's compelling. Can you share more about the pilots?",
        timestamp: 'Mon 10:15 AM',
      },
      {
        id: 's5', sentBy: 'them',
        text: "I'll send over the one-pager by end of day.",
        timestamp: 'Mon 11:02 AM',
      },
    ],
  },
  {
    id: 'c4',
    username: 'juno_p',
    displayName: 'Juno P.',
    avatarInitials: 'JP',
    avatarColor: '#D97706',
    talktoLink: 'talkto.me/juno_p',
    postTitle: 'Studio Sublease · Hayes Valley · $1,200/mo',
    postCategory: 'housing',
    unread: 1,
    agentActive: false,
    lastMessage: 'Move-in can be flexible within the first two weeks of March.',
    lastTime: 'Mon',
    messages: [
      {
        id: 's0', sentBy: 'system',
        text: 'A2A channel established via talkto.me · End-to-end encrypted',
        timestamp: 'Sun 3:58 PM',
      },
      {
        id: 's1', sentBy: 'my-agent',
        text: "Hello. I'm acting on behalf of my client regarding the Hayes Valley studio sublease. They're interested in a March 1st move-in and wanted to ask: are utilities included? And is the $1,200 firm?",
        timestamp: 'Sun 4:00 PM',
      },
      {
        id: 's2', sentBy: 'them',
        text: 'Hi! Yes still available. March 1st works. Utilities not included but I can bundle for ~$100/mo extra.',
        timestamp: 'Sun 5:30 PM',
      },
      {
        id: 's3', sentBy: 'me',
        text: "I'd prefer utilities included if possible. Is the $1,200 negotiable at all?",
        timestamp: 'Sun 6:45 PM',
      },
      {
        id: 's4', sentBy: 'them',
        text: 'Move-in can be flexible within the first two weeks of March.',
        timestamp: 'Mon 8:55 AM',
      },
    ],
  },
];

const theirReplies: Record<string, string[]> = {
  c1: [
    "Thursday 2 PM works perfectly. I'll send a calendar invite to the address on your profile.",
    "Looking forward to it. The call will be with our CTO and one of the lead engineers.",
  ],
  c2: [
    "Saturday or Sunday afternoon works for me. Just send a message when you're on the way.",
    "I can also do a quick video call first if you want to see it before coming over.",
  ],
  c3: [
    "One-pager is on its way. Also happy to set up an async voice note if that's easier.",
    "The two pilots are with firms you'd recognize. Happy to share more under NDA.",
  ],
  c4: [
    "Let me think about the utilities. Can you share a bit about yourself and your situation?",
    "I'd also want a 3-month minimum. Is that workable for you?",
  ],
};

/* ─── Helpers ────────────────────────────────────────────────── */

function nowStr(): string {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const isMine = (s: SentBy) => s === 'me' || s === 'my-agent';
const isSystem = (s: SentBy) => s === 'system';

const categoryColor: Record<string, string> = {
  jobs: '#818CF8',
  projects: '#A78BFA',
  marketplace: '#FB923C',
  skills: '#4ADE80',
  housing: '#2DD4BF',
  events: '#FB7185',
};

/* ─── Component ──────────────────────────────────────────────── */

export function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedId, setSelectedId] = useState<string>(mockConversations[0].id);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [agentOn, setAgentOn] = useState(true);
  const [theirTyping, setTheirTyping] = useState(false);
  const [replyCounters, setReplyCounters] = useState<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selected = conversations.find((c) => c.id === selectedId) ?? conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.messages.length, selectedId, theirTyping]);

  useEffect(() => {
    setAgentOn(true);
    setInputText('');
  }, [selectedId]);

  const handleSelect = (conv: Conversation) => {
    setSelectedId(conv.id);
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
    );
  };

  const scheduleTheirReply = (convId: string) => {
    setTheirTyping(true);
    const delay = 1800 + Math.random() * 900;
    setTimeout(() => {
      setTheirTyping(false);
      const pool = theirReplies[convId] ?? ["Thanks, I'll follow up shortly."];
      const idx = replyCounters[convId] ?? 0;
      const text = pool[idx % pool.length];
      setReplyCounters((prev) => ({ ...prev, [convId]: idx + 1 }));

      const convObj = conversations.find((c) => c.id === convId);
      const sentBy: SentBy = convObj?.agentActive ? 'their-agent' : 'them';

      const newMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        sentBy,
        text,
        timestamp: nowStr(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, lastTime: nowStr() }
            : c
        )
      );
    }, delay);
  };

  const handleSend = () => {
    if (!inputText.trim() || !selectedId) return;
    const sentBy: SentBy = agentOn ? 'my-agent' : 'me';
    const text = inputText.trim();
    const newMsg: ChatMessage = {
      id: `send-${Date.now()}`,
      sentBy,
      text,
      timestamp: nowStr(),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, lastTime: nowStr() }
          : c
      )
    );
    setInputText('');
    scheduleTheirReply(selectedId);
    textareaRef.current?.focus();
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);
  const filtered = conversations.filter(
    (c) =>
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.postTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="flex"
      style={{ height: 'calc(100vh - 56px)', background: '#F6F5F0', overflow: 'hidden' }}
    >
      {/* ── Left sidebar ── */}
      <div
        className="flex flex-col shrink-0"
        style={{ width: '280px', borderRight: '1px solid rgba(0,0,0,0.07)' }}
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            {/* talkto.me logotype */}
            <div className="flex items-center gap-2.5">
              {/* Speech-link mark */}
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="20" height="14" rx="5" stroke="#4F46E5" strokeWidth="1.6" fill="none"/>
                <path d="M4 19 C4 19 5 15 9 15 L13 15" stroke="#4F46E5" strokeWidth="1.6" strokeLinecap="round"/>
                <circle cx="7" cy="8" r="1.3" fill="#4F46E5"/>
                <circle cx="11" cy="8" r="1.3" fill="#4F46E5"/>
                <circle cx="15" cy="8" r="1.3" fill="#4F46E5"/>
              </svg>
              <div>
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #818CF8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1,
                  }}
                >
                  talkto.me
                </span>
              </div>
            </div>
            {totalUnread > 0 && (
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 6px',
                  background: '#4F46E5',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'white',
                }}
              >
                {totalUnread}
              </div>
            )}
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.05)' }}
          >
            <Search style={{ width: '13px', height: '13px', color: '#ADADAA', flexShrink: 0 }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations…"
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: '13px', color: '#141414' }}
            />
          </div>
        </div>

        {/* talkto.me badge */}
        <div className="px-5 mb-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#6366F1',
                letterSpacing: '-0.04em',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              talkto.me
            </div>
            <div style={{ width: '1px', height: '10px', background: 'rgba(99,102,241,0.2)' }} />
            <Shield style={{ width: '10px', height: '10px', color: '#818CF8' }} />
            <span style={{ fontSize: '10px', color: '#818CF8', fontWeight: 500 }}>A2A encrypted</span>
            <div className="ml-auto flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#22C55E', boxShadow: '0 0 5px #22C55E' }}
              />
              <span style={{ fontSize: '9px', color: '#16A34A', fontWeight: 600 }}>Live</span>
            </div>
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {filtered.map((conv) => {
            const isActive = conv.id === selectedId;
            const catColor = categoryColor[conv.postCategory] ?? '#ADADAA';
            return (
              <button
                key={conv.id}
                onClick={() => handleSelect(conv)}
                className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all relative"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.9)' : 'transparent',
                  borderLeft: isActive ? '2px solid #6366F1' : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.5)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                {/* Avatar */}
                <div className="relative shrink-0 mt-0.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: conv.avatarColor, fontSize: '11px', fontWeight: 700 }}
                  >
                    {conv.avatarInitials}
                  </div>
                  {conv.agentActive && (
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                        border: '1.5px solid #F6F5F0',
                      }}
                    >
                      <Bot style={{ width: '7px', height: '7px', color: 'white' }} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: conv.unread > 0 ? 700 : 600,
                        color: '#141414',
                      }}
                    >
                      {conv.displayName}
                    </span>
                    <span style={{ fontSize: '10px', color: '#BBBBB6', flexShrink: 0 }}>
                      {conv.lastTime}
                    </span>
                  </div>

                  {/* Post context pill */}
                  <div className="flex items-center gap-1 mb-1.5">
                    <div
                      className="w-1 h-1 rounded-full shrink-0"
                      style={{ backgroundColor: catColor }}
                    />
                    <span
                      className="truncate"
                      style={{ fontSize: '10px', color: '#ADADAA' }}
                    >
                      {conv.postTitle}
                    </span>
                  </div>

                  <p
                    className="truncate"
                    style={{
                      fontSize: '12px',
                      color: conv.unread > 0 ? '#444440' : '#ADADAA',
                      fontWeight: conv.unread > 0 ? 500 : 400,
                    }}
                  >
                    {conv.lastMessage}
                  </p>
                </div>

                {/* Unread dot */}
                {conv.unread > 0 && (
                  <div
                    className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-1"
                    style={{
                      background: '#4F46E5',
                      fontSize: '8px',
                      fontWeight: 700,
                      color: 'white',
                    }}
                  >
                    {conv.unread}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Thread panel ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white" style={{ borderRight: '1px solid rgba(0,0,0,0.06)' }}>

        {/* Thread header */}
        <div
          className="shrink-0 flex items-center gap-4 px-6 py-4"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: selected.avatarColor, fontSize: '11px', fontWeight: 700 }}
            >
              {selected.avatarInitials}
            </div>
            {selected.agentActive && (
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  border: '1.5px solid white',
                }}
              >
                <Bot style={{ width: '7px', height: '7px', color: 'white' }} />
              </div>
            )}
          </div>

          {/* Name + context */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#141414' }}>
                {selected.displayName}
              </span>
              {selected.agentActive && (
                <div
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(79,70,229,0.07)',
                    border: '1px solid rgba(99,102,241,0.18)',
                  }}
                >
                  <Bot style={{ width: '8px', height: '8px', color: '#6366F1' }} />
                  <span style={{ fontSize: '9px', fontWeight: 600, color: '#6366F1' }}>
                    Agent active
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: categoryColor[selected.postCategory] ?? '#ADADAA' }}
              />
              <span
                className="truncate"
                style={{ fontSize: '11px', color: '#ADADAA' }}
              >
                {selected.postTitle}
              </span>
            </div>
          </div>

          {/* talkto.me link */}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
            style={{
              fontSize: '11px',
              color: '#6366F1',
              background: 'rgba(79,70,229,0.06)',
              border: '1px solid rgba(99,102,241,0.14)',
              fontFamily: 'ui-monospace, monospace',
              fontWeight: 600,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(79,70,229,0.1)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(79,70,229,0.06)'; }}
          >
            {selected.talktoLink}
            <ArrowUpRight style={{ width: '11px', height: '11px' }} />
          </a>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.06) transparent' }}
        >
          {selected.messages.map((msg) => {
            if (isSystem(msg.sentBy)) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(79,70,229,0.05)',
                      border: '1px solid rgba(99,102,241,0.12)',
                    }}
                  >
                    <Shield style={{ width: '9px', height: '9px', color: '#818CF8' }} />
                    <span style={{ fontSize: '10px', color: '#818CF8' }}>{msg.text}</span>
                    <span style={{ fontSize: '10px', color: '#C4C4BF' }}>· {msg.timestamp}</span>
                  </div>
                </div>
              );
            }

            const mine = isMine(msg.sentBy);
            const isAgent = msg.sentBy === 'my-agent' || msg.sentBy === 'their-agent';

            return (
              <div key={msg.id} className={`flex items-end gap-2.5 ${mine ? 'justify-end' : 'justify-start'}`}>

                {/* Their avatar */}
                {!mine && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: selected.avatarColor, fontSize: '9px', fontWeight: 700 }}
                  >
                    {selected.avatarInitials}
                  </div>
                )}

                <div className={`flex flex-col gap-1 max-w-[68%] ${mine ? 'items-end' : 'items-start'}`}>
                  {/* Sender label */}
                  <div className="flex items-center gap-1.5 px-1">
                    {msg.sentBy === 'my-agent' && (
                      <>
                        <Bot style={{ width: '9px', height: '9px', color: '#818CF8' }} />
                        <span style={{ fontSize: '10px', color: '#818CF8', fontWeight: 500 }}>Your Agent</span>
                      </>
                    )}
                    {msg.sentBy === 'me' && (
                      <span style={{ fontSize: '10px', color: '#ADADAA' }}>You</span>
                    )}
                    {msg.sentBy === 'their-agent' && (
                      <>
                        <Bot style={{ width: '9px', height: '9px', color: '#6366F1' }} />
                        <span style={{ fontSize: '10px', color: '#6366F1', fontWeight: 500 }}>
                          {selected.displayName}'s Agent
                        </span>
                      </>
                    )}
                    {msg.sentBy === 'them' && (
                      <span style={{ fontSize: '10px', color: '#ADADAA' }}>{selected.displayName}</span>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className="px-4 py-2.5 rounded-2xl"
                    style={{
                      fontSize: '13px',
                      lineHeight: '1.65',
                      ...(msg.sentBy === 'my-agent' ? {
                        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                        color: 'white',
                        borderBottomRightRadius: '5px',
                      } : msg.sentBy === 'me' ? {
                        background: '#141414',
                        color: 'white',
                        borderBottomRightRadius: '5px',
                      } : msg.sentBy === 'their-agent' ? {
                        background: 'rgba(79,70,229,0.06)',
                        color: '#141414',
                        border: '1px solid rgba(99,102,241,0.16)',
                        borderBottomLeftRadius: '5px',
                      } : {
                        background: '#F4F4F2',
                        color: '#141414',
                        borderBottomLeftRadius: '5px',
                      }),
                    }}
                  >
                    {/* Agent gradient overlay line for agent messages */}
                    {isAgent && mine && (
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0"
                        style={{ borderBottomRightRadius: '5px' }}
                      />
                    )}
                    {msg.text}
                  </div>

                  <span style={{ fontSize: '10px', color: '#C4C4BF' }}>{msg.timestamp}</span>
                </div>

                {/* My avatar */}
                {mine && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: currentUser.avatarColor, fontSize: '9px', fontWeight: 700 }}
                  >
                    {currentUser.avatarInitials}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {theirTyping && (
            <div className="flex items-end gap-2.5 justify-start">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: selected.avatarColor, fontSize: '9px', fontWeight: 700 }}
              >
                {selected.avatarInitials}
              </div>
              <div
                className="px-4 py-3 rounded-2xl rounded-bl-[5px] flex items-center gap-1.5"
                style={{ background: '#F4F4F2' }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: '#C4C4BF', animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Composer ── */}
        <div
          className="shrink-0"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          {/* Agent toggle bar */}
          <div
            className="flex items-center gap-3 px-5 py-2.5"
            style={{
              borderBottom: '1px solid rgba(0,0,0,0.04)',
              background: agentOn ? 'rgba(79,70,229,0.025)' : 'transparent',
              transition: 'background 0.25s',
            }}
          >
            <button
              onClick={() => setAgentOn((v) => !v)}
              className="flex items-center gap-2.5 flex-1 text-left"
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: agentOn
                    ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                    : 'rgba(0,0,0,0.07)',
                }}
              >
                <Bot style={{ width: '12px', height: '12px', color: agentOn ? 'white' : '#ADADAA' }} />
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: agentOn ? '#4F46E5' : '#ADADAA',
                  transition: 'color 0.2s',
                }}
              >
                Agent mode
              </span>
              {agentOn && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(79,70,229,0.08)',
                    border: '1px solid rgba(99,102,241,0.18)',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: '#6366F1' }}
                  />
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#6366F1', letterSpacing: '0.04em' }}>
                    ON
                  </span>
                </div>
              )}
            </button>

            {/* Toggle pill */}
            <button
              onClick={() => setAgentOn((v) => !v)}
              style={{
                width: '38px',
                height: '22px',
                borderRadius: '11px',
                background: agentOn
                  ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                  : 'rgba(0,0,0,0.12)',
                position: 'relative',
                flexShrink: 0,
                transition: 'background 0.2s',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  width: '16px',
                  height: '16px',
                  borderRadius: '8px',
                  background: 'white',
                  top: '3px',
                  left: agentOn ? '19px' : '3px',
                  transition: 'left 0.2s cubic-bezier(.4,0,.2,1)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                }}
              />
            </button>
          </div>

          {/* Input row */}
          <div className="px-5 py-3 flex items-end gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 mb-0.5"
              style={{ backgroundColor: currentUser.avatarColor, fontSize: '9px', fontWeight: 700 }}
            >
              {currentUser.avatarInitials}
            </div>

            <div
              className="flex-1 flex items-end gap-2 px-4 py-2.5 rounded-2xl transition-all"
              style={{
                border: `1px solid ${agentOn ? 'rgba(99,102,241,0.25)' : 'rgba(0,0,0,0.1)'}`,
                background: agentOn ? 'rgba(79,70,229,0.02)' : '#FAFAF8',
              }}
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  agentOn
                    ? 'Give your agent an instruction…'
                    : 'Write a message…'
                }
                className="flex-1 bg-transparent outline-none resize-none"
                style={{
                  fontSize: '13px',
                  color: '#141414',
                  lineHeight: '1.55',
                  minHeight: '22px',
                  maxHeight: '120px',
                }}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: inputText.trim()
                  ? agentOn
                    ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                    : '#141414'
                  : 'rgba(0,0,0,0.07)',
                boxShadow: inputText.trim() ? '0 2px 10px rgba(79,70,229,0.25)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {agentOn ? (
                <ChevronRight
                  style={{ width: '15px', height: '15px', color: inputText.trim() ? 'white' : '#ADADAA' }}
                />
              ) : (
                <Send
                  style={{ width: '13px', height: '13px', color: inputText.trim() ? 'white' : '#ADADAA' }}
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}