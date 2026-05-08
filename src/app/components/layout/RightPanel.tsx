import { useNavigate } from 'react-router';
import { TrendingUp, Hash } from 'lucide-react';
import { posts, trendingTags } from '../../data/mockData';
import { CategoryBadge } from '../CategoryBadge';
import { useLanguage } from '../../context/LanguageContext';
import type { TranslationKey } from '../../i18n/translations';

// 极简右栏：纯白底，所有"卡片"靠 1px 边框分区，不再用颜色拼接
const BORDER = '#E5E5E5';
const BORDER_SOFT = '#F0F0F0';
const TEXT_LABEL = '#999999';

export function RightPanel() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const topPosts = [...posts]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 4);

  // trending number badge 的多色色板（4 个 rank → 4 种颜色）
  const trendingRankColors = [
    { bg: 'rgba(244,63,94,0.10)',  fg: '#BE123C' },  // 1：rose（最热）
    { bg: 'rgba(249,115,22,0.10)', fg: '#C2410C' },  // 2：橙
    { bg: 'rgba(245,158,11,0.10)', fg: '#B45309' },  // 3：金
    { bg: 'rgba(99,102,241,0.10)', fg: '#3730A3' },  // 4：indigo
  ];

  const sectionLabel = (icon: any, label: string) => {
    const Icon = icon;
    return (
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5" style={{ color: TEXT_LABEL }} strokeWidth={1.75} />
        <span
          className="uppercase tracking-wider"
          style={{ fontSize: '10px', fontWeight: 600, color: TEXT_LABEL, letterSpacing: '0.08em' }}
        >
          {label}
        </span>
      </div>
    );
  };

  return (
    // 极简右栏：纯白底，无外层颜色
    <aside
      className="shrink-0 hidden xl:flex flex-col gap-0 self-start sticky"
      style={{
        width: '288px',
        top: '72px',
        background: '#FFFFFF',
      }}
    >
      {/* Trending posts */}
      <div className="rounded-none p-4" style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}>
        {sectionLabel(TrendingUp, t('panel.trending' as TranslationKey))}
        <div className="flex flex-col gap-2.5">
          {topPosts.map((post, i) => (
            <button
              key={post.id}
              onClick={() => navigate(`/post/${post.id}`)}
              className="flex items-start gap-3 text-left group transition-opacity"
            >
              <span
                className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-0.5"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: (trendingRankColors[i] ?? { bg: '#F5F5F5' }).bg,
                  color: (trendingRankColors[i] ?? { fg: '#999999' }).fg,
                }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="leading-snug line-clamp-2"
                  style={{ fontSize: '12px', fontWeight: 500, color: '#0A0A0A' }}
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

      {/* Trending tags */}
      <div className="rounded-none p-4" style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}>
        {sectionLabel(Hash, t('panel.popularTags' as TranslationKey))}
        <div className="flex flex-wrap gap-1.5">
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
              className="px-2.5 py-1 rounded-full transition-colors"
              style={{ fontSize: '11px', background: '#FFFFFF', color: '#666666', border: `1px solid ${BORDER}` }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#4F46E5';
                (e.currentTarget as HTMLButtonElement).style.color = '#4F46E5';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER;
                (e.currentTarget as HTMLButtonElement).style.color = '#666666';
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* talkto.me CTA —— figma 风白卡 + 紫色渐变按钮 */}
      <div className="rounded-none p-4" style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}>
        <div className="flex items-center gap-2 mb-2">
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#0A0A0A',
              letterSpacing: '0.06em',
            }}
          >
            talkto.me
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#525252', lineHeight: 1.6, marginBottom: '12px', letterSpacing: '-0.005em' }}>
          {t('ttm.tagline' as TranslationKey)}
        </p>
        <button
          className="w-full py-2 rounded-lg transition-all"
          style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '-0.005em',
            color: '#FFFFFF',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.3)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.25)'; }}
        >
          {t('ttm.connect' as TranslationKey)}
        </button>
      </div>

      {/* Brain OS hook —— 白底带极轻紫色 tint，已连接 chip 用 status-open 绿 */}
      <div className="rounded-none p-4">
        <div className="flex items-center gap-2 mb-2">
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#0A0A0A' }}>
            Brain OS
          </span>
          <span
            className="ml-auto px-1.5 py-0.5 rounded"
            style={{ fontSize: '9px', fontWeight: 700, color: 'var(--status-open-text)', background: 'var(--status-open-bg)' }}
          >
            已连接
          </span>
        </div>
        <p style={{ fontSize: '11px', color: '#999999', lineHeight: 1.55, marginBottom: '8px' }}>
          Bulletin 已接入 Brain OS，发现的内容会自动归入你的记忆层。
        </p>
        <div className="flex flex-col gap-1">
          {[
            { label: 'P0 · 紧急', count: 0, dot: '#F43F5E' },  // rose
            { label: 'P1 · 今日', count: 2, dot: '#F97316' },  // 橙
            { label: 'P2 · 自动', count: 7, dot: '#22C55E' },  // 绿
          ].map((p) => (
            <div key={p.label} className="flex items-center justify-between">
              <span className="flex items-center gap-1.5" style={{ fontSize: '10px', color: '#666666' }}>
                <span className="inline-block rounded-full" style={{ width: '5px', height: '5px', background: p.dot }} />
                {p.label}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: p.count > 0 ? p.dot : '#999999' }}>
                {p.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
