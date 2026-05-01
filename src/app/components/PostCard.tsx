import { useState } from 'react';
import { MessageCircle, Eye, MapPin, Shield, Bot } from 'lucide-react';
import { useNavigate } from 'react-router';
import { CategoryBadge } from './CategoryBadge';
import { ConversationModal } from './ConversationModal';
import { PostDetailPanel } from './PostDetailPanel';
import { useLanguage } from '../context/LanguageContext';
import type { Post } from '../data/mockData';
import { postTranslationsZh } from '../data/postTranslations';

const CATEGORY_ACCENTS: Record<string, { border: string; glow: string; comp: string }> = {
  jobs:        { border: '#818CF8', glow: 'rgba(99,102,241,0.08)',  comp: 'rgba(99,102,241,0.1)' },
  projects:    { border: '#A78BFA', glow: 'rgba(139,92,246,0.08)', comp: 'rgba(139,92,246,0.1)' },
  marketplace: { border: '#FB923C', glow: 'rgba(249,115,22,0.07)', comp: 'rgba(249,115,22,0.1)' },
  skills:      { border: '#4ADE80', glow: 'rgba(34,197,94,0.07)',  comp: 'rgba(34,197,94,0.1)' },
  housing:     { border: '#2DD4BF', glow: 'rgba(20,184,166,0.07)', comp: 'rgba(20,184,166,0.1)' },
  events:      { border: '#FB7185', glow: 'rgba(244,63,94,0.07)',  comp: 'rgba(244,63,94,0.1)' },
  all:         { border: '#D0D0C8', glow: 'rgba(0,0,0,0.03)',      comp: 'rgba(0,0,0,0.04)' },
};

interface Props { post: Post; compact?: boolean; }

function formatTime(ts: string): string {
  const diff = (new Date('2026-04-16T12:00:00Z').getTime() - new Date(ts).getTime()) / 3600000;
  if (diff < 1) return 'just now';
  if (diff < 24) return `${Math.floor(diff)}h ago`;
  if (diff < 168) return `${Math.floor(diff / 24)}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PostCard({ post, compact = false }: Props) {
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const zh = postTranslationsZh[post.id];
  const displayTitle = lang === 'zh' && zh ? zh.title : post.title;
  const displayBody = lang === 'zh' && zh ? zh.body : post.body;

  const accent = CATEGORY_ACCENTS[post.category] ?? CATEGORY_ACCENTS.all;
  const excerpt = displayBody.slice(0, compact ? 100 : 180).replace(/\n/g, ' ').trim() + '…';

  return (
    <>
      <article
        className="relative cursor-pointer overflow-hidden transition-all duration-200"
        style={{
          background: hovered
            ? `linear-gradient(145deg, #ffffff 0%, ${accent.glow.replace('0.08', '0.04')} 100%)`
            : 'white',
          borderRadius: '14px',
          border: hovered ? `1px solid ${accent.border}40` : '1px solid rgba(0,0,0,0.07)',
          boxShadow: hovered
            ? `0 8px 32px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.8) inset, 0 0 0 0.5px ${accent.border}60`
            : '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
          transform: hovered ? 'translateY(-1px)' : 'none',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setShowPanel(true)}
      >
        {/* Category left accent bar */}
        <div
          className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full"
          style={{
            backgroundColor: accent.border,
            opacity: hovered ? 1 : 0.4,
            transition: 'opacity 0.2s',
          }}
        />

        <div className="px-5 py-4 pl-6">
          {/* Row 1: badge + compensation */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <CategoryBadge category={post.category} subcategory={post.subcategory} />
            </div>
            {post.compensation && !compact && (
              <span
                className="shrink-0 px-2.5 py-1 rounded-lg"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: accent.border,
                  background: accent.comp,
                  letterSpacing: '0.01em',
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
              fontSize: compact ? '13px' : '15px',
              fontWeight: 700,
              color: hovered ? '#0A0A0E' : '#1A1A1E',
              letterSpacing: '-0.02em',
              transition: 'color 0.15s',
            }}
          >
            {displayTitle}
          </h2>

          {/* Excerpt */}
          {!compact && (
            <p
              className="mb-3 leading-relaxed"
              style={{ fontSize: '13px', color: '#6B6B6B', lineHeight: '1.65' }}
            >
              {excerpt}
            </p>
          )}

          {/* Tags */}
          {!compact && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md transition-all cursor-pointer"
                  style={{
                    fontSize: '11px',
                    color: '#888882',
                    background: 'rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/search?q=${encodeURIComponent(tag)}`);
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLSpanElement).style.background = accent.comp;
                    (e.currentTarget as HTMLSpanElement).style.color = accent.border;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLSpanElement).style.background = 'rgba(0,0,0,0.04)';
                    (e.currentTarget as HTMLSpanElement).style.color = '#888882';
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
                className="flex items-center gap-1.5 group/au"
                onClick={(e) => { e.stopPropagation(); navigate(`/u/${post.author.username}`); }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: post.author.avatarColor, fontSize: '8px', fontWeight: 700 }}
                >
                  {post.author.avatarInitials}
                </div>
                <span
                  className="transition-colors"
                  style={{ fontSize: '12px', color: '#888882' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.color = '#1A1A1E'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.color = '#888882'; }}
                >
                  {post.author.displayName}
                </span>
                {post.author.verified && (
                  <Shield style={{ width: '10px', height: '10px', color: '#818CF8' }} strokeWidth={2.5} />
                )}
              </button>

              <span style={{ color: '#D8D8D4', fontSize: '12px' }}>·</span>
              <span style={{ fontSize: '12px', color: '#ADADAA' }}>{formatTime(post.timestamp)}</span>

              {post.location && !compact && (
                <>
                  <span style={{ color: '#D8D8D4', fontSize: '12px' }}>·</span>
                  <span className="flex items-center gap-1" style={{ fontSize: '12px', color: '#ADADAA' }}>
                    <MapPin style={{ width: '11px', height: '11px' }} />
                    {post.location}
                  </span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Stats */}
              <div className="flex items-center gap-2.5" style={{ color: '#ADADAA', fontSize: '12px' }}>
                <span className="flex items-center gap-1">
                  <MessageCircle style={{ width: '13px', height: '13px' }} />
                  {post.commentCount}
                </span>
                <span className="flex items-center gap-1">
                  <Eye style={{ width: '13px', height: '13px' }} />
                  {post.viewCount >= 1000 ? `${(post.viewCount / 1000).toFixed(1)}k` : post.viewCount}
                </span>
              </div>

              {/* talkto.me — appears on hover, same style as Message button */}
              {!compact && (
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: hovered ? 'white' : 'transparent',
                    background: hovered ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : 'transparent',
                    border: '1px solid transparent',
                    boxShadow: hovered ? '0 2px 8px rgba(79,70,229,0.32)' : 'none',
                    pointerEvents: hovered ? 'auto' : 'none',
                    letterSpacing: '-0.01em',
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