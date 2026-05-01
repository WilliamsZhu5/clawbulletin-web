import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Eye,
  MapPin,
  Share2,
  Bookmark,
  Shield,
  ThumbsUp,
  Clock,
  ChevronRight,
  Bot,
} from 'lucide-react';
import { currentUser } from '../data/mockData';
import type { Post } from '../data/mockData';
import { 单帖, 列帖子, 列评论, 发评论, 适配为mockPost, 适配为mockComment, 已登录 } from '../data/api';
import type { ApiComment } from '../data/api';
import { CategoryBadge } from '../components/CategoryBadge';
import { ConversationModal } from '../components/ConversationModal';
import { PostCard } from '../components/PostCard';
import { postTranslationsZh } from '../data/postTranslations';

import { useLanguage } from '../context/LanguageContext';
import type { TranslationKey } from '../i18n/translations';

function formatTime(timestamp: string): string {
  const now = new Date('2026-04-16T12:00:00Z');
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [showMessage, setShowMessage] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [saved, setSaved] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  // 从后端拉真实数据
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [apiComments, setApiComments] = useState<ApiComment[]>([]);
  const [加载中, set加载中] = useState(true);
  const [发评论中, set发评论中] = useState(false);
  const [发评论错, set发评论错] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    set加载中(true);
    Promise.all([单帖(id), 列评论(id)])
      .then(([p, cs]) => {
        const adapted = 适配为mockPost(p);
        setPost(adapted);
        setApiComments(cs);
        return 列帖子({ category: p.category, limit: 4 });
      })
      .then((rel) => {
        setRelatedPosts(
          rel.map(适配为mockPost).filter((p) => p.id !== id).slice(0, 3),
        );
      })
      .catch(() => setPost(null))
      .finally(() => set加载中(false));
  }, [id]);

  if (加载中) {
    return <div className="py-12 text-center text-[#999]">加载中…</div>;
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-[#141414]" style={{ fontSize: '16px', fontWeight: 600 }}>
            Post not found
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-3 text-[#666660] hover:text-[#141414] transition-colors"
            style={{ fontSize: '13px' }}
          >
            Back to feed
          </button>
        </div>
      </div>
    );
  }

  const zh = postTranslationsZh[post.id];
  const displayTitle = lang === 'zh' && zh ? zh.title : post.title;
  const displayBody = lang === 'zh' && zh ? zh.body : post.body;

  const handleLikeComment = (commentId: string) => {
    setLikedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  const bodyParagraphs = displayBody.split('\n\n').filter(Boolean);

  return (
    <>
      <div className="min-w-0">
        {/* Breadcrumb / back */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 transition-colors"
            style={{ fontSize: '13px', color: '#888882' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#1A1A1E'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#888882'; }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <ChevronRight className="w-3.5 h-3.5" style={{ color: '#D8D8D4' }} />
          <button
            onClick={() => navigate(`/c/${post.category}`)}
            className="transition-colors capitalize"
            style={{ fontSize: '13px', color: '#888882' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#1A1A1E'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#888882'; }}
          >
            {post.category}
          </button>
        </div>

        {/* Post card */}
        <div className="bg-white rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="p-6">
            {/* Top */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <CategoryBadge category={post.category} subcategory={post.subcategory} />
                {post.location && (
                  <span className="flex items-center gap-1 text-[#999994]" style={{ fontSize: '12px' }}>
                    <MapPin className="w-3 h-3" />
                    {post.location}
                  </span>
                )}
              </div>
              {post.compensation && (
                <span
                  className="shrink-0 text-[#141414] bg-[#F4F4F2] rounded-lg px-3 py-1.5"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  {post.compensation}
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className="text-[#141414] mb-5 leading-snug"
              style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              {displayTitle}
            </h1>

            {/* Author row */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate(`/u/${post.author.username}`)}
                className="flex items-center gap-3 group"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: post.author.avatarColor, fontSize: '13px', fontWeight: 700 }}
                >
                  {post.author.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[#141414] group-hover:text-[#444440] transition-colors"
                      style={{ fontSize: '14px', fontWeight: 600 }}
                    >
                      {post.author.displayName}
                    </span>
                    {post.author.verified && (
                      <Shield className="w-3.5 h-3.5 text-[#6366F1]" strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[#999994]" style={{ fontSize: '12px' }}>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(post.timestamp)}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.viewCount.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </button>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSaved(!saved)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${
                    saved
                      ? 'border-[#141414] bg-[#141414] text-white'
                      : 'border-[#E8E8E4] text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414]'
                  }`}
                >
                  <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#E8E8E4] text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414] transition-all">
                  <Share2 className="w-4 h-4" />
                </button>
                {/* talkto.me — unified entry for direct message + agent negotiate */}
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
                  <Bot className="w-4 h-4" />
                  talkto.me
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#F4F4F2] mb-6" />

            {/* Body */}
            <div className="prose-custom">
              {bodyParagraphs.map((paragraph, i) => {
                // Check if line starts with — (list item)
                if (paragraph.includes('\n—') || paragraph.startsWith('—')) {
                  const lines = paragraph.split('\n').filter(Boolean);
                  return (
                    <div key={i} className="mb-4">
                      {lines.map((line, j) => {
                        if (line.startsWith('—')) {
                          return (
                            <div key={j} className="flex items-start gap-2 mb-1">
                              <span className="text-[#999994] mt-0.5" style={{ fontSize: '14px' }}>—</span>
                              <span className="text-[#444440]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
                                {line.slice(1).trim()}
                              </span>
                            </div>
                          );
                        }
                        return (
                          <p key={j} className="text-[#444440] mb-2" style={{ fontSize: '14px', lineHeight: '1.7' }}>
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  );
                }
                return (
                  <p key={i} className="text-[#444440] mb-4" style={{ fontSize: '14px', lineHeight: '1.7' }}>
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-[#F4F4F2]">
                {post.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                    className="px-3 py-1.5 rounded-full bg-[#F4F4F2] text-[#666660] hover:bg-[#EBEBEA] hover:text-[#141414] transition-colors"
                    style={{ fontSize: '12px' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white border border-[#E8E8E4] rounded-2xl overflow-hidden mb-5">
          <div className="px-6 py-4 border-b border-[#F0F0EE]">
            <h2
              className="text-[#141414]"
              style={{ fontSize: '15px', fontWeight: 600 }}
            >
              {t('post.discussion' as TranslationKey)}
              <span className="text-[#999994] ml-2" style={{ fontWeight: 400 }}>
                {post.commentCount}
              </span>
            </h2>
          </div>

          {/* Comment composer */}
          <div className="px-6 py-4 border-b border-[#F0F0EE]">
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 mt-1"
                style={{ backgroundColor: currentUser.avatarColor, fontSize: '11px', fontWeight: 700 }}
              >
                {currentUser.avatarInitials}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t('post.writeComment' as TranslationKey)}
                  rows={3}
                  className="w-full px-3.5 py-3 rounded-xl border border-[#E8E8E4] bg-[#FAFAF8] text-[#141414] placeholder:text-[#BBBBB6] outline-none focus:border-[#141414] focus:bg-white transition-all resize-none"
                  style={{ fontSize: '13px' }}
                />
                {commentText.trim() && (
                  <div className="flex justify-end items-center gap-2 mt-2">
                    {发评论错 && <span style={{ fontSize: 11, color: '#DC2626' }}>{发评论错}</span>}
                    <button
                      disabled={发评论中}
                      onClick={async () => {
                        if (!已登录()) { navigate('/login'); return; }
                        if (!post) return;
                        set发评论中(true);
                        set发评论错(null);
                        try {
                          const c = await 发评论(post.id, commentText.trim());
                          setApiComments((prev) => [...prev, c]);
                          setCommentText('');
                        } catch (e: any) {
                          set发评论错(e.message || String(e));
                        } finally {
                          set发评论中(false);
                        }
                      }}
                      className="px-4 py-2 bg-[#141414] text-white rounded-lg hover:bg-[#2A2A2A] transition-colors disabled:opacity-40"
                      style={{ fontSize: '12px', fontWeight: 500 }}
                    >
                      {发评论中 ? '发送中…' : t('action.postComment' as TranslationKey)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comment list — 来自 backend */}
          <div className="divide-y divide-[#F4F4F2]">
            {apiComments.length === 0 ? (
              <div className="px-6 py-8 text-center text-[#999994]" style={{ fontSize: '13px' }}>
                {t('post.noComments' as TranslationKey)}
              </div>
            ) : (
              apiComments.map((apiC) => 适配为mockComment(apiC)).map((comment: any) => (
                <div key={comment.id} className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => navigate(`/u/${comment.author.username}`)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: comment.author.avatarColor, fontSize: '11px', fontWeight: 700 }}
                    >
                      {comment.author.avatarInitials}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <button
                          onClick={() => navigate(`/u/${comment.author.username}`)}
                          className="text-[#141414] hover:text-[#444440] transition-colors"
                          style={{ fontSize: '13px', fontWeight: 600 }}
                        >
                          {comment.author.displayName}
                        </button>
                        {comment.author.verified && (
                          <Shield className="w-3 h-3 text-[#6366F1]" strokeWidth={2.5} />
                        )}
                        <span className="text-[#999994]" style={{ fontSize: '12px' }}>
                          {formatTime(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-[#444440] leading-relaxed" style={{ fontSize: '13px' }}>
                        {comment.body}
                      </p>
                      <div className="flex items-center gap-3 mt-2.5">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className={`flex items-center gap-1.5 transition-colors ${
                            likedComments.has(comment.id)
                              ? 'text-[#141414]'
                              : 'text-[#999994] hover:text-[#666660]'
                          }`}
                          style={{ fontSize: '12px' }}
                        >
                          <ThumbsUp
                            className="w-3.5 h-3.5"
                            fill={likedComments.has(comment.id) ? 'currentColor' : 'none'}
                          />
                          {comment.likes + (likedComments.has(comment.id) ? 1 : 0)}
                        </button>
                        <button
                          className="text-[#999994] hover:text-[#666660] transition-colors"
                          style={{ fontSize: '12px' }}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div>
            <h3
              className="text-[#141414] mb-3"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              More in {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </h3>
            <div className="flex flex-col gap-3">
              {relatedPosts.map((rp) => (
                <PostCard key={rp.id} post={rp} compact />
              ))}
            </div>
          </div>
        )}
      </div>

      {showMessage && (
        <ConversationModal
          post={post}
          onClose={() => setShowMessage(false)}
          autoAgent
        />
      )}
    </>
  );
}