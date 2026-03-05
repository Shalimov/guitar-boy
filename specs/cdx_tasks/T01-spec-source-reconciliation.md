# T01: Spec And Source Reconciliation

## Objective
Align specification documents with the actual codebase state so future implementation tasks are based on accurate source-of-truth docs.

## Why This Task Exists
Current docs and code disagree in critical areas:
- `spec.md` is still template content.
- `tasks.md` has duplicate task IDs with conflicting completion state.
- Technical design notes mention architecture patterns that are not fully reflected in code.

Without this cleanup, later coding agents will implement the wrong thing.

## Read First
- `specs/001-fretboard-learning-app/spec.md`
- `specs/001-fretboard-learning-app/plan.md`
- `specs/001-fretboard-learning-app/tasks.md`
- `specs/001-fretboard-learning-app/contracts/components.md`
- `fretboard-app-design.md`
- `TECH_DESIGN.md`
- `src/components/fretboard/Fretboard.tsx`
- `src/pages/whiteboard/DiagramEditor.tsx`
- `src/pages/learning/LearningPage.tsx`
- `src/pages/quiz/QuizPage.tsx`

## Files To Edit
- `specs/001-fretboard-learning-app/spec.md`
- `specs/001-fretboard-learning-app/tasks.md`
- `TECH_DESIGN.md`

## Implementation Steps
1. Replace template placeholders in `spec.md` with real content from current product intent.
2. Keep the scope honest: dashboard and whiteboard are partially implemented, learning and quiz are mostly stubs.
3. Add a "Current Implementation Status" section in `spec.md` with explicit "implemented / partial / missing" entries.
4. Clean `tasks.md` so each task ID appears exactly once.
5. Remove contradictory duplicated sections and ensure checkboxes represent real completion state.
6. Add a short "Known Gaps" section in `tasks.md` that points to `specs/cdx_tasks/`.
7. Update `TECH_DESIGN.md` so architecture statements match real code. Do not claim features that are not implemented.
8. Preserve historical context where useful, but make current status unambiguous.

## Acceptance Criteria
- `spec.md` has no template placeholders.
- `tasks.md` has no duplicate task IDs.
- At least one section explicitly lists unimplemented areas (learning flow, quiz flow, canvas fretboard).
- `TECH_DESIGN.md` does not claim implemented behavior that is currently absent.

## Verification Commands
- `rg "\[FEATURE NAME\]|\$ARGUMENTS|\[###-feature-name\]" specs/001-fretboard-learning-app/spec.md`
- `rg "T081|T082" specs/001-fretboard-learning-app/tasks.md -n`
- `yarn lint`

## Out Of Scope
- No production source-code changes in `src/` for this task.
- No visual redesign in this task.
- No canvas rendering in this task.
