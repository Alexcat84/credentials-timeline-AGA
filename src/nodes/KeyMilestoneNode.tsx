import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Milestone } from '../types';

export type KeyMilestoneNodeData = {
  milestone: Milestone;
  isCurrent?: boolean;
};

function KeyMilestoneNode({ data, selected }: NodeProps) {
  const { milestone, isCurrent } = (data ?? {}) as KeyMilestoneNodeData;

  return (
    <div
      className={`
        relative min-w-[260px] max-w-[300px] rounded-2xl p-5
        bg-slate-800/90 backdrop-blur-xl
        border-2 transition-all duration-300 ease-out
        shadow-xl hover:shadow-2xl hover:scale-[1.02]
        ${isCurrent
          ? 'border-cyan-400 shadow-cyan-500/20 ring-2 ring-cyan-400/30'
          : selected
            ? 'border-teal-400/80'
            : 'border-slate-600/60 hover:border-slate-500'
        }
      `}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-teal-400 !border-2 !border-slate-900" />

      <div className="flex items-center gap-4">
        <div
          className={`
            flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold
            bg-gradient-to-br from-cyan-400 to-teal-500 text-slate-900 shadow-lg
            ${isCurrent ? 'ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-800' : ''}
          `}
        >
          {milestone.year}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-100 text-sm leading-tight">
            {milestone.label}
          </h3>
        </div>
      </div>

      {isCurrent && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 animate-pulse" />
      )}
    </div>
  );
}

export default memo(KeyMilestoneNode);
