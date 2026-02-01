import { memo, useRef, useLayoutEffect, useState } from 'react';
import { getSimpleBezierPath, BaseEdge, type EdgeProps } from '@xyflow/react';

const SHENLONG_STRIP_URL = '/images/dragon-balls/shenlong-body-strip.svg';
const BODY_STROKE_WIDTH = 56;
const BBOX_PADDING = 30;

type BBox = { x: number; y: number; width: number; height: number };

/**
 * Edge que pinta el cuerpo de Shen Long (tira cola→cabeza) a lo largo del path entre nodos.
 * Usa máscara SVG para que la imagen se vea solo sobre el trazo (el patrón en stroke falla en muchos navegadores).
 */
function ShenlongBodyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  labelStyle,
  labelShowBg,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
  interactionWidth = 24,
}: EdgeProps) {
  const [path, labelX, labelY] = getSimpleBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const pathRef = useRef<SVGPathElement>(null);
  const [bbox, setBbox] = useState<BBox | null>(null);

  useLayoutEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const rect = el.getBBox();
    setBbox({
      x: rect.x - BODY_STROKE_WIDTH / 2 - BBOX_PADDING,
      y: rect.y - BODY_STROKE_WIDTH / 2 - BBOX_PADDING,
      width: rect.width + BODY_STROKE_WIDTH + BBOX_PADDING * 2,
      height: rect.height + BODY_STROKE_WIDTH + BBOX_PADDING * 2,
    });
  }, [path]);

  const maskId = `shenlong-mask-${id.replace(/[^a-z0-9-]/gi, '_')}`;

  return (
    <g>
      <defs>
        <mask id={maskId}>
          <path
            ref={pathRef}
            d={path}
            fill="none"
            stroke="white"
            strokeWidth={BODY_STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      {/* Imagen del cuerpo de Shen Long recortada por la máscara del path */}
      {bbox && (
        <image
          href={SHENLONG_STRIP_URL}
          x={bbox.x}
          y={bbox.y}
          width={bbox.width}
          height={bbox.height}
          preserveAspectRatio="none"
          mask={`url(#${maskId})`}
        />
      )}
      {/* BaseEdge: área de interacción y etiqueta */}
      <BaseEdge
        path={path}
        labelX={labelX}
        labelY={labelY}
        label={label}
        labelStyle={labelStyle}
        labelShowBg={labelShowBg}
        labelBgStyle={labelBgStyle}
        labelBgPadding={labelBgPadding}
        labelBgBorderRadius={labelBgBorderRadius}
        interactionWidth={interactionWidth}
        style={{ stroke: 'transparent', strokeWidth: interactionWidth }}
      />
    </g>
  );
}

export default memo(ShenlongBodyEdge);
