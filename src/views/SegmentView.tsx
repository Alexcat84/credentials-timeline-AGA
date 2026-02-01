import { useMemo, useState, useCallback, useEffect, useRef, type ComponentType } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CredentialCircleNode from '../nodes/CredentialCircleNode';
import ContinueNode from '../nodes/ContinueNode';
import PreviousSectionNode from '../nodes/PreviousSectionNode';
import { useShowEditControls } from '../hooks/useShowEditControls';
import type { Credential, Segment } from '../types';
import type { LandingTheme } from './ThemeChoiceView';
import CredentialWallpaper from '../components/CredentialWallpaper';

const nodeTypes = {
  credentialCircle: CredentialCircleNode as ComponentType<any>,
  continueNode: ContinueNode as ComponentType<any>,
  previousSectionNode: PreviousSectionNode as ComponentType<any>,
};

const CREDENTIALS_PER_PAGE = 7;
const CONTINUE_NODE_ID = 'segment-continue';
const PREVIOUS_SECTION_NODE_ID = 'segment-previous-section';
/** Zoom fijo: el usuario no manipula zoom; elementos mismo tamaño para todos. */
const STANDARD_ZOOM = 1;
/** Tamaño aproximado del nodo para calcular bbox al escalar. */
const NODE_SIZE = 100;

/** Snake layout: row 0 left→right (4 nodes), row 1 right→left (3 nodes). */
const SPACING_X = 240;
const ROW_Y_START = 140;
const ROW_GAP = 200;
const NODES_ROW_0 = 4;

function getSnakePosition(index: number): { x: number; y: number } {
  if (index < NODES_ROW_0) {
    return { x: index * SPACING_X, y: ROW_Y_START };
  }
  const col = index - NODES_ROW_0;
  return { x: (NODES_ROW_0 - 1 - col) * SPACING_X, y: ROW_Y_START + ROW_GAP };
}

/** Position for the "Continue" node (after last credential on the path). */
function getContinuePosition(pageSize: number): { x: number; y: number } {
  const last = getSnakePosition(pageSize - 1);
  return { x: last.x + SPACING_X, y: last.y };
}

/** Position for the "Previous section" node (before first credential when not on first page). */
function getPreviousSectionPosition(): { x: number; y: number } {
  return { x: -SPACING_X, y: ROW_Y_START };
}

function getSegmentPositionsKey(segment: Segment): string {
  return `timeline-segment-positions-${segment.fromYear}-${segment.toYear}`;
}

function getSegmentPositionsFileUrl(segment: Segment): string {
  return `/data/segment-positions-${segment.fromYear}-${segment.toYear}.json`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_ABBREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Extract month abbreviation from date string; returns "Mon YYYY" or null if unparseable. */
function getMonthYearLabel(dateStr: string | null, year: number): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const s = dateStr.trim();
  for (let i = 0; i < MONTH_NAMES.length; i++) {
    if (
      s.startsWith(MONTH_NAMES[i]) ||
      s.includes(' ' + MONTH_NAMES[i] + ' ') ||
      s.toLowerCase().includes(MONTH_NAMES[i].toLowerCase())
    ) {
      return `${MONTH_ABBREV[i]} ${year}`;
    }
  }
  const threeLetter = s.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/i);
  if (threeLetter) {
    const ab = threeLetter[1].charAt(0).toUpperCase() + threeLetter[1].slice(1).toLowerCase().slice(0, 3);
    return `${ab} ${year}`;
  }
  return null;
}

