import { useState, useMemo, useEffect } from 'react';
import {
  Flame, Clock, Star, Bot, X,
  Search, MessageSquare, Handshake, ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { PostCard } from '../components/PostCard';
import { categories, categorySubcategories } from '../data/mockData';
import type { CategoryId, Post } from '../data/mockData';
import { 列帖子, 适配为mockPost } from '../data/api';
import { useLanguage } from '../context/LanguageContext';
import type { TranslationKey } from '../i18n/translations';

type SortMode = 'latest' | 'hot' | 'top';

interface HomePageProps {
  filterCategory?: CategoryId;
}

/* ── Onboarding steps ── */
const STEPS_EN = [
  { icon: Search, title: 'Post or Browse', desc: 'Describe what you need in plain language — jobs, housing, items, skills, anything.' },
  { icon: Handshake, title: 'Auto-Match', desc: 'AI finds the best matches from all listings and connects you instantly.' },
  { icon: MessageSquare, title: 'Agent Deals', desc: 'Your agent negotiates, schedules, and closes — you just approve.' },
];
const STEPS_ZH = [
  { icon: Search, title: '发布或浏览', desc: '用自然语言描述你的需求——工作、租房、物品、技能,任何事。' },
  { icon: Handshake, title: '自动匹配', desc: 'AI 从所有列表中找到最佳匹配,即刻连接。' },
  { icon: MessageSquare, title: 'Agent 交易', desc: '你的 Agent 自动协商、安排、成交——你只需确认。' },
];

const ONBOARDING_KEY = 'clawbulletin_onboarding_dismissed';

export function HomePage({ filterCategory }: HomePageProps) {
  const { category } = useParams<{ category?: string }>();
  const activeCategory = (filterCategory ?? category ?? 'all') as CategoryId;
  const [sort, setSort] = useState<SortMode>('latest');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all');
  const [onboardingDismissed, setOnboardingDismissed] = useState(() => {
    try { return localStorage.getItem(ONBOARDING_KEY) === '1'; } catch { return false; }
  });
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const isHome = activeCategory === 'all';
  const subcategories = activeCategory !== 'all' ? categorySubcategories[activeCategory] ?? [] : [];
  const activeCategoryData = categories.find((c) => c.id === activeCategory);

  // 真实数据：从后端拉
  const [posts, setPosts] = useState<Post[]>([]);
  const [加载中, set加载中] = useState(true);
  const [错误, set错误] = useState<string | null>(null);

  useEffect(() => {
    set加载中(true);
    set错误(null);
    列帖子({ category: activeCategory, sort, limit: 50 })
      .then((apiPosts) => setPosts(apiPosts.map(适配为mockPost)))
      .catch((e) => set错误(e.message || String(e)))
      .finally(() => set加载中(false));
  }, [activeCategory, sort]);

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (subcategoryFilter !== 'all') result = result.filter((p) => p.subcategory === subcategoryFilter);
    return result;
  }, [posts, subcategoryFilter]);

  const steps = lang === 'zh' ? STEPS_ZH : STEPS_EN;

  const dismissOnboarding = () => {
    setOnboardingDismissed(true);
    try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch {}
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) setActiveStep(activeStep + 1);
    else dismissOnboarding();
  };

  return (
    <div>
      {/* ── Onboarding guide (dismissible) ── */}
      {isHome && !onboardingDismissed && (
        <div
          className="rounded-2xl mb-4 relative overflow-hidden"
          style={{
            background: 'white',
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {/* Header bar */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center gap-2">
              <Bot style={{ width: '14px', height: '14px', color: '#4F46E5' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1E' }}>
                {lang === 'zh' ? '快速了解 ClawBulletin' : 'Welcome to ClawBulletin'}
              </span>
              <span
                className="px-1.5 py-0.5 rounded"
                style={{ fontSize: '9px', fontWeight: 700, color: '#4F46E5', background: 'rgba(79,70,229,0.08)' }}
              >
                {activeStep + 1}/{steps.length}
              </span>
            </div>
            <button
              onClick={dismissOnboarding}
              className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
              style={{ fontSize: '11px', color: '#ADADAA' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.04)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <X style={{ width: '12px', height: '12px' }} />
              {lang === 'zh' ? '跳过' : 'Skip'}
            </button>
          </div>

          {/* Step content */}
          <div className="px-5 py-4">
            <div className="flex items-start gap-4">
              {/* Step icon */}
              <div
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' }}
              >
                {(() => {
                  const StepIcon = steps[activeStep].icon;
                  return <StepIcon style={{ width: '18px', height: '18px', color: '#4F46E5' }} strokeWidth={1.75} />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ fontSize: '10px', fontWeight: 700, color: 'white', background: '#4F46E5' }}
                  >
                    {activeStep + 1}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1E' }}>
                    {steps[activeStep].title}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#666660', lineHeight: 1.6 }}>
                  {steps[activeStep].desc}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              {/* Step dots */}
              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className="rounded-full transition-all"
                    style={{
                      width: i === activeStep ? '16px' : '6px',
                      height: '6px',
                      background: i === activeStep ? '#4F46E5' : 'rgba(0,0,0,0.12)',
                    }}
                  />
                ))}
              </div>
              {/* Next / Got it */}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'white',
                  background: '#4F46E5',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#4338CA'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#4F46E5'; }}
              >
                {activeStep < steps.length - 1
                  ? (lang === 'zh' ? '下一步' : 'Next')
                  : (lang === 'zh' ? '开始使用' : 'Got it')}
                <ChevronRight style={{ width: '13px', height: '13px' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Category header ── */}
      {(() => {
        const CATEGORY_META: Record<CategoryId, { gradient: string }> = {
          all:         { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
          jobs:        { gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' },
          projects:    { gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' },
          marketplace: { gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' },
          skills:      { gradient: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' },
          housing:     { gradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)' },
          events:      { gradient: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)' },
        };
        const meta = CATEGORY_META[activeCategory];
        return (
          <div
            className="rounded-2xl mb-5 px-5 py-4 relative overflow-hidden"
            style={{ background: meta.gradient, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
            <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)' }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.7)' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>
                  CLAWBULLETIN
                </span>
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                {isHome ? t('feed.allListings' as TranslationKey) : activeCategoryData?.label}
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginTop: '4px' }}>
                {isHome ? t('feed.browseAll' as TranslationKey) : activeCategoryData?.description}
              </p>
            </div>
          </div>
        );
      })()}

      {/* ── Controls bar ── */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        {isHome && (
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1E', letterSpacing: '-0.01em' }}>
            {lang === 'zh' ? '最新列表' : 'Recent Listings'}
          </span>
        )}

        {/* Sort tabs */}
        <div
          className="flex items-center gap-0.5 p-1 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.07)' }}
        >
          {[
            { value: 'latest' as SortMode, tKey: 'sort.latest' as TranslationKey, icon: Clock },
            { value: 'hot'    as SortMode, tKey: 'sort.hot'    as TranslationKey, icon: Flame },
            { value: 'top'    as SortMode, tKey: 'sort.top'    as TranslationKey, icon: Star },
          ].map(({ value, tKey, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSort(value)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
              style={{
                fontSize: '12px',
                fontWeight: sort === value ? 600 : 400,
                color: sort === value ? '#1A1A1E' : '#888882',
                background: sort === value ? 'white' : 'transparent',
                boxShadow: sort === value ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Icon style={{ width: '12px', height: '12px' }} />
              {t(tKey)}
            </button>
          ))}
        </div>

        {/* Subcategory pills */}
        {subcategories.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {['all', ...subcategories].map((sub) => (
              <button
                key={sub}
                onClick={() => setSubcategoryFilter(sub)}
                className="px-2.5 py-1.5 rounded-full transition-all"
                style={{
                  fontSize: '11px',
                  fontWeight: subcategoryFilter === sub ? 600 : 400,
                  color: subcategoryFilter === sub ? 'white' : '#888882',
                  background: subcategoryFilter === sub
                    ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                    : 'rgba(0,0,0,0.05)',
                  border: '1px solid',
                  borderColor: subcategoryFilter === sub ? 'transparent' : 'rgba(0,0,0,0.08)',
                  boxShadow: subcategoryFilter === sub ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
                }}
              >
                {sub === 'all' ? 'All' : sub}
              </button>
            ))}
          </div>
        )}

        {/* Count */}
        <span className="ml-auto" style={{ fontSize: '12px', color: '#ADADAA' }}>
          {t('feed.count' as TranslationKey, { count: filteredPosts.length })}
        </span>
      </div>

      {/* ── Posts list ── */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(0,0,0,0.03)', border: '1px dashed rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '14px', color: '#ADADAA' }}>
            {t('feed.noResults' as TranslationKey)}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Load more */}
      {filteredPosts.length > 0 && (
        <div className="mt-6 text-center">
          <button
            className="px-6 py-2.5 rounded-xl transition-all"
            style={{
              fontSize: '13px',
              color: '#666660',
              background: 'white',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; }}
          >
            {t('action.loadMore' as TranslationKey)}
          </button>
        </div>
      )}
    </div>
  );
}