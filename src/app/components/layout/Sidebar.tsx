import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Home, TrendingUp, Bookmark, FileText, Settings,
  Puzzle, Bot, MessageSquare,
  Briefcase, Rocket, ShoppingBag, Wrench, Building2, CalendarDays, LayoutGrid,
  Handshake,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { CategoryId } from '../../data/mockData';
import type { TranslationKey } from '../../i18n/translations';
import { currentUser } from '../../data/mockData';
import { useMatches } from '../../context/MatchContext';

const categoryItems: Array<{
  id: CategoryId;
  tKey: TranslationKey;
  icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>;
  color: string;
  glow: string;
}> = [
  { id: 'all',         tKey: 'cat.all',         icon: LayoutGrid,   color: '#A0A0A8', glow: 'rgba(160,160,168,0.3)' },
  { id: 'jobs',        tKey: 'cat.jobs',        icon: Briefcase,    color: '#818CF8', glow: 'rgba(129,140,248,0.35)' },
  { id: 'projects',    tKey: 'cat.projects',    icon: Rocket,       color: '#A78BFA', glow: 'rgba(167,139,250,0.35)' },
  { id: 'marketplace', tKey: 'cat.marketplace', icon: ShoppingBag,  color: '#FB923C', glow: 'rgba(251,146,60,0.35)' },
  { id: 'skills',      tKey: 'cat.skills',      icon: Wrench,       color: '#4ADE80', glow: 'rgba(74,222,128,0.35)' },
  { id: 'housing',     tKey: 'cat.housing',     icon: Building2,    color: '#2DD4BF', glow: 'rgba(45,212,191,0.35)' },
  { id: 'events',      tKey: 'cat.events',      icon: CalendarDays, color: '#FB7185', glow: 'rgba(251,113,133,0.35)' },
];

const navItems: Array<{
  tKey: TranslationKey;
  icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }> | null;
  path: string;
}> = [
  { tKey: 'nav.home',     icon: Home,          path: '/' },
  { tKey: 'nav.trending', icon: TrendingUp,    path: '/trending' },
  { tKey: 'nav.messages', icon: MessageSquare,  path: '/messages' },
  { tKey: 'nav.matches',  icon: Handshake,     path: '/matches' },
  { tKey: 'nav.saved',    icon: Bookmark,      path: '/saved' },
  { tKey: 'nav.myPosts',  icon: FileText,      path: '/my-posts' },
];

const BG = '#F6F5F0';
const BORDER = 'rgba(0,0,0,0.08)';
const TEXT_DIM = '#ADADAA';
const TEXT_MID = '#666660';
const TEXT_BRIGHT = '#141414';
const HOVER_BG = 'rgba(0,0,0,0.04)';
const ACTIVE_BG = 'rgba(79,70,229,0.07)';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { matches } = useMatches();
  const activeCategory: CategoryId = (() => {
    if (location.pathname.startsWith('/c/')) {
      const cat = location.pathname.split('/c/')[1]?.split('/')[0];
      return (cat as CategoryId) || 'all';
    }
    return 'all';
  })();

  const handleCategory = (catId: CategoryId) => {
    if (catId === 'all') navigate('/');
    else navigate(`/c/${catId}`);
  };

  const activeMatchCount = matches.filter((m) => m.status === 'active').length;

  return (
    <aside
      className="fixed left-0 bottom-0 flex flex-col"
      style={{ top: '56px', width: '220px', background: BG, borderRight: `1px solid ${BORDER}`, zIndex: 20 }}
    >
      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>

        {/* Navigation */}
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/'
              ? location.pathname === '/' || location.pathname.startsWith('/c/')
              : location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl w-full text-left transition-colors"
                style={{
                  background: isActive ? ACTIVE_BG : 'transparent',
                  borderLeft: isActive ? '2px solid #6366F1' : '2px solid transparent',
                  paddingLeft: isActive ? '10px' : '12px',
                }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = HOVER_BG; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                {Icon ? (
                  <Icon
                    style={{
                      width: '15px',
                      height: '15px',
                      color: isActive ? '#818CF8' : TEXT_DIM,
                    }}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                ) : null}
                <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400, color: isActive ? TEXT_BRIGHT : TEXT_MID }}>
                  {t(item.tKey)}
                </span>
                {/* Active match badge on Matches nav item */}
                {item.path === '/matches' && activeMatchCount > 0 && (
                  <span
                    className="ml-auto rounded-full px-1.5 py-0.5"
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      color: isActive ? '#4F46E5' : '#888882',
                      background: isActive ? 'rgba(79,70,229,0.12)' : 'rgba(0,0,0,0.07)',
                      minWidth: '16px',
                      textAlign: 'center',
                    }}
                  >
                    {activeMatchCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div style={{ height: '1px', background: BORDER, margin: '0 -12px' }} />

        {/* Categories */}
        <div>
          <div className="px-3 mb-2" style={{ fontSize: '9px', fontWeight: 700, color: TEXT_DIM, letterSpacing: '0.1em' }}>
            {t('nav.categories' as TranslationKey)}
          </div>
          <div className="flex flex-col gap-0.5">
            {categoryItems.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategory(cat.id)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl w-full text-left transition-colors group"
                  style={{ background: isActive ? ACTIVE_BG : 'transparent' }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = HOVER_BG; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  {/* Colored icon with glow on active */}
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                    style={{
                      background: isActive ? `${cat.color}20` : 'rgba(0,0,0,0.05)',
                      boxShadow: isActive ? `0 0 8px ${cat.glow}` : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon
                      style={{
                        width: '11px',
                        height: '11px',
                        color: isActive ? cat.color : TEXT_DIM,
                      }}
                      strokeWidth={2}
                    />
                  </div>
                  <span
                    className="flex-1 truncate"
                    style={{ fontSize: '12px', fontWeight: isActive ? 600 : 400, color: isActive ? TEXT_BRIGHT : TEXT_MID }}
                  >
                    {t(cat.tKey)}
                  </span>
                  {isActive && (
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: cat.color }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom actions ── */}
      <div className="shrink-0 px-3 py-2 flex flex-col gap-0.5" style={{ borderTop: `1px solid ${BORDER}` }}>
        <button
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl w-full text-left transition-all"
          onClick={() => navigate(`/u/${currentUser.username}`)}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = HOVER_BG; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <Bot style={{ width: '15px', height: '15px', color: '#818CF8' }} strokeWidth={1.75} />
          <span style={{ fontSize: '12px', color: TEXT_MID }}>My Agent</span>
          <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl w-full text-left transition-all"
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = HOVER_BG; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <Settings style={{ width: '15px', height: '15px', color: TEXT_DIM }} strokeWidth={1.75} />
          <span style={{ fontSize: '12px', color: TEXT_MID }}>{t('nav.settings' as TranslationKey)}</span>
        </button>

        {/* User chip at very bottom */}
        <div
          className="flex items-center gap-2 px-2.5 py-2 rounded-xl mt-1"
          style={{ background: 'rgba(0,0,0,0.04)', border: `1px solid ${BORDER}` }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: currentUser.avatarColor, fontSize: '8px', fontWeight: 700 }}
          >
            {currentUser.avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: '11px', fontWeight: 600, color: TEXT_BRIGHT, lineHeight: 1 }}>
              {currentUser.displayName}
            </p>
            <p className="truncate" style={{ fontSize: '9px', color: TEXT_DIM, lineHeight: '1.4' }}>
              {currentUser.talktoLink}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}