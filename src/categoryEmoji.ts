/**
 * Emoji identifier per specialization area (topic-type category id), used to classify diplomas.
 * Keys match the ids in public/data/categories.json. Geographic categories are not covered here.
 */
const CATEGORY_EMOJI: Record<string, string> = {
  'formal-education': '🎓',
  'standardized-management-systems-iso': '📋',
  'technology-it': '💻',
  'non-destructive-testing-ndt': '🔬',
  'first-aid-and-rescue': '🚑',
  'radiological-safety': '☢️',
  'safety-management': '🦺',
  'project-management': '📊',
  'professional-skills-leadership': '🤝',
  'construction-management': '🏗️',
  'logistics-and-operations-management': '🚚',
  'operations-and-maintenance-management': '⚙️',
  'vocational-technical-training': '🛠️',
  'electrical-and-electronics': '⚡',
};

export function getCategoryEmoji(id: string): string | null {
  return CATEGORY_EMOJI[id] ?? null;
}
