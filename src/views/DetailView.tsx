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
  /** Escala inicial congelada por imagen para que el zoom no se resetee al re-renderizar */
  const initialScaleRef = useRef<number | null>(null);

  const images = credential.imageUrls ?? [];
  const hasImages = images.length > 0;
  const currentImageSrc = hasImages ? images[imageIndex] : '';

  // Reset natural size and frozen scale when switching image
  useEffect(() => {
    setImageNaturalSize(null);
    initialScaleRef.current = null;
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

  // Escala inicial: que la imagen se VEA COMPLETA (contain), lo más grande que quepa en el contenedor
  const fitScale =
    containerSize && imageNaturalSize && imageNaturalSize.w > 0 && imageNaturalSize.h > 0
      ? Math.min(containerSize.w / imageNaturalSize.w, containerSize.h / imageNaturalSize.h)
      : 1;
  const readyForZoom = Boolean(imageNaturalSize && containerSize);
  // Congelar escala por imagen para que el zoom no vuelva a la inicial al re-renderizar
  if (readyForZoom && initialScaleRef.current === null) initialScaleRef.current = fitScale;
  const scaleToUse = initialScaleRef.current ?? fitScale;

  const categoryLabels = credential.categories
    .map((id) => categories.find((c) => c.id === id)?.label)
    .filter(Boolean) as string[];

  return (
    <div className="relative flex-1 w-full min-h-0 flex flex-col overflow-hidden">
      {theme === 'dragonball' && <CredentialWallpaper credentialIndex={credentialIndex >= 0 ? credentialIndex : 0} />}
      {/* Móvil: scroll; orden: info arriba (order-1), imágenes abajo en contenedor dedicado (order-2). Desktop: lado a lado, imagen izq (order-1), info der (order-2) */}
      <div className="relative z-10 flex-1 w-full min-h-0 flex flex-col md:flex-row gap-0 overflow-y-auto md:overflow-hidden bg-gradient-to-br from-cyan-50/90 via-white to-teal-50/80">
        {/* 1) Área de imágenes: en móvil abajo (order-2) como contenedor exclusivo; en desktop a la izquierda (order-1) */}
        <section
          className="order-2 md:order-1 flex-1 min-h-0 flex flex-col w-full md:min-w-0 border-t md:border-t-0 md:border-r border-cyan-200/60 bg-white/80 pb-20"
          aria-label="Diploma images"
        >
          <div className="px-4 py-2.5 border-b border-cyan-200/60 bg-cyan-100/80 md:bg-cyan-50/80">
            <h2 className="text-sm font-semibold text-cyan-800">Diploma / Certificate</h2>
          </div>
          {/* Contenedor exclusivo para imágenes: en móvil altura mínima para que al hacer scroll se vean bien */}
          <div
            ref={containerRef}
            className="flex-1 min-h-[60vh] md:min-h-0 w-full flex flex-col items-center justify-center p-4 overflow-hidden bg-slate-100/50"
          >
            {hasImages ? (
              readyForZoom ? (
                <TransformWrapper
                  key={currentImageSrc}
                  initialScale={scaleToUse}
                  minScale={scaleToUse * 0.5}
                  maxScale={scaleToUse * 4}
                  centerOnInit
                  doubleClick={{ disabled: true }}
                  ref={transformRef}
                >
                  <TransformComponent
                    wrapperStyle={{ width: '100%', height: '100%', minHeight: 'min(60vh, 400px)' }}
                    contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {/* Imagen a tamaño natural para que el transform la escale correctamente y se vea completa */}
                    <img
                      src={currentImageSrc}
                      alt={`Diploma ${imageIndex + 1} of ${images.length}`}
                      width={imageNaturalSize?.w}
                      height={imageNaturalSize?.h}
                      className="block select-none object-contain"
                      style={{ maxWidth: 'none', maxHeight: 'none' }}
                      draggable={false}
                      onLoad={handleImageLoad}
                    />
                  </TransformComponent>
                </TransformWrapper>
              ) : (
                <img
                  src={currentImageSrc}
                  alt={`Diploma ${imageIndex + 1} of ${images.length}`}
                  className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
                  onLoad={handleImageLoad}
                />
              )
            ) : (
              <p className="text-slate-500 text-sm">No image available</p>
            )}
          </div>
          {hasImages && images.length > 1 && (
            <div className="flex items-center justify-center gap-2 py-3 px-4 border-t border-cyan-200/60 bg-white/80 shrink-0 touch-manipulation">
              <button
                type="button"
                onClick={() => setImageIndex((i) => (i <= 0 ? images.length - 1 : i - 1))}
                className="px-3 py-1.5 rounded-lg bg-cyan-100 text-cyan-800 text-sm font-medium hover:bg-cyan-200"
                aria-label="Previous image"
              >
                ← Prev
              </button>
              <span className="text-xs text-slate-600">
                {imageIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={() => setImageIndex((i) => (i >= images.length - 1 ? 0 : i + 1))}
                className="px-3 py-1.5 rounded-lg bg-cyan-100 text-cyan-800 text-sm font-medium hover:bg-cyan-200"
                aria-label="Next image"
              >
                Next →
              </button>
            </div>
          )}
        </section>

        {/* 2) Credential detail: en móvil arriba, en desktop a la derecha */}
        <aside className="order-1 md:order-2 w-full md:w-[380px] flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-l border-cyan-200/60 bg-gradient-to-b from-white to-cyan-50/50 shadow-xl overflow-hidden">
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
