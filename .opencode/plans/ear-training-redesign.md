# Ear Training Modes Redesign Plan

## Goal
Redesign HearIdentifyMode, ToneMeditationMode, and AnchorNoteMode to eliminate the empty/sparse feeling and make them consistent with the NoteMemoryTrainer's polished design language.

## Design Principles (from NoteMemoryTrainer reference)
1. **Panel sections** — `rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-4 shadow-[var(--gb-shadow-soft)]`
2. **Section kickers** — `gb-page-kicker` labels above section headings
3. **TinyStat pills** — Compact stat badges for session metrics
4. **Toolbar rows** — Controls grouped horizontally inside header panel
5. **Two-column layout** — Fretboard left, answer controls right (xl breakpoint)
6. **"Waiting for answer" placeholder** — Muted panel when no feedback visible
7. **Consistent KeyboardShortcutsBar** — Always above the answer area

## Implementation Steps

### Step 1: Extract TinyStat to shared component
- Create `src/components/ui/TinyStat.tsx` — copy from NoteMemoryTrainer's local `TinyStat` function
- Props: `label: string`, `value: string`, `statKey: string`
- Renders: pill with `data-testid={trainer-stat-${statKey}}`

### Step 2: Update barrel export
- Add `export { TinyStat } from "./TinyStat"` to `src/components/ui/index.ts`

### Step 3: Update NoteMemoryTrainer
- Remove local `TinyStat` function
- Import shared `TinyStat` from `@/components/ui`

### Step 4: Redesign HearIdentifyMode
Structure:
```
<div class="space-y-6">
  ┌─ Section 1: Header Panel (rounded-[22px] border bg-panel) ┐
  │  Left: kicker "Hear & Identify" + title + description      │
  │  Right: TinyStat pills (Correct, Total, Accuracy)          │
  │  ─── hr ───                                                 │
  │  Toolbar: Level select | Replay button | Equalizer          │
  └─────────────────────────────────────────────────────────────┘
  ┌─ Section 2: Drill Area (rounded-[24px] bg-elev)            ┐
  │  Kicker "Current Prompt" + heading + description            │
  │  ┌── xl:grid-cols-[1.15fr,0.85fr] ─────────────────────┐  │
  │  │ Left: Fretboard in sub-panel                          │  │
  │  │ Right:                                                │  │
  │  │   "Choose the note" label                             │  │
  │  │   KeyboardShortcutsBar                                │  │
  │  │   NoteButtonGrid                                      │  │
  │  │   FeedbackPanel or "Waiting for answer" placeholder   │  │
  │  └──────────────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────────┘
</div>
```

### Step 5: Redesign ToneMeditationMode
Structure:
```
<div class="space-y-6">
  ┌─ Section 1: Header Panel ──────────────────────────────────┐
  │  Kicker + Title + Description                               │
  │  ─── hr ───                                                 │
  │  Toolbar: Note selector chips | positions count             │
  └─────────────────────────────────────────────────────────────┘
  ┌─ Section 2: Visualization Area ─────────────────────────────┐
  │  Kicker "Visualization" + "Listening to {note}"             │
  │  Fretboard in sub-panel                                     │
  │  ─── Divider ───                                            │
  │  Controls: Play/Stop + Equalizer + Progress counter         │
  │  KeyboardShortcutsBar                                       │
  └─────────────────────────────────────────────────────────────┘
</div>
```

### Step 6: Redesign AnchorNoteMode
Structure:
```
<div class="space-y-6">
  ┌─ Section 1: Header Panel ──────────────────────────────────┐
  │  Left: Kicker + Title + Description                         │
  │  Right: TinyStat pills (Sessions, Accuracy, Unlocked)       │
  │  ─── hr ───                                                 │
  │  Note selector chips + How it works disclosure              │
  └─────────────────────────────────────────────────────────────┘
  ┌─ Section 2: Drill Area ────────────────────────────────────┐
  │  ┌── xl:grid-cols-[1.15fr,0.85fr] ─────────────────────┐  │
  │  │ Left: Fretboard sub-panel + equalizer                 │  │
  │  │ Right:                                                │  │
  │  │   Status: current note + listening state              │  │
  │  │   Yes/No buttons (in a card)                          │  │
  │  │   FeedbackPanel or "Waiting..." placeholder           │  │
  │  │   Start Session button (when not active)              │  │
  │  │   Progress counter                                    │  │
  │  └──────────────────────────────────────────────────────┘  │
  │  KeyboardShortcutsBar (shared component, replacing inline) │
  └─────────────────────────────────────────────────────────────┘
</div>
```
- Replace hand-rolled shortcuts bar with shared `KeyboardShortcutsBar` + `buildSimpleShortcutItems`
- Move note selector into header panel
- Add TinyStat pills

### Step 7: Run typecheck, lint, build
```
yarn tsc --noEmit && yarn exec biome check --write && yarn build
```

### Step 8: Run tests
```
yarn test
```

## Files to change
| File | Action |
|------|--------|
| `src/components/ui/TinyStat.tsx` | **Create** |
| `src/components/ui/index.ts` | **Edit** — add TinyStat export |
| `src/pages/learning/NoteMemoryTrainer.tsx` | **Edit** — import shared TinyStat, remove local |
| `src/pages/ear-training/HearIdentifyMode.tsx` | **Edit** — full layout restructure |
| `src/pages/ear-training/ToneMeditationMode.tsx` | **Edit** — full layout restructure |
| `src/pages/ear-training/AnchorNoteMode.tsx` | **Edit** — full layout restructure |
