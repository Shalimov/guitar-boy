# Feature Specification: Fretboard Learning App

**Feature Branch**: `001-fretboard-learning-app`  
**Created**: 2026-03-04  
**Updated**: 2026-03-05  
**Status**: Active (Partially Implemented)

**Input**: Single-page guitar learning app with dashboard, whiteboard diagram editing, guided learning, quiz modes, and local SRS progress tracking.

## User Scenarios & Testing

### User Story 1 - Navigate And Track Progress (Priority: P1)

As a learner, I can open the dashboard, see my learning metrics, and navigate to main app modes.

**Why this priority**: This is the app entry point and minimum usable workflow.

**Independent Test**: Open app, verify dashboard summary cards render, and navigate to Whiteboard/Learn/Quiz from the UI.

**Acceptance Scenarios**:

1. **Given** no prior history, **When** I open the app, **Then** I see an empty-state dashboard with clear next actions.
2. **Given** stored session history, **When** I open the app, **Then** dashboard cards show derived progress metrics.
3. **Given** I click a mode action, **When** navigation occurs, **Then** the correct route loads.

---

### User Story 2 - Create And Save Whiteboard Diagrams (Priority: P1)

As a learner, I can create, edit, save, clone, and delete custom fretboard diagrams locally.

**Why this priority**: Whiteboard is the core exploratory experience available today.

**Independent Test**: Create a diagram, place markers, save it, reopen it from "My Diagrams", and delete it.

**Acceptance Scenarios**:

1. **Given** an empty diagram list, **When** I create and save a diagram, **Then** it appears in "My Diagrams".
2. **Given** a built-in pattern, **When** I select it, **Then** a user-editable copy is created.
3. **Given** an existing user diagram, **When** I delete it, **Then** it is removed from local storage.

---

### User Story 3 - Learn Concepts In Guided And Explorer Modes (Priority: P2)

As a learner, I can use guided lessons and an explorer mode to understand notes, intervals, and triads.

**Why this priority**: Structured learning is core product value, but current code only has placeholders.

**Independent Test**: Start a lesson, complete lesson steps, and use explorer controls to change fretboard visualization.

**Acceptance Scenarios**:

1. **Given** I open Learn mode, **When** I select a lesson, **Then** I can move through explain/verify steps.
2. **Given** I use Explorer controls, **When** I change root/display mode, **Then** fretboard visualization updates.

---

### User Story 4 - Run Quizzes And Review Due Cards (Priority: P2)

As a learner, I can run quiz sessions and review due SRS cards.

**Why this priority**: Quiz + SRS is key to retention, but current quiz page is still a placeholder.

**Independent Test**: Start a quiz, answer questions, see feedback, and verify SRS/session updates are persisted.

**Acceptance Scenarios**:

1. **Given** I start a quiz session, **When** I answer a question, **Then** I receive correctness feedback.
2. **Given** I finish a session, **When** summary is shown, **Then** card scheduling and session history are updated.

## Edge Cases

- Invalid `fretRange` input should not crash rendering; values must be normalized.
- Built-in diagrams must remain immutable and non-deletable.
- localStorage parse or write failures must fall back safely without app crash.
- Whiteboard unsaved changes must be handled before destructive navigation.
- Fretboard overlays (correct/missed/incorrect) must not hide core interaction affordances.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide top-level routes for dashboard, whiteboard, learn, and quiz.
- **FR-002**: System MUST persist diagram and progress state in browser localStorage.
- **FR-003**: Users MUST be able to create, edit, save, and delete user diagrams.
- **FR-004**: System MUST provide built-in pattern templates that can be cloned into editable user diagrams.
- **FR-005**: Fretboard component MUST support `view`, `click-select`, and `draw` modes.
- **FR-006**: Fretboard component MUST render dots and connection lines from `FretboardState`.
- **FR-007**: In draw workflows, users MUST be able to create/remove dots and create lines between dots.
- **FR-008**: System MUST provide accessibility semantics and keyboard interaction for fretboard interactions.
- **FR-009**: Learning mode MUST provide lesson and explorer workflows (currently not implemented).
- **FR-010**: Quiz mode MUST provide note/interval/chord quiz workflows and review sessions (currently not implemented).
- **FR-011**: Dashboard MUST summarize progress and due-card counts.
- **FR-012**: App MUST remain usable offline without backend dependencies.

### Key Entities

- **FretPosition**: Guitar coordinate (`string`, `fret`) used across rendering and quiz logic.
- **FretboardState**: Diagram state containing `dots`, `lines`, and optional highlights.
- **Diagram**: Saved whiteboard artifact with metadata and `FretboardState`.
- **SRSCard**: Spaced-repetition card with scheduling values.
- **ProgressStore / DiagramStore**: Versioned local storage roots for progress and diagrams.

## Current Implementation Status (2026-03-05)

| Area | Status | Notes |
|---|---|---|
| Dashboard route and summary cards | Implemented | Basic metrics and navigation exist. |
| Whiteboard list/editor/pattern library | Partial | CRUD flow exists, but connect-mode behavior is incomplete. |
| Fretboard rendering engine | Implemented | Canvas-based rendering with Konva-assisted pointer hotspots. |
| Fretboard connection lines | Missing/Incomplete | Type exists, visible line rendering is not complete. |
| Learning mode | Missing | `LearningPage` is currently placeholder text only. |
| Quiz mode | Missing | `QuizPage` is currently placeholder text only. |
| SRS utility functions | Implemented | Core date/SRS helpers exist in `src/lib`. |

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can create and reopen a saved whiteboard diagram without data loss.
- **SC-002**: Dashboard and Whiteboard routes load without runtime errors in fresh and populated localStorage states.
- **SC-003**: Fretboard line rendering and connect interactions work correctly after migration tasks in `specs/cdx_tasks/`.
- **SC-004**: Learn and Quiz routes move from placeholder pages to functional flows.
- **SC-005**: Lint, typecheck, test, and build scripts pass before release.
