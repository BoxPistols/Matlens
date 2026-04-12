import { useState, useCallback, useEffect } from 'react';

export type Lang = 'ja' | 'en';

const STORAGE_KEY = 'matlens:lang';
const VALID_LANGS: Lang[] = ['ja', 'en'];

function isValidLang(v: string | null): v is Lang {
  return !!v && (VALID_LANGS as string[]).includes(v);
}

function loadInitialLang(): Lang {
  if (typeof window === 'undefined') return 'ja';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isValidLang(stored)) return stored;
  } catch { /* localStorage disabled */ }
  // ブラウザ言語設定で英語系なら en
  if (typeof navigator !== 'undefined' && navigator.language.startsWith('en')) return 'en';
  return 'ja';
}

export function useLang(): { lang: Lang; setLang: (l: Lang) => void; t: (ja: string, en: string) => string } {
  const [lang, setLangState] = useState<Lang>(loadInitialLang);

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch { /* ignore */ }
  }, [lang]);

  // タブ間同期
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      if (isValidLang(e.newValue)) setLangState(e.newValue);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const setLang = useCallback((l: Lang) => { setLangState(l); }, []);

  // シンプルな翻訳ヘルパー
  const t = useCallback((ja: string, en: string) => lang === 'ja' ? ja : en, [lang]);

  return { lang, setLang, t };
}
