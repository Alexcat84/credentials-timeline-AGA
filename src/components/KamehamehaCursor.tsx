import { useEffect, useRef, useState } from 'react';

const TRAIL_LENGTH = 10;
const MAX_TRAIL_PIXELS = 140;
const THROTTLE_MS = 32; // ~30fps for trail updates
const TRAIL_IDLE_MS = 180; // Clear trail shortly after cursor stops moving
const HEAD_WIDTH = 28; // Same as main ball (esfera principal)
const TAIL_WIDTH = 3;  // Colita at the end

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Perpendicular unit vector to segment (p0 -> p1), pointing "left" of the direction. */
function perpendicular(p0: { x: number; y: number }, p1: { x: number; y: number }) {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: dx / len };
}

export default function KamehamehaCursor() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [trail, setTrail] = useState<Array<{ x: number; y: number }>>([]);
  const lastUpdate = useRef(0);
  const raf = useRef<number>(0);
  const idleTimeout = useRef<ReturnType<typeof setTimeout>>(0);

  useEffect(() => {
    const clearTrailAfterIdle = () => {
      setTrail([]);
    };

    const handleMove = (e: MouseEvent) => {
      clearTimeout(idleTimeout.current);
      idleTimeout.current = setTimeout(clearTrailAfterIdle, TRAIL_IDLE_MS);

      const now = Date.now();
      if (now - lastUpdate.current < THROTTLE_MS) return;
      lastUpdate.current = now;

      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
        setTrail((prev) => {
          const next = [...prev, { x: e.clientX, y: e.clientY }];
          if (next.length > TRAIL_LENGTH) return next.slice(-TRAIL_LENGTH);
          return next;
        });
      });
    };

    document.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      document.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(raf.current);
      clearTimeout(idleTimeout.current);
    };
  }, []);

  if (position === null) return null;

  const rawPoints = trail.length > 0 ? [...trail, position] : [];
  // Limit trail length: keep only points within MAX_TRAIL_PIXELS of head (walk backward along path)
  let pathPoints = rawPoints;
  if (rawPoints.length >= 2) {
    let cut = rawPoints.length - 1;
    let acc = 0;
    for (let i = rawPoints.length - 2; i >= 0; i--) {
      acc += distance(rawPoints[i], rawPoints[i + 1]);
      if (acc <= MAX_TRAIL_PIXELS) cut = i;
      else break;
    }
    pathPoints = rawPoints.slice(cut);
  }

  const tail = pathPoints[0];
  const head = pathPoints[pathPoints.length - 1];
  const numPoints = pathPoints.length;

  // Single smooth ribbon: one filled polygon from tail (narrow) to head (full ball width). No segment steps = no pixelation.
  let ribbonPath = '';
  if (numPoints >= 2 && tail && head) {
    const left: Array<{ x: number; y: number }> = [];
    const right: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      const halfW = (TAIL_WIDTH + (HEAD_WIDTH - TAIL_WIDTH) * t) / 2;
      const prev = pathPoints[Math.max(0, i - 1)];
      const next = pathPoints[Math.min(numPoints - 1, i + 1)];
      const perp = perpendicular(prev, next);
      const p = pathPoints[i];
      left.push({ x: p.x - perp.x * halfW, y: p.y - perp.y * halfW });
      right.push({ x: p.x + perp.x * halfW, y: p.y + perp.y * halfW });
    }
    const leftStr = left.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const rightStr = right.reverse().map((p, i) => `L ${p.x} ${p.y}`).join(' ');
    ribbonPath = `${leftStr} ${rightStr} Z`;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden
    >
      {/* Comet trail: one smooth filled ribbon (ball width at head, colita at tail). No segment boundaries = smooth. */}
      {ribbonPath && tail && head && (
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ width: '100vw', height: '100vh' }}
          shapeRendering="geometricPrecision"
        >
          <defs>
            <linearGradient
              id="kamehameha-comet-gradient"
              gradientUnits="userSpaceOnUse"
              x1={tail.x}
              y1={tail.y}
              x2={head.x}
              y2={head.y}
            >
              <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0" />
              <stop offset="15%" stopColor="rgb(34, 211, 238)" stopOpacity="0.12" />
              <stop offset="40%" stopColor="rgb(34, 211, 238)" stopOpacity="0.35" />
              <stop offset="70%" stopColor="rgb(34, 211, 238)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0.9" />
            </linearGradient>
            <filter id="kamehameha-comet-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d={ribbonPath}
            fill="url(#kamehameha-comet-gradient)"
            filter="url(#kamehameha-comet-soft)"
          />
        </svg>
      )}
      {/* Ball with constant flame: flame layer (animated) + ball on top */}
      <div
        className="absolute"
        style={{
          left: position.x,
          top: position.y,
          width: HEAD_WIDTH,
          height: HEAD_WIDTH,
          marginLeft: -HEAD_WIDTH / 2,
          marginTop: -HEAD_WIDTH / 2,
        }}
      >
        {/* Constant blue flame — same size as ball, flickering */}
        <div
          className="absolute inset-0 rounded-full kamehameha-flame"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.7) 0%, rgba(6, 182, 212, 0.4) 40%, transparent 70%)',
            boxShadow: '0 0 14px 7px rgba(34, 211, 238, 0.5), inset 0 0 8px 4px rgba(34, 211, 238, 0.3)',
          }}
        />
        {/* Main ball */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(34, 211, 238, 0.8) 30%, rgba(6, 182, 212, 0.4) 55%, transparent 75%)',
            boxShadow: '0 0 24px 12px rgba(34, 211, 238, 0.5), 0 0 48px 24px rgba(6, 182, 212, 0.25)',
          }}
        />
      </div>
    </div>
  );
}
