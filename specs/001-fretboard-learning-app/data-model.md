# Data Model: Fretboard Learning App

**Date**: 2026-03-04
**Branch**: 001-fretboard-learning-app

## Overview

This document defines all entities, their fields, relationships, validation rules, and state transitions for the Fretboard Learning App.

---

## Core Domain Entities

### 1. NoteName

**Type**: Union type (enum)

**Values**:
```typescript
type NoteName = 
  | 'C' | 'C#/Db' | 'D' | 'D#/Db' | 'E' | 'F' 
  | 'F#/Gb' | 'G' | 'G#/Ab' | 'A' | 'A#/Bb' | 'B';
```

**Validation Rules**:
- Must be one of the 12 chromatic pitches
- Enharmonic equivalents stored as single value (e.g., 'C#/Db')
- Display preference determined by AccidentalPreference setting

**Relationships**:
- Used in: FretPosition (derived), Chord, SRSCard

---

### 2. FretPosition

**Purpose**: Represents a single point on the guitar neck

**Fields**:
```typescript
interface FretPosition {
  string: number;   // 0 = low E … 5 = high e
  fret: number;     // 0 (open) … 24
}
```

**Validation Rules**:
- `string`: 0-5 (6-string guitar)
- `fret`: 0-24 (standard fret range)
- Must be serializable for localStorage

**Relationships**:
- Used in: MarkedDot, ConnectionLine, Quiz questions
- Derives NoteName via `getNoteAtFret(string, fret)`

**State Transitions**: None (immutable value object)

---

### 3. IntervalName

**Type**: Union type (enum)

**Values**:
```typescript
type IntervalName =
  | 'Unison' | 'm2' | 'M2' | 'm3' | 'M3'
  | 'P4' | 'Tritone' | 'P5'
  | 'm6' | 'M6' | 'm7' | 'M7' | 'Octave';
```

**Validation Rules**:
- Must be one of the 13 interval types (within one octave)

**Relationships**:
- Used in: SRSCard (category: 'interval'), Quiz questions

---

### 4. TriadQuality

**Type**: Union type (enum)

**Values**:
```typescript
type TriadQuality = 'major' | 'minor' | 'diminished' | 'augmented';
```

**Validation Rules**:
- Must be one of the 4 triad qualities

**Relationships**:
- Used in: SRSCard (category: 'chord'), Quiz questions

---

## Fretboard Visualization Entities

### 5. MarkedDot

**Purpose**: A single visual marker on the fretboard

**Fields**:
```typescript
interface MarkedDot {
  position: FretPosition;
  label?: string;         // e.g. "R", "3", "C#", "m3"
  color?: string;         // hex / tailwind token
  shape?: 'circle' | 'square' | 'diamond';
}
```

**Validation Rules**:
- `position` is required
- `label` optional, max 10 characters
- `color` must be valid CSS color or Tailwind token
- `shape` defaults to 'circle'

**Relationships**:
- Part of: FretboardState
- Used in: Diagram, Quiz feedback

---

### 6. ConnectionLine

**Purpose**: Visual connection between two dots on the fretboard

**Fields**:
```typescript
interface ConnectionLine {
  from: FretPosition;
  to: FretPosition;
  style?: 'solid' | 'dashed';
  color?: string;
}
```

**Validation Rules**:
- Both `from` and `to` required
- `from` and `to` must be different positions
- `style` defaults to 'solid'

**Relationships**:
- Part of: FretboardState
- Used in: Diagram (CAGED shapes, interval patterns)

---

### 7. FretboardState

**Purpose**: Complete visual state of a fretboard instance

**Fields**:
```typescript
interface FretboardState {
  dots: MarkedDot[];
  lines: ConnectionLine[];
  highlightStrings?: number[];   // dim un-highlighted strings
  highlightFrets?: number[];     // highlight a fret range
}
```

**Validation Rules**:
- `dots` and `lines` arrays, can be empty
- `highlightStrings` values: 0-5
- `highlightFrets` values: 0-24

**Relationships**:
- Used in: Diagram, Quiz feedback, Explorer view
- Passed to `<Fretboard>` component

**State Transitions**:
- **View mode**: Immutable, set by parent
- **Draw mode**: Mutable, updated by user interactions (add/remove dots, draw lines)
- **Quiz mode**: Controlled by quiz logic, shows feedback overlays

---

## Diagram Entity (Whiteboard)

### 8. Diagram

