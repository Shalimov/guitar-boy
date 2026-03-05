# T04: Canvas Static Rendering

## Objective
Implement the canvas drawing pipeline for the fretboard surface, markers, dots, and connection lines.

## Read First
- `src/components/fretboard/Fretboard.tsx`
- `src/types/fretboard.ts`
- `src/components/fretboard/canvas/types.ts`
- `src/components/fretboard/canvas/geometry.ts`
- `specs/001-fretboard-learning-app/contracts/components.md`

## Files To Create
- `src/components/fretboard/canvas/render.ts`
- `src/components/fretboard/canvas/render.test.ts`
- `src/components/fretboard/CanvasFretboard.tsx`
- `src/components/fretboard/CanvasFretboard.test.tsx`

## Files To Edit
- `src/components/fretboard/canvas/index.ts`
- `src/components/fretboard/index.ts`

## Implementation Steps
1. In `render.ts`, implement `drawFretboardSurface(ctx, metrics, options)`.
2. Draw nut, frets, and strings with clear visual hierarchy.
3. Draw inlay markers at standard frets (3, 5, 7, 9, 12 and repeating if range extends).
4. Implement `drawConnectionLines(ctx, metrics, lines)` with support for `solid` and `dashed` styles.
5. Implement `drawDots(ctx, metrics, dots)` with support for `circle`, `square`, `diamond`, custom colors, and labels.
6. Apply overlay styling for `selectedPositions`, `correctPositions`, `missedPositions`, and `incorrectPositions`.
7. Implement `CanvasFretboard.tsx` for view-only rendering using a `<canvas>` element and existing props.
8. Add high-DPI scaling support (`devicePixelRatio`) to avoid blurry canvas output.
9. Ensure rerender is deterministic when props change.
10. Keep DOM labels for string names and fret numbers outside canvas for readability and accessibility.

## Testing Guidance
- In `render.test.ts`, mock `CanvasRenderingContext2D` and verify drawing call sequences.
- In `CanvasFretboard.test.tsx`, test rerender behavior and presence of canvas plus labels.
- Add at least one test that verifies line rendering is invoked when `state.lines` is not empty.

## Acceptance Criteria
- `ConnectionLine[]` is visibly rendered, unlike the current implementation.
- Dot shape and color metadata are respected in rendering.
- Fretboard remains readable across `fretRange={[0, 12]}` and `fretRange={[0, 24]}`.

## Verification Commands
- `yarn test src/components/fretboard/CanvasFretboard.test.tsx`
- `yarn test src/components/fretboard/canvas/render.test.ts`
- `yarn typecheck`
- `yarn lint`

## Out Of Scope
- No click/drag interaction logic yet.
- No whiteboard editor integration yet.
