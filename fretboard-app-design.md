# Fretboard Learning App — Design Document

**Stack:** TypeScript · React · Jest
**Storage:** `localStorage` (no backend)
**Date:** 2026-03-03

---

## 1. Overview

A single-page web application that helps guitar players learn note positions on the fretboard, understand intervals, and build chords. The app is built around a shared, flexible **Fretboard component** that every mode reuses. Progress is tracked locally using spaced-repetition (SM-2 algorithm).

---

## 2. Goals & Non-Goals

**Goals**
- Teach and quiz note positions across all 24 frets on a standard 6-string (EADGBe).
- Teach intervals visually — seeing the shapes on the neck.
- Teach triad construction (major, minor, diminished, augmented).
- Provide a whiteboard for free exploration, annotation, and saving custom diagrams (CAGED, pentatonic boxes, etc.).
- Track per-topic accuracy and resurface weak areas via spaced repetition.

**Non-Goals (v1)**
- No backend, accounts, or sync.
- No alternate tunings or left-handed mode.
- No 7th chords or extensions (triads only).
- No audio playback.
- No bass or 7-string support.

---

## 3. Core Concepts & Data Model

### 3.1 Primitive types

```ts
// The 12 chromatic pitches — stored without enharmonic preference
type NoteName = 'C' | 'C#/Db' | 'D' | 'D#/Eb' | 'E' | 'F'
              | 'F#/Gb' | 'G' | 'G#/Ab' | 'A' | 'A#/Bb' | 'B';

// Display preference (per user setting)
type AccidentalPreference = 'sharp' | 'flat';

// A single point on the neck
interface FretPosition {
  string: number;   // 0 = low E … 5 = high e
  fret: number;     // 0 (open) … 24
}

type IntervalName =
  | 'Unison' | 'm2' | 'M2' | 'm3' | 'M3'
  | 'P4' | 'Tritone' | 'P5'
  | 'm6' | 'M6' | 'm7' | 'M7' | 'Octave';

type TriadQuality = 'major' | 'minor' | 'diminished' | 'augmented';
```

### 3.2 Fretboard state

The core rendering data structure passed into every `<Fretboard>` instance:

```ts
interface MarkedDot {
  position: FretPosition;
  label?: string;         // e.g. "R", "3", "C#", "m3"
  color?: string;         // hex / tailwind token
  shape?: 'circle' | 'square' | 'diamond';
}

interface ConnectionLine {
  from: FretPosition;
  to: FretPosition;
  style?: 'solid' | 'dashed';
  color?: string;
}

interface FretboardState {
  dots: MarkedDot[];
  lines: ConnectionLine[];
  highlightStrings?: number[];   // dim un-highlighted strings
  highlightFrets?: number[];     // highlight a fret range
}
```

### 3.3 Whiteboard diagram

```ts
interface Diagram {
  id: string;
  name: string;
  description?: string;
  createdAt: string;        // ISO
  updatedAt: string;
  fretboardState: FretboardState;
  isBuiltIn: boolean;       // true = shipped with app, immutable
}
```

### 3.4 Spaced-repetition card (SM-2)

```ts
type CardCategory = 'note' | 'interval' | 'chord';

interface SRSCard {
  id: string;               // e.g. "note:C:string2", "interval:M3", "chord:Cmaj"
  category: CardCategory;
  subCategory: string;      // human-readable topic label
  easeFactor: number;       // SM-2 EF, starts at 2.5
  intervalDays: number;     // days until next review
  nextReviewAt: string;     // ISO date
  repetitions: number;
  lastAccuracy: number | null;   // 0–1, most recent session
}
```

### 3.5 Progress store (localStorage schema)

```ts
interface ProgressStore {
  version: number;          // schema version for migrations
  cards: Record<string, SRSCard>;
  sessionHistory: SessionRecord[];
  settings: UserSettings;
}

interface SessionRecord {
  date: string;
  mode: AppMode;
  totalQuestions: number;
  correct: number;
  durationMs: number;
}

interface UserSettings {
  accidentalPreference: AccidentalPreference;
  fretRange: { min: number; max: number };   // default 0–12, expandable to 24
}
```

---

## 4. Application Modes

```
Dashboard
├── Whiteboard Mode
├── Learning Mode
│   ├── Guided Lessons
│   └── Explorer / Reference
└── Quiz Mode
    ├── Note Recognition
    ├── Interval Training
    └── Chord Building
```

---

## 5. Use Cases

---

### UC-01 — Navigate the Dashboard

**Actor:** Any user
**Goal:** Get an overview of progress and jump into any mode.

