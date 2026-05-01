import { useNavigate } from 'react-router';
import { TrendingUp, Users, Hash } from 'lucide-react';
import { posts, trendingTags } from '../../data/mockData';
import { CategoryBadge } from '../CategoryBadge';
import { useLanguage } from '../../context/LanguageContext';
import type { TranslationKey } from '../../i18n/translations';

export function RightPanel() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const topPosts = [...posts]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 4);

  const activeUsers = [
    { username: 'priya_s',   displayName: 'Priya Sharma',  initials: 'PS', color: '#3A1E3A', postCount: 18 },
    { username: 'williams',  displayName: 'Williams',       initials: 'WL', color: '#1A1A2E', postCount: 14 },
    { username: 'ananya_r',  displayName: 'Ananya Rao',    initials: 'AR', color: '#1F2D4A', postCount: 11 },
    { username: 'meridith_k',displayName: 'Meridith Kwan', initials: 'MK', color: '#2D4A22', postCount: 9 },
  ];

  return (
    <aside
      className="shrink-0 hidden xl:flex flex-col gap-5 py-6 px-1"
      style={{ width: '268px' }}
    >
      {/* Trending posts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-3.5 h-3.5 text-[#999994]" />
          <span
            className="text-[#666660] uppercase tracking-wider"
            style={{ fontSize: '10px', fontWeight: 600 }}
          >
            {t('panel.trending' as TranslationKey)}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {topPosts.map((post, i) => (
            <button
              key={post.id}
              onClick={() => navigate(`/post/${post.id}`)}
              className="flex items-start gap-3 text-left group hover:opacity-80 transition-opacity"
            >
              <span
                className="shrink-0 w-5 h-5 rounded-md bg-[#F4F4F2] flex items-center justify-center text-[#999994] mt-0.5"
                style={{ fontSize: '11px', fontWeight: 600 }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[#141414] leading-snug group-hover:text-[#444440] transition-colors line-clamp-2"
                  style={{ fontSize: '12px', fontWeight: 500 }}
                >
                  {post.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <CategoryBadge category={post.category} size="sm" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#F0F0EE]" />

      {/* Active members */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-3.5 h-3.5 text-[#999994]" />
          <span
            className="text-[#666660] uppercase tracking-wider"
            style={{ fontSize: '10px', fontWeight: 600 }}
          >
            {t('panel.activeMembers' as TranslationKey)}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {activeUsers.map((user) => (
            <button
              key={user.username}
              onClick={() => navigate(`/u/${user.username}`)}
              className="flex items-center gap-2.5 group hover:opacity-80 transition-opacity text-left"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: user.color, fontSize: '10px', fontWeight: 700 }}
              >
                {user.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[#141414] truncate"
                  style={{ fontSize: '12px', fontWeight: 500 }}
                >
                  {user.displayName}
                </p>
                <p className="text-[#999994]" style={{ fontSize: '11px' }}>
                  {user.postCount} posts
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#F0F0EE]" />

      {/* Trending tags */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Hash className="w-3.5 h-3.5 text-[#999994]" />
          <span
            className="text-[#666660] uppercase tracking-wider"
            style={{ fontSize: '10px', fontWeight: 600 }}
          >
            {t('panel.popularTags' as TranslationKey)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
              className="px-2.5 py-1 rounded-full bg-[#F4F4F2] text-[#666660] hover:bg-[#EBEBEA] hover:text-[#141414] transition-colors"
              style={{ fontSize: '11px' }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* talkto.me CTA */}
      <div className="rounded-xl bg-[#F8F8F6] border border-[#EBEBEA] p-4">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#141414] text-white"
            style={{ fontSize: '10px', fontWeight: 700 }}
          >
            talkto.me
          </div>
        </div>
        <p className="text-[#666660] leading-relaxed mb-3" style={{ fontSize: '12px' }}>
          {t('ttm.tagline' as TranslationKey)}
        </p>
        <button
          className="w-full py-2 rounded-lg bg-[#141414] text-white hover:bg-[#2A2A2A] transition-colors"
          style={{ fontSize: '12px', fontWeight: 500 }}
        >
          {t('ttm.connect' as TranslationKey)}
        </button>
      </div>

      {/* Brain OS module hook — pre-reserved for Phase 4 integration */}
      <div className="rounded-xl border border-[#E8E8E4] p-4">
        <div className="flex items-center gap-2 mb-2">
          {/* Brain OS icon */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6.5" stroke="#141414" strokeWidth="1"/>
            <circle cx="7" cy="7" r="2.5" fill="#141414" fillOpacity="0.8"/>
            <line x1="7" y1="1" x2="7" y2="4" stroke="#141414" strokeWidth="1" strokeLinecap="round"/>
            <line x1="7" y1="10" x2="7" y2="13" stroke="#141414" strokeWidth="1" strokeLinecap="round"/>
            <line x1="1" y1="7" x2="4" y2="7" stroke="#141414" strokeWidth="1" strokeLinecap="round"/>
            <line x1="10" y1="7" x2="13" y2="7" stroke="#141414" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <span className="text-[#141414]" style={{ fontSize: '11px', fontWeight: 700 }}>
            Brain OS
          </span>
          <span
            className="ml-auto px-1.5 py-0.5 rounded bg-[#F0FDF4] text-[#16A34A]"
            style={{ fontSize: '9px', fontWeight: 600 }}
          >
            Connected
          </span>
        </div>
        <p className="text-[#999994] leading-relaxed mb-2" style={{ fontSize: '11px' }}>
          ClawBulletin is linked to your Brain OS. Discovered listings are fed into your memory layer.
        </p>
        <div className="flex flex-col gap-1">
          {[
            { label: 'P0 · Urgent', color: '#F43F5E', count: 0 },
            { label: 'P1 · Today',  color: '#F97316', count: 2 },
            { label: 'P2 · Auto',   color: '#22C55E', count: 7 },
          ].map((p) => (
            <div key={p.label} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-[#666660]" style={{ fontSize: '10px' }}>{p.label}</span>
              </div>
              <span className="text-[#BBBBB6]" style={{ fontSize: '10px', fontWeight: 600 }}>
                {p.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}