# Data Model: Hide Notes During Test Mode

**Feature**: 002-fretboard-hide-notes  
**Date**: 2026-03-05  
**Status**: Complete

## Overview

This feature extends existing data structures with a boolean flag to control label visibility. No new entities are created; only the rendering behavior changes based on existing data.

## Existing Entities (No Changes)

### FretboardMode

**Type**: Union type  
**Values**: `"view" | "click-select" | "draw" | "test" | "patterns"`

**Purpose**: Determines fretboard interaction behavior and visual presentation

**Behavior Changes**:
- `"test"` mode now conditionally hides labels based on feedback state
- All other modes: No changes (labels always visible)

### FretboardProps

**Type**: Interface  
**Purpose**: Configuration for Fretboard component

**Existing Fields Used**:
```typescript
interface FretboardProps {
  mode: FretboardMode;                    // Determines if labels should hide
  correctPositions?: FretPosition[];      // Feedback signal - answer submitted
  missedPositions?: FretPosition[];       // Feedback signal - answer submitted
  incorrectPositions?: FretPosition[];    // Feedback signal - answer submitted
  // ... other fields unchanged
}
```

**No New Fields**: Quiz state is inferred from presence of feedback positions.

### DotRenderOptions

**Type**: Interface (internal to render.ts)  
**Purpose**: Configuration for dot rendering

**New Field Added**:
```typescript
interface DotRenderOptions {
  selectedPositions?: FretPosition[];
  targetPositions?: FretPosition[];
  correctPositions?: FretPosition[];
  missedPositions?: FretPosition[];
  incorrectPositions?: FretPosition[];
  defaultDotColor?: string;
  targetOutlineColor?: string;
  labelMode?: "dot" | "note";
  invertStringNotes?: boolean;
  hideLabels?: boolean;  // NEW: Skip label rendering when true
}
```

## State Transitions

### Quiz Question Flow

```text
┌─────────────────┐
│ Question Shown  │
│ mode="test"     │
│ feedback=[]     │
│ labels=HIDDEN   │
└────────┬────────┘
         │ User clicks answer
         ▼
┌─────────────────┐
│ Answer Checked  │
│ mode="test"     │
│ feedback=SET    │
│ labels=VISIBLE  │
└────────┬────────┘
         │ Next question
         ▼
┌─────────────────┐
│ Next Question   │
│ mode="test"     │
│ feedback=[]     │
│ labels=HIDDEN   │
└─────────────────┘
```

### Mode Switching

```text
Test Mode → Other Mode
- labels immediately become VISIBLE (feedback doesn't matter in non-test modes)

Other Mode → Test Mode
- If feedback present: labels VISIBLE
- If feedback absent: labels HIDDEN
```

## Label Visibility Logic

### Decision Function

```typescript
function shouldHideLabels(mode: FretboardMode, hasFeedback: boolean): boolean {
  return mode === "test" && !hasFeedback;
}
```

### Truth Table

| Mode | Feedback Present | Labels Visible | Rationale |
|------|-----------------|----------------|-----------|
| view | false | ✅ YES | Static display, always show |
| view | true | ✅ YES | N/A (feedback not used in view mode) |
| click-select | false | ✅ YES | Interactive selection, always show |
| click-select | true | ✅ YES | N/A (feedback not used in click-select) |
| draw | false | ✅ YES | Diagram creation, always show |
| draw | true | ✅ YES | N/A (feedback not used in draw) |
| test | false | ❌ NO | **Question phase - hide answers** |
| test | true | ✅ YES | **Feedback phase - show answers** |
| patterns | false | ✅ YES | Pattern display, always show |
| patterns | true | ✅ YES | N/A (feedback not used in patterns) |

## Data Flow

### Component Hierarchy

```text
QuizRunner / ReviewMode
    ↓ props
CanvasFretboard
    ↓ computes hasFeedback
    ↓ passes hideLabels
drawDots(render.ts)
    ↓ checks hideLabels
    ↓ skips label rendering if true
Canvas Context
```

### Feedback Detection Logic

```typescript
// In CanvasFretboard component
const hasFeedback = 
  (correctPositions?.length ?? 0) > 0 ||
  (missedPositions?.length ?? 0) > 0 ||
  (incorrectPositions?.length ?? 0) > 0;

const hideLabels = mode === "test" && !hasFeedback;

// Pass to render function
drawDots(ctx, metrics, dots, {
  ...existingOptions,
  hideLabels
});
```

## Validation Rules

### FretboardProps Validation

**No new validation required**:
- Existing validation ensures feedback positions are valid FretPosition arrays
- Boolean logic is type-safe
- Mode is already validated as union type

### Rendering Validation

**Invariants**:
1. Labels are always rendered in non-test modes (preserve existing behavior)
2. In test mode, labels are hidden only when ALL feedback arrays are empty
3. If ANY feedback array has elements, labels are shown (answer submitted)

## Storage & Persistence

**No storage changes**:
- Feature is purely presentational
- No new data persisted
- Existing localStorage for diagrams and progress unaffected

## Performance Considerations

### Computation Complexity

- Feedback detection: O(1) - checking array lengths
- Label hiding: O(1) - single boolean check
- No loops or expensive operations added

### Memory Impact

- No new allocations
- No new state stored
- Negligible performance impact

## Testing Data Model

### Test Scenarios

1. **Test mode, no feedback**: `hideLabels = true`
2. **Test mode, with feedback**: `hideLabels = false`
3. **View mode, no feedback**: `hideLabels = false`
4. **View mode, with feedback**: `hideLabels = false` (N/A but safe)
5. **Draw mode**: `hideLabels = false`
6. **Click-select mode**: `hideLabels = false`
7. **Patterns mode**: `hideLabels = false`

### Test Data Requirements

```typescript
// Minimal test data
const testPosition: FretPosition = { string: 0, fret: 5 };
const testDot: MarkedDot = { 
  position: testPosition, 
  label: "A" 
};
```

## Summary

- **No schema changes** - Uses existing data structures
- **Inferred state** - Quiz state determined from feedback presence
- **Simple logic** - Single boolean flag controls label visibility
- **Backward compatible** - All existing modes preserve current behavior
- **Performance neutral** - No measurable performance impact
