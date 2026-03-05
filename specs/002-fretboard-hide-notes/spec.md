# Feature Specification: Hide Notes During Test Mode

**Feature Branch**: `002-fretboard-hide-notes`  
**Created**: 2026-03-05  
**Status**: Draft  
**Input**: User description: "improve fretboard component; for tests we should not be able to see notes for all modes; notes should be visible only after answering"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Take Quiz Without Seeing Answers (Priority: P1)

As a guitar student, I want to test my knowledge by identifying notes on the fretboard without seeing the answers beforehand, so that I can genuinely assess my learning progress.

**Why this priority**: This is the core functionality that enables effective self-assessment. Without this, quizzes don't serve their purpose of testing actual knowledge.

**Independent Test**: Can be fully tested by starting any quiz (Find the Note, Identify Interval, Build Chord), verifying that note labels are hidden during the question, and confirming they appear after submitting an answer.

**Acceptance Scenarios**:

1. **Given** a quiz is started in test mode, **When** the fretboard displays the question, **Then** all note labels on marked dots are hidden from view
2. **Given** a quiz question is displayed with hidden notes, **When** the user clicks a position on the fretboard as their answer, **Then** the note labels remain hidden until the answer is submitted
3. **Given** the user has submitted their answer, **When** feedback is displayed (correct/incorrect), **Then** all relevant note labels become visible on the fretboard
4. **Given** the user moves to the next quiz question, **When** the new question loads, **Then** note labels are hidden again for the new question

---

### User Story 2 - Review Answers with Visible Notes (Priority: P2)

As a student reviewing my quiz results, I want to see the correct note labels on the fretboard so that I can understand what the right answer was and learn from my mistakes.

**Why this priority**: This enhances the learning value by allowing students to understand their errors, but the quiz itself (P1) is more critical.

**Independent Test**: Can be tested by completing a quiz and reviewing the session summary, verifying that note labels are visible in the review/feedback states.

**Acceptance Scenarios**:

1. **Given** a quiz question has been answered, **When** the feedback screen shows the correct answer, **Then** the correct note label is clearly visible on the target position
2. **Given** an incorrect answer was given, **When** feedback is displayed, **Then** both the user's incorrect position and the correct position show their respective note labels
3. **Given** the session summary is displayed after completing a quiz, **When** reviewing past questions, **Then** all note labels are visible for reference

---

### User Story 3 - View Notes in Non-Test Modes (Priority: P3)

As a student exploring or creating diagrams, I want to see note labels on the fretboard so that I can learn and create accurate diagrams.

**Why this priority**: This ensures existing functionality is preserved for non-quiz modes, but doesn't add new value beyond maintaining current behavior.

**Independent Test**: Can be tested by switching to view mode, draw mode, or patterns mode and verifying that note labels are visible as they were before.

**Acceptance Scenarios**:

1. **Given** the fretboard is in view mode, **When** a diagram is displayed, **Then** all note labels on dots are visible
2. **Given** the fretboard is in draw mode, **When** the user creates or edits a diagram, **Then** note labels are visible on existing dots
3. **Given** the fretboard is in patterns mode, **When** a pattern is displayed, **Then** note labels are visible to help identify the pattern

---

### Edge Cases

- What happens when switching between test mode and other modes during the same session?
  - Note visibility should immediately update based on the current mode
- How does the system handle notes when a user changes their answer before submitting?
  - Notes should remain hidden until final submission
- What if the quiz times out or the user skips a question?
  - Notes should be revealed as part of the timeout/skip feedback
- How are notes displayed when multiple dots are shown in a single question (e.g., chord building)?
  - All relevant dots should have their notes hidden during the question and revealed together in feedback

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The fretboard component MUST hide note labels on all marked dots when operating in test mode
- **FR-002**: The fretboard component MUST reveal note labels only after an answer has been submitted in test mode
- **FR-003**: The fretboard component MUST display note labels in view mode, draw mode, and patterns mode (preserving existing behavior)
- **FR-004**: The system MUST provide visual feedback with visible note labels when showing correct/incorrect answers
- **FR-005**: The system MUST hide notes for all quiz types (Find the Note, Identify Interval, Build Chord, Review Mode)
- **FR-006**: The system MUST immediately hide notes when transitioning to a new quiz question in test mode
- **FR-007**: The system MUST support configurable note visibility based on the fretboard mode (view, draw, test, patterns)
- **FR-008**: The system MUST maintain note data even when labels are hidden (for verification purposes)

### Key Entities

- **FretboardMode**: The operational state of the fretboard component (view, draw, test, patterns) that determines interaction behavior and note visibility
- **MarkedDot**: A position on the fretboard with visual representation that may include a note label, color, shape, and other visual properties
- **QuizState**: The current state of a quiz interaction (waiting for answer, submitted, showing feedback) that influences when notes should be revealed

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Students cannot see correct answers during quiz questions in test mode (verified through manual testing that note labels are hidden)
- **SC-002**: Quiz completion rates remain at or above current levels after implementation (no negative impact on user experience)
- **SC-003**: Students report improved learning value from quizzes (measured through feedback that quizzes better test actual knowledge)
- **SC-004**: All existing functionality in non-test modes continues to work without regression (100% of existing tests pass)
- **SC-005**: Note visibility transitions happen within 100ms when switching between quiz states (maintaining smooth user experience)
- **SC-006**: The feature works consistently across all quiz types without mode-specific bugs (verified through comprehensive testing)

## Assumptions

- The current fretboard component has distinct modes (view, draw, test, patterns) that can be extended with note visibility logic
- Quiz questions have a clear "submitted" state that triggers the transition from hidden to visible notes
- Note labels are part of the dot rendering logic and can be conditionally shown/hidden
- The existing test suite covers quiz functionality and will need updates to verify note hiding behavior
- Users expect immediate visual feedback after answering, including seeing the correct notes
