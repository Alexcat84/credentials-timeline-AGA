import { useState, useMemo } from 'react';
import type { Credential, Category } from '../types';
import { useI18n, useDataLabel } from '../i18n';
import { getCategoryMeta } from '../categoryMeta';

const ALL_CATEGORIES = '';
const ALL_LOCATIONS = '';

type FilterViewProps = {
  credentials: Credential[];
  categories: Category[];
  /** Controlled filter: category id (empty = all). Lifted so it persists when navigating to detail and back. */
  selectedCategoryId: string;
  selectedLocationId: string;
  onCategoryChange: (id: string) => void;
  onLocationChange: (id: string) => void;
  /** Open the diploma/detail view for this credential (e.g. from Filter, opens detail and back returns to filter). */
  onCredentialClick?: (credential: Credential) => void;
};

/** Primary topic category of a credential (first topic id present), used for the card accent color. */
function primaryTopicId(cred: Credential, topicIds: Set<string>): string | null {
  return cred.categories.find((id) => topicIds.has(id)) ?? cred.categories[0] ?? null;
}

export default function FilterView({
  credentials,
  categories,
  selectedCategoryId,
  selectedLocationId,
  onCategoryChange,
  onLocationChange,
  onCredentialClick,
}: FilterViewProps) {
  const { t } = useI18n();
  const dataLabel = useDataLabel();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const catLabel = (cat: Category) => dataLabel('categories', cat.id, cat.label);

  const topicCategories = useMemo(() => categories.filter((c) => c.type === 'topic'), [categories]);
  const geoCategories = useMemo(() => categories.filter((c) => c.type === 'geographic'), [categories]);
  const topicIds = useMemo(() => new Set(topicCategories.map((c) => c.id)), [topicCategories]);

  const getCount = (catId: string) => credentials.filter((c) => c.categories.includes(catId)).length;

  const filtered = useMemo(() => {
    return credentials.filter((c) => {
      const matchCategory = selectedCategoryId === ALL_CATEGORIES || c.categories.includes(selectedCategoryId);
      const matchLocation = selectedLocationId === ALL_LOCATIONS || c.categories.includes(selectedLocationId);
      return matchCategory && matchLocation;
    });
  }, [credentials, selectedCategoryId, selectedLocationId]);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)] min-h-0 bg-gradient-to-b from-cyan-50/50 to-teal-50/50 dark:from-slate-900 dark:to-slate-950 rounded-xl sm:rounded-2xl p-3 sm:p-4">
      <div className="flex-shrink-0">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100">{t('filter.title')}</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t('filter.subtitle')}</p>
      </div>
      {/* Dropdowns: celestito style */}
      <div className="flex flex-wrap items-end gap-3 sm:gap-4 flex-shrink-0">
        <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[200px]">
          <label htmlFor="filter-category" className="text-cyan-700 dark:text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            {t('filter.category')}
          </label>
          <select
            id="filter-category"
            value={selectedCategoryId}
            onChange={(e) => {
              onCategoryChange(e.target.value);
              setExpandedId(null);
            }}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-cyan-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 shadow-sm"
          >
            <option value={ALL_CATEGORIES}>{t('filter.allCategories')}</option>
            {topicCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {getCategoryMeta(cat.id).emoji} {catLabel(cat)} ({getCount(cat.id)})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[200px]">
          <label htmlFor="filter-location" className="text-cyan-700 dark:text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            {t('filter.location')}
          </label>
          <select
            id="filter-location"
            value={selectedLocationId}
            onChange={(e) => {
              onLocationChange(e.target.value);
              setExpandedId(null);
            }}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-cyan-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 shadow-sm"
          >
            <option value={ALL_LOCATIONS}>{t('filter.allLocations')}</option>
            {geoCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {getCategoryMeta(cat.id).emoji} {catLabel(cat)} ({getCount(cat.id)})
              </option>
            ))}
          </select>
        </div>
        <p className="text-cyan-800 dark:text-cyan-200 text-sm font-semibold ml-auto self-center px-3 py-1.5 rounded-lg bg-cyan-100/80 dark:bg-cyan-900/40 border border-cyan-200/60 dark:border-cyan-700/50">
          {t('filter.count', { count: filtered.length })}
        </p>
      </div>

      {/* Credential grid: celestito cards */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => {
            const accentId = primaryTopicId(c, topicIds);
            const accent = accentId ? getCategoryMeta(accentId).color : '#22d3ee';
            const expanded = expandedId === c.id;
            return (
              <div
                key={c.id}
                style={{ borderLeftColor: accent, borderLeftWidth: 4 }}
                className={`rounded-xl border-2 p-4 text-left transition-all flex flex-col ${
                  expanded
                    ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-slate-800 dark:to-slate-800 ring-2 ring-cyan-400/40 shadow-lg'
                    : 'border-cyan-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-cyan-400 hover:shadow-md'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : c.id)}
                  className="w-full text-left flex-shrink-0"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md"
                      style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
                    >
                      {c.year}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm break-words line-clamp-2">
                        {c.title}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 break-words line-clamp-2">
                        {c.institution}
                      </div>
                    </div>
                  </div>
                </button>
                {expanded && (
                  <div className="mt-3 pt-3 border-t border-cyan-200/60 dark:border-slate-700 flex flex-col flex-1 min-h-[88px]">
                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 break-words flex-shrink-0">
                      <p>{c.location} · {c.date ?? c.year}</p>
                      {c.duration && <p>{t('filter.duration', { value: c.duration })}</p>}
                      {c.notes && <p className="mt-2 whitespace-pre-wrap line-clamp-3">{c.notes}</p>}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.categories.map((catId) => {
                          const cat = categories.find((x) => x.id === catId);
                          if (!cat) return null;
                          const meta = getCategoryMeta(catId);
                          return (
                            <span
                              key={catId}
                              className="px-2 py-0.5 rounded-lg text-xs font-medium border"
                              style={{ backgroundColor: `${meta.color}1a`, color: meta.color, borderColor: `${meta.color}55` }}
                            >
                              {meta.emoji} {catLabel(cat)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    {onCredentialClick && (
                      <div className="mt-3 pt-3 border-t border-cyan-200/50 dark:border-slate-700 flex justify-start flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCredentialClick(c);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-sm hover:from-cyan-400 hover:to-teal-400 transition-all"
                        >
                          {t('filter.viewDiploma')} →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
