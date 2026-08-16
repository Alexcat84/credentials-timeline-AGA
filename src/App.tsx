import { useState, useEffect, useMemo } from 'react';
import LandingView from './views/LandingView';
import SkillsView from './views/SkillsView';
import EducationView from './views/EducationView';
import CertificationsView from './views/CertificationsView';
import ExperienceView from './views/ExperienceView';
import ContactFloating from './components/ContactFloating';
import LanguageSelector from './components/LanguageSelector';
import type { CredentialsData, CategoriesData, MilestonesData, ExperienceData, SkillsData, Credential, Profile } from './types';
import { trackPageView } from './analytics';
import { useI18n } from './i18n';

const CREDENTIALS_URL = '/data/credentials.json';
const CATEGORIES_URL = '/data/categories.json';
const MILESTONES_URL = '/data/milestones.json';

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

type View = 'skills' | 'education' | 'certifications' | 'experience';

function App() {
  const { t, lang } = useI18n();
  const [hasEntered, setHasEntered] = useState(false);
  const [view, setView] = useState<View>('skills');
  const [baseCredentials, setBaseCredentials] = useState<CredentialsData | null>(null);
  const [credentialOverlay, setCredentialOverlay] = useState<CredentialOverlay | null>(null);
  const [categoriesData, setCategoriesData] = useState<CategoriesData | null>(null);
  const [milestonesData, setMilestonesData] = useState<MilestonesData | null>(null);
  const [experienceData, setExperienceData] = useState<ExperienceData | null>(null);
  const [skillsData, setSkillsData] = useState<SkillsData | null>(null);
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

  const hasExperience = (experienceData?.positions?.length ?? 0) > 0;

  /** Skills are translated per language: load skills.<lang>.json, fall back to the English base. */
  useEffect(() => {
    let cancelled = false;
    fetch(`/data/skills.${lang}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no localized file'))))
      .catch(() => fetch('/data/skills.json').then((r) => (r.ok ? r.json() : { groups: [] })))
      .then((data) => {
        if (!cancelled) setSkillsData(data ?? { groups: [] });
      })
      .catch(() => {
        if (!cancelled) setSkillsData({ groups: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const hasSkills = (skillsData?.groups?.length ?? 0) > 0;

  // GA4: virtual page view per section. Must run before any early return so hook count is stable.
  useEffect(() => {
    if (!credentialsData) return;
    const section =
      view === 'experience'
        ? { name: 'Professional experience', path: '/experience' }
        : view === 'certifications'
          ? { name: 'Certifications', path: '/certifications' }
          : view === 'skills'
            ? { name: 'Skills & Expertise', path: '/skills' }
            : { name: 'Education', path: '/education' };
    trackPageView(section.name, section.path);
  }, [view, credentialsData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          <p className="text-ink-secondary text-sm font-medium">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !credentialsData || !categoriesData || !milestonesData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-danger text-center font-medium">{error ?? t('app.missingData')}</p>
      </div>
    );
  }

  if (!hasEntered) {
    return (
      <LandingView
        profile={credentialsData.profile}
        credentials={credentialsData.credentials}
        categories={categoriesData.categories}
        onEnter={() => setHasEntered(true)}
      />
    );
  }

  const navButtonBase = 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200';
  const navActive = 'text-accent-cyan bg-white/5 border-accent-cyan/45 shadow-[inset_0_-2px_0_#65ddff]';
  const navInactive = 'text-ink-secondary bg-surface-elevated/50 border-stroke hover:text-ink hover:border-accent-cyan/40 hover:bg-white/5';

  const skillsIcon = (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" /></svg>
  );
  const educationIcon = (
    <svg className="w-4 h-4 flex-shrink-0 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" /></svg>
  );
  const certIcon = (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" /><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" /></svg>
  );
  const experienceIcon = (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden overflow-x-hidden min-h-[100dvh]">
      <header className="relative flex-shrink-0 border-b border-stroke bg-surface-elevated backdrop-blur-md shadow-soft z-10">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4">
          <h1 className="text-sm sm:text-base font-semibold text-ink truncate min-w-0 flex-1">
            {credentialsData.profile.shortName ?? credentialsData.profile.name}
          </h1>
          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-2.5 flex-shrink-0">
            {hasSkills && (
              <button type="button" onClick={() => setView('skills')} className={`${navButtonBase} ${view === 'skills' ? navActive : navInactive}`}>
                {skillsIcon}
                {t('nav.skills')}
              </button>
            )}
            <button type="button" onClick={() => setView('education')} className={`${navButtonBase} ${view === 'education' ? navActive : navInactive}`}>
              {educationIcon}
              {t('nav.education')}
            </button>
            <button type="button" onClick={() => setView('certifications')} className={`${navButtonBase} ${view === 'certifications' ? navActive : navInactive}`}>
              {certIcon}
              {t('nav.diplomas')}
            </button>
            {hasExperience && (
              <button type="button" onClick={() => setView('experience')} className={`${navButtonBase} ${view === 'experience' ? navActive : navInactive}`}>
                {experienceIcon}
                {t('nav.experience')}
              </button>
            )}
            <span className="w-px h-6 bg-stroke mx-1" aria-hidden />
            <LanguageSelector />
          </nav>
          {/* Tablet/mobile: hamburger */}
          <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-accent-cyan text-bg0 shadow-glow hover:brightness-110 active:brightness-95 touch-manipulation"
              aria-label={t('nav.openMenu')}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-bg0/70 z-[90]" onClick={closeMobileNav} aria-hidden />
          <div
            className="lg:hidden fixed top-0 right-0 bottom-0 w-full max-w-[280px] bg-bg1/95 backdrop-blur-xl border-l border-stroke shadow-soft z-[100] flex flex-col p-4 pt-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.navMenu')}
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-semibold text-ink">{t('nav.menu')}</span>
              <button type="button" onClick={closeMobileNav} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-surface-elevated border border-stroke text-ink-secondary active:bg-white/5 touch-manipulation" aria-label={t('nav.closeMenu')}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mb-4">
              <LanguageSelector className="w-full justify-between" />
            </div>
            <nav className="flex flex-col gap-2">
              {hasSkills && (
                <button type="button" onClick={() => { setView('skills'); closeMobileNav(); }} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold min-h-[48px] touch-manipulation w-full border ${view === 'skills' ? 'text-accent-cyan bg-white/5 border-accent-cyan/45' : 'text-ink-secondary bg-surface-elevated/50 border-stroke active:bg-white/5'}`}>
                  {skillsIcon}
                  {t('nav.skills')}
                </button>
              )}
              <button type="button" onClick={() => { setView('education'); closeMobileNav(); }} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold min-h-[48px] touch-manipulation w-full border ${view === 'education' ? 'text-accent-cyan bg-white/5 border-accent-cyan/45' : 'text-ink-secondary bg-surface-elevated/50 border-stroke active:bg-white/5'}`}>
                {educationIcon}
                {t('nav.education')}
              </button>
              <button type="button" onClick={() => { setView('certifications'); closeMobileNav(); }} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold min-h-[48px] touch-manipulation w-full border ${view === 'certifications' ? 'text-accent-cyan bg-white/5 border-accent-cyan/45' : 'text-ink-secondary bg-surface-elevated/50 border-stroke active:bg-white/5'}`}>
                {certIcon}
                {t('nav.diplomas')}
              </button>
              {hasExperience && (
                <button type="button" onClick={() => { setView('experience'); closeMobileNav(); }} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold min-h-[48px] touch-manipulation w-full border ${view === 'experience' ? 'text-accent-cyan bg-white/5 border-accent-cyan/45' : 'text-ink-secondary bg-surface-elevated/50 border-stroke active:bg-white/5'}`}>
                  {experienceIcon}
                  {t('nav.experience')}
                </button>
              )}
            </nav>
          </div>
        </>
      )}

      <ContactFloating profile={credentialsData.profile} />

      <main className="w-full flex flex-col overflow-hidden flex-1 min-h-0">
        {view === 'skills' && hasSkills && (
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
              <SkillsView groups={skillsData!.groups} />
            </div>
          </div>
        )}
        {view === 'education' && (
          <div className="flex-1 min-h-0 overflow-auto">
            <EducationView
              credentials={credentialsData.credentials}
              categories={categoriesData.categories}
              milestones={milestonesData.milestones}
            />
          </div>
        )}
        {view === 'certifications' && (
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
              <CertificationsView credentials={credentialsData.credentials} categories={categoriesData.categories} />
            </div>
          </div>
        )}
        {view === 'experience' && hasExperience && (
          <div className="flex-1 min-h-0 overflow-auto">
            <ExperienceView positions={experienceData!.positions} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
