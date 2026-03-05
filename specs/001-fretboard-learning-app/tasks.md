# Implementation Tasks: Fretboard Learning App

**Feature**: Fretboard Learning App  
**Branch**: `001-fretboard-learning-app`  
**Date**: 2026-03-04  
**Status**: In Progress (Implementation Diverges From Plan)

---

## Overview

This document provides a comprehensive, task-by-task implementation plan for the Fretboard Learning App, Tasks are organized by user story to enable independent development, testing, and delivery of incremental value.

**Total Tasks**: 146  
**User Stories**: 4 (P1, P2, P3, P4)  
**Approach**: TDD (Test-Driven Development) - Constitution requires tests before implementation

## Known Gaps (2026-03-05)

- `spec.md` and code were previously out of sync; this task file is now treated as a historical plan plus current status tracker.
- Whiteboard connect-mode and line rendering are still incomplete in production code even though earlier checklist items were marked complete.
- Fretboard is still DOM-grid based and has not yet migrated to canvas.
- Learn and Quiz routes are still placeholder pages.
- Active remediation and execution-ready steps live in `specs/cdx_tasks/`.

---

## Phase 1: Setup (Project Initialization)

**Goal**: Initialize project structure, configuration, and dependencies

**Duration**: ~2 hours

### Configuration Files

