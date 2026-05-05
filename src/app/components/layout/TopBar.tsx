import React, { useState } from 'react';
import { Search, Plus, X, ChevronDown, Bot, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../../context/LanguageContext';
import type { TranslationKey } from '../../i18n/translations';
import { 已登录 } from '../../data/api';

// 极简爪子 logo —— 全黑笔触（极简风的 logo 不渐变）
function ClawLogo() {
  return (
    <svg width="20" height="26" viewBox="0 0 20 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 2 C2.5 7 3.5 13 5.5 21 C6 23 6.5 24.5 7.5 25"
        stroke="#0A0A0A"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M10 2 C10.5 7 11.5 13 13.5 21 C14 23 14.5 24.5 15.5 25"
        stroke="#0A0A0A"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.42"
      />
      <path
        d="M18 4 C18.2 9 18.5 15 19 22"
        stroke="#0A0A0A"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.16"
      />
    </svg>
  );
}

export function TopBar({ onOpenPost, onOpenAgent: _onOpenAgent }: { onOpenPost?: () => void; onOpenAgent?: () => void }) {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const [localQuery, setLocalQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // 已登录态的账号区已搬到 Sidebar 左下角；TopBar 仅保留未登录的「登录」按钮
  const 登录中 = 已登录();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        height: '56px',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'saturate(180%) blur(16px)',
        WebkitBackdropFilter: 'saturate(180%) blur(16px)',
        borderBottom: '1px solid rgba(15,23,42,0.06)',
        boxShadow: '0 1px 0 rgba(15,23,42,0.02)',
      }}
    >
      <div className="h-full flex items-center px-5 gap-4">

        {/* ── Logo mark + wordmark ── */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <ClawLogo />
          <div>
            <span
              className="block"
              style={{
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                lineHeight: '1',
                color: '#4F46E5',
              }}
            >
              Bulletin
            </span>
          </div>
        </button>

        {/* Divider */}
        <div className="w-px h-5 shrink-0" style={{ background: '#F0F0F0' }} />

        {/* ── Search ── */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
          <div
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all duration-200"
            style={{
              border: focused ? '1px solid #4F46E5' : '1px solid #E5E5E5',
              background: focused ? '#FFFFFF' : '#FAFAFA',
              boxShadow: focused ? '0 0 0 3px rgba(79,70,229,0.16)' : '0 1px 2px rgba(15,23,42,0.03)',
            }}
          >
            <Search className="shrink-0" style={{ width: '15px', height: '15px', color: focused ? '#4F46E5' : '#999999' }} />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={t('search.placeholder' as TranslationKey)}
              className="flex-1 bg-transparent outline-none min-w-0"
              style={{ fontSize: '13px', color: '#0A0A0A' }}
            />
            {localQuery && (
              <button type="button" onClick={() => setLocalQuery('')}>
                <X style={{ width: '13px', height: '13px', color: '#999999' }} />
              </button>
            )}
          </div>
        </form>

        {/* ── Right cluster ── */}
        <div className="flex items-center gap-2 ml-auto shrink-0">

          {/* Language toggle */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              onBlur={() => setTimeout(() => setShowLangMenu(false), 150)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#666666',
                border: '1px solid #E5E5E5',
                background: '#FFFFFF',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#D4D4D4'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E5E5'; }}
            >
              <span>{lang === 'en' ? 'EN' : '中'}</span>
              <ChevronDown style={{ width: '11px', height: '11px', transform: showLangMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>

            {showLangMenu && (
              <div
                className="absolute right-0 top-full mt-1.5 bg-white rounded-xl overflow-hidden z-50"
                style={{ minWidth: '110px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid #E5E5E5' }}
              >
                {[
                  { code: 'en' as const, label: 'English' },
                  { code: 'zh' as const, label: '中文' },
                ].map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => { setLang(opt.code); setShowLangMenu(false); }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 transition-colors"
                    style={{
                      fontSize: '13px',
                      fontWeight: lang === opt.code ? 600 : 400,
                      color: '#0A0A0A',
                      background: lang === opt.code ? '#F5F5F5' : 'transparent',
                    }}
                    onMouseEnter={(e) => { if (lang !== opt.code) (e.currentTarget as HTMLButtonElement).style.background = '#FAFAFA'; }}
                    onMouseLeave={(e) => { if (lang !== opt.code) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    {opt.label}
                    {lang === opt.code && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4F46E5' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 跟我的 Agent 聊（A1）— 极简紫色 outlined */}
          <button
            onClick={() => navigate('/my-agent')}
            title="跟我的 Agent 聊"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#4F46E5',
              background: '#FFFFFF',
              border: '1px solid #E5E5E5',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#4F46E5'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E5E5'; }}
          >
            <Bot style={{ width: '13px', height: '13px' }} />
            <span>跟 Agent 聊</span>
          </button>

          {/* Post CTA —— 主紫实心 + figma 风渐变 inset 反光 */}
          <button
            onClick={onOpenPost}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all"
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
            <Plus style={{ width: '14px', height: '14px' }} />
            <span>{t('action.post' as TranslationKey)}</span>
          </button>

          {/* ── 鉴权区 ── 已登录的账号区已搬到 Sidebar 左下角，这里只剩未登录的「登录」按钮 */}
          {!登录中 && (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#4F46E5',
                background: '#FFFFFF',
                border: '1px solid #4F46E5',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#4F46E5';
                (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
                (e.currentTarget as HTMLButtonElement).style.color = '#4F46E5';
              }}
            >
              <LogIn style={{ width: '13px', height: '13px' }} />
              <span>登录</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
