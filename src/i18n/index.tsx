import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';

export type Lang = 'es' | 'en' | 'fr';

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

const LOCALES: Record<Lang, Record<string, unknown>> = { en, es, fr };
const STORAGE_KEY = 'timeline-lang';

/** Detect preferred language among the supported ones; default English (content base language). */
function detectLang(): Lang {
  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === 'es' || saved === 'en' || saved === 'fr') return saved;
    const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2).toLowerCase() : 'en';
    if (nav === 'es' || nav === 'fr') return nav;
  } catch {
    // ignore
  }
  return 'en';
}

/** Traverse a dotted path (e.g. "nav.timeline") on a nested object. */
function resolve(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc != null && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in params ? String(params[k]) : `{{${k}}}`));
}

/** French treats 0 and 1 as singular; English/Spanish treat only 1 as singular. */
function plural(lang: Lang, count: number): 'one' | 'other' {
  if (lang === 'fr') return count <= 1 ? 'one' : 'other';
  return count === 1 ? 'one' : 'other';
}

export type TranslateFn = (path: string, params?: Record<string, string | number>) => string;

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TranslateFn;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);

  const t = useCallback<TranslateFn>(
    (path, params) => {
      let value = resolve(LOCALES[lang], path);
      if (value === undefined && lang !== 'en') value = resolve(en, path);
      // Pluralization: value is { one, other } and a count param is present
      if (value != null && typeof value === 'object' && params && 'count' in params) {
        const form = plural(lang, Number(params.count));
        value = (value as Record<string, unknown>)[form] ?? (value as Record<string, unknown>).other;
      }
      if (typeof value !== 'string') return path;
      return interpolate(value, params);
    },
    [lang]
  );

  const contextValue = useMemo<I18nContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}

/**
 * Localized label for data keyed by id (categories, milestones).
 * Falls back to the original label from the JSON data when no translation exists.
 */
export function useDataLabel() {
  const { t } = useI18n();
  return useCallback(
    (kind: 'categories' | 'milestones', id: string, fallback: string): string => {
      const key = `data.${kind}.${id}`;
      const translated = t(key);
      return translated === key ? fallback : translated;
    },
    [t]
  );
}
