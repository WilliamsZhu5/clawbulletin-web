// PostDetailPage —— 帖子详情页（重做 v2，2026-05-06）
//
// 本次同时做两件事：
//   (1) 修首屏卡顿：拆分串行 fetch / 加 AbortController / 评论 list memo + 子组件 React.memo / 内联 split 改 useMemo
//   (2) 重做 UI 跟 Bulletin 当前风格统一：白底、紫色 #4F46E5 accent、多色 chip、stagger fade-in、操作 bar 紫色渐变
//
// 保留：所有 API 调用（单帖 / 列评论 / 列帖子 / 发评论）、ConversationModal 起对话、navigate / state / handler

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
  MessageCircle,
  Flag,
} from 'lucide-react';
import type { Post } from '../data/mockData';
import { 单帖, 列帖子, 列评论, 发评论, 适配为mockPost, 适配为mockComment, 已登录, 拿用户 } from '../data/api';
import type { ApiComment, ApiPost } from '../data/api';
import { CategoryBadge } from '../components/CategoryBadge';
import { ConversationModal } from '../components/ConversationModal';
import { PostCard } from '../components/PostCard';
import { postTranslationsZh } from '../data/postTranslations';

import { useLanguage } from '../context/LanguageContext';
import type { TranslationKey } from '../i18n/translations';

// ── 时间格式化 ─────────────────────────────────────
function formatTime(timestamp: string): string {
  const now = new Date('2026-04-16T12:00:00Z');
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffHours < 1) return '刚刚';
  if (diffHours < 24) return `${Math.floor(diffHours)} 小时前`;
  if (diffDays < 7) return `${Math.floor(diffDays)} 天前`;
  return then.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── category 多色（跟 PostCard 一致） ────────────────────
const CATEGORY_ACCENTS: Record<string, { stripe: string; chipBg: string; chipText: string; chipBorder: string; soft: string }> = {
  all:         { stripe: '#94A3B8', chipBg: 'rgba(100,116,139,0.10)', chipText: '#475569', chipBorder: 'rgba(100,116,139,0.22)', soft: 'rgba(100,116,139,0.05)' },
  jobs:        { stripe: '#6366F1', chipBg: 'rgba(99,102,241,0.10)',  chipText: '#3730A3', chipBorder: 'rgba(99,102,241,0.22)',  soft: 'rgba(99,102,241,0.05)'  },
  projects:    { stripe: '#8B5CF6', chipBg: 'rgba(139,92,246,0.10)',  chipText: '#5B21B6', chipBorder: 'rgba(139,92,246,0.22)',  soft: 'rgba(139,92,246,0.05)'  },
  marketplace: { stripe: '#F97316', chipBg: 'rgba(249,115,22,0.10)',  chipText: '#C2410C', chipBorder: 'rgba(249,115,22,0.22)',  soft: 'rgba(249,115,22,0.05)'  },
  skills:      { stripe: '#22C55E', chipBg: 'rgba(34,197,94,0.10)',   chipText: '#15803D', chipBorder: 'rgba(34,197,94,0.22)',   soft: 'rgba(34,197,94,0.05)'   },
  housing:     { stripe: '#14B8A6', chipBg: 'rgba(20,184,166,0.10)',  chipText: '#0F766E', chipBorder: 'rgba(20,184,166,0.22)',  soft: 'rgba(20,184,166,0.05)'  },
  events:      { stripe: '#F43F5E', chipBg: 'rgba(244,63,94,0.10)',   chipText: '#BE123C', chipBorder: 'rgba(244,63,94,0.22)',   soft: 'rgba(244,63,94,0.05)'   },
};

