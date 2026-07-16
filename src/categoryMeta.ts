/**
 * Visual metadata (accent color + emoji icon) per category id.
 * Used to give the filter, chips and detail view visual hierarchy instead of a single flat cyan.
 * Keys match the ids in public/data/categories.json.
 */
export type CategoryMeta = { color: string; emoji: string };

const CATEGORY_META: Record<string, CategoryMeta> = {
  'formal-education': { color: '#6366f1', emoji: '🎓' },
  'standardized-management-systems-iso': { color: '#0ea5e9', emoji: '📋' },
  'technology-it': { color: '#06b6d4', emoji: '💻' },
  'non-destructive-testing-ndt': { color: '#8b5cf6', emoji: '🔬' },
  'first-aid-and-rescue': { color: '#ef4444', emoji: '🚑' },
  'radiological-safety': { color: '#f59e0b', emoji: '☢️' },
  'safety-management': { color: '#f97316', emoji: '🦺' },
  'project-management': { color: '#3b82f6', emoji: '📊' },
  'professional-skills-leadership': { color: '#d946ef', emoji: '🤝' },
  'construction-management': { color: '#b45309', emoji: '🏗️' },
  'logistics-and-operations-management': { color: '#14b8a6', emoji: '🚚' },
  'operations-and-maintenance-management': { color: '#10b981', emoji: '⚙️' },
  'vocational-technical-training': { color: '#65a30d', emoji: '🛠️' },
  'electrical-and-electronics': { color: '#eab308', emoji: '⚡' },
  'el-salvador': { color: '#0ea5e9', emoji: '🇸🇻' },
  colombia: { color: '#eab308', emoji: '🇨🇴' },
  'canada-ontario': { color: '#ef4444', emoji: '🇨🇦' },
};

const DEFAULT_META: CategoryMeta = { color: '#64748b', emoji: '📄' };

export function getCategoryMeta(id: string): CategoryMeta {
  return CATEGORY_META[id] ?? DEFAULT_META;
}
