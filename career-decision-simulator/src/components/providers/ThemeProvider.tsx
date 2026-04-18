'use client';

/**
 * ThemeProvider — global theme state (dark | light | luxury)
 * Applies a data-theme attribute to <html> and persists to localStorage.
 * CSS in globals.css drives the actual visual changes per theme.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'dark' | 'light' | 'luxury';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
});

const STORAGE_KEY = 'pathfinder_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Hydrate from localStorage on first render
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored && ['dark', 'light', 'luxury'].includes(stored)) {
        setThemeState(stored);
        document.documentElement.setAttribute('data-theme', stored);
      }
    } catch { /* ignore SSR */ }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
      document.documentElement.setAttribute('data-theme', t);
    } catch { /* ignore */ }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
