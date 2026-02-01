import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

export type PreviousSectionNodeData = {
  label?: string;
  sectionFraction?: string;
};

function PreviousSectionNode({ data }: NodeProps) {
  const { label = 'Previous section', sectionFraction } = (data ?? {}) as PreviousSectionNodeData;

  return (
    <div className="flex flex-col items-center gap-2">
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-slate-900 opacity-0 pointer-events-none" />
      <div
        role="button"
        tabIndex={0}
        className="
          group flex flex-col items-center justify-center gap-1
          min-w-[120px] px-5 py-4 rounded-2xl cursor-pointer
          bg-gradient-to-r from-teal-500 to-cyan-500
          border-2 border-cyan-300/80
          text-slate-900 font-bold text-sm
          shadow-xl hover:shadow-2xl hover:scale-105
          transition-all duration-300 hover:-translate-x-1
        "
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click(); }}
      >
        <span className="flex items-center justify-center gap-1.5" aria-hidden>
          <svg
            className="w-7 h-7 animate-slide-left"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </span>
        <span>{label}</span>
        {sectionFraction && (
          <span className="text-xs font-semibold opacity-90">{sectionFraction}</span>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-teal-400 !border-2 !border-slate-900" />
    </div>
  );
}

export default memo(PreviousSectionNode);
