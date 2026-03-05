# Research: Hide Notes During Test Mode

**Feature**: 002-fretboard-hide-notes  
**Date**: 2026-03-05  
**Status**: Complete

## Overview

This document captures research findings for implementing conditional note label visibility in the fretboard component's test mode.

## Research Questions

### Q1: How does the current fretboard rendering handle labels?

**Finding**: 
- The `drawDots` function in `src/components/fretboard/canvas/render.ts` (line 205) already has conditional label rendering: `if (labelText && !isTarget)`
- Labels are hidden for target positions (empty circles shown to user)
- The `DotRenderOptions` interface accepts `labelMode` to switch between dot labels and note names

**Decision**: Extend `DotRenderOptions` with a `hideLabels` boolean flag. When true, skip all label rendering.

**Rationale**: 
- Follows existing pattern (conditional rendering based on options)
- Minimal code change
- Clear intent with boolean flag

**Alternatives Considered**:
1. ❌ Create separate rendering function for test mode - Too much duplication
2. ❌ Remove label data from dots in test mode - Would require state duplication
3. ✅ Add `hideLabels` flag to options - Simplest, most maintainable

### Q2: How does the fretboard component determine quiz state?

**Finding**:
- The `FretboardProps` interface includes feedback position arrays:
  - `correctPositions`: Green overlay (correct answer)
  - `missedPositions`: Yellow overlay (missed correct answer)
  - `incorrectPositions`: Red overlay (wrong answer)
- These arrays are empty `[]` during the question phase
- They are populated after answer submission

**Decision**: Use presence of feedback positions as signal that answer was submitted:
```typescript
const hasFeedback = (options.correctPositions?.length ?? 0) > 0 || 
                    (options.missedPositions?.length ?? 0) > 0 || 
                    (options.incorrectPositions?.length ?? 0) > 0;
```

**Rationale**:
- No new props needed
- Works with existing quiz logic
- Clear semantic: "feedback shown = answer submitted"

**Alternatives Considered**:
1. ❌ Add `isAnswerSubmitted` boolean prop - Redundant with feedback positions
2. ❌ Add `quizPhase` enum prop - Over-engineering for this feature
3. ✅ Infer from feedback positions - Uses existing data, no new interface

### Q3: How should labels behave in each fretboard mode?

**Finding**:
Current modes defined in `FretboardMode`:
- `"view"` - Static display, labels visible
- `"click-select"` - Interactive selection, labels visible
- `"draw"` - Create diagrams, labels visible
- `"test"` - Quiz mode, **labels should be hidden until submission**
- `"patterns"` - Pattern display, labels visible

**Decision**: 
- Test mode: Hide labels unless feedback positions present
- All other modes: Show labels (preserve existing behavior)

**Rationale**:
- Matches spec requirements exactly
- Preserves all existing functionality
- Simple conditional logic

**Implementation**:
```typescript
function shouldHideLabels(mode: FretboardMode, hasFeedback: boolean): boolean {
  return mode === "test" && !hasFeedback;
}
```

### Q4: What are the performance implications of conditional rendering?

**Finding**:
- Canvas rendering happens on every state change
- Label rendering is a small part of total render time
- Adding one boolean check has negligible performance impact

**Decision**: No optimization needed. Add simple conditional check.

**Rationale**:
- Existing performance is excellent (<100ms transitions)
- Boolean check is O(1)
- No rendering bottleneck identified

**Alternatives Considered**:
1. ❌ Memoize label rendering - Over-optimization, adds complexity
2. ✅ Simple conditional check - Sufficient, maintainable

### Q5: How should this be tested?

**Finding**:
- Existing tests in `CanvasFretboard.test.tsx` use canvas snapshot testing
- Tests verify visual output through canvas pixel inspection
- React Testing Library queries available for component behavior

**Decision**: Add tests that verify:
1. Labels hidden in test mode before feedback
2. Labels visible in test mode with feedback
3. Labels visible in non-test modes (regression test)

**Rationale**:
- Follows existing test patterns
- Protects against regression
- Tests behavior, not implementation

**Test Structure**:
```typescript
describe("CanvasFretboard - label visibility in test mode", () => {
  it("hides labels during test mode before answer submission", () => {
    // Test that labels are not rendered when mode="test" and no feedback
  });
  
  it("shows labels in test mode after answer submission", () => {
    // Test that labels are rendered when mode="test" and feedback present
  });
  
  it("shows labels in non-test modes", () => {
    // Test that labels are visible in view/draw/click-select/patterns modes
  });
});
```

## Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| How to control label visibility | Add `hideLabels` boolean to `DotRenderOptions` | Follows existing pattern, minimal change |
| How to detect answer submission | Check if feedback positions are present | No new props needed, uses existing data |
| Which modes hide labels | Only "test" mode, and only before feedback | Matches spec, preserves existing behavior |
| Performance approach | Simple boolean check | No optimization needed |
| Testing approach | Canvas snapshot tests for label visibility | Follows existing test patterns |

## Implementation Plan

### Changes Required

1. **src/components/fretboard/canvas/render.ts**:
   - Add `hideLabels?: boolean` to `DotRenderOptions` interface
   - Modify `drawDots` function to check `hideLabels` flag before rendering labels
   - Add helper function `shouldHideLabels(mode, hasFeedback)`

2. **src/components/fretboard/CanvasFretboard.tsx**:
   - Determine if feedback is present (check feedback position arrays)
   - Pass `hideLabels: shouldHideLabels(mode, hasFeedback)` to `drawDots` options

3. **src/components/fretboard/CanvasFretboard.test.tsx**:
   - Add test suite for label visibility in test mode
   - Test all 3 scenarios (hidden before feedback, visible after feedback, visible in other modes)

### No Changes Needed

- `src/types/diagram.ts` - No interface changes required
- Quiz components - No changes needed (already pass feedback positions correctly)

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Regression in non-test modes | Low | Medium | Comprehensive regression tests |
| Performance degradation | Very Low | Low | Simple boolean check, benchmark if needed |
| Quiz components don't pass feedback | Low | High | Verify quiz components already pass feedback positions |

## Conclusion

The implementation is straightforward with minimal risk. The approach follows existing patterns, requires no new dependencies, and maintains all current functionality while adding the requested quiz improvement.