**Main flow:**
1. User opens the app.
2. Dashboard renders four summary cards: *Notes*, *Intervals*, *Chords*, *Due for Review*.
3. Each card shows accuracy (%) and a sparkline of the last 7 sessions.
4. "Due for Review" card shows the count of SRS cards ready today.
5. User clicks a mode card → navigates to that mode.
6. A persistent nav bar allows switching modes at any time.

**Acceptance criteria:**
- Dashboard loads under 200 ms on first open (empty state is valid).
- Each mode card is reachable with a single click.
- Empty state (no history) renders without errors.

---

### UC-02 — Whiteboard: Create a Custom Diagram

**Actor:** Any user
**Goal:** Annotate the fretboard freely and save the result.

**Main flow:**
1. User enters Whiteboard Mode and clicks **New Diagram**.
2. A blank `<Fretboard>` renders in edit mode (24 frets visible, fret range scrollable/zoomable).
3. User **clicks any fret cell** → a dot is placed with the default color.
4. User can optionally **type a label** on the dot (note name, interval symbol, finger number, etc.).
5. User **clicks two existing dots** while holding a "connect" toggle → a line is drawn between them.
6. User can change dot color, shape, and line style via a small toolbar.
7. User clicks **Save**, enters a name → diagram is written to `localStorage`.
8. Diagram appears in the "My Diagrams" list, accessible from the Whiteboard Mode home.

**Alternative flows:**
- User clicks an existing dot → a popover lets them edit the label, change style, or delete.
- User clicks a line → they can change its style or delete it.

**Acceptance criteria:**
- At least 50 saved diagrams can be stored without perceptible lag.
- Unsaved changes trigger a "discard?" confirmation before navigating away.

---

### UC-03 — Whiteboard: Load a Built-In Pattern

**Actor:** Any user
**Goal:** Explore a pre-built CAGED shape, scale pattern, or interval map.

**Main flow:**
1. User opens Whiteboard Mode and clicks **Pattern Library**.
2. A sidebar lists categories: *CAGED shapes*, *Pentatonic boxes*, *Major scale positions*, *Interval shapes*.
3. User selects a pattern (e.g., "C shape — CAGED").
4. Fretboard renders with the pattern's dots and lines pre-loaded.
5. User can pan/zoom, toggle note-name labels on/off, toggle interval labels on/off.
6. User can optionally **clone** the pattern to "My Diagrams" and edit from there.

**Built-in pattern library (v1 scope):**

| Category | Patterns |
|---|---|
| CAGED shapes | C, A, G, E, D (major) |
| Pentatonic | 5 positions (major pentatonic) |
| Major scale | 7 positions (3-notes-per-string) |
| Interval shapes | All 12 intervals from a root (one diagram per interval) |

**Acceptance criteria:**
- Built-in patterns are read-only (no accidental saves over them).
- Toggle labels re-renders the board without a page reload.

---

### UC-04 — Learning Mode: Guided Lesson

**Actor:** Beginner/intermediate user
**Goal:** Work through a structured lesson with interactive fretboard steps.

**Main flow:**
1. User enters Learning Mode → sees the lesson curriculum list.
2. User picks a lesson (e.g., "Notes on the Low E String").
3. Each lesson is a sequence of **steps**:
   - **Explain** step: text + static fretboard showing the concept.
   - **Verify** step: app asks "click all the F notes on this string" → user interacts → feedback given.
4. After the final step, user receives a summary and the lesson is marked complete.
5. Completed lessons show a checkmark; users may repeat any lesson.

**Lesson curriculum (v1):**

| # | Lesson |
|---|---|
| 1 | The open strings |
| 2 | Natural notes on the low E string |
| 3 | All notes (with accidentals) on the low E string |
| 4 | The octave shape (string skip pattern) |
| 5 | Notes on every string — one at a time |
| 6 | The chromatic scale & half/whole steps |
| 7 | Introduction to intervals |
| 8 | Interval shapes: unison, octave, P5 |
| 9 | Interval shapes: M3, m3 |
| 10 | Building a major triad (root, M3, P5) |
| 11 | Building a minor triad (root, m3, P5) |
| 12 | Diminished and augmented triads |
| 13 | CAGED overview |

**Acceptance criteria:**
- User can exit mid-lesson; progress within the lesson is not saved (lessons restart from the beginning).
- Lesson step completion does **not** create SRS cards (Explorer and Quiz modes do).

---

### UC-05 — Learning Mode: Explorer / Reference View

**Actor:** Any user
**Goal:** Interactively visualize notes, scales, or chords on the neck with no right/wrong pressure.

**Main flow:**
1. User enters Explorer from Learning Mode.
2. A control panel lets the user select:
   - **Root note** (chromatic picker, C default)
   - **Display type**: All positions of this note | Interval map | Triad voicings | Scale (major / minor / pentatonic)
