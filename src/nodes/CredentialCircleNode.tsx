import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Credential } from '../types';

export type CredentialCircleNodeData = {
  credential: Credential;
  isCurrent?: boolean;
  /** When true, use larger circle and more text (segment view). */
  large?: boolean;
  /** Override for circle text (e.g. "2003 · 2" to avoid repeating year). When set, shown instead of credential.year. */
  circleLabel?: string;
};

function CredentialCircleNode({ data, selected }: NodeProps) {
  const { credential, isCurrent, large, circleLabel } = (data ?? {}) as CredentialCircleNodeData;
  const maxLen = large ? 42 : 28;
  const shortTitle = credential.title.length > maxLen ? credential.title.slice(0, maxLen) + '…' : credential.title;
  const circleText = circleLabel ?? String(credential.year);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-slate-900" />
      <div
        className={`
          flex items-center justify-center rounded-full flex-shrink-0 min-w-0
          ${large ? 'w-20 h-20 text-xs' : 'w-14 h-14 text-[10px]'}
          bg-slate-800/95 backdrop-blur border-2 transition-all duration-300
          shadow-md hover:shadow-lg hover:scale-110
          ${isCurrent
            ? 'border-cyan-400 shadow-cyan-500/30 ring-2 ring-cyan-400/40'
            : selected
              ? 'border-teal-400'
              : 'border-slate-600/70 hover:border-slate-500'
          }
        `}
      >
        <span className="font-bold text-white leading-none text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-0.5">
          {circleText}
        </span>
      </div>
      <span
        className={`font-medium text-center leading-tight line-clamp-2 ${large ? 'text-xs max-w-[130px]' : 'text-[10px] max-w-[90px]'} ${isCurrent ? 'text-cyan-300' : 'text-slate-400'}`}
        title={credential.title}
      >
        {shortTitle}
      </span>
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-teal-400 !border-2 !border-slate-900" />
    </div>
  );
}

export default memo(CredentialCircleNode);
