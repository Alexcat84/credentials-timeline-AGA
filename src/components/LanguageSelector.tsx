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
      className={`inline-flex items-center rounded-xl border border-stroke bg-surface-elevated p-0.5 shadow-soft ${className}`}
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
                ? 'bg-gradient-to-r from-accent-cyan to-accent-teal text-bg0 shadow'
                : 'text-ink-secondary hover:text-accent-cyan hover:bg-white/5'
            }`}
          >
            {l.code}
          </button>
        );
      })}
    </div>
  );
}
