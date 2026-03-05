# CDX Task Pack: Codebase Improvements + Visual Refresh + Canvas Fretboard

## Purpose
This folder contains execution-ready tasks for simpler coding agents.
Each task is independent, but there is a required execution order because later tasks depend on earlier architecture decisions.

## Current Snapshot (2026-03-05)
- `specs/001-fretboard-learning-app/spec.md` is still template text and does not describe the real feature.
- `specs/001-fretboard-learning-app/tasks.md` contains conflicting duplicate sections (for example duplicated `T081` and `T082` with different statuses).
- `src/components/fretboard/Fretboard.tsx` is a div/button grid renderer, not canvas-based.
- `ConnectionLine` exists in types but line rendering is not implemented in the current fretboard view.
- `DiagramEditor` has toolbar controls for connect mode and line style, but line drawing behavior is not wired.
- `LearningPage` and `QuizPage` are still placeholders.
- Visual system is very minimal and mostly utility defaults (gray/blue scale), with no distinct design language.

## Execution Order
1. `T01-spec-source-reconciliation.md`
2. `T02-visual-system-refresh.md`
3. `T03-canvas-foundation.md`
4. `T04-canvas-rendering.md`
5. `T05-canvas-interactions-accessibility.md`
6. `T06-whiteboard-integration.md`
7. `T07-test-contract-hardening.md`
8. `T08-performance-release-gates.md`

## Agent Operating Rules
- Run one task file at a time.
- Do not skip the "Verification Commands" section.
- If a step requires assumptions, stop and ask the user instead of guessing.
- Keep changes scoped to the current task file.
- Preserve existing behavior unless the task explicitly changes it.
- Prefer incremental commits after each task.

## Required Quality Commands
Use package scripts and AGENTS-approved checks:
- `yarn format`
- `yarn lint`
- `yarn typecheck`
- `yarn test`
- `yarn build`

Optional file-scoped Biome commands for large refactors:
- `yarn exec biome check --write <files>`
- `yarn exec biome format --write <files>`

## Definition Of Complete For This Folder
- All task markdown files are present.
- Tasks are executable by a less capable coding agent without extra context.
- Each task includes file targets, implementation steps, acceptance criteria, and verification commands.
