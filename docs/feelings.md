# Mr. Triangle: Feelings & Expressions Specification

This document details the feelings, expressions, visual traits, and animation behaviors of **Mr. Triangle** (`Blobatar` shape: `0.99`), the voice tour guide for Articulate.

---

## 1. Core Principles

1. **Rock-Solid Body Invariance**:
   - The triangular body geometry is **100% immutable** across every emotion (`bdy: 0`, no container squashing, and no body scaling).
   - Expressions are conveyed solely through eye transformations (scale, tilt, offset, shape) and dedicated overlay layers (e.g., blushing).
2. **Clean Minimalism**:
   - No eyebrows, no radiating dash lines, no ambient rings, and no external accessories.
   - Clean research-desk aesthetic adhering strictly to the Articulate UI design system.
3. **Smooth Choreographed Transitions**:
   - Transitions between emotions are interpolated with soft spring physics.
   - Expression overlays (such as the shy blushing) are synchronized with the eye morph timings.

---

## 2. Expressions Catalog

Below is the complete inventory of the 11 supported feelings:

| Feeling / ID | Label | Visual Characteristics | Best Used When |
| :--- | :--- | :--- | :--- |
| `listening` | **Listening** | Wide, tall, alert eyes (`esx: 1.28`, `esy: 1.42`, `tilt: -3`, `edy: -1.8`) with a gentle eye-flutter blink animation. | User is speaking or microphone is active. |
| `thinking` | **Thinking** | Thoughtful upward and sideways gaze (`bdy: 0` fixed). Accompanied by rotating Sparkles indicator in UI. | Query processing, tool calling, or synthesizing tour guide responses. |
| `speaking` | **Speaking** | Natural, friendly, communicative gaze with subtle asymmetrical eye balance (`esx: 1.08`, `esy: 0.98`, `tilt: 2`). Accompanied by animated audio wave bars. | TTS voice playback or tour narration. |
| `neutral` | **Neutral** | Balanced, calm baseline posture (`esx: 1.05`, `esy: 1.0`, zero tilt or displacement). | Resting or idle tour state. |
| `excited` | **Excited** | Joyful smiling curved arcs `^ ^` (`isCurvedEyes: true`). Default capsule eyes are hidden (`.curved-eyes-mode`) to ensure zero eyebrow overlap. | Welcoming the visitor, sharing fun facts, or celebrating discoveries. |
| `curious` | **Curious** | Inquisitive gaze with pronounced opposing eye tilts (`tilt: 16`, `tilt2: -32`, `edy: -1.2`). | Asking the visitor questions or exploring new topics. |
| `interested` | **Interested** | Leaning-in, attentive posture with lifted open eyes (`esx: 1.25`, `esy: 1.28`, `edy: -1.4`). | Highlighting landmark features or acknowledging user interests. |
| `focused` | **Focused** | Narrowed, highly observant eyes (`esx: 1.42`, `esy: 0.42`, `edy: 0.5`). | Inspecting fine details on a map, artifact, or research card. |
| `surprised` | **Surprised** | Popped, wide-eyed astonishment (`bdy: 0` fixed). | Highlighting startling historical trivia or unexpected tour reveals. |
| `confused` | **Confused** | Puzzled, questioning look with uneven eye height and opposing angles (`tilt: 14`, `tilt2: -28`, `edy2: 2.8`). | Handling unclear audio input or asking the user to clarify. |
| `shy` | **Shy** | Soft, lowered inward gaze (`esx: 0.82`, `esy: 0.72`, `tilt: 8`, `edy: 3.2`) paired with a dynamic pastel pink blush gradient blooming at the tip. | Modest reactions, receiving compliments, or admitting uncertainty. |

---

## 3. Special Expression Mechanics

### 3.1 Smiling Curved Eyes (`excited`)
- When `isCurvedEyes: true` is active, the `.curved-eyes-mode` CSS class hides Blobatar's default capsule eyes (`.mo-eyes { opacity: 0 !important; visibility: hidden !important; }`).
- A dedicated SVG overlay renders twin curved smiling arcs (`^ ^`):
  ```svg
  <path d="M 36 53.5 Q 42 46.5 48 53.5" />
  <path d="M 52 53.5 Q 58 46.5 64 53.5" />
  ```
- **Benefit**: Completely eliminates the awkward "eyebrow floating over capsule eye" problem, ensuring the curve *is* the eye.

### 3.2 Soft Tip-to-2/3 Blush Gradient (`shy`)
- **Visual Description**: A soft pastel pink blush (`#ffa6be` at `0.65` opacity) glowing at the head apex, gently fading down to super light / transparent at **2/3 of the guy** (`Y = 52%`, cheek/eye level). The bottom 1/3 remains clean.
- **Gradient Formulation**:
  ```svg
  <linearGradient id="blush-shy-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="12%" stopColor="#ffa6be" stopOpacity="0.65" />
    <stop offset="25%" stopColor="#ffb8cb" stopOpacity="0.45" />
    <stop offset="38%" stopColor="#ffd1dd" stopOpacity="0.2" />
    <stop offset="52%" stopColor="#ffeef4" stopOpacity="0" />
    <stop offset="100%" stopColor="#ffeef4" stopOpacity="0" />
  </linearGradient>
  ```
- **Choreographed Fade-In**:
  - The blushing layer is persistently mounted in the SVG to maintain DOM continuity.
  - As the eyes animate down into the shy gaze, the blush fades in smoothly with a gentle delay (`transition-opacity ease-out duration-700 delay-150`), perfectly synchronizing with the eye morph.

---

## 4. Developer Usage & API

Expressions can be imported and utilized in components via:

```tsx
import { ArticulateAvatar } from "@/components/avatar/articulate-avatar";
import { type ExpressionId } from "@/components/avatar/avatar-expressions";

export function TourGuide() {
  return (
    <ArticulateAvatar
      expressionId="shy"
      size={220}
      isDocked={false}
      isListening={false}
    />
  );
}
```

### Supported `ExpressionId` Types:
```ts
type ExpressionId =
  | "listening"
  | "thinking"
  | "speaking"
  | "neutral"
  | "excited"
  | "curious"
  | "interested"
  | "focused"
  | "surprised"
  | "confused"
  | "shy";
```
