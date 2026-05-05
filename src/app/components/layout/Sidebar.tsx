import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Home, TrendingUp, Bookmark, FileText, Settings,
  Bot, MessageSquare,
  Briefcase, Rocket, ShoppingBag, Wrench, Building2, CalendarDays, LayoutGrid,
  Handshake, MoreHorizontal, User as UserIcon, LogOut,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { CategoryId } from '../../data/mockData';
import type { TranslationKey } from '../../i18n/translations';
import { useMatches } from '../../context/MatchContext';
import { 已登录, 拿用户, 清登录态 } from '../../data/api';
import { LogIn } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';

// element-level 多色 sidebar：底色保持纯白，但每个 category 的 icon 用自己的颜色（subtle）
// active = category 自己的颜色作 left 2px stripe + 文字加深，不强行用紫色 override
const categoryItems: Array<{
  id: CategoryId;
  tKey: TranslationKey;
  icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>;
  color: string;  // category 本色，用于 icon / active stripe
}> = [
  { id: 'all',         tKey: 'cat.all',         icon: LayoutGrid,    color: '#64748B' },
  { id: 'jobs',        tKey: 'cat.jobs',        icon: Briefcase,     color: '#6366F1' },
  { id: 'projects',    tKey: 'cat.projects',    icon: Rocket,        color: '#8B5CF6' },
  { id: 'marketplace', tKey: 'cat.marketplace', icon: ShoppingBag,   color: '#F97316' },
  { id: 'skills',      tKey: 'cat.skills',      icon: Wrench,        color: '#22C55E' },
  { id: 'housing',     tKey: 'cat.housing',     icon: Building2,     color: '#14B8A6' },
  { id: 'events',      tKey: 'cat.events',      icon: CalendarDays,  color: '#F43F5E' },
];

// nav 项：path === '__my_agent__' 是哨兵值，单独渲染（用 Bot icon + 中文写死的 label）
const navItems: Array<{
  tKey: TranslationKey;
  icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }> | null;
  path: string;
  label?: string;
}> = [
  { tKey: 'nav.home',     icon: Home,          path: '/' },
  { tKey: 'nav.trending', icon: TrendingUp,    path: '/trending' },
  // 跟我的 Agent 聊（A1）
  { tKey: 'nav.home',     icon: Bot,           path: '/my-agent', label: '跟 Agent 聊' },
  { tKey: 'nav.messages', icon: MessageSquare,  path: '/messages' },
  { tKey: 'nav.matches',  icon: Handshake,     path: '/matches' },
  { tKey: 'nav.saved',    icon: Bookmark,      path: '/saved' },
  { tKey: 'nav.myPosts',  icon: FileText,      path: '/my-posts' },
];

