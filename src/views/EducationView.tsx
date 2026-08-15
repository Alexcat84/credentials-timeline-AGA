import { useMemo, useState } from 'react';
import type { Credential, Category, Milestone } from '../types';
import { useI18n, useDataLabel } from '../i18n';
import DiplomaLightbox from '../components/DiplomaLightbox';

const FORMAL_EDUCATION = 'formal-education';

type EducationViewProps = {
  credentials: Credential[];
  categories: Category[];
  milestones: Milestone[];
};

type LightboxState = { images: string[]; title: string };

/** Resolve a milestone (education level) for a credential: explicit link, exact year, else latest level reached. */
function resolveLevel(credential: Credential, milestones: Milestone[]): Milestone | null {
  return (
    milestones.find((m) => m.credentialId === credential.id) ??
    milestones.find((m) => m.year === credential.year) ??
    [...milestones].filter((m) => m.year <= credential.year).sort((a, b) => b.year - a.year)[0] ??
    null
  );
}

function EducationCard({
  credential,
  categories,
  levelLabel,
  isLast,
  onOpen,
}: {
  credential: Credential;
  categories: Category[];
  levelLabel: string | null;
  isLast: boolean;
  onOpen: (images: string[], title: string) => void;
}) {
  const { t } = useI18n();
  const dataLabel = useDataLabel();
  const images = credential.imageUrls ?? [];
  const hasImages = images.length > 0;

  const chips = credential.categories
    .map((id) => {
      const cat = categories.find((c) => c.id === id);
      return cat ? { id, label: dataLabel('categories', id, cat.label) } : null;
    })
    .filter(Boolean) as { id: string; label: string }[];

  const metaLine = [credential.date ?? String(credential.year), credential.location, credential.duration]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-4 h-4 rounded-full bg-cyan-500 border-2 border-white dark:border-slate-900 shadow-md" />
        {!isLast && <div className="w-0.5 flex-1 min-h-[24px] bg-cyan-300/60 dark:bg-slate-700" />}
      </div>
      <div className="flex-1 min-w-0 pb-8">
        <div className="rounded-xl border-2 border-cyan-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-slate-800 dark:to-slate-800 border-b border-cyan-200/60 dark:border-slate-700">
            {levelLabel && (
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5 text-cyan-700 dark:text-cyan-300">
                {credential.year} · {levelLabel}
              </p>
            )}
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">{credential.title}</h3>
            <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300 mt-0.5">{credential.institution}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{metaLine}</p>
            {credential.verification && (
              <a
                href={credential.verification.url}
                target="_blank"
                rel="noopener noreferrer"
                title={t('education.viewCredential')}
                className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-600 text-white hover:bg-teal-500 transition-colors"
              >
                <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                {t('education.verifiedBy', { provider: credential.verification.provider })}
              </a>
            )}
          </div>
          <div className="px-4 py-4 flex flex-col sm:flex-row gap-4">
            {hasImages && (
              <button
                type="button"
                onClick={() => onOpen(images, credential.title)}
                aria-label={t('education.enlarge')}
                title={t('education.enlarge')}
                className="group relative flex-shrink-0 w-full sm:w-44 h-44 rounded-lg overflow-hidden border border-cyan-200/70 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 shadow-sm"
              >
                <img src={images[0]} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" draggable={false} />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/25 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 rounded-full bg-white/90 text-slate-800 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M11 8v6M8 11h6" /></svg>
                  </span>
                </div>
                {images.length > 1 && (
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-slate-900/75 text-white text-[10px] font-medium">
                    {t('education.pages', { count: images.length })}
                  </span>
                )}
              </button>
            )}
            <div className="flex-1 min-w-0 space-y-3">
              {credential.notes && (
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">{credential.notes}</p>
              )}
              {chips.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {chips.map((chip) => (
                    <span
                      key={chip.id}
                      className="px-2 py-0.5 rounded-lg text-xs font-medium bg-cyan-50 dark:bg-slate-700/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/70 dark:border-slate-600"
                    >
                      {chip.label}
                    </span>
                  ))}
                </div>
              )}
              {hasImages && (
                <button
                  type="button"
                  onClick={() => onOpen(images, credential.title)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-200"
                >
                  {t('education.viewDiploma')}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EducationView({ credentials, categories, milestones }: EducationViewProps) {
  const { t } = useI18n();
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const items = useMemo(
    () =>
      credentials
        .filter((c) => c.categories.includes(FORMAL_EDUCATION))
        .sort((a, b) => a.year - b.year || a.numericId - b.numericId),
    [credentials]
  );

  const dataLabel = useDataLabel();

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-1">{t('education.title')}</h2>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">{t('education.subtitle')}</p>
      <div className="flex flex-col-reverse">
        {items.map((credential, index) => {
          const level = resolveLevel(credential, milestones);
          const levelLabel = level ? dataLabel('milestones', level.id, level.label) : null;
          return (
            <EducationCard
              key={credential.id}
              credential={credential}
              categories={categories}
              levelLabel={levelLabel}
              isLast={index === 0}
              onOpen={(images, title) => setLightbox({ images, title })}
            />
          );
        })}
      </div>

      {lightbox && (
        <DiplomaLightbox images={lightbox.images} title={lightbox.title} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