**Purpose**: Saved fretboard annotation created by user

**Fields**:
```typescript
interface Diagram {
  id: string;                  // UUID
  name: string;                // User-defined name
  description?: string;        // Optional notes
  createdAt: string;           // ISO timestamp
  updatedAt: string;           // ISO timestamp
  fretboardState: FretboardState;
  isBuiltIn: boolean;          // true = shipped with app, immutable
}
```

**Validation Rules**:
- `id`: UUID v4 format
- `name`: Required, 1-100 characters
- `description`: Optional, max 500 characters
- `createdAt`, `updatedAt`: Valid ISO 8601 timestamps
- `isBuiltIn`: If true, diagram is read-only

**Relationships**:
- Belongs to: DiagramStore (localStorage)
- Contains: FretboardState

**State Transitions**:
- **Create**: New diagram with empty FretboardState
- **Edit**: Update `fretboardState` and `updatedAt`
- **Save**: Persist to localStorage
- **Delete**: Remove from localStorage (user diagrams only, not built-in)

**Business Rules**:
- Built-in diagrams (isBuiltIn: true) cannot be edited or deleted
- User can clone built-in diagrams to create editable copies
- Maximum 50 user diagrams (prevent localStorage bloat)

---

## Spaced Repetition Entities

### 9. SRSCard

**Purpose**: Tracks learning progress for a specific topic

**Fields**:
```typescript
type CardCategory = 'note' | 'interval' | 'chord';

interface SRSCard {
  id: string;               // e.g. "note:C:string2", "interval:M3", "chord:Cmaj"
  category: CardCategory;
  subCategory: string;      // human-readable topic label
  easeFactor: number;       // SM-2 EF, starts at 2.5
  intervalDays: number;     // days until next review
  nextReviewAt: string;     // ISO date (no time component)
  repetitions: number;      // number of successful reviews
  lastAccuracy: number | null;   // 0–1, most recent session
}
```

**Validation Rules**:
- `id`: Unique, format depends on category:
  - Note: "note:{NoteName}:string{0-5}"
  - Interval: "interval:{IntervalName}"
  - Chord: "chord:{NoteName}{quality}" (e.g., "chord:Cmajor")
- `easeFactor`: 1.3 - 3.0 (SM-2 bounds)
- `intervalDays`: >= 0
- `nextReviewAt`: Valid ISO date, >= today
- `repetitions`: >= 0
- `lastAccuracy`: 0-1 or null (no attempts yet)

**Relationships**:
- Part of: ProgressStore
- Updated by: Quiz sessions, Review sessions

**State Transitions**:
- **New card**: `easeFactor=2.5`, `intervalDays=0`, `nextReviewAt=today`, `repetitions=0`, `lastAccuracy=null`
- **After correct answer**: Update via SM-2 algorithm, increment `repetitions`, update `lastAccuracy`
- **After wrong answer**: Reset `intervalDays=1`, decrease `easeFactor`, set `lastAccuracy=0`
- **Due for review**: When `nextReviewAt <= today`

**SM-2 Algorithm Rules**:
```
If rating === 0 (Wrong):
  repetitions = 0
  intervalDays = 1
  easeFactor = max(1.3, easeFactor - 0.2)
  nextReviewAt = today + 1 day

If rating === 1 (Hard):
  repetitions = 0
  intervalDays = max(1, intervalDays * 1.2)
  easeFactor = max(1.3, easeFactor - 0.14)
  nextReviewAt = today + intervalDays

If rating === 2 (Good):
  repetitions += 1
  if repetitions === 1: intervalDays = 1
  else if repetitions === 2: intervalDays = 6
  else: intervalDays = intervalDays * easeFactor
  easeFactor = easeFactor (unchanged)
  nextReviewAt = today + intervalDays

If rating === 3 (Easy):
  repetitions += 1
  intervalDays = max(intervalDays * easeFactor * 1.3, intervalDays + 1)
  easeFactor = min(3.0, easeFactor + 0.1)
  nextReviewAt = today + intervalDays
```

---

## Progress Tracking Entities

### 10. SessionRecord

**Purpose**: Records a single quiz or review session

**Fields**:
```typescript
type AppMode = 'whiteboard' | 'learning' | 'quiz-note' | 'quiz-interval' | 'quiz-chord' | 'review';

interface SessionRecord {
  date: string;             // ISO date
  mode: AppMode;
  totalQuestions: number;
  correct: number;
  durationMs: number;       // milliseconds
}
```