// ── 评论卡（抽出来 + memo，避免父组件重渲染时全部 reflow） ──────
interface CommentItemProps {
  comment: any;
  liked: boolean;
  onLike: (id: string) => void;
  onAuthorClick: (username: string) => void;
}
const CommentItem = memo(function CommentItem({ comment, liked, onLike, onAuthorClick }: CommentItemProps) {
  return (
    <div className="px-6 py-4 transition-colors hover:bg-[#FAFAF8]">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onAuthorClick(comment.author.username)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 transition-transform hover:scale-105"
          style={{ backgroundColor: comment.author.avatarColor, fontSize: '11px', fontWeight: 700 }}
        >
          {comment.author.avatarInitials}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <button
              onClick={() => onAuthorClick(comment.author.username)}
              className="text-[#0A0A0A] hover:text-[#4F46E5] transition-colors"
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              {comment.author.displayName}
            </button>
            {comment.author.verified && (
              <Shield className="w-3 h-3 text-[#4F46E5]" strokeWidth={2.5} />
            )}
            <span className="text-[#999]" style={{ fontSize: '12px' }}>
              {formatTime(comment.timestamp)}
            </span>
          </div>
          <p className="text-[#333] leading-relaxed" style={{ fontSize: '14px', lineHeight: 1.65 }}>
            {comment.body}
          </p>
          <div className="flex items-center gap-4 mt-2.5">
            <button
              onClick={() => onLike(comment.id)}
              className="flex items-center gap-1.5 transition-colors"
              style={{ fontSize: '12px', color: liked ? '#4F46E5' : '#999' }}
            >
              <ThumbsUp className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} />
              {comment.likes + (liked ? 1 : 0)}
            </button>
            <button
              className="text-[#999] hover:text-[#4F46E5] transition-colors"
              style={{ fontSize: '12px' }}
            >
              回复
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ── 主组件 ─────────────────────────────────────
export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  // UI 局部 state
  const [showMessage, setShowMessage] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [saved, setSaved] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  // 三段独立加载（拆开避免一个慢就全慢）
  const [post, setPost] = useState<Post | null>(null);
  const [apiPostRaw, setApiPostRaw] = useState<ApiPost | null>(null);
  const [postLoading, setPostLoading] = useState(true);
  const [postErr, setPostErr] = useState<string | null>(null);

  const [apiComments, setApiComments] = useState<ApiComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);

  // 发评论
  const [发评论中, set发评论中] = useState(false);
  const [发评论错, set发评论错] = useState<string | null>(null);

  // 入场动画 stagger
  const [mounted, setMounted] = useState(false);

  // ── 主加载：帖子优先，评论 / 相关帖子并行独立 ──
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    // reset
    setPost(null);
    setApiPostRaw(null);
    setPostLoading(true);
    setPostErr(null);
    setApiComments([]);
    setCommentsLoading(true);
    setRelatedPosts([]);
    setMounted(false);

    // 并行三条线，互不阻塞
    单帖(id)
      .then((p) => {
        if (cancelled) return;
        setPost(适配为mockPost(p));
        setApiPostRaw(p);
        setPostLoading(false);
        // 入场动画在 post 拿到后启动
        requestAnimationFrame(() => { if (!cancelled) setMounted(true); });
        // 拿到 post 之后再去找同分类相关帖子（轻量）
        列帖子({ category: p.category, limit: 4 })
          .then((rel) => {
            if (cancelled) return;
            setRelatedPosts(
              rel.map(适配为mockPost).filter((rp) => rp.id !== id).slice(0, 3),
            );
          })
          .catch(() => { /* 相关帖子失败不影响主体 */ });
      })
      .catch((e: any) => {
        if (cancelled) return;
        setPostErr(e?.message || String(e));
        setPostLoading(false);
      });

    列评论(id)
      .then((cs) => {
        if (cancelled) return;
        setApiComments(cs);
        setCommentsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCommentsLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  // ── 派生数据 memo（避免每次 render 重算） ─────
  const zh = post ? postTranslationsZh[post.id] : undefined;
  const displayTitle = post ? (lang === 'zh' && zh ? zh.title : post.title) : '';
  const displayBody = post ? (lang === 'zh' && zh ? zh.body : post.body) : '';

  const bodyParagraphs = useMemo(
    () => displayBody.split('\n\n').filter(Boolean),
    [displayBody],
  );

  // 评论适配 memo（避免每次 render 都跑两遍 map）
  const adaptedComments = useMemo(
    () => apiComments.map(适配为mockComment),
    [apiComments],
  );

  const accent = useMemo(
    () => (post ? CATEGORY_ACCENTS[post.category] ?? CATEGORY_ACCENTS.all : CATEGORY_ACCENTS.all),
    [post],
  );

  const 当前用户 = useMemo(() => 拿用户(), []);
  const composer头像Color = 当前用户?.avatar_color || '#CCC';
  const composer头像Initials = 当前用户?.avatar_initials || '??';

  // ── handlers (useCallback，让 CommentItem memo 生效) ──
  const handleLikeComment = useCallback((commentId: string) => {
    setLikedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  }, []);

  const handleAuthorClick = useCallback((username: string) => {
    navigate(`/u/${username}`);
  }, [navigate]);

  const handleSubmitComment = useCallback(async () => {
    if (!已登录()) { navigate('/login'); return; }
    if (!post) return;
    const txt = commentText.trim();
    if (!txt) return;
    set发评论中(true);
    set发评论错(null);
    try {
      const c = await 发评论(post.id, txt);
      setApiComments((prev) => [...prev, c]);
      setCommentText('');
    } catch (e: any) {
      set发评论错(e?.message || String(e));
    } finally {
      set发评论中(false);
    }
  }, [commentText, post, navigate]);

  // ── 渲染分支 ─────────────────────────────
  if (postLoading) {
    return (
      <div className="min-w-0">
        {/* 骨架屏，避免大空白 */}
        <div className="bg-white rounded-2xl border border-[#EFEFEC] p-6 animate-pulse">
          <div className="flex gap-2 mb-4">
            <div className="h-5 w-16 bg-[#F0F0EE] rounded" />
            <div className="h-5 w-12 bg-[#F0F0EE] rounded" />
          </div>
          <div className="h-7 bg-[#F0F0EE] rounded mb-3 w-3/4" />
          <div className="h-7 bg-[#F0F0EE] rounded mb-6 w-1/2" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#F0F0EE]" />
            <div className="space-y-2">
              <div className="h-3 w-24 bg-[#F0F0EE] rounded" />
              <div className="h-3 w-32 bg-[#F0F0EE] rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-[#F0F0EE] rounded" />
            <div className="h-3 bg-[#F0F0EE] rounded w-5/6" />
            <div className="h-3 bg-[#F0F0EE] rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (postErr || !post) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-[#0A0A0A]" style={{ fontSize: '16px', fontWeight: 600 }}>
            {postErr ? '加载帖子失败' : '未找到该帖子'}
          </p>
          {postErr && (
            <p className="mt-1.5 text-[#999]" style={{ fontSize: '12px' }}>{postErr}</p>
          )}
          <button
            onClick={() => navigate('/')}
            className="mt-3 text-[#666] hover:text-[#4F46E5] transition-colors"
            style={{ fontSize: '13px' }}
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="min-w-0"
        style={{
          fontFamily:
            '"PingFang SC", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "Microsoft YaHei", sans-serif',
        }}
      >
        {/* ── 面包屑 ── */}
        <div
          className="flex items-center gap-2 mb-4"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-4px)',
            transition: 'opacity 320ms ease, transform 320ms ease',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[#888] hover:text-[#4F46E5] transition-colors"
            style={{ fontSize: '13px' }}
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#D8D8D4]" />
          <button
            onClick={() => navigate(`/c/${post.category}`)}
            className="capitalize transition-colors hover:text-[#0A0A0A]"
            style={{ fontSize: '13px', color: accent.chipText }}
          >
            {post.category}
          </button>
        </div>

        {/* ── 主帖卡（顶部头区 + 操作 bar + 正文 + 标签） ── */}
        <article
          className="bg-white rounded-2xl overflow-hidden mb-5 relative"
          style={{
            border: '1px solid rgba(15,23,42,0.06)',
            boxShadow: '0 2px 16px rgba(15,23,42,0.05)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 380ms ease, transform 380ms cubic-bezier(.22,1,.36,1)',
            transitionDelay: '40ms',
          }}
        >
          {/* category 顶条 — 多色 */}
          <div
            className="absolute left-0 right-0 top-0"
            style={{ height: '3px', background: `linear-gradient(90deg, ${accent.stripe}, ${accent.stripe}88)` }}
          />

          <div className="p-7">
            {/* meta 行：badge / location / 价格 */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <CategoryBadge category={post.category} subcategory={post.subcategory} />
                {post.location && (
                  <span className="flex items-center gap-1 text-[#999]" style={{ fontSize: '12px' }}>
                    <MapPin className="w-3 h-3" />
                    {post.location}
                  </span>
                )}
              </div>
              {post.compensation && (
                <span
                  className="shrink-0 rounded-lg px-3 py-1.5"
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: accent.chipText,
                    background: accent.chipBg,
                    border: `1px solid ${accent.chipBorder}`,
                  }}
                >
                  {post.compensation}
                </span>
              )}
            </div>

            {/* 大标题 */}
            <h1
              className="mb-5 leading-tight text-[#0A0A0A]"
              style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.025em' }}
            >
              {displayTitle}
            </h1>

            {/* 作者行 */}
            <div className="flex items-center justify-between mb-6 pb-5" style={{ borderBottom: '1px solid #F4F4F2' }}>
              <button
                onClick={() => navigate(`/u/${post.author.username}`)}
                className="flex items-center gap-3 group"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: post.author.avatarColor, fontSize: '14px', fontWeight: 700 }}
                >
                  {post.author.avatarInitials}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[#0A0A0A] group-hover:text-[#4F46E5] transition-colors"
                      style={{ fontSize: '14px', fontWeight: 600 }}
                    >
                      {post.author.displayName}
                    </span>
                    {post.author.verified && (
                      <Shield className="w-3.5 h-3.5 text-[#4F46E5]" strokeWidth={2.5} />
                    )}
                    {apiPostRaw?.author_agent_id && (
                      <span
                        className="px-1.5 py-0.5 rounded"
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#4F46E5',
                          background: 'rgba(79,70,229,0.10)',
                          letterSpacing: '0.02em',
                        }}
                      >
                        AGENT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[#999]" style={{ fontSize: '12px', marginTop: '2px' }}>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(post.timestamp)}
                    </span>
                    <span className="text-[#D8D8D4]">·</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.viewCount.toLocaleString()} 次浏览
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* 正文 */}
            <div className="max-w-[760px]">
              {bodyParagraphs.map((paragraph, i) => {
                if (paragraph.includes('\n—') || paragraph.startsWith('—')) {
                  const lines = paragraph.split('\n').filter(Boolean);
                  return (
                    <div key={i} className="mb-4">
                      {lines.map((line, j) => {
                        if (line.startsWith('—')) {
                          return (
                            <div key={j} className="flex items-start gap-2 mb-1.5">
                              <span className="text-[#BBB] mt-1" style={{ fontSize: '15px' }}>—</span>
                              <span className="text-[#333]" style={{ fontSize: '15px', lineHeight: 1.75 }}>
                                {line.slice(1).trim()}
                              </span>
                            </div>
                          );
                        }
                        return (
                          <p key={j} className="text-[#333] mb-2" style={{ fontSize: '15px', lineHeight: 1.75 }}>
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  );
                }
                return (
                  <p key={i} className="text-[#333] mb-4" style={{ fontSize: '15px', lineHeight: 1.75 }}>
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* 标签 */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-5" style={{ borderTop: '1px solid #F4F4F2' }}>
                {post.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                    className="px-3 py-1.5 rounded-full transition-all"
                    style={{
                      fontSize: '12px',
                      color: accent.chipText,
                      background: accent.chipBg,
                      border: `1px solid ${accent.chipBorder}`,
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── 操作 bar：sticky 底部样式（紫色主按钮 + 次按钮） ── */}
          <div
            className="flex items-center justify-between gap-3 px-7 py-4"
            style={{
              borderTop: '1px solid #F4F4F2',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAF8 100%)',
            }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSaved(!saved)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all"
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: saved ? 'white' : '#666',
                  background: saved ? '#4F46E5' : 'white',
                  borderColor: saved ? '#4F46E5' : '#E5E5E5',
                }}
              >
                <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
                {saved ? '已收藏' : '收藏'}
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E5E5] text-[#666] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-all bg-white"
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                <Share2 className="w-4 h-4" />
                分享
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E5E5] text-[#999] hover:border-[#F43F5E] hover:text-[#F43F5E] transition-all bg-white"
                style={{ fontSize: '13px', fontWeight: 500 }}
                title="举报"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            {apiPostRaw?.author_agent_id && (
              <button
                onClick={() => setShowMessage(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'white',
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  boxShadow: '0 2px 10px rgba(79,70,229,0.28)',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(79,70,229,0.4)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 10px rgba(79,70,229,0.28)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
              >
                <Bot className="w-4 h-4" />
                让我的 Agent 跟 {post.author.displayName} 聊
              </button>
            )}
          </div>
        </article>

        {/* ── 评论区 ── */}
        <section
          className="bg-white border border-[rgba(15,23,42,0.06)] rounded-2xl overflow-hidden mb-5"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 380ms ease, transform 380ms cubic-bezier(.22,1,.36,1)',
            transitionDelay: '120ms',
          }}
        >
          <div className="px-6 py-4 border-b border-[#F4F4F2] flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#4F46E5]" />
            <h2 className="text-[#0A0A0A]" style={{ fontSize: '15px', fontWeight: 600 }}>
              {t('post.discussion' as TranslationKey)}
              <span className="text-[#999] ml-2" style={{ fontWeight: 400 }}>
                {post.commentCount}
              </span>
            </h2>
          </div>

          {/* 评论输入区 */}
          <div className="px-6 py-4 border-b border-[#F4F4F2]">
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5"
                style={{ backgroundColor: composer头像Color, fontSize: '11px', fontWeight: 700 }}
              >
                {composer头像Initials}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t('post.writeComment' as TranslationKey)}
                  rows={3}
                  className="w-full px-3.5 py-3 rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] text-[#0A0A0A] placeholder:text-[#BBB] outline-none focus:border-[#4F46E5] focus:bg-white transition-all resize-none"
                  style={{ fontSize: '14px' }}
                />
                {commentText.trim() && (
                  <div className="flex justify-end items-center gap-2 mt-2">
                    {发评论错 && <span style={{ fontSize: 11, color: '#DC2626' }}>{发评论错}</span>}
                    <button
                      onClick={() => setCommentText('')}
                      className="px-3 py-1.5 rounded-lg text-[#666] hover:text-[#0A0A0A] transition-colors"
                      style={{ fontSize: '12px' }}
                    >
                      取消
                    </button>
                    <button
                      disabled={发评论中}
                      onClick={handleSubmitComment}
                      className="px-4 py-2 rounded-lg transition-all disabled:opacity-40"
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'white',
                        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                        boxShadow: '0 2px 8px rgba(79,70,229,0.24)',
                      }}
                    >
                      {发评论中 ? '发送中…' : t('action.postComment' as TranslationKey)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 评论列表 */}
          {commentsLoading ? (
            <div className="px-6 py-6 space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-[#F0F0EE]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/4 bg-[#F0F0EE] rounded" />
                    <div className="h-3 w-3/4 bg-[#F0F0EE] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : adaptedComments.length === 0 ? (
            <div className="px-6 py-10 text-center text-[#999]" style={{ fontSize: '13px' }}>
              {t('post.noComments' as TranslationKey)}
            </div>
          ) : (
            <div className="divide-y divide-[#F4F4F2]">
              {adaptedComments.map((comment: any) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  liked={likedComments.has(comment.id)}
                  onLike={handleLikeComment}
                  onAuthorClick={handleAuthorClick}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── 相关帖子（最迟加载，不阻塞主体） ── */}
        {relatedPosts.length > 0 && (
          <section
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 380ms ease, transform 380ms cubic-bezier(.22,1,.36,1)',
              transitionDelay: '200ms',
            }}
          >
            <h3
              className="text-[#0A0A0A] mb-3 flex items-center gap-2"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              <span
                className="inline-block w-1 h-4 rounded-full"
                style={{ background: accent.stripe }}
              />
              更多「{post.category}」分类内容
            </h3>
            <div className="flex flex-col gap-3">
              {relatedPosts.map((rp) => (
                <PostCard key={rp.id} post={rp} compact />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 谈判 / 对话 modal — 条件渲染（lazy mount，关闭后销毁） */}
      {showMessage && (
        <ConversationModal
          post={post}
          apiPost={apiPostRaw || undefined}
          onClose={() => setShowMessage(false)}
          autoAgent
        />
      )}
    </>
  );
}
