import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useShowEditControls } from '../hooks/useShowEditControls';
import type { Profile } from '../types';
import type { LandingTheme } from './ThemeChoiceView';

type LandingViewProps = {
  theme: LandingTheme;
  profile: Profile;
  onEnter: () => void;
  onChangeExperience?: () => void;
};

const STORAGE_KEY = 'landing-dragon-balls-positions';
const LINE_STORAGE_KEY = 'landing-line-path';

/** 4 puntos de la línea celeste. viewBox con margen para que los de la izquierda no se recorten. Path: M p0 Q p1 p2 T p3 */
const VIEWBOX_PADDING = 80;
const DEFAULT_LINE_POINTS = [
  { x: 50 + VIEWBOX_PADDING, y: 200 },
  { x: 150 + VIEWBOX_PADDING, y: 80 },
  { x: 250 + VIEWBOX_PADDING, y: 200 },
  { x: 450 + VIEWBOX_PADDING, y: 200 },
];

function loadSavedLinePoints(): { x: number; y: number }[] {
  try {
    const s = typeof localStorage !== 'undefined' ? localStorage.getItem(LINE_STORAGE_KEY) : null;
    if (!s) return DEFAULT_LINE_POINTS.map((p) => ({ ...p }));
    const parsed = JSON.parse(s) as { x: number; y: number }[];
    if (!Array.isArray(parsed) || parsed.length !== 4) return DEFAULT_LINE_POINTS.map((p) => ({ ...p }));
    return parsed.map((p) => ({ x: Number(p.x), y: Number(p.y) }));
  } catch {
    return DEFAULT_LINE_POINTS.map((p) => ({ ...p }));
  }
}

/** Tamaños originales (grandes) de cada esfera. */
const BALL_SIZES: Record<number, number> = {
  1: 480,
  2: 410,
  3: 380,
  4: 450,
  5: 350,
  6: 400,
  7: 370,
};

const STARS_LIST = [1, 2, 3, 4, 5, 6, 7] as const;

/** Posiciones por defecto en % (left, top) para que no se monten y queden en márgenes. */
const DEFAULT_POSITIONS: Record<number, { left: number; top: number }> = {
  1: { left: 2, top: 2 },
  2: { left: 78, top: 2 },
  3: { left: 2, top: 35 },
  4: { left: 75, top: 28 },
  5: { left: 2, top: 72 },
  6: { left: 75, top: 72 },
  7: { left: 78, top: 55 },
};

function loadSavedPositions(): Record<number, { left: number; top: number }> {
  try {
    const s = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!s) return { ...DEFAULT_POSITIONS };
    const parsed = JSON.parse(s) as Record<string, { left: number; top: number }>;
    const out: Record<number, { left: number; top: number }> = { ...DEFAULT_POSITIONS };
    STARS_LIST.forEach((stars) => {
      const key = String(stars);
      if (parsed[key] && typeof parsed[key].left === 'number' && typeof parsed[key].top === 'number') {
        out[stars] = { left: parsed[key].left, top: parsed[key].top };
      }
    });
    return out;
  } catch {
    return { ...DEFAULT_POSITIONS };
  }
}

