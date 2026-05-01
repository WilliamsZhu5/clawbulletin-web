import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Eye, MapPin, Share2, Bookmark, Shield,
  ThumbsUp, Clock, ChevronRight, Bot, MessageCircle,
} from 'lucide-react';
import type { Post } from '../data/mockData';
import { currentUser } from '../data/mockData';
import { CategoryBadge } from './CategoryBadge';
import { ConversationModal } from './ConversationModal';
import { postTranslationsZh } from '../data/postTranslations';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router';

function formatTime(ts: string): string {
  const diff = (new Date('2026-04-16T12:00:00Z').getTime() - new Date(ts).getTime()) / 3600000;
  if (diff < 1) return 'just now';
  if (diff < 24) return `${Math.floor(diff)}h ago`;
  if (diff < 168) return `${Math.floor(diff / 24)}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface Props {
  post: Post;
  onClose: () => void;
}

export function PostDetailPanel({ post, onClose }: Props) {
  const [showMessage, setShowMessage] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [saved, setSaved] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const zh = postTranslationsZh[post.id];
  const displayTitle = lang === 'zh' && zh ? zh.title : post.title;
  const displayBody = lang === 'zh' && zh ? zh.body : post.body;
  const bodyParagraphs = displayBody.split('\n\n').filter(Boolean);

  // Mount animation
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleClose() {
    setMounted(false);
    setTimeout(onClose, 280);
  }

  function handleLikeComment(id: string) {
    setLikedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const panel = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          background: 'rgba(10,10,14,0.4)',
          backdropFilter: 'blur(6px)',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.28s ease',
        }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          width: 'min(620px, 100vw)',
          background: '#FCFCFA',
          boxShadow: '-2px 0 40px rgba(0,0,0,0.14), -1px 0 0 rgba(0,0,0,0.06)',
          transform: mounted ? 'translateX(0)' : 'translateX(48px)',
          opacity: mounted ? 1 : 0,
          transition: 'transform 0.28s cubic-bezier(.22,1,.36,1), opacity 0.22s ease',
        }}
      >
        {/* ── Sticky header ── */}
        <div
          className="shrink-0 flex items-center gap-3 px-5 py-3.5"
          style={{
            borderBottom: '1px solid #EEEEEC',
            background: 'rgba(252,252,250,0.95)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Close */}
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0"
            style={{ color: '#888882', background: '#F0F0EE' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#E4E4E0'; (e.currentTarget as HTMLButtonElement).style.color = '#141414'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F0F0EE'; (e.currentTarget as HTMLButtonElement).style.color = '#888882'; }}
          >
            <X style={{ width: '14px', height: '14px' }} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span style={{ fontSize: '12px', color: '#BBBBB6' }}>ClawBulletin</span>
            <ChevronRight style={{ width: '12px', height: '12px', color: '#D8D8D4' }} />
            <span
              className="capitalize cursor-pointer transition-colors"
              style={{ fontSize: '12px', color: '#888882' }}
              onClick={() => navigate(`/c/${post.category}`)}
              onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.color = '#141414'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.color = '#888882'; }}
            >
              {post.category}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSaved(!saved)}
              className="w-8 h-8 flex items-center justify-center rounded-xl border transition-all"
              style={{
                color: saved ? 'white' : '#666660',
                background: saved ? '#141414' : 'transparent',
                borderColor: saved ? '#141414' : '#E8E8E4',
              }}
              onMouseEnter={(e) => { if (!saved) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#C8C8C4'; (e.currentTarget as HTMLButtonElement).style.color = '#141414'; } }}
              onMouseLeave={(e) => { if (!saved) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E8E8E4'; (e.currentTarget as HTMLButtonElement).style.color = '#666660'; } }}
            >
              <Bookmark style={{ width: '14px', height: '14px' }} fill={saved ? 'currentColor' : 'none'} />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#E8E8E4] transition-all"
              style={{ color: '#666660' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#C8C8C4'; (e.currentTarget as HTMLButtonElement).style.color = '#141414'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E8E8E4'; (e.currentTarget as HTMLButtonElement).style.color = '#666660'; }}
            >
              <Share2 style={{ width: '14px', height: '14px' }} />
            </button>
            <button
              onClick={() => setShowMessage(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'white',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                boxShadow: '0 2px 10px rgba(79,70,229,0.28)',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 18px rgba(79,70,229,0.4)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 10px rgba(79,70,229,0.28)'; }}
            >
              <Bot style={{ width: '14px', height: '14px' }} />
              talkto.me
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.07) transparent' }}>

          {/* Post content */}
          <div className="px-7 pt-7 pb-6">

            {/* Meta row */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <CategoryBadge category={post.category} subcategory={post.subcategory} />
                {post.location && (
                  <span className="flex items-center gap-1" style={{ fontSize: '12px', color: '#999994' }}>
                    <MapPin style={{ width: '11px', height: '11px' }} />
                    {post.location}
                  </span>
                )}
              </div>
              {post.compensation && (
                <span
                  className="shrink-0 px-3 py-1.5 rounded-lg"
                  style={{ fontSize: '13px', fontWeight: 600, color: '#141414', background: '#F0F0EE' }}
                >
                  {post.compensation}
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className="mb-5 leading-snug"
              style={{ fontSize: '24px', fontWeight: 700, color: '#141414', letterSpacing: '-0.025em' }}
            >
              {displayTitle}
            </h1>

            {/* Author row */}
            <div className="flex items-center gap-3 mb-6 pb-5" style={{ borderBottom: '1px solid #F0F0EE' }}>
              <button
                onClick={() => navigate(`/u/${post.author.username}`)}
                className="flex items-center gap-2.5 group"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: post.author.avatarColor, fontSize: '11px', fontWeight: 700 }}
                >
                  {post.author.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="transition-colors"
                      style={{ fontSize: '13px', fontWeight: 600, color: '#141414' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.color = '#4F46E5'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.color = '#141414'; }}
                    >
                      {post.author.displayName}
                    </span>
                    {post.author.verified && (
                      <Shield style={{ width: '11px', height: '11px', color: '#6366F1' }} strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="flex items-center gap-2" style={{ fontSize: '11px', color: '#999994', marginTop: '1px' }}>
                    <span className="flex items-center gap-1">
                      <Clock style={{ width: '10px', height: '10px' }} />
                      {formatTime(post.timestamp)}
                    </span>
                    <span style={{ color: '#D8D8D4' }}>·</span>
                    <span className="flex items-center gap-1">
                      <Eye style={{ width: '10px', height: '10px' }} />
                      {post.viewCount.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Body */}
            <div>
              {bodyParagraphs.map((paragraph, i) => {
                if (paragraph.includes('\n—') || paragraph.startsWith('—')) {
                  const lines = paragraph.split('\n').filter(Boolean);
                  return (
                    <div key={i} className="mb-4">
                      {lines.map((line, j) => {
                        if (line.startsWith('—')) {
                          return (
                            <div key={j} className="flex items-start gap-2 mb-1.5">
                              <span style={{ color: '#BBBBB6', fontSize: '14px', marginTop: '2px' }}>—</span>
                              <span style={{ fontSize: '14px', color: '#444440', lineHeight: '1.7' }}>
                                {line.slice(1).trim()}
                              </span>
                            </div>
                          );
                        }
                        return (
                          <p key={j} style={{ fontSize: '14px', color: '#444440', lineHeight: '1.7', marginBottom: '8px' }}>
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  );
                }
                return (
                  <p key={i} style={{ fontSize: '14px', color: '#444440', lineHeight: '1.7', marginBottom: '16px' }}>
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5 pt-5" style={{ borderTop: '1px solid #F0F0EE' }}>
                {post.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                    className="px-3 py-1.5 rounded-full transition-colors"
                    style={{ fontSize: '12px', color: '#666660', background: '#F4F4F2' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#EBEBEA'; (e.currentTarget as HTMLButtonElement).style.color = '#141414'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F4F4F2'; (e.currentTarget as HTMLButtonElement).style.color = '#666660'; }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Divider ── */}
          <div style={{ height: '6px', background: '#F4F4F2' }} />

          {/* ── Comments ── */}
          <div className="px-7 py-6">
            <div className="flex items-center gap-2 mb-5">
              <MessageCircle style={{ width: '16px', height: '16px', color: '#888882' }} />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#141414' }}>
                Discussion
                <span style={{ fontWeight: 400, color: '#999994', marginLeft: '6px' }}>
                  {post.commentCount}
                </span>
              </span>
            </div>

            {/* Comment composer */}
            <div className="flex items-start gap-3 mb-6 pb-6" style={{ borderBottom: '1px solid #F0F0EE' }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5"
                style={{ backgroundColor: currentUser.avatarColor, fontSize: '10px', fontWeight: 700 }}
              >
                {currentUser.avatarInitials}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment…"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl outline-none resize-none transition-all"
                  style={{
                    fontSize: '13px',
                    color: '#141414',
                    background: '#F6F5F2',
                    border: '1px solid #EEEEEC',
                  }}
                  onFocus={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#141414'; }}
                  onBlur={(e) => { e.currentTarget.style.background = '#F6F5F2'; e.currentTarget.style.borderColor = '#EEEEEC'; }}
                />
                {commentText.trim() && (
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => setCommentText('')}
                      className="px-4 py-1.5 rounded-lg transition-colors"
                      style={{ fontSize: '12px', fontWeight: 500, color: 'white', background: '#141414' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2A2A2A'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#141414'; }}
                    >
                      Post
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comment list */}
            {post.comments.length === 0 ? (
              <div className="py-10 text-center" style={{ fontSize: '13px', color: '#999994' }}>
                No comments yet. Be the first to respond.
              </div>
            ) : (
              <div className="flex flex-col">
                {post.comments.map((comment, i) => (
                  <div
                    key={comment.id}
                    className="flex items-start gap-3 py-4"
                    style={{ borderBottom: i < post.comments.length - 1 ? '1px solid #F4F4F2' : 'none' }}
                  >
                    <button
                      onClick={() => navigate(`/u/${comment.author.username}`)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: comment.author.avatarColor, fontSize: '10px', fontWeight: 700 }}
                    >
                      {comment.author.avatarInitials}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <button
                          onClick={() => navigate(`/u/${comment.author.username}`)}
                          className="transition-colors"
                          style={{ fontSize: '13px', fontWeight: 600, color: '#141414' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#4F46E5'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#141414'; }}
                        >
                          {comment.author.displayName}
                        </button>
                        {comment.author.verified && (
                          <Shield style={{ width: '10px', height: '10px', color: '#6366F1' }} strokeWidth={2.5} />
                        )}
                        <span style={{ fontSize: '11px', color: '#BBBBB6' }}>{formatTime(comment.timestamp)}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#444440', lineHeight: '1.65' }}>
                        {comment.body}
                      </p>
                      <div className="flex items-center gap-3 mt-2.5">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className="flex items-center gap-1.5 transition-colors"
                          style={{
                            fontSize: '12px',
                            color: likedComments.has(comment.id) ? '#141414' : '#999994',
                          }}
                          onMouseEnter={(e) => { if (!likedComments.has(comment.id)) (e.currentTarget as HTMLButtonElement).style.color = '#666660'; }}
                          onMouseLeave={(e) => { if (!likedComments.has(comment.id)) (e.currentTarget as HTMLButtonElement).style.color = '#999994'; }}
                        >
                          <ThumbsUp
                            style={{ width: '13px', height: '13px' }}
                            fill={likedComments.has(comment.id) ? 'currentColor' : 'none'}
                          />
                          {comment.likes + (likedComments.has(comment.id) ? 1 : 0)}
                        </button>
                        <button
                          className="transition-colors"
                          style={{ fontSize: '12px', color: '#999994' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#666660'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#999994'; }}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom padding */}
          <div style={{ height: '32px' }} />
        </div>
      </div>

      {/* ConversationModal rendered above panel */}
      {showMessage && (
        <ConversationModal
          post={post}
          onClose={() => setShowMessage(false)}
          autoAgent
        />
      )}
    </>
  );

  return createPortal(panel, document.body);
}
