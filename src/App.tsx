import { useState, useEffect } from 'react';
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
import type { CredentialsData, CategoriesData, MilestonesData, ExperienceData, Segment, Credential, Milestone } from './types';
import { trackPageView } from './analytics';

const CREDENTIALS_URL = '/data/credentials.json';
const CATEGORIES_URL = '/data/categories.json';
const MILESTONES_URL = '/data/milestones.json';
const EXPERIENCE_URL = '/data/experience.json';
const THEME_STORAGE_KEY = 'timeline-landing-theme';

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
  const [theme, setTheme] = useState<LandingTheme | null>(loadTheme);
  const [hasEntered, setHasEntered] = useState(false);
  const [view, setView] = useState<View>('timeline');
  const [credentialsData, setCredentialsData] = useState<CredentialsData | null>(null);
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
      fetch(EXPERIENCE_URL).then((r) => (r.ok ? r.json() : { positions: [] })).catch(() => ({ positions: [] })),
    ])
      .then(([creds, cats, milestones, experience]) => {
        setCredentialsData(creds);
        setCategoriesData(cats);
        setMilestonesData(milestones);
        setExperienceData(experience);
      })
      .catch((e) => setError(e?.message ?? 'Error loading data'))
      .finally(() => setLoading(false));
  }, []);

  const currentTimeline = timelineStack[timelineStack.length - 1];

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
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-700 text-sm font-medium">Loading journey…</p>
        </div>
      </div>
    );
  }

  if (error || !credentialsData || !categoriesData || !milestonesData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <p className="text-red-600 text-center font-medium">{error ?? 'Missing data'}</p>
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
        onSelect={(t) => {
          setTheme(t);
          try {
            sessionStorage.setItem(THEME_STORAGE_KEY, t);
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

  return (
    <div className={`h-screen flex flex-col bg-slate-50 overflow-hidden overflow-x-hidden min-h-[100dvh] ${showKamehamehaCursor ? 'cursor-none' : ''}`}>
      {showKamehamehaCursor && <KamehamehaCursor />}
      <header className="relative flex-shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {showBackFromDetail && (
              <button
                type="button"
                onClick={handleDetailBack}
                className="flex-shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md hover:from-cyan-600 hover:to-teal-600 flex items-center gap-1.5 sm:gap-2 min-h-[44px] sm:min-h-0"
              >
                {returnToView === 'filter' ? '← Back to filter' : '← Back'}
              </button>
            )}
            <h1 className="text-sm sm:text-base font-semibold text-slate-800 truncate">
              {credentialsData.profile.shortName ?? credentialsData.profile.name}
            </h1>
          </div>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setTheme(null);
                setHasEntered(false);
                try { sessionStorage.removeItem(THEME_STORAGE_KEY); } catch { /* ignore */ }
              }}
              className="text-slate-500 text-sm hover:text-slate-700 underline underline-offset-2"
            >
              Change presentation mode
            </button>
            <button type="button" onClick={() => setQuickStartOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50/90 border border-emerald-200/80 hover:bg-emerald-100/90" title="Quick Start" aria-label="Quick Start">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
              Quick Start
            </button>
            <button type="button" onClick={() => setView('timeline')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${view === 'timeline' ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md border border-cyan-400/40' : 'bg-white/80 text-slate-600 border border-slate-200 hover:border-cyan-300 hover:text-cyan-700 hover:bg-cyan-50/80'}`}>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h10M4 18h6" /><circle cx="18" cy="6" r="2" /><circle cx="14" cy="12" r="2" /><circle cx="10" cy="18" r="2" /></svg>
              Timeline
            </button>
            <button type="button" onClick={() => setView('filter')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${view === 'filter' ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md border border-cyan-400/40' : 'bg-white/80 text-slate-600 border border-slate-200 hover:border-cyan-300 hover:text-cyan-700 hover:bg-cyan-50/80'}`}>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
              Diplomas by category
            </button>
            {experienceData?.positions?.length && (
              <button type="button" onClick={() => setView('experience')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${view === 'experience' ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md border border-cyan-400/40' : 'bg-white/80 text-slate-600 border border-slate-200 hover:border-cyan-300 hover:text-cyan-700 hover:bg-cyan-50/80'}`}>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                Professional experience
              </button>
            )}
          </nav>
          {/* Mobile: hamburger — muy visible */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-cyan-500 text-white shadow-md border border-cyan-400/50 active:bg-cyan-600 touch-manipulation"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </div>
      </header>
      {/* Mobile nav drawer: fuera del header para z-index correcto y taps fiables */}
      {mobileNavOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-slate-900/60 z-[90]"
            onClick={closeMobileNav}
            aria-hidden
          />
          <div
            className="md:hidden fixed top-0 right-0 bottom-0 w-full max-w-[280px] bg-white shadow-2xl z-[100] flex flex-col p-4 pt-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-semibold text-slate-800">Menú</span>
              <button type="button" onClick={closeMobileNav} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:bg-slate-200 touch-manipulation" aria-label="Cerrar menú">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              <button type="button" onClick={() => { setTheme(null); setHasEntered(false); try { sessionStorage.removeItem(THEME_STORAGE_KEY); } catch { /* ignore */ } closeMobileNav(); }} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-slate-700 bg-slate-50 border border-slate-200 text-sm font-medium min-h-[48px] active:bg-slate-100 touch-manipulation w-full">
                Change presentation mode
              </button>
              <button type="button" onClick={() => { setQuickStartOpen(true); closeMobileNav(); }} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 text-sm font-medium min-h-[48px] active:bg-emerald-100 touch-manipulation w-full">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                Quick Start
              </button>
              <button type="button" onClick={() => { setView('timeline'); closeMobileNav(); }} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold min-h-[48px] touch-manipulation w-full ${view === 'timeline' ? 'bg-cyan-500 text-white border border-cyan-400' : 'text-slate-700 bg-slate-50 border border-slate-200 active:bg-slate-100'}`}>
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h10M4 18h6" /><circle cx="18" cy="6" r="2" /><circle cx="14" cy="12" r="2" /><circle cx="10" cy="18" r="2" /></svg>
                Timeline
              </button>
              <button type="button" onClick={() => { setView('filter'); closeMobileNav(); }} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold min-h-[48px] touch-manipulation w-full ${view === 'filter' ? 'bg-cyan-500 text-white border border-cyan-400' : 'text-slate-700 bg-slate-50 border border-slate-200 active:bg-slate-100'}`}>
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                Diplomas by category
              </button>
              {experienceData?.positions?.length && (
                <button type="button" onClick={() => { setView('experience'); closeMobileNav(); }} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold min-h-[48px] touch-manipulation w-full ${view === 'experience' ? 'bg-cyan-500 text-white border border-cyan-400' : 'text-slate-700 bg-slate-50 border border-slate-200 active:bg-slate-100'}`}>
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                  Professional experience
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
        {view === 'timeline' && currentTimeline.view === 'detail' && (
          <DetailView
            credential={currentTimeline.credential}
            credentialIndex={credentialsData.credentials.findIndex((c) => c.id === currentTimeline.credential.id)}
            categories={categoriesData.categories}
            onBack={handleDetailBack}
            backLabel={returnToView === 'filter' ? 'Back to filter' : 'Back to segment'}
            theme={theme}
          />
        )}
        {view === 'experience' && experienceData?.positions?.length && (
          <div className="flex-1 min-h-0 overflow-auto bg-gradient-to-b from-cyan-50/30 to-teal-50/30">
            <ExperienceView positions={experienceData.positions} />
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
