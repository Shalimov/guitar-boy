# Implementation Plan: Fretboard Learning App

**Branch**: `001-fretboard-learning-app` | **Date**: 2026-03-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fretboard-learning-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A single-page React web application that helps guitar players learn note positions on the fretboard, understand intervals, and build chords using a shared Fretboard component. Progress is tracked locally using spaced-repetition (SM-2 algorithm). Features include: Whiteboard mode for free exploration, Learning mode with guided lessons, and Quiz modes for note recognition, interval training, and chord building.

## Technical Context

**Language/Version**: TypeScript 5.9.3  
**Primary Dependencies**: React 19.2.4, React Router 7.13.1, Tailwind CSS 4.2.1  
**Storage**: localStorage (browser storage, no backend)  
**Testing**: Jest 30.2.0, React Testing Library 16.3.2, @swc/jest 0.2.39  
**Target Platform**: Modern web browsers (ES2022)
**Project Type**: Single-page web application  
**Performance Goals**: Dashboard loads under 200ms, 50+ diagrams stored without lag  
**Constraints**: Offline-capable, client-side only, <200ms interaction response  
**Scale/Scope**: 4 main modes, 13 guided lessons, 4 quiz types, 50+ built-in patterns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Readability ✅
- Variable and function names will clearly express intent (e.g., `getNoteAtFret`, `calculateInterval`)
- Complex music theory logic will be broken into smaller, named helper functions
- Magic numbers will be replaced with named constants (e.g., `FRET_COUNT = 24`)
- Comments will explain "why" for domain-specific music theory concepts

### II. Test Quality - Protection Against Regression ✅
- All new features will have tests written before implementation (TDD)
- Unit tests required for pure functions in `src/lib/` (music theory, SRS algorithm)
- Component tests required for interactive components (Fretboard, Quiz modes)
- Test coverage target: 100% for `src/lib/`, ≥80% for components
- Integration tests will validate complete user flows

### III. Test Quality - Resistance to Refactoring ✅
- Component tests will use React Testing Library's user-centric queries
- Tests will NOT access internal component state
- Tests will interact with components as users do
- Test names will describe user-facing behavior

### IV. Test Quality - Maintainability ✅
- Test files will follow AAA pattern: Arrange, Act, Assert
- Shared test setup will use `beforeEach`/`afterEach` hooks
- Test files will be colocated with source files or in parallel `tests/` structure
- Giant test files (>300 lines) will be split by feature/behavior

### V. Simplicity First ✅
- Using built-in React features (Context, useReducer) instead of external state libraries
- Starting with simplest solution: localStorage for persistence, no backend
- Code justified by current requirements, not hypothetical future needs
- When complexity is necessary (e.g., SRS algorithm), will document why

