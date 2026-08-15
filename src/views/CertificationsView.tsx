import { useMemo, useState } from 'react';
import type { Credential, Category } from '../types';
import { useI18n, useDataLabel } from '../i18n';
import { getCategoryEmoji } from '../categoryEmoji';
import { getCountryFlag } from '../components/CountryFlag';
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
    <div className="rounded-xl border border-stroke bg-surface backdrop-blur-md shadow-soft overflow-hidden flex flex-col">
      {hasImages && (
        <button
          type="button"
          onClick={() => onOpen(images, credential.title)}
          aria-label={t('education.enlarge')}
          title={t('education.enlarge')}
          className="group relative w-full h-40 bg-bg1 overflow-hidden flex-shrink-0"
        >
          <img src={images[0]} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" draggable={false} />
          <div className="absolute inset-0 bg-bg0/0 group-hover:bg-bg0/40 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 rounded-full bg-white/90 text-bg0 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M11 8v6M8 11h6" /></svg>
            </span>
          </div>
          {images.length > 1 && (
            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-bg0/80 text-ink text-[10px] font-medium">
              {t('education.pages', { count: images.length })}
            </span>
          )}
        </button>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-cyan">{credential.year}</p>
        <h4 className="text-sm font-semibold text-ink leading-snug mt-0.5">{credential.title}</h4>
        <p className="text-xs font-medium text-accent-cyan mt-0.5">{credential.institution}</p>
        <p className="text-[11px] text-ink-muted mt-0.5">{metaLine}</p>
        {credential.notes && <p className="text-xs text-ink-secondary mt-2 line-clamp-3">{credential.notes}</p>}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-stroke">
            {chips.map((chip) => {
              const emoji = getCategoryEmoji(chip.id);
              const Flag = getCountryFlag(chip.id);
              return (
                <span
                  key={chip.id}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30"
                >
                  {Flag ? <Flag /> : emoji ? <span aria-hidden>{emoji}</span> : null}
                  {chip.label}
                </span>
              );
            })}
          </div>
        )}
        {hasImages && (
          <button
            type="button"
            onClick={() => onOpen(images, credential.title)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-cyan hover:text-accent-teal transition-colors self-start"
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
          <h2 className="text-lg sm:text-xl font-semibold text-ink">{t('certifications.title')}</h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">{t('certifications.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(allExpanded ? new Set() : new Set(allIds))}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-accent-cyan bg-surface-elevated border border-stroke hover:bg-white/5"
        >
          {allExpanded ? t('certifications.collapseAll') : t('certifications.expandAll')}
        </button>
      </div>

      <div className="space-y-3">
        {groups.map((group) => {
          const isOpen = expanded.has(group.cat.id);
          const label = dataLabel('categories', group.cat.id, group.cat.label);
          const emoji = getCategoryEmoji(group.cat.id);
          return (
            <div key={group.cat.id}>
              <button
                type="button"
                onClick={() => toggle(group.cat.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-l-4 border-stroke border-l-accent-cyan bg-surface backdrop-blur-md shadow-soft hover:border-accent-cyan/40 transition-colors"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  {emoji && <span className="text-lg flex-shrink-0" aria-hidden>{emoji}</span>}
                  <span className="font-semibold text-ink text-sm sm:text-base truncate">{label}</span>
                  <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium text-accent-cyan bg-accent-cyan/10">
                    {group.items.length}
                  </span>
                </span>
                <svg
                  className={`w-5 h-5 flex-shrink-0 text-ink-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
