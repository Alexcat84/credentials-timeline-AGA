import { useEffect } from 'react';

type QuickStartPanelProps = {
  open: boolean;
  onClose: () => void;
};

const QUICK_START_CONTENT = [
  {
    title: 'Presentation style',
    body: 'Choose **Formal presentation** for a clean, professional look, or **Fun mode** for a Dragon Ball–themed experience. You can switch anytime using **Change presentation mode** in the top bar.',
    visual: 'presentation',
  },
  {
    title: 'Timeline',
    body: 'The timeline shows key years and the credentials between them. **Click a circle** (year) to open a credential. **Click a segment label** (e.g. "8 credentials") to explore all credentials in that period. Use the **Prev** and **Next** buttons to move along the timeline.',
    visual: 'timeline',
  },
  {
    title: 'Filter by category',
    body: 'Open **Filter by category** to browse credentials by topic or location. Select a category or location from the dropdowns, then **click a card** to expand it. Use **View diploma** to see the full credential.',
    visual: 'filter',
  },
];

function MiniVisual({ type }: { type: string }) {
  if (type === 'presentation') {
    return (
      <div className="flex gap-2 mt-2 p-2 rounded-lg bg-slate-100/80 border border-slate-200/80" aria-hidden>
        <div className="flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-slate-700 border border-slate-600">
          <div className="w-4 h-4 rounded-full bg-cyan-400/60 mb-1.5" />
          <span className="text-[10px] font-medium text-slate-300">Formal</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-amber-900/40 border border-amber-600/50">
          <div className="w-4 h-4 rounded-full bg-amber-400/80 mb-1.5" />
          <span className="text-[10px] font-medium text-amber-200/90">Fun</span>
        </div>
      </div>
    );
  }
  if (type === 'timeline') {
    return (
      <div className="mt-2 p-2 rounded-lg bg-slate-100/80 border border-slate-200/80" aria-hidden>
        <svg viewBox="0 0 140 36" className="w-full h-9 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2">
          <path d="M 8 18 H 35 M 35 18 Q 52 8 70 18 Q 88 28 105 18 H 132" />
          <circle cx="8" cy="18" r="5" fill="rgb(30 58 138)" stroke="rgb(148 163 184)" />
          <circle cx="35" cy="18" r="5" fill="rgb(30 58 138)" stroke="rgb(148 163 184)" />
          <rect x="48" y="12" width="44" height="12" rx="4" fill="rgb(51 65 85)" stroke="rgb(148 163 184)" />
          <circle cx="105" cy="18" r="5" fill="rgb(30 58 138)" stroke="rgb(148 163 184)" />
          <circle cx="132" cy="18" r="5" fill="rgb(30 58 138)" stroke="rgb(148 163 184)" />
        </svg>
        <p className="text-[10px] text-slate-500 mt-1 text-center">Years · segments</p>
      </div>
    );
  }
  if (type === 'filter') {
    return (
      <div className="mt-2 p-2 rounded-lg bg-slate-100/80 border border-slate-200/80" aria-hidden>
        <div className="h-5 rounded border border-cyan-300 bg-white mb-2 flex items-center px-2">
          <span className="text-[10px] text-slate-500">Category ▼</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-6 rounded bg-cyan-100 border border-cyan-200/80 flex items-center justify-center">
              <span className="text-[8px] text-cyan-800 font-medium">{i}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 mt-1 text-center">Cards by category</p>
      </div>
    );
  }
  return null;
}

function QuickStartPanel({ open, onClose }: QuickStartPanelProps) {
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
        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden border-l border-slate-200"
        role="dialog"
        aria-labelledby="quick-start-title"
        aria-modal="true"
      >
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-teal-50">
          <h2 id="quick-start-title" className="text-lg font-semibold text-slate-800">
            Quick Start
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200/80 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {QUICK_START_CONTENT.map((section) => (
            <section key={section.title}>
              <h3 className="text-sm font-semibold text-cyan-700 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {(section.body ?? '').split('**').reduce<React.ReactNode[]>((acc, part, i) => {
                  if (i % 2 === 1) {
                    acc.push(<strong key={i}>{part}</strong>);
                  } else {
                    acc.push(part);
                  }
                  return acc;
                }, [])}
              </p>
              {'visual' in section && section.visual && (
                <MiniVisual type={section.visual} />
              )}
            </section>
          ))}
          <section className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-slate-600 text-xs leading-relaxed">
              All information and the design of this platform are my property. Any use of this content or design outside this platform requires my prior authorization and consent.
            </p>
            <p className="text-slate-700 text-sm font-medium mt-3">
              Thank you for viewing my professional profile.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

export default QuickStartPanel;
