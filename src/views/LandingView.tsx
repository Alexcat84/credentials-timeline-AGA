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
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden bg-slate-900 px-6 py-16">
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-slate-700/30 blur-3xl" />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Language selector: top-right */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>

      <div className="relative z-10 text-center px-2 max-w-2xl w-full">
        <p className="text-cyan-400 font-medium text-sm uppercase tracking-widest mb-3 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {t('landing.eyebrow')}
        </p>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {profile.shortName ?? profile.name}
        </h1>
        <p className="text-slate-300 text-lg mb-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {profile.title}
        </p>
        <p className="text-slate-400 text-sm mb-7 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {profile.recordPeriod} · {t('landing.tagline')}
        </p>
        <div className="mb-9 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <StatsBar stats={stats} />
        </div>
        <button
          type="button"
          onClick={onEnter}
          className="px-8 py-4 rounded-2xl font-semibold text-slate-900 bg-gradient-to-r from-cyan-400 to-teal-400 shadow-xl shadow-cyan-500/30 hover:from-cyan-300 hover:to-teal-300 hover:shadow-2xl hover:scale-105 transition-all duration-300 opacity-0 animate-fade-in-up focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          style={{ animationDelay: '0.65s' }}
        >
          {t('landing.explore')} →
        </button>
      </div>

      {/* Ownership / rights notice */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 max-w-2xl px-6 text-center text-[11px] leading-relaxed text-slate-500">
        {t('landing.rights')}
      </p>
    </div>
  );
}
