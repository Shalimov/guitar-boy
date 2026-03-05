# Implementation Plan: Hide Notes During Test Mode

**Branch**: `002-fretboard-hide-notes` | **Date**: 2026-03-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-fretboard-hide-notes/spec.md`

## Summary

Add conditional note label visibility to the fretboard component's test mode. Note labels will be hidden during quiz questions and revealed only after answer submission (when feedback positions are present). This ensures students cannot see correct answers before attempting to identify notes, improving the assessment validity of quizzes.

**Technical Approach**: Extend the existing `drawDots` rendering function in `src/components/fretboard/canvas/render.ts` to accept a `hideLabels` option. When in test mode, labels will be hidden unless feedback positions (correct/missed/incorrect) are present, indicating the answer has been submitted.

## Technical Context

**Language/Version**: TypeScript 5.9.3  
**Primary Dependencies**: React 19.2.4, React Router 7.13.1, Konva 10.2.0, react-konva 19.2.3  
**Storage**: Browser localStorage (via custom hooks)  
**Testing**: Jest with @swc/jest, @testing-library/react 16.3.2  
**Target Platform**: Web browser (modern evergreen browsers)  
**Project Type**: Web application (SPA)  
**Performance Goals**: 60fps canvas rendering, <100ms state transitions  
**Constraints**: Offline-capable, no network requests, client-side only  
**Scale/Scope**: Single-user local app, ~50 diagrams max in localStorage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gate: ✅ PASS

- **Principle I - Code Readability**: ✅ Feature involves adding a simple boolean flag to existing rendering logic. Clear naming: `hideLabels` or `showLabels` will make intent obvious.
- **Principle II - Test Quality - Protection**: ✅ New tests required. Must cover:
  - Labels hidden in test mode before submission
  - Labels visible in test mode after submission
  - Labels visible in non-test modes (regression protection)
  - Edge case: mode switching mid-quiz
- **Principle III - Test Quality - Refactoring Resistance**: ✅ Tests will verify behavior (labels visible/not visible) not implementation details. Using visual queries and canvas snapshots.
- **Principle IV - Test Quality - Maintainability**: ✅ Tests will follow AAA pattern, use clear test data, and be colocated with existing fretboard tests.
- **Principle V - Simplicity First**: ✅ Simplest solution: add a boolean flag to rendering options. No new libraries, patterns, or abstractions needed.

**Verdict**: No constitution violations. Feature aligns with all principles. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-fretboard-hide-notes/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── fretboard/
│       ├── CanvasFretboard.tsx       # Main component (MODIFY)
│       ├── canvas/
│       │   └── render.ts             # Dot rendering logic (MODIFY)
│       └── CanvasFretboard.test.tsx  # Tests (MODIFY)
├── types/
│   └── diagram.ts                    # FretboardProps interface (REVIEW - no changes needed)
└── pages/
    └── quiz/
        ├── QuizRunner.tsx            # Quiz logic (REVIEW - may need state prop)
        └── ReviewMode.tsx            # Review mode (REVIEW - may need state prop)

tests/ (N/A - tests colocated with source)
```

**Structure Decision**: Single project structure. Changes are localized to the fretboard component and its rendering logic. No new files or directories needed.

## Complexity Tracking

> No complexity violations detected. Feature uses existing patterns and requires minimal changes.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
