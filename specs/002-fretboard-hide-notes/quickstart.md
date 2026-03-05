# Quickstart: Hide Notes During Test Mode

**Feature**: 002-fretboard-hide-notes  
**Date**: 2026-03-05  
**Estimated Time**: 1-2 hours

## Overview

This guide walks through implementing conditional note label visibility in the fretboard component's test mode. Labels will be hidden during quiz questions and revealed after answer submission.

## Prerequisites

- Familiarity with TypeScript and React
- Understanding of canvas rendering in React
- Access to the Guitar Boy codebase
- Tests passing on main branch (151/151)

## Implementation Steps

### Step 1: Update DotRenderOptions Interface (5 minutes)

**File**: `src/components/fretboard/canvas/render.ts`

**Action**: Add `hideLabels` option to the interface

```typescript
export interface DotRenderOptions {
  selectedPositions?: FretPosition[];
  targetPositions?: FretPosition[];
  correctPositions?: FretPosition[];
  missedPositions?: FretPosition[];
  incorrectPositions?: FretPosition[];
  defaultDotColor?: string;
  targetOutlineColor?: string;
  labelMode?: "dot" | "note";
  invertStringNotes?: boolean;
  hideLabels?: boolean;  // ← ADD THIS LINE
}
```

**Why**: This flag will signal the rendering function to skip label drawing.

### Step 2: Modify drawDots Function (10 minutes)

**File**: `src/components/fretboard/canvas/render.ts`

**Action**: Add conditional check before rendering labels

**Current code** (line ~205):
```typescript
if (labelText && !isTarget) {
  ctx.fillStyle = isCircle ? color : "#1f1209";
  ctx.font = "600 11px Manrope";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(labelText, point.x, point.y);
}
```

**New code**:
```typescript
if (labelText && !isTarget && !options.hideLabels) {
  ctx.fillStyle = isCircle ? color : "#1f1209";
  ctx.font = "600 11px Manrope";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(labelText, point.x, point.y);
}
```

**Why**: The `&& !options.hideLabels` check prevents label rendering when the flag is true.

### Step 3: Add Helper Function (5 minutes)

**File**: `src/components/fretboard/CanvasFretboard.tsx`

**Action**: Add helper function to determine if labels should hide

```typescript
function shouldHideLabels(mode: FretboardMode, hasFeedback: boolean): boolean {
  return mode === "test" && !hasFeedback;
}
```

**Location**: Add near other helper functions (around line 40)

**Why**: Encapsulates the label visibility logic for clarity and reusability.

### Step 4: Update CanvasFretboard Component (15 minutes)

**File**: `src/components/fretboard/CanvasFretboard.tsx`

**Action**: Compute `hideLabels` flag and pass to render function

**Find the render call** (around line ~400-500, look for `drawDots`):

**Current code**:
```typescript
drawDots(ctx, metrics, visualDots, {
  selectedPositions: visualSelected,
  targetPositions: visualTarget,
  correctPositions: visualCorrect,
  missedPositions: visualMissed,
  incorrectPositions: visualIncorrect,
  defaultDotColor: PATTERN_DOT_COLOR,
  targetOutlineColor: "#dc2626",
  labelMode: showNoteNames ? "note" : "dot",
  invertStringNotes: true,
});
```

**New code**:
```typescript
// Compute if feedback is present
const hasFeedback = 
  (correctPositions?.length ?? 0) > 0 ||
  (missedPositions?.length ?? 0) > 0 ||
  (incorrectPositions?.length ?? 0) > 0;

// Determine if labels should hide
const hideLabels = shouldHideLabels(mode, hasFeedback);

drawDots(ctx, metrics, visualDots, {
  selectedPositions: visualSelected,
  targetPositions: visualCorrect,
  correctPositions: visualCorrect,
  missedPositions: visualMissed,
  incorrectPositions: visualIncorrect,
  defaultDotColor: PATTERN_DOT_COLOR,
  targetOutlineColor: "#dc2626",
  labelMode: showNoteNames ? "note" : "dot",
  invertStringNotes: true,
  hideLabels,  // ← ADD THIS LINE
});
```

**Why**: This computes whether feedback is present and passes the `hideLabels` flag to the rendering function.

### Step 5: Write Tests (30 minutes)

**File**: `src/components/fretboard/CanvasFretboard.test.tsx`

**Action**: Add test suite for label visibility

**Add after existing tests**:

```typescript
describe("label visibility in test mode", () => {
  it("hides labels during test mode before answer submission", () => {
    const state: FretboardState = {
      dots: [{ position: { string: 0, fret: 5 }, label: "A" }],
      lines: [],
    };

    const { container } = render(
      <CanvasFretboard
        mode="test"
        state={state}
        fretRange={[1, 12]}
      />
    );

    // Verify label "A" is not rendered in the canvas
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    
    // You may need to check canvas pixels or use a snapshot
    // Option 1: Snapshot test
    expect(canvas).toMatchSnapshot();
    
    // Option 2: Check that the canvas doesn't contain the label text
    // (This requires inspecting the canvas drawing, which is complex)
  });

  it("shows labels in test mode after answer submission", () => {
    const state: FretboardState = {
      dots: [{ position: { string: 0, fret: 5 }, label: "A" }],
      lines: [],
    };

    const { container } = render(
      <CanvasFretboard
        mode="test"
        state={state}
        fretRange={[1, 12]}
        correctPositions={[{ string: 0, fret: 5 }]}
      />
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    
    // Snapshot should show labels visible
    expect(canvas).toMatchSnapshot();
  });

  it("shows labels in view mode regardless of feedback", () => {
    const state: FretboardState = {
      dots: [{ position: { string: 0, fret: 5 }, label: "A" }],
      lines: [],
    };

    const { container } = render(
      <CanvasFretboard
        mode="view"
        state={state}
        fretRange={[1, 12]}
      />
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    
    // Labels should be visible in view mode
    expect(canvas).toMatchSnapshot();
  });

  it("shows labels in draw mode", () => {
    const state: FretboardState = {
      dots: [{ position: { string: 0, fret: 5 }, label: "A" }],
      lines: [],
    };

    const { container } = render(
      <CanvasFretboard
        mode="draw"
        state={state}
        fretRange={[1, 12]}
      />
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    
    // Labels should be visible in draw mode
    expect(canvas).toMatchSnapshot();
  });
});
```

**Why**: These tests ensure:
1. Labels hide in test mode before submission
2. Labels show in test mode after submission
3. Non-test modes are not affected (regression tests)

### Step 6: Run Tests & Verify (10 minutes)

```bash
# Run tests
yarn test

# Verify type checking
yarn typecheck

# Run linting
yarn lint

# Build production bundle
yarn build
```

**Expected**: All tests pass (151/151 + new tests), no type errors, no lint errors.

### Step 7: Manual Testing (15 minutes)

1. **Start dev server**:
   ```bash
   yarn dev
   ```

2. **Test quiz modes**:
   - Navigate to Quiz mode
   - Start a "Find the Note" quiz
   - Verify labels are NOT visible on the fretboard during the question
   - Click a position to answer
   - Verify labels BECOME visible after submitting

3. **Test non-quiz modes**:
   - Navigate to Whiteboard
   - Create or view a diagram
   - Verify labels ARE visible
   - Navigate to Learning mode
   - Start a lesson
   - Verify labels ARE visible in lesson diagrams

4. **Test mode switching**:
   - Start a quiz (labels hidden)
   - Navigate away to Whiteboard (labels visible)
   - Navigate back to quiz (labels hidden again)

## Common Issues & Solutions

### Issue: Labels still visible in test mode

**Check**:
- Is `hideLabels` being computed correctly?
- Is `hasFeedback` detection working?
- Is the `mode` prop actually "test"?

**Debug**:
```typescript
console.log({ mode, hasFeedback, hideLabels });
```

### Issue: Labels hidden in non-test modes

**Check**:
- Is `shouldHideLabels` returning false for non-test modes?
- Are you passing the correct `mode` prop?

**Debug**:
```typescript
console.log({ mode, hideLabels });
```

### Issue: Canvas snapshot tests failing

**Solution**: Update snapshots if changes are expected:
```bash
yarn test --updateSnapshot
```

## Verification Checklist

- [ ] Labels hidden in test mode before submission
- [ ] Labels visible in test mode after submission
- [ ] Labels visible in view mode
- [ ] Labels visible in draw mode
- [ ] Labels visible in click-select mode
- [ ] Labels visible in patterns mode
- [ ] All tests passing (151/151 + new tests)
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Build succeeds
- [ ] Manual testing confirms behavior

## Next Steps

After implementation:
1. Run full test suite: `yarn test`
2. Run quality checks: `yarn lint && yarn typecheck && yarn build`
3. Update tasks.md to mark implementation complete
4. Consider adding this feature to the documentation

## References

- **Spec**: `/specs/002-fretboard-hide-notes/spec.md`
- **Research**: `/specs/002-fretboard-hide-notes/research.md`
- **Data Model**: `/specs/002-fretboard-hide-notes/data-model.md`
- **Existing Tests**: `src/components/fretboard/CanvasFretboard.test.tsx`
- **Constitution**: `.specify/memory/constitution.md`
