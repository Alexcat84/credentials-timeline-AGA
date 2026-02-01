import { memo } from 'react';
import { getSimpleBezierPath, BaseEdge, type EdgeProps } from '@xyflow/react';

/**
 * Edge que solo muestra la etiqueta (y área de clic). Se usa en modo fun cuando
 * el cuerpo de Shen Long se dibuja como un path continuo en DragonPathOverlay.
 */
function ShenlongLabelOnlyEdge({
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

  return (
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
  );
}

export default memo(ShenlongLabelOnlyEdge);
