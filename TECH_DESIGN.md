# Guitar Boy — Technical Design

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Language | TypeScript | ^5.9.3 |
| UI Framework | React | ^19.2.4 |
| Routing | React Router | ^7.13.1 |
| Build Tool | Rsbuild (Rspack-based) | ^1.7.3 |
| CSS Framework | Tailwind CSS v4 | ^4.2.1 |
| Linter & Formatter | Biome | ^2.4.5 |
| Test Runner | Jest | ^30.2.0 |
| Test Transform | @swc/jest (SWC-based, ~5x faster than ts-jest) | ^0.2.39 |
| Component Testing | React Testing Library | ^16.3.2 |
| Package Manager | Yarn 4 (Berry) | 4.13.0 |
| Node.js | Node.js | v25.x |
| State Management | Custom hooks + localStorage (no global Context yet) | — |
| Persistence | localStorage | — |
| Fretboard Rendering | DOM grid/buttons (canvas migration planned) | — |

## Current Implementation Status (2026-03-05)

- Implemented: Dashboard route, Whiteboard route shell, diagram CRUD hooks, core utility libraries (`music`, `srs`, `date`, `validation`).
- Partially implemented: Fretboard component supports basic click/select/draw interactions but still uses DOM grid rendering.
- Missing: Canvas fretboard renderer, full connection-line rendering flow, guided learning workflows, and quiz workflows.
- Placeholder pages: `src/pages/learning/LearningPage.tsx` and `src/pages/quiz/QuizPage.tsx`.
- Active delivery plan for these gaps: `specs/cdx_tasks/`.

## Packages

### Production Dependencies

| Package | Purpose |
|---|---|
| `react` | UI framework |
| `react-dom` | React DOM renderer |
| `react-router` | Client-side routing |

### Development Dependencies

| Package | Purpose |
|---|---|
| `@rsbuild/core` | Build tool (dev server, bundling) |
| `@rsbuild/plugin-react` | React JSX + Fast Refresh |
| `typescript` | Type checking |
| `@types/react` | React type definitions |
| `@types/react-dom` | ReactDOM type definitions |
| `tailwindcss` | Utility-first CSS framework |
| `@tailwindcss/postcss` | PostCSS integration for Tailwind v4 |
| `@biomejs/biome` | Linting and formatting (replaces ESLint + Prettier) |
| `jest` | Test runner |
| `@swc/core` | SWC compiler (Rust-based, fast transforms) |
| `@swc/jest` | Jest transformer using SWC |
| `jest-environment-jsdom` | Browser-like DOM for tests |
| `@testing-library/react` | React component test utilities |
| `@testing-library/dom` | DOM testing utilities |
| `@testing-library/jest-dom` | Custom Jest DOM matchers |
| `@types/jest` | Jest type definitions |
| `identity-obj-proxy` | CSS module mock for tests |

## NPM Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `rsbuild dev` | Start dev server with HMR |
| `build` | `rsbuild build` | Production build |
| `preview` | `rsbuild preview` | Preview production build |
| `typecheck` | `tsc --noEmit` | Type-check without emitting (CI/AI-friendly) |
| `test` | `jest` | Run all tests |
| `test:watch` | `jest --watch` | Run tests in watch mode |
| `test:coverage` | `jest --coverage` | Run tests with coverage report |
| `lint` | `biome check .` | Lint + format check |
| `lint:fix` | `biome check --write .` | Auto-fix lint + format issues |
| `format` | `biome format --write .` | Format all files |

## Project Structure

