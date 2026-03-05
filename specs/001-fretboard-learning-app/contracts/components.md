# Component Contracts: Fretboard Learning App

**Date**: 2026-03-04
**Branch**: 001-fretboard-learning-app

## Overview

This document defines the public interfaces (contracts) for the main components in the Fretboard Learning App. These contracts ensure consistent behavior across the application and enable independent development and testing.

---

## 1. Fretboard Component Contract

The `<Fretboard>` component is the core reusable component used across all modes.

### Interface

```typescript
interface FretboardProps {
  // Visual config
  fretRange?: [number, number];      // default [0, 12]
  strings?: string[];                // default ['E','A','D','G','B','e']
  showFretNumbers?: boolean;         // default true
  showNoteNames?: boolean;           // default false
  showIntervalLabels?: boolean;      // default false

  // State
  state?: FretboardState;            // dots + lines to render

  // Interaction
  mode: 'view' | 'click-select' | 'draw';
  onFretClick?: (pos: FretPosition) => void;
  onLineDrawn?: (from: FretPosition, to: FretPosition) => void;
  selectedPositions?: FretPosition[];  // controlled selection
  correctPositions?: FretPosition[];   // feedback overlay — green
  missedPositions?: FretPosition[];    // feedback overlay — yellow
  incorrectPositions?: FretPosition[]; // feedback overlay — red

  // Accessibility
  ariaLabel?: string;
}
```

### Behavior Contract

#### View Mode (`mode="view"`)

**Guarantees**:
- Renders `state.dots` and `state.lines` as static visual elements
- No user interaction (clicks ignored)
- All overlays (correct, missed, incorrect) displayed if provided
- Accessible via keyboard navigation (ARIA grid pattern)

**Preconditions**:
- `state` must be valid FretboardState object
- `fretRange[0] <= fretRange[1]`

**Postconditions**:
- Fretboard renders without errors
- All dots and lines visible within fret range

#### Click-Select Mode (`mode="click-select"`)

**Guarantees**:
- Each fret cell is clickable (button with ARIA label)
- Clicking fires `onFretClick` with FretPosition
- `selectedPositions` highlighted with distinct style
- Feedback overlays displayed when provided

**Preconditions**:
- `onFretClick` callback provided
- `selectedPositions` array of valid FretPosition objects

**Postconditions**:
- Click on fret at (string: 2, fret: 5) → `onFretClick({ string: 2, fret: 5 })`
- Selected positions visually distinct

**Invariants**:
- Multiple clicks on same position fire multiple callbacks (no deduplication)
- Callbacks fire in order of clicks

#### Draw Mode (`mode="draw"`)

**Guarantees**:
- Click on empty fret → adds dot at that position
- Click on existing dot → removes that dot
- Drag between two dots → fires `onLineDrawn` with positions
- Component maintains internal state for dots and lines
- Parent can access state via ref (optional)

**Preconditions**:
- None (component manages its own state)

**Postconditions**:
- Click at empty position → dot appears
- Click at occupied position → dot disappears
- Drag from (0, 5) to (1, 7) → `onLineDrawn({ string: 0, fret: 5 }, { string: 1, fret: 7 })`

**Invariants**:
- Maximum one dot per position
- Lines only between existing dots

### Accessibility Contract

**ARIA Structure**:
```html
<div role="grid" aria-label="Guitar fretboard">
  <div role="row">
    <div role="gridcell" aria-label="String 0 (E), Fret 5, Note A">
      <button>...</button>
    </div>
  </div>
</div>
```

**Keyboard Navigation**:
- Arrow keys: Move between adjacent frets
- Enter/Space: Click current fret
- Tab: Move between fretboard and other controls

### Error Handling

**Invalid Props**:
- If `fretRange[0] > fretRange[1]`, swap values and log warning
- If `strings.length !== 6`, use default and log warning
- If `state` contains invalid FretPosition, skip that dot/line and log error

