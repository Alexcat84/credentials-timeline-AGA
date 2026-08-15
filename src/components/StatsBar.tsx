import { useEffect, useRef, useState } from 'react';
import type { ProfileStats } from '../stats';
import { useI18n } from '../i18n';

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

/** Count from 0 to target with an ease-out, after an entrance delay. Respects reduced-motion. */
function useCountUp(target: number, durationMs = 1200, startDelay = 500): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }
    let start = 0;
    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / durationMs);
      setValue(Math.round(easeOutCubic(p) * target));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(step);
    }, startDelay);
    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs, startDelay]);

  return value;
}

function StatItem({ value, label, suffix, delay }: { value: number; label: string; suffix?: string; delay: number }) {
  const display = useCountUp(value, 1200, delay);
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-stroke bg-surface backdrop-blur px-3 py-3 sm:px-4 sm:py-4 shadow-soft">
      <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-accent-cyan to-accent-teal bg-clip-text text-transparent tabular-nums">
        {display}{suffix}
      </span>
      <span className="mt-1 text-[10px] sm:text-xs font-medium text-ink-secondary text-center leading-tight uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

/** Animated headline numbers for the landing hero. */
export default function StatsBar({ stats }: { stats: ProfileStats }) {
  const { t } = useI18n();
  const items = [
    { value: stats.diplomas, label: t('landing.stats.diplomas'), suffix: '', delay: 550 },
    { value: stats.years, label: t('landing.stats.years'), suffix: '', delay: 650 },
    { value: stats.countries, label: t('landing.stats.countries'), suffix: '', delay: 750 },
    { value: stats.categories, label: t('landing.stats.categories'), suffix: '', delay: 850 },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-lg mx-auto">
      {items.map((it) => (
        <StatItem key={it.label} value={it.value} label={it.label} suffix={it.suffix} delay={it.delay} />
      ))}
    </div>
  );
}
