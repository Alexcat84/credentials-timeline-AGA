import { useState, useEffect, useMemo } from 'react';
import LandingView from './views/LandingView';
import ThemeChoiceView from './views/ThemeChoiceView';
import type { LandingTheme } from './views/ThemeChoiceView';
import MainView from './views/MainView';
import SegmentView from './views/SegmentView';
import DetailView from './views/DetailView';
import FilterView from './views/FilterView';
import ExperienceView from './views/ExperienceView';
import KamehamehaCursor from './components/KamehamehaCursor';
import QuickStartPanel from './components/QuickStartPanel';
import ContactFloating from './components/ContactFloating';
import LanguageSelector from './components/LanguageSelector';
import ColorSchemeToggle from './components/ColorSchemeToggle';
import type { CredentialsData, CategoriesData, MilestonesData, ExperienceData, Segment, Credential, Milestone, Profile } from './types';
import { trackPageView } from './analytics';
import { useI18n } from './i18n';

const CREDENTIALS_URL = '/data/credentials.json';
const CATEGORIES_URL = '/data/categories.json';
const MILESTONES_URL = '/data/milestones.json';
const THEME_STORAGE_KEY = 'timeline-landing-theme';

/** Per-language overlay: only translatable text fields, keyed by credential id. Merged over the English base. */
type CredentialOverlay = {
  profile?: Partial<Pick<Profile, 'title'>>;
  credentials?: Record<string, Partial<Credential>>;
};

/** Merge translated text fields over the base credentials (same ids, images/years/categories untouched). */
function mergeCredentials(base: CredentialsData | null, overlay: CredentialOverlay | null): CredentialsData | null {
  if (!base) return null;
  if (!overlay) return base;
  const credOverlay = overlay.credentials ?? {};
  return {
    profile: { ...base.profile, ...(overlay.profile ?? {}) },
    credentials: base.credentials.map((c) => {
      const o = credOverlay[c.id];
      return o ? { ...c, ...o } : c;
    }),
  };
}

function loadTheme(): LandingTheme | null {
  try {
    const storage = typeof sessionStorage !== 'undefined' ? sessionStorage : null;
    const s = storage?.getItem(THEME_STORAGE_KEY) ?? null;
    if (s === 'formal' || s === 'dragonball') return s;
    return null;
  } catch {
    return null;
  }
}

type View = 'timeline' | 'filter' | 'experience';

type TimelineStackItem =
  | { view: 'main' }
  | { view: 'segment'; segment: Segment; initialPage?: number }
  | { view: 'detail'; credential: Credential };