**Contract Violations**:
- Missing `onFretClick` in 'click-select' mode → log error, no crash
- Missing `onLineDrawn` in 'draw' mode → lines not saved, no crash

---

## 2. Quiz Component Contracts

### QuizRunner Component

```typescript
interface QuizRunnerProps {
  quizType: 'note-find' | 'note-name' | 'interval' | 'chord';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionCount: number;
  onComplete: (result: QuizResult) => void;
  onProgress: (progress: QuizProgress) => void;
}

interface QuizResult {
  totalQuestions: number;
  correct: number;
  durationMs: number;
  cards: SRSCard[];  // updated cards after quiz
}

interface QuizProgress {
  currentQuestion: number;
  totalQuestions: number;
  currentScore: number;
}
```

**Behavior Contract**:
- Generates `questionCount` questions based on `quizType` and `difficulty`
- Tracks time from first interaction to completion
- Updates SRSCard for each question based on user performance
- Fires `onComplete` when all questions answered
- Fires `onProgress` after each question

**Invariants**:
- Question generation respects `difficulty` settings:
  - Beginner: frets 0-5, single string
  - Intermediate: frets 0-12, all strings
  - Advanced: frets 0-24, all strings, optional timer
- Each question has exactly one correct answer
- User cannot skip questions

### Quiz Feedback Component

```typescript
interface QuizFeedbackProps {
  correctPositions: FretPosition[];
  missedPositions: FretPosition[];
  incorrectPositions: FretPosition[];
  message: string;
  onContinue: () => void;
}
```

**Behavior Contract**:
- Displays color-coded overlay on Fretboard:
  - Green: correct positions
  - Yellow: missed positions
  - Red: incorrect positions
- Shows `message` (e.g., "Correct!", "Try again")
- "Continue" button fires `onContinue`

---

## 3. Whiteboard Component Contracts

### DiagramEditor Component

```typescript
interface DiagramEditorProps {
  diagram?: Diagram;  // undefined = new diagram
  onSave: (diagram: Diagram) => void;
  onCancel: () => void;
}
```

**Behavior Contract**:
- If `diagram` provided, loads its FretboardState
- If `diagram` undefined, starts with empty FretboardState
- Provides toolbar for:
  - Adding/editing/deleting dots
  - Drawing lines between dots
  - Changing dot color, shape
  - Changing line style
- "Save" button fires `onSave` with updated Diagram
- "Cancel" button fires `onCancel` (discard changes)

**Invariants**:
- Unsaved changes trigger confirmation before `onCancel`
- Saved diagrams include `updatedAt` timestamp

### PatternLibrary Component

```typescript
interface PatternLibraryProps {
  onSelectPattern: (diagram: Diagram) => void;
}
```

**Behavior Contract**:
- Displays categorized list of built-in patterns:
  - CAGED shapes
  - Pentatonic boxes
  - Major scale positions
  - Interval shapes
- Click on pattern → `onSelectPattern` with built-in Diagram
- All built-in patterns have `isBuiltIn: true`

**Invariants**:
- Built-in patterns cannot be edited directly
- User must clone pattern to edit

---

## 4. Learning Mode Component Contracts

### LessonPlayer Component

```typescript
interface LessonPlayerProps {
  lessonId: string;
  onComplete: () => void;
  onExit: () => void;
}
```

**Behavior Contract**:
- Loads lesson curriculum from lesson definition file
- Renders sequence of steps:
  - Explain step: Text + static Fretboard (view mode)
  - Verify step: Instruction + interactive Fretboard (click-select mode)
- Tracks progress within lesson
- "Complete" button fires `onComplete` after final step
- "Exit" button fires `onExit` (no progress saved)

**Invariants**:
- Lessons do NOT create SRSCards (Explorer and Quiz modes do)
- Lessons can be repeated indefinitely
- No partial progress saved within a lesson

### Explorer Component

