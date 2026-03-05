# Quickstart: Fretboard Learning App

**Date**: 2026-03-04
**Branch**: 001-fretboard-learning-app

## Prerequisites

- Node.js v25.x
- Yarn 4.13.0+
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Initial Setup

```bash
# Clone the repository
git clone <repo-url>
cd guitar-boy

# Install dependencies
yarn install

# Verify setup
yarn typecheck
yarn lint
yarn test
```

## Development Workflow

### Start Development Server

```bash
yarn dev
```

Opens at `http://localhost:3000` with hot module replacement.

### Run Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

### Type Checking

```bash
yarn typecheck
```

### Linting & Formatting

```bash
# Check for issues
yarn lint

# Auto-fix issues
yarn lint:fix

# Format code
yarn format
```

### Build for Production

```bash
yarn build
yarn preview
```

## Project Structure

```
src/
├── index.tsx              # Entry point
├── App.tsx                # Root component with routing
├── components/
│   ├── fretboard/         # Core Fretboard component
│   ├── layout/            # Layout shell
│   └── ui/                # Shared UI primitives
├── pages/
│   ├── dashboard/         # Dashboard page
│   ├── whiteboard/        # Whiteboard mode
│   ├── learning/          # Learning mode
│   └── quiz/              # Quiz modes
├── hooks/                 # Custom React hooks
├── lib/                   # Pure utility functions
│   ├── music.ts           # Music theory helpers
│   ├── srs.ts             # Spaced repetition
│   └── *.test.ts          # Unit tests
└── types/                 # TypeScript type definitions
    ├── music.ts
    └── fretboard.ts
```

## Key Technologies

| Technology | Purpose |
|------------|---------|
| React 19.2.4 | UI framework |
| React Router 7.13.1 | Client-side routing |
| Tailwind CSS 4.2.1 | Styling |
| Jest 30.2.0 | Testing |
| React Testing Library | Component testing |
| Biome | Linting & formatting |
| Rsbuild | Build tool |

## Architecture Overview

### Core Component: Fretboard

The `<Fretboard>` component is used across all modes:

```tsx
import { Fretboard } from '@/components/fretboard/Fretboard';

// View mode (static)
<Fretboard 
  mode="view" 
  state={{ dots: [...], lines: [...] }}
/>

// Click-select mode (quiz)
<Fretboard 
  mode="click-select"
  onFretClick={(pos) => handleFretClick(pos)}
  selectedPositions={selected}
  correctPositions={correct}
/>

// Draw mode (whiteboard)
<Fretboard 
  mode="draw"
  onLineDrawn={(from, to) => handleLineDrawn(from, to)}
/>
```

### State Management

- **App-wide state**: React Context + useReducer
- **Persistence**: localStorage via `useLocalStorage` hook
- **Per-mode state**: Component-level useState

### Data Flow

```
User Action
    ↓
Component (Event Handler)
    ↓
Hook/Context (State Update)
    ↓
localStorage (Persistence)
    ↓
Component Re-render
```

## Development Guidelines

### Code Style

- Tabs for indentation
- Double quotes for strings
- Semicolons required
- Biome enforces style automatically

### Naming Conventions

```typescript
// Components: PascalCase
export function Fretboard(props: FretboardProps) { ... }

// Functions: camelCase
export function getNoteAtFret(string: number, fret: number): NoteName { ... }

// Constants: SCREAMING_SNAKE_CASE
export const FRET_COUNT = 24;

// Types: PascalCase
export type NoteName = 'C' | 'C#/Db' | ...;
export interface FretboardProps { ... }
```

### Testing Strategy

**Unit Tests** (src/lib/):
- Test pure functions in isolation
- 100% coverage required
- Use AAA pattern: Arrange, Act, Assert

```typescript
describe('getNoteAtFret', () => {
  it('returns correct note for open low E string', () => {
    // Arrange
    const string = 0;
    const fret = 0;
    
    // Act
    const note = getNoteAtFret(string, fret);
    
    // Assert
    expect(note).toBe('E');
  });
});
```

**Component Tests** (src/components/):
- Test user behavior, not implementation
- Use React Testing Library
- Focus on accessibility

```typescript
describe('Fretboard', () => {
  it('displays correct note when fret is clicked', async () => {
    const onFretClick = jest.fn();
    render(<Fretboard mode="click-select" onFretClick={onFretClick} />);
    
    const fret = screen.getByRole('button', { name: /string 0 fret 5/i });
    await userEvent.click(fret);
    
    expect(onFretClick).toHaveBeenCalledWith({ string: 0, fret: 5 });
  });
});
```

