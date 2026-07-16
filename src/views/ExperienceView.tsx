import { useState } from 'react';
import type { ExperiencePosition } from '../types';
import { useI18n } from '../i18n';

const MAX_VISIBLE = 3;

/** Map company name to logo filename in public/organization-logos/ */
const COMPANY_LOGO: Record<string, string> = {
  'COTECNA de El Salvador': 'Logo COTECNA.png',
  'Refinería Petrolera Acajutla (RASA)': 'LOGO RASA.jpg',
};

function getLogoUrl(company: string): string | null {
  const filename = COMPANY_LOGO[company];
  if (!filename) return null;
  return `/organization-logos/${encodeURIComponent(filename)}`;
}

type ExperienceViewProps = {
  positions: ExperiencePosition[];
};

function PositionCard({ position, isLast }: { position: ExperiencePosition; isFirst: boolean; isLast: boolean }) {
  const { t } = useI18n();
  const logoUrl = getLogoUrl(position.company);
  const [showAllResponsibilities, setShowAllResponsibilities] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const responsibilities = position.responsibilities ?? [];
  const achievements = position.achievements ?? [];
  const responsibilitiesVisible = showAllResponsibilities ? responsibilities : responsibilities.slice(0, MAX_VISIBLE);
  const achievementsVisible = showAllAchievements ? achievements : achievements.slice(0, MAX_VISIBLE);
  const hasMoreResponsibilities = responsibilities.length > MAX_VISIBLE;
  const hasMoreAchievements = achievements.length > MAX_VISIBLE;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-4 h-4 rounded-full bg-cyan-500 border-2 border-white shadow-md" />
        {!isLast && <div className="w-0.5 flex-1 min-h-[24px] bg-cyan-300/60" />}
      </div>
      <div className="flex-1 min-w-0 pb-8">
        <div className="rounded-xl border-2 border-cyan-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-slate-800 dark:to-slate-800 border-b border-cyan-200/60 dark:border-slate-700 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{position.title}</h3>
              <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">{position.company}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {position.startDate} – {position.endDate} · {position.location}
              </p>
            </div>
            {logoUrl && (
              <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-cyan-200/60 dark:border-slate-600 bg-white shadow-sm">
                <img
                  src={logoUrl}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
          <div className="px-4 py-3 space-y-3">
            <div>
              <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">{t('experience.responsibilities')}</p>
              <ul className="mt-1.5 list-disc list-outside pl-6 pr-0 text-sm text-slate-700 dark:text-slate-300 space-y-1.5 text-justify [&_li]:pl-0.5">
                {responsibilitiesVisible.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              {hasMoreResponsibilities && (
                <button
                  type="button"
                  onClick={() => setShowAllResponsibilities(!showAllResponsibilities)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-teal-700 dark:text-teal-300 bg-teal-50/90 dark:bg-teal-900/30 border border-teal-200/70 dark:border-teal-700/50 hover:bg-teal-100/90 dark:hover:bg-teal-900/50 hover:border-teal-300/80 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {showAllResponsibilities ? t('experience.showLess') : t('experience.showAllResponsibilities', { count: responsibilities.length })}
                </button>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">{t('experience.achievements')}</p>
              <ul className="mt-1.5 list-disc list-outside pl-6 pr-0 text-sm text-slate-700 dark:text-slate-300 space-y-1.5 text-justify [&_li]:pl-0.5">
                {achievementsVisible.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              {hasMoreAchievements && (
                <button
                  type="button"
                  onClick={() => setShowAllAchievements(!showAllAchievements)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-teal-700 dark:text-teal-300 bg-teal-50/90 dark:bg-teal-900/30 border border-teal-200/70 dark:border-teal-700/50 hover:bg-teal-100/90 dark:hover:bg-teal-900/50 hover:border-teal-300/80 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {showAllAchievements ? t('experience.showLess') : t('experience.showAllAchievements', { count: achievements.length })}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExperienceView({ positions }: ExperienceViewProps) {
  const { t } = useI18n();
  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-1">{t('experience.title')}</h2>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">{t('experience.subtitle')}</p>
      <div className="mb-8 rounded-xl border-2 border-cyan-200/80 dark:border-slate-700 bg-gradient-to-r from-cyan-50 via-teal-50/90 to-cyan-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 px-5 py-4 shadow-sm">
        <p className="text-center text-slate-800 dark:text-slate-100 font-semibold leading-relaxed">
          {t('experience.cta')}
        </p>
      </div>
      <div className="flex flex-col-reverse">
        {positions.map((position, index) => (
          <PositionCard
            key={position.id}
            position={position}
            isFirst={index === positions.length - 1}
            isLast={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