// figma 风 token：浅冷白底 + 紫色 hover/active accent
const BG = '#FCFCFD';
const BORDER = 'rgba(15,23,42,0.06)';
const TEXT_DIM = '#999999';
const TEXT_MID = '#525252';
const TEXT_BRIGHT = '#0A0A0A';
const HOVER_BG = 'rgba(79,70,229,0.06)';
const ACCENT = '#4F46E5';
const ACCENT_SOFT = 'rgba(79,70,229,0.10)';

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
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left transition-colors"
                style={{
                  background: 'transparent',
                  borderLeft: isActive ? `2px solid ${ACCENT}` : '2px solid transparent',
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
                      color: isActive ? ACCENT : TEXT_DIM,
                    }}
                    strokeWidth={isActive ? 2 : 1.75}
                  />
                ) : null}
                <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400, color: isActive ? ACCENT : TEXT_MID }}>
                  {item.label ?? t(item.tKey)}
                </span>
                {/* Active match badge —— 通知红（恢复多色 element） */}
                {item.path === '/matches' && activeMatchCount > 0 && (
                  <span
                    className="ml-auto rounded-full px-1.5 py-0.5"
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      background: '#DC2626',
                      minWidth: '16px',
                      textAlign: 'center',
                      boxShadow: '0 1px 2px rgba(220,38,38,0.28)',
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
          <div className="px-3 mb-2" style={{ fontSize: '10px', fontWeight: 600, color: TEXT_DIM, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {t('nav.categories' as TranslationKey)}
          </div>
          <div className="flex flex-col gap-0.5">
            {categoryItems.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              // active 时用 category 自己的颜色，未 active 时 icon 也用 category 色（仅 60% 透明，subtle）
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategory(cat.id)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left transition-colors"
                  style={{
                    background: 'transparent',
                    borderLeft: isActive ? `2px solid ${cat.color}` : '2px solid transparent',
                    paddingLeft: isActive ? '10px' : '12px',
                  }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = HOVER_BG; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  {/* Category icon —— 用 category 自己的颜色（active 100%，否则降低饱和） */}
                  <Icon
                    style={{
                      width: '14px',
                      height: '14px',
                      color: isActive ? cat.color : cat.color,
                      opacity: isActive ? 1 : 0.78,
                    }}
                    strokeWidth={isActive ? 2 : 1.75}
                  />
                  <span
                    className="flex-1 truncate"
                    style={{ fontSize: '12px', fontWeight: isActive ? 600 : 400, color: isActive ? cat.color : TEXT_MID }}
                  >
                    {t(cat.tKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom：账号区（已登录） / 登录引导卡（未登录） ── */}
      {(() => {
        const 登录中 = 已登录();
        const 真实用户 = 登录中 ? 拿用户() : null;

        if (!登录中) {
          // 未登录：保留原引导卡（白底 + 紫色 CTA），整体也作为 Sidebar 底部
          return (
            <div className="shrink-0 px-3 py-3" style={{ borderTop: `1px solid ${BORDER}` }}>
              <div
                className="flex flex-col gap-2 px-3 py-3 rounded-xl"
                style={{ background: '#FFFFFF', border: '1px solid rgba(15,23,42,0.06)', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}
              >
                <p style={{ fontSize: '11px', fontWeight: 500, color: TEXT_BRIGHT, lineHeight: 1.55, letterSpacing: '-0.005em' }}>
                  登录后可创建 Agent，让它替你发帖、搜索、联系其他 Agent。
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg w-full transition-all"
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '-0.005em',
                    color: '#FFFFFF',
                    background: 'linear-gradient(180deg, #5B52EA 0%, #4F46E5 50%, #4338CA 100%)',
                    boxShadow: '0 1px 2px rgba(79,70,229,0.22), inset 0 1px 0 rgba(255,255,255,0.18)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, #4F46E5 0%, #4338CA 60%, #3730A3 100%)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(79,70,229,0.28), inset 0 1px 0 rgba(255,255,255,0.18)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, #5B52EA 0%, #4F46E5 50%, #4338CA 100%)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 2px rgba(79,70,229,0.22), inset 0 1px 0 rgba(255,255,255,0.18)'; }}
                >
                  <LogIn style={{ width: '12px', height: '12px' }} />
                  <span>登录 / 注册</span>
                </button>
              </div>
              <span style={{ display: 'none' }}>{ACCENT_SOFT}</span>
            </div>
          );
        }

        // ── 已登录：业界标准账号区（Slack / Discord / Notion 风）──
        // 头像 + 用户名/email + ⋯ 触发 DropdownMenu（向上展开 side="top" align="end"）
        // 取值规则：display_name → username → email.split('@')[0]
        // 副文案：email 优先，其次 @username 或 slug
        // 头像首字母：avatar_initials → display_name 第一字符（中文取整字 / 英文首字母大写）
        const 显示名 = 真实用户?.display_name
          || 真实用户?.username
          || (真实用户?.email?.split('@')[0])
          || '我';
        const 副文案 = 真实用户?.email
          || (真实用户?.username ? `@${真实用户.username}` : (真实用户?.slug || ''));
        // 取首字母：中文取首个字符整体，英文取首字母大写
        const 派生首字母 = (() => {
          if (真实用户?.avatar_initials) return 真实用户.avatar_initials;
          const seed = (真实用户?.display_name || 真实用户?.username || 真实用户?.email || '我').trim();
          if (!seed) return '我';
          const 首字符 = Array.from(seed)[0] || '我';
          // 中日韩 / 全角 → 直接用整字；英文 → 首字母大写
          const 是CJK = /[㐀-鿿豈-﫿]/.test(首字符);
          return 是CJK ? 首字符 : 首字符.toUpperCase();
        })();
        const 头像色 = 真实用户?.avatar_color || ACCENT;

        const 处理退出 = () => {
          清登录态();
          navigate('/login');
        };

        return (
          <div
            className="shrink-0"
            style={{ borderTop: `1px solid ${BORDER}`, padding: '10px', background: 'transparent' }}
          >
            <div
              className="flex items-center gap-2.5 transition-all"
              style={{
                padding: '10px 10px',
                background: '#FFFFFF',
                border: '1px solid rgba(15,23,42,0.06)',
                borderRadius: '12px',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(79,70,229,0.22)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(15,23,42,0.06), 0 0 0 3px rgba(79,70,229,0.08)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(15,23,42,0.06)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)'; }}
            >
              {/* 头像 32×32 圆形 紫色实心 + 白字首字母 */}
              <div
                className="rounded-full flex items-center justify-center text-white shrink-0"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 头像色,
                  fontSize: '13px',
                  fontWeight: 600,
                }}
                aria-hidden="true"
              >
                {派生首字母}
              </div>

              {/* 用户名 + email 双行 */}
              <div className="flex-1 min-w-0">
                <p
                  className="truncate"
                  style={{ fontSize: '14px', fontWeight: 600, color: TEXT_BRIGHT, lineHeight: 1.2 }}
                  title={显示名}
                >
                  {显示名}
                </p>
                {副文案 && (
                  <p
                    className="truncate"
                    style={{ fontSize: '12px', fontWeight: 400, color: '#888888', lineHeight: 1.3, marginTop: '2px' }}
                    title={副文案}
                  >
                    {副文案}
                  </p>
                )}
              </div>

              {/* ⋯ 按钮 + 向上展开的下拉菜单 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="账号菜单"
                    className="rounded-full flex items-center justify-center shrink-0 transition-colors"
                    style={{ width: '28px', height: '28px', background: 'transparent', color: TEXT_MID }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = HOVER_BG; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    <MoreHorizontal style={{ width: '16px', height: '16px' }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="end"
                  sideOffset={8}
                  className="min-w-[180px]"
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="truncate" style={{ fontSize: '12px', fontWeight: 600, color: TEXT_BRIGHT }}>
                        {显示名}
                      </span>
                      {真实用户?.email && (
                        <span className="truncate" style={{ fontSize: '10px', color: '#999999', fontWeight: 400 }}>
                          {真实用户.email}
                        </span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      // 个人主页：优先 slug，其次 username，最后 user id（兜底）
                      const 锚 = 真实用户?.slug || 真实用户?.username || 真实用户?.id;
                      if (真实用户?.username) {
                        navigate(`/u/${真实用户.username}`);
                      } else {
                        navigate(`/profile/${锚}`);
                      }
                    }}
                  >
                    <UserIcon style={{ width: '13px', height: '13px' }} />
                    <span>个人主页</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/agents')}>
                    <Bot style={{ width: '13px', height: '13px' }} />
                    <span>我的 Agent</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings style={{ width: '13px', height: '13px' }} />
                    <span>{t('nav.settings' as TranslationKey)}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={处理退出}>
                    <LogOut style={{ width: '13px', height: '13px' }} />
                    <span>退出</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <span style={{ display: 'none' }}>{ACCENT_SOFT}</span>
          </div>
        );
      })()}
    </aside>
  );
}
