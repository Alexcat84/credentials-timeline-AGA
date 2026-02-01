# Reference: Your GitHub presentation repos

Summary of the code and patterns from your public repos so we can align the Professional Timeline with the same “path + navigation” style.

---

## Repos reviewed

| Repo | Stack | Purpose |
|------|--------|---------|
| [Risk-101-Presentation](https://github.com/Alexcat84/Risk-101-Presentation) | React, **React Flow** (v11), Tailwind | Risk analysis presentation – sequential slides |
| [final-lessons-learned-presentation](https://github.com/Alexcat84/final-lessons-learned-presentation) | React, **React Flow**, Tailwind | Lessons learned – zigzag path, fitView to current slide |
| [smart-agriculture-technology](https://github.com/Alexcat84/smart-agriculture-technology) | React, **React Flow**, Tailwind | Smart Agri procurement – same pattern, progress dots |
| [crypto-currency-impacts](https://github.com/Alexcat84/crypto-currency-impacts) | (same family) | Same presentation style |
| [McKinsey-7S-Presentation](https://github.com/Alexcat84/McKinsey-7S-Presentation) | (same family) | Leadership / 7S – same style |

---

## Common pattern

### 1. React Flow as “canvas”

- **Nodes** = slides (or in our case, timeline milestones).
- **Edges** = connections between them; `animated: true` so the path looks like a journey.
- **Custom node types** per slide type (e.g. `TitleSlideNode`, `EventOverviewNode`). For the timeline we can use one or two types: e.g. `MilestoneNode`, `TitleNode`.

### 2. Navigation sequence

- `navigationSequence`: array of node ids in order (e.g. `['titleSlide', 'eventOverview', 'stakeholders', ...]`).
- `currentNodeIndex` (0, 1, 2, …) = “current slide”.
- **Previous / Next** buttons:
  - Next: reveal next node (`hidden: false`), then `fitView` to that node with `duration: 1000`.
  - Previous: `fitView` to previous node (no need to hide).
- **Keyboard**: ArrowRight / Space / Enter = next; ArrowLeft = previous (some repos also use ArrowUp/Down, PageUp/PageDown).

### 3. Layout (positions)

- **Zigzag** (lessons-learned, smart-agriculture):  
  `x` alternates, e.g. `0 → -1000 → 1000 → -1000 → …`, `y` increases (0, 700, 1400, 2100, …). Path goes left–right–left.
- **Grid** (Risk-101): columns at x = 100, 1100, 2100, 3100; rows at y = 100, 800, 1500.
- Positions stored in a `fixedPositions` object and often synced to `localStorage` so the path is stable.

### 4. fitView = “zoom to current”

- On load: `fitView({ nodes: [{ id: firstNodeId }], padding: 0.05, duration: 0 })`.
- On Next: after revealing the next node,  
  `fitView({ nodes: [{ id: nextNodeId }], padding: 0.05, duration: 1000 })`  
  so the camera smoothly moves to the next milestone.
- On Previous: `fitView({ nodes: [{ id: previousNodeId }], padding: 0.05, duration: 1000 })`.
- Optional: `minZoom` / `maxZoom` in `fitView` or via controls.

### 5. Visual style (Risk-101 `index.css`)

- `.react-flow__node`: no border, no padding, transparent background, auto width (custom look per node).
- `.react-flow__handle`: small (8px), color e.g. `#14b8a6` (teal).
- `.react-flow__edge-path`: stroke `#14b8a6`, stroke-width 2 (the “path”).
- Controls/minimap: light background, subtle border.

### 6. Optional extras (in your repos)

- **Zoom control**: slider or +/- buttons; some use “fixed zoom” mode.
- **Progress indicator**: dots or steps for `currentNodeIndex / totalNodes`.
- **Fixed positions mode**: disable dragging so the path doesn’t move.
- **Global CSS animations**: fadeIn, scaleIn, slideInUp, glowPulse (in final-lessons-learned).

---

## Applying this to the Professional Timeline

To make the timeline feel like your presentations:

1. **Reintroduce React Flow** for the main timeline view (keep landing and filter as they are).
2. **One node per credential** (or one per “key” credential if we group by year), with a **single custom node type** (e.g. `MilestoneNode`) showing year, title, and maybe institution.
3. **Edges** between consecutive nodes with **animated: true** (same “path” effect).
4. **Positions**: e.g. zigzag (alternating x, increasing y) so the path has a clear left–right flow.
5. **Navigation**:
   - **Previous / Next** to move along the sequence.
   - **fitView** to the current node with ~800–1000 ms duration so “zooming” to a milestone feels like advancing in a presentation.
   - **Keyboard**: same as above (arrows, space, enter).
6. **Year range filter**: can filter which nodes exist (or are visible) and rebuild the sequence so “zoom in by year” = fewer, focused nodes and fitView still works on the current one.
7. **Styling**: reuse the same React Flow overrides (edge color, handle, node container) so it matches Risk-101 / lessons-learned.

This doc is the reference for implementing the “presentation-style” timeline in this project.
