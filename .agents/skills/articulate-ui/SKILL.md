---
name: articulate-ui
description: Use when building, styling, or reviewing UI components for the Articulate app. Enforces the Perplexity-inspired research-desk design system, Base UI primitives, Hugeicons, and exact padding and color tokens.
---

# Articulate UI & Design System Guide

This skill governs all frontend interface development in Articulate. All components must adhere strictly to the live Perplexity AI research-desk aesthetic, using Base UI (`@base-ui/react`) primitives and Hugeicons.

---

## 1. Color Palette & Tokens

Strictly monochrome ink with warm off-white parchment desk tones. **NEVER use teal, electric blue, purple, or saturated AI gradients.**

| Token | Variable | Value | Purpose |
|-------|----------|-------|---------|
| **Base** | `--color-base` | `#fdfbfa` | Page canvas, main viewport background |
| **Subtle** | `--color-subtle` | `#f5f3ee` | Sidebar background, tab capsule track, subtle hover |
| **Raised** | `--color-raised` | `#ffffff` | Elevated cards, sliding active pill, modals |
| **Soft** | `--color-soft` | `#eae7e1` | Pill badges, active sidebar rows, icon circle backgrounds |
| **Border Subtle** | `--color-border-subtle` | `#e2e0d8` | Structural borders, card borders |
| **Border Subtlest** | `--color-border-subtlest` | `#ece9e2` | Hairline dividers, subtle rings |
| **Primary Text** | `--color-primary` | `#1f1e1b` | Main headings, body text, active state labels |
| **Secondary Text**| `--color-secondary` | `#72706b` | Subheadings, metadata, inactive tab labels |
| **Tertiary Text** | `--color-tertiary` | `#92918b` | Shortcuts, placeholders, collapse chevrons |
| **Button Primary**| `--color-button-bg` | `#1f1e1b` | Voice mode and primary dark action buttons |
| **Button Text**   | `--color-inverse` | `#ffffff` | Pure white text/icons on dark buttons |

---

## 2. Typography & Spacing Rules

- **Font Family**: `Inter` via `--font-sans: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- **Letter Spacing**: Strictly `-0.1px` on all text and buttons. Do NOT use `tracking-tight` which changes it to `-0.025em`.
- **Card Radius**: `rounded-2xl` for main cards and containers, `rounded-xl` for small cards/rows, `rounded-full` for tabs, pills, and icon buttons.

---

## 3. Icon Rules (100% Hugeicons)

- **Icons Source**: Exclusively use `@hugeicons/core-free-icons` rendered through `@/components/ui/hugeicon`.
- **NEVER** use raw `<svg>` elements or Lucide/Heroicons icons.
- **CRITICAL RULE**: **Icons inside dark/black buttons MUST ALWAYS BE PURE WHITE (`#ffffff`).**
  - Always specify `color="#ffffff"` and `className="text-white"` on icons inside `bg-button-bg` or dark buttons.

Example:
```tsx
import { HugeIcon } from "@/components/ui/hugeicon";
import AudioWave01Icon from "@hugeicons/core-free-icons/AudioWave01Icon";

<button className="bg-button-bg text-white rounded-full ...">
  <HugeIcon icon={AudioWave01Icon} size={16} color="#ffffff" className="text-white" />
</button>
```

---

## 4. Reusable UI Components Catalog

All UI components reside in `web/components/ui/`:

### Button (`@/components/ui/button`)
Supports 6 predefined variants:
- `primary`: Dark `#1f1e1b` circular button with pure white icon (e.g. Voice Mode).
- `soft-pill`: Elevated warm pill `bg-soft text-primary hover:bg-subtle` (e.g. "Free plan · Upgrade").
- `outline-pill`: Bordered pill `border border-border-subtle hover:bg-subtle` (e.g. "Upgrade plan" footer).
- `ghost-icon`: Circular icon button `text-secondary hover:text-primary hover:bg-soft` (e.g. mic, search, add).
- `square-icon`: `rounded-lg border border-border-subtle hover:bg-subtle aspect-[9/8]` (e.g. Incognito, Apps).
- `sidebar-row`: Full-width sidebar row `rounded-xl h-10 px-2 group-hover:bg-soft`.

### Tabs (`@/components/ui/tabs`)
Encapsulates `@base-ui/react/tabs` with the exact Perplexity sliding capsule track:
```tsx
import { Tabs, TabsList, Tab } from "@/components/ui/tabs";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import ComputerIcon from "@hugeicons/core-free-icons/ComputerIcon";

<Tabs value={mode} onValueChange={setMode}>
  <TabsList activeValue={mode}>
    <Tab value="search" label="Search" icon={Search01Icon} isSelected={mode === "search"} width={107} />
    <Tab value="computer" label="Computer" icon={ComputerIcon} isSelected={mode === "computer"} width={109} />
  </TabsList>
</Tabs>
```
- Capsule Track: `bg-subtle`, zero padding, `rounded-full`.
- Active Indicator: Sliding white pill (`bg-raised border border-border-subtle shadow-xs`) with smooth transitions.
- Chevron Slot: Automatically expands to 18px on the active tab and collapses to 0px on inactive tabs.

### Card & SuggestionCard (`@/components/ui/card`)
- `Card`: Base `rounded-2xl border border-border-subtle bg-raised shadow-xs ring-1 ring-border-subtlest`.
- `SuggestionCard`: For research prompts and museum exhibit artifact cards.

---

## 5. Ask Input Container Architecture

The central Ask Input is built as a nested grid:
```html
<div class="relative z-[1] grid bg-raised ring-1 ring-border-subtlest pt-3 gap-4 rounded-b-2xl">
  <div class="min-w-0 px-3 grid grid-cols-[1fr_auto] grid-rows-[1fr_auto] pb-3">
    <!-- Row 1: Textarea col-start-1 col-end-3 pb-2 ml-2 mt-1 min-h-[3em] -->
    <!-- Row 2 Left: (+) Button + Mode Tabs capsule -->
    <!-- Row 2 Right: Model Selector + Mic Button + Voice Mode Button -->
  </div>
</div>
```
