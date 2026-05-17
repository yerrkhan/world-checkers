# World Checkers Design Direction

## Scene
Players use the product during focused evening sessions on laptops and tablets, often switching between active games, tournament listings, puzzles, rankings, and analysis. The product should feel like an arena: immediate, dense, black, tournament-forward, and built around boards in motion.

## Color Strategy
FIDE Online Arena is the primary reference; chess.com is secondary for board clarity and familiar game affordances.

- Base: near-black canvas with subtle green undertones, not panel-heavy.
- Primary accents: arena yellow and electric lime for actions, active tabs, live indicators, and important calls to action.
- Tournament accent: warm brown bars on black timeline grids, with dark text and speed-line details.
- Secondary semantic accents: red for live/current time markers, muted blue only for information states.
- Light mode remains available, but the product identity is dark-first.

## Typography
Use a compact system sans for controls and lists, with condensed uppercase display type for major page titles and arena-scale numbers. Keep letter spacing neutral. Numeric data uses tabular figures.

## Components
- Navigation: fixed, dense, black, left-aligned, and white/yellow like an arena header.
- Cards and panels: avoid decorative cards on content pages; use flat lists, full-width bands, and sharp tool surfaces.
- Buttons: rectangular yellow/lime primary actions, quiet black secondary controls, consistent focus states.
- Tables and lists: flat ranking rows with avatars, ranks, ratings, and tabular numerals.
- Boards: stable square dimensions, direct visual priority, clear selected and target states.
- Tournament timelines: black grid background, brown event bars, red current-time marker, compact tournament metadata.

## Motion
Short 150-220ms transitions for hover, selection, and panel reveal. Avoid page-load choreography and decorative motion.

## Accessibility
Maintain visible focus outlines, sufficient contrast in dark and light modes, no text overlap at mobile widths, and reduced-motion support.