function App() {
  const { t, lang } = useI18n();
  const [theme, setTheme] = useState<LandingTheme | null>(loadTheme);
  const [hasEntered, setHasEntered] = useState(false);
  const [view, setView] = useState<View>('timeline');
  const [baseCredentials, setBaseCredentials] = useState<CredentialsData | null>(null);
  const [credentialOverlay, setCredentialOverlay] = useState<CredentialOverlay | null>(null);
  const [categoriesData, setCategoriesData] = useState<CategoriesData | null>(null);
  const [milestonesData, setMilestonesData] = useState<MilestonesData | null>(null);
  const [experienceData, setExperienceData] = useState<ExperienceData | null>(null);
  const [timelineStack, setTimelineStack] = useState<TimelineStackItem[]>([{ view: 'main' }]);
  /** When opening detail from Diplomas by category, back returns to filter instead of timeline stack. */
  const [returnToView, setReturnToView] = useState<View | null>(null);
  /** Diplomas by category: state lifted so it persists when navigating to detail and back. Same filter for both presentation modes (formal and dragonball). */
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  const [filterLocationId, setFilterLocationId] = useState<string>('');
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const closeMobileNav = () => setMobileNavOpen(false);

  useEffect(() => {
    Promise.all([
      fetch(CREDENTIALS_URL).then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load credentials')))),
      fetch(CATEGORIES_URL).then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load categories')))),
      fetch(MILESTONES_URL).then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load milestones')))),
    ])
      .then(([creds, cats, milestones]) => {
        setBaseCredentials(creds);
        setCategoriesData(cats);
        setMilestonesData(milestones);
      })
      .catch((e) => setError(e?.message ?? 'Error loading data'))
      .finally(() => setLoading(false));
  }, []);

  /** Credential text is translated per language via an overlay merged over the English base (images stay original). */
  useEffect(() => {
    if (lang === 'en') {
      setCredentialOverlay(null);
      return;
    }
    let cancelled = false;
    fetch(`/data/credentials.${lang}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no overlay'))))
      .then((data) => {
        if (!cancelled) setCredentialOverlay(data);
      })
      .catch(() => {
        if (!cancelled) setCredentialOverlay(null);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const credentialsData = useMemo(() => mergeCredentials(baseCredentials, credentialOverlay), [baseCredentials, credentialOverlay]);

  /** Experience is translated per language: load experience.<lang>.json, fall back to the English base. */
  useEffect(() => {
    let cancelled = false;
    fetch(`/data/experience.${lang}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no localized file'))))
      .catch(() => fetch('/data/experience.json').then((r) => (r.ok ? r.json() : { positions: [] })))
      .then((data) => {
        if (!cancelled) setExperienceData(data ?? { positions: [] });
      })
      .catch(() => {
        if (!cancelled) setExperienceData({ positions: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const currentTimeline = timelineStack[timelineStack.length - 1];
  const hasExperience = (experienceData?.positions?.length ?? 0) > 0;

  // GA4: virtual page view per section. Must run before any early return so hook count is stable.
  useEffect(() => {
    if (!credentialsData) return;
    const section =
      view === 'experience'
        ? { name: 'Professional experience', path: '/experience' }
        : view === 'filter'
          ? { name: 'Diplomas by category', path: '/filter' }
          : currentTimeline.view === 'detail'
            ? { name: 'Timeline – Diploma detail', path: '/timeline/detail' }
            : currentTimeline.view === 'segment'
              ? { name: 'Timeline – Segment', path: '/timeline/segment' }
              : { name: 'Timeline', path: '/timeline' };
    trackPageView(section.name, section.path);
  }, [view, currentTimeline.view, credentialsData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !credentialsData || !categoriesData || !milestonesData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
        <p className="text-red-600 dark:text-red-400 text-center font-medium">{error ?? t('app.missingData')}</p>
      </div>
    );
  }

  const showTimelineBack = timelineStack.length > 1;
  const showBackFromDetail = view === 'timeline' && currentTimeline.view === 'detail' && (showTimelineBack || returnToView === 'filter');

  const handleSegmentSelect = (segment: Segment) => {
    setTimelineStack((s) => [...s, { view: 'segment', segment, initialPage: 0 }]);
  };

  const handleCredentialClick = (credential: Credential, segmentPage?: number) => {
    setTimelineStack((s) => {
      const top = s[s.length - 1];
      if (top.view === 'segment' && segmentPage != null) {
        return [...s.slice(0, -1), { ...top, initialPage: segmentPage }, { view: 'detail', credential }];
      }
      return [...s, { view: 'detail', credential }];
    });
  };

  /** Resolve milestone to a credential for the detail panel (credentialId if set, else first for year, or "primary" for 1991). "My journey continues" (m6) has no link. */
  const handleMilestoneClick = (milestone: Milestone) => {
    if (milestone.id === 'm6') return;
    const creds = credentialsData.credentials;
    let credential: Credential | undefined;
    if (milestone.credentialId) {
      credential = creds.find((c) => c.id === milestone.credentialId);
    }
    if (!credential && milestone.year === 1991) {
      credential = creds.find((c) => c.id === 'primary') ?? creds.find((c) => c.year <= 1999);
    }
    if (!credential) {
      credential = creds.filter((c) => c.year === milestone.year).sort((a, b) => a.numericId - b.numericId)[0];
    }
    if (credential) {
      setTimelineStack((s) => [...s, { view: 'detail', credential }]);
    }
  };

  const handleTimelineBack = () => {
    setTimelineStack((s) => s.slice(0, -1));
  };

  /** Back from detail: if we came from filter, return to filter; else pop timeline stack. */
  const handleDetailBack = () => {
    if (returnToView === 'filter') {
      setView('filter');
      setReturnToView(null);
      setTimelineStack([{ view: 'main' }]);
    } else {
      handleTimelineBack();
    }
  };

  const openDetailFromFilter = (credential: Credential) => {
    setView('timeline');
    setTimelineStack([{ view: 'detail', credential }]);
    setReturnToView('filter');
  };

  if (theme === null) {
    return (
      <ThemeChoiceView
        profile={credentialsData.profile}
        onSelect={(t2) => {
          setTheme(t2);
          try {
            sessionStorage.setItem(THEME_STORAGE_KEY, t2);
          } catch {
            // ignore
          }
        }}
      />
    );
  }

  if (!hasEntered) {
    const landingContent = (
      <LandingView
        theme={theme}
        profile={credentialsData.profile}
        credentials={credentialsData.credentials}
        categories={categoriesData.categories}
        onEnter={() => setHasEntered(true)}
        onChangeExperience={() => {
          setTheme(null);
          try {
            sessionStorage.removeItem(THEME_STORAGE_KEY);
          } catch {
            // ignore
          }
        }}
      />
    );
    if (theme === 'dragonball') {
      return (
        <div className="h-screen w-full cursor-none overflow-hidden">
          <KamehamehaCursor />
          {landingContent}
        </div>
      );
    }
    return landingContent;
  }

  const isDetailView = view === 'timeline' && currentTimeline.view === 'detail';
  const isFilterView = view === 'filter';
  const isExperienceView = view === 'experience';
  const showKamehamehaCursor = theme === 'dragonball' && !isDetailView && !isFilterView && !isExperienceView;

  const navButtonBase = 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200';
  const navActive = 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md border border-cyan-400/40';
  const navInactive =
    'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-cyan-300 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50/80 dark:hover:bg-slate-700/70';

  return (
    <div className={`h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden overflow-x-hidden min-h-[100dvh] ${showKamehamehaCursor ? 'cursor-none' : ''}`}>
      {showKamehamehaCursor && <KamehamehaCursor />}
      <header className="relative flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm z-10">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {showBackFromDetail && (
              <button
                type="button"
                onClick={handleDetailBack}
                className="flex-shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md hover:from-cyan-600 hover:to-teal-600 flex items-center gap-1.5 sm:gap-2 min-h-[44px] sm:min-h-0"
              >
                ← {returnToView === 'filter' ? t('nav.backToFilter') : t('nav.back')}
              </button>
            )}
            <h1 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 truncate">
              {credentialsData.profile.shortName ?? credentialsData.profile.name}
            </h1>
          </div>
          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setTheme(null);
                setHasEntered(false);
                try { sessionStorage.removeItem(THEME_STORAGE_KEY); } catch { /* ignore */ }
              }}
              title={t('nav.changeMode')}
              aria-label={t('nav.changeMode')}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" /></svg>
            </button>
            <button type="button" onClick={() => setQuickStartOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-900/30 border border-emerald-200/80 dark:border-emerald-700/50 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/50" title={t('nav.quickStart')} aria-label={t('nav.quickStart')}>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
              <span className="hidden xl:inline">{t('nav.quickStart')}</span>
            </button>
            <button type="button" onClick={() => setView('timeline')} className={`${navButtonBase} ${view === 'timeline' ? navActive : navInactive}`}>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h10M4 18h6" /><circle cx="18" cy="6" r="2" /><circle cx="14" cy="12" r="2" /><circle cx="10" cy="18" r="2" /></svg>
              {t('nav.timeline')}
            </button>
            <button type="button" onClick={() => setView('filter')} className={`${navButtonBase} ${view === 'filter' ? navActive : navInactive}`}>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
              {t('nav.diplomas')}
            </button>
            {hasExperience && (
              <button type="button" onClick={() => setView('experience')} className={`${navButtonBase} ${view === 'experience' ? navActive : navInactive}`}>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                {t('nav.experience')}
              </button>
            )}
            {/* Utilities grouped at the far right, away from the name */}
            <span className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" aria-hidden />
            <LanguageSelector />
            <ColorSchemeToggle />
          </nav>
          {/* Tablet/mobile: theme + hamburger (nav lives in the drawer) */}
          <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
            <ColorSchemeToggle />
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-cyan-500 text-white shadow-md border border-cyan-400/50 active:bg-cyan-600 touch-manipulation"
              aria-label={t('nav.openMenu')}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            </button>
          </div>
        </div>
      </header>
      {/* Mobile nav drawer: fuera del header para z-index correcto y taps fiables */}
      {mobileNavOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-slate-900/60 z-[90]"
            onClick={closeMobileNav}
            aria-hidden
          />
          <div
            className="lg:hidden fixed top-0 right-0 bottom-0 w-full max-w-[280px] bg-white dark:bg-slate-900 shadow-2xl z-[100] flex flex-col p-4 pt-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.navMenu')}
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-semibold text-slate-800 dark:text-slate-100">{t('nav.menu')}</span>
              <button type="button" onClick={closeMobileNav} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:bg-slate-200 touch-manipulation" aria-label={t('nav.closeMenu')}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <LanguageSelector className="w-full justify-between" />
              <ColorSchemeToggle withLabel />
            </div>
            <nav className="flex flex-col gap-2">
              <button type="button" onClick={() => { setTheme(null); setHasEntered(false); try { sessionStorage.removeItem(THEME_STORAGE_KEY); } catch { /* ignore */ } closeMobileNav(); }} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium min-h-[48px] active:bg-slate-100 touch-manipulation w-full">
                {t('nav.changeMode')}
              </button>
              <button type="button" onClick={() => { setQuickStartOpen(true); closeMobileNav(); }} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-900/30 border border-emerald-200/60 dark:border-emerald-700/50 text-sm font-medium min-h-[48px] active:bg-emerald-100 touch-manipulation w-full">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                {t('nav.quickStart')}
              </button>
              <button type="button" onClick={() => { setView('timeline'); closeMobileNav(); }} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold min-h-[48px] touch-manipulation w-full ${view === 'timeline' ? 'bg-cyan-500 text-white border border-cyan-400' : 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 active:bg-slate-100'}`}>
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h10M4 18h6" /><circle cx="18" cy="6" r="2" /><circle cx="14" cy="12" r="2" /><circle cx="10" cy="18" r="2" /></svg>
                {t('nav.timeline')}
              </button>
              <button type="button" onClick={() => { setView('filter'); closeMobileNav(); }} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold min-h-[48px] touch-manipulation w-full ${view === 'filter' ? 'bg-cyan-500 text-white border border-cyan-400' : 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 active:bg-slate-100'}`}>
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                {t('nav.diplomas')}
              </button>
              {hasExperience && (
                <button type="button" onClick={() => { setView('experience'); closeMobileNav(); }} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold min-h-[48px] touch-manipulation w-full ${view === 'experience' ? 'bg-cyan-500 text-white border border-cyan-400' : 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 active:bg-slate-100'}`}>
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                  {t('nav.experience')}
                </button>
              )}
            </nav>
          </div>
        </>
      )}

      <QuickStartPanel open={quickStartOpen} onClose={() => setQuickStartOpen(false)} />
      {!isDetailView && <ContactFloating profile={credentialsData.profile} />}

      <main
        className="w-full flex flex-col overflow-hidden flex-1 min-h-0"
        style={view === 'timeline' ? { height: 'calc(100vh - 56px)', minHeight: 0 } : undefined}
      >
        {view === 'timeline' && currentTimeline.view === 'main' && (
          <MainView
            milestones={milestonesData.milestones}
            credentials={credentialsData.credentials}
            onSegmentSelect={handleSegmentSelect}
            onMilestoneClick={handleMilestoneClick}
            theme={theme}
          />
        )}
        {view === 'timeline' && currentTimeline.view === 'segment' && (
          <SegmentView
            segment={currentTimeline.segment}
            initialPage={currentTimeline.initialPage}
            credentials={credentialsData.credentials}
            onBack={handleTimelineBack}
            onCredentialClick={handleCredentialClick}
            theme={theme}
          />
        )}
        {view === 'timeline' && currentTimeline.view === 'detail' && (() => {
          // Re-resolve by id from current (possibly re-translated) data so switching language updates the open detail.
          const resolved = credentialsData.credentials.find((c) => c.id === currentTimeline.credential.id) ?? currentTimeline.credential;
          return (
            <DetailView
              credential={resolved}
              credentialIndex={credentialsData.credentials.findIndex((c) => c.id === resolved.id)}
              categories={categoriesData.categories}
              onBack={handleDetailBack}
              backLabel={returnToView === 'filter' ? t('detail.backToFilter') : t('detail.backToSegment')}
              theme={theme}
            />
          );
        })()}
        {view === 'experience' && hasExperience && (
          <div className="flex-1 min-h-0 overflow-auto bg-gradient-to-b from-cyan-50/30 to-teal-50/30 dark:from-slate-900 dark:to-slate-950">
            <ExperienceView positions={experienceData!.positions} />
          </div>
        )}
        {view === 'filter' && (
          <div className="max-w-7xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-4 flex-1 min-h-0 overflow-auto">
            <FilterView
              credentials={credentialsData.credentials}
              categories={categoriesData.categories}
              selectedCategoryId={filterCategoryId}
              selectedLocationId={filterLocationId}
              onCategoryChange={setFilterCategoryId}
              onLocationChange={setFilterLocationId}
              onCredentialClick={openDetailFromFilter}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
