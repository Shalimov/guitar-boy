# CDX Task Pack: Codebase Improvements + Visual Refresh + Canvas Fretboard

## Purpose
This folder contains execution-ready tasks for simpler coding agents.
Each task is independent, but there is a required execution order because later tasks depend on earlier architecture decisions.

## Current Snapshot (2026-03-05)
- `specs/001-fretboard-learning-app/spec.md` has been updated with accurate implementation status.
- `specs/001-fretboard-learning-app/tasks.md` shows 87/151 tasks complete, no duplicate IDs.
- `src/components/fretboard/CanvasFretboard.tsx` is canvas-based with Konva pointer interactions.
- `ConnectionLine` rendering is implemented in CanvasFretboard via Konva Line shapes.
- `DiagramEditor` has toolbar controls for connect mode and line style, with line drawing behavior wired.
- `LearningPage` and `QuizPage` are still placeholders (implementation pending).
- Visual system uses Tailwind CSS v4 with utility-first approach.

## Execution Order
1. `T01-spec-source-reconciliation.md`
2. `T02-visual-system-refresh.md`
3. `T03-canvas-foundation.md`
4. `T04-canvas-rendering.md`
5. `T05-canvas-interactions-accessibility.md`
6. `T06-whiteboard-integration.md`
7. `T07-test-contract-hardening.md`
8. `T08-performance-release-gates.md`
9. `T09-remaining-delivery-backlog.md` (active remaining scope)

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
- `T09-remaining-delivery-backlog.md` reflects the current active remaining work and dependency order.