```
guitar-boy/
├── public/                         # Static assets
├── src/
│   ├── index.tsx                   # Entry point — mounts React app
│   ├── index.css                   # Global styles + Tailwind import
│   ├── App.tsx                     # Root component with routing
│   ├── components/
│   │   ├── fretboard/              # <Fretboard> — core reusable component
│   │   ├── layout/                 # Layout shell (Navbar, footer)
│   │   │   └── Layout.tsx
│   │   └── ui/                     # Shared UI primitives (buttons, cards, etc.)
│   ├── pages/
│   │   ├── dashboard/              # Dashboard / landing page
│   │   │   └── DashboardPage.tsx
│   │   ├── whiteboard/             # Fretboard whiteboard (draw mode)
│   │   │   └── WhiteboardPage.tsx
│   │   ├── learning/               # Guided lessons + explorer
│   │   │   └── LearningPage.tsx
│   │   └── quiz/                   # Quiz modes (notes, intervals, chords)
│   │       └── QuizPage.tsx
│   ├── hooks/                      # Custom React hooks (useLocalStorage, etc.)
│   ├── lib/                        # Pure utility functions
│   │   ├── music.ts                # Music theory helpers (getNoteAtFret, etc.)
│   │   └── music.test.ts           # Unit tests for music helpers
│   ├── types/                      # Shared TypeScript types
│   │   ├── index.ts                # Barrel exports
│   │   ├── music.ts                # NoteName, FretPosition, IntervalName, etc.
│   │   └── fretboard.ts            # MarkedDot, ConnectionLine, FretboardState
│   ├── __mocks__/                  # Jest file mocks
│   │   └── fileMock.ts
│   └── test-setup.ts               # Jest setup (jest-dom matchers)
├── biome.json                      # Biome config (linter + formatter)
├── jest.config.ts                  # Jest config (SWC transform, jsdom)
├── postcss.config.mjs              # PostCSS config (Tailwind v4)
├── rsbuild.config.ts               # Rsbuild config (React plugin, aliases)
├── tsconfig.json                   # TypeScript config
├── env.d.ts                        # Global type declarations (SVG, PNG, Rsbuild)
├── package.json                    # Dependencies and scripts
├── yarn.lock                       # Yarn lockfile
└── .yarnrc.yml                     # Yarn config (node-modules linker)
```

## Configuration Files

| File | Purpose |
|---|---|
| `rsbuild.config.ts` | Build config — React plugin, `@/` path alias |
| `tsconfig.json` | TypeScript — strict mode, ES2022 target, bundler module resolution, `@/*` paths |
| `postcss.config.mjs` | PostCSS — Tailwind CSS v4 plugin |
| `jest.config.ts` | Jest — SWC transform, jsdom environment, path aliases, CSS/asset mocking |
| `biome.json` | Biome — tabs, double quotes, semicolons, recommended rules, import sorting |
| `.yarnrc.yml` | Yarn — node-modules linker (not PnP) |
| `env.d.ts` | Ambient types for static assets and Rsbuild |

## Architecture Decisions

### Build: Rsbuild over Vite
Rsbuild uses Rspack (Rust-based Webpack-compatible bundler) for fast builds. The `@rsbuild/plugin-react` handles JSX compilation via SWC and enables React Fast Refresh in dev mode.

### CSS: Tailwind CSS v4
Tailwind v4 requires no `tailwind.config.js` — all customization happens in CSS via `@theme` directives. It uses `@tailwindcss/postcss` for integration with Rsbuild's built-in PostCSS support.

### Testing: @swc/jest over ts-jest
SWC transforms are ~5x faster than ts-jest. Type-checking is handled separately by `tsc --noEmit`. This keeps the feedback loop fast during development.

### Linting: Biome over ESLint + Prettier
Biome is a single tool that replaces both ESLint and Prettier. It's written in Rust and checks/formats in milliseconds.

### State: Custom Hooks + localStorage
Current code uses dedicated hooks (`useProgressStore`, `useDiagramStore`, `useLocalStorage`) rather than a global React Context. App-wide data is persisted directly through these hooks.

### Fretboard Rendering: DOM Grid Today, Canvas Planned
The current `Fretboard` implementation renders a table-like button grid in the DOM. A canvas migration is planned to improve visual quality, support richer drawing semantics, and improve long-term performance.

### Routing: React Router v7
Standard route-based navigation with a shared layout shell. Four top-level routes: Dashboard, Whiteboard, Learn, Quiz.

### Path Aliases
`@/` maps to `src/` — configured in both `tsconfig.json` (for IDE/typecheck) and `rsbuild.config.ts` (for bundling) and `jest.config.ts` (for tests).

## Testing Strategy

| Layer | Tool | Scope |
|---|---|---|
| Unit — music theory | Jest | `src/lib/` — pure functions, 100% target |
| Unit — SRS algorithm | Jest | SM-2 update logic, 100% target |
| Unit — hooks | Jest + RTL | `useLocalStorage`, schema migrations |
| Component — Fretboard | React Testing Library | Rendering, click interaction, feedback overlays |
| Component — Quiz flow | React Testing Library | Planned (quiz page is currently a placeholder) |
| E2E (future v2) | Playwright | Full quiz sessions |
