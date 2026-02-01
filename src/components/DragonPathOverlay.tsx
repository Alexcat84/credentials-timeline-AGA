import { useRef, useLayoutEffect, useState, useMemo } from 'react';
import { useNodes, useViewport, getSimpleBezierPath, Position } from '@xyflow/react';

const SHENLONG_STRIP_URL = '/images/dragon-balls/shenlong-body-strip.svg';
const BODY_STROKE_WIDTH = 56;
const NODE_CENTER = 50;
const BBOX_PADDING = 30;
const MASK_ID = 'shenlong-full-path-mask';

type DragonPathOverlayProps = {
  /** Orden de los nodos (ids de milestones) para construir el path de cola a cabeza */
  milestoneIds: string[];
};

/**
 * Dibuja un único Shen Long continuo a lo largo de todo el timeline (sin cortes entre segmentos).
 * Usa useNodes y useViewport para construir un path que pasa por todos los nodos en orden.
 */
export default function DragonPathOverlay({ milestoneIds }: DragonPathOverlayProps) {
  const nodes = useNodes();
  const viewport = useViewport();
  const pathRef = useRef<SVGPathElement>(null);
  const [bbox, setBbox] = useState<SVGRect | null>(null);

  const orderedNodes = useMemo(() => {
    return milestoneIds
      .map((id) => nodes.find((n) => n.id === id))
      .filter((n): n is (typeof nodes)[0] => n != null);
  }, [milestoneIds, nodes]);

  const fullPathD = useMemo(() => {
    if (orderedNodes.length < 2) return '';
    const pathParts: string[] = [];
    for (let i = 0; i < orderedNodes.length - 1; i++) {
      const source = orderedNodes[i];
      const target = orderedNodes[i + 1];
      const sourceX = source.position.x + NODE_CENTER;
      const sourceY = source.position.y + NODE_CENTER;
      const targetX = target.position.x + NODE_CENTER;
      const targetY = target.position.y + NODE_CENTER;
      const [pathD] = getSimpleBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
      pathParts.push(pathD);
    }
    return pathParts.join(' ');
  }, [orderedNodes]);

  useLayoutEffect(() => {
    const el = pathRef.current;
    if (!el || !fullPathD) return;
    const rect = el.getBBox();
    setBbox({
      x: rect.x - BODY_STROKE_WIDTH / 2 - BBOX_PADDING,
      y: rect.y - BODY_STROKE_WIDTH / 2 - BBOX_PADDING,
      width: rect.width + BODY_STROKE_WIDTH + BBOX_PADDING * 2,
      height: rect.height + BODY_STROKE_WIDTH + BBOX_PADDING * 2,
    });
  }, [fullPathD]);

  if (orderedNodes.length < 2 || !fullPathD) return null;

  const { x, y, zoom } = viewport;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <mask id={MASK_ID}>
            <path
              ref={pathRef}
              d={fullPathD}
              fill="none"
              stroke="white"
              strokeWidth={BODY_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </mask>
        </defs>
        <g transform={`translate(${x}, ${y}) scale(${zoom})`}>
          {bbox && (
            <image
              href={SHENLONG_STRIP_URL}
              x={bbox.x}
              y={bbox.y}
              width={bbox.width}
              height={bbox.height}
              preserveAspectRatio="none"
              mask={`url(#${MASK_ID})`}
            />
          )}
        </g>
      </svg>
    </div>
  );
}
