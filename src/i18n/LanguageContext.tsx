import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, type Lang } from './translations';

interface LanguageState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageState | null>(null);

const getInitialLang = (): Lang => {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null;
  if (stored === 'en' || stored === 'fr' || stored === 'de') return stored;
  return 'en';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const t = useCallback((key: string) => translations[lang][key] ?? translations.en[key] ?? key, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
};