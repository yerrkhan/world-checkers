# World Checkers Design Direction

## Scene
Players use the product during focused evening sessions on laptops and tablets, often switching between active games, tournament listings, and analysis. The default theme should be dark to reduce glare around the board while keeping data legible.

## Color Strategy
Restrained product palette with tinted neutrals and limited accents.

- Base: deep green-black and warm slate neutrals.
- Primary accent: clay gold for primary actions, active navigation, selected controls, and important ratings.
- Secondary semantic accents: olive success, muted red danger, and steel blue information.
- Light mode remains available, but should feel like parchment and ink rather than pure white.

## Typography
Use a system sans stack. Keep UI text compact, legible, and consistent. Body copy should stay below 75 characters where possible. Numeric data uses tabular figures.

## Components
- Navigation: fixed, dense, predictable, with a clear active state.
- Cards and panels: 8px radius or less, subtle borders, no nested-card feel.
- Buttons: one primary clay action, quiet secondary controls, consistent focus states.
- Tables and lists: row hover, clear ranks, avatars, ratings aligned with tabular numerals.
- Boards: stable square dimensions, visible coordinates, tactile pieces, clear selected and target states.

## Motion
Short 150-220ms transitions for hover, selection, and panel reveal. Avoid page-load choreography and decorative motion.

## Accessibility
Maintain visible focus outlines, sufficient contrast in dark and light modes, no text overlap at mobile widths, and reduced-motion support.
