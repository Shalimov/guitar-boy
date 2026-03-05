# T08: Performance And Release Gates

## Objective
Stabilize performance and set repeatable quality gates before considering the canvas migration complete.

## Read First
- `src/components/fretboard/CanvasFretboard.tsx`
- `src/components/fretboard/canvas/render.ts`
- `src/pages/whiteboard/WhiteboardPage.tsx`
- `package.json`
- `AGENTS.md`

## Files To Edit
- `src/components/fretboard/CanvasFretboard.tsx`
- `src/components/fretboard/canvas/render.ts`
- `src/pages/whiteboard/WhiteboardPage.tsx`

## Optional Files To Create
- `src/lib/perf.ts`
- `src/lib/perf.test.ts`
- `specs/cdx_tasks/release-checklist.md`

## Implementation Steps
1. Optimize redraw paths in canvas rendering:
   - avoid full redraw when only hover/focus state changes,
   - memoize derived geometry where possible,
   - avoid recreating expensive objects every render.
2. Use `React.memo` and stable callbacks for fretboard-heavy components.
3. Add lightweight render timing instrumentation in development mode only.
4. Improve whiteboard list performance for larger diagram counts.
5. Define release checklist with measurable gates.
6. Document baseline numbers and post-optimization numbers in checklist.

## Suggested Performance Budgets
- Fretboard initial render under 16ms for `fretRange=[0,12]` on a typical laptop.
- Interaction response (click to visual update) under 50ms.
- Whiteboard list remains responsive with 50+ user diagrams.

## Acceptance Criteria
- No visible interaction jank during normal fretboard use.
- Quality commands all pass.
- Release checklist is present and filled with real measured numbers.

## Verification Commands
- `yarn format`
- `yarn lint`
- `yarn typecheck`
- `yarn test`
- `yarn build`

## Out Of Scope
- No backend or sync features.
- No audio playback.
