# T03: Canvas Fretboard Foundation

## Objective
Build the geometry and data foundation for a canvas-based fretboard renderer before replacing UI rendering.

## Why This Task Exists
A direct rewrite of `Fretboard.tsx` is risky. Foundation code must exist first for:
- deterministic coordinate mapping,
- reliable hit-testing,
- testable rendering logic separate from React UI.

## Read First
- `src/components/fretboard/Fretboard.tsx`
- `src/components/fretboard/Fretboard.test.tsx`
- `src/types/fretboard.ts`
- `src/types/music.ts`
- `specs/001-fretboard-learning-app/contracts/components.md`

## Files To Create
- `src/components/fretboard/canvas/types.ts`
- `src/components/fretboard/canvas/geometry.ts`
- `src/components/fretboard/canvas/geometry.test.ts`
- `src/components/fretboard/canvas/index.ts`

## Files To Edit
- `src/components/fretboard/index.ts`

## Implementation Steps
1. Define canvas-specific types in `canvas/types.ts`:
   - `CanvasLayoutConfig`
   - `CanvasMetrics`
   - `CanvasPoint`
   - `CanvasCellBounds`
2. Implement `createCanvasMetrics` in `canvas/geometry.ts`.
3. Support fret ranges and 6-string indexing exactly like existing types (`string: 0..5`, `fret: 0..24`).
4. Implement `positionToCanvasPoint(metrics, position)`.
5. Implement `positionToCellBounds(metrics, position)`.
6. Implement `canvasPointToNearestPosition(metrics, point)` for click/drag hit-testing.
7. Add bounds safety behavior: clamp invalid point input to nearest valid fret position.
8. Add unit tests for all geometry helpers, including edge cases at fret range boundaries.
9. Export the foundation utilities from `canvas/index.ts` and re-export through `src/components/fretboard/index.ts`.

## Technical Notes
- Keep geometry pure and framework-agnostic.
- Do not use DOM APIs in geometry helpers.
- Use deterministic floating-point calculations; avoid random values.

## Acceptance Criteria
- Geometry helpers are covered by tests.
- Mapping is stable across common ranges like `[0, 12]` and `[0, 24]`.
- Hit-testing returns expected `FretPosition` for center points of cells.

## Verification Commands
- `yarn test src/components/fretboard/canvas/geometry.test.ts`
- `yarn typecheck`
- `yarn lint`

## Out Of Scope
- No actual canvas drawing in this task.
- No React component replacement yet.