function loadSavedPositionsForSegment(segment: Segment): Record<string, { x: number; y: number }> {
  try {
    const key = getSegmentPositionsKey(segment);
    const s = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

export type SegmentViewProps = {
  segment: Segment;
  initialPage?: number;
  credentials: Credential[];
  onBack: () => void;
  onCredentialClick?: (credential: Credential, segmentPage?: number) => void;
  theme?: LandingTheme | null;
};

function FlowInner({ segment, initialPage, credentials, onBack, onCredentialClick, theme }: SegmentViewProps) {
  const sorted = useMemo(() => {
    const byId = new Map(credentials.map((c) => [c.id, c]));
    const list = segment.credentialIds
      .map((id) => byId.get(id))
      .filter((c): c is Credential => c != null)
      .sort((a, b) => {
        // Exception: "primary" (start of education) always first in this segment so the story begins in 1991
        if (a.id === 'primary') return -1;
        if (b.id === 'primary') return 1;
        return a.year - b.year || a.numericId - b.numericId;
      });
    return list;
  }, [segment.credentialIds, credentials]);

  const totalCredentials = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCredentials / CREDENTIALS_PER_PAGE));
  const [currentPage, setCurrentPage] = useState(() => {
    const p = initialPage ?? 0;
    return Math.min(Math.max(0, p), totalPages - 1);
  });

  const pageStart = currentPage * CREDENTIALS_PER_PAGE;
  const pageEnd = Math.min(pageStart + CREDENTIALS_PER_PAGE, totalCredentials);
  const sortedPage = useMemo(
    () => sorted.slice(pageStart, pageEnd),
    [sorted, pageStart, pageEnd]
  );

  const hasNextPage = currentPage < totalPages - 1;
  const hasPreviousPage = currentPage > 0;

  const containerRef = useRef<HTMLDivElement>(null);
  const pageNodeIds = useMemo(() => sortedPage.map((c) => c.id), [sortedPage]);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);

  const showEditControls = useShowEditControls();
  const [panEnabled, setPanEnabled] = useState(false);
  const [layoutLocked, setLayoutLocked] = useState(true);
  const [savedPositions, setSavedPositions] = useState<Record<string, { x: number; y: number }>>(() =>
    loadSavedPositionsForSegment(segment)
  );
  const [defaultPositionsFromFile, setDefaultPositionsFromFile] = useState<Record<string, { x: number; y: number }> | null>(null);
  const [pendingRefitAfterFile, setPendingRefitAfterFile] = useState(false);
  const [pendingFitForPage, setPendingFitForPage] = useState<number | null>(null);

  useEffect(() => {
    setSavedPositions(loadSavedPositionsForSegment(segment));
    setDefaultPositionsFromFile(null);
    setPendingRefitAfterFile(false);
    fetch(getSegmentPositionsFileUrl(segment))
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        const map = typeof data === 'object' && data !== null ? (data as Record<string, { x: number; y: number }>) : {};
        setDefaultPositionsFromFile(map);
      })
      .catch(() => setDefaultPositionsFromFile({}));
  }, [segment.fromYear, segment.toYear]);

  /** Per-credential circle label: "Mon YYYY" from date when parseable; "YYYY-YYYY" for primary; otherwise year. */
  const circleLabelsById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of sorted) {
      if (c.id === 'primary' && c.date && /^\d{4}\s*-\s*\d{4}$/.test(c.date.trim())) {
        map.set(c.id, c.date.trim());
      } else {
        const monthYear = getMonthYearLabel(c.date, c.year);
        map.set(c.id, monthYear ?? String(c.year));
      }
    }
    return map;
  }, [sorted]);

  const credentialNodes: Node[] = useMemo(
    () =>
      sortedPage.map((c, i) => {
        const pos = savedPositions[c.id] ?? defaultPositionsFromFile?.[c.id] ?? getSnakePosition(i);
        return {
          id: c.id,
          type: 'credentialCircle',
          position: pos,
          data: {
            credential: c,
            isCurrent: i === 0,
            large: true,
            circleLabel: circleLabelsById.get(c.id) ?? String(c.year),
          },
          draggable: !layoutLocked,
        };
      }),
    [sortedPage, savedPositions, layoutLocked, circleLabelsById]
  );

  const previousSectionNode: Node | null = useMemo(() => {
    if (!hasPreviousPage) return null;
    const pos = savedPositions[PREVIOUS_SECTION_NODE_ID] ?? getPreviousSectionPosition();
    return {
      id: PREVIOUS_SECTION_NODE_ID,
      type: 'previousSectionNode',
      position: pos,
      data: {
        label: 'Previous section',
        sectionFraction: `${currentPage + 1}/${totalPages}`,
      },
      draggable: !layoutLocked,
    };
  }, [hasPreviousPage, currentPage, totalPages, savedPositions, defaultPositionsFromFile, layoutLocked]);

  const continueNode: Node | null = useMemo(() => {
    if (!hasNextPage || sortedPage.length === 0) return null;
    const pos = savedPositions[CONTINUE_NODE_ID] ?? defaultPositionsFromFile?.[CONTINUE_NODE_ID] ?? getContinuePosition(sortedPage.length);
    return {
      id: CONTINUE_NODE_ID,
      type: 'continueNode',
      position: pos,
      data: {
        label: 'Next section',
        sectionFraction: `${currentPage + 1}/${totalPages}`,
      },
      draggable: !layoutLocked,
    };
  }, [hasNextPage, sortedPage.length, currentPage, totalPages, savedPositions, defaultPositionsFromFile, layoutLocked]);

  const initialNodes: Node[] = useMemo(() => {
    const list = previousSectionNode
      ? [previousSectionNode, ...credentialNodes]
      : credentialNodes;
    return continueNode ? [...list, continueNode] : list;
  }, [credentialNodes, continueNode, previousSectionNode]);

  const initialEdges = useMemo(() => {
    const edges: { id: string; source: string; target: string; animated: boolean; style: { strokeWidth: number }; type: string }[] = [];
    if (previousSectionNode && sortedPage.length > 0) {
      edges.push({
        id: `e-previous-${sortedPage[0].id}`,
        source: PREVIOUS_SECTION_NODE_ID,
        target: sortedPage[0].id,
        animated: true,
        style: { strokeWidth: 2 },
        type: 'default',
      });
    }
    for (let i = 0; i < sortedPage.length - 1; i++) {
      edges.push({
        id: `e-${sortedPage[i].id}-${sortedPage[i + 1].id}`,
        source: sortedPage[i].id,
        target: sortedPage[i + 1].id,
        animated: true,
        style: { strokeWidth: 2 },
        type: 'default',
      });
    }
    if (continueNode) {
      edges.push({
        id: `e-${sortedPage[sortedPage.length - 1].id}-continue`,
        source: sortedPage[sortedPage.length - 1].id,
        target: CONTINUE_NODE_ID,
        animated: true,
        style: { strokeWidth: 2 },
        type: 'default',
      });
    }
    return edges;
  }, [sortedPage, continueNode, previousSectionNode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useReactFlow();
  const fitViewTimeout = useRef<ReturnType<typeof setTimeout>>(0);
  const hasFittedPage = useRef(false);
  const scaleLayoutToFitRef = useRef<(() => void) | null>(null);

  /** When page changes, sync nodes and edges to current page. */
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setCurrentNodeIndex(0);
    hasFittedPage.current = false;
  }, [currentPage, initialNodes, initialEdges, setNodes, setEdges]);

  /** When segment positions file loads, apply positions for nodes that don't have localStorage overrides. */
  useEffect(() => {
    if (!defaultPositionsFromFile || Object.keys(defaultPositionsFromFile).length === 0) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (savedPositions[n.id]) return n;
        const fromFile = defaultPositionsFromFile[n.id];
        if (!fromFile) return n;
        return { ...n, position: fromFile };
      })
    );
    hasFittedPage.current = false;
    setPendingRefitAfterFile(true);
  }, [defaultPositionsFromFile, setNodes, savedPositions]);

  /** Re-fit viewport after file positions applied (wait for paint then fit, and retry once for late layout). */
  useEffect(() => {
    if (!pendingRefitAfterFile || nodes.length === 0) return;
    let cancelled = false;
    const runFit = () => {
      if (cancelled) return;
      scaleLayoutToFitRef.current?.();
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

  /** Ajustar layout al área de pantalla: escalar posiciones para que la página quepa con zoom fijo 1. */
  const scaleLayoutToFit = useCallback(() => {
    if (!containerRef.current || !reactFlowInstance || nodes.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (w <= 0 || h <= 0) return;
    const minX = Math.min(...nodes.map((n) => n.position.x));
    const minY = Math.min(...nodes.map((n) => n.position.y));
    const maxX = Math.max(...nodes.map((n) => n.position.x + NODE_SIZE));
    const maxY = Math.max(...nodes.map((n) => n.position.y + NODE_SIZE));
    const bboxW = maxX - minX;
    const bboxH = maxY - minY;
    if (bboxW <= 0 || bboxH <= 0) return;
    const padding = 0.85;
    const scale = Math.min((w / bboxW) * padding, (h / bboxH) * padding);
    const scaledW = bboxW * scale;
    const scaledH = bboxH * scale;
    const offsetX = (w - scaledW) / 2;
    const offsetY = (h - scaledH) / 2;
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        position: {
          x: (n.position.x - minX) * scale + offsetX,
          y: (n.position.y - minY) * scale + offsetY,
        },
      }))
    );
    reactFlowInstance.setViewport({ x: 0, y: 0, zoom: STANDARD_ZOOM }, { duration: 0 });
  }, [reactFlowInstance, nodes, setNodes]);
  scaleLayoutToFitRef.current = scaleLayoutToFit;

  const fitPageInView = useCallback(
    (duration = 0) => {
      if (!reactFlowInstance || sortedPage.length === 0) return;
      clearTimeout(fitViewTimeout.current);
      fitViewTimeout.current = setTimeout(() => scaleLayoutToFit(), duration ? 50 : 100);
    },
    [reactFlowInstance, sortedPage.length, scaleLayoutToFit]
  );

  const goNextPage = useCallback(() => {
    if (currentPage >= totalPages - 1) return;
    setCurrentPage((p) => p + 1);
    setCurrentNodeIndex(0);
    hasFittedPage.current = false;
  }, [currentPage, totalPages]);

  const goPrevPage = useCallback(() => {
    if (currentPage <= 0) return;
    setCurrentPage((p) => p - 1);
    setCurrentNodeIndex(0);
    hasFittedPage.current = false;
  }, [currentPage]);

  const goNext = useCallback(() => {
    if (currentNodeIndex < sortedPage.length - 1) {
      setCurrentNodeIndex((i) => i + 1);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, isCurrent: n.id === pageNodeIds[currentNodeIndex + 1] },
        }))
      );
      fitPageInView(400);
    } else {
      goNextPage();
    }
  }, [currentNodeIndex, sortedPage.length, pageNodeIds, setNodes, fitPageInView, goNextPage]);

  const goPrev = useCallback(() => {
    if (currentNodeIndex > 0) {
      setCurrentNodeIndex((i) => i - 1);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, isCurrent: n.id === pageNodeIds[currentNodeIndex - 1] },
        }))
      );
      fitPageInView(400);
    } else {
      goPrevPage();
    }
  }, [currentNodeIndex, pageNodeIds, setNodes, fitPageInView, goPrevPage]);

  const handleLockLayout = useCallback(() => {
    const currentPositions = Object.fromEntries(
      nodes.map((n) => [n.id, { x: n.position.x, y: n.position.y }])
    );
    const existing = loadSavedPositionsForSegment(segment);
    const merged = { ...existing, ...currentPositions };
    try {
      localStorage.setItem(getSegmentPositionsKey(segment), JSON.stringify(merged));
    } catch {
      // ignore
    }
    setSavedPositions(merged);
    setLayoutLocked(true);
    setNodes((nds) => nds.map((n) => ({ ...n, draggable: false })));
  }, [segment, nodes, setNodes]);

  const handleUnlockLayout = useCallback(() => {
    setLayoutLocked(false);
    setNodes((nds) => nds.map((n) => ({ ...n, draggable: true })));
  }, [setNodes]);

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      if (node.id === CONTINUE_NODE_ID) {
        goNextPage();
        return;
      }
      if (node.id === PREVIOUS_SECTION_NODE_ID) {
        goPrevPage();
        return;
      }
      const idx = pageNodeIds.indexOf(node.id);
      if (idx !== -1) {
        setCurrentNodeIndex(idx);
        setNodes((nds) =>
          nds.map((n) => ({ ...n, data: { ...n.data, isCurrent: n.id === node.id } }))
        );
        const cred = sortedPage.find((c) => c.id === node.id);
        if (cred && onCredentialClick) onCredentialClick(cred, currentPage);
      }
    },
    [pageNodeIds, sortedPage, setNodes, onCredentialClick, goNextPage, goPrevPage, currentPage]
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

  /** On mount/segment: scale layout to predefined area at zoom 1 (first page only). */
  useEffect(() => {
    if (!reactFlowInstance || sortedPage.length === 0 || hasFittedPage.current) return;
    hasFittedPage.current = true;
    const t = setTimeout(() => scaleLayoutToFit(), 120);
    return () => {
      clearTimeout(t);
      clearTimeout(fitViewTimeout.current);
    };
  }, [reactFlowInstance, segment.fromYear, segment.toYear, sortedPage.length, scaleLayoutToFit]);

  /** After page change: run fit once nodes have been updated to the new page (Section 2 of 2, etc.). */
  useEffect(() => {
    if (pendingFitForPage === null || pendingFitForPage !== currentPage || nodes.length === 0) return;
    if (!reactFlowInstance) return;
    let cancelled = false;
    const runFit = () => {
      if (cancelled) return;
      scaleLayoutToFitRef.current?.();
    };
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(runFit, 60);
        if (cancelled) return;
        setTimeout(runFit, 200);
      });
    });
    const t = setTimeout(() => setPendingFitForPage(null), 280);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      clearTimeout(t);
    };
  }, [pendingFitForPage, currentPage, nodes.length, reactFlowInstance]);

  const progressPct =
    totalPages > 0 ? ((currentPage * CREDENTIALS_PER_PAGE + currentNodeIndex + 1) / totalCredentials) * 100 : 0;

  const segmentWallpaperIndex =
    segment.credentialIds.length > 0
      ? credentials.findIndex((c) => c.id === segment.credentialIds[0])
      : 0;

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-0 rounded-2xl overflow-hidden bg-slate-950">
      {theme === 'dragonball' && <CredentialWallpaper credentialIndex={segmentWallpaperIndex >= 0 ? segmentWallpaperIndex : 0} opacity={0.2} />}
      <div className="relative z-10 w-full h-full min-h-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        nodesDraggable={!layoutLocked}
        fitView={false}
        minZoom={STANDARD_ZOOM}
        maxZoom={STANDARD_ZOOM}
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

        <Panel position="top-left" className="mt-3 ml-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md hover:from-cyan-600 hover:to-teal-600 hover:shadow-lg border border-cyan-400/30 transition-all flex items-center gap-2"
          >
            ← Back to milestones
          </button>
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
            </>
          )}
        </Panel>

        <Panel position="top-center" className="mt-3">
          <p className="text-slate-400 text-sm font-medium">
            {segment.fromYear} – {segment.toYear} · {totalCredentials} credential{totalCredentials !== 1 ? 's' : ''}
            {totalPages > 1 && ` · Section ${currentPage + 1} of ${totalPages}`}
          </p>
        </Panel>

        <Panel position="bottom-center" className="mb-4 flex flex-col items-center gap-2">
          <div className="w-full max-w-md px-2">
            <div className="h-1.5 w-full rounded-full bg-slate-700/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-center text-slate-400 text-xs mt-1.5 font-medium">
              {currentPage * CREDENTIALS_PER_PAGE + currentNodeIndex + 1} of {totalCredentials}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              className="px-4 py-2 rounded-xl font-semibold text-sm bg-white/10 text-white border border-slate-500/50 hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              ← Prev
            </button>
            {totalPages > 1 && (
              <span className="text-slate-400 text-xs font-medium px-2">
                {currentPage + 1}/{totalPages}
              </span>
            )}
            <button
              type="button"
              onClick={goNext}
              className="px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-900 hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/25 transition-all"
            >
              Next →
            </button>
          </div>
          <p className="text-slate-500 text-xs font-medium">
            {showEditControls && !layoutLocked
              ? 'Drag circles to arrange, then Lock layout to save'
              : hasNextPage || hasPreviousPage
                ? 'Use the arrows on the timeline for next/previous section · Click a circle for detail'
                : 'Click a circle for credential detail'}
          </p>
        </Panel>
      </ReactFlow>
      </div>
    </div>
  );
}

export default function SegmentView(props: SegmentViewProps) {
  return (
    <div className="flex-1 w-full min-h-0 flex flex-col overflow-hidden">
      <ReactFlowProvider>
        <div className="flex-1 w-full min-h-0">
          <FlowInner {...props} />
        </div>
      </ReactFlowProvider>
    </div>
  );
}
