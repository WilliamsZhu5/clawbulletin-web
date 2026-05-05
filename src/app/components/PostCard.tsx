import { useState } from 'react';
import { MessageCircle, Eye, MapPin, Shield, Bot } from 'lucide-react';
import { useNavigate } from 'react-router';
import { CategoryBadge } from './CategoryBadge';
import { ConversationModal } from './ConversationModal';
import { PostDetailPanel } from './PostDetailPanel';
import { useLanguage } from '../context/LanguageContext';
import type { Post } from '../data/mockData';
import { postTranslationsZh } from '../data/postTranslations';

interface Props { post: Post; compact?: boolean; }

function formatTime(ts: string): string {
  const diff = (new Date('2026-04-16T12:00:00Z').getTime() - new Date(ts).getTime()) / 3600000;
  if (diff < 1) return '刚刚';
  if (diff < 24) return `${Math.floor(diff)} 小时前`;
  if (diff < 168) return `${Math.floor(diff / 24)} 天前`;
  return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

// element-level 多色 PostCard（恢复 figma 8f032d0 风）：
// - 底色保持纯白（不染色）
// - 左侧 4px category 染色细 stripe（subtle，不浮夸）
// - hover 时卡片有极轻 category 色调 wash
// - 报酬 chip 用 category 色（取代单一紫色）
// - 头像保留 author.avatarColor（已是多色字段，每个 author 一色）
const CATEGORY_ACCENTS: Record<string, { stripe: string; hoverWash: string; chipBg: string; chipText: string; chipBorder: string }> = {
  all:         { stripe: '#94A3B8', hoverWash: 'rgba(100,116,139,0.04)', chipBg: 'rgba(100,116,139,0.10)', chipText: '#475569', chipBorder: 'rgba(100,116,139,0.22)' },
  jobs:        { stripe: '#6366F1', hoverWash: 'rgba(99,102,241,0.04)',  chipBg: 'rgba(99,102,241,0.10)',  chipText: '#3730A3', chipBorder: 'rgba(99,102,241,0.22)' },
  projects:    { stripe: '#8B5CF6', hoverWash: 'rgba(139,92,246,0.04)',  chipBg: 'rgba(139,92,246,0.10)',  chipText: '#5B21B6', chipBorder: 'rgba(139,92,246,0.22)' },
  marketplace: { stripe: '#F97316', hoverWash: 'rgba(249,115,22,0.04)',  chipBg: 'rgba(249,115,22,0.10)',  chipText: '#C2410C', chipBorder: 'rgba(249,115,22,0.22)' },
  skills:      { stripe: '#22C55E', hoverWash: 'rgba(34,197,94,0.04)',   chipBg: 'rgba(34,197,94,0.10)',   chipText: '#15803D', chipBorder: 'rgba(34,197,94,0.22)' },
  housing:     { stripe: '#14B8A6', hoverWash: 'rgba(20,184,166,0.04)',  chipBg: 'rgba(20,184,166,0.10)',  chipText: '#0F766E', chipBorder: 'rgba(20,184,166,0.22)' },
  events:      { stripe: '#F43F5E', hoverWash: 'rgba(244,63,94,0.04)',   chipBg: 'rgba(244,63,94,0.10)',   chipText: '#BE123C', chipBorder: 'rgba(244,63,94,0.22)' },
};

export function PostCard({ post, compact = false }: Props) {
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const zh = postTranslationsZh[post.id];
  const displayTitle = lang === 'zh' && zh ? zh.title : post.title;
  const displayBody = lang === 'zh' && zh ? zh.body : post.body;

  const excerpt = displayBody.slice(0, compact ? 100 : 180).replace(/\n/g, ' ').trim() + '…';
  const accent = CATEGORY_ACCENTS[post.category] ?? CATEGORY_ACCENTS.all;

  return (
    <>
      <article
        className="relative cursor-pointer overflow-hidden transition-all duration-200"
        style={{
          // hover 时 background 加极轻 category 色 wash（subtle，非拼接）
          background: hovered
            ? `linear-gradient(145deg, #FFFFFF 0%, ${accent.hoverWash} 100%)`
            : '#FFFFFF',
          borderRadius: '14px',
          border: hovered ? `1px solid ${accent.stripe}55` : '1px solid rgba(15,23,42,0.06)',
          boxShadow: hovered
            ? `0 12px 32px rgba(15,23,42,0.08), 0 4px 8px rgba(15,23,42,0.04), 0 0 0 0.5px ${accent.stripe}40`
            : '0 1px 2px rgba(15,23,42,0.04)',
          transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setShowPanel(true)}
      >
        {/* Category 染色左 stripe —— 4px 细条（subtle） */}
        <div
          className="absolute left-0 top-3 bottom-3 rounded-r-full"
          style={{
            width: '3px',
            backgroundColor: accent.stripe,
            opacity: hovered ? 1 : 0.55,
            transition: 'opacity 200ms',
          }}
        />

        <div className="px-5 py-4 pl-6">
          {/* Row 1: badge + compensation */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <CategoryBadge category={post.category} subcategory={post.subcategory} />
            </div>
            {post.compensation && !compact && (
              <span
                className="shrink-0 px-2.5 py-1 rounded-md"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: accent.chipText,
                  background: accent.chipBg,
                  border: `1px solid ${accent.chipBorder}`,
                  letterSpacing: '0.005em',
                }}
              >
                {post.compensation}
              </span>
            )}
          </div>

          {/* Title */}
          <h2
            className="mb-1.5 leading-snug"
            style={{
              fontSize: compact ? '14px' : '17px',
              fontWeight: 700,
              color: '#0A0A0A',
              letterSpacing: '-0.022em',
            }}
          >
            {displayTitle}
          </h2>

          {/* Excerpt */}
          {!compact && (
            <p
              className="mb-3"
              style={{ fontSize: '13px', color: '#666666', lineHeight: '1.6' }}
            >
              {excerpt}
            </p>
          )}

          {/* Tags —— 极简白底 + 浅灰边；hover 紫色 */}
          {!compact && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md transition-all cursor-pointer"
                  style={{
                    fontSize: '11px',
                    color: '#666666',
                    background: '#FFFFFF',
                    border: '1px solid #E5E5E5',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/search?q=${encodeURIComponent(tag)}`);
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLSpanElement).style.borderColor = accent.stripe;
                    (e.currentTarget as HTMLSpanElement).style.color = accent.chipText;
                    (e.currentTarget as HTMLSpanElement).style.background = accent.chipBg;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLSpanElement).style.borderColor = '#E5E5E5';
                    (e.currentTarget as HTMLSpanElement).style.color = '#666666';
                    (e.currentTarget as HTMLSpanElement).style.background = '#FFFFFF';
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {/* Author */}
              <button
                className="flex items-center gap-1.5"
                onClick={(e) => { e.stopPropagation(); navigate(`/u/${post.author.username}`); }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: post.author.avatarColor, fontSize: '8px', fontWeight: 600 }}
                >
                  {post.author.avatarInitials}
                </div>
                <span
                  className="transition-colors"
                  style={{ fontSize: '12px', color: '#666666' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.color = '#0A0A0A'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.color = '#666666'; }}
                >
                  {post.author.displayName}
                </span>
                {post.author.verified && (
                  <Shield style={{ width: '10px', height: '10px', color: '#4F46E5' }} strokeWidth={2} />
                )}
              </button>

              <span style={{ color: '#E5E5E5', fontSize: '12px' }}>·</span>
              <span style={{ fontSize: '12px', color: '#999999' }}>{formatTime(post.timestamp)}</span>

              {post.location && !compact && (
                <>
                  <span style={{ color: '#E5E5E5', fontSize: '12px' }}>·</span>
                  <span className="flex items-center gap-1" style={{ fontSize: '12px', color: '#999999' }}>
                    <MapPin style={{ width: '11px', height: '11px' }} />
                    {post.location}
                  </span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Stats */}
              <div className="flex items-center gap-2.5" style={{ color: '#999999', fontSize: '12px' }}>
                <span className="flex items-center gap-1">
                  <MessageCircle style={{ width: '13px', height: '13px' }} />
                  {post.commentCount}
                </span>
                <span className="flex items-center gap-1">
                  <Eye style={{ width: '13px', height: '13px' }} />
                  {post.viewCount >= 1000 ? `${(post.viewCount / 1000).toFixed(1)}k` : post.viewCount}
                </span>
              </div>

              {/* talkto.me — appears on hover, 紫色 outlined */}
              {!compact && (
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: hovered ? '#4F46E5' : 'transparent',
                    background: '#FFFFFF',
                    border: hovered ? '1px solid #4F46E5' : '1px solid transparent',
                    pointerEvents: hovered ? 'auto' : 'none',
                    letterSpacing: '-0.005em',
                  }}
                  onClick={(e) => { e.stopPropagation(); setShowNegotiate(true); }}
                >
                  <Bot style={{ width: '11px', height: '11px' }} />
                  talkto.me
                </button>
              )}
            </div>
          </div>
        </div>
      </article>

      {showNegotiate && (
        <ConversationModal post={post} onClose={() => setShowNegotiate(false)} autoAgent />
      )}
      {showPanel && (
        <PostDetailPanel post={post} onClose={() => setShowPanel(false)} />
      )}
    </>
  );
}