**GATE STATUS**: ✅ PASS - All principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
guitar-boy/
├── public/                         # Static assets
├── src/
│   ├── index.tsx                   # Entry point — mounts React app
│   ├── index.css                   # Global styles + Tailwind import
│   ├── App.tsx                     # Root component with routing
│   ├── components/
│   │   ├── fretboard/              # <Fretboard> — core reusable component
│   │   ├── layout/                 # Layout shell (Navbar, footer)
│   │   │   └── Layout.tsx
│   │   └── ui/                     # Shared UI primitives (buttons, cards, etc.)
│   ├── pages/
│   │   ├── dashboard/              # Dashboard / landing page
│   │   │   └── DashboardPage.tsx
│   │   ├── whiteboard/             # Fretboard whiteboard (draw mode)
│   │   │   └── WhiteboardPage.tsx
│   │   ├── learning/               # Guided lessons + explorer
│   │   │   └── LearningPage.tsx
│   │   └── quiz/                   # Quiz modes (notes, intervals, chords)
│   │       └── QuizPage.tsx
│   ├── hooks/                      # Custom React hooks (useLocalStorage, etc.)
│   ├── lib/                        # Pure utility functions
│   │   ├── music.ts                # Music theory helpers (getNoteAtFret, etc.)
│   │   └── music.test.ts           # Unit tests for music helpers
│   ├── types/                      # Shared TypeScript types
│   │   ├── index.ts                # Barrel exports
│   │   ├── music.ts                # NoteName, FretPosition, IntervalName, etc.
│   │   └── fretboard.ts            # MarkedDot, ConnectionLine, FretboardState
│   ├── __mocks__/                  # Jest file mocks
│   │   └── fileMock.ts
│   └── test-setup.ts               # Jest setup (jest-dom matchers)
├── biome.json                      # Biome config (linter + formatter)
├── jest.config.ts                  # Jest config (SWC transform, jsdom)
├── postcss.config.mjs              # PostCSS config (Tailwind v4)
├── rsbuild.config.ts               # Rsbuild config (React plugin, aliases)
├── tsconfig.json                   # TypeScript config
├── env.d.ts                        # Global type declarations (SVG, PNG, Rsbuild)
├── package.json                    # Dependencies and scripts
├── yarn.lock                       # Yarn lockfile
└── .yarnrc.yml                     # Yarn config (node-modules linker)
```

**Structure Decision**: Single-page React application using standard React project structure with feature-based organization under `src/pages/` and shared components in `src/components/`. Pure utility functions isolated in `src/lib/` for maximum testability. Tests colocated with source files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

**No violations found**. All design decisions align with Constitution principles.

---

## Post-Design Constitution Check (Phase 1 Complete)

*Re-evaluation after completing research.md, data-model.md, contracts/, and quickstart.md*

### I. Code Readability ✅ MAINTAINED
- **Design Decision**: Pure functions in `src/lib/` with descriptive names (e.g., `getNoteAtFret`, `calculateInterval`)
- **Design Decision**: Fretboard component with clear mode-based API
- **Design Decision**: Type definitions in dedicated `src/types/` directory
- **No violations introduced**

### II. Test Quality - Protection Against Regression ✅ MAINTAINED
- **Design Decision**: 100% coverage requirement for `src/lib/` documented in contracts
- **Design Decision**: Test examples provided in contracts for all library functions
- **Design Decision**: AAA pattern enforced in test templates
- **No violations introduced**

### III. Test Quality - Resistance to Refactoring ✅ MAINTAINED
- **Design Decision**: Component tests use React Testing Library user-centric queries (documented in quickstart.md)
- **Design Decision**: Tests focus on behavior (e.g., "displays correct note when fret is clicked")
- **Design Decision**: No internal state access in tests
- **No violations introduced**

### IV. Test Quality - Maintainability ✅ MAINTAINED
- **Design Decision**: Tests colocated with source files
- **Design Decision**: Test file naming convention: `*.test.ts` / `*.test.tsx`
- **Design Decision**: Shared setup in `beforeEach` hooks (documented in examples)
- **No violations introduced**

### V. Simplicity First ✅ MAINTAINED
- **Design Decision**: localStorage for persistence (no backend)
- **Design Decision**: React Context + useReducer (no Redux/Zustand)
- **Design Decision**: Single Fretboard component with mode prop (not 3 separate components)
- **Complexity Justification**: SM-2 algorithm complexity is documented and necessary for spaced repetition
- **No unjustified complexity introduced**

### Overall Assessment ✅ PASS

**All Constitution principles maintained through Phase 1 design.**

**Key Strengths**:
1. Clear separation of concerns (types, lib, components, pages)
2. Test-first approach embedded in contracts and quickstart
3. Simplicity prioritized (no external state library, no backend)
4. Accessibility requirements included in component contracts

**No concerns identified**. Ready to proceed to Phase 2 (Implementation Tasks).

---

## Phase 1 Artifacts Generated

- ✅ `research.md` - All technical decisions documented, no NEEDS CLARIFICATION items
- ✅ `data-model.md` - 13 entities defined with validation rules and state transitions
- ✅ `contracts/components.md` - 10 component interfaces + 1 hook contract
- ✅ `contracts/libraries.md` - 12 library function contracts with test requirements
- ✅ `quickstart.md` - Developer onboarding guide with examples
- ✅ Agent context updated (AGENTS.md)

**Status**: Phase 1 (Design & Contracts) complete. Ready for Phase 2 (Implementation Tasks) via `/speckit.tasks` command.
