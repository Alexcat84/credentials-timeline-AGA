import { useEffect } from 'react';
import { useI18n } from '../i18n';

type QuickStartPanelProps = {
  open: boolean;
  onClose: () => void;
};

const SECTION_VISUALS = ['presentation', 'timeline', 'filter', 'experience'] as const;

function MiniVisual({ type }: { type: string }) {
  const { t } = useI18n();
  if (type === 'presentation') {
    return (
      <div className="flex gap-2 mt-2 p-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700" aria-hidden>
        <div className="flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-slate-700 border border-slate-600">
          <div className="w-4 h-4 rounded-full bg-cyan-400/60 mb-1.5" />
          <span className="text-[10px] font-medium text-slate-300">{t('quickStart.labels.formal')}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-amber-900/40 border border-amber-600/50">
          <div className="w-4 h-4 rounded-full bg-amber-400/80 mb-1.5" />
          <span className="text-[10px] font-medium text-amber-200/90">{t('quickStart.labels.fun')}</span>
        </div>
      </div>
    );
  }
  if (type === 'timeline') {
    return (
      <div className="mt-2 p-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700" aria-hidden>
        <svg viewBox="0 0 140 36" className="w-full h-9 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2">
          <path d="M 8 18 H 35 M 35 18 Q 52 8 70 18 Q 88 28 105 18 H 132" />
          <circle cx="8" cy="18" r="5" fill="rgb(30 58 138)" stroke="rgb(148 163 184)" />
          <circle cx="35" cy="18" r="5" fill="rgb(30 58 138)" stroke="rgb(148 163 184)" />
          <rect x="48" y="12" width="44" height="12" rx="4" fill="rgb(51 65 85)" stroke="rgb(148 163 184)" />
          <circle cx="105" cy="18" r="5" fill="rgb(30 58 138)" stroke="rgb(148 163 184)" />
          <circle cx="132" cy="18" r="5" fill="rgb(30 58 138)" stroke="rgb(148 163 184)" />
        </svg>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 text-center">{t('quickStart.labels.years')}</p>
      </div>
    );
  }
  if (type === 'filter') {
    return (
      <div className="mt-2 p-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700" aria-hidden>
        <div className="h-5 rounded border border-cyan-300 bg-white dark:bg-slate-700 mb-2 flex items-center px-2">
          <span className="text-[10px] text-slate-500 dark:text-slate-300">{t('filter.category')} ▼</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-6 rounded bg-cyan-100 dark:bg-cyan-900/40 border border-cyan-200/80 dark:border-cyan-700/50 flex items-center justify-center">
              <span className="text-[8px] text-cyan-800 dark:text-cyan-200 font-medium">{i}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 text-center">{t('quickStart.labels.diplomas')}</p>
      </div>
    );
  }
  if (type === 'experience') {
    return (
      <div className="mt-2 p-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700" aria-hidden>
        <div className="flex gap-2">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <div className="w-0.5 flex-1 min-h-[12px] bg-cyan-300/60" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="h-4 rounded bg-white dark:bg-slate-700 border border-cyan-200/80 dark:border-slate-600" />
            <div className="h-3 rounded bg-cyan-50 dark:bg-slate-700/60 border border-cyan-200/60 dark:border-slate-600 w-3/4" />
          </div>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 text-center">{t('quickStart.labels.positions')}</p>
      </div>
    );
  }
  return null;
}

function renderBold(body: string): React.ReactNode[] {
  return body.split('**').reduce<React.ReactNode[]>((acc, part, i) => {
    acc.push(i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
    return acc;
  }, []);
}

function QuickStartPanel({ open, onClose }: QuickStartPanelProps) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col overflow-hidden border-l border-slate-200 dark:border-slate-700"
        role="dialog"
        aria-labelledby="quick-start-title"
        aria-modal="true"
      >
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-slate-800 dark:to-slate-800">
          <h2 id="quick-start-title" className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {t('quickStart.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-colors"
            aria-label={t('common.close')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {SECTION_VISUALS.map((visual, i) => (
            <section key={visual}>
              <h3 className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider mb-2">
                {t(`quickStart.sections.${i}.title`)}
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {renderBold(t(`quickStart.sections.${i}.body`))}
              </p>
              <MiniVisual type={visual} />
            </section>
          ))}
          <section className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              {t('quickStart.footerRights')}
            </p>
            <p className="text-slate-700 dark:text-slate-200 text-sm font-medium mt-3">
              {t('quickStart.footerThanks')}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

export default QuickStartPanel;
