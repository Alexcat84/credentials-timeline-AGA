import type { Credential, Category } from './types';

export type ProfileStats = {
  diplomas: number;
  years: number;
  countries: number;
  categories: number;
};

/** Parse "1991-2026" → span in years (35). Falls back to credential year range. */
function yearsFromRecordPeriod(recordPeriod: string | undefined, credentials: Credential[]): number {
  const match = recordPeriod?.match(/(\d{4})\D+(\d{4})/);
  if (match) {
    const span = Number(match[2]) - Number(match[1]);
    if (span > 0) return span;
  }
  const years = credentials.map((c) => c.year).filter((y) => Number.isFinite(y));
  if (years.length === 0) return 0;
  return Math.max(...years) - Math.min(...years);
}

/** Aggregate headline numbers for the landing hero. */
export function computeStats(
  credentials: Credential[],
  categories: Category[],
  recordPeriod?: string
): ProfileStats {
  const geoIds = new Set(categories.filter((c) => c.type === 'geographic').map((c) => c.id));
  const topicIds = new Set(categories.filter((c) => c.type === 'topic').map((c) => c.id));

  const usedCountries = new Set<string>();
  const usedTopics = new Set<string>();
  for (const cred of credentials) {
    for (const catId of cred.categories) {
      if (geoIds.has(catId)) usedCountries.add(catId);
      if (topicIds.has(catId)) usedTopics.add(catId);
    }
  }

  return {
    diplomas: credentials.length,
    years: yearsFromRecordPeriod(recordPeriod, credentials),
    countries: usedCountries.size,
    categories: usedTopics.size,
  };
}
