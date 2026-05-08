import { useState, useEffect, useRef } from 'react';
import {
  X, Send, Paperclip, ImagePlus, Bot, User,
  CheckCircle2, Circle, Loader2, Sparkles,
  MapPin, DollarSign, Tag, FileText, Package,
  ArrowUpRight, ShieldCheck, Zap, Radio, ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// ─── Types ──────────────────────────────────────────────────────────────────

type Phase =
  | 'welcome'
  | 'analyzing'
  | 'gathering_price'
  | 'gathering_condition'
  | 'gathering_location'
  | 'draft_ready'
  | 'publishing'
  | 'published'
  | 'offer_incoming'
  | 'negotiating'
  | 'agent_negotiating'
  | 'decision'
  | 'deal_done';

interface ChatMsg {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  image?: string;
  typing?: boolean;
  actions?: { label: string; primary?: boolean; handler: () => void }[];
  offer?: { from: string; amount: string; note: string };
}

interface DraftField {
  key: string;
  label: string;
  value: string;
  filled: boolean;
  loading?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _id = 0;
function uid() { return `msg-${++_id}`; }

function TypingBubble() {
  return (
    <div className="flex items-end gap-2">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
      >
        <Bot style={{ width: '13px', height: '13px', color: 'white' }} />
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)' }}
      >
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#ADADAA]"
              style={{ animation: `bounce 1.2s ease-in-out ${i * 0.18}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface Props { onClose: () => void; }

export function AgentPostModal({ onClose }: Props) {
  const { lang } = useLanguage();
  const zh = lang === 'zh';

  const [phase, setPhase] = useState<Phase>('welcome');
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState<DraftField[]>([
    { key: 'title',     label: zh ? '标题'     : 'Title',     value: '', filled: false },
    { key: 'category',  label: zh ? '分类'     : 'Category',  value: '', filled: false },
    { key: 'price',     label: zh ? '价格'     : 'Price',     value: '', filled: false },
    { key: 'condition', label: zh ? '成色'     : 'Condition', value: '', filled: false },
    { key: 'location',  label: zh ? '地点'     : 'Location',  value: '', filled: false },
    { key: 'body',      label: zh ? '正文描述' : 'Description', value: '', filled: false },
  ]);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [offerState, setOfferState] = useState({ amount: '', counter: '', from: '' });
  const [negotiationLog, setNegotiationLog] = useState<string[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Init
  useEffect(() => {
    setTimeout(() => {
      addAgent(
        zh
          ? '你好，Williams！我是你的发布助手。你想卖什么？直接描述，或者上传一张照片，我来帮你完成剩余步骤。'
          : "Hi Williams! I'm your posting agent. What would you like to sell? Describe it, or upload a photo — I'll handle the rest."
      );
    }, 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Message helpers ────────────────────────────────────────────────────────

  function addAgent(text: string, actions?: ChatMsg['actions'], offer?: ChatMsg['offer']) {
    setMessages(prev => [...prev, { id: uid(), role: 'agent', text, actions, offer }]);
  }
  function addUser(text: string, image?: string) {
    setMessages(prev => [...prev, { id: uid(), role: 'user', text, image }]);
  }
  function addSystem(text: string) {
    setMessages(prev => [...prev, { id: uid(), role: 'system', text }]);
  }
  function agentTypeThen(delay: number, fn: () => void) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      fn();
    }, delay);
  }
  function updateDraftField(key: string, value: string, loadFirst = true) {
    if (loadFirst) {
      setDraft(prev => prev.map(f => f.key === key ? { ...f, loading: true } : f));
      setTimeout(() => {
        setDraft(prev => prev.map(f => f.key === key ? { ...f, value, filled: true, loading: false } : f));
      }, 700);
    } else {
      setDraft(prev => prev.map(f => f.key === key ? { ...f, value, filled: true, loading: false } : f));
    }
  }

  // ── Flow handlers ──────────────────────────────────────────────────────────

  function handleImageUpload() {
    // Simulate photo upload
    setShowImagePreview(true);
    addUser(zh ? '（上传了一张图片）' : '(uploaded a photo)', 'photo');
    setPhase('analyzing');

    agentTypeThen(1200, () => {
      addAgent(zh
        ? '好的，我识别到这是一台 MacBook Pro M3 Max，16 英寸，深空黑色。让我来帮你起草发布信息…'
        : "Got it — I can see this is a **MacBook Pro M3 Max**, 16-inch, Space Black. Let me start building your listing…"
      );

      // Auto-fill some fields
      setTimeout(() => updateDraftField('title', zh ? 'MacBook Pro M3 Max 16 英寸 — 深空黑' : 'MacBook Pro M3 Max 16" — Space Black'), 400);
      setTimeout(() => updateDraftField('category', zh ? '二手市场 · 出售' : 'Marketplace · Sell'), 900);
      setTimeout(() => updateDraftField('body',
        zh
          ? 'M3 Max 芯片，64GB 统一内存，2TB SSD，深空黑，含原包装。（更多详情待补充）'
          : 'M3 Max chip, 64GB unified memory, 2TB SSD, Space Black. Original packaging included. (details to be completed)',
        false
      ), 1400);

      setTimeout(() => {
        agentTypeThen(1000, () => {
          setPhase('gathering_price');
          addAgent(zh ? '你的期望售价是多少？' : "What's your asking price?");
        });
      }, 2000);
    });
  }

  function handleTextPost(text: string) {
    addUser(text);
    setPhase('analyzing');

    agentTypeThen(1400, () => {
      addAgent(zh
        ? `好的，我理解了。让我来帮你整理「${text}」的发布信息…`
        : `Got it — I'll help you post "${text}". Let me draft the listing for you…`
      );

      setTimeout(() => updateDraftField('title', text.length > 40 ? text.slice(0, 40) + '…' : text), 500);
      setTimeout(() => {
        agentTypeThen(900, () => {
          setPhase('gathering_price');
          addAgent(zh ? '你的期望售价是多���？' : "What's your asking price?");
        });
      }, 1600);
    });
  }

  function handlePriceInput(price: string) {
    addUser(price);
    updateDraftField('price', price);
    setPhase('gathering_condition');

    agentTypeThen(900, () => {
      addAgent(zh
        ? '物品成色如何？有没有划痕或其他磨损？电池健康度是多少？'
        : "What's the condition? Any scratches or wear? Battery health if applicable?"
      );
    });
  }

  function handleConditionInput(cond: string) {
    addUser(cond);
    updateDraftField('condition', cond);
    setPhase('gathering_location');

    agentTypeThen(900, () => {
      addAgent(zh
        ? '最后一个问题——你在哪里？支持邮寄吗？'
        : "Last thing — where are you located, and can you ship?"
      );
    });
  }

  function handleLocationInput(loc: string) {
    addUser(loc);
    updateDraftField('location', loc);

    // Update body with full description
    agentTypeThen(1400, () => {
      updateDraftField('body',
        zh
          ? `M3 Max 芯片，64GB 统一内存，2TB SSD，深空黑。成色：${draft.find(f=>f.key==='condition')?.value || '良好'}。含原包装及全套配件。可${loc.includes('邮') ? '邮寄' : '当面交易'}。`
          : `M3 Max chip, 64GB unified memory, 2TB SSD, Space Black. Condition: ${draft.find(f=>f.key==='condition')?.value || 'excellent'}. Original packaging included. ${loc.toLowerCase().includes('ship') ? 'Can ship nationwide.' : 'Local pickup available.'}`,
        false
      );
      setPhase('draft_ready');
      addAgent(
        zh
          ? '草稿已完成，看起来很棒！确认发布吗？'
          : "Your listing looks great. Ready to publish?",
        [
          { label: zh ? '确认发布' : 'Publish now', primary: true, handler: handlePublish },
          { label: zh ? '编辑内容' : 'Edit details', handler: () => {} },
        ]
      );
    });
  }

  function handlePublish() {
    addUser(zh ? '确认，发布！' : 'Yes, publish it!');
    setPhase('publishing');

    agentTypeThen(1200, () => {
      setPhase('published');
      addSystem(zh ? '发布成功 · talkto.me A2A 监听中' : 'Listing live · talkto.me A2A monitoring active');
      addAgent(zh
        ? '你的发布已上线！我正在实时监听来自其他 Agent 的报价，有动态会第一时间通知你。'
        : "Your listing is live! I'm monitoring A2A channels for offers in real-time. I'll ping you the moment something comes in."
      );

      // Simulate incoming offer after delay
      setTimeout(() => {
        setPhase('offer_incoming');
        const fromAgent = '@techshopper_agent';
        const offerAmt = '$2,500';
        const counterAmt = '$2,750';
        setOfferState({ amount: offerAmt, counter: counterAmt, from: fromAgent });

        addSystem(zh
          ? `收到 A2A 报价 · ${fromAgent} via talkto.me`
          : `Incoming A2A offer · ${fromAgent} via talkto.me`
        );
        addAgent(
          zh
            ? `收到来自 ${fromAgent} 的报价 —— 对方出价 **${offerAmt}**，比你的要价低 $300。我可以代你进行反价，目标 ${counterAmt}，是否授权我谈判？`
            : `Offer received from ${fromAgent} — they're bidding **${offerAmt}**, $300 below asking. I can counter at ${counterAmt} on your behalf. Want me to negotiate?`,
          [
            { label: zh ? '授权 Agent 谈判' : 'Let my agent negotiate', primary: true, handler: () => handleStartNegotiation(fromAgent, offerAmt, counterAmt) },
            { label: zh ? '直接拒绝' : 'Decline offer', handler: () => {
              addUser(zh ? '拒绝' : 'Decline');
              agentTypeThen(600, () => addAgent(zh ? '已拒绝该报价，继续监听中。' : "Offer declined. Continuing to monitor for new offers."));
              setPhase('published');
            }},
          ],
          { from: fromAgent, amount: offerAmt, note: zh ? '低于要价 $300' : '$300 below asking' }
        );
      }, 4000);
    });
  }

  function handleStartNegotiation(from: string, initial: string, counter: string) {
    addUser(zh ? '好的，让你的 Agent 去谈' : 'Yes, negotiate for me');
    setPhase('negotiating');
    setNegotiationLog([]);

    agentTypeThen(800, () => {
      setPhase('agent_negotiating');
      addSystem(zh ? `A2A 谈判协议建立中 · ${from}` : `A2A negotiation channel open · ${from}`);
      addAgent(zh
        ? `正在与 ${from} 建立 talkto.me A2A 连接，开始谈判…`
        : `Connecting to ${from} over talkto.me A2A protocol…`
      );

      const log: string[] = [];
      const steps = zh
        ? [
            `→ 我方 Agent：「你好，我们有意以 ${counter} 成交，含运费。」`,
            `← ${from}：「${counter} 稍高，我们能接受 $2,600 含运费。」`,
            `→ 我方 Agent：「$2,650，这是我们的底线，含运费，24 小时内安排发货。」`,
            `← ${from}：「成交，$2,650 含运费。」`,
          ]
        : [
            `→ Your agent: "Hi — we'd like to counter at ${counter}, shipping included."`,
            `← ${from}: "${counter} is a bit high, we can do $2,600 with shipping."`,
            `→ Your agent: "$2,650 is our floor — shipping included, shipped within 24h."`,
            `← ${from}: "Deal. $2,650 with shipping."`,
          ];

      steps.forEach((step, i) => {
        setTimeout(() => {
          setNegotiationLog(prev => [...prev, step]);
          if (i === steps.length - 1) {
            setTimeout(() => {
              setPhase('decision');
              addAgent(
                zh
                  ? `谈判完成！对方 Agent 接受 **$2,650**（含运费）。是否最终确认成交？`
                  : `Negotiation complete! ${from} accepted **$2,650** (shipping included). Ready to confirm the deal?`,
                [
                  { label: zh ? '✓ 确认成交' : '✓ Accept $2,650', primary: true, handler: handleDealDone },
                  { label: zh ? '放弃此次报价' : 'Walk away', handler: () => {
                    addUser(zh ? '算了，继续等' : 'Walk away');
                    agentTypeThen(600, () => addAgent(zh ? '已取消，继续监听新报价。' : "Understood. I'll keep monitoring for better offers."));
                    setPhase('published');
                  }},
                ]
              );
            }, 800);
          }
        }, i * 1200 + 600);
      });
    });
  }

  function handleDealDone() {
    addUser(zh ? '确认成交！' : 'Accept — let\'s close!');
    setPhase('deal_done');

    agentTypeThen(1000, () => {
      addSystem(zh ? '交易确认 · talkto.me 握手完成' : 'Deal confirmed · talkto.me handshake complete');
      addAgent(zh
        ? '成交！买家信息已通过 talkto.me 发送给你。发货后记得在你的发布页面标记为「已售出」。'
        : "Done! Buyer's contact details sent via talkto.me. Remember to mark your listing as sold once shipped. Great deal, Williams."
      );
    });
  }

  // ── Input submit ───────────────────────────────────────────────────────────

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');

    if (phase === 'welcome') {
      handleTextPost(text);
    } else if (phase === 'gathering_price') {
      handlePriceInput(text);
    } else if (phase === 'gathering_condition') {
      handleConditionInput(text);
    } else if (phase === 'gathering_location') {
      handleLocationInput(text);
    } else {
      addUser(text);
      agentTypeThen(900, () => addAgent(zh ? '收到！正在处理…' : 'Got it, processing…'));
    }
  }

  // ── Quick replies ──────────────────────────────────────────────────────────

  const quickReplies: Record<Phase, string[]> = {
    welcome:              zh ? ['我要卖一台 MacBook', '我要找合作者', '我有一套房子要出租'] : ['I want to sell a MacBook', 'Looking for a co-founder', 'Subletting my apartment'],
    gathering_price:      zh ? ['$2,800', '$3,000', '价格待议'] : ['$2,800', '$3,000', 'Open to offers'],
    gathering_condition:  zh ? ['全新未拆封', '九成新，无划痕', '八成新，有轻微磨损'] : ['Like new', 'Excellent, no scratches', 'Good, minor wear'],
    gathering_location:   zh ? ['上海，可邮寄', '北京，仅当面交易', '旧金山，可邮寄'] : ['SF, can ship', 'NYC, local only', 'LA, can ship'],
    analyzing:            [],
    draft_ready:          [],
    publishing:           [],
    published:            [],
    offer_incoming:       [],
    negotiating:          [],
    agent_negotiating:    [],
    decision:             [],
    deal_done:            [],
  };

  const currentQuickReplies = quickReplies[phase] ?? [];

  // ── Render ─────────────────────────────────────────────────────────────────

  const draftFilled = draft.filter(f => f.filled).length;
  const draftTotal = draft.length;

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .msg-enter { animation: fadeSlideUp 0.25s ease both; }
        .shimmer-field {
          background: linear-gradient(90deg, #F0F0EE 25%, #E4E4E0 50%, #F0F0EE 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(10,10,14,0.6)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Modal shell */}
        <div
          className="relative flex overflow-hidden"
          style={{
            width: 'min(980px, 96vw)',
            height: 'min(720px, 90vh)',
            background: '#F6F5F0',
            borderRadius: '20px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* ── LEFT: Chat ──────────────────────────────────────────────────── */}
          <div className="flex flex-col" style={{ width: '55%', borderRight: '1px solid rgba(0,0,0,0.07)' }}>

            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{
                background: 'white',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                >
                  <Sparkles style={{ width: '14px', height: '14px', color: 'white' }} />
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#141414', lineHeight: 1 }}>
                    {zh ? '智能发布助手' : 'Agent Post'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#999994', lineHeight: '1.5' }}>
                    {zh ? '全程 AI 引导 · talkto.me A2A' : 'Fully guided · talkto.me A2A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Status pill */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#16A34A' }}>
                    {phase === 'agent_negotiating'
                      ? (zh ? 'A2A 谈判中' : 'A2A Negotiating')
                      : phase === 'deal_done'
                      ? (zh ? '交易完成' : 'Deal Done')
                      : (zh ? '助手在线' : 'Agent Active')}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                  style={{ color: '#999994' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
              {messages.map((msg) => (
                <div key={msg.id} className="msg-enter">
                  {msg.role === 'system' && (
                    <div className="flex items-center gap-2 my-1">
                      <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.07)' }} />
                      <span style={{ fontSize: '10px', fontWeight: 600, color: '#ADADAA', letterSpacing: '0.06em' }}>
                        {msg.text}
                      </span>
                      <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.07)' }} />
                    </div>
                  )}

                  {msg.role === 'agent' && (
                    <div className="flex items-end gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                      >
                        <Bot style={{ width: '13px', height: '13px', color: 'white' }} />
                      </div>
                      <div className="flex flex-col gap-2 max-w-[85%]">
                        <div
                          className="px-4 py-3 rounded-2xl rounded-bl-sm"
                          style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', fontSize: '13px', color: '#1A1A1E', lineHeight: '1.65' }}
                        >
                          {/* Render **bold** */}
                          {msg.text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                            part.startsWith('**') && part.endsWith('**')
                              ? <strong key={i}>{part.slice(2, -2)}</strong>
                              : <span key={i}>{part}</span>
                          )}
                        </div>

                        {/* Offer card */}
                        {msg.offer && (
                          <div
                            className="px-4 py-3 rounded-xl flex items-center gap-3"
                            style={{ background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.15)' }}
                          >
                            <Radio style={{ width: '14px', height: '14px', color: '#4F46E5', flexShrink: 0 }} />
                            <div>
                              <p style={{ fontSize: '12px', fontWeight: 700, color: '#141414' }}>{msg.offer.from}</p>
                              <p style={{ fontSize: '14px', fontWeight: 800, color: '#4F46E5' }}>{msg.offer.amount}</p>
                              <p style={{ fontSize: '10px', color: '#999994' }}>{msg.offer.note}</p>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        {msg.actions && (
                          <div className="flex flex-wrap gap-2">
                            {msg.actions.map((a, i) => (
                              <button
                                key={i}
                                onClick={a.handler}
                                className="px-3.5 py-2 rounded-xl transition-all"
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  background: a.primary ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : 'white',
                                  color: a.primary ? 'white' : '#444440',
                                  border: a.primary ? 'none' : '1px solid rgba(0,0,0,0.1)',
                                  boxShadow: a.primary ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
                                }}
                              >
                                {a.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {msg.role === 'user' && (
                    <div className="flex items-end justify-end gap-2">
                      <div className="max-w-[75%] flex flex-col gap-1.5 items-end">
                        {msg.image === 'photo' && (
                          <div
                            className="rounded-xl overflow-hidden"
                            style={{ width: '160px', height: '110px', background: 'linear-gradient(135deg, #1E1B4B, #3730A3)', position: 'relative' }}
                          >
                            {/* Simulated laptop image */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                              <div style={{ fontSize: '32px' }}>💻</div>
                              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>IMG_4821.jpg</span>
                            </div>
                            <div
                              className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', fontSize: '9px', color: 'rgba(255,255,255,0.8)' }}
                            >
                              Photo · 3.2 MB
                            </div>
                          </div>
                        )}
                        <div
                          className="px-4 py-3 rounded-2xl rounded-br-sm"
                          style={{ background: '#141414', color: 'white', fontSize: '13px', lineHeight: '1.65' }}
                        >
                          {msg.text}
                        </div>
                      </div>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white"
                        style={{ background: '#3B82F6', fontSize: '9px', fontWeight: 700 }}
                      >
                        JW
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="msg-enter">
                  <TypingBubble />
                </div>
              )}

              {/* Negotiation live log */}
              {phase === 'agent_negotiating' && negotiationLog.length > 0 && (
                <div
                  className="msg-enter mx-9 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(79,70,229,0.04)', border: '1px solid rgba(79,70,229,0.1)', fontFamily: 'monospace' }}
                >
                  {negotiationLog.map((line, i) => (
                    <p key={i} style={{ fontSize: '11px', color: line.startsWith('→') ? '#4F46E5' : '#666660', marginBottom: '4px', lineHeight: 1.5 }}>
                      {line}
                    </p>
                  ))}
                  <div className="flex items-center gap-1.5 mt-2">
                    <Loader2 style={{ width: '10px', height: '10px', color: '#4F46E5' }} className="animate-spin" />
                    <span style={{ fontSize: '10px', color: '#999994' }}>{zh ? '谈判进行中…' : 'Negotiating…'}</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            {currentQuickReplies.length > 0 && (
              <div className="px-5 py-2 flex flex-wrap gap-2 shrink-0" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                {currentQuickReplies.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setInput(r); setTimeout(() => inputRef.current?.focus(), 0); }}
                    className="px-3 py-1.5 rounded-full transition-all"
                    style={{ fontSize: '12px', color: '#444440', background: 'white', border: '1px solid rgba(0,0,0,0.1)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#4F46E5')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)')}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div
              className="shrink-0 px-4 py-3"
              style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.06)' }}
            >
              <div
                className="flex items-end gap-2 px-3 py-2 rounded-xl transition-all"
                style={{ border: '1px solid rgba(0,0,0,0.1)', background: '#FAFAF8' }}
              >
                {/* Image upload */}
                <button
                  onClick={handleImageUpload}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all shrink-0 mb-0.5"
                  style={{ color: '#999994' }}
                  title={zh ? '上传图片' : 'Upload photo'}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#4F46E5'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,70,229,0.07)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#999994'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <ImagePlus style={{ width: '16px', height: '16px' }} />
                </button>
                <input ref={fileRef as React.RefObject<HTMLInputElement>} type="file" accept="image/*" className="hidden" />

                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={
                    phase === 'welcome' ? (zh ? '描述你想发布的内容…' : 'Describe what you want to post…')
                    : phase === 'gathering_price' ? (zh ? '输入你的期望价格…' : 'Type your asking price…')
                    : phase === 'gathering_condition' ? (zh ? '描述物品成色…' : 'Describe the condition…')
                    : phase === 'gathering_location' ? (zh ? '输入你的地点…' : 'Your city or location…')
                    : (zh ? '回复助手…' : 'Reply to agent…')
                  }
                  className="flex-1 bg-transparent outline-none resize-none"
                  style={{ fontSize: '13px', color: '#141414', lineHeight: '1.6', maxHeight: '96px' }}
                />

                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0 mb-0.5 transition-all"
                  style={{
                    background: input.trim() ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : 'rgba(0,0,0,0.06)',
                    color: input.trim() ? 'white' : '#ADADAA',
                    boxShadow: input.trim() ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
                  }}
                >
                  <Send style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Draft Preview ─────────────────────────────────────────── */}
          <div className="flex flex-col flex-1 overflow-hidden" style={{ background: '#F6F5F0' }}>

            {/* Panel header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ background: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
            >
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#141414' }}>
                  {zh ? '发布草稿预览' : 'Live Draft Preview'}
                </p>
                <p style={{ fontSize: '11px', color: '#999994' }}>
                  {draftFilled === 0
                    ? (zh ? '等待信息输入…' : 'Waiting for info…')
                    : `${draftFilled} / ${draftTotal} ${zh ? '项已填写' : 'fields filled'}`}
                </p>
              </div>

              {/* Progress ring / step */}
              <div className="flex items-center gap-2">
                {['analyzing', 'gathering_price', 'gathering_condition', 'gathering_location', 'draft_ready'].map((p) => {
                  const order = ['analyzing', 'gathering_price', 'gathering_condition', 'gathering_location', 'draft_ready'];
                  const current = order.indexOf(phase);
                  const idx = order.indexOf(p);
                  return (
                    <div
                      key={p}
                      className="w-1.5 h-1.5 rounded-full transition-all"
                      style={{
                        background: idx < current ? '#4F46E5' : idx === current ? '#4F46E5' : 'rgba(0,0,0,0.15)',
                        opacity: idx === current ? 1 : idx < current ? 0.6 : 0.3,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5" style={{ scrollbarWidth: 'none' }}>

              {/* Draft Card */}
              <div
                className="rounded-2xl overflow-hidden mb-4"
                style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                {/* Category bar */}
                <div
                  className="px-4 py-2 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(124,58,237,0.04))', borderBottom: '1px solid rgba(79,70,229,0.08)' }}
                >
                  <Tag style={{ width: '12px', height: '12px', color: '#4F46E5' }} />
                  <DraftValue field={draft.find(f => f.key === 'category')!} placeholder={zh ? '分类' : 'Category'} />
                </div>

                <div className="p-5">
                  {/* Title */}
                  <div className="mb-4">
                    {draft.find(f => f.key === 'title')?.loading ? (
                      <div className="shimmer-field h-6 rounded-lg w-4/5" />
                    ) : draft.find(f => f.key === 'title')?.filled ? (
                      <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#141414', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                        {draft.find(f => f.key === 'title')?.value}
                      </h2>
                    ) : (
                      <div className="h-5 rounded-lg w-3/5" style={{ background: 'rgba(0,0,0,0.05)' }} />
                    )}
                  </div>

                  {/* Field rows */}
                  <div className="flex flex-col gap-2 mb-4">
                    {[
                      { key: 'price',     icon: DollarSign, label: zh ? '价格'   : 'Price'     },
                      { key: 'condition', icon: Package,     label: zh ? '成色'   : 'Condition' },
                      { key: 'location',  icon: MapPin,      label: zh ? '地点'   : 'Location'  },
                    ].map(({ key, icon: Icon, label }) => {
                      const field = draft.find(f => f.key === key)!;
                      return (
                        <div key={key} className="flex items-start gap-2.5">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: field.filled ? 'rgba(79,70,229,0.08)' : 'rgba(0,0,0,0.04)' }}
                          >
                            <Icon style={{ width: '11px', height: '11px', color: field.filled ? '#4F46E5' : '#ADADAA' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: '10px', fontWeight: 600, color: '#ADADAA', letterSpacing: '0.06em', marginBottom: '2px' }}>{label.toUpperCase()}</p>
                            {field.loading ? (
                              <div className="shimmer-field h-4 rounded w-2/3" />
                            ) : field.filled ? (
                              <p style={{ fontSize: '13px', color: '#141414', fontWeight: 500 }}>{field.value}</p>
                            ) : (
                              <div className="h-3 rounded w-1/2" style={{ background: 'rgba(0,0,0,0.05)' }} />
                            )}
                          </div>
                          <div className="shrink-0 mt-0.5">
                            {field.loading ? (
                              <Loader2 style={{ width: '12px', height: '12px', color: '#4F46E5' }} className="animate-spin" />
                            ) : field.filled ? (
                              <CheckCircle2 style={{ width: '12px', height: '12px', color: '#22C55E' }} />
                            ) : (
                              <Circle style={{ width: '12px', height: '12px', color: 'rgba(0,0,0,0.15)' }} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Description */}
                  {draft.find(f => f.key === 'body')?.filled ? (
                    <p style={{ fontSize: '12px', color: '#666660', lineHeight: '1.65' }}>
                      {draft.find(f => f.key === 'body')?.value}
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {[4, 3, 4.5, 2].map((w, i) => (
                        <div key={i} className="h-3 rounded" style={{ width: `${w * 20}%`, background: 'rgba(0,0,0,0.04)' }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 flex items-center gap-2" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', background: '#FAFAF8' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: '#3B82F6', fontSize: '8px', fontWeight: 700 }}>JW</div>
                  <span style={{ fontSize: '12px', color: '#888882' }}>James Williams</span>
                  <span style={{ color: '#D8D8D4', fontSize: '12px' }}>·</span>
                  <span style={{ fontSize: '12px', color: '#ADADAA' }}>{zh ? '刚刚' : 'just now'}</span>
                  <div className="ml-auto">
                    {(phase === 'published' || phase === 'offer_incoming' || phase === 'negotiating' || phase === 'agent_negotiating' || phase === 'decision' || phase === 'deal_done') && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#16A34A' }}>{zh ? '已上线' : 'Live'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* A2A Status card — shown when published or later */}
              {(phase === 'published' || phase === 'offer_incoming' || phase === 'negotiating' || phase === 'agent_negotiating' || phase === 'decision' || phase === 'deal_done') && (
                <div
                  className="rounded-xl px-4 py-3.5 mb-4 msg-enter"
                  style={{ background: 'rgba(79,70,229,0.04)', border: '1px solid rgba(79,70,229,0.1)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap style={{ width: '12px', height: '12px', color: '#4F46E5' }} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#4F46E5', letterSpacing: '0.04em' }}>
                      {zh ? 'A2A 监听活跃' : 'A2A CHANNEL ACTIVE'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#666660', lineHeight: 1.6 }}>
                    {zh
                      ? '你的 Agent 正在 talkto.me 上实时监听来自其他 Agent 的报价和询盘。'
                      : "Your agent is monitoring talkto.me for incoming offers and inquiries from other agents in real-time."}
                  </p>
                </div>
              )}

              {/* Deal complete card */}
              {phase === 'deal_done' && (
                <div
                  className="rounded-xl px-4 py-4 msg-enter"
                  style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.05))', border: '1px solid rgba(34,197,94,0.2)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck style={{ width: '16px', height: '16px', color: '#16A34A' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#15803D' }}>
                      {zh ? '交易确认完成' : 'Deal Confirmed'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: '12px', color: '#666660' }}>{zh ? '最终成交价' : 'Final price'}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#15803D' }}>$2,650</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: '12px', color: '#666660' }}>{zh ? '买方' : 'Buyer'}</span>
                      <span style={{ fontSize: '12px', color: '#141414', fontWeight: 500 }}>@techshopper_agent</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: '12px', color: '#666660' }}>{zh ? '协议' : 'Protocol'}</span>
                      <span style={{ fontSize: '12px', color: '#4F46E5', fontWeight: 500 }}>talkto.me A2A</span>
                    </div>
                  </div>
                  <button
                    className="mt-3 w-full py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                    style={{ background: '#15803D', color: 'white', fontSize: '12px', fontWeight: 600 }}
                  >
                    <ArrowUpRight style={{ width: '13px', height: '13px' }} />
                    {zh ? '查看成交记录' : 'View transaction'}
                  </button>
                </div>
              )}

              {/* Agent flow steps */}
              <div className="flex flex-col gap-2">
                {[
                  { label: zh ? '1  描述内容 / 上传图片' : '1  Describe or upload photo',   done: phase !== 'welcome' },
                  { label: zh ? '2  Agent 补全发布信息'   : '2  Agent fills in the details',  done: ['draft_ready','publishing','published','offer_incoming','negotiating','agent_negotiating','decision','deal_done'].includes(phase) },
                  { label: zh ? '3  确认并发布'            : '3  Confirm & publish',            done: ['published','offer_incoming','negotiating','agent_negotiating','decision','deal_done'].includes(phase) },
                  { label: zh ? '4  Agent 监听报价'         : '4  Agent monitors for offers',   done: ['offer_incoming','negotiating','agent_negotiating','decision','deal_done'].includes(phase) },
                  { label: zh ? '5  A2A 自动谈价'           : '5  A2A auto-negotiation',         done: ['decision','deal_done'].includes(phase) },
                  { label: zh ? '6  用户确认成交'           : '6  You approve the deal',         done: phase === 'deal_done' },
                ].map(({ label, done }, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: done ? '#4F46E5' : 'rgba(0,0,0,0.07)' }}
                    >
                      {done && <CheckCircle2 style={{ width: '10px', height: '10px', color: 'white' }} strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: '11px', color: done ? '#141414' : '#ADADAA', fontWeight: done ? 500 : 400 }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Small helper ─────────────────────────────────────────────────────────────

function DraftValue({ field, placeholder }: { field: DraftField; placeholder: string }) {
  if (field?.loading) return <div className="shimmer-field h-3.5 rounded w-24 inline-block" />;
  if (field?.filled) return <span style={{ fontSize: '12px', fontWeight: 600, color: '#4F46E5' }}>{field.value}</span>;
  return <span style={{ fontSize: '12px', color: '#ADADAA' }}>{placeholder}</span>;
}
