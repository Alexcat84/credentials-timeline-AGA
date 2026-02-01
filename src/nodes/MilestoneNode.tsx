import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Credential } from '../types';

export type MilestoneNodeData = {
  credential: Credential;
  isCurrent?: boolean;
};

function MilestoneNode({ data, selected }: NodeProps) {
  const { credential, isCurrent } = (data ?? {}) as MilestoneNodeData;
  const title = credential.title.length > 48 ? credential.title.slice(0, 48) + '…' : credential.title;

  return (
    <div
      className={`
        relative min-w-[280px] max-w-[320px] rounded-2xl p-5
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

      <div className="flex items-start gap-4">
        <div
          className={`
            flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold
            bg-gradient-to-br from-cyan-400 to-teal-500 text-slate-900 shadow-lg
            ${isCurrent ? 'ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-800' : ''}
          `}
        >
          {credential.year}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-100 text-sm leading-tight">
            {title}
          </h3>
          <p className="text-slate-400 text-xs mt-1 truncate">
            {credential.institution}
          </p>
          {credential.duration && (
            <p className="text-slate-500 text-xs mt-1">{credential.duration}</p>
          )}
        </div>
      </div>

      {isCurrent && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 animate-pulse" />
      )}
    </div>
  );
}

export default memo(MilestoneNode);
