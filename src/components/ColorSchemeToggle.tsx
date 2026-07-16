import { useColorScheme } from '../theme/color-scheme';
import { useI18n } from '../i18n';

type ColorSchemeToggleProps = {
  className?: string;
  /** Show a text label next to the icon (used in the mobile drawer). */
  withLabel?: boolean;
};

/** Sun / moon toggle for light and dark mode. */
export default function ColorSchemeToggle({ className = '', withLabel = false }: ColorSchemeToggleProps) {
  const { scheme, toggle } = useColorScheme();
  const { t } = useI18n();
  const isDark = scheme === 'dark';
  const label = isDark ? t('common.lightMode') : t('common.darkMode');

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`flex items-center gap-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-200 shadow-sm hover:text-cyan-700 dark:hover:text-cyan-300 hover:border-cyan-300 dark:hover:border-cyan-500 transition-colors ${withLabel ? 'px-4 py-2.5 w-full justify-start text-sm font-medium' : 'w-10 justify-center'} ${className}`}
    >
      {isDark ? (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      {withLabel && <span>{label}</span>}
    </button>
  );
}
