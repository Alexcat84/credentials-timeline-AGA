import { useMemo } from 'react';
import type { Profile, Credential, Category } from '../types';
import { useI18n } from '../i18n';
import { computeStats } from '../stats';
import StatsBar from '../components/StatsBar';
import LanguageSelector from '../components/LanguageSelector';

type LandingViewProps = {
  profile: Profile;
  credentials: Credential[];
  categories: Category[];
  onEnter: () => void;
};

export default function LandingView({ profile, credentials, categories, onEnter }: LandingViewProps) {
  const { t } = useI18n();
  const stats = useMemo(
    () => computeStats(credentials, categories, profile.recordPeriod),
    [credentials, categories, profile.recordPeriod]
  );

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden px-6 py-16">
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-accent-cyan/20 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent-teal/20 blur-3xl" />
      </div>

      {/* Language selector: top-right */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>

      <div className="relative z-10 text-center px-2 max-w-2xl w-full">
        <p className="text-accent-cyan font-medium text-sm uppercase tracking-widest mb-3 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {t('landing.eyebrow')}
        </p>
        <h1 className="text-4xl md:text-6xl font-bold text-ink mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {profile.shortName ?? profile.name}
        </h1>
        <p className="text-ink-secondary text-lg mb-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {profile.title}
        </p>
        <p className="text-ink-muted text-sm mb-7 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {profile.recordPeriod} · {t('landing.tagline')}
        </p>
        <div className="mb-9 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <StatsBar stats={stats} />
        </div>
        <button
          type="button"
          onClick={onEnter}
          className="px-8 py-4 rounded-2xl font-semibold text-bg0 bg-gradient-to-r from-accent-cyan to-accent-teal shadow-glow hover:brightness-110 hover:scale-105 transition-all duration-300 opacity-0 animate-fade-in-up focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-bg0"
          style={{ animationDelay: '0.65s' }}
        >
          {t('landing.explore')} →
        </button>
      </div>

      {/* Ownership / rights notice */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 max-w-2xl px-6 text-center text-[11px] leading-relaxed text-ink-muted">
        {t('landing.rights')}
      </p>
    </div>
  );
}
