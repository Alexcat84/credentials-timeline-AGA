import type { Profile } from '../types';

export type LandingTheme = 'formal' | 'dragonball';

type ThemeChoiceViewProps = {
  profile: Profile;
  onSelect: (theme: LandingTheme) => void;
};

export default function ThemeChoiceView({ profile, onSelect }: ThemeChoiceViewProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-900 px-4">
      {/* Subtle gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 text-center w-full max-w-3xl">
        <h1 className="text-xl font-semibold text-white mb-8">
          How do you want to see this presentation?
        </h1>

        <div className="grid grid-cols-2 gap-8">
          {/* Formal presentation — preview: pantalla principal en pequeño */}
          <button
            type="button"
            onClick={() => onSelect('formal')}
            className="group relative flex flex-col rounded-2xl font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 overflow-hidden border border-slate-600/50 hover:border-slate-500 shadow-xl aspect-[4/3] min-h-[280px]"
          >
            <div className="absolute inset-0 bg-slate-900 group-hover:bg-slate-800 transition-colors" />
            {/* Gradient orbs like formal landing */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 -left-8 w-32 h-32 rounded-full bg-cyan-500/20 blur-2xl" />
              <div className="absolute bottom-1/4 -right-8 w-32 h-32 rounded-full bg-teal-500/20 blur-2xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-slate-600/25 blur-2xl" />
            </div>
            {/* Wavy lines (mini version of main screen) */}
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="formalPreviewGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
              <path d="M 0 90 Q 40 40 100 70 T 200 50" fill="none" stroke="url(#formalPreviewGradient)" strokeWidth="1.2" strokeDasharray="3 2" />
              <path d="M 0 75 Q 60 25 120 55 T 200 35" fill="none" stroke="url(#formalPreviewGradient)" strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />
            </svg>
            {/* Contenido de la pantalla principal en pequeño */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-3 py-4 text-center">
              <p className="text-cyan-400 text-[0.5rem] font-medium uppercase tracking-widest mb-1">Educational & Professional Journey</p>
              <h2 className="text-sm md:text-base font-bold text-white mb-0.5 drop-shadow-sm">{profile.shortName ?? profile.name}</h2>
              <p className="text-slate-300 text-[0.5rem] leading-tight max-w-[90%] truncate">{profile.title}</p>
              <p className="text-slate-400 text-[0.45rem] mb-2">{profile.recordPeriod} · Interactive timeline</p>
              <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400/80 to-teal-400/80 text-slate-900 text-[0.5rem] font-semibold shadow-md">
                Explore my journey →
              </div>
            </div>
            <div className="absolute inset-0 flex items-end justify-center pb-6">
              <span className="text-lg drop-shadow-md">Formal presentation</span>
            </div>
          </button>

          {/* Fun mode — preview: Shen Long + dragon ball hint */}
          <button
            type="button"
            onClick={() => onSelect('dragonball')}
            className="group relative flex flex-col rounded-2xl font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 overflow-hidden border border-amber-500/40 hover:border-amber-400/60 shadow-xl aspect-[4/3] min-h-[280px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/95 to-amber-950/30 group-hover:from-slate-700/95 group-hover:to-amber-900/40 transition-colors" />
            <img
              src="/images/dragon-balls/ShengLong.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center opacity-[0.35] pointer-events-none"
              aria-hidden
            />
            <div className="absolute inset-0 flex items-end justify-center pb-6">
              <span className="text-lg drop-shadow-md">Fun mode</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
