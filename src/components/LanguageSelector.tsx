import { LANGS, useI18n } from '../i18n';

type LanguageSelectorProps = {
  /** Extra classes for the wrapper (e.g. full-width on mobile). */
  className?: string;
};

/** Segmented ES / EN / FR control. Compact and always visible so the language is easy to switch. */
export default function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={`inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 p-0.5 shadow-sm ${className}`}
    >
      {LANGS.map((l) => {
        const active = l.code === lang;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={active}
            title={l.label}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors min-w-[36px] ${
              active
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow'
                : 'text-slate-500 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50/70 dark:hover:bg-slate-700/70'
            }`}
          >
            {l.code}
          </button>
        );
      })}
    </div>
  );
}
