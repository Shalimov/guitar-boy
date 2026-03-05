# Research: Fretboard Learning App

**Date**: 2026-03-04
**Branch**: 001-fretboard-learning-app

## Overview

This document consolidates research findings and technical decisions for the Fretboard Learning App. All "NEEDS CLARIFICATION" items from the technical context have been resolved based on the comprehensive design documents (TECH_DESIGN.md and fretboard-app-design.md).

---

## Technology Stack Decisions

### Build Tool: Rsbuild (Rspack-based)

**Decision**: Use Rsbuild with @rsbuild/plugin-react

**Rationale**:
- Rsbuild uses Rspack (Rust-based Webpack-compatible bundler) for fast builds
- @rsbuild/plugin-react handles JSX compilation via SWC and enables React Fast Refresh
- Faster than Vite for large projects with many modules
- Webpack-compatible ecosystem

**Alternatives Considered**:
- Vite: Popular and fast, but Rsbuild offers better performance for larger codebases
- Webpack: Slower builds, more configuration required
- Parcel: Less ecosystem support, fewer plugins

### CSS Framework: Tailwind CSS v4

**Decision**: Use Tailwind CSS v4 with @tailwindcss/postcss

**Rationale**:
- No tailwind.config.js required - all customization in CSS via @theme directives
- Built-in PostCSS support in Rsbuild
- Utility-first approach aligns with component-based architecture
- Excellent for rapid UI development

**Alternatives Considered**:
- CSS Modules: More boilerplate, less utility-focused
- Styled Components: Runtime overhead, not needed for this project
- Tailwind v3: Requires config file, v4 is simpler

### Testing: Jest + @swc/jest

**Decision**: Use Jest with SWC-based transforms and React Testing Library

**Rationale**:
- SWC transforms are ~5x faster than ts-jest
- Jest has excellent React Testing Library integration
- Type-checking handled separately by tsc --noEmit for fast feedback loop
- Constitution requires 100% coverage for src/lib/, Jest makes this achievable

**Alternatives Considered**:
- Vitest: Faster but less mature, smaller ecosystem
- ts-jest: Slower transforms, defeats purpose of fast TDD cycle
- Mocha: Less integrated, more configuration needed

### Linting: Biome

**Decision**: Use Biome for both linting and formatting

**Rationale**:
- Single tool replaces ESLint + Prettier
- Written in Rust, extremely fast (milliseconds)
- Enforces consistent code style (tabs, double quotes, semicolons)
- Aligns with Constitution Principle I (Code Readability)

**Alternatives Considered**:
- ESLint + Prettier: Two tools, slower, more configuration
- Rome: Biome is the successor to Rome
- oxlint: Less mature, smaller plugin ecosystem

### State Management: React Context + useReducer

**Decision**: Use built-in React features, no external state library

**Rationale**:
- No external dependencies needed for v1 scope
- App-wide state (progress, settings) fits well in Context
- Per-mode state (active quiz, whiteboard dots) lives in component state
- Aligns with Constitution Principle V (Simplicity First)

**Alternatives Considered**:
- Redux: Overkill for this scope, adds complexity
- Zustand: Simpler than Redux, but still external dependency
- Recoil: Experimental API, not needed

### Persistence: localStorage

**Decision**: Use browser localStorage with custom useLocalStorage hook

**Rationale**:
- No backend required (v1 non-goal)
- Sufficient for storing progress, diagrams, settings
- Custom hook handles serialization, deserialization, and schema migration
- Aligns with offline-capable constraint

**Alternatives Considered**:
- IndexedDB: More complex, not needed for data volume
- SQLite (sql.js): Overkill, adds bundle size
- Backend API: Out of scope for v1

---

## Architecture Patterns

### Fretboard Component Design

**Pattern**: Shared, reusable component with multiple interaction modes

**Decision**: Single `<Fretboard>` component with `mode` prop: 'view' | 'click-select' | 'draw'

**Rationale**:
- DRY principle - all modes share same rendering logic
- Easy to test - one component instead of three
- Flexible - new modes can be added without duplication
- Clear contract - FretboardProps interface defines all capabilities

**Best Practices Applied**:
- Controlled vs uncontrolled state: Use controlled for quiz feedback, uncontrolled for whiteboard
- Accessibility: ARIA labels for screen readers, keyboard navigation
- Performance: Memoize expensive calculations (note positions, interval shapes)

### Music Theory Helper Functions

**Pattern**: Pure functions in src/lib/ with 100% test coverage

**Decision**: Isolate all music theory logic into pure, testable functions

**Key Functions**:
- `getNoteAtFret(string: number, fret: number): NoteName`
- `getInterval(posA: FretPosition, posB: FretPosition): IntervalName`
- `getChordTones(root: NoteName, quality: TriadQuality): NoteName[]`
- `isChordCorrect(placed: FretPosition[], required: NoteName[]): boolean`
- `sm2Update(card: SRSCard, rating: 0|1|2|3): SRSCard`

**Rationale**:
- Pure functions are easy to test (Constitution Principle II)
- No side effects, predictable behavior
- Can be reused across components
- Clear separation of concerns

### Spaced Repetition System (SRS)

**Algorithm**: SM-2 (SuperMemo 2)

**Decision**: Implement SM-2 algorithm for spaced repetition scheduling

**Rationale**:
- Well-documented, proven algorithm
- Simple to implement and test
- Suitable for this scope (notes, intervals, chords)
- Adjustable via easeFactor and intervalDays

