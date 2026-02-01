import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Milestone } from '../types';

export type GokuPlacement = 'above' | 'below' | 'left' | 'right';

export type CircleMilestoneNodeData = {
  milestone: Milestone;
  isCurrent?: boolean;
  /** Modo Dragon Ball: imagen de Goku (PNG sin fondo). Solo se muestra si está definida. */
  gokuImageUrl?: string;
  gokuPosition?: GokuPlacement;
  gokuSize?: number;
};

function CircleMilestoneNode({ data, selected }: NodeProps) {
  const { milestone, isCurrent, gokuImageUrl, gokuPosition = 'below', gokuSize = 90 } = (data ?? {}) as CircleMilestoneNodeData;

  const imageBlock =
    gokuImageUrl ? (
      <div className="flex-shrink-0 flex items-center justify-center" style={{ maxWidth: gokuSize, maxHeight: gokuSize * 1.5 }}>
        <img
          src={gokuImageUrl}
          alt=""
          className="w-full h-auto object-contain pointer-events-none"
          style={{ maxWidth: gokuSize, maxHeight: gokuSize * 1.5 }}
        />
      </div>
    ) : null;

  const core = (
    <>
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-slate-900" />
      <div
        className={`
          flex flex-col items-center justify-center rounded-full
          w-[72px] h-[72px] flex-shrink-0
          bg-slate-800/95 backdrop-blur border-2 transition-all duration-300
          shadow-lg hover:shadow-xl hover:scale-110
          ${isCurrent
            ? 'border-cyan-400 shadow-cyan-500/30 ring-2 ring-cyan-400/40'
            : selected
              ? 'border-teal-400'
              : 'border-slate-600/70 hover:border-slate-500'
          }
        `}
      >
        <span className="text-lg font-bold text-white leading-tight">
          {milestone.year}
        </span>
      </div>
      <span
        className={`
          text-xs font-medium text-center max-w-[100px] leading-tight
          ${isCurrent ? 'text-cyan-300' : 'text-slate-400'}
        `}
      >
        {milestone.label}
      </span>
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-teal-400 !border-2 !border-slate-900" />
    </>
  );

  if (gokuImageUrl && (gokuPosition === 'left' || gokuPosition === 'right')) {
    return (
      <div className={`flex items-center gap-2 ${gokuPosition === 'left' ? 'flex-row' : 'flex-row-reverse'}`}>
        {imageBlock}
        <div className="flex flex-col items-center gap-2">{core}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {gokuPosition === 'above' && imageBlock}
      {core}
      {gokuPosition === 'below' && imageBlock}
    </div>
  );
}

export default memo(CircleMilestoneNode);
