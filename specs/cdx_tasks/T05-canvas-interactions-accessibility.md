# T05: Canvas Interactions And Accessibility

## Objective
Add full interaction behavior and accessibility parity so the canvas fretboard satisfies existing component contracts.

## Read First
- `src/components/fretboard/Fretboard.tsx`
- `src/components/fretboard/CanvasFretboard.tsx`
- `src/components/fretboard/Fretboard.test.tsx`
- `src/types/diagram.ts`
- `specs/001-fretboard-learning-app/contracts/components.md`

## Files To Edit
- `src/components/fretboard/Fretboard.tsx`
- `src/components/fretboard/CanvasFretboard.tsx`
- `src/components/fretboard/Fretboard.test.tsx`
- `src/components/fretboard/CanvasFretboard.test.tsx`

## Optional New Files
- `src/components/fretboard/useFretboardInteraction.ts`
- `src/components/fretboard/useFretboardInteraction.test.ts`

## Implementation Steps
1. Convert `Fretboard.tsx` into a stable wrapper around canvas rendering + interaction wiring.
2. Ensure `state` prop changes are reflected immediately (remove stale internal-state-only behavior).
3. Implement click-select mode on canvas hit-tested cells and call `onFretClick(pos)`.
4. Implement draw mode dot toggling behavior.
5. Implement line drawing behavior between existing dots and fire `onLineDrawn(from, to)`.
6. Add keyboard navigation using arrow keys and Enter/Space activation.
7. Add ARIA semantics with grid-like structure. If needed, use a visually hidden semantic layer mapped to fret positions.
8. Respect `ariaLabel` prop and meaningful per-cell labels including note name.
9. Add validation guards:
   - invalid `fretRange` should be normalized safely,
   - invalid string count should fall back to standard EADGBe.
10. Keep mode semantics consistent with component contract docs.

## Testing Guidance
- Update tests to verify behavior, not just "renders E text".
- Add tests for keyboard navigation and activation callbacks.
- Add tests for state synchronization when parent updates `state` prop.
- Add tests for `onLineDrawn` being called in draw mode.

## Acceptance Criteria
- View, click-select, and draw modes all work on canvas.
- Accessibility semantics exist and are testable.
- Callback behavior matches the contract guarantees.
- Invalid prop input does not crash the component.

## Verification Commands
- `yarn test src/components/fretboard/Fretboard.test.tsx`
- `yarn test src/components/fretboard/CanvasFretboard.test.tsx`
- `yarn typecheck`
- `yarn lint`

## Out Of Scope
- No toolbar/business logic changes in whiteboard page yet.
