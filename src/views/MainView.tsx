import { useMemo, useState, useCallback, useEffect, useRef, type ComponentType } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useOnViewportChange,
  ReactFlowProvider,
  Panel,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CircleMilestoneNode from '../nodes/CircleMilestoneNode';
import { useShowEditControls } from '../hooks/useShowEditControls';
import type { Credential, Milestone, Segment } from '../types';
import type { LandingTheme } from './ThemeChoiceView';
import type { GokuPlacement } from '../nodes/CircleMilestoneNode';

export type GokuTimelineConfig = {
  milestones: Record<string, { position: GokuPlacement; size: number }>;
};

const nodeTypes = { circleMilestone: CircleMilestoneNode as ComponentType<any> };

const VIEWPORT_STORAGE_KEY = 'timeline-main-viewport';
const POSITIONS_STORAGE_KEY = 'timeline-main-positions';
/** Tamaño aproximado del nodo (círculo) para calcular bbox al encuadrar. */
const NODE_SIZE = 100;
/** En fun mode el nodo incluye imagen de Goku (arriba/abajo): más alto para el bbox. */
const NODE_HEIGHT_DRAGONBALL = 280;
const NODE_WIDTH_DRAGONBALL = 120;

/** Default layout: single row left→right so timeline is clean and lines don't cross. */
const SPACING_X = 220;
const ROW_Y_START = 120;

function getLinearPosition(index: number): { x: number; y: number } {
  return { x: index * SPACING_X, y: ROW_Y_START };
}

function loadSavedPositions(): Record<string, { x: number; y: number }> {
  try {
    const s = typeof localStorage !== 'undefined' ? localStorage.getItem(POSITIONS_STORAGE_KEY) : null;
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}
/** Restore viewport when returning to main timeline so we don't show (0,0,1) then jump. */
function loadSavedViewport(): { x: number; y: number; zoom: number } | null {
  try {
    const s = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(VIEWPORT_STORAGE_KEY) : null;
    if (!s) return null;
    const v = JSON.parse(s);
    if (v && typeof v.x === 'number' && typeof v.y === 'number' && typeof v.zoom === 'number') return v;
  } catch {
    // ignore
  }
  return null;
}

/**
 * Build segments with exact year limits; each credential in exactly one segment.
 * Rule: segment [A, B] — first segment (i=0): year >= A and year <= B; all others: year > A and year <= B.
 * So 1991–2003 has 1991..2003; 2003–2009 has 2004..2009; …; 2024–2025 has 2025 only; 2025–2026 has 2026 only.
 */
function buildSegments(milestones: Milestone[], credentials: Credential[]): Segment[] {
  const segments: Segment[] = [];
  for (let i = 0; i < milestones.length - 1; i++) {
    const fromYear = milestones[i].year;
    const toYear = milestones[i + 1].year;
    const inclusiveStart = i === 0;
    const credentialIds = credentials
      .filter((c) => c.year <= toYear && (inclusiveStart ? c.year >= fromYear : c.year > fromYear))
      .map((c) => c.id);
    segments.push({ fromYear, toYear, credentialIds });
  }
  return segments;
}

export type MainViewProps = {
  milestones: Milestone[];
  credentials: Credential[];
  onSegmentSelect: (segment: Segment) => void;
  onMilestoneClick?: (milestone: Milestone) => void;
  theme?: LandingTheme | null;
};

const TIMELINE_POSITIONS_URL = '/data/timeline-positions.json';

const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 };

