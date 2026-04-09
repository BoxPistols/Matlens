import { useState, useCallback } from 'react';

export function useTheme(): { theme: string; setTheme: (t: string) => void } {
  const [theme, setThemeState] = useState<string>('light');
  const setTheme = useCallback((t: string) => {
    setThemeState(t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);
  return { theme, setTheme };
}