**SM-2 Update Rules**:
- Rating 0 (Wrong): Reset to day 1, EF − 0.2
- Rating 1 (Hard): EF − 0.14
- Rating 2 (Good): EF unchanged
- Rating 3 (Easy): EF + 0.1

**Testing Strategy**:
- Unit test all SM-2 update logic (100% coverage required)
- Test edge cases: new cards, lapsed cards, maximum intervals
- Test date calculations for nextReviewAt

---

## Data Model Design

### Core Types

**FretPosition**: `{ string: number, fret: number }`
- Simple, serializable, easy to compare
- 0-indexed strings (0 = low E, 5 = high e)
- 0-indexed frets (0 = open, 24 = highest)

**FretboardState**: `{ dots: MarkedDot[], lines: ConnectionLine[], ... }`
- Flexible structure for all modes
- Supports multiple overlays (correct, missed, incorrect positions)
- Serializable for localStorage

**SRSCard**: `{ id, category, easeFactor, intervalDays, nextReviewAt, ... }`
- Standard SM-2 fields
- Category-specific subCategory for granular tracking
- lastAccuracy for dashboard stats

**ProgressStore**: `{ version, cards, sessionHistory, settings }`
- Versioned schema for future migrations
- All app state in one place
- Easy to serialize/deserialize

### Schema Migration Strategy

**Pattern**: Version-based migration in useLocalStorage hook

**Decision**: Include `version` field in all localStorage schemas

**Rationale**:
- Future-proof for schema changes
- Automatic migration on app load
- Clear error messages if migration fails

**Implementation**:
```typescript
function migrateProgressStore(data: unknown, fromVersion: number): ProgressStore {
  // Handle migrations from version N to N+1
  // Return migrated data
}
```

---

## Component Architecture

### Page Structure

**Pattern**: Feature-based pages under src/pages/

**Decision**: Organize by feature (dashboard, whiteboard, learning, quiz) not by layer

**Rationale**:
- Easier to navigate - all quiz code in one place
- Supports independent development and testing
- Aligns with user stories (each page = one or more user journeys)
- Clear separation of concerns

### Shared Components

**Pattern**: Reusable UI primitives in src/components/ui/

**Decision**: Extract common UI elements (buttons, cards, inputs) into shared components

**Rationale**:
- DRY principle
- Consistent styling across app
- Easier to update design system
- Test once, use everywhere

---

## Performance Considerations

### Rendering Performance

**Goal**: <200ms dashboard load, 50+ diagrams without lag

**Strategies**:
- Memoize expensive calculations (note positions, interval shapes)
- Virtual scrolling for long pattern lists (if needed)
- Lazy load patterns on demand
- Debounce rapid interactions (whiteboard drawing)

### Bundle Size

**Target**: Keep initial bundle under 200KB gzipped

**Strategies**:
- Code splitting by route (React.lazy)
- Tree-shaking unused Tailwind classes
- No heavy dependencies (no backend, no audio)

---

## Accessibility

**Requirements**:
- Keyboard navigation for all interactive elements
- ARIA labels for screen readers
- Color contrast ratios meet WCAG 2.1 AA
- Focus management for quiz flows

**Implementation**:
- All buttons have accessible names
- Fretboard grid uses ARIA grid pattern
- Quiz feedback uses aria-live regions
- Focus trap in modals

---

## Testing Best Practices

### Unit Tests (src/lib/)

**Pattern**: AAA (Arrange, Act, Assert)

**Example**:
```typescript
describe('getNoteAtFret', () => {
  it('returns correct note for open low E string', () => {
    // Arrange
    const string = 0; // low E
    const fret = 0;   // open
    
    // Act
    const note = getNoteAtFret(string, fret);
    
    // Assert
    expect(note).toBe('E');
  });
});
```

### Component Tests

**Pattern**: User-centric testing with React Testing Library

**Example**:
```typescript
describe('Fretboard', () => {
  it('displays correct note when fret is clicked', async () => {
    // Arrange
    const onFretClick = jest.fn();
    render(<Fretboard mode="click-select" onFretClick={onFretClick} />);
    
    // Act
    const fret = screen.getByRole('button', { name: /string 0 fret 5/i });
    await userEvent.click(fret);
    
    // Assert
    expect(onFretClick).toHaveBeenCalledWith({ string: 0, fret: 5 });
  });
});
```

---

## Open Questions Resolved

### Q1: Timer mode for advanced difficulty?
**Resolution**: Out of scope for v1. Can be added in v2 if users request it.

### Q2: Enharmonic display preference?
**Resolution**: Use user setting (AccidentalPreference: 'sharp' | 'flat'). Default to 'sharp'.

### Q3: Chord voicing validation strictness?
**Resolution**: Accept any valid voicing. Warn if note is above fret 20 but don't reject.

### Q4: Pattern library expansion?
**Resolution**: v1 includes CAGED, pentatonic, major scale positions, interval shapes. Minor CAGED and modes deferred to v2.

### Q5: Export diagrams as PNG/SVG?
**Resolution**: Out of scope for v1. Can be added in v2 using html-to-image or similar library.

---

## Conclusion

All technical decisions have been made based on:
1. Constitution principles (readability, test quality, simplicity)
2. Project constraints (offline-capable, no backend, browser-only)
3. Best practices for React applications
4. Performance requirements (<200ms load, 50+ diagrams)

No "NEEDS CLARIFICATION" items remain. Ready to proceed to Phase 1: Design & Contracts.
