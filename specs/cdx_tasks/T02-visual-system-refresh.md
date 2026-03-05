# T02: Visual System Refresh

## Objective
Create a clear and distinctive visual language across layout, dashboard, and whiteboard pages, while keeping all existing flows functional.

## Design Direction
Use a warm "workshop" aesthetic inspired by guitar wood and hardware:
- Background atmosphere: layered gradient with subtle texture.
- Color palette: warm neutrals + copper accent + deep slate contrast.
- Typography: expressive heading font and readable body font.
- Component style: stronger hierarchy, improved spacing, better hover/focus states.

## Read First
- `src/index.css`
- `src/components/layout/Layout.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/pages/dashboard/DashboardPage.tsx`
- `src/pages/whiteboard/WhiteboardPage.tsx`

## Files To Edit
- `src/index.css`
- `src/components/layout/Layout.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/pages/dashboard/DashboardPage.tsx`
- `src/pages/whiteboard/WhiteboardPage.tsx`

## Implementation Steps
1. Add a design token layer in `src/index.css` using CSS custom properties for color, radius, spacing, shadows, and focus ring.
2. Add typography choices in `src/index.css` and apply heading/body classes in main page components.
3. Build a non-flat app background in `Layout.tsx` using gradient and subtle decorative shapes.
4. Update `Button.tsx` variants to use the new token system and stronger interactive states.
5. Update `Card.tsx` to match the new visual language and improve click affordance.
6. Refresh dashboard cards with clearer information hierarchy and improved visual rhythm.
7. Improve whiteboard tabs and empty states so they visually align with dashboard and layout.
8. Ensure all updated UI remains responsive at 320px, 768px, and >=1280px widths.

## Accessibility Requirements
- Preserve semantic HTML for links, buttons, and headings.
- Ensure visible focus outlines on all interactive controls.
- Keep color contrast >= WCAG AA for body text and controls.

## Acceptance Criteria
- No major page uses plain `bg-gray-50` + default blue palette as the dominant visual system.
- Dashboard, nav, cards, and buttons look visually consistent.
- Mobile layout remains usable without horizontal overflow.
- Existing tests continue to pass or are updated for intentional class/structure changes.

## Verification Commands
- `yarn format`
- `yarn lint`
- `yarn typecheck`
- `yarn test`
- `yarn build`

## Out Of Scope
- No fretboard rendering engine changes.
- No learning or quiz feature implementation.