export default function LandingView({ theme, profile, onEnter, onChangeExperience }: LandingViewProps) {
  const showEditControls = useShowEditControls();
  const [layoutLocked, setLayoutLocked] = useState(true);
  const [positions, setPositions] = useState<Record<number, { left: number; top: number }>>(loadSavedPositions);
  const [linePoints, setLinePoints] = useState<{ x: number; y: number }[]>(loadSavedLinePoints);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineSvgRef = useRef<SVGSVGElement>(null);
  const linePathRef = useRef<SVGPathElement>(null);

  const [pathLength, setPathLength] = useState<number | null>(null);
  const [glowPoint, setGlowPoint] = useState<{ x: number; y: number } | null>(null);
  const LINE_DRAW_DURATION_MS = 2500;
  /** Mapeo gravedad: tiempo normalizado [0,1] -> longitud del path, para velocidad variable (lento subiendo, rápido bajando + impulso en izquierda) */
  const gravityMapRef = useRef<{ tNorm: number[]; s: number[] } | null>(null);

  type DragState = {
    stars: number;
    startLeft: number;
    startTop: number;
    startClientX: number;
    startClientY: number;
  };
  const [dragState, setDragState] = useState<DragState | null>(null);

  type LineDragState = { index: number; startX: number; startY: number; startClientX: number; startClientY: number };
  const [lineDragState, setLineDragState] = useState<LineDragState | null>(null);

  const handleLockLayout = useCallback(() => {
    const toStore: Record<string, { left: number; top: number }> = {};
    STARS_LIST.forEach((stars) => {
      toStore[String(stars)] = positions[stars] ?? DEFAULT_POSITIONS[stars];
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      localStorage.setItem(LINE_STORAGE_KEY, JSON.stringify(linePoints));
    } catch {
      // ignore
    }
    setLayoutLocked(true);
    setDragState(null);
    setLineDragState(null);
  }, [positions, linePoints]);

  const handleUnlockLayout = useCallback(() => {
    setLayoutLocked(false);
  }, []);

  useEffect(() => {
    if (!dragState || !containerRef.current) return;
    const container = containerRef.current;
    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w <= 0 || h <= 0) return;
      const dx = ((e.clientX - dragState.startClientX) / w) * 100;
      const dy = ((e.clientY - dragState.startClientY) / h) * 100;
      const left = dragState.startLeft + dx;
      const top = dragState.startTop + dy;
      setPositions((prev) => ({
        ...prev,
        [dragState.stars]: { left, top },
      }));
    };
    const onUp = () => setDragState(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragState]);

  useEffect(() => {
    if (!lineDragState || !lineSvgRef.current) return;
    const svg = lineSvgRef.current;
    const index = lineDragState.index;
    const onMove = (e: MouseEvent) => {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const m = svg.getScreenCTM()?.inverse();
      if (!m) return;
      const svgPt = pt.matrixTransform(m);
      const x = Math.max(0, Math.min(400 + VIEWBOX_PADDING * 2, svgPt.x));
      const y = Math.max(0, Math.min(400, svgPt.y));
      setLinePoints((prev) => {
        const next = prev.map((p) => ({ ...p }));
        next[index] = { x, y };
        return next;
      });
    };
    const onUp = () => setLineDragState(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [lineDragState]);

  const isDraggable = showEditControls && !layoutLocked;

  const isDragonBall = theme === 'dragonball';

  /** Posiciones en pantalla de los 4 puntos de la línea (para capa encima de las esferas) */
  const [circleScreenPositions, setCircleScreenPositions] = useState<{ x: number; y: number }[] | null>(null);

  useLayoutEffect(() => {
    if (isDragonBall || !isDraggable || !lineSvgRef.current) {
      setCircleScreenPositions(null);
      return;
    }
    const svg = lineSvgRef.current;
    const update = () => {
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const positions = linePoints.map((p) => {
        const pt = svg.createSVGPoint();
        pt.x = p.x;
        pt.y = p.y;
        const screen = pt.matrixTransform(ctm);
        return { x: screen.x, y: screen.y };
      });
      setCircleScreenPositions(positions);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isDragonBall, isDraggable, linePoints]);

  /* Longitud del path (modo pro) para el resplandor */
  useLayoutEffect(() => {
    if (isDragonBall || !linePathRef.current) return;
    const L = linePathRef.current.getTotalLength();
    setPathLength(L);
    setGlowPoint(null);
  }, [isDragonBall, linePoints]);

  /* Tras la animación del trazo: círculo de luz recorre la línea ida y vuelta con gravedad (lento subiendo, rápido bajando, impulso en izquierda) */
  useEffect(() => {
    if (pathLength == null || isDragonBall) return;
    const pathEl = linePathRef.current;
    if (!pathEl) return;

    /* Construir mapeo gravedad: tiempo normalizado -> longitud s. Velocidad alta al bajar (y grande), baja al subir (y pequeño); impulso en s=0. */
    const N = 64;
    const sSamples: number[] = [];
    const ySamples: number[] = [];
    for (let i = 0; i <= N; i++) {
      const s = (i / N) * pathLength;
      sSamples.push(s);
      const pt = pathEl.getPointAtLength(s);
      ySamples.push(pt.y);
    }
    const yMin = Math.min(...ySamples);
    const yMax = Math.max(...ySamples);
    const yRange = yMax - yMin || 1;
    const speedFactors: number[] = [];
    for (let i = 0; i <= N; i++) {
      const s = sSamples[i];
      const y = ySamples[i];
      const gravityFactor = 1 + 0.7 * (y - yMin) / yRange;
      const impulseFactor = 1.4 - 0.4 * (s / pathLength);
      speedFactors.push(gravityFactor * impulseFactor);
    }
    const tCumul: number[] = [0];
    for (let i = 0; i < N; i++) {
      const ds = sSamples[i + 1] - sSamples[i];
      const dt = ds / speedFactors[i];
      tCumul.push(tCumul[tCumul.length - 1] + dt);
    }
    const tTotal = tCumul[tCumul.length - 1];
    const tNorm = tCumul.map((t) => t / tTotal);
    gravityMapRef.current = { tNorm, s: sSamples };

    function progressToS(progress: number): number {
      const map = gravityMapRef.current;
      if (!map || map.tNorm.length === 0) return progress * (pathLength ?? 0);
      const { tNorm, s } = map;
      let i = 0;
      while (i < tNorm.length - 1 && tNorm[i + 1] < progress) i++;
      if (i >= tNorm.length - 1) return s[s.length - 1];
      const t0 = tNorm[i];
      const t1 = tNorm[i + 1];
      const frac = (progress - t0) / (t1 - t0);
      return s[i] + frac * (s[i + 1] - s[i]);
    }

    const startAt = LINE_DRAW_DURATION_MS;
    const durationMs = 2200;
    const cycleMs = durationMs * 2;
    const startTime = { current: 0 };
    let rafId: number;
    const timeoutId = window.setTimeout(() => {
      const run = (t: number) => {
        if (startTime.current === 0) startTime.current = t;
        const elapsed = t - startTime.current;
        const phase = (elapsed % cycleMs) / cycleMs;
        const progress = phase < 0.5 ? phase * 2 : 2 - phase * 2;
        const s = phase < 0.5 ? progressToS(progress) : pathLength - progressToS(1 - progress);
        const pt = pathEl.getPointAtLength(s);
        setGlowPoint({ x: pt.x, y: pt.y });
        rafId = requestAnimationFrame(run);
      };
      rafId = requestAnimationFrame(run);
    }, startAt);
    return () => {
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(rafId!);
    };
  }, [pathLength, isDragonBall]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-900">
      {/* Shen Long: solo en tema Dragon Ball */}
      {isDragonBall && (
        <img
          src="/images/dragon-balls/ShengLong.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-[0.12]"
          aria-hidden
        />
      )}

      {/* 7 Dragon Balls: solo en tema Dragon Ball, encima de la línea celeste */}
      {isDragonBall && (
        <div
          ref={containerRef}
          className="absolute inset-0 z-10"
          style={{ pointerEvents: isDraggable ? 'auto' : 'none' }}
          aria-hidden={!isDraggable}
        >
          {STARS_LIST.map((stars) => {
            const pos = positions[stars] ?? DEFAULT_POSITIONS[stars];
            const sizePx = BALL_SIZES[stars];
            /* Duraciones y retrasos distintos por esfera, un poco más lentos */
            const duration = 3.4 + (stars * 0.18) + ((stars % 3) * 0.22);
            const delay = (stars * 0.7) % 4;
            return (
              <img
                key={stars}
                src={`/images/dragon-balls/dragon-ball-${stars}.svg`}
                alt=""
                draggable={false}
                className="absolute object-contain drop-shadow-xl select-none"
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  width: sizePx,
                  height: sizePx,
                  maxWidth: 'min(480px, 42vw)',
                  maxHeight: 'min(480px, 42vh)',
                  cursor: isDraggable ? (dragState?.stars === stars ? 'grabbing' : 'grab') : undefined,
                  pointerEvents: isDraggable ? 'auto' : 'none',
                  animation: `dragon-ball-breathe ${duration}s ease-in-out ${delay}s infinite`,
                }}
                onMouseDown={
                  isDraggable
                    ? (e) => {
                        e.preventDefault();
                        setDragState({
                          stars,
                          startLeft: pos.left,
                          startTop: pos.top,
                          startClientX: e.clientX,
                          startClientY: e.clientY,
                        });
                      }
                    : undefined
                }
              />
            );
          })}
        </div>
      )}

      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-slate-700/30 blur-3xl" />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Animated path: solo en modo formal (pro); puntos editables con Unlock */}
      {!isDragonBall && (() => {
        const [p0, p1, p2, p3] = linePoints;
        const pathD = p0 && p1 && p2 && p3
          ? `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y} T ${p3.x} ${p3.y}`
          : `M ${50 + VIEWBOX_PADDING} 200 Q ${150 + VIEWBOX_PADDING} 80 ${250 + VIEWBOX_PADDING} 200 T ${450 + VIEWBOX_PADDING} 200`;
        return (
          <svg
            ref={lineSvgRef}
            className={`absolute inset-0 w-full h-full opacity-30 ${isDraggable ? 'pointer-events-auto' : 'pointer-events-none'}`}
            viewBox={`0 0 ${400 + VIEWBOX_PADDING * 2} 400`}
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              ref={linePathRef}
              d={pathD}
              fill="none"
              stroke="url(#landingGradient)"
              strokeWidth="2"
              className="path-draw pointer-events-none"
            />
            {/* Círculo de luz radiante que recorre la línea */}
            {glowPoint != null && (
              <g className="pointer-events-none">
                <circle
                  cx={glowPoint.x}
                  cy={glowPoint.y}
                  r={10}
                  fill="url(#landingRadialGlow)"
                  filter="url(#landingRadiantFilter)"
                />
                {/* Destellos alrededor del círculo */}
                <circle cx={glowPoint.x + 5} cy={glowPoint.y - 3} r={1} fill="#fff" filter="url(#landingSparkleFilter)" className="sparkle-twinkle" style={{ animationDelay: '0s' }} />
                <circle cx={glowPoint.x - 3} cy={glowPoint.y + 4} r={0.8} fill="#a5f3fc" filter="url(#landingSparkleFilter)" className="sparkle-twinkle" style={{ animationDelay: '0.2s' }} />
                <circle cx={glowPoint.x + 3} cy={glowPoint.y + 3} r={0.7} fill="#e0f7fa" filter="url(#landingSparkleFilter)" className="sparkle-twinkle" style={{ animationDelay: '0.4s' }} />
              </g>
            )}
            <defs>
              <linearGradient id="landingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#2dd4bf" />
              </linearGradient>
              <radialGradient id="landingRadialGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="35%" stopColor="#ffffff" stopOpacity="0.98" />
                <stop offset="55%" stopColor="#e0f7fa" stopOpacity="0.9" />
                <stop offset="80%" stopColor="#67e8f9" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.15" />
              </radialGradient>
              <filter id="landingRadiantFilter" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="glow" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="glow2" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="glow2" />
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="landingSparkleFilter" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="sparkle" />
                <feMerge>
                  <feMergeNode in="sparkle" />
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>
        );
      })()}

      {/* Overlay de círculos de control de la línea: solo modo pro, encima de todo (z-20) */}
      {!isDragonBall && isDraggable && circleScreenPositions && circleScreenPositions.length === 4 && (
        <div className="fixed inset-0 z-20 pointer-events-none" aria-hidden>
          <div className="absolute inset-0 pointer-events-auto">
            {circleScreenPositions.map((pos, i) => (
              <div
                key={i}
                className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-grab active:cursor-grabbing border-2 border-cyan-400/90 bg-cyan-400/60 hover:bg-cyan-400/80 select-none"
                style={{ left: pos.x, top: pos.y }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLineDragState({
                    index: i,
                    startX: linePoints[i].x,
                    startY: linePoints[i].y,
                    startClientX: e.clientX,
                    startClientY: e.clientY,
                  });
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit controls: Lock / Unlock (?edit=1): en fun para esferas, en pro para línea */}
      {showEditControls && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {layoutLocked ? (
            <button
              type="button"
              onClick={handleUnlockLayout}
              className="px-3 py-2 rounded-xl text-sm font-medium bg-amber-500/90 text-slate-900 hover:bg-amber-400 border border-amber-400/80 shadow-lg"
            >
              Unlock layout
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLockLayout}
              className="px-3 py-2 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-400 border border-emerald-400/80 shadow-lg"
            >
              Lock layout
            </button>
          )}
        </div>
      )}

      <div className="relative z-10 text-center px-6 max-w-2xl">
        <p className="text-cyan-400 font-medium text-sm uppercase tracking-widest mb-3 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Educational & Professional Journey
        </p>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {profile.shortName ?? profile.name}
        </h1>
        <p className="text-slate-300 text-lg mb-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {profile.title}
        </p>
        <p className="text-slate-300 text-sm mb-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {profile.recordPeriod} · Interactive timeline
        </p>
        <button
          type="button"
          onClick={onEnter}
          className="px-8 py-4 rounded-2xl font-semibold text-slate-900 bg-gradient-to-r from-cyan-400 to-teal-400 shadow-xl shadow-cyan-500/30 hover:from-cyan-300 hover:to-teal-300 hover:shadow-2xl hover:scale-105 transition-all duration-300 opacity-0 animate-fade-in-up focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          style={{ animationDelay: '0.5s' }}
        >
          Explore my journey →
        </button>
      </div>

      {onChangeExperience && (
        <button
          type="button"
          onClick={onChangeExperience}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-slate-500 text-sm hover:text-slate-400 underline underline-offset-2 transition-colors"
        >
          Change presentation mode
        </button>
      )}
    </div>
  );
}
