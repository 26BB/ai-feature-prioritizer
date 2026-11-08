# Design System: Feature Prioritizer (Retro Paperback Vellum)

The locked design system for 01-Feature-Prioritizer. Formulated for strategic product prioritization (RICE, Kano, Value vs. Effort, MoSCoW) and executive export cards. Bound by Hallmark's strict anti-slop craft floor and presented in a tactile, high-contrast retro paperback light theme.

## 1. System Identity & Philosophy
- **Genre**: editorial / retro-paperback
- **World**: Vintage Paperback & Terracotta Vellum
- **Theme**: Warm Vanilla Cream Paper Base (`#F4ECE1`), Soft Paper Beige (`#FAF4EC`), Pure Solid Card (`#FFFDF9`), with Terracotta Orange (`#F26725`), Mustard Yellow (`#FFDE59`), and Dark Ink Ink (`#1A1613`)
- **Vibe**: "tactile paperbacks, deep carbon ink, tabular RICE formulas, zero dark AI slop"
- **Posture**: Editorial analyst calculation workbench

## 2. Token Architecture (`app/globals.css`)
```css
:root {
  /* Surfaces & Paper Base */
  --bg-base: #F4ECE1;
  --bg-surface: rgba(250, 244, 236, 0.95);
  --bg-surface-solid: #FAF4EC;
  --bg-elevated: #FFFDF9;
  --bg-yellow: #FFDE59;
  --bg-orange: #F26725;

  /* Ink Borders & Hairlines */
  --border-subtle: #D8CCC0;
  --border-bold: #1A1613;
  --border-focus: #F26725;

  /* Pigments */
  --primary: #F26725;
  --primary-light: #FF7E42;
  --secondary: #FFDE59;
  --accent: #E85D26;

  /* High-Contrast Ink Typography */
  --text-primary: #1A1613;
  --text-secondary: #524941;
  --text-muted: #807469;

  /* Typographic Roles */
  --font-headline: var(--font-playfair), 'Playfair Display', Georgia, serif;
  --font-body: var(--font-body-sans), 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'Space Mono', 'Courier New', monospace;
}
```

## 3. Typographic Discipline & Rules
- **Headlines**: Editorial serif or bold sans, deep vintage ink, sentence case, untracked, zero small caps (Hallmark Floor 9).
- **RICE Matrices, Kano Categories & Scores**: `Space Mono` / `font-mono` strictly formatted with `font-variant-numeric: tabular-nums` (`Score: 18.4`, `Reach: 15,000 users/mo`).
- **Prohibitions**: No `transition: all` (Floor 2), `overflow-x: clip` on `html` and `body` (Floor 4).

## 4. Layout & Interaction Standards
- **Containers**: Bounded and centered (`max-width: 1200px`) with growing gutters on large screens (Floor 14).
- **Focus & Motion**: High-contrast `:focus-visible` rings with `@media (prefers-reduced-motion: reduce)` fallbacks for all kinetic text and hover micro-animations.