function FlowInner({ milestones, credentials, onSegmentSelect, onMilestoneClick, theme }: MainViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layoutLocked, setLayoutLocked] = useState(true);
  const [savedPositions, setSavedPositions] = useState<Record<string, { x: number; y: number }>>(loadSavedPositions);
  const initialViewport = useMemo(() => loadSavedViewport() ?? DEFAULT_VIEWPORT, []);
  const [defaultPositionsFromFile, setDefaultPositionsFromFile] = useState<Record<string, { x: number; y: number }> | null>(null);
  const [pendingRefitAfterFile, setPendingRefitAfterFile] = useState(false);
  const hasScaledToFit = useRef(false);
  const showEditControls = useShowEditControls();
  const [panEnabled, setPanEnabled] = useState(false);
  const [gokuConfig, setGokuConfig] = useState<GokuTimelineConfig | null>(null);

  useEffect(() => {
    fetch(TIMELINE_POSITIONS_URL)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        const map = typeof data === 'object' && data !== null ? (data as Record<string, { x: number; y: number }>) : {};
        setDefaultPositionsFromFile(map);
      })
      .catch(() => setDefaultPositionsFromFile({}));
  }, []);

  useEffect(() => {
    if (theme !== 'dragonball') {
      setGokuConfig(null);
      return;
    }
    fetch('/data/goku-timeline.json')
      .then((r) => r.json())
      .then(setGokuConfig)
      .catch(() => setGokuConfig(null));
  }, [theme]);

  const segments = useMemo(
    () => buildSegments(milestones, credentials),
    [milestones, credentials]
  );

  const initialNodes: Node[] = useMemo(
    () =>
      milestones.map((m, i) => {
        const pos = savedPositions[m.id] ?? defaultPositionsFromFile?.[m.id] ?? getLinearPosition(i);
        const baseData = { milestone: m, isCurrent: i === 0 };
        if (theme === 'dragonball' && gokuConfig) {
          const c = gokuConfig.milestones[m.id];
          if (c) {
            return {
              id: m.id,
              type: 'circleMilestone',
              position: pos,
              data: {
                ...baseData,
                gokuImageUrl: `/images/goku/goku-${i}.png`,
                gokuPosition: c.position,
                gokuSize: c.size,
              },
              draggable: !layoutLocked,
            };
          }
        }
        return {
          id: m.id,
          type: 'circleMilestone',
          position: pos,
          data: baseData,
          draggable: !layoutLocked,
        };
      }),
    [milestones, savedPositions, defaultPositionsFromFile, layoutLocked, theme, gokuConfig]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      segments.map((seg, i) => {
        const count = seg.credentialIds.length;
        return {
          id: `seg-${milestones[i].id}-${milestones[i + 1].id}`,
          source: milestones[i].id,
          target: milestones[i + 1].id,
          animated: true,
          type: 'default',
          style: { strokeWidth: 2 },
          ...(count > 0 && {
            label: `${count} credential${count !== 1 ? 's' : ''}`,
            labelStyle: { fill: '#e2e8f0', fontWeight: 600, fontSize: 11 },
            labelShowBg: true,
            labelBgStyle: { fill: '#1e293b', stroke: '#475569', strokeWidth: 1 },
            labelBgPadding: [6, 10] as [number, number],
            labelBgBorderRadius: 6,
          }),
          data: { segment: seg, count },
        };
      }),
    [milestones, segments]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);

  useEffect(() => {
    if (theme !== 'dragonball') {
      setNodes((prev) =>
        prev.map((n) => ({ ...n, data: { milestone: (n.data as { milestone: Milestone }).milestone, isCurrent: (n.data as { isCurrent?: boolean }).isCurrent } }))
      );
      return;
    }
    if (!gokuConfig) return;
    setNodes((prev) =>
      prev.map((n, i) => {
        const data = n.data as { milestone: Milestone; isCurrent?: boolean };
        const c = gokuConfig.milestones[data.milestone.id];
        if (!c) return n;
        return {
          ...n,
          data: {
            ...data,
            gokuImageUrl: `/images/goku/goku-${i}.png`,
            gokuPosition: c.position,
            gokuSize: c.size,
          },
        };
      })
    );
  }, [theme, gokuConfig, setNodes]);

  const reactFlowInstance = useReactFlow();
  const fitViewTimeout = useRef<ReturnType<typeof setTimeout>>(0);
  const fitScheduleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFittedAll = useRef(false);
  const fitAllInViewRef = useRef<((duration?: number) => void) | null>(null);

  /** Ajustar vista al área de pantalla: solo mueve el viewport (pan+zoom). No toca posiciones de nodos. */
  const scaleLayoutToFit = useCallback(() => {
    if (!containerRef.current || !reactFlowInstance || nodes.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (w <= 0 || h <= 0) return;
    const nodeW = theme === 'dragonball' ? NODE_WIDTH_DRAGONBALL : NODE_SIZE;
    const nodeH = theme === 'dragonball' ? NODE_HEIGHT_DRAGONBALL : NODE_SIZE;
    const minX = Math.min(...nodes.map((n) => n.position.x));
    const minY = Math.min(...nodes.map((n) => n.position.y));
    const maxX = Math.max(...nodes.map((n) => n.position.x + nodeW));
    const maxY = Math.max(...nodes.map((n) => n.position.y + nodeH));
    const bboxW = maxX - minX;
    const bboxH = maxY - minY;
    if (bboxW <= 0 || bboxH <= 0) return;
    const padding = 0.85;
    const zoom = Math.min((w / bboxW) * padding, (h / bboxH) * padding);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const viewportX = w / 2 - centerX * zoom;
    const viewportY = h / 2 - centerY * zoom;
    reactFlowInstance.setViewport({ x: viewportX, y: viewportY, zoom }, { duration: 0 });
  }, [reactFlowInstance, nodes, theme]);

  /** Request a single fit; debounced so multiple triggers (mount, theme, file) result in one run. */
  const requestFit = useCallback(() => {
    if (fitScheduleRef.current) clearTimeout(fitScheduleRef.current);
    fitScheduleRef.current = setTimeout(() => {
      fitScheduleRef.current = null;
      scaleLayoutToFit();
      hasScaledToFit.current = true;
    }, 280);
  }, [scaleLayoutToFit]);

  const fitAllInView = useCallback(
    (duration = 0) => {
      if (!reactFlowInstance || milestones.length === 0) return;
      clearTimeout(fitViewTimeout.current);
      fitViewTimeout.current = setTimeout(() => scaleLayoutToFit(), duration ? 50 : 100);
    },
    [reactFlowInstance, milestones.length, scaleLayoutToFit]
  );
  fitAllInViewRef.current = fitAllInView;

  useEffect(() => {
    if (!defaultPositionsFromFile || Object.keys(defaultPositionsFromFile).length === 0) return;
    const willApplyFromFile = milestones.some(
      (m) => !savedPositions[m.id] && defaultPositionsFromFile[m.id]
    );
    setNodes((nds) =>
      nds.map((n) => {
        if (savedPositions[n.id]) return n;
        const fromFile = defaultPositionsFromFile[n.id];
        if (!fromFile) return n;
        return { ...n, position: fromFile };
      })
    );
    if (willApplyFromFile) setPendingRefitAfterFile(true);
  }, [defaultPositionsFromFile, setNodes, savedPositions, milestones]);

  /** Re-fit viewport after file positions applied (wait for paint then fit, and retry once for late layout). */
  useEffect(() => {
    if (!pendingRefitAfterFile || nodes.length === 0) return;
    let cancelled = false;
    const runFit = () => {
      if (cancelled) return;
      fitAllInViewRef.current?.(150);
    };
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(runFit, 50);
        if (cancelled) return;
        setTimeout(runFit, 220);
      });
    });
    const t = setTimeout(() => {
      setPendingRefitAfterFile(false);
    }, 300);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      clearTimeout(t);
    };
  }, [pendingRefitAfterFile, nodes.length]);

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      const idx = milestones.findIndex((m) => m.id === node.id);
      if (idx !== -1) {
        setCurrentNodeIndex(idx);
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: { ...n.data, isCurrent: n.id === node.id },
          }))
        );
        const milestone = milestones[idx];
        if (onMilestoneClick) onMilestoneClick(milestone);
      }
    },
    [milestones, setNodes, onMilestoneClick]
  );

  const handleLockLayout = useCallback(() => {
    const positions = Object.fromEntries(
      nodes.map((n) => [n.id, { x: n.position.x, y: n.position.y }])
    );
    try {
      localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(positions));
    } catch {
      // ignore
    }
    setSavedPositions(positions);
    setLayoutLocked(true);
    setNodes((nds) => nds.map((n) => ({ ...n, draggable: false })));
  }, [nodes, setNodes]);

  const handleUnlockLayout = useCallback(() => {
    setLayoutLocked(false);
    setNodes((nds) => nds.map((n) => ({ ...n, draggable: true })));
  }, [setNodes]);

  const handleResetLayout = useCallback(() => {
    try {
      localStorage.removeItem(POSITIONS_STORAGE_KEY);
    } catch {
      // ignore
    }
    setSavedPositions({});
    if (defaultPositionsFromFile && Object.keys(defaultPositionsFromFile).length > 0) {
      setNodes((nds) =>
        nds.map((n) => {
          const idx = milestones.findIndex((m) => m.id === n.id);
          const pos = defaultPositionsFromFile[n.id] ?? getLinearPosition(Math.max(0, idx));
          return { ...n, position: pos };
        })
      );
      setPendingRefitAfterFile(true);
    }
  }, [defaultPositionsFromFile, milestones, setNodes]);

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      const seg = (edge.data as { segment?: Segment })?.segment;
      if (seg && seg.credentialIds.length > 0) {
        onSegmentSelect(seg);
      }
    },
    [onSegmentSelect]
  );

  /** Persist viewport so when returning from segment view it stays the same. */
  useOnViewportChange({
    onChange: (viewport) => {
      try {
        sessionStorage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify(viewport));
      } catch {
        // ignore
      }
    },
  });

  /** On mount: request fit only when we don't have saved layout (first load). When returning we keep saved positions, no fit = no jump. */
  useEffect(() => {
    if (!reactFlowInstance || milestones.length === 0 || hasFittedAll.current || hasScaledToFit.current) return;
    hasFittedAll.current = true;
    const hasSavedLayout = Object.keys(savedPositions).length > 0;
    if (!hasSavedLayout) requestFit();
    return () => {
      if (fitScheduleRef.current) clearTimeout(fitScheduleRef.current);
      clearTimeout(fitViewTimeout.current);
    };
  }, [reactFlowInstance, milestones.length, requestFit, savedPositions]);

  /** When switching to fun mode, request fit only if no saved layout (otherwise we'd re-scale and cause a jump). */
  useEffect(() => {
    if (theme !== 'dragonball' || !reactFlowInstance || nodes.length === 0) return;
    const hasSavedLayout = Object.keys(savedPositions).length > 0;
    if (!hasSavedLayout) requestFit();
    return () => {
      if (fitScheduleRef.current) clearTimeout(fitScheduleRef.current);
    };
  }, [theme, reactFlowInstance, nodes.length, requestFit, savedPositions]);

  const goNext = useCallback(() => {
    if (currentNodeIndex >= milestones.length - 1) return;
    const nextIndex = currentNodeIndex + 1;
    setCurrentNodeIndex(nextIndex);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isCurrent: n.id === milestones[nextIndex].id },
      }))
    );
    fitAllInView(400);
  }, [currentNodeIndex, milestones, setNodes, fitAllInView]);

  const goPrev = useCallback(() => {
    if (currentNodeIndex <= 0) return;
    const prevIndex = currentNodeIndex - 1;
    setCurrentNodeIndex(prevIndex);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isCurrent: n.id === milestones[prevIndex].id },
      }))
    );
    fitAllInView(400);
  }, [currentNodeIndex, milestones, setNodes, fitAllInView]);

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

  /** En fun mode no montar ReactFlow hasta tener gokuConfig: así la primera pintura ya tiene nodos con Goku y no hay transición que mueva la vista. */
  const showFlow = theme !== 'dragonball' || gokuConfig !== null;

  /** Al pasar de placeholder a flow en fun mode (una sola vez), sincronizar nodos con initialNodes (ya llevan Goku). */
  const didShowFlowRef = useRef(false);
  useEffect(() => {
    if (!showFlow) {
      didShowFlowRef.current = false;
      return;
    }
    if (!didShowFlowRef.current) {
      didShowFlowRef.current = true;
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [showFlow, initialNodes, initialEdges, setNodes, setEdges]);

  if (!showFlow) {
    return (
      <div ref={containerRef} className="relative w-full h-full min-h-0 rounded-2xl overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-none" aria-hidden>
          <img
            src="/images/wallpapers/main-milestones.jpg"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.18 }}
          />
        </div>
        <div className="relative z-10 flex items-center justify-center w-full h-full min-h-0">
          <div className="text-slate-400 text-sm font-medium animate-pulse">Loading timeline…</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-0 rounded-2xl overflow-hidden bg-slate-950">
      {theme === 'dragonball' && (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-none" aria-hidden>
          <img
            src="/images/wallpapers/main-milestones.jpg"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.18 }}
          />
        </div>
      )}
      <div className="relative z-10 w-full h-full min-h-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        nodesDraggable={!layoutLocked}
        defaultViewport={initialViewport}
        fitView={false}
        minZoom={0.2}
        maxZoom={1.5}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnDrag={showEditControls ? panEnabled : false}
        panOnScroll={showEditControls ? panEnabled : false}
        panActivationKeyCode={showEditControls && panEnabled ? undefined : null}
        defaultEdgeOptions={{ animated: true, type: 'default' }}
        proOptions={{ hideAttribution: true }}
        className={theme === 'dragonball' ? 'bg-transparent' : 'bg-slate-950'}
      >
        <Background color="#334155" gap={24} size={1} className={theme === 'dragonball' ? 'opacity-20' : 'opacity-40'} />

        <Panel position="top-center" className="mt-3 flex flex-col items-center pointer-events-none">
          <h2 className="text-lg font-semibold text-white drop-shadow-md">Educational journey</h2>
          <p className="text-xs text-slate-300 mt-0.5 drop-shadow">Key years and credentials along the timeline.</p>
        </Panel>

        <Panel position="top-right" className="mt-3 mr-3 flex items-center gap-2">
          {showEditControls && (
            <>
              <button
                type="button"
                onClick={() => setPanEnabled((p) => !p)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border shadow-lg ${
                  panEnabled
                    ? 'bg-sky-500 text-white border-sky-400/80 hover:bg-sky-400'
                    : 'bg-slate-600/80 text-slate-200 border-slate-500/50 hover:bg-slate-500/80'
                }`}
              >
                {panEnabled ? 'Disable pan' : 'Enable pan'}
              </button>
              {layoutLocked ? (
                <button
                  type="button"
                  onClick={handleUnlockLayout}
                  className="px-3 py-2 rounded-xl text-sm font-medium bg-amber-500/90 text-slate-900 hover:bg-amber-400 border border-amber-400/80 shadow-lg"
                >
                  Unlock layout
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLockLayout}
                  className="px-3 py-2 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-400 border border-emerald-400/80 shadow-lg"
                >
                  Lock layout
                </button>
              )}
              <button
                type="button"
                onClick={handleResetLayout}
                className="px-3 py-2 rounded-xl text-sm font-medium bg-slate-600/80 text-slate-200 border border-slate-500/50 hover:bg-slate-500/80 shadow-lg"
                title="Restore layout from file (positions moved up)"
              >
                Reset layout
              </button>
            </>
          )}
        </Panel>

        <Panel position="bottom-center" className="mb-3 flex flex-col items-center gap-2">
          <p className="text-slate-500 text-xs font-medium">
            {!showEditControls || layoutLocked
              ? 'Click a circle for milestone detail · Click a segment label to explore credentials'
              : 'Drag nodes to arrange the timeline, then click Lock layout to save'}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentNodeIndex === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white border border-slate-500/50 hover:bg-white/20 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              ← Prev
            </button>
            <span className="text-slate-400 text-xs font-medium">
              {currentNodeIndex + 1} / {milestones.length}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={currentNodeIndex === milestones.length - 1}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-900 hover:from-cyan-400 hover:to-teal-400 transition-all"
            >
              Next →
            </button>
          </div>
        </Panel>
      </ReactFlow>
      </div>
    </div>
  );
}

export default function MainView(props: MainViewProps) {
  return (
    <div className="w-full flex-1 min-h-0 overflow-hidden" style={{ height: '100%' }}>
      <ReactFlowProvider>
        <div className="w-full h-full min-h-0 overflow-hidden">
          <FlowInner {...props} />
        </div>
      </ReactFlowProvider>
    </div>
  );
}
