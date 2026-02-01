/**
 * Wallpaper overlay for credential views (segment/detail).
 * Covers full area, semi-transparent over the existing background. Only used in dragonball theme.
 */
const WALLPAPER_URLS = [
  '/images/wallpapers/wallpaper-0.jpg',
  '/images/wallpapers/wallpaper-1.jpg',
  '/images/wallpapers/wallpaper-2.png',
  '/images/wallpapers/wallpaper-3.jpg',
  '/images/wallpapers/wallpaper-4.png',
  '/images/wallpapers/wallpaper-5.jpg',
  '/images/wallpapers/wallpaper-6.jpg',
  '/images/wallpapers/wallpaper-7.jpg',
  '/images/wallpapers/wallpaper-8.jpg',
  '/images/wallpapers/wallpaper-9.jpg',
  '/images/wallpapers/wallpaper-10.gif',
];

export function getWallpaperUrl(credentialIndex: number): string {
  return WALLPAPER_URLS[credentialIndex % WALLPAPER_URLS.length] ?? WALLPAPER_URLS[0];
}

export type CredentialWallpaperProps = {
  /** Index of credential (or first credential in segment) in the full list; used to pick one of 11 wallpapers. */
  credentialIndex: number;
  /** Opacity of the overlay (0–1). Default 0.18. */
  opacity?: number;
};

export default function CredentialWallpaper({ credentialIndex, opacity = 0.18 }: CredentialWallpaperProps) {
  const url = getWallpaperUrl(credentialIndex);
  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-none"
      aria-hidden
    >
      <img
        src={url}
        alt=""
        className="w-full h-full object-cover"
        style={{ opacity }}
      />
    </div>
  );
}
