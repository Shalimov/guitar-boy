# Tasks: Hide Notes During Test Mode

**Input**: Design documents from `/specs/002-fretboard-hide-notes/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, quickstart.md

**Tests**: Tests are REQUIRED per constitution (Principle II - Test Quality - Protection). Follow TDD approach - write tests FIRST, ensure they fail, then implement.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Verify project structure and existing test infrastructure

- [X] T001 Verify existing project structure matches plan.md
- [X] T002 Verify test infrastructure is working (run `yarn test` - expect 151/151 passing)
- [X] T003 Review existing CanvasFretboard implementation and test patterns

**Checkpoint**: Project ready for feature implementation

---

## Phase 2: Foundational Types & Utilities

**Purpose**: Extend existing types to support label visibility control

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Add `hideLabels?: boolean` to DotRenderOptions interface in src/components/fretboard/canvas/render.ts
- [X] T005 [P] Create shouldHideLabels helper function in src/components/fretboard/CanvasFretboard.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Take Quiz Without Seeing Answers (Priority: P1) 🎯 MVP

**Goal**: Hide note labels during quiz questions, reveal only after answer submission

**Why this priority**: Core functionality that enables effective self-assessment. Without this, quizzes don't serve their purpose of testing actual knowledge.

**Independent Test**: Start any quiz (Find the Note, Identify Interval, Build Chord), verify note labels are hidden during the question, and confirm they appear after submitting an answer.

### Tests for User Story 1 (TDD - Write First)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T006 [P] [US1] Add test "hides labels during test mode before answer submission" in src/components/fretboard/CanvasFretboard.test.tsx
- [X] T007 [P] [US1] Add test "shows labels in test mode after answer submission" in src/components/fretboard/CanvasFretboard.test.tsx

### Implementation for User Story 1

- [X] T008 [US1] Modify drawDots function to check hideLabels flag before rendering labels in src/components/fretboard/canvas/render.ts (line ~205)
- [X] T009 [US1] Add hasFeedback computation logic in src/components/fretboard/CanvasFretboard.tsx (check correctPositions, missedPositions, incorrectPositions arrays)
- [X] T010 [US1] Compute hideLabels flag using shouldHideLabels(mode, hasFeedback) in src/components/fretboard/CanvasFretboard.tsx
- [X] T011 [US1] Pass hideLabels flag to drawDots options in src/components/fretboard/CanvasFretboard.tsx (around line ~400-500)
- [X] T012 [US1] Verify tests T006-T007 now pass

**Checkpoint**: User Story 1 complete. Quiz mode hides labels before submission, shows after submission. Can be tested independently.

---

## Phase 4: User Story 2 - Review Answers with Visible Notes (Priority: P2)

**Goal**: Ensure note labels are visible in all feedback and review states

**Why this priority**: Enhances learning value by allowing students to understand their errors, but quiz itself (P1) is more critical.

**Independent Test**: Complete a quiz and review session summary, verifying note labels are visible in review/feedback states.

### Tests for User Story 2 (TDD - Write First)

- [X] T013 [P] [US2] Add test "shows labels when correctPositions are present in test mode" in src/components/fretboard/CanvasFretboard.test.tsx
- [X] T014 [P] [US2] Add test "shows labels when missedPositions are present in test mode" in src/components/fretboard/CanvasFretboard.test.tsx
- [X] T015 [P] [US2] Add test "shows labels when incorrectPositions are present in test mode" in src/components/fretboard/CanvasFretboard.test.tsx

### Implementation for User Story 2

- [X] T016 [US2] Verify hasFeedback logic correctly detects all feedback position types in src/components/fretboard/CanvasFretboard.tsx
- [X] T017 [US2] Review QuizRunner component to ensure it passes feedback positions correctly in src/pages/quiz/QuizRunner.tsx
- [X] T018 [US2] Review ReviewMode component to ensure it passes feedback positions correctly in src/pages/quiz/ReviewMode.tsx
- [X] T019 [US2] Verify tests T013-T015 now pass

**Checkpoint**: User Story 2 complete. All feedback states show labels correctly. Works independently with User Story 1.

---

## Phase 5: User Story 3 - View Notes in Non-Test Modes (Priority: P3)

**Goal**: Preserve existing behavior - labels always visible in view, draw, click-select, and patterns modes

**Why this priority**: Ensures existing functionality is preserved, but doesn't add new value beyond maintaining current behavior.

**Independent Test**: Switch to view mode, draw mode, or patterns mode and verify note labels are visible as before.

### Tests for User Story 3 (TDD - Write First)

- [X] T020 [P] [US3] Add test "shows labels in view mode regardless of feedback" in src/components/fretboard/CanvasFretboard.test.tsx
- [X] T021 [P] [US3] Add test "shows labels in draw mode" in src/components/fretboard/CanvasFretboard.test.tsx
- [X] T022 [P] [US3] Add test "shows labels in click-select mode" in src/components/fretboard/CanvasFretboard.test.tsx
- [X] T023 [P] [US3] Add test "shows labels in patterns mode" in src/components/fretboard/CanvasFretboard.test.tsx

### Implementation for User Story 3

- [X] T024 [US3] Verify shouldHideLabels returns false for all non-test modes in src/components/fretboard/CanvasFretboard.tsx
- [X] T025 [US3] Add manual test scenario: switch from test mode to other modes, verify labels become visible immediately
- [X] T026 [US3] Verify tests T020-T023 now pass (regression tests should confirm no changes needed)

**Checkpoint**: User Story 3 complete. All non-test modes preserve existing behavior. All three user stories work independently.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality assurance and documentation

- [X] T027 Run full test suite: `yarn test` - expect all tests passing (151 + new tests)
- [X] T028 Run type checking: `yarn typecheck` - expect no errors
- [X] T029 Run linting: `yarn lint` - expect no errors
- [X] T030 Run build: `yarn build` - expect successful production bundle
- [X] T031 Manual testing: Complete quickstart.md verification checklist
- [X] T032 Update tasks.md to mark all tasks complete

---

## Edge Cases & Additional Tests

**Purpose**: Ensure robustness across all scenarios

- [X] T033 [P] Add test "labels hidden when switching to new quiz question" in src/components/fretboard/CanvasFretboard.test.tsx
- [X] T034 [P] Add test "labels immediately visible when switching from test to view mode" in src/components/fretboard/CanvasFretboard.test.tsx
- [X] T035 [P] Add test "labels hidden for multiple dots in chord building quiz" in src/components/fretboard/CanvasFretboard.test.tsx
- [X] T036 Verify all edge case tests pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2 → P3)
  - Or in parallel if team capacity allows
- **Polish (Phase 6)**: Depends on all user stories being complete
- **Edge Cases**: Can run in parallel with Polish phase

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Logically extends US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories (regression focus)

### Within Each User Story

- Tests MUST be written FIRST and FAIL before implementation (TDD)
- Core implementation after tests are written
- Story complete before moving to next priority

### Parallel Opportunities

- T006-T007: Tests for US1 can run in parallel (same file, different test cases)
- T013-T015: Tests for US2 can run in parallel
- T020-T023: Tests for US3 can run in parallel
- T033-T035: Edge case tests can run in parallel
- User Stories 2 and 3 can be worked on in parallel after US1 is complete

---

## Parallel Example: User Story 1 Tests

```bash
# Launch all tests for User Story 1 together:
Task: "Add test 'hides labels during test mode before answer submission'"
Task: "Add test 'shows labels in test mode after answer submission'"
```

## Parallel Example: All User Story Tests

```bash
# After Foundational phase, all test tasks can be written in parallel:
Task T006: "Add test for US1 - hide before submission"
Task T007: "Add test for US1 - show after submission"
Task T013: "Add test for US2 - correctPositions"
Task T014: "Add test for US2 - missedPositions"
Task T015: "Add test for US2 - incorrectPositions"
Task T020: "Add test for US3 - view mode"
Task T021: "Add test for US3 - draw mode"
Task T022: "Add test for US3 - click-select mode"
Task T023: "Add test for US3 - patterns mode"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify environment)
2. Complete Phase 2: Foundational (add types)
3. Complete Phase 3: User Story 1 (tests + implementation)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Start quiz, verify labels hidden
   - Submit answer, verify labels shown
   - Verify 100% test coverage for new code
