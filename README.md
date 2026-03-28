# Guitar Boy - Fretboard Learning App

A React web application that helps guitar players learn note positions on the fretboard, understand intervals, build chords, and develop ear training skills through interactive visual tools.

## How to Use

### Dashboard (`/`)

Your home hub. It shows your practice streak, accuracy across quiz categories, recent sessions, and weak spots. A context-aware call-to-action guides you to the right next step:

- **New user?** Start with the Learning Roadmap (4 phases: Natural Notes, Scales, Intervals, Ear Training)
- **Returning user?** Jump into Daily Practice if it's due, or go to Quiz Studio for focused work

### Learning (`/learn`)

Three tabs for structured and freeform study:

**Guided Lessons** — 7 curriculum lessons covering open strings, natural notes, octaves, intervals, chord shapes, progressions, and arpeggios. Each lesson combines:
- Explain steps with annotated fretboard diagrams
- Verify steps where you click target positions
- Teach-back steps to confirm understanding

**Note Memory Trainer** — Short drills connecting note names, fretboard positions, and pitch. Good for building faster recall.

**Fretboard Explorer** — Interactive theory lab. Map any scale, chord, arpeggio, or interval shape across the full neck. Use it to experiment and visualize patterns.

### Quiz Studio (`/quiz`)

All practice modes live here. Pick a quick-start preset or build a custom quiz.

#### Quiz Types

| Quiz | What You Do |
|------|-------------|
| **Find the Note** | Tap all fretboard positions of a given note |
| **Guess the Note** | See a highlighted position, name the note |
| **Guess by Sound** | Hear a note, identify it without seeing the position |
| **Identify Interval** | Name the interval between two positions |
| **Build Chord** | Place the correct chord tones on the fretboard |

**Quick-start presets:** Quick Notes (10q, beginner), Speed Notes (20q, timed), Intervals (10q, deep practice), Chords (10q, beginner).

**Custom setup wizard** lets you pick quiz type, difficulty (Beginner frets 0-5 / Intermediate 0-12 / Advanced full neck), question count (5-50), optional timer (10-30s), and deep practice mode (follow-up questions after correct answers).

**Speed Drill** — 60-second blitz. Answer as many as you can. Tracks personal bests per category.

#### Ear Training

Accessible from Quiz Studio. Five modes ordered by progression:

**Easy Wins** — Absolute beginner warm-up. Three stages that auto-advance after 5 correct in a row:
1. High or Low? (which note is higher)
2. Same or Different? (do two notes match)
3. Major or Minor? (chord quality)

**Anchor Note (Scale Degree Recognition)** — The core ear training mode. A I-IV-V-I cadence establishes the key, then you identify which scale degree was played. Features:
- Progressive unlock: starts with root (1), unlocks 5th, 3rd, 4th, etc. as you hit 90% accuracy
- Color-coded degree buttons with solfege labels
- Pitch Ladder visualization showing where degrees sit in the scale
- 4-level progressive hints: direction, region, neighbor, then comparison play
- Always-available Replay Root button (not penalized)
- First-time onboarding with experience assessment that sets your starting level
- Progress map with mastery badges (Bronze 70%+, Silver 85%+, Gold 95%+)
- Daily streak tracking
- Confusion pair tracking (records which degrees you mix up)

**Hear & Identify** — Listen to a note played on the fretboard, pick its name. Four difficulty levels from single string to full neck. Includes key selector and tonal context (cadence plays at start).

**Weak Spots (Confusion Drill)** — Targeted practice on your most-confused scale degree pairs. The app identifies which degrees you mix up most and drills them alternately until you get 5 in a row.

**Tone Meditation** — Passive listening. Pick a note and hear it played across every fretboard position. No questions — just exposure to build familiarity.

### Daily Practice (`/practice`)

A structured 5-minute session that mixes segments based on your current state:

1. **Warm-up** — Quick review from your last session's weak areas (skippable)
2. **SRS Review** — Spaced repetition cards that are due (SM-2 algorithm)
3. **Quiz** — Mini quiz targeting your weakest category
4. **Ear Training** — Auto-selects the right sub-mode: easy wins for new users, confusion drill if you have weak pairs, anchor drill otherwise

Ends with a cool-down summary showing score, duration, and what to focus on next.

### Whiteboard (`/whiteboard`)

Fretboard diagram editor for creating custom reference sheets:

- **My Diagrams** — Create, edit, and manage your own annotated fretboard diagrams. Add colored dots with labels, draw connection lines, customize the display.
- **Pattern Library** — Browse pre-built scale, chord, and arpeggio patterns. Copy any pattern to your collection and edit it.
- Undo/Redo support (50 states), saved to localStorage.

### Spaced Repetition

Runs automatically during Daily Practice. Uses the SM-2 algorithm:
- Cards represent notes, intervals, and chords you've practiced
- Correct answers increase the review interval; mistakes bring cards back sooner
- Each scale degree in ear training is tracked independently for SRS

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
│   ├── ear-training/  # Degree progress map, badges
│   ├── fretboard/     # Canvas-based fretboard
│   ├── layout/        # App layout and routing
│   └── ui/            # Shared UI (PitchLadder, AudioEqualizer, etc.)
├── pages/
│   ├── dashboard/     # Landing page, streak display
│   ├── whiteboard/    # Diagram editor
│   ├── learning/      # Lessons, trainer, explorer
│   ├── ear-training/  # Anchor, EasyWin, ConfusionDrill, Onboarding, etc.
│   ├── quiz/          # Quiz runner, speed drill, selector
│   └── daily-session/ # Practice routine
├── hooks/             # Custom React hooks
├── lib/               # Pure utilities (music theory, SRS, audio, hints, confusion matrix)
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
