import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Flame, Clock, Star, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { trendingTags } from '../data/mockData';
import type { Post } from '../data/mockData';
import { PostCard } from '../components/PostCard';
import { 列帖子, 适配为mockPost } from '../data/api';

type TimeRange = '24h' | '7d' | '30d';

export function TrendingPage() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // 真实数据：从后端拉
  const [posts, setPosts] = useState<Post[]>([]);
  const [加载中, set加载中] = useState(true);
  const [错误, set错误] = useState<string | null>(null);

  useEffect(() => {
    set加载中(true);
    set错误(null);
    列帖子({ sort: 'hot', limit: 50 })
      .then((apiPosts) => setPosts(apiPosts.map(适配为mockPost)))
      .catch((e) => set错误(e.message || String(e)))
      .finally(() => set加载中(false));
  }, []);

  const filteredPosts = useMemo(
    () => activeTag
      ? posts.filter((p) => p.tags?.some((t) => t.toLowerCase() === activeTag.toLowerCase()))
      : posts,
    [posts, activeTag],
  );

  // Simulate different trending calculations based on time range
  const trendingPosts = [...filteredPosts].sort((a, b) => {
    const scoreA = b.commentCount * 3 + b.viewCount / 20;
    const scoreB = a.commentCount * 3 + a.viewCount / 20;
    return scoreA - scoreB;
  });

  // Top by views
  const topByViews = [...filteredPosts].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

  // Most discussed
  const mostDiscussed = [...filteredPosts].sort((a, b) => b.commentCount - a.commentCount).slice(0, 5);

  const timeRangeLabels: Record<TimeRange, string> = {
    '24h': '过去 24 小时',
    '7d': '过去 7 天',
    '30d': '过去 30 天',
  };

  return (
    <div>
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div
          className="rounded-2xl mb-5 px-5 py-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #EF4444 55%, #EC4899 100%)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          }}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)' }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.7)' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>BULLETIN</span>
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.2 }}>热门</h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginTop: '4px' }}>Bulletin 上当前最活跃的发布</p>
            </div>
            {/* Time range selector */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)' }}>
              {(['24h', '7d', '30d'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className="px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    fontSize: '12px',
                    fontWeight: timeRange === range ? 700 : 400,
                    color: 'white',
                    background: timeRange === range ? 'rgba(255,255,255,0.2)' : 'transparent',
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: '活跃发布', value: '147', sub: timeRangeLabels[timeRange], color: '#F97316' },
            { label: '新讨论', value: '89', sub: timeRangeLabels[timeRange], color: '#EF4444' },
            { label: 'talkto.me 连接', value: '34', sub: timeRangeLabels[timeRange], color: '#EC4899' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <p className="mb-0.5" style={{ fontSize: '22px', fontWeight: 800, color: stat.color, letterSpacing: '-0.03em' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1E' }}>{stat.label}</p>
              <p style={{ fontSize: '11px', color: '#ADADAA' }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Trending tags */}
        <div className="rounded-xl p-4 mb-5" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Flame style={{ width: '13px', height: '13px', color: '#F97316' }} />
            <span className="uppercase tracking-wider" style={{ fontSize: '10px', fontWeight: 700, color: '#888882' }}>
              热门标签
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag, i) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all"
                style={{
                  fontSize: '12px',
                  borderColor: activeTag === tag ? '#F97316' : '#E8E8E4',
                  color: activeTag === tag ? '#F97316' : '#666660',
                  background: activeTag === tag ? 'rgba(249,115,22,0.08)' : 'transparent',
                  fontWeight: activeTag === tag ? 600 : 400,
                }}
              >
                <span
                  className="w-4 h-4 rounded-full bg-[#F4F4F2] flex items-center justify-center text-[#999994]"
                  style={{ fontSize: '9px', fontWeight: 700 }}
                >
                  {i + 1}
                </span>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Trending posts */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-[#F97316]" />
            <h2
              className="text-[#141414]"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              {activeTag ? `#${activeTag}` : '当前最热'}
            </h2>
          </div>
          {加载中 ? (
            <div className="text-center py-12 text-[#999994]" style={{ fontSize: '13px' }}>
              加载中…
            </div>
          ) : 错误 ? (
            <div className="text-center py-12">
              <p className="text-[#DC2626]" style={{ fontSize: '13px' }}>加载失败：{错误}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {trendingPosts.slice(0, 8).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Most viewed + most discussed side by side */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white border border-[#E8E8E4] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#F4F4F2] flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-[#999994]" />
              <span className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 600 }}>
                最多浏览
              </span>
            </div>
            <div className="divide-y divide-[#F4F4F2]">
              {topByViews.map((post, i) => (
                <button
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#FAFAF8] transition-colors group"
                >
                  <span
                    className="shrink-0 w-5 h-5 rounded-md bg-[#F4F4F2] flex items-center justify-center text-[#999994] mt-0.5"
                    style={{ fontSize: '11px', fontWeight: 600 }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[#141414] line-clamp-2 leading-snug group-hover:text-[#444440] transition-colors"
                      style={{ fontSize: '12px', fontWeight: 500 }}
                    >
                      {post.title}
                    </p>
                    <p className="text-[#999994] mt-1" style={{ fontSize: '11px' }}>
                      {post.viewCount >= 1000 ? `${(post.viewCount / 1000).toFixed(1)}k` : post.viewCount} 次浏览
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E8E8E4] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#F4F4F2] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#999994]" />
              <span className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 600 }}>
                最多讨论
              </span>
            </div>
            <div className="divide-y divide-[#F4F4F2]">
              {mostDiscussed.map((post, i) => (
                <button
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#FAFAF8] transition-colors group"
                >
                  <span
                    className="shrink-0 w-5 h-5 rounded-md bg-[#F4F4F2] flex items-center justify-center text-[#999994] mt-0.5"
                    style={{ fontSize: '11px', fontWeight: 600 }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[#141414] line-clamp-2 leading-snug group-hover:text-[#444440] transition-colors"
                      style={{ fontSize: '12px', fontWeight: 500 }}
                    >
                      {post.title}
                    </p>
                    <p className="text-[#999994] mt-1" style={{ fontSize: '11px' }}>
                      {post.commentCount} 条回复
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}