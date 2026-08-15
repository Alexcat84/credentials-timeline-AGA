/**
 * Small inline SVG flags for the geographic categories. Flag emoji (regional indicator
 * sequences) render as plain "SV"/"CO"/"CA" text on Windows/Chromium instead of an actual
 * flag glyph, so we draw them ourselves for reliable cross-platform rendering.
 */
type FlagProps = { className?: string };

const DEFAULT_CLASS = 'inline-block w-4 h-[11px] rounded-[1.5px] align-[-1.5px] flex-shrink-0 ring-1 ring-white/15';

function ElSalvadorFlag({ className = DEFAULT_CLASS }: FlagProps) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden>
      <rect width="24" height="16" fill="#0047AB" />
      <rect y="5.33" width="24" height="5.34" fill="#fff" />
    </svg>
  );
}

function ColombiaFlag({ className = DEFAULT_CLASS }: FlagProps) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden>
      <rect width="24" height="16" fill="#FCD116" />
      <rect y="8" width="24" height="4" fill="#003893" />
      <rect y="12" width="24" height="4" fill="#CE1126" />
    </svg>
  );
}

function CanadaFlag({ className = DEFAULT_CLASS }: FlagProps) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden>
      <rect width="24" height="16" fill="#fff" />
      <rect width="6" height="16" fill="#FF0000" />
      <rect x="18" width="6" height="16" fill="#FF0000" />
    </svg>
  );
}

const FLAGS: Record<string, (props: FlagProps) => JSX.Element> = {
  'el-salvador': ElSalvadorFlag,
  colombia: ColombiaFlag,
  'canada-ontario': CanadaFlag,
};

export function getCountryFlag(id: string): ((props: FlagProps) => JSX.Element) | null {
  return FLAGS[id] ?? null;
}
