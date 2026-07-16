import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ColorScheme = 'light' | 'dark';

const STORAGE_KEY = 'timeline-color-scheme';

function detectScheme(): ColorScheme {
  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === 'light' || saved === 'dark') return saved;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // ignore
  }
  return 'light';
}

type ColorSchemeContextValue = {
  scheme: ColorScheme;
  toggle: () => void;
  setScheme: (scheme: ColorScheme) => void;
};

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setSchemeState] = useState<ColorScheme>(detectScheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', scheme === 'dark');
    root.style.colorScheme = scheme;
    try {
      localStorage.setItem(STORAGE_KEY, scheme);
    } catch {
      // ignore
    }
  }, [scheme]);

  const setScheme = useCallback((next: ColorScheme) => setSchemeState(next), []);
  const toggle = useCallback(() => setSchemeState((s) => (s === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo(() => ({ scheme, toggle, setScheme }), [scheme, toggle, setScheme]);

  return <ColorSchemeContext.Provider value={value}>{children}</ColorSchemeContext.Provider>;
}

export function useColorScheme(): ColorSchemeContextValue {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) throw new Error('useColorScheme must be used within a ColorSchemeProvider');
  return ctx;
}
