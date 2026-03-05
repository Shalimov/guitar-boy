# T09: Remaining Delivery Backlog (Execution Guide For Support LLMs)

## Objective
Define the remaining product work as execution-ready tasks that less capable but reliable LLMs can complete safely.

## Current State (2026-03-05)
- Fretboard rendering is canvas-based and includes Konva-assisted pointer hotspots.
- String visuals are inverted to match typical fretboard diagrams.
- Fret numbers are rendered below the board.
- Whiteboard CRUD and diagram editing exist with connect-mode line creation.
- Learning and Quiz pages are still placeholders.
- Unit/component tests, lint, typecheck, and build are passing.

## How To Use This File
1. Execute one task at a time, in order.
2. Read all listed files before editing.
3. Keep edits scoped to the task file list.
4. Run all verification commands before marking task complete.
5. If a requirement is unclear, stop and ask the user.

## Global Quality Gate (Run For Every Task)
- `yarn format`
- `yarn lint`
- `yarn typecheck`
- `yarn test`
- `yarn build`

## Task Order
1. `R01` Spec And Source Reconciliation
2. `R02` Konva Interaction Hardening
3. `R03` Accessibility And Keyboard Contract Pass
4. `R04` Whiteboard Editing UX Completion
5. `R05` Learning Mode MVP
6. `R06` Quiz Mode MVP (Notes)
7. `R07` Quiz Expansion (Intervals + Chords)
8. `R08` Performance And Release Gates

---

## R01: Spec And Source Reconciliation
### Priority
High

### Goal
Make specs and design docs accurately reflect current implementation.

### Read
- `specs/001-fretboard-learning-app/spec.md`
- `specs/001-fretboard-learning-app/tasks.md`
- `TECH_DESIGN.md`
- `specs/cdx_tasks/README.md`
- `src/components/fretboard/CanvasFretboard.tsx`

### Edit
- `specs/001-fretboard-learning-app/spec.md`
- `specs/001-fretboard-learning-app/tasks.md`
- `TECH_DESIGN.md`
- `specs/cdx_tasks/README.md`

### Steps
1. Remove stale claims (for example "canvas not implemented").
2. Mark Learning and Quiz as missing/incomplete.
3. Ensure task IDs and statuses are unique and non-contradictory.
4. Add a "Current Implementation Status" section with implemented/partial/missing entries.

### Acceptance Criteria
- No placeholder template tokens remain.
- No duplicate task IDs with conflicting status.
- Documentation state matches code reality.

### Support LLM Prompt
```text
Update product docs to match current code state. Do not edit src/ files. Remove stale claims and make implementation status explicit.
```

---

## R02: Konva Interaction Hardening
### Priority
High

### Depends On
R01

### Goal
Make pointer interaction robust across mouse and touch.

### Read
- `src/components/fretboard/CanvasFretboard.tsx`
- `src/components/fretboard/canvas/geometry.ts`
- `src/components/fretboard/CanvasFretboard.test.tsx`

### Edit
- `src/components/fretboard/CanvasFretboard.tsx`
- `src/components/fretboard/CanvasFretboard.test.tsx`

### Steps
1. Remove duplicate-trigger paths (`click` + `tap` firing same action).
2. Add mode-specific hotspot sizes (`view`, `click-select`, `draw`, `test`, `patterns`).
3. Improve drag-line reliability when pointer exits hotspot bounds.
4. Confirm view mode has no pointer interactions.

### Acceptance Criteria
- One user gesture triggers one logical action.
- Draw-mode line creation is reliable on mouse and touch.
- No accidental toggles in non-draw modes.

### Support LLM Prompt
```text
Harden Konva event handling in CanvasFretboard. Keep existing public props and callback semantics unchanged.
```

---

## R03: Accessibility And Keyboard Contract Pass
### Priority
High

### Depends On
R02

### Goal
Guarantee keyboard and screen-reader parity with pointer behavior.

### Read
- `src/components/fretboard/CanvasFretboard.tsx`
- `src/components/fretboard/Fretboard.test.tsx`
- `src/components/fretboard/CanvasFretboard.test.tsx`
- `src/types/diagram.ts`

### Edit
- `src/components/fretboard/CanvasFretboard.tsx`
- `src/components/fretboard/Fretboard.test.tsx`
- `src/components/fretboard/CanvasFretboard.test.tsx`

### Steps
1. Verify arrow-key behavior matches inverted visual string layout.
2. Ensure Enter/Space activation works in all interactive modes.
3. Validate ARIA labels include string, fret, note, and state hints.
4. Add tests for keyboard-only flows and focus movement.

### Acceptance Criteria
- Full interaction possible with keyboard only.
- ARIA labels remain correct after visual inversion and mode overlays.
- Tests cover behavior, not just static text.

### Support LLM Prompt
```text
Improve CanvasFretboard accessibility and keyboard semantics while preserving existing visual behavior and props.
```

---

## R04: Whiteboard Editing UX Completion
### Priority
Medium

### Depends On
R03

### Goal
Make diagram authoring resilient and user-friendly.

### Read
- `src/pages/whiteboard/DiagramEditor.tsx`
- `src/pages/whiteboard/AnnotationToolbar.tsx`
- `src/pages/whiteboard/WhiteboardPage.tsx`
- `src/pages/whiteboard/DiagramEditor.test.tsx`

### Edit
- `src/pages/whiteboard/DiagramEditor.tsx`
- `src/pages/whiteboard/AnnotationToolbar.tsx`
- `src/pages/whiteboard/DiagramEditor.test.tsx`

