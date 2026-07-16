import { useState, useCallback, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';
import type { Credential, Category } from '../types';
import type { LandingTheme } from './ThemeChoiceView';
import CredentialWallpaper from '../components/CredentialWallpaper';
import { useI18n, useDataLabel } from '../i18n';
import { getCategoryMeta } from '../categoryMeta';

/** md = 768px; móvil = viewport < 768. */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mql.matches);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);
  return isMobile;
}

export type DetailViewProps = {
  credential: Credential;
  credentialIndex: number;
  categories: Category[];
  onBack: () => void;
  backLabel?: string;
  theme?: LandingTheme | null;
};

export default function DetailView({ credential, credentialIndex, categories, onBack, backLabel = 'Back to segment', theme }: DetailViewProps) {
  const { t } = useI18n();
  const dataLabel = useDataLabel();
  const isMobile = useIsMobile();
  const [imageIndex, setImageIndex] = useState(0);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
  const [imageNaturalSize, setImageNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchContentRef | null>(null);
  const initialScaleRef = useRef<number | null>(null);

  const images = credential.imageUrls ?? [];
  const hasImages = images.length > 0;
  const currentImageSrc = hasImages ? images[imageIndex] : '';

  useEffect(() => {
    setImageNaturalSize(null);
    initialScaleRef.current = null;
  }, [imageIndex, currentImageSrc]);

  useEffect(() => {
    if (isMobile) initialScaleRef.current = null;
  }, [isMobile]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  const fitScale =
    containerSize && imageNaturalSize && imageNaturalSize.w > 0 && imageNaturalSize.h > 0
      ? Math.min(containerSize.w / imageNaturalSize.w, containerSize.h / imageNaturalSize.h)
      : 1;
  const readyForZoom = Boolean(imageNaturalSize && containerSize);

  const categoryChips = credential.categories
    .map((id) => {
      const cat = categories.find((c) => c.id === id);
      return cat ? { id, label: dataLabel('categories', id, cat.label) } : null;
    })
    .filter(Boolean) as { id: string; label: string }[];

  if (!isMobile) {
    return (
      <div className="relative flex-1 w-full min-h-0 flex flex-col overflow-hidden">
        {theme === 'dragonball' && <CredentialWallpaper credentialIndex={credentialIndex >= 0 ? credentialIndex : 0} />}
        <div className="relative z-10 flex-1 w-full min-h-0 flex flex-col md:flex-row gap-0 overflow-hidden bg-gradient-to-br from-cyan-50/90 via-white to-teal-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
          <div className="flex-1 min-h-0 flex flex-col rounded-2xl overflow-hidden border border-cyan-200/60 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 shadow-inner">
            <div className="p-3 border-b border-cyan-200/60 dark:border-slate-700 bg-gradient-to-r from-cyan-100/80 to-teal-100/80 dark:from-slate-800 dark:to-slate-800">
              <h2 className="text-sm font-semibold text-cyan-900 dark:text-cyan-200">{t('detail.diplomaCertificate')}</h2>
            </div>
            <div className="flex-1 min-h-0 flex flex-col p-3 sm:p-4 overflow-hidden min-h-[200px]">
              {hasImages ? (
                <>
                  <div ref={containerRef} className="flex-1 min-h-[min(40vh,280px)] sm:min-h-0 w-full flex flex-col" style={{ minHeight: 0 }}>
                    <div className="flex-1 min-h-[min(40vh,260px)] sm:min-h-0 w-full overflow-hidden flex items-center justify-center">
                      {readyForZoom ? (
                        <TransformWrapper
                          key={currentImageSrc}
                          ref={transformRef}
                          initialScale={fitScale}
                          minScale={fitScale}
                          maxScale={Math.max(4, fitScale * 4)}
                          centerOnInit
                          limitToBounds
                          panning={{ velocityDisabled: true }}
                          doubleClick={{ disabled: true }}
                          wheel={{ step: 0.2 }}
                        >
                          <TransformComponent
                            wrapperStyle={{ width: '100%', height: '100%', minHeight: 0 }}
                            contentStyle={{
                              width: imageNaturalSize!.w,
                              height: imageNaturalSize!.h,
                            }}
                          >
                            <img
                              src={currentImageSrc}
                              alt={t('detail.imageAlt', { title: credential.title, n: imageIndex + 1 })}
                              onLoad={handleImageLoad}
                              draggable={false}
                              style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
                              className="rounded-xl shadow-lg border border-cyan-200/50 select-none"
                            />
                          </TransformComponent>
                        </TransformWrapper>
                      ) : (
                        <img
                          src={currentImageSrc}
                          alt={t('detail.imageAlt', { title: credential.title, n: imageIndex + 1 })}
                          onLoad={handleImageLoad}
                          draggable={false}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          className="rounded-xl shadow-lg border border-cyan-200/50 select-none"
                        />
                      )}
                    </div>
                  </div>
                  {images.length > 1 && (
                    <div className="flex-shrink-0 flex items-center gap-2 flex-wrap justify-center pt-3 group/controls">
                      <button
                        type="button"
                        onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
                        disabled={imageIndex === 0}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-cyan-500/0 text-cyan-800/70 dark:text-cyan-300/70 hover:bg-cyan-500 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-cyan-500/0"
                      >
                        ← {t('common.prev')}
                      </button>
                      <span className="text-cyan-800/70 dark:text-cyan-300/70 text-sm font-medium group-hover/controls:text-cyan-800 transition-colors">
                        {imageIndex + 1} / {images.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setImageIndex((i) => Math.min(images.length - 1, i + 1))}
                        disabled={imageIndex === images.length - 1}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-cyan-500/0 text-cyan-800/70 dark:text-cyan-300/70 hover:bg-cyan-500 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-cyan-500/0"
                      >
                        {t('common.next')} →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center text-cyan-700/80 dark:text-cyan-300/70 text-sm max-w-md px-4 gap-3">
                  <svg className="w-12 h-12 text-cyan-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <p className="font-medium">{t('detail.emptyState')}</p>
                </div>
              )}
            </div>
          </div>

          <aside className="w-full md:w-[380px] flex-shrink-0 flex flex-col border-l border-cyan-200/60 dark:border-slate-700 bg-gradient-to-b from-white to-cyan-50/50 dark:from-slate-900 dark:to-slate-950 shadow-xl overflow-hidden max-h-[calc(100vh-56px)]">
            <div className="p-4 border-b border-cyan-200/60 dark:border-slate-700 bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">{t('detail.credentialDetail')}</h2>
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-cyan-700 shadow-md hover:bg-cyan-50 hover:shadow-lg border border-white/80 transition-all flex items-center gap-2"
              >
                ← {backLabel}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">{t('detail.year')}</span>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">{credential.year}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">{t('detail.title')}</span>
                <p className="text-slate-800 dark:text-slate-100 mt-0.5 font-medium">{credential.title}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">{t('detail.institution')}</span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">{credential.institution}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">{t('detail.location')}</span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">{credential.location}</p>
              </div>
              {credential.date && (
                <div>
                  <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">{t('detail.date')}</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5">{credential.date}</p>
                </div>
              )}
              {credential.duration && (
                <div>
                  <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">{t('detail.duration')}</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5">{credential.duration}</p>
                </div>
              )}
              {credential.notes && (
                <div>
                  <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">{t('detail.notes')}</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5 text-sm">{credential.notes}</p>
                </div>
              )}
              {categoryChips.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">{t('detail.categories')}</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {categoryChips.map((chip) => {
                      const meta = getCategoryMeta(chip.id);
                      return (
                        <span
                          key={chip.id}
                          className="px-2 py-1 rounded-lg text-xs font-medium border"
                          style={{ backgroundColor: `${meta.color}1a`, color: meta.color, borderColor: `${meta.color}55` }}
                        >
                          {meta.emoji} {chip.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  const scaleToUse = initialScaleRef.current ?? 1;
  if (containerSize && imageNaturalSize && imageNaturalSize.w > 0 && imageNaturalSize.h > 0 && !initialScaleRef.current) {
    initialScaleRef.current = Math.min(containerSize.w / imageNaturalSize.w, containerSize.h / imageNaturalSize.h);
  }

  return (
    <div className="relative flex-1 w-full min-h-0 flex flex-col overflow-hidden">
      {theme === 'dragonball' && <CredentialWallpaper credentialIndex={credentialIndex >= 0 ? credentialIndex : 0} />}
      <div className="relative z-10 flex-1 w-full min-h-0 flex flex-col overflow-hidden bg-gradient-to-br from-cyan-50/90 via-white to-teal-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-cyan-200/60 dark:border-slate-700 bg-gradient-to-r from-cyan-500 to-teal-500">
          <h2 className="text-sm font-semibold text-white">{t('detail.credentialDetail')}</h2>
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-2 rounded-xl text-sm font-semibold bg-white text-cyan-700 shadow-md"
          >
            ← {backLabel}
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 border-b border-cyan-200/40 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60">
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{credential.title}</p>
          <p className="text-slate-700 dark:text-slate-300 text-sm">{credential.institution} · {credential.year}</p>
          {credential.date && <p className="text-slate-600 dark:text-slate-400 text-xs">{credential.date}</p>}
          {categoryChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categoryChips.map((chip) => {
                const meta = getCategoryMeta(chip.id);
                return (
                  <span
                    key={chip.id}
                    className="px-2 py-0.5 rounded text-xs font-medium border"
                    style={{ backgroundColor: `${meta.color}1a`, color: meta.color, borderColor: `${meta.color}55` }}
                  >
                    {meta.emoji} {chip.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <section className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div
            ref={containerRef}
            className="flex-1 min-h-[55vh] w-full flex flex-col items-center justify-center p-4 overflow-visible bg-slate-100/50"
          >
            {hasImages ? (
              readyForZoom ? (
                <div className="touch-none w-full flex-1 min-h-[50vh]" style={{ touchAction: 'none' }}>
                  <TransformWrapper
                    key={currentImageSrc}
                    initialScale={scaleToUse}
                    minScale={scaleToUse * 0.5}
                    maxScale={scaleToUse * 4}
                    centerOnInit
                    limitToBounds={false}
                    doubleClick={{ disabled: true }}
                    panning={{ disabled: false }}
                    ref={transformRef}
                  >
                    <TransformComponent
                      wrapperStyle={{ width: '100%', height: '100%', minHeight: '50vh' }}
                      contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <img
                        src={currentImageSrc}
                        alt={t('detail.diplomaAlt', { n: imageIndex + 1, total: images.length })}
                        width={imageNaturalSize?.w}
                        height={imageNaturalSize?.h}
                        className="block select-none object-contain"
                        style={{ maxWidth: 'none', maxHeight: 'none' }}
                        draggable={false}
                        onLoad={handleImageLoad}
                      />
                    </TransformComponent>
                  </TransformWrapper>
                </div>
              ) : (
                <div className="w-full min-h-[50vh] flex items-center justify-center">
                  <img
                    src={currentImageSrc}
                    alt={t('detail.diplomaAlt', { n: imageIndex + 1, total: images.length })}
                    className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
                    onLoad={handleImageLoad}
                  />
                </div>
              )
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm">{t('detail.noImage')}</p>
            )}
          </div>
          {hasImages && images.length > 1 && (
            <div className="flex items-center justify-center gap-2 py-3 px-4 border-t border-cyan-200/60 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 shrink-0 touch-manipulation">
              <button
                type="button"
                onClick={() => setImageIndex((i) => (i <= 0 ? i : i - 1))}
                disabled={imageIndex === 0}
                className="px-3 py-1.5 rounded-lg bg-cyan-100 dark:bg-slate-700 text-cyan-800 dark:text-cyan-200 text-sm font-medium hover:bg-cyan-200 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
              >
                ← {t('common.prev')}
              </button>
              <span className="text-xs text-slate-600 dark:text-slate-400">{imageIndex + 1} / {images.length}</span>
              <button
                type="button"
                onClick={() => setImageIndex((i) => (i >= images.length - 1 ? i : i + 1))}
                disabled={imageIndex === images.length - 1}
                className="px-3 py-1.5 rounded-lg bg-cyan-100 dark:bg-slate-700 text-cyan-800 dark:text-cyan-200 text-sm font-medium hover:bg-cyan-200 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
              >
                {t('common.next')} →
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