3. Fretboard updates in real time as selections change.
4. User can toggle overlays: note names, interval numbers, scale degrees.
5. Optionally restrict fret range (e.g., frets 5–12 only) via a range slider.

**Acceptance criteria:**
- All 12 roots × 4 display types render correctly.
- Explorer does **not** write to the SRS store.

---

### UC-06 — Quiz: Find the Note

**Actor:** Any user
**Goal:** Given a note name, click all positions on the fretboard where it appears.

**Main flow:**
1. User starts a Note Recognition quiz session.
2. App displays a note name (e.g., "**F#**") and a blank fretboard.
3. User clicks every fret they believe is that note.
4. User clicks **Check**.
5. App reveals: correct positions (green), positions the user missed (yellow), incorrect clicks (red).
6. User sees a score for this question and presses **Next**.
7. After *N* questions (configurable, default 10) a session summary is shown; SRS cards are updated.

**Difficulty settings:**

| Level | Fret range | String scope |
|---|---|---|
| Beginner | 0–5 | Single string |
| Intermediate | 0–12 | All strings |
| Advanced | 0–24 | All strings, timed |

**Acceptance criteria:**
- Enharmonic equivalents (F#/Gb) are accepted as correct.
- SRS card for the specific note is updated after the question.

---

### UC-07 — Quiz: Name the Note

**Actor:** Any user
**Goal:** Given a highlighted fret position, identify the note.

**Main flow:**
1. App highlights one fret position on the fretboard.
2. User selects the note name from a 4-option multiple choice (or types freely — configurable).
3. App gives immediate feedback.
4. SRS card updated; next question presented.

**Acceptance criteria:**
- Distractors (wrong answers) are chromatic neighbors to make it non-trivial.
- Free-type entry accepts both enharmonic spellings.

---

### UC-08 — Quiz: Identify the Interval

**Actor:** Intermediate user
**Goal:** Given two highlighted fret positions, name the interval between them.

**Main flow:**
1. App places two colored dots on the fretboard (root = blue, target = orange).
2. User selects the interval from a list (Unison … Octave, 13 options).
3. App gives feedback and optionally shows the interval shape pattern.
4. SRS card for that interval is updated.

**Variation — Reverse mode:**
1. App names an interval and highlights only the root.
2. User clicks the target note.
3. Any correct position on any string is accepted.

**Acceptance criteria:**
- Both ascending and descending intervals appear in the question set.
- Root and target are always on the same string or adjacent strings (no impossible shapes).

---

### UC-09 — Quiz: Build a Chord

**Actor:** Intermediate user
**Goal:** Given a chord name, place all required chord tones on the fretboard.

**Main flow:**
1. App displays a chord name (e.g., "**D diminished**") and an empty fretboard.
2. User places dots on the neck — any voicing, any octave, but must include all chord tones (root, 3rd, 5th).
3. User clicks **Check**.
4. App evaluates:
   - All three chord tones present → Correct.
   - Missing a tone → highlights the missing tone in red.
   - Extra notes that are not chord tones → highlighted in yellow as a warning.
5. App shows one canonical voicing for reference after the attempt.
6. SRS card updated.

**Acceptance criteria:**
- App correctly handles all 48 root × quality combinations (12 roots × 4 qualities).
- Any valid voicing (open, barre, partial) is accepted.

---

### UC-10 — Review Due SRS Cards

**Actor:** Returning user
**Goal:** Complete today's spaced-repetition review queue.

**Main flow:**
1. Dashboard shows "X cards due today."
2. User clicks **Start Review**.
3. App presents each due card using the appropriate quiz format (one of UC-06–UC-09).
4. After answering, the SM-2 algorithm updates `easeFactor`, `intervalDays`, and `nextReviewAt`.
5. When the queue is empty, user sees a completion screen with session stats.

**SM-2 update rules:**

| User rating | Meaning | EF delta |
|---|---|---|
| 0 — Wrong | Complete blackout | Reset to day 1, EF − 0.2 |
| 1 — Hard | Correct with significant difficulty | EF − 0.14 |
| 2 — Good | Correct with some effort | EF unchanged |
| 3 — Easy | Correct, no hesitation | EF + 0.1 |

**Acceptance criteria:**
- Cards due today always surface before new cards.
- A card answered incorrectly is re-queued for the same session (within the review) and marked for review again in 1 day.

---

## 6. Fretboard Component Contract

The `<Fretboard>` component is the single most important piece of the app. Every mode composes on top of it.

```ts
interface FretboardProps {
  // Visual config
  fretRange?: [number, number];      // default [0, 12]
  strings?: string[];                // default ['E','A','D','G','B','e']
  showFretNumbers?: boolean;
  showNoteNames?: boolean;
  showIntervalLabels?: boolean;

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

Modes:
- **`view`** — read-only, renders dots and lines, no interaction.
- **`click-select`** — clicking a fret fires `onFretClick`; used by all quiz modes.
- **`draw`** — clicking places/removes dots; dragging between two dots creates a line; used by Whiteboard.

---

## 7. Component Architecture

```
App
├── Router
├── Navbar
└── Pages
    ├── DashboardPage
    │   ├── StatCard (×4)
    │   └── ModeGrid
    ├── WhiteboardPage
    │   ├── PatternLibrarySidebar
    │   ├── DiagramList
    │   ├── Fretboard  ← mode="draw"
    │   └── AnnotationToolbar
    ├── LearningPage
    │   ├── LessonList
    │   ├── LessonPlayer
    │   │   ├── StepExplain (text + Fretboard mode="view")
    │   │   └── StepVerify  (Fretboard mode="click-select")
    │   └── ExplorerPanel
    │       ├── RootPicker
    │       ├── DisplayTypeSelector
    │       └── Fretboard  ← mode="view"
    └── QuizPage
        ├── QuizSelector
        ├── QuizRunner
        │   ├── QuestionHeader
        │   ├── Fretboard  ← mode="click-select"
        │   ├── AnswerControls
        │   └── FeedbackOverlay
        └── SessionSummary
```

---

## 8. State Management

Lightweight approach using React Context + `useReducer` — no external state library in v1.

| Store | Scope | Persistence |
|---|---|---|
| `ProgressStore` | App-wide | `localStorage` |
| `FretboardStore` | Per mode instance | In-memory (component state) |
| `DiagramStore` | Whiteboard mode | `localStorage` |
| `QuizSessionStore` | Active quiz session | In-memory, written to `ProgressStore` on completion |

A custom `useLocalStorage<T>` hook handles serialization, deserialization, and schema migration (keyed by `version`).

---

## 9. Testing Strategy

| Layer | Tool | Coverage target |
|---|---|---|
| Unit — music theory helpers | Jest | 100% (pure functions, critical correctness) |
| Unit — SRS algorithm | Jest | 100% |
| Unit — localStorage hooks | Jest + `@testing-library/react` | 90% |
| Component — Fretboard rendering | React Testing Library | Key interaction paths |
| Component — Quiz flow | React Testing Library | Happy path + edge cases |
| E2E (optional v2) | Playwright | Full quiz session |

**Music theory helpers to unit-test exhaustively:**
- `getNoteAtFret(string, fret)` → NoteName
- `getInterval(posA, posB)` → IntervalName
- `getChordTones(root, quality)` → NoteName[]
- `isChordCorrect(placed, required)` → boolean
- `sm2Update(card, rating)` → SRSCard

---

## 10. Implementation Phases

### Phase 1 — Foundation (weeks 1–2)
- Project scaffold: Vite + React + TypeScript + Jest + ESLint/Prettier
- Music theory utility library (fully unit-tested)
- `<Fretboard>` component in all three modes
- `useLocalStorage` hook + `ProgressStore` schema

### Phase 2 — Whiteboard (week 3)
- Dot placement, connection lines, toolbar
- Built-in pattern library (CAGED + pentatonic boxes)
- Save/load user diagrams

### Phase 3 — Learning Mode (week 4)
- Guided lesson engine (step types: explain, verify)
- Full lesson curriculum (lessons 1–13)
- Explorer reference view

### Phase 4 — Quiz Modes (weeks 5–6)
- Find the Note quiz
- Name the Note quiz
- Identify the Interval quiz (including reverse mode)
- Build a Chord quiz

### Phase 5 — Progress & SRS (week 7)
- SM-2 integration across all quiz modes
- Dashboard with stat cards and sparklines
- Due-cards review session

### Phase 6 — Polish (week 8)
- Fret range slider (beginner 0–5 through advanced 0–24)
- Accidental preference (sharp/flat toggle)
- Responsive layout (tablet / desktop)
- Accessibility audit (keyboard nav, ARIA labels)

---

## 11. Open Questions (to revisit)

1. **Timer mode** — Should Quiz Mode have an optional countdown per question for advanced difficulty?
2. **Enharmonic display** — Show F# vs Gb based on key context, or always follow user preference?
3. **Chord voicing validation strictness** — Should the app warn when the user places a note higher than practical (e.g., fret 22 on string 6)?
4. **Pattern library expansion** — Scope for adding minor CAGED, modes (Dorian, Phrygian), blues scales in a future version.
5. **Export** — Should Whiteboard diagrams be exportable as PNG/SVG eventually?