### Git Workflow

```bash
# Create feature branch
git checkout -b 001-fretboard-learning-app

# Make changes, then commit
git add .
git commit -m "feat: add Fretboard component with view mode"

# Run checks before pushing
yarn lint && yarn typecheck && yarn test

# Push
git push origin 001-fretboard-learning-app
```

### Commit Message Format

```
type(scope): brief description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

Examples:
```
feat(fretboard): add click-select mode
fix(music): correct enharmonic spelling for F#/Gb
test(srs): add edge case tests for SM-2 algorithm
docs(readme): update installation instructions
```

## Common Tasks

### Add New Component

1. Create file: `src/components/ui/Button.tsx`
2. Define props interface
3. Implement component
4. Create test: `src/components/ui/Button.test.tsx`
5. Export from barrel file: `src/components/ui/index.ts`

### Add New Music Theory Function

1. Add function to `src/lib/music.ts`
2. Add type to `src/types/music.ts` if needed
3. Add tests to `src/lib/music.test.ts`
4. Run `yarn test:coverage` to verify 100% coverage

### Add New Page

1. Create directory: `src/pages/newfeature/`
2. Create component: `NewFeaturePage.tsx`
3. Add route to `src/App.tsx`
4. Add navigation link to Layout component

### Add New Quiz Mode

1. Create quiz type in `src/types/quiz.ts`
2. Create quiz component in `src/pages/quiz/`
3. Add quiz logic using music theory helpers
4. Update SRSCard after quiz completion
5. Add tests for quiz component

## Debugging

### React DevTools

Install React DevTools browser extension to inspect component tree and props.

### Console Logging

```typescript
// Use descriptive prefixes
console.log('[Fretboard] Rendering with state:', state);
console.error('[SRS] Invalid card:', card);
```

### Breakpoints

Use `debugger` statement or browser DevTools:

```typescript
function getNoteAtFret(string: number, fret: number): NoteName {
  debugger; // Browser will pause here
  // ... implementation
}
```

### Jest Debugging

```typescript
// Use screen.debug() to see rendered HTML
render(<Fretboard mode="view" />);
screen.debug();

// Use console.log in tests
console.log('Selected positions:', selectedPositions);
```

## Performance Tips

### Memoization

```typescript
import { useMemo } from 'react';

const notePositions = useMemo(
  () => getAllPositionsOfNote(note, fretRange),
  [note, fretRange]
);
```

### Code Splitting

```typescript
import { lazy, Suspense } from 'react';

const QuizPage = lazy(() => import('@/pages/quiz/QuizPage'));

<Suspense fallback={<div>Loading...</div>}>
  <QuizPage />
</Suspense>
```

### Bundle Analysis

```bash
yarn build
# Check dist/ directory for bundle sizes
```

## Troubleshooting

### Tests Failing

1. Run `yarn lint` to check for syntax errors
2. Run `yarn typecheck` to check for type errors
3. Check test output for specific failures
4. Use `screen.debug()` to see rendered output

### Build Errors

1. Clear build cache: `rm -rf dist/ node_modules/.cache`
2. Reinstall dependencies: `yarn install`
3. Check TypeScript errors: `yarn typecheck`

### localStorage Issues

1. Clear localStorage: DevTools → Application → Local Storage → Clear
2. Check schema version compatibility
3. Add console logs to `useLocalStorage` hook

### Hot Reload Not Working

1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Restart dev server: `yarn dev`
3. Check for import errors in console

## Resources

### Internal Documentation
- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)
- [Component Contracts](./contracts/components.md)
- [Library Contracts](./contracts/libraries.md)
- [Technical Design](../../TECH_DESIGN.md)
- [App Design](../../fretboard-app-design.md)
- [Constitution](../../.specify/memory/constitution.md)

### External Resources
- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Jest Documentation](https://jestjs.io)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)

## Next Steps

1. Review [Implementation Plan](./plan.md) for phased approach
2. Start with Phase 1: Foundation (music theory helpers, Fretboard component)
3. Write tests before implementation (TDD)
4. Run quality checks frequently: `yarn lint && yarn typecheck && yarn test`
5. Commit incrementally with descriptive messages

## Getting Help

- Check existing code for patterns
- Review constitution for guidelines
- Search documentation
- Ask team members (if available)
- Document blockers and seek suggestions (per Constitution Principle V)