### Optional Create
- `src/pages/whiteboard/useDiagramHistory.ts`
- `src/pages/whiteboard/useDiagramHistory.test.ts`

### Steps
1. Add undo/redo for dot and line operations.
2. Add explicit "cancel pending connection" control for connect mode.
3. Add "clear diagram" action with confirmation.
4. Keep saved metadata complete (dot shape/color/label, line style/color).

### Acceptance Criteria
- User can recover from mistakes quickly.
- Connect-mode state is visible and cancellable.
- Save/reload preserves full diagram fidelity.

### Support LLM Prompt
```text
Improve DiagramEditor usability with undo/redo and clear/cancel actions. Preserve existing storage shape and tests.
```

---

## R05: Learning Mode MVP
### Priority
High

### Depends On
R01

### Goal
Replace placeholder Learning page with a usable lesson flow.

### Read
- `src/pages/learning/LearningPage.tsx`
- `src/lib/music.ts`
- `src/components/fretboard/Fretboard.tsx`
- `src/hooks/useProgressStore.ts`

### Edit
- `src/pages/learning/LearningPage.tsx`

### Create
- `src/pages/learning/LearningPage.test.tsx`
- Optional: `src/pages/learning/components/*.tsx`

### Steps
1. Implement one complete lesson path (for example note-name mapping basics).
2. Add step navigation with clear completion state.
3. Integrate fretboard visual highlights for lesson steps.
4. Add "Start Quiz" transition CTA.

### Acceptance Criteria
- Learning page is functional (not placeholder text).
- At least one lesson can be completed end to end.
- Basic tests exist for rendering and lesson progression.

### Support LLM Prompt
```text
Implement LearningPage MVP with one complete guided lesson flow and tests. Reuse existing music and fretboard modules.
```

---

## R06: Quiz Mode MVP (Notes)
### Priority
High

### Depends On
R05

### Goal
Build the first complete quiz loop with persistence.

### Read
- `src/pages/quiz/QuizPage.tsx`
- `src/lib/music.ts`
- `src/lib/srs.ts`
- `src/hooks/useProgressStore.ts`
- `src/types/srs.ts`

### Edit
- `src/pages/quiz/QuizPage.tsx`

### Create
- `src/pages/quiz/QuizPage.test.tsx`
- Optional: `src/lib/quiz/note-quiz.ts`

### Steps
1. Generate note questions within configured fret range.
2. Accept answers from fretboard interactions.
3. Provide immediate correctness feedback.
4. Track score and finish summary.
5. Persist session record and card update through progress store.

### Acceptance Criteria
- User can complete a full note quiz session.
- Session appears in history and affects dashboard metrics.
- Tests cover happy path and at least one edge case.

### Support LLM Prompt
```text
Build a note quiz MVP in QuizPage with real scoring, feedback, and persistence using existing SRS and progress store hooks.
```

---

## R07: Quiz Expansion (Intervals + Chords)
### Priority
Medium

### Depends On
R06

### Goal
Add interval and chord quiz modes and ensure dashboard values are meaningful.

### Read
- `src/pages/quiz/QuizPage.tsx`
- `src/pages/dashboard/DashboardPage.tsx`
- `src/lib/music.ts`
- `src/types/srs.ts`

### Edit
- `src/pages/quiz/QuizPage.tsx`
- `src/pages/dashboard/DashboardPage.tsx` (only if needed for mode display)

### Create
- `src/pages/quiz/quiz-modes.test.tsx` (or extend `QuizPage.test.tsx`)

### Steps
1. Add quiz mode selector (`note`, `interval`, `chord`).
2. Implement question generation and validation for intervals and chords.
3. Persist mode-specific sessions using existing `mode` values.
4. Verify dashboard cards are fed by real session data.

### Acceptance Criteria
- All three modes run end to end.
- Session records are mode-accurate.
- Dashboard metrics reflect completed sessions.

### Support LLM Prompt
```text
Extend QuizPage to interval and chord modes while keeping note mode stable and preserving persisted data compatibility.
```

---

## R08: Performance And Release Gates
### Priority
Medium

### Depends On
R07

### Goal
Ensure smooth interaction and define measurable release criteria.

### Read
- `src/components/fretboard/CanvasFretboard.tsx`
- `src/components/fretboard/canvas/render.ts`
- `specs/cdx_tasks/T08-performance-release-gates.md`

### Edit
- `src/components/fretboard/CanvasFretboard.tsx`
- `src/components/fretboard/canvas/render.ts`

### Create
- `specs/cdx_tasks/release-checklist.md`
- Optional: `src/lib/perf.ts`

### Steps
1. Measure interaction latency and initial render time.
2. Reduce avoidable rerenders and expensive recomputation.
3. Document baseline and optimized numbers.
4. Define ship gates (max latency, no jank, all checks green).

### Suggested Budgets
- Initial fretboard render: < 16ms on typical laptop.
- Click to visual response: < 50ms.
- Whiteboard remains responsive with 50+ diagrams.

### Acceptance Criteria
- Release checklist exists with real numbers.
- Performance budgets are met or explicitly waived with rationale.
- All quality checks pass.

### Support LLM Prompt
```text
Optimize performance for canvas and interaction-heavy paths, then document measurable release gates with before/after numbers.
```

---

## Final Completion Criteria
- Learning and Quiz are no longer placeholders.
- Fretboard interaction is stable across mouse, touch, and keyboard.
- Whiteboard editing has recovery affordances (undo/redo or equivalent).
- Documentation is aligned with the real codebase.
- Full quality gate passes at each milestone.
