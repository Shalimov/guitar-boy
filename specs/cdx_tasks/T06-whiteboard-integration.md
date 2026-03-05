# T06: Whiteboard Integration For Canvas Fretboard

## Objective
Wire the canvas-based fretboard into whiteboard workflows so toolbar controls, dot/line editing, and persistence behave correctly.

## Read First
- `src/pages/whiteboard/DiagramEditor.tsx`
- `src/pages/whiteboard/AnnotationToolbar.tsx`
- `src/pages/whiteboard/WhiteboardPage.tsx`
- `src/pages/whiteboard/DiagramEditor.test.tsx`
- `src/pages/whiteboard/AnnotationToolbar.test.tsx`
- `src/pages/whiteboard/WhiteboardPage.test.tsx`
- `src/hooks/useDiagramStore.ts`

## Files To Edit
- `src/pages/whiteboard/DiagramEditor.tsx`
- `src/pages/whiteboard/AnnotationToolbar.tsx`
- `src/pages/whiteboard/WhiteboardPage.tsx`
- `src/pages/whiteboard/DiagramEditor.test.tsx`
- `src/pages/whiteboard/AnnotationToolbar.test.tsx`
- `src/pages/whiteboard/WhiteboardPage.test.tsx`

## Optional Files To Create
- `src/pages/whiteboard/DiagramPreviewCanvas.tsx`
- `src/pages/whiteboard/DiagramPreviewCanvas.test.tsx`

## Implementation Steps
1. Make `DiagramEditor` the single source of truth for `fretboardState`.
2. Ensure `Fretboard` receives controlled `state` and returns user actions through callbacks.
3. Implement connect workflow:
   - `connectMode` on,
   - first dot click selects start,
   - second dot click creates line with toolbar style/color,
   - duplicate lines are prevented.
4. Preserve existing dot add/remove behavior when connect mode is off.
5. Add dot metadata editing support for label, color, and shape in editor controls.
6. Add unsaved-change protection on cancel/navigation in editor.
7. Ensure saved diagrams persist full state, including line style and dot style.
8. Improve list and pattern cards with optional mini fretboard preview to strengthen visual scanning.

## Testing Guidance
- Add tests for connect mode end-to-end in `DiagramEditor.test.tsx`.
- Add tests that line style and dot style are persisted after save.
- Add tests for unsaved changes confirmation behavior.
- Keep existing tab and navigation behavior tests passing.

## Acceptance Criteria
- Connect mode is functional and visually reflected.
- Lines are actually visible on the fretboard after save/reload.
- Toolbar controls affect rendered output, not just local UI state.
- User diagrams remain editable, built-in diagrams remain immutable.

## Verification Commands
- `yarn test src/pages/whiteboard/AnnotationToolbar.test.tsx`
- `yarn test src/pages/whiteboard/DiagramEditor.test.tsx`
- `yarn test src/pages/whiteboard/WhiteboardPage.test.tsx`
- `yarn typecheck`
- `yarn lint`

## Out Of Scope
- No implementation of full learning curriculum.
- No implementation of full quiz engine.