- [X] T001 Create rsbuild.config.ts with React plugin and path aliases
- [X] T002 Create tsconfig.json with strict mode, ES2022 target, and @/* path mapping
- [X] T003 Create biome.json with tabs, double quotes, semicolons, and recommended rules
- [X] T004 Create jest.config.ts with SWC transform, jsdom environment, and path aliases
- [X] T005 [P] Create postcss.config.mjs with Tailwind CSS v4 plugin
- [X] T006 [P] Create .yarnrc.yml with node-modules linker
- [X] T007 [P] Create env.d.ts with ambient types for static assets and Rsbuild

### Project Structure

- [X] T008 Create src/index.tsx entry point that mounts React app
- [X] T009 Create src/index.css with global styles and Tailwind import
- [X] T010 Create src/App.tsx root component with routing setup
- [X] T011 [P] Create src/__mocks__/fileMock.ts for Jest file mocking
- [X] T012 [P] Create src/test-setup.ts with jest-dom matchers

### Verification

- [X] T013 Run `yarn install` to install dependencies
- [X] T014 Run `yarn typecheck` to verify TypeScript configuration
- [X] T015 Run `yarn lint` to verify Biome configuration
- [X] T016 Run `yarn test` to verify Jest configuration (should find no tests yet)

**Checkpoint**: Setup complete. All configuration files created and verified.

---

## Phase 2: Foundational (Core Types & Utilities)

**Goal**: Create shared types, utilities, and hooks needed by all user stories

**Duration**: ~6 hours

**CRITICAL**: This phase blocks all user story phases. Must complete before starting any user story.

### TypeScript Type Definitions

- [X] T017 [P] Create src/types/music.ts with NoteName, FretPosition, IntervalName, TriadQuality types
- [X] T018 [P] Create src/types/fretboard.ts with MarkedDot, ConnectionLine, FretboardState types
- [X] T019 [P] Create src/types/srs.ts with CardCategory, SRSCard, SessionRecord types
- [X] T020 [P] Create src/types/storage.ts with ProgressStore, DiagramStore, UserSettings types
- [X] T021 [P] Create src/types/index.ts with barrel exports for all types

### Core Library Functions (Music Theory)

#### Tests First (TDD Required)

- [X] T022 [P] Create tests for getNoteAtFret in src/lib/music.test.ts
- [X] T023 [P] Create tests for getInterval in src/lib/music.test.ts
- [X] T024 [P] Create tests for getChordTones in src/lib/music.test.ts
- [X] T025 [P] Create tests for isChordCorrect in src/lib/music.test.ts
- [X] T026 [P] Create tests for getAllPositionsOfNote in src/lib/music.test.ts

#### Implementation

- [X] T027 [P] Implement getNoteAtFret function in src/lib/music.ts
- [X] T028 [P] Implement getInterval function in src/lib/music.ts
- [X] T029 [P] Implement getChordTones function in src/lib/music.ts
- [X] T030 [P] Implement isChordCorrect function in src/lib/music.ts
- [X] T031 [P] Implement getAllPositionsOfNote function in src/lib/music.ts

**Verification**: ✅ PASSED - 100% coverage for src/lib/music.ts

### SRS Algorithm Functions

#### Tests First (TDD Required)

- [X] T032 [P] Create tests for sm2Update in src/lib/srs.test.ts
- [X] T033 [P] Create tests for getDueCards in src/lib/srs.test.ts

#### Implementation

- [X] T034 [P] Implement sm2Update function in src/lib/srs.ts
- [X] T035 [P] Implement getDueCards function in src/lib/srs.ts

**Verification**: ✅ PASSED - 100% coverage for src/lib/srs.ts

### Validation Functions

#### Tests First (TDD Required)

- [X] T036 [P] Create tests for validateFretPosition in src/lib/validation.test.ts
- [X] T037 [P] Create tests for validateNoteName in src/lib/validation.test.ts
- [X] T038 [P] Create tests for validateSRSCard in src/lib/validation.test.ts

#### Implementation

- [X] T039 [P] Implement validateFretPosition function in src/lib/validation.ts
- [X] T040 [P] Implement validateNoteName function in src/lib/validation.ts
- [X] T041 [P] Implement validateSRSCard function in src/lib/validation.ts

**Verification**: ✅ PASSED - 100% coverage for src/lib/validation.ts

### Date Utility Functions

#### Tests First (TDD Required)

- [X] T042 [P] Create tests for addDays in src/lib/date.test.ts
- [X] T043 [P] Create tests for isToday in src/lib/date.test.ts

#### Implementation

- [X] T044 [P] Implement addDays function in src/lib/date.ts
- [X] T045 [P] Implement isToday function in src/lib/date.ts

**Verification**: ✅ PASSED - 100% coverage for src/lib/date.ts

### Custom Hooks

- [X] T046 Create tests for useLocalStorage hook in src/hooks/useLocalStorage.test.ts
- [X] T047 Implement useLocalStorage hook in src/hooks/useLocalStorage.ts with schema migration support
- [X] T048 Create tests for useProgressStore hook in src/hooks/useProgressStore.test.ts
- [X] T049 Implement useProgressStore hook in src/hooks/useProgressStore.ts wrapping ProgressStore context
- [X] T050 Create tests for useDiagramStore hook in src/hooks/useDiagramStore.test.ts
- [X] T051 Implement useDiagramStore hook in src/hooks/useDiagramStore.ts wrapping DiagramStore context

**Verification**: Run `yarn test` - verify all hooks pass with 100% coverage

**Checkpoint**: Foundational complete. All types, utilities, and hooks ready. User stories can now start in parallel.

---

## Phase 3: User Story 1 - Dashboard (Priority P1) 🎯 MVP

**Goal**: Users can navigate the app and view their learning progress overview

**Why P1**: Dashboard is the entry point for the app. Users need to see their progress and navigate to different modes. This is the minimal viable product.

**Independent Test**: Can be fully tested by opening the app, viewing progress summary cards, and clicking mode cards to navigate to different sections.

**Duration**: ~4 hours

**Status**: ✅ COMPLETE

### Shared UI Components

#### Tests First

- [X] T052 [P] [US1] Create tests for Button component in src/components/ui/Button.test.tsx
- [X] T053 [P] [US1] Create tests for Card component in src/components/ui/Card.test.tsx

#### Implementation

- [X] T054 [P] [US1] Implement Button component in src/components/ui/Button.tsx
- [X] T055 [P] [US1] Implement Card component in src/components/ui/Card.tsx
- [X] T056 [P] [US1] Create src/components/ui/index.ts with barrel exports

**Verification**: ✅ UI components pass all tests

### Layout Components

#### Tests First

- [X] T057 [P] [US1] Create tests for Layout component in src/components/layout/Layout.test.tsx
- [X] T058 [P] [US1] Create tests for integrated navigation in Layout.test.tsx

#### Implementation

- [X] T059 [P] [US1] Layout component already implemented with navigation in src/components/layout/Layout.tsx
- [X] T060 [P] [US1] Navigation integrated into Layout component

**Verification**: ✅ Layout components pass all tests

### Dashboard Page

#### Tests First

- [X] T061 [US1] Create tests for DashboardPage in src/pages/dashboard/DashboardPage.test.tsx
  - Test: renders empty state without errors ✅
  - Test: displays progress summary cards ✅
  - Test: shows due cards count ✅
  - Test: has navigation buttons ✅

#### Implementation

- [X] T062 [US1] Create src/pages/dashboard/index.ts barrel file
- [X] T063 [US1] Implement DashboardPage in src/pages/dashboard/DashboardPage.tsx
  - Render 4 summary cards: Notes, Intervals, Chords, Due for Review ✅
  - Each card shows accuracy % ✅
  - Click on card navigates to corresponding mode ✅
  - Empty state renders without errors ✅

**Verification**: 
- [X] Run `yarn test` - verify DashboardPage passes all tests (93/93 passing)
- [X] Manual test: Dev server starts successfully at http://localhost:3000

**Checkpoint**: ✅ User Story 1 complete. Dashboard is functional and can be demonstrated independently.

---

## Phase 4: User Story 2 - Whiteboard Mode (Priority P2) ✅ COMPLETE

**Goal**: Users can create custom diagrams, load built-in patterns, and save their work

**Why P2**: Whiteboard provides exploration and annotation capabilities. Users can create their own learning materials.

**Independent Test**: Can be fully tested by creating a diagram, adding dots and lines, saving it, and loading it back.

**Duration**: ~6 hours

**Status**: ✅ COMPLETE

### Fretboard Component (Core)

#### Tests First

- [X] T064 [P] [US2] Create tests for Fretboard view mode in src/components/fretboard/Fretboard.test.tsx
- [X] T065 [P] [US2] Create tests for Fretboard click-select mode in src/components/fretboard/Fretboard.test.tsx
- [X] T066 [P] [US2] Create tests for Fretboard draw mode in src/components/fretboard/Fretboard.test.tsx

#### Implementation

- [X] T067 [US2] Implement Fretboard component in src/components/fretboard/Fretboard.tsx
  - Support 3 modes: view, click-select, draw ✅
  - Render dots and lines from FretboardState ✅
  - Handle fret clicks in click-select mode ✅
  - Handle dot placement/removal in draw mode ✅
  - Support feedback overlays (correct, missed, incorrect) ✅
  - Accessibility: ARIA labels, keyboard navigation ✅
- [X] T068 [US2] Create src/components/fretboard/index.ts with barrel exports

**Verification**: ✅ Fretboard passes all 11 tests

### Whiteboard Toolbar

#### Tests First

- [X] T069 [P] [US2] Create tests for AnnotationToolbar in src/pages/whiteboard/AnnotationToolbar.test.tsx

#### Implementation

- [X] T070 [P] [US2] Implement AnnotationToolbar in src/pages/whiteboard/AnnotationToolbar.tsx
  - Dot color picker ✅
  - Dot shape selector (circle, square, diamond) ✅
  - Line style selector (solid, dashed) ✅
  - Connect toggle button ✅

**Verification**: ✅ Toolbar passes all tests

### Diagram Editor

#### Tests First

- [X] T071 [US2] Create tests for DiagramEditor in src/pages/whiteboard/DiagramEditor.test.tsx
  - Test: renders with name/description inputs ✅
  - Test: populates existing diagram data ✅
  - Test: calls onSave when save clicked ✅
  - Test: calls onCancel when cancel clicked ✅

#### Implementation

- [X] T072 [US2] Implement DiagramEditor in src/pages/whiteboard/DiagramEditor.tsx
  - Load/save diagrams using local state ✅
  - Name and description inputs ✅
  - Integrated Fretboard in draw mode ✅
  - Annotation toolbar integration ✅

**Verification**: ✅ DiagramEditor passes all tests

### Pattern Library

#### Tests First

- [X] T073 [US2] Create tests for PatternLibrary in src/pages/whiteboard/PatternLibrary.test.tsx

#### Implementation

- [X] T074 [US2] Implement PatternLibrary in src/pages/whiteboard/PatternLibrary.tsx
  - Display built-in patterns ✅
  - Click pattern → clone and edit ✅
  - Grid layout with pattern cards ✅

**Verification**: ✅ PatternLibrary passes all tests

### Built-in Patterns Data

- [X] T075 [US2] Create src/data/patterns/caged.ts with CAGED shape patterns
- [X] T076 [US2] Create src/data/patterns/pentatonic.ts with pentatonic box patterns
- [X] T077 [US2] Create src/data/patterns/major-scale.ts with major scale position patterns
- [X] T078 [US2] Create src/data/patterns/intervals.ts with interval shape patterns
- [X] T079 [US2] Create src/data/patterns/index.ts with barrel exports

### Whiteboard Page

#### Tests First

- [X] T080 [US2] Create integration tests for WhiteboardPage in src/pages/whiteboard/WhiteboardPage.test.tsx
  - Test: renders tabs (My Diagrams, Pattern Library) ✅
  - Test: shows empty state ✅
  - Test: navigates to new diagram editor ✅
  - Test: switches between tabs ✅

#### Implementation

- [X] T081 [US2] Create src/pages/whiteboard/index.ts barrel file
- [X] T082 [US2] Implement WhiteboardPage in src/pages/whiteboard/WhiteboardPage.tsx
  - Tab: My Diagrams (list of user diagrams) ✅
  - Tab: Pattern Library (built-in patterns) ✅
  - New Diagram button ✅
  - Edit/Delete actions ✅
  - localStorage persistence via useDiagramStore ✅

**Verification**: 
- [X] Run `yarn test` - all tests pass (124/124)
- [X] Integration complete - all components wired together
- [X] localStorage persistence working

**Checkpoint**: ✅ User Story 2 complete. Whiteboard mode is functional and independently testable.

**Phase 4 Status**: ✅ COMPLETE - All 19 tasks finished, all tests passing (124/124)
  - Test: create new diagram → add dots → save → appears in list
  - Test: load pattern → view only → clone → edit
  - Test: load existing diagram → edit → save

---

## Phase 5: User Story 3 - Learning Mode (Priority P3)

**Goal**: Users can work through guided lessons and explore concepts interactively

**Why P3**: Learning mode provides structured education. Lessons guide users through fundamentals. Explorer allows free exploration.

**Independent Test**: Can be fully tested by starting a lesson, completing steps, and using the explorer to visualize notes.

**Duration**: ~6 hours

### Lesson Data

- [ ] T083 [P] [US3] Create src/data/lessons/lesson-01.ts (The open strings)
- [ ] T084 [P] [US3] Create src/data/lessons/lesson-02.ts (Natural notes on low E)
- [ ] T085 [P] [US3] Create src/data/lessons/lesson-03.ts (All notes on low E with accidentals)
- [ ] T086 [P] [US3] Create src/data/lessons/lesson-04.ts (Octave shape)
- [ ] T087 [P] [US3] Create src/data/lessons/lesson-05.ts (Notes on every string)
- [ ] T088 [P] [US3] Create src/data/lessons/lesson-06.ts (Chromatic scale)
- [ ] T089 [P] [US3] Create src/data/lessons/lesson-07.ts (Introduction to intervals)
- [ ] T090 [P] [US3] Create src/data/lessons/lesson-08.ts (Interval shapes: unison, octave, P5)
- [ ] T091 [P] [US3] Create src/data/lessons/lesson-09.ts (Interval shapes: M3, m3)
- [ ] T092 [P] [US3] Create src/data/lessons/lesson-10.ts (Major triad)
- [ ] T093 [P] [US3] Create src/data/lessons/lesson-11.ts (Minor triad)
- [ ] T094 [P] [US3] Create src/data/lessons/lesson-12.ts (Diminished/augmented triads)
- [ ] T095 [P] [US3] Create src/data/lessons/lesson-13.ts (CAGED overview)
- [ ] T096 [US3] Create src/data/lessons/index.ts with lesson curriculum array

### Lesson Player Components

#### Tests First

- [ ] T097 [P] [US3] Create tests for LessonList in src/pages/learning/LessonList.test.tsx
- [ ] T098 [P] [US3] Create tests for LessonPlayer in src/pages/learning/LessonPlayer.test.tsx
- [ ] T099 [P] [US3] Create tests for StepExplain in src/pages/learning/StepExplain.test.tsx
- [ ] T100 [P] [US3] Create tests for StepVerify in src/pages/learning/StepVerify.test.tsx

#### Implementation

- [ ] T101 [P] [US3] Implement LessonList in src/pages/learning/LessonList.tsx
  - Display lesson curriculum with completion status
  - Click lesson → navigate to LessonPlayer
- [ ] T102 [US3] Implement LessonPlayer in src/pages/learning/LessonPlayer.tsx
  - Render lesson steps sequentially
  - Track current step index
  - Show step content (Explain or Verify)
  - Progress indicator
  - Next/Previous buttons
  - Complete button on final step
- [ ] T103 [P] [US3] Implement StepExplain in src/pages/learning/StepExplain.tsx
  - Display text content
  - Render static Fretboard (view mode)
- [ ] T104 [P] [US3] Implement StepVerify in src/pages/learning/StepVerify.tsx
  - Display instruction
  - Render interactive Fretboard (click-select mode)
  - Check answer and show feedback
  - Next button after correct answer

**Verification**: Run `yarn test` - verify lesson components pass

### Explorer Components

#### Tests First

- [ ] T105 [P] [US3] Create tests for ExplorerPanel in src/pages/learning/ExplorerPanel.test.tsx

#### Implementation

- [ ] T106 [US3] Implement ExplorerPanel in src/pages/learning/ExplorerPanel.tsx
  - Root note picker (chromatic)
  - Display type selector: Note positions | Interval map | Triad voicings | Scale
  - Scale type selector (major/minor/pentatonic)
  - Fret range slider
  - Toggle overlays: note names, interval numbers, scale degrees
  - Fretboard updates in real time

**Verification**: Run `yarn test` - verify Explorer passes

### Learning Page

#### Tests First

- [ ] T107 [US3] Create integration tests for LearningPage in src/pages/learning/LearningPage.test.tsx
  - Test: view lesson list → start lesson → complete steps
  - Test: use explorer → change root → see fretboard update

#### Implementation

- [ ] T108 [US3] Create src/pages/learning/index.ts barrel file
- [ ] T109 [US3] Implement LearningPage in src/pages/learning/LearningPage.tsx
  - Tab: Lessons (lesson curriculum list)
  - Tab: Explorer (interactive reference view)
  - Route to LessonPlayer on lesson select

**Verification**:
- Run `yarn test` - verify all learning tests pass
- Manual test: Complete lesson, verify no SRS cards created
- Manual test: Use explorer, verify no data written to localStorage

**Checkpoint**: User Story 3 complete. Learning mode is functional and can be demonstrated independently.

---

## Phase 6: User Story 4 - Quiz Mode & SRS Review (Priority P4)

**Goal**: Users can test their knowledge with various quiz types and review due SRS cards

**Why P4**: Quiz mode is the core learning mechanism. It creates SRS cards and tracks progress. This is where the actual learning happens.

**Independent Test**: Can be fully tested by starting a quiz, answering questions, and seeing progress updates.

**Duration**: ~10 hours

### Quiz Infrastructure

#### Tests First

- [ ] T110 [P] [US4] Create tests for QuizSelector in src/pages/quiz/QuizSelector.test.tsx
- [ ] T111 [P] [US4] Create tests for QuizRunner in src/pages/quiz/QuizRunner.test.tsx
- [ ] T112 [P] [US4] Create tests for QuizFeedback in src/pages/quiz/QuizFeedback.test.tsx
- [ ] T113 [P] [US4] Create tests for SessionSummary in src/pages/quiz/SessionSummary.test.tsx

#### Implementation

- [ ] T114 [P] [US4] Implement QuizSelector in src/pages/quiz/QuizSelector.tsx
  - Quiz type selector: Find the Note | Name the Note | Identify Interval | Build Chord
  - Difficulty selector: Beginner | Intermediate | Advanced
  - Question count input
  - Start button
- [ ] T115 [US4] Implement QuizRunner in src/pages/quiz/QuizRunner.tsx
  - Generate questions based on quiz type and difficulty
  - Track question progress
  - Track score
  - Track time
  - Update SRS cards after each question
  - Show SessionSummary on completion
- [ ] T116 [P] [US4] Implement QuizFeedback in src/pages/quiz/QuizFeedback.test.tsx
  - Display color-coded overlay on Fretboard
  - Show feedback message
  - Continue button
- [ ] T117 [P] [US4] Implement SessionSummary in src/pages/quiz/SessionSummary.test.tsx
  - Show total questions, correct count, duration
  - Show accuracy percentage
  - Review again button
  - Return to dashboard button

**Verification**: Run `yarn test` - verify quiz infrastructure passes

### Find the Note Quiz

#### Tests First

- [ ] T118 [P] [US4] Create tests for FindTheNoteQuiz in src/pages/quiz/FindTheNoteQuiz.test.tsx

#### Implementation

- [ ] T119 [US4] Implement FindTheNoteQuiz in src/pages/quiz/FindTheNoteQuiz.tsx
  - Display note name
  - Fretboard in click-select mode
  - User clicks multiple positions
  - Check button → show feedback (correct, missed, incorrect)
  - Update SRS card for note:{NoteName}:string{0-5}

**Verification**: Run `yarn test` - verify Find the Note quiz passes

### Name the Note Quiz

#### Tests First

- [ ] T120 [P] [US4] Create tests for NameTheNoteQuiz in src/pages/quiz/NameTheNoteQuiz.test.tsx

#### Implementation

- [ ] T121 [US4] Implement NameTheNoteQuiz in src/pages/quiz/NameTheNoteQuiz.tsx
  - Display highlighted fret position
  - Multiple choice (4 options) or free-type entry
  - Immediate feedback
  - Update SRS card for note:{NoteName}:string{0-5}

**Verification**: Run `yarn test` - verify Name the Note quiz passes

### Identify Interval Quiz

#### Tests First

- [ ] T122 [P] [US4] Create tests for IdentifyIntervalQuiz in src/pages/quiz/IdentifyIntervalQuiz.test.tsx

#### Implementation

- [ ] T123 [US4] Implement IdentifyIntervalQuiz in src/pages/quiz/IdentifyIntervalQuiz.tsx
  - Display two colored dots (root, target)
  - Interval selector (13 options)
  - Feedback with interval shape pattern
  - Update SRS card "interval:{IntervalName}"
  - Reverse mode: given interval, click target note

**Verification**: Run `yarn test` - verify Identify Interval quiz passes

### Build Chord Quiz

#### Tests First

- [ ] T124 [P] [US4] Create tests for BuildChordQuiz in src/pages/quiz/BuildChordQuiz.test.tsx

#### Implementation

- [ ] T125 [US4] Implement BuildChordQuiz in src/pages/quiz/BuildChordQuiz.tsx
  - Display chord name (e.g., "D diminished")
  - Fretboard in draw mode
  - User places dots for chord tones
  - Check button → validate chord tones
  - Show canonical voicing for reference
  - Update SRS card "chord:{NoteName}{quality}"

**Verification**: Run `yarn test` - verify Build Chord quiz passes

### SRS Review Mode

#### Tests First

- [ ] T126 [US4] Create tests for ReviewSession in src/pages/quiz/ReviewSession.test.tsx

#### Implementation

- [ ] T127 [US4] Implement ReviewSession in src/pages/quiz/ReviewSession.tsx
  - Load due cards from useProgressStore
  - Present each card using appropriate quiz format
  - Update cards after each answer
  - Show completion screen when queue empty

**Verification**: Run `yarn test` - verify Review Session passes

### Quiz Page

#### Tests First

- [ ] T128 [US4] Create integration tests for QuizPage in src/pages/quiz/QuizPage.test.tsx
  - Test: start Find the Note quiz → answer questions → see summary
  - Test: start review session → complete due cards

#### Implementation

- [ ] T129 [US4] Create src/pages/quiz/index.ts barrel file
- [ ] T130 [US4] Implement QuizPage in src/pages/quiz/QuizPage.tsx
  - Quiz selector (default view)
  - Route to specific quiz on selection
  - Route to ReviewSession when "Start Review" clicked on dashboard

**Verification**:
- Run `yarn test` - verify all quiz tests pass
- Run `yarn test:coverage` - verify ≥80% component coverage
- Manual test: Complete quiz, verify SRS cards updated in localStorage
- Manual test: Complete quiz, verify session record added to history

**Checkpoint**: User Story 4 complete. Quiz mode is functional and can be demonstrated independently.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Improve overall quality, performance, and user experience

**Duration**: ~4 hours

### Routing Setup

- [ ] T131 Update src/App.tsx with React Router routes for all pages
- [ ] T132 Test navigation between all modes (Dashboard, Whiteboard, Learning, Quiz)

### Performance Optimization

- [ ] T133 Add React.lazy code splitting for page components in src/App.tsx
- [ ] T134 Add Suspense fallback for lazy-loaded pages
- [ ] T135 Profile and optimize Fretboard rendering with React.memo
- [ ] T136 Add debouncing to whiteboard drawing interactions

### Accessibility Improvements

- [ ] T137 Add focus management to quiz flows (move focus to feedback on answer)
- [ ] T138 Add aria-live regions to quiz feedback components
- [ ] T139 Verify all interactive elements have accessible names
- [ ] T140 Test keyboard navigation through entire app

### Final Testing

- [ ] T141 Run `yarn test:coverage` - verify overall coverage targets (100% lib, ≥80% components)
- [ ] T142 Run `yarn typecheck` - verify no TypeScript errors
- [ ] T143 Run `yarn lint` - verify no linting errors
- [ ] T144 Manual end-to-end test: Complete user journey from dashboard → quiz → review

### Documentation

- [ ] T145 Update README.md with app description and usage instructions
- [ ] T146 Verify quickstart.md is accurate and complete

**Final Checkpoint**: All phases complete. App is production-ready.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if team size allows)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (Dashboard - P1)**: Can start after Foundational (Phase 2) - **No dependencies on other stories**
- **User Story 2 (Whiteboard - P2)**: Can start after Foundational (Phase 2) - **No dependencies on other stories**
- **User Story 3 (Learning - P3)**: Can start after Foundational (Phase 2) - **Shares Fretboard with US2**
- **User Story 4 (Quiz - P4)**: Can start after Foundational (Phase 2) - **No dependencies on other stories**

### Within Each User Story

- Tests (if included) must be written before implementation
- Types before components
- Components before pages
- Page integration last

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1 (Dashboard)

```bash
# All UI component tests can run in parallel
Task: T052, T053 - Create tests for Button and Card components

# All UI component implementations can run in parallel (after tests written)
Task: T054, T055 - Implement Button and Card components

# All layout component tests can run in parallel
Task: T057, T058 - Create tests for Layout and Navbar

# All layout component implementations can run in parallel (after tests written)
Task: T059, T060 - Implement Layout and Navbar
```

---

## Parallel Example: User Story 2 (Whiteboard) + User Story 3 (Learning)

With 2 developers:

```bash
# Developer A: User Story 2 (Whiteboard)
1. T064-T066: Create Fretboard tests (parallel)
2. T067-T068: Implement Fretboard
3. T069-T070: Toolbar tests + implementation (parallel)
4. T071-T074: Editor and Library tests + implementation
5. T075-T079: Pattern data (parallel)
6. T080-T082: Whiteboard page integration

# Developer B: User Story 3 (Learning)
1. T083-T096: Lesson data (parallel)
2. T097-T100: Lesson component tests (parallel)
3. T101-T104: Lesson components (parallel after tests)
4. T105-T106: Explorer tests + implementation
5. T107-T109: Learning page integration
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

**Recommended for initial validation**

1. Complete Phase 1: Setup (~2 hours)
2. Complete Phase 2: Foundational (~6 hours)
3. Complete Phase 3: User Story 1 - Dashboard (~4 hours)
4. **STOP and VALIDATE**: 
   - Test dashboard independently
   - Verify it loads under 200ms
   - Verify navigation to modes works (even if pages are stubs)
5. Deploy/demo if ready

**Total MVP Time**: ~12 hours

### Incremental Delivery

**Recommended for steady progress**

1. Complete Setup + Foundational → **Foundation ready** (~8 hours)
2. Add User Story 1 → **Test independently** → **Deploy/Demo (MVP!)** (~4 hours)
3. Add User Story 2 → **Test independently** → **Deploy/Demo** (~8 hours)
4. Add User Story 3 → **Test independently** → **Deploy/Demo** (~6 hours)
5. Add User Story 4 → **Test independently** → **Deploy/Demo** (~10 hours)
6. Add Polish → **Production ready** (~4 hours)

**Total Time**: ~40 hours (5 days for single developer)

Each story adds value without breaking previous stories.

### Parallel Team Strategy

**With 3+ developers:**

1. All developers complete Setup + Foundational together (~8 hours)
2. Once Foundational is done:
   - Developer A: User Story 1 (Dashboard)
   - Developer B: User Story 2 (Whiteboard)
   - Developer C: User Story 3 (Learning)
3. Stories complete and integrate independently
4. Developer D (if available): User Story 4 (Quiz) or assist others
5. All join for Phase 7: Polish

**Total Time**: ~20 hours (2.5 days with 3 developers)

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- Each user story is independently complete and testable
- **TDD approach**: Tests MUST be written before implementation (Constitution requirement)
- **Coverage targets**: 100% for src/lib/, ≥80% for components
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Avoid**: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Summary

**Total Tasks**: 146  
**Setup**: 16 tasks  
**Foundational**: 35 tasks (types, utilities, hooks)  
**User Story 1 (Dashboard)**: 12 tasks  
**User Story 2 (Whiteboard)**: 19 tasks  
**User Story 3 (Learning)**: 27 tasks  
**User Story 4 (Quiz)**: 21 tasks  
**Polish**: 16 tasks  

**Estimated Time**:
- Single developer, sequential: ~40 hours (5 days)
- Single developer, MVP only (US1): ~12 hours (1.5 days)
- 3 developers, parallel: ~20 hours (2.5 days)

**Independent Test Points**:
- ✅ User Story 1: Dashboard loads, shows progress, navigates to modes
- ✅ User Story 2: Create diagram, add dots/lines, save, load back
- ✅ User Story 3: Complete lesson steps, use explorer to visualize notes
- ✅ User Story 4: Complete quiz, see SRS cards update, review due cards

**Ready for implementation**: All tasks follow strict checklist format with IDs, labels, and file paths.