5. Deploy/demo if ready

**MVP Scope**: Just User Story 1 delivers core value - quizzes hide answers before submission.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! 🎯)
3. Add User Story 2 → Test independently → Deploy/Demo (feedback states work)
4. Add User Story 3 → Test independently → Deploy/Demo (no regressions)
5. Polish phase → Quality checks → Final release
6. Each story adds value without breaking previous stories

### Recommended Execution Order

**For solo developer**:
1. T001-T003 (Setup)
2. T004-T005 (Foundational)
3. T006-T012 (US1 - MVP)
4. T013-T019 (US2)
5. T020-T026 (US3)
6. T027-T032 (Polish)
7. T033-T036 (Edge cases)

**For parallel team** (after Foundational):
- Developer A: User Story 1 (T006-T012)
- Developer B: User Story 2 (T013-T019)
- Developer C: User Story 3 (T020-T026)
- Then: Polish & Edge Cases together

---

## Task Summary

**Total Tasks**: 36

**Tasks by Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 2 tasks
- Phase 3 (User Story 1 - P1): 7 tasks (2 tests + 5 implementation)
- Phase 4 (User Story 2 - P2): 7 tasks (3 tests + 4 implementation)
- Phase 5 (User Story 3 - P3): 7 tasks (4 tests + 3 implementation)
- Phase 6 (Polish): 6 tasks
- Edge Cases: 4 tasks (all tests)

**Parallel Opportunities**: 13 tasks marked [P] can run in parallel with other tasks in the same phase

**Critical Path**: Setup → Foundational → US1 (MVP) → US2 → US3 → Polish

**MVP Scope**: Tasks T001-T012 (Setup + Foundational + User Story 1) = 12 tasks

---

## Notes

- [P] tasks = different files or independent test cases, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Tests MUST fail before implementing (TDD approach per constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All existing tests (151/151) must continue to pass
- Estimated time: 1-2 hours total (as per quickstart.md)
