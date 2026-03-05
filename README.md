# Guitar Boy - Fretboard Learning App

A single-page React web application that helps guitar players learn note positions on the fretboard, understand intervals, and build chords using interactive visual tools.

## 🎸 Features

### Dashboard
- Learning metrics and progress tracking
- Navigation to all app modes
- Due card count for SRS review

### Whiteboard Mode
- Create and save custom fretboard diagrams
- Add colored dots with labels and shapes
- Draw connection lines between positions
- Undo/Redo functionality (up to 50 states)
- Pattern library with built-in diagrams
- Export diagrams to localStorage

### Learning Mode
- **13 guided lessons** covering:
  - Open strings
  - Natural notes on low E string
  - Chromatic scale with accidentals
  - Octave shapes
  - Notes on every string
  - Interval introduction
  - Interval shapes (unison, octave, P5, M3, m3)
  - Major, minor, diminished, augmented triads
  - CAGED system overview
- **Interactive steps** with explain and verify phases
- **Explorer mode** for free exploration

### Quiz Mode
- **3 quiz types**:
  - **Find the Note**: Click fretboard positions to identify notes
  - **Identify Interval**: Multiple choice interval recognition
  - **Build Chord**: Place chord tones on fretboard
- **3 difficulty levels**: Beginner (frets 0-5), Intermediate (0-12), Advanced (0-24)
- **Question counts**: 5, 10, 20, or 50 questions
- **Visual feedback**: Color-coded overlays (green/yellow/red)
- **Session summary**: Score, accuracy, duration

### Review Mode
- SRS-based review of due cards
- Rating scale (0-3) for card difficulty
- Automatic card scheduling using SM-2 algorithm
- Progress tracking

## 🛠️ Tech Stack

- **Frontend**: React 19.2.4, TypeScript 5.9.3
- **Routing**: React Router 7.13.1
- **Styling**: Tailwind CSS 4.2.1
- **Canvas Rendering**: Konva (react-konva)
- **Build Tool**: Rsbuild
- **Testing**: Jest 30.2.0, React Testing Library 16.3.2
- **Linting**: Biome
- **Storage**: localStorage (browser storage, no backend)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd guitar-boy

# Install dependencies
yarn install

# Start development server
yarn dev
```

### Available Scripts

```bash
# Development
yarn dev              # Start development server

# Quality Checks
yarn format           # Format all files with Biome
yarn lint             # Lint and apply safe fixes
yarn typecheck        # Run TypeScript type checking
yarn test             # Run all tests

# Production
yarn build            # Build for production
```

## 📁 Project Structure

```
guitar-boy/
├── src/
│   ├── components/
│   │   ├── fretboard/          # Canvas-based fretboard component
│   │   ├── layout/             # Layout shell (navbar, routing)
│   │   └── ui/                 # Shared UI primitives
│   ├── pages/
│   │   ├── dashboard/          # Dashboard landing page
│   │   ├── whiteboard/         # Whiteboard diagram editor
│   │   ├── learning/           # Guided lessons & explorer
│   │   └── quiz/               # Quiz modes & review
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Pure utility functions
│   │   ├── music.ts            # Music theory helpers
│   │   ├── srs.ts              # SM-2 algorithm
│   │   ├── date.ts             # Date utilities
│   │   └── validation.ts       # Validation helpers
│   ├── types/                  # TypeScript type definitions
│   └── data/                   # Lesson data & curriculum
├── public/                     # Static assets
├── specs/                      # Feature specifications
└── dist/                       # Production build output
```

## 🎯 Core Components

### Fretboard Component

The heart of the application - a canvas-based interactive fretboard with multiple modes:

- **View Mode**: Static display with highlights
- **Click-Select Mode**: Interactive position selection
- **Draw Mode**: Add/remove dots and draw lines
- **Test Mode**: Quiz feedback overlays
- **Patterns Mode**: Display predefined patterns

**Accessibility**:
- Full keyboard navigation (arrow keys)
- ARIA labels for screen readers
- Focus management

### Music Theory Library

Pure TypeScript functions for music theory calculations:

```typescript
// Get note at any fret position
getNoteAtFret(position: FretPosition): NoteName

// Get interval between two positions
getInterval(from: FretPosition, to: FretPosition): IntervalName

// Get chord tones for a root and quality
getChordTones(root: NoteName, quality: TriadQuality): NoteName[]

// Find all positions of a note within a fret range
getAllPositionsOfNote(note: NoteName, fretRange: [number, number]): FretPosition[]
```

### Spaced Repetition System

SM-2 algorithm implementation for optimal learning:

```typescript
// Update card based on user rating (0-3)
sm2Update(card: SRSCard, rating: 0 | 1 | 2 | 3): SRSCard

// Get cards due for review
getDueCards(cards: Record<string, SRSCard>): SRSCard[]
```

## 📊 Data Model

### Key Entities

- **FretPosition**: Guitar coordinate (string, fret)
- **FretboardState**: Diagram state (dots, lines, highlights)
- **Diagram**: Saved whiteboard artifact
- **SRSCard**: Spaced repetition card
- **SessionRecord**: Quiz/review session history
- **Lesson**: Guided lesson with steps

### Storage

- **Progress Store**: SRS cards, session history, user settings
- **Diagram Store**: User diagrams and built-in patterns
- Both stored in localStorage with schema versioning

## 🧪 Testing

- **Unit Tests**: 151 tests passing
- **Coverage**: 100% for `src/lib/` utilities
- **Component Tests**: React Testing Library with user-centric queries
- **AAA Pattern**: Arrange-Act-Assert structure

```bash
# Run all tests
yarn test

# Run specific test file
yarn test src/lib/music.test.ts

# Run with coverage
yarn test --coverage
```

## 🎨 Customization

### Adding New Lessons

1. Create lesson file in `src/data/lessons/lesson-XX.ts`
2. Define lesson structure with explain and verify steps
3. Add to curriculum in `src/data/lessons/index.ts`

### Adding New Quiz Types

1. Extend `QuizRunner.tsx` with new question generation logic
2. Add quiz type to `QuizSelector.tsx`
3. Implement validation and feedback

## 📈 Performance

- **Dashboard Load**: <200ms target
- **Canvas Rendering**: Optimized with Konva
- **localStorage**: Debounced writes
- **Bundle Size**: 634.7 KB (189.8 KB gzipped)

## 🔒 Offline Capability

- No backend dependencies
- All data stored locally
- Works offline after initial load

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please ensure:
- All tests pass (`yarn test`)
- Lint passes (`yarn lint`)
- Type check passes (`yarn typecheck`)
- Build succeeds (`yarn build`)

## 📚 Documentation

- [Technical Design](./TECH_DESIGN.md)
- [Feature Specifications](./specs/001-fretboard-learning-app/)
- [Task List](./specs/001-fretboard-learning-app/tasks.md)

---

Built with ❤️ for guitar learners everywhere
