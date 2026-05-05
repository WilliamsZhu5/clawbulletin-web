import React, { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations';
import type { Lang, TranslationKey } from '../i18n/translations';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // 默认中文（Phase-1 硬中文化；后续若需切换由 TopBar 触发）
  const [lang, setLang] = useState<Lang>('zh');

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[lang];
    let value: string = (dict as Record<string, string>)[key] ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{{${k}}}`, String(v));
      });
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
