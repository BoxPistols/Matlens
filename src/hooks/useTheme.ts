import { useState, useCallback } from 'react';

export function useTheme() {
  const [theme, setThemeState] = useState('light');
  const setTheme = useCallback((t) => {
    setThemeState(t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);
  return { theme, setTheme };
}