```typescript
interface ExplorerProps {
  initialRoot?: NoteName;
  initialDisplayType?: 'note' | 'interval' | 'triad' | 'scale';
}

interface ExplorerState {
  root: NoteName;
  displayType: 'note' | 'interval' | 'triad' | 'scale';
  scaleType?: 'major' | 'minor' | 'pentatonic';
  fretRange: [number, number];
}
```

**Behavior Contract**:
- Renders control panel for selecting:
  - Root note (chromatic picker)
  - Display type (note positions, interval map, triad voicings, scale)
  - Fret range (slider)
- Fretboard updates in real time as selections change
- No quiz logic, no right/wrong, pure exploration

**Invariants**:
- Explorer does NOT write to ProgressStore
- All updates are transient (not saved)

---

## 5. Dashboard Component Contracts

### DashboardPage Component

```typescript
interface DashboardPageProps {
  // No props - reads from global ProgressStore context
}
```

**Behavior Contract**:
- Displays 4 summary cards:
  - Notes: accuracy %, sparkline of last 7 sessions
  - Intervals: accuracy %, sparkline
  - Chords: accuracy %, sparkline
  - Due for Review: count of SRSCards with `nextReviewAt <= today`
- Each card clickable → navigates to corresponding mode
- "Start Review" button → starts review session with due cards

**Invariants**:
- Loads under 200ms (empty state is valid)
- All modes reachable with single click

---

## 6. Hook Contracts

### useLocalStorage Hook

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T,
  migrate?: (data: unknown, fromVersion: number) => T
): [T, (value: T | ((prev: T) => T)) => void];
```

**Behavior Contract**:
- On mount: reads from localStorage, deserializes, runs migration if needed
- On update: serializes and writes to localStorage
- Returns `[value, setValue]` tuple (like useState)
- `setValue` accepts new value or updater function

**Preconditions**:
- `key` is valid localStorage key
- `initialValue` is valid default value
- `migrate` function handles version upgrades

**Postconditions**:
- Returns current value from localStorage or `initialValue`
- `setValue` updates both state and localStorage
- Schema migrations applied automatically

**Error Handling**:
- If localStorage read fails, use `initialValue` and log error
- If serialization fails, log error, no crash
- If migration fails, use `initialValue` and log error

---

## Contract Testing Strategy

### Component Tests

Each component contract should be tested with:

1. **Happy path**: Normal usage with valid props
2. **Edge cases**: Empty arrays, null values, boundary conditions
3. **Error cases**: Invalid props, missing callbacks
4. **Accessibility**: ARIA labels, keyboard navigation

### Example Test

```typescript
describe('Fretboard (click-select mode)', () => {
  it('fires onFretClick when fret is clicked', async () => {
    const onFretClick = jest.fn();
    render(
      <Fretboard 
        mode="click-select" 
        onFretClick={onFretClick}
        fretRange={[0, 5]}
      />
    );
    
    const fret = screen.getByRole('button', { name: /string 0 fret 3/i });
    await userEvent.click(fret);
    
    expect(onFretClick).toHaveBeenCalledTimes(1);
    expect(onFretClick).toHaveBeenCalledWith({ string: 0, fret: 3 });
  });
});
```

---

## Contract Versioning

When updating component contracts:

1. **Additive changes**: New optional props → Minor version bump
2. **Breaking changes**: Removed props, changed types → Major version bump
3. **Bug fixes**: Internal behavior changes → Patch version bump

All contract changes must be documented in CHANGELOG.md.

---

## Summary

**Total Contracts**: 10 component interfaces + 1 hook

**Categories**:
- Core visualization: Fretboard (3 modes)
- Quiz modes: QuizRunner, QuizFeedback
- Whiteboard: DiagramEditor, PatternLibrary
- Learning: LessonPlayer, Explorer
- Dashboard: DashboardPage
- Hooks: useLocalStorage

**Testing Requirements**:
- Unit tests for all contracts
- Integration tests for user flows
- Accessibility tests for interactive components

**Next Steps**:
- Implement components according to these contracts
- Write contract tests before implementation (TDD)
- Document any deviations from contracts in code comments
