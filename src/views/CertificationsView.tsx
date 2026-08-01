import { useMemo, useState } from 'react';
import type { Credential, Category } from '../types';
import { useI18n, useDataLabel } from '../i18n';
import { getCategoryMeta } from '../categoryMeta';
import DiplomaLightbox from '../components/DiplomaLightbox';

const FORMAL_EDUCATION = 'formal-education';

type CertificationsViewProps = {
  credentials: Credential[];
  categories: Category[];
};

type LightboxState = { images: string[]; title: string };

function CertCard({
  credential,
  categories,
  onOpen,
}: {
  credential: Credential;
  categories: Category[];
  onOpen: (images: string[], title: string) => void;
}) {
  const { t } = useI18n();
  const dataLabel = useDataLabel();
  const images = credential.imageUrls ?? [];
  const hasImages = images.length > 0;
  const metaLine = [credential.date ?? String(credential.year), credential.location, credential.duration]
    .filter(Boolean)
    .join(' · ');

  const chips = credential.categories
    .map((id) => {
      const cat = categories.find((c) => c.id === id);
      return cat ? { id, label: dataLabel('categories', id, cat.label) } : null;
    })
    .filter(Boolean) as { id: string; label: string }[];

  return (
    <div className="rounded-xl border-2 border-cyan-200/70 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-sm overflow-hidden flex flex-col">
      {hasImages && (
        <button
          type="button"
          onClick={() => onOpen(images, credential.title)}
          aria-label={t('education.enlarge')}
          title={t('education.enlarge')}
          className="group relative w-full h-40 bg-slate-100 dark:bg-slate-900 overflow-hidden flex-shrink-0"
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
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">{credential.year}</p>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug mt-0.5">{credential.title}</h4>
        <p className="text-xs font-medium text-cyan-700 dark:text-cyan-300 mt-0.5">{credential.institution}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{metaLine}</p>
        {credential.notes && <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">{credential.notes}</p>}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            {chips.map((chip) => {
              const cmeta = getCategoryMeta(chip.id);
              return (
                <span
                  key={chip.id}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium border"
                  style={{ backgroundColor: `${cmeta.color}1a`, color: cmeta.color, borderColor: `${cmeta.color}55` }}
                >
                  {cmeta.emoji} {chip.label}
                </span>
              );
            })}
          </div>
        )}
        {hasImages && (
          <button
            type="button"
            onClick={() => onOpen(images, credential.title)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-200 self-start"
          >
            {t('education.viewDiploma')}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default function CertificationsView({ credentials, categories }: CertificationsViewProps) {
  const { t } = useI18n();
  const dataLabel = useDataLabel();
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    const topicCats = categories.filter((c) => c.type === 'topic');
    const topicIds = new Set(topicCats.map((c) => c.id));
    const certs = credentials.filter((c) => !c.categories.includes(FORMAL_EDUCATION));
    const primaryTopic = (c: Credential) => c.categories.find((id) => topicIds.has(id)) ?? null;
    return topicCats
      .map((cat) => ({
        cat,
        items: certs
          .filter((c) => primaryTopic(c) === cat.id)
          .sort((a, b) => b.year - a.year || b.numericId - a.numericId),
      }))
      .filter((g) => g.items.length > 0);
  }, [credentials, categories]);

  const allIds = useMemo(() => groups.map((g) => g.cat.id), [groups]);
  const allExpanded = expanded.size === allIds.length && allIds.length > 0;

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100">{t('nav.diplomas')}</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t('certifications.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(allExpanded ? new Set() : new Set(allIds))}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-slate-800 border border-cyan-200/70 dark:border-slate-600 hover:bg-cyan-100 dark:hover:bg-slate-700"
        >
          {allExpanded ? t('certifications.collapseAll') : t('certifications.expandAll')}
        </button>
      </div>

      <div className="space-y-3">
        {groups.map((group) => {
          const meta = getCategoryMeta(group.cat.id);
          const isOpen = expanded.has(group.cat.id);
          const label = dataLabel('categories', group.cat.id, group.cat.label);
          return (
            <div key={group.cat.id}>
              <button
                type="button"
                onClick={() => toggle(group.cat.id)}
                aria-expanded={isOpen}
                style={{ borderLeftColor: meta.color, borderLeftWidth: 4 }}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-sm hover:border-cyan-300 dark:hover:border-slate-600 transition-colors"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg flex-shrink-0" aria-hidden>{meta.emoji}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate">{label}</span>
                  <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700">
                    {group.items.length}
                  </span>
                </span>
                <svg
                  className={`w-5 h-5 flex-shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {isOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3 mb-2">
                  {group.items.map((credential) => (
                    <CertCard
                      key={credential.id}
                      credential={credential}
                      categories={categories}
                      onOpen={(images, title) => setLightbox({ images, title })}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lightbox && <DiplomaLightbox images={lightbox.images} title={lightbox.title} onClose={() => setLightbox(null)} />}
    </div>
  );
}
