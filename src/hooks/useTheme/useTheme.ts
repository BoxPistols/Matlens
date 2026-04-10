import { useState, useCallback, useEffect } from 'react';

// localStorage key used to persist the user's theme selection across
// sessions. Kept in a constant so tests and migrations can reference it.
const STORAGE_KEY = 'matlens:theme';
const VALID_THEMES = ['light', 'dark', 'eng', 'cae'] as const;
type ValidTheme = (typeof VALID_THEMES)[number];

function isValidTheme(t: string | null): t is ValidTheme {
  return !!t && (VALID_THEMES as readonly string[]).includes(t);
}

function loadInitialTheme(): string {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isValidTheme(stored)) return stored;
  } catch {
    /* localStorage may be disabled (private mode, quota full, etc.) */
  }
  // Fall back to the OS preference so first-time visitors get a sensible
  // default instead of always being dropped into light mode.
  if (typeof window.matchMedia === 'function') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  }
  return 'light';
}

export function useTheme(): { theme: string; setTheme: (t: string) => void } {
  const [theme, setThemeState] = useState<string>(loadInitialTheme);

  // Keep <html data-theme="..."> and localStorage in sync with state. Running
  // this as a layout-agnostic effect (rather than inside setTheme) means the
  // attribute is applied on initial mount too, including when the user
  // restored from localStorage or prefers-color-scheme.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore quota / disabled storage */
    }
  }, [theme]);

  // Sync across browser tabs — if the user changes the theme in another
  // tab the storage event lets us mirror that here without waiting for a
  // reload.
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      if (isValidTheme(e.newValue)) setThemeState(e.newValue);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const setTheme = useCallback((t: string) => {
    setThemeState(t);
  }, []);

  return { theme, setTheme };
}
