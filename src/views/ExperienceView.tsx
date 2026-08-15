import { useState } from 'react';
import type { ExperiencePosition } from '../types';
import { useI18n } from '../i18n';
import DiplomaLightbox from '../components/DiplomaLightbox';

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

function PositionCard({
  position,
  isLast,
  onOpenLetter,
}: {
  position: ExperiencePosition;
  isFirst: boolean;
  isLast: boolean;
  onOpenLetter: (images: string[], title: string) => void;
}) {
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
  const referenceLetterUrls = position.referenceLetterUrls ?? [];
  const hasReferenceLetter = referenceLetterUrls.length > 0;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-4 h-4 rounded-full bg-accent-cyan shadow-glow" />
        {!isLast && <div className="w-0.5 flex-1 min-h-[24px] bg-stroke" />}
      </div>
      <div className="flex-1 min-w-0 pb-8">
        <div className="rounded-xl border border-stroke bg-surface backdrop-blur-md shadow-soft overflow-hidden">
          <div className="px-4 py-3 bg-surface-elevated border-b border-stroke flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-ink">{position.title}</h3>
              <p className="text-sm font-medium text-accent-cyan">{position.company}</p>
              <p className="text-xs text-ink-muted mt-0.5">
                {position.startDate} – {position.endDate} · {position.location}
              </p>
            </div>
            {logoUrl && (
              <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-stroke bg-white shadow-sm">
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
              <p className="text-xs font-semibold text-accent-cyan uppercase tracking-wider">{t('experience.responsibilities')}</p>
              <ul className="mt-1.5 list-disc list-outside pl-6 pr-0 text-sm text-ink-secondary space-y-1.5 text-justify [&_li]:pl-0.5">
                {responsibilitiesVisible.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              {hasMoreResponsibilities && (
                <button
                  type="button"
                  onClick={() => setShowAllResponsibilities(!showAllResponsibilities)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-accent-teal bg-accent-teal/10 border border-accent-teal/30 hover:bg-accent-teal/15 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {showAllResponsibilities ? t('experience.showLess') : t('experience.showAllResponsibilities', { count: responsibilities.length })}
                </button>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-accent-cyan uppercase tracking-wider">{t('experience.achievements')}</p>
              <ul className="mt-1.5 list-disc list-outside pl-6 pr-0 text-sm text-ink-secondary space-y-1.5 text-justify [&_li]:pl-0.5">
                {achievementsVisible.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              {hasMoreAchievements && (
                <button
                  type="button"
                  onClick={() => setShowAllAchievements(!showAllAchievements)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-accent-teal bg-accent-teal/10 border border-accent-teal/30 hover:bg-accent-teal/15 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {showAllAchievements ? t('experience.showLess') : t('experience.showAllAchievements', { count: achievements.length })}
                </button>
              )}
            </div>
            {hasReferenceLetter && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => onOpenLetter(referenceLetterUrls, `${position.title} — ${position.company}`)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-cyan hover:text-accent-teal transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M9 15h6M9 11h3" /></svg>
                  {t('experience.viewReferenceLetter')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExperienceView({ positions }: ExperienceViewProps) {
  const { t } = useI18n();
  const [lightbox, setLightbox] = useState<{ images: string[]; title: string } | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <h2 className="text-lg sm:text-xl font-semibold text-ink mb-1">{t('experience.title')}</h2>
      <p className="text-xs sm:text-sm text-ink-muted mb-4">{t('experience.subtitle')}</p>
      <div className="mb-8 rounded-xl border border-stroke bg-surface backdrop-blur-md px-5 py-4 shadow-soft">
        <p className="text-center text-ink font-semibold leading-relaxed">
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
            onOpenLetter={(images, title) => setLightbox({ images, title })}
          />
        ))}
      </div>

      {lightbox && (
        <DiplomaLightbox images={lightbox.images} title={lightbox.title} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
