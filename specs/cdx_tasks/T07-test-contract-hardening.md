# T07: Test And Contract Hardening

## Objective
Upgrade the test suite so it validates real behavior and contract guarantees instead of superficial rendering checks.

## Why This Task Exists
Current tests include weak assertions such as checking for string labels only, while important behaviors are unverified (line rendering, state sync, accessibility keyboard flow).

## Read First
- `specs/001-fretboard-learning-app/contracts/components.md`
- `src/components/fretboard/Fretboard.test.tsx`
- `src/components/fretboard/CanvasFretboard.test.tsx`
- `src/pages/whiteboard/DiagramEditor.test.tsx`
- `src/pages/whiteboard/WhiteboardPage.test.tsx`
- `src/pages/dashboard/DashboardPage.test.tsx`

## Files To Edit
- `src/components/fretboard/Fretboard.test.tsx`
- `src/components/fretboard/CanvasFretboard.test.tsx`
- `src/pages/whiteboard/DiagramEditor.test.tsx`
- `src/pages/whiteboard/WhiteboardPage.test.tsx`
- `src/pages/dashboard/DashboardPage.test.tsx`

## Files To Create
- `specs/cdx_tasks/contract-compliance-matrix.md`

## Implementation Steps
1. Create a contract matrix document mapping each contract guarantee to one or more test files.
2. Replace weak tests with behavior-driven assertions.
3. Add explicit tests for:
   - line rendering from `state.lines`,
   - draw mode callbacks (`onFretClick`, `onLineDrawn`),
   - keyboard navigation and activation,
   - state prop updates after initial mount,
   - overlay rendering for correct/missed/incorrect positions.
4. In whiteboard tests, assert persistence of line and dot metadata after save/load.
5. Keep tests resilient to refactoring by avoiding implementation-detail selectors.
6. Remove redundant tests that only assert static text unrelated to behavior.

## Acceptance Criteria
- Contract matrix exists and is actionable.
- Every critical `Fretboard` contract behavior has at least one direct test.
- Whiteboard integration tests cover connect mode and persistence path.
- Test suite remains green.

## Verification Commands
- `yarn test`
- `yarn test:coverage`
- `yarn typecheck`
- `yarn lint`

## Out Of Scope
- No new user-facing features beyond what tests require.
