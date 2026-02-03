import { useState, useCallback, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';
import type { Credential, Category } from '../types';
import type { LandingTheme } from './ThemeChoiceView';
import CredentialWallpaper from '../components/CredentialWallpaper';

export type DetailViewProps = {
  credential: Credential;
  credentialIndex: number;
  categories: Category[];
  onBack: () => void;
  /** e.g. "Back to segment" or "Back to filter" */
  backLabel?: string;
  theme?: LandingTheme | null;
};

export default function DetailView({ credential, credentialIndex, categories, onBack, backLabel = 'Back to segment', theme }: DetailViewProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
  const [imageNaturalSize, setImageNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchContentRef | null>(null);

  const images = credential.imageUrls ?? [];
  const hasImages = images.length > 0;
  const currentImageSrc = hasImages ? images[imageIndex] : '';

  // Reset natural size when switching image so we recalc on new load
  useEffect(() => {
    setImageNaturalSize(null);
  }, [imageIndex, currentImageSrc]);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  // Fit scale: image fits exactly in container (like Windows photo viewer)
  const fitScale =
    containerSize && imageNaturalSize && imageNaturalSize.w > 0 && imageNaturalSize.h > 0
      ? Math.min(containerSize.w / imageNaturalSize.w, containerSize.h / imageNaturalSize.h)
      : 1;

  // Only mount zoom when we have image dimensions so initialScale is correct from first frame
  const readyForZoom = Boolean(imageNaturalSize && containerSize);

  const categoryLabels = credential.categories
    .map((id) => categories.find((c) => c.id === id)?.label)
    .filter(Boolean) as string[];

  return (
    <div className="relative flex-1 w-full min-h-0 flex flex-col overflow-hidden">
      {theme === 'dragonball' && <CredentialWallpaper credentialIndex={credentialIndex >= 0 ? credentialIndex : 0} />}
      <div className="relative z-10 flex-1 w-full min-h-0 flex flex-col md:flex-row gap-0 overflow-hidden bg-gradient-to-br from-cyan-50/90 via-white to-teal-50/80">
      {/* Center: diploma image(s) */}
      <div className="flex-1 min-h-0 flex flex-col rounded-2xl overflow-hidden border border-cyan-200/60 bg-white/80 shadow-inner">
        <div className="p-3 border-b border-cyan-200/60 bg-gradient-to-r from-cyan-100/80 to-teal-100/80">
          <h2 className="text-sm font-semibold text-cyan-900">Diploma / Certificate</h2>
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
                        wrapperStyle={{
                          width: '100%',
                          height: '100%',
                          minHeight: 0,
                        }}
                        contentStyle={{
                          width: imageNaturalSize!.w,
                          height: imageNaturalSize!.h,
                        }}
                      >
                        <img
                          src={currentImageSrc}
                          alt={`${credential.title} – image ${imageIndex + 1}`}
                          onLoad={handleImageLoad}
                          draggable={false}
                          style={{
                            display: 'block',
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                          className="rounded-xl shadow-lg border border-cyan-200/50 select-none"
                        />
                      </TransformComponent>
                    </TransformWrapper>
                  ) : (
                    <img
                      src={currentImageSrc}
                      alt={`${credential.title} – image ${imageIndex + 1}`}
                      onLoad={handleImageLoad}
                      draggable={false}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                      }}
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
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-cyan-500/0 text-cyan-800/70 hover:bg-cyan-500 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-cyan-500/0"
                  >
                    ← Prev
                  </button>
                  <span className="text-cyan-800/70 text-sm font-medium group-hover/controls:text-cyan-800 transition-colors">
                    {imageIndex + 1} / {images.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setImageIndex((i) => Math.min(images.length - 1, i + 1))}
                    disabled={imageIndex === images.length - 1}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-cyan-500/0 text-cyan-800/70 hover:bg-cyan-500 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-cyan-500/0"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-cyan-700/80 text-sm max-w-md px-4">
              <p className="font-medium">Image(s) of this diploma or certificate will appear here.</p>
              <p className="mt-2 text-cyan-600/70">
                You can add <code className="bg-cyan-100/60 px-1 rounded">imageUrls</code> to the credential in the data; multiple images are supported.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right: credential detail */}
      <aside className="w-full md:w-[380px] flex-shrink-0 flex flex-col border-l border-cyan-200/60 bg-gradient-to-b from-white to-cyan-50/50 shadow-xl overflow-hidden max-h-[calc(100vh-56px)]">
        <div className="p-4 border-b border-cyan-200/60 bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Credential detail</h2>
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
            <span className="text-xs font-medium text-cyan-600 uppercase tracking-wider">Year</span>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{credential.year}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-cyan-600 uppercase tracking-wider">Title</span>
            <p className="text-slate-800 font-medium mt-0.5">{credential.title}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-cyan-600 uppercase tracking-wider">Institution</span>
            <p className="text-slate-600 text-sm mt-0.5">{credential.institution}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-cyan-600 uppercase tracking-wider">Location</span>
            <p className="text-slate-600 text-sm mt-0.5">{credential.location}</p>
          </div>
          {credential.date && (
            <div>
              <span className="text-xs font-medium text-cyan-600 uppercase tracking-wider">Date</span>
              <p className="text-slate-600 text-sm mt-0.5">{credential.date}</p>
            </div>
          )}
          {credential.duration && (
            <div>
              <span className="text-xs font-medium text-cyan-600 uppercase tracking-wider">Duration</span>
              <p className="text-slate-600 text-sm mt-0.5">{credential.duration}</p>
            </div>
          )}
          {credential.notes && (
            <div>
              <span className="text-xs font-medium text-cyan-600 uppercase tracking-wider">Notes</span>
              <p className="text-slate-600 text-sm mt-0.5 whitespace-pre-wrap">{credential.notes}</p>
            </div>
          )}
          {categoryLabels.length > 0 && (
            <div>
              <span className="text-xs font-medium text-cyan-600 uppercase tracking-wider">Categories</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {categoryLabels.map((label) => (
                  <span
                    key={label}
                    className="px-2.5 py-1 rounded-lg bg-cyan-100 text-cyan-800 text-xs font-medium border border-cyan-200/60"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
      </div>
    </div>
  );
}
