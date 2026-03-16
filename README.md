# Guitar Boy - Fretboard Learning App

A React web application that helps guitar players learn note positions on the fretboard, understand intervals, build chords, and develop ear training skills through interactive visual tools.

## Features

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
Three integrated learning tools:

1. **Guided Lessons** - Structured lessons with explain and verify phases
2. **Note Memory Trainer** - Visual and ear-first drills to connect note names with fretboard locations
3. **Fretboard Explorer** - Free exploration for mapping scales, chords, arpeggios, and interval shapes

### Quiz Mode
Multiple quiz types:

- **Find the Note**: Click all fretboard positions of a given note
- **Guess the Note**: Identify the note shown at a position
- **Guess by Sound**: Hear a note, then identify it without visual marker
- **Identify Interval**: Multiple choice interval recognition
- **Build Chord**: Place chord tones on fretboard
- **Speed Drill**: Timed note identification
- **Pattern Drill**: Scale and arpeggio pattern practice

Quiz options:
- 3 difficulty levels: Beginner (frets 0-5), Intermediate (0-12), Advanced (0-24)
- Question counts: 5, 10, 20, or 50
- Optional timer
- Visual feedback (green/yellow/red overlays)
- Session summary with score, accuracy, duration

### Ear Training
Integrated ear training modes accessible via Quiz:

- **Hear & Identify**: Listen to a note and identify its name
- **Tone Meditation**: Passive listening to build note familiarity
- **Anchor Note**: Master one note at a time

### Daily Practice Session
Structured practice routine (`/practice`) combining:

- Warmup segment
- Quiz segment
- Review segment (SRS)
- Ear training segment
- Cool down summary

### Review (Spaced Repetition)
- SRS-based card review using SM-2 algorithm
- Rating scale (0-3) for difficulty
- Automatic scheduling
- Progress tracking

## Tech Stack

- **Frontend**: React 19.2.4, TypeScript 5.9.3
- **Routing**: React Router 7.13.1
- **Styling**: Tailwind CSS 4.2.1
- **Canvas**: Konva (react-konva)
- **Build**: Rsbuild
- **Testing**: Jest, React Testing Library
- **Linting**: Biome
- **Storage**: localStorage (no backend)

## Getting Started

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

### Available Scripts

```bash
yarn dev        # Start development server
yarn build      # Build for production
yarn test       # Run tests
yarn lint       # Lint and fix
yarn typecheck  # Type check
yarn format     # Format code
```

## Project Structure

```
src/
├── components/
│   ├── fretboard/     # Canvas-based fretboard
│   ├── layout/       # App layout and routing
│   └── ui/            # Shared UI components
├── pages/
│   ├── dashboard/     # Landing page
│   ├── whiteboard/   # Diagram editor
│   ├── learning/     # Lessons, trainer, explorer
│   ├── quiz/          # Quiz and ear training
│   └── daily-session/ # Practice routine
├── hooks/             # Custom React hooks
├── lib/               # Pure utilities (music theory, SRS)
├── types/             # TypeScript definitions
└── data/              # Lesson content
```

## Testing

```bash
yarn test              # Run all tests
yarn test --coverage   # Run with coverage
```

## Offline Capability

- No backend dependencies
- All data stored locally in localStorage
- Works offline after initial load

## License

MIT