**Validation Rules**:
- `date`: Valid ISO date
- `mode`: One of the 6 app modes
- `totalQuestions`: >= 0
- `correct`: 0 to `totalQuestions`
- `durationMs`: >= 0

**Relationships**:
- Part of: ProgressStore
- Used for: Dashboard stats, sparklines

---

### 11. UserSettings

**Purpose**: User preferences for display and interaction

**Fields**:
```typescript
type AccidentalPreference = 'sharp' | 'flat';

interface UserSettings {
  accidentalPreference: AccidentalPreference;
  fretRange: { 
    min: number; 
    max: number; 
  };
}
```

**Validation Rules**:
- `accidentalPreference`: 'sharp' or 'flat', default 'sharp'
- `fretRange.min`: 0-23
- `fretRange.max`: 1-24
- `fretRange.min < fretRange.max`

**Relationships**:
- Part of: ProgressStore
- Affects: Fretboard display, quiz generation

**State Transitions**:
- User can change settings at any time
- Changes persist immediately to localStorage

---

### 12. ProgressStore

**Purpose**: Root localStorage schema for all app state

**Fields**:
```typescript
interface ProgressStore {
  version: number;          // schema version for migrations
  cards: Record<string, SRSCard>;  // keyed by card.id
  sessionHistory: SessionRecord[];
  settings: UserSettings;
}
```

**Validation Rules**:
- `version`: Current version = 1
- `cards`: Object with SRSCard.id keys
- `sessionHistory`: Array of SessionRecord, sorted by date descending
- `settings`: Valid UserSettings object

**Relationships**:
- Root entity for localStorage
- Contains: SRSCard[], SessionRecord[], UserSettings

**State Transitions**:
- **Initialize**: Create default store if localStorage empty
- **Load**: Deserialize from localStorage, run migrations if needed
- **Update**: Modify any sub-entity, serialize back to localStorage
- **Migrate**: If `version` < current, apply migration functions

**Migration Strategy**:
```typescript
const CURRENT_VERSION = 1;

function migrateProgressStore(data: unknown, fromVersion: number): ProgressStore {
  let store = data as ProgressStore;
  
  if (fromVersion < 1) {
    // Future: v0 → v1 migration logic
  }
  
  return store;
}
```

---

## Diagram Store Entity

### 13. DiagramStore

**Purpose**: localStorage schema for saved diagrams

**Fields**:
```typescript
interface DiagramStore {
  version: number;
  diagrams: Diagram[];
}
```

**Validation Rules**:
- `version`: Current version = 1
- `diagrams`: Array of Diagram, max 50 user diagrams + built-in patterns

**Relationships**:
- Separate from ProgressStore (different localStorage key)
- Contains: Diagram[]

**State Transitions**:
- **Initialize**: Create store with built-in patterns
- **Load**: Deserialize from localStorage
- **Add diagram**: Append to `diagrams` array
- **Update diagram**: Find by `id`, update `fretboardState` and `updatedAt`
- **Delete diagram**: Remove from array (only if `isBuiltIn === false`)

---

## Entity Relationship Diagram

```
ProgressStore (1)
├── SRSCard (*)
├── SessionRecord (*)
└── UserSettings (1)

DiagramStore (1)
└── Diagram (*)
    └── FretboardState (1)
        ├── MarkedDot (*)
        │   └── FretPosition (1)
        └── ConnectionLine (*)
            ├── FretPosition (from)
            └── FretPosition (to)
```

---

## Summary

**Total Entities**: 13

**Categories**:
- Core domain: NoteName, FretPosition, IntervalName, TriadQuality (4)
- Visualization: MarkedDot, ConnectionLine, FretboardState (3)
- Persistence: Diagram, SRSCard, SessionRecord, UserSettings, ProgressStore, DiagramStore (6)

**Key Relationships**:
- FretboardState aggregates MarkedDot and ConnectionLine
- Diagram contains FretboardState
- ProgressStore aggregates SRSCard, SessionRecord, UserSettings
- DiagramStore aggregates Diagram

**State Transitions**:
- SRSCard: Complex SM-2 algorithm updates
- Diagram: Create → Edit → Save → Delete
- ProgressStore: Initialize → Load → Update → Migrate

**Next Steps**:
- Implement TypeScript interfaces in `src/types/`
- Create validation functions for each entity
- Implement useLocalStorage hook with schema migration
- Write unit tests for validation logic
