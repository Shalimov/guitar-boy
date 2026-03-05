# Library Contracts: Music Theory Helpers

**Date**: 2026-03-04
**Branch**: 001-fretboard-learning-app

## Overview

This document defines the public interfaces (contracts) for the pure utility functions in `src/lib/`. These functions implement music theory logic, spaced repetition algorithms, and data validation. All functions are pure (no side effects) and must have 100% test coverage.

---

## 1. Music Theory Functions

### getNoteAtFret

**Purpose**: Returns the note name at a given string and fret position

**Signature**:
```typescript
function getNoteAtFret(string: number, fret: number): NoteName;
```

**Parameters**:
- `string`: 0-5 (0 = low E, 5 = high e)
- `fret`: 0-24 (0 = open string)

**Returns**: NoteName (one of 12 chromatic pitches)

**Preconditions**:
- `string` in range [0, 5]
- `fret` in range [0, 24]

**Postconditions**:
- Returns correct NoteName for position
- Enharmonic equivalents returned as single value (e.g., 'C#/Db')

**Examples**:
```typescript
getNoteAtFret(0, 0)  // 'E' (open low E string)
getNoteAtFret(0, 1)  // 'F' (1st fret on low E)
getNoteAtFret(0, 5)  // 'A' (5th fret on low E)
getNoteAtFret(1, 0)  // 'A' (open A string)
getNoteAtFret(2, 12) // 'D' (12th fret on D string, octave)
```

**Error Handling**:
- If `string` out of range, throw `RangeError`
- If `fret` out of range, throw `RangeError`

---

### getInterval

**Purpose**: Returns the interval name between two fret positions

**Signature**:
```typescript
function getInterval(from: FretPosition, to: FretPosition): IntervalName;
```

**Parameters**:
- `from`: Starting FretPosition
- `to`: Ending FretPosition

**Returns**: IntervalName (one of 13 interval types)

**Preconditions**:
- Both positions valid (string 0-5, fret 0-24)

**Postconditions**:
- Returns interval within one octave (Unison to Octave)
- Handles both ascending and descending intervals

**Examples**:
```typescript
// Unison
getInterval({ string: 0, fret: 0 }, { string: 0, fret: 0 })  // 'Unison'

// Perfect fifth (7 frets up same string)
getInterval({ string: 0, fret: 0 }, { string: 0, fret: 7 })  // 'P5'

// Major third (4 frets up)
getInterval({ string: 0, fret: 0 }, { string: 0, fret: 4 })  // 'M3'

// Octave (12 frets up)
getInterval({ string: 0, fret: 0 }, { string: 0, fret: 12 }) // 'Octave'

// Descending interval (same as ascending)
getInterval({ string: 0, fret: 12 }, { string: 0, fret: 0 }) // 'Octave'
```

**Algorithm**:
1. Get note names at both positions
2. Calculate semitone difference
3. Map semitone count to IntervalName

**Error Handling**:
- If positions invalid, throw `RangeError`

---

### getChordTones

**Purpose**: Returns the three chord tones for a given root and quality

**Signature**:
```typescript
function getChordTones(root: NoteName, quality: TriadQuality): NoteName[];
```

**Parameters**:
- `root`: Root note of the chord
- `quality`: 'major' | 'minor' | 'diminished' | 'augmented'

**Returns**: Array of 3 NoteName values [root, third, fifth]

**Preconditions**:
- `root` is valid NoteName
- `quality` is valid TriadQuality

**Postconditions**:
- Returns array of exactly 3 note names
- Notes form correct chord quality:
  - Major: root, major 3rd, perfect 5th
  - Minor: root, minor 3rd, perfect 5th
  - Diminished: root, minor 3rd, diminished 5th
  - Augmented: root, major 3rd, augmented 5th

**Examples**:
```typescript
getChordTones('C', 'major')      // ['C', 'E', 'G']
getChordTones('A', 'minor')      // ['A', 'C', 'E']
getChordTones('B', 'diminished') // ['B', 'D', 'F']
getChordTones('C', 'augmented')  // ['C', 'E', 'G#/Ab']
```

**Algorithm**:
1. Start with root note
2. Add interval for third (M3 for major/augmented, m3 for minor/diminished)
3. Add interval for fifth (P5 for major/minor, d5 for diminished, A5 for augmented)

**Error Handling**:
- If `root` invalid, throw `TypeError`
- If `quality` invalid, throw `TypeError`

---

### isChordCorrect

**Purpose**: Validates if placed notes match required chord tones

**Signature**:
```typescript
function isChordCorrect(
  placed: FretPosition[],
  required: NoteName[]
): { correct: boolean; missing: NoteName[]; extra: NoteName[] };
```

