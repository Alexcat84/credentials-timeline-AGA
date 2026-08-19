/**
 * Small flag icons for the geographic categories, served as static SVG files
 * (public/flags/) sourced from the "flag-icons" project (MIT license, github.com/lipis/flag-icons)
 * — accurate, official flags including emblems (El Salvador's coat of arms, Canada's maple leaf).
 *
 * Flag emoji (regional indicator sequences) render as plain "SV"/"CA" text on
 * Windows/Chromium instead of an actual flag glyph, so we use these instead for
 * reliable, correct cross-platform rendering.
 */
type FlagProps = { className?: string };

const DEFAULT_CLASS = 'inline-block w-4 h-[11px] rounded-[1.5px] align-[-1.5px] flex-shrink-0 object-cover ring-1 ring-white/15';

const FLAG_SRC: Record<string, string> = {
  'el-salvador': '/flags/el-salvador.svg',
  colombia: '/flags/colombia.svg',
  'canada-ontario': '/flags/canada.svg',
  spain: '/flags/spain.svg',
};

const FLAG_ALT: Record<string, string> = {
  'el-salvador': 'El Salvador',
  colombia: 'Colombia',
  'canada-ontario': 'Canada',
  spain: 'Spain',
};

export function CountryFlag({ id, className = DEFAULT_CLASS }: { id: string } & FlagProps) {
  const src = FLAG_SRC[id];
  if (!src) return null;
  return <img src={src} alt="" title={FLAG_ALT[id]} className={className} />;
}

export function getCountryFlag(id: string): ((props: FlagProps) => JSX.Element) | null {
  if (!FLAG_SRC[id]) return null;
  return (props: FlagProps) => <CountryFlag id={id} {...props} />;
}
