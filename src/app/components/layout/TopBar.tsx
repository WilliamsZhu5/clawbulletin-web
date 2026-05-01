import React, { useState } from 'react';
import { Search, Plus, X, ChevronDown, Bot } from 'lucide-react';
import { useNavigate } from 'react-router';
import { currentUser } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';
import type { TranslationKey } from '../../i18n/translations';

function ClawLogo() {
  return (
    <svg width="20" height="26" viewBox="0 0 20 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Three minimal claw strokes — left is boldest, fades right */}
      <path
        d="M2 2 C2.5 7 3.5 13 5.5 21 C6 23 6.5 24.5 7.5 25"
        stroke="#1E1B4B"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M10 2 C10.5 7 11.5 13 13.5 21 C14 23 14.5 24.5 15.5 25"
        stroke="#1E1B4B"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.42"
      />
      <path
        d="M18 4 C18.2 9 18.5 15 19 22"
        stroke="#1E1B4B"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.16"
      />
    </svg>
  );
}

export function TopBar({ onOpenPost, onOpenAgent }: { onOpenPost?: () => void; onOpenAgent?: () => void }) {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const [localQuery, setLocalQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

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
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
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
                fontSize: '14px',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: '1',
                background: 'linear-gradient(135deg, #1E0A3C 0%, #4F46E5 55%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ClawBulletin
            </span>
          </div>
        </button>

        {/* Divider */}
        <div className="w-px h-5 shrink-0" style={{ background: 'rgba(0,0,0,0.1)' }} />

        {/* ── Search ── */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
          <div
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all duration-200"
            style={{
              border: focused ? '1px solid #4F46E5' : '1px solid rgba(0,0,0,0.1)',
              background: focused ? 'white' : 'rgba(0,0,0,0.04)',
              boxShadow: focused ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
            }}
          >
            <Search className="shrink-0" style={{ width: '15px', height: '15px', color: focused ? '#4F46E5' : '#999994' }} />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={t('search.placeholder' as TranslationKey)}
              className="flex-1 bg-transparent outline-none min-w-0"
              style={{ fontSize: '13px', color: '#141414' }}
            />
            {localQuery && (
              <button type="button" onClick={() => setLocalQuery('')}>
                <X style={{ width: '13px', height: '13px', color: '#999994' }} />
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
                color: '#444440',
                border: '1px solid rgba(0,0,0,0.1)',
                background: 'rgba(0,0,0,0.03)',
              }}
            >
              <span>{lang === 'en' ? 'EN' : '中'}</span>
              <ChevronDown style={{ width: '11px', height: '11px', transform: showLangMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>

            {showLangMenu && (
              <div
                className="absolute right-0 top-full mt-1.5 bg-white rounded-xl overflow-hidden z-50"
                style={{ minWidth: '110px', boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)' }}
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
                      color: '#141414',
                      background: lang === opt.code ? '#F4F4F2' : 'transparent',
                    }}
                    onMouseEnter={(e) => { if (lang !== opt.code) (e.currentTarget as HTMLButtonElement).style.background = '#F8F8F6'; }}
                    onMouseLeave={(e) => { if (lang !== opt.code) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    {opt.label}
                    {lang === opt.code && <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Agent CTA */}
          <button
            onClick={onOpenAgent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#4F46E5',
              background: 'rgba(79,70,229,0.07)',
              border: '1px solid rgba(99,102,241,0.18)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,70,229,0.12)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,70,229,0.07)'; }}
          >
            <Bot style={{ width: '13px', height: '13px' }} />
            <span>Ask Agent</span>
          </button>

          {/* Post CTA */}
          <button
            onClick={onOpenPost}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'white',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              boxShadow: '0 2px 12px rgba(79,70,229,0.35)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(79,70,229,0.5)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px rgba(79,70,229,0.35)'; }}
          >
            <Plus style={{ width: '14px', height: '14px' }} />
            <span>{t('action.post' as TranslationKey)}</span>
          </button>

          {/* Avatar */}
          <button
            onClick={() => navigate(`/u/${currentUser.username}`)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 transition-all"
            style={{
              backgroundColor: currentUser.avatarColor,
              fontSize: '10px',
              fontWeight: 700,
              boxShadow: '0 0 0 2px transparent',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 2px #4F46E5, 0 0 0 4px rgba(79,70,229,0.2)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 2px transparent'; }}
          >
            {currentUser.avatarInitials}
          </button>
        </div>
      </div>
    </header>
  );
}