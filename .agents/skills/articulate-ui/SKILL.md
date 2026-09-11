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

---

## 4. Reusable Base UI Building Blocks Catalog

All building blocks reside in `web/components/ui/` as composable, atomic units:

### 1. Button (`@/components/ui/button`)
Supports 6 predefined variants:
- `primary`: Dark `#1f1e1b` circular button with pure white icon (e.g. Voice Mode).
- `soft-pill`: Elevated warm pill `bg-soft text-primary hover:bg-subtle` (e.g. "Free plan · Upgrade").
- `outline-pill`: Bordered pill `border border-border-subtle hover:bg-subtle` (e.g. "Upgrade plan" footer).
- `ghost-icon`: Circular icon button `text-secondary hover:text-primary hover:bg-soft` (e.g. mic, search, add).
- `square-icon`: `rounded-lg border border-border-subtle hover:bg-subtle aspect-[9/8]` (e.g. Incognito, Apps).
- `sidebar-row`: Full-width sidebar row `rounded-xl h-10 px-2 group-hover:bg-soft`.

### 2. Input (`@/components/ui/input`)
Wraps `@base-ui/react/input` with sizes (`sm`, `md`, `lg`), `startIcon`, `endIcon`, and error states:
```tsx
<Input placeholder="Search..." startIcon={<HugeIcon icon={Search01Icon} size={15} />} />
```

### 3. Textarea (`@/components/ui/textarea`)
Supports `variant="outline"` (framed inputs) and `variant="ghost"` (seamless zero-border search boxes):
```tsx
<Textarea variant="outline" rows={2} placeholder="Enter prompt..." />
```

### 4. Tabs (`@/components/ui/tabs`)
Encapsulates `@base-ui/react/tabs` with sliding capsule track and dynamic chevron disclosure:
```tsx
<Tabs value={mode} onValueChange={setMode}>
  <TabsList activeValue={mode}>
    <Tab value="search" label="Search" icon={Search01Icon} isSelected={mode === "search"} width={107} />
    <Tab value="computer" label="Computer" icon={ComputerIcon} isSelected={mode === "computer"} width={109} />
  </TabsList>
</Tabs>
```

### 5. Dialog (`@/components/ui/dialog`)
Accessible modal dialogs wrapping `@base-ui/react/dialog`:
- `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogBackdrop`, `DialogPopup`, `DialogTitle`, `DialogDescription`, `DialogCloseButton`.

### 6. Popover (`@/components/ui/popover`)
Floating contextual cards wrapping `@base-ui/react/popover`:
- `Popover`, `PopoverTrigger`, `PopoverPortal`, `PopoverPositioner`, `PopoverPopup`, `PopoverArrow`.

### 7. Tooltip (`@/components/ui/tooltip`)
Dark capsule tooltips wrapping `@base-ui/react/tooltip`:
- `Tooltip`, `TooltipTrigger`, `TooltipPortal`, `TooltipPositioner`, `TooltipPopup`, `TooltipProvider`.

### 8. Menu (`@/components/ui/menu`)
Dropdown action menus wrapping `@base-ui/react/menu`:
- `Menu`, `MenuTrigger`, `MenuPortal`, `MenuPositioner`, `MenuPopup`, `MenuItem`, `MenuGroup`, `MenuGroupLabel`, `MenuSeparator`.

### 9. Select (`@/components/ui/select`)
Dropdown selection menus wrapping `@base-ui/react/select`:
- `Select`, `SelectTrigger`, `SelectValue`, `SelectPortal`, `SelectPositioner`, `SelectPopup`, `SelectItem`.

### 10. Switch (`@/components/ui/switch`)
Accessible toggles wrapping `@base-ui/react/switch`:
- `Switch` (with `data-[checked]:bg-primary`).

### 11. Checkbox (`@/components/ui/checkbox`)
Accessible checkboxes wrapping `@base-ui/react/checkbox`:
- `Checkbox` (renders pure white checkmark on primary ink background).

### 12. Badge (`@/components/ui/badge`)
Atomic tags: `variant="soft" | "outline" | "raised" | "dark" | "error"`.

### 13. Card (`@/components/ui/card`)
Atomic container: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `SuggestionCard`.

### 14. Separator (`@/components/ui/separator`)
Divider: `Separator` (horizontal or vertical hairline divider `bg-border-subtlest`).

### 15. HugeIcon (`@/components/ui/hugeicon`)
Icon renderer for `@hugeicons/core-free-icons` guaranteeing pure white stroke on black buttons.

