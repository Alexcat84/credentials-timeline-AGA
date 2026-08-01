import { useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useI18n } from '../i18n';

type DiplomaLightboxProps = {
  images: string[];
  startIndex?: number;
  title: string;
  onClose: () => void;
};

/** Full-screen diploma viewer with zoom/pan and multi-image navigation. Reusable across sections. */
export default function DiplomaLightbox({ images, startIndex = 0, title, onClose }: DiplomaLightboxProps) {
  const { t } = useI18n();
  const [index, setIndex] = useState(startIndex);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') setIndex((i) => Math.min(images.length - 1, i + 1));
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  if (images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-slate-950/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0">
        <p className="text-sm font-medium text-white/90 truncate">{title}</p>
        <div className="flex items-center gap-3">
          {hasMultiple && <span className="text-xs text-white/60 tabular-nums">{index + 1} / {images.length}</span>}
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        <TransformWrapper
          key={images[index]}
          centerOnInit
          minScale={0.5}
          maxScale={5}
          wheel={{ step: 0.2 }}
          doubleClick={{ mode: 'toggle', step: 1.5 }}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <img
              src={images[index]}
              alt={t('detail.diplomaAlt', { n: index + 1, total: images.length })}
              className="max-w-full max-h-full object-contain select-none p-4"
              draggable={false}
            />
          </TransformComponent>
        </TransformWrapper>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              aria-label={t('common.prev')}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none backdrop-blur-sm border border-white/10"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(images.length - 1, i + 1))}
              disabled={index === images.length - 1}
              aria-label={t('common.next')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none backdrop-blur-sm border border-white/10"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-3 border-t border-white/10 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}`}
              aria-current={i === index}
              className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-colors ${i === index ? 'border-cyan-400' : 'border-white/15 hover:border-white/40'}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
