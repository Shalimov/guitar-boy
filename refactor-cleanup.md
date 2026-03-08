# Refactor Cleanup Plan

Use this document as the task list for a less capable coding model. Keep changes small, safe, and easy to review. Do not try to redesign the app or change product behavior unless a task explicitly says to.

## Main Goal

Clean up obvious technical debt, reduce component complexity, remove accidental files, and make the codebase easier to maintain without changing user-facing behavior.

## Important Rules

- Work in small commits or small reviewable patches.
- Prefer extraction over rewrites.
- Preserve existing behavior, routes, and localStorage keys.
- Do not change app visuals unless needed to remove duplication.
- Do not refactor many areas at once.
- After each task, run the relevant checks before moving on.

## Recommended Order

### 1. Remove accidental and generated files from the repo

Start with the safest cleanup.

- Delete `src/pages/whiteboard/DiagramEditor.tsx.backup`.
- Check whether tracked build artifacts should be removed from git:
  - `coverage/`
  - `dist/`
- Do not delete anything else unless you confirm it is generated or unused.

Done when:

- No backup file remains.
- Generated output is not kept in source control if it is safe to remove.

### 2. Replace browser dialogs with app-level UI patterns

There are still native dialogs that break the app's UI consistency.

Targets:

- `src/pages/learning/LearningPage.tsx`
- `src/pages/whiteboard/DiagramEditor.tsx`
- `src/pages/whiteboard/WhiteboardPage.tsx`

What to do:

- Replace `alert()` and `window.confirm()` usage with existing app UI patterns.
- If no reusable confirm/notice component exists, create a very small shared component or hook instead of repeating modal code.
- Keep the same user actions and safety checks.

Done when:

- No `alert(` or `confirm(` calls remain in app code.

### 3. Extract duplicated UI shells and repeated styling

Several pages repeat the same card, header, progress, and tab button patterns, plus lots of inline styles.

Start with the easiest repeated patterns in:

- `src/pages/learning/LearningPage.tsx`
- `src/pages/learning/LessonPlayer.tsx`
- `src/pages/quiz/QuizRunner.tsx`
- `src/pages/quiz/QuizSelector.tsx`
- `src/pages/quiz/ReviewMode.tsx`
- `src/pages/whiteboard/DiagramViewer.tsx`

What to do:

- Extract small presentational components for repeated page sections.
- Move repeated inline style objects to shared classes, helpers, or constants.
- Prefer reusable components like tab bars, page headers, and progress bars.
- Do not over-abstract one-off markup.

Done when:

- Repeated UI blocks are shared.
- Inline style duplication is noticeably reduced.

### 4. Break up oversized components

Some components are too large for easy maintenance.

Highest priority:

- `src/pages/quiz/QuizRunner.tsx`
- `src/components/fretboard/CanvasFretboard.tsx`
- `src/pages/whiteboard/DiagramEditor.tsx`

Guidance:

- `QuizRunner.tsx`
  - Extract question generation into a separate module.
  - Extract answer checking into pure functions.
  - Extract timer logic into a custom hook.
  - Extract question-type-specific rendering into smaller components.
- `CanvasFretboard.tsx`
  - Move pure helper functions into dedicated utility files.
  - Split rendering concerns from interaction/keyboard logic where practical.
  - Keep accessibility behavior intact.
- `DiagramEditor.tsx`
  - Extract state mutation helpers for dots, lines, and groups.
  - Extract the context menu into its own component.

Done when:

- Main component files are materially smaller.
- Extracted logic is easier to test in isolation.

### 5. Clean up whiteboard state management

The whiteboard feature has state logic spread across components and hooks.

Targets:

- `src/pages/whiteboard/DiagramEditor.tsx`
- `src/pages/whiteboard/useDiagramHistory.ts`
- `src/hooks/useDiagramStore.ts`

What to improve:

- Move state transition logic into pure helper functions where possible.
- Check whether `reset` in `useDiagramHistory.ts` should be used or removed.
- Reduce repeated object reconstruction when updating dots, lines, and groups.
- Keep store API simple and stable.

Done when:

- State updates are easier to follow.
- Dead or unused API surface is removed if safe.

### 6. Improve type safety and local naming

Some files use loose strings or broad local state shapes where stronger types would help.

Examples:

- `src/pages/quiz/QuizRunner.tsx`
- `src/pages/learning/NoteMemoryTrainer.tsx`
- `src/pages/whiteboard/DiagramEditor.tsx`

What to do:

- Replace generic `string` types with narrower unions where the valid values are known.
- Extract shared local interfaces/types when they are reused.
- Simplify branching with typed helpers instead of long inline condition chains.

Done when:

- Fewer broad `string`-typed values drive core logic.
- Control flow is easier to read.

### 7. Add or update tests around refactored logic

Do not rely on existing tests alone when moving logic around.

Focus on:

- quiz question generation and answer evaluation
- whiteboard state mutations
- any new shared hooks/components created during refactor

Prefer pure-function unit tests when possible over large UI tests.

## Things To Avoid

- Do not rename many files unless necessary.
- Do not migrate the whole styling system in one pass.
- Do not rewrite `CanvasFretboard` from scratch.
- Do not change localStorage schema unless absolutely required.
- Do not mix cleanup with new features.

## Verification Commands

Use package scripts where available.

Run after each meaningful slice:

```bash
yarn format
yarn lint
yarn typecheck
yarn test
yarn build
```

If you are changing only a few files, you may use targeted Biome commands first, then run the full package scripts before finishing.

## Good Final Outcome

A good result means:

- no backup/generated junk is committed
- fewer native browser dialogs
- less duplicated UI code
- smaller and clearer large components
- safer typed logic in quiz and whiteboard flows
- tests still pass and behavior stays the same