**Parameters**:
- `placed`: Array of FretPosition objects the user placed
- `required`: Array of NoteName values that must be present

**Returns**: Object with:
- `correct`: boolean (true if all required notes present)
- `missing`: NoteName[] (required notes not found in placed)
- `extra`: NoteName[] (placed notes not in required)

**Preconditions**:
- `placed` array of valid FretPosition objects
- `required` array of valid NoteName values

**Postconditions**:
- `correct` is true if `missing` is empty
- `missing` contains all required notes not present in placed positions
- `extra` contains all placed notes not in required
- Enharmonic equivalents treated as equal (C#/Db === C#/Db)

**Examples**:
```typescript
// User placed C major chord correctly
isChordCorrect(
  [{ string: 1, fret: 3 }, { string: 2, fret: 2 }, { string: 3, fret: 0 }],
  ['C', 'E', 'G']
)
// Returns: { correct: true, missing: [], extra: [] }

// User missed the fifth
isChordCorrect(
  [{ string: 1, fret: 3 }, { string: 2, fret: 2 }],
  ['C', 'E', 'G']
)
// Returns: { correct: false, missing: ['G'], extra: [] }

// User added extra note
isChordCorrect(
  [{ string: 1, fret: 3 }, { string: 2, fret: 2 }, { string: 3, fret: 0 }, { string: 4, fret: 1 }],
  ['C', 'E', 'G']
)
// Returns: { correct: false, missing: [], extra: ['C'] }
```

**Algorithm**:
1. Convert `placed` positions to NoteName array (deduplicated)
2. Find notes in `required` not in placed → `missing`
3. Find notes in placed not in `required` → `extra`
4. `correct` = `missing.length === 0`

**Error Handling**:
- If `placed` contains invalid positions, throw `RangeError`
- If `required` contains invalid notes, throw `TypeError`

---

### getAllPositionsOfNote

**Purpose**: Returns all fret positions for a given note within fret range

**Signature**:
```typescript
function getAllPositionsOfNote(
  note: NoteName,
  fretRange: [number, number]
): FretPosition[];
```

**Parameters**:
- `note`: NoteName to find
- `fretRange`: [min, max] fret numbers

**Returns**: Array of FretPosition objects where note appears

**Preconditions**:
- `note` is valid NoteName
- `fretRange[0] <= fretRange[1]`
- `fretRange` within [0, 24]

**Postconditions**:
- Returns all positions where note appears
- Positions sorted by string (0-5), then by fret (low to high)
- Includes enharmonic equivalents

**Examples**:
```typescript
// Find all 'E' positions on frets 0-12
getAllPositionsOfNote('E', [0, 12])
// Returns: [
//   { string: 0, fret: 0 },
//   { string: 0, fret: 12 },
//   { string: 1, fret: 7 },
//   { string: 2, fret: 2 },
//   { string: 4, fret: 5 },
//   { string: 5, fret: 0 },
//   { string: 5, fret: 12 }
// ]
```

**Algorithm**:
1. For each string (0-5):
2. For each fret in range:
3. Check if `getNoteAtFret(string, fret)` === `note`
4. If match, add position to result

**Error Handling**:
- If `note` invalid, throw `TypeError`
- If `fretRange` invalid, throw `RangeError`

---

## 2. Spaced Repetition Functions

### sm2Update

**Purpose**: Updates an SRS card based on user performance rating

**Signature**:
```typescript
function sm2Update(card: SRSCard, rating: 0 | 1 | 2 | 3): SRSCard;
```

**Parameters**:
- `card`: Current SRSCard state
- `rating`: User performance (0=Wrong, 1=Hard, 2=Good, 3=Easy)

**Returns**: Updated SRSCard with new `easeFactor`, `intervalDays`, `nextReviewAt`, `repetitions`

**Preconditions**:
- `card` is valid SRSCard object
- `rating` is 0, 1, 2, or 3

**Postconditions**:
- Returns new SRSCard object (immutable update)
- `nextReviewAt` is ISO date string (no time component)
- `easeFactor` clamped to [1.3, 3.0]
- `intervalDays` >= 0

**SM-2 Algorithm**:

```typescript
// Rating 0 (Wrong)
if (rating === 0) {
  return {
    ...card,
    repetitions: 0,
    intervalDays: 1,
    easeFactor: Math.max(1.3, card.easeFactor - 0.2),
    nextReviewAt: addDays(today, 1),
    lastAccuracy: 0
  };
}

// Rating 1 (Hard)
if (rating === 1) {
  return {
    ...card,
    repetitions: 0,
    intervalDays: Math.max(1, Math.round(card.intervalDays * 1.2)),
    easeFactor: Math.max(1.3, card.easeFactor - 0.14),
    nextReviewAt: addDays(today, Math.max(1, Math.round(card.intervalDays * 1.2))),
    lastAccuracy: 0.5
  };
}

// Rating 2 (Good)
if (rating === 2) {
  let newInterval: number;
  if (card.repetitions === 0) {
    newInterval = 1;
  } else if (card.repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(card.intervalDays * card.easeFactor);
  }
  
  return {
    ...card,
    repetitions: card.repetitions + 1,
    intervalDays: newInterval,
    easeFactor: card.easeFactor,
    nextReviewAt: addDays(today, newInterval),
    lastAccuracy: 0.8
  };
}

// Rating 3 (Easy)
if (rating === 3) {
  const newInterval = Math.max(
    Math.round(card.intervalDays * card.easeFactor * 1.3),
    card.intervalDays + 1
  );
  
  return {
    ...card,
    repetitions: card.repetitions + 1,
    intervalDays: newInterval,
    easeFactor: Math.min(3.0, card.easeFactor + 0.1),
    nextReviewAt: addDays(today, newInterval),
    lastAccuracy: 1.0
  };
}
```

**Examples**:
```typescript
// New card, correct answer (Good)
const newCard: SRSCard = {
  id: 'note:C:string0',
  category: 'note',
  subCategory: 'Note C on low E string',
  easeFactor: 2.5,
  intervalDays: 0,
  nextReviewAt: '2026-03-04',
  repetitions: 0,
  lastAccuracy: null
};

sm2Update(newCard, 2);
// Returns: {
//   ...newCard,
//   repetitions: 1,
//   intervalDays: 1,
//   nextReviewAt: '2026-03-05',
//   lastAccuracy: 0.8
// }

// Wrong answer
sm2Update(card, 0);
// Returns: {
//   repetitions: 0,
//   intervalDays: 1,
//   easeFactor: 2.3,  // decreased by 0.2
//   nextReviewAt: '2026-03-05',
//   lastAccuracy: 0
// }
```

**Error Handling**:
- If `card` invalid, throw `TypeError`
- If `rating` not 0-3, throw `RangeError`

---

### getDueCards

**Purpose**: Returns all SRS cards due for review today or earlier

**Signature**:
```typescript
function getDueCards(cards: Record<string, SRSCard>): SRSCard[];
```

**Parameters**:
- `cards`: Object mapping card IDs to SRSCard objects

**Returns**: Array of SRSCard objects where `nextReviewAt <= today`

**Preconditions**:
- `cards` is valid Record<string, SRSCard>

**Postconditions**:
- Returns array sorted by `nextReviewAt` (oldest first)
- Only includes cards with `nextReviewAt <= today`

**Examples**:
```typescript
const cards = {
  'note:C:string0': { nextReviewAt: '2026-03-03', ... },
  'note:D:string0': { nextReviewAt: '2026-03-04', ... },  // today
  'note:E:string0': { nextReviewAt: '2026-03-05', ... }   // future
};

getDueCards(cards);  // today is 2026-03-04
// Returns: [
//   { id: 'note:C:string0', nextReviewAt: '2026-03-03', ... },
//   { id: 'note:D:string0', nextReviewAt: '2026-03-04', ... }
// ]
```

**Error Handling**:
- If `cards` invalid, return empty array

---

## 3. Validation Functions

### validateFretPosition

**Purpose**: Validates a FretPosition object

**Signature**:
```typescript
function validateFretPosition(pos: unknown): pos is FretPosition;
```

**Parameters**:
- `pos`: Value to validate

**Returns**: `true` if valid FretPosition, `false` otherwise

**Validation Rules**:
- Must be object with `string` and `fret` properties
- `string` must be number in [0, 5]
- `fret` must be number in [0, 24]

**Examples**:
```typescript
validateFretPosition({ string: 0, fret: 5 });  // true
validateFretPosition({ string: 6, fret: 5 });  // false (invalid string)
validateFretPosition({ string: 0, fret: 25 }); // false (invalid fret)
validateFretPosition(null);                     // false
```

---

### validateNoteName

**Purpose**: Validates a NoteName value

**Signature**:
```typescript
function validateNoteName(note: unknown): note is NoteName;
```

**Parameters**:
- `note`: Value to validate

**Returns**: `true` if valid NoteName, `false` otherwise

**Validation Rules**:
- Must be one of the 12 chromatic pitch strings

**Examples**:
```typescript
validateNoteName('C');       // true
validateNoteName('C#/Db');   // true
validateNoteName('H');       // false (not in chromatic scale)
validateNoteName(123);       // false
```

---

### validateSRSCard

**Purpose**: Validates an SRSCard object

**Signature**:
```typescript
function validateSRSCard(card: unknown): card is SRSCard;
```

**Parameters**:
- `card`: Value to validate

**Returns**: `true` if valid SRSCard, `false` otherwise

**Validation Rules**:
- Must have all required fields with correct types
- `id`, `category`, `subCategory` must be strings
- `easeFactor` must be number in [1.3, 3.0]
- `intervalDays` must be number >= 0
- `nextReviewAt` must be valid ISO date
- `repetitions` must be number >= 0
- `lastAccuracy` must be number in [0, 1] or null

**Examples**:
```typescript
validateSRSCard({
  id: 'note:C:string0',
  category: 'note',
  subCategory: 'C on low E',
  easeFactor: 2.5,
  intervalDays: 1,
  nextReviewAt: '2026-03-05',
  repetitions: 1,
  lastAccuracy: 0.8
});  // true

validateSRSCard({
  id: 'note:C:string0',
  easeFactor: 5.0  // invalid, too high
});  // false
```

---

## 4. Date Utility Functions

### addDays

**Purpose**: Adds days to a date and returns ISO date string

**Signature**:
```typescript
function addDays(date: Date | string, days: number): string;
```

**Parameters**:
- `date`: Starting date (Date object or ISO string)
- `days`: Number of days to add (can be negative)

**Returns**: ISO date string (YYYY-MM-DD, no time component)

**Examples**:
```typescript
addDays('2026-03-04', 1);   // '2026-03-05'
addDays('2026-03-04', 7);   // '2026-03-11'
addDays('2026-03-04', -1);  // '2026-03-03'
addDays(new Date('2026-03-04'), 1);  // '2026-03-05'
```

**Error Handling**:
- If `date` invalid, throw `TypeError`
- If `days` not a number, throw `TypeError`

---

### isToday

**Purpose**: Checks if a date is today

**Signature**:
```typescript
function isToday(date: Date | string): boolean;
```

**Parameters**:
- `date`: Date to check (Date object or ISO string)

**Returns**: `true` if date is today, `false` otherwise

**Examples**:
```typescript
isToday('2026-03-04');  // true (if today is 2026-03-04)
isToday('2026-03-05');  // false
```

---

## Testing Requirements

All functions must have 100% test coverage:

### Unit Test Template

```typescript
describe('getNoteAtFret', () => {
  describe('happy path', () => {
    it('returns correct note for open strings', () => {
      expect(getNoteAtFret(0, 0)).toBe('E');
      expect(getNoteAtFret(1, 0)).toBe('A');
      expect(getNoteAtFret(2, 0)).toBe('D');
      expect(getNoteAtFret(3, 0)).toBe('G');
      expect(getNoteAtFret(4, 0)).toBe('B');
      expect(getNoteAtFret(5, 0)).toBe('E');
    });

    it('returns correct note for various frets', () => {
      expect(getNoteAtFret(0, 1)).toBe('F');
      expect(getNoteAtFret(0, 5)).toBe('A');
      expect(getNoteAtFret(0, 12)).toBe('E');
    });
  });

  describe('edge cases', () => {
    it('handles enharmonic equivalents', () => {
      expect(getNoteAtFret(0, 6)).toBe('F#/Gb');
    });
  });

  describe('error cases', () => {
    it('throws RangeError for invalid string', () => {
      expect(() => getNoteAtFret(6, 0)).toThrow(RangeError);
      expect(() => getNoteAtFret(-1, 0)).toThrow(RangeError);
    });

    it('throws RangeError for invalid fret', () => {
      expect(() => getNoteAtFret(0, 25)).toThrow(RangeError);
      expect(() => getNoteAtFret(0, -1)).toThrow(RangeError);
    });
  });
});
```

---

## Summary

**Total Functions**: 12

**Categories**:
- Music theory: getNoteAtFret, getInterval, getChordTones, isChordCorrect, getAllPositionsOfNote (5)
- Spaced repetition: sm2Update, getDueCards (2)
- Validation: validateFretPosition, validateNoteName, validateSRSCard (3)
- Date utilities: addDays, isToday (2)

**Testing Requirements**:
- 100% coverage for all functions
- Test happy path, edge cases, error cases
- Pure functions → easy to test
- Use AAA pattern (Arrange, Act, Assert)

**Next Steps**:
- Implement functions in `src/lib/music.ts` and `src/lib/srs.ts`
- Write comprehensive unit tests in `src/lib/music.test.ts` and `src/lib/srs.test.ts`
- Run `yarn test:coverage` to verify 100% coverage
