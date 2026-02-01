import { useMemo, useState, useCallback, useEffect, useRef, type ComponentType } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import MilestoneNode from '../nodes/MilestoneNode';
import type { Credential, Profile } from '../types';

const nodeTypes = { milestoneNode: MilestoneNode as ComponentType<any> };

const ZIGZAG_X_OFFSET = 420;
const NODE_VERTICAL_GAP = 280;

type TimelineViewProps = {
  credentials: Credential[];
  profile: Profile;
};

function getZigzagPosition(index: number): { x: number; y: number } {
  const y = index * NODE_VERTICAL_GAP;
  const x = index === 0 ? 0 : (index % 2 === 1 ? -1 : 1) * ZIGZAG_X_OFFSET * Math.ceil(index / 2);
  return { x, y };
}

function FlowInner({ credentials }: { credentials: Credential[] }) {
  const sorted = useMemo(
    () => [...credentials].sort((a, b) => a.year - b.year || a.numericId - b.numericId),
    [credentials]
  );

  const navigationSequence = useMemo(() => sorted.map((c) => c.id), [sorted]);

  const initialNodes: Node[] = useMemo(
    () =>
      sorted.map((c, i) => {
        const pos = getZigzagPosition(i);
        return {
          id: c.id,
          type: 'milestoneNode',
          position: pos,
          data: { credential: c, isCurrent: i === 0 },
        };
      }),
    [sorted]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      sorted.slice(0, -1).map((c, i) => ({
        id: `e-${c.id}-${sorted[i + 1].id}`,
        source: c.id,
        target: sorted[i + 1].id,
        animated: true,
        style: { strokeWidth: 2 },
        type: 'smoothstep',
      })),
    [sorted]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const reactFlowInstance = useReactFlow();
  const fitViewTimeout = useRef<ReturnType<typeof setTimeout>>(0);

  const totalNodes = navigationSequence.length;

  const centerOnNode = useCallback(
    (nodeId: string, duration = 800) => {
      if (!reactFlowInstance) return;
      clearTimeout(fitViewTimeout.current);
      fitViewTimeout.current = setTimeout(() => {
        try {
          reactFlowInstance.fitView({
            nodes: [{ id: nodeId }],
            padding: 0.35,
            duration,
            minZoom: 0.25,
            maxZoom: 1.2,
          });
        } catch {
          // ignore
        }
      }, 80);
    },
    [reactFlowInstance]
  );

  const goNext = useCallback(() => {
    if (currentNodeIndex >= totalNodes - 1) return;
    const nextIndex = currentNodeIndex + 1;
    setCurrentNodeIndex(nextIndex);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isCurrent: n.id === navigationSequence[nextIndex] },
      }))
    );
    centerOnNode(navigationSequence[nextIndex], 900);
  }, [currentNodeIndex, totalNodes, navigationSequence, setNodes, centerOnNode]);

  const goPrev = useCallback(() => {
    if (currentNodeIndex <= 0) return;
    const prevIndex = currentNodeIndex - 1;
    setCurrentNodeIndex(prevIndex);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isCurrent: n.id === navigationSequence[prevIndex] },
      }))
    );
    centerOnNode(navigationSequence[prevIndex], 900);
  }, [currentNodeIndex, navigationSequence, setNodes, centerOnNode]);

  const goToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalNodes) return;
      setCurrentNodeIndex(index);
      const id = navigationSequence[index];
      setNodes((nds) =>
        nds.map((n) => ({ ...n, data: { ...n.data, isCurrent: n.id === id } }))
      );
      centerOnNode(id, 700);
    },
    [totalNodes, navigationSequence, setNodes, centerOnNode]
  );

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      const idx = navigationSequence.indexOf(node.id);
      if (idx !== -1) goToIndex(idx);
    },
    [navigationSequence, goToIndex]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  useEffect(() => {
    if (!reactFlowInstance || totalNodes === 0) return;
    const firstId = navigationSequence[0];
    const t = setTimeout(() => centerOnNode(firstId, 0), 400);
    return () => {
      clearTimeout(t);
      clearTimeout(fitViewTimeout.current);
    };
  }, [reactFlowInstance, totalNodes, navigationSequence, centerOnNode]);

  const progressPct = totalNodes > 0 ? ((currentNodeIndex + 1) / totalNodes) * 100 : 0;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.35, minZoom: 0.25, maxZoom: 1.2 }}
        minZoom={0.15}
        maxZoom={1.5}
        defaultEdgeOptions={{ animated: true, type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
        className="bg-slate-950"
      >
        <Background color="#334155" gap={24} size={1} className="opacity-40" />
        <Controls
          className="!bg-white/10 !backdrop-blur-md !border-slate-600/50 !rounded-xl !shadow-lg"
          showInteractive={false}
        />

        {/* Bottom: progress + nav */}
        <Panel position="bottom-center" className="mb-4 flex flex-col items-center gap-3">
          <div className="w-full max-w-md px-2">
            <div className="h-1.5 w-full rounded-full bg-slate-700/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-center text-slate-400 text-xs mt-1.5 font-medium">
              {currentNodeIndex + 1} of {totalNodes}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentNodeIndex === 0}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-white/10 text-white border border-slate-500/50 hover:bg-white/20 disabled:opacity-40 disabled:pointer-events-none transition-all backdrop-blur-sm"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={currentNodeIndex === totalNodes - 1}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-900 hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/25 transition-all"
            >
              Next →
            </button>
          </div>
        </Panel>

        {/* Hint */}
        <Panel position="top-center" className="mt-3">
          <p className="text-slate-500 text-xs font-medium">
            Use arrows or space to navigate · Click and drag to pan
          </p>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function TimelineView({ credentials }: TimelineViewProps) {
  return (
    <div className="h-[calc(100vh-80px)] w-full">
      <ReactFlowProvider>
        <FlowInner credentials={credentials} />
      </ReactFlowProvider>
    </div>
  );
}
