# Design System & UI Rules for Articulate

## Visual Aesthetic & Theme
- The interface strictly adheres to the Perplexity AI research-desk aesthetic.
- Canvas background is `#fdfbfa` (`--color-base` / `bg-base`).
- Primary actions and highlights are strictly monochrome ink (`#1f1e1b`). NEVER use teal, electric blue, or purple.
- Typography is Inter with strictly `-0.1px` letter-spacing.

## Component Usage
- Always use reusable primitives from `web/components/ui/` (`Button`, `Tabs`, `Tab`, `TabsList`, `Card`, `HugeIcon`).
- Never build ad-hoc custom buttons or raw divs when reusable components exist.

## Icon Rules
- 100% of icons must come from `@hugeicons/core-free-icons` via `@/components/ui/hugeicon`.
- **CRITICAL**: Any icon rendered inside a dark or black button (e.g. `bg-button-bg`, `#1f1e1b`) **MUST BE PURE WHITE (`#ffffff`)**. Always set `color="#ffffff"` and `className="text-white"`.

## Mode Tabs Capsule
- Must use the sliding indicator capsule track from `@/components/ui/tabs`.
- Active tab pill must be elevated white (`bg-raised border border-border-subtle shadow-xs`).
- Do not introduce visual glitches or unmeasured indicators.
