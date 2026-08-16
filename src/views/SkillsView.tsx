import { useMemo, useState } from 'react';
import type { SkillGroup } from '../types';
import { useI18n } from '../i18n';

type SkillsViewProps = {
  groups: SkillGroup[];
};

const GROUP_EMOJI: Record<string, string> = {
  'quality-iso': '📋',
  'safety-radiological': '🦺',
  'inspection-ndt': '🔬',
  'electrical-electronics-smarthome': '⚡',
  'project-planning': '📊',
  'site-operations': '⚙️',
  logistics: '🚚',
  'construction-ici': '🏗️',
  leadership: '🤝',
  'information-technology': '💻',
};

const ACCENTS = [
  { text: 'text-accent-cyan', bg: 'bg-accent-cyan/10', borderL: 'border-l-accent-cyan', dot: 'bg-accent-cyan' },
  { text: 'text-accent-teal', bg: 'bg-accent-teal/10', borderL: 'border-l-accent-teal', dot: 'bg-accent-teal' },
  { text: 'text-accent-gold', bg: 'bg-accent-gold/10', borderL: 'border-l-accent-gold', dot: 'bg-accent-gold' },
];

export default function SkillsView({ groups }: SkillsViewProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(groups[0] ? [groups[0].id] : []));

  const totalSkills = useMemo(() => groups.reduce((sum, g) => sum + g.skills.length, 0), [groups]);
  const allIds = useMemo(() => groups.map((g) => g.id), [groups]);
  const allExpanded = expanded.size === allIds.length && allIds.length > 0;

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-1.5">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-ink">{t('skills.title')}</h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5 whitespace-nowrap">{t('skills.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(allExpanded ? new Set() : new Set(allIds))}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-accent-cyan bg-surface-elevated border border-stroke hover:bg-white/5 flex-shrink-0"
        >
          {allExpanded ? t('skills.collapseAll') : t('skills.expandAll')}
        </button>
      </div>
      <p className="text-[11px] text-ink-muted mb-4">
        {t('skills.count', { groups: groups.length, skills: totalSkills })}
      </p>

      <div className="space-y-3">
        {groups.map((group, i) => {
          const isOpen = expanded.has(group.id);
          const accent = ACCENTS[i % ACCENTS.length];
          const emoji = GROUP_EMOJI[group.id];
          return (
            <div
              key={group.id}
              className={`rounded-xl border border-stroke ${accent.borderL} border-l-4 bg-surface backdrop-blur-md shadow-soft overflow-hidden`}
            >
              <button
                type="button"
                onClick={() => toggle(group.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4 text-left hover:bg-white/5 transition-colors"
              >
                {emoji && (
                  <span className={`flex items-center justify-center w-9 h-9 rounded-lg text-base flex-shrink-0 ${accent.bg}`} aria-hidden>
                    {emoji}
                  </span>
                )}
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold text-ink text-sm sm:text-base leading-snug">{group.title}</span>
                  {group.basis && (
                    <span className="block text-[11px] sm:text-xs text-ink-muted mt-0.5 truncate">{group.basis}</span>
                  )}
                </span>
                <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${accent.text} ${accent.bg}`}>
                  {group.skills.length}
                </span>
                <svg
                  className={`w-5 h-5 flex-shrink-0 text-ink-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {isOpen && (
                <ul className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 border-t border-stroke space-y-3 animate-fade-in-up">
                  {group.skills.map((skill) => (
                    <li key={skill.name} className="flex gap-2.5 pt-3 first:pt-3">
                      <span className={`mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${accent.dot}`} aria-hidden />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink leading-snug">{skill.name}</p>
                        <p className="text-xs sm:text-[13px] text-ink-secondary mt-0.5 leading-relaxed">{skill.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
