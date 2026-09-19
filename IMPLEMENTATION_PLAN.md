# 🏛️ Articulate Tour Guide — Feature Implementation Plan & Checklist

> **Living document.** Items move from discussion → agreed → in progress → done.
> Update this file as work progresses.
> Last updated: 2026-09-19

---

## Legend

- `[ ]` Not started
- `[/]` In progress
- `[x]` Done
- `[?]` Still discussing / needs decision

---

## ✅ AGREED — Ready to Implement

### 1. Artifact Stage — Cross-fade Transition Animation

**Status:** `[x]` Done
**File:** [`artifact-stage.tsx`](file:///d:/articulate-tour-guide/web/components/artifacts/artifact-stage.tsx)

When the active artifact switches (Info → Hotspots, etc.), the transition should feel cinematic — not a hard swap.

**Approach:**
- Use CSS `@keyframes` with a key-based unmount/mount pattern. No heavy library needed.
- On `artifactType` change: outgoing artifact fades out + translates up slightly, incoming fades in + translates up from below.
- Duration: 220ms out, 280ms in, 40ms gap.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` — spring-feel, matches existing sidebar.
- Use React `key` prop on the artifact wrapper to force unmount/remount on type change.

**Libraries:**
- [libraries.dev](https://libraries.dev) — Border Beam could highlight active artifact card edge during transition (pro tier, evaluate separately).
- Pure CSS keyframes is sufficient for the core cross-fade.

**Checklist:**
- `[x]` Add wrapper div with `key={artifactType}` in `artifact-stage.tsx`
- `[x]` Write `@keyframes artifactIn` and `@keyframes artifactOut` in `globals.css`
- `[x]` Apply `animation: artifactIn 300ms cubic-bezier(0.16, 1, 0.3, 1) both` on mount
- `[ ]` Test all 5 artifact transitions at 60fps
- `[ ]` Verify no layout shift (dimensions pre-reserved)

---

### 2. Artifact Stage — Non-Loading Skeleton State

**Status:** `[ ]`
**Files:** [`artifact-stage.tsx`](file:///d:/articulate-tour-guide/web/components/artifacts/artifact-stage.tsx), [`page.tsx`](file:///d:/articulate-tour-guide/web/app/page.tsx)

When a tool call fires, the stage should immediately show a skeleton — not wait for the full component to resolve.

**Approach:**
- Add `isLoading: boolean` to `ArtifactStageProps`.
- When `isLoading=true`, render a skeleton overlay that matches the layout geometry of each specific artifact (not a generic spinner).
- Skeletons: info card = image block + metadata rows; map = SVG box + route pill; hotspots = zoomed image + reticle ghost ring; comparison = two image boxes; timeline = 5 era cards.
- Use `bg-muted animate-pulse` shimmer — CSS only, zero library cost.
- On `tool.result`, `isLoading` flips to `false`, skeleton fades out, real content fades in.

**AICSS.dev references:**
- [aicss.dev/components/image-generation](https://aicss.dev/components/image-generation) — Image Processing loading pattern (Pro, worth studying for inspiration).
- [aicss.dev/components/thinking-state](https://aicss.dev/components/thinking-state) — Free. Use thinking dots in the artifact header while loading, not as a full-screen blocker.

**Checklist:**
- `[x]` Add `isLoading` prop to `ArtifactStageProps`
- `[x]` Build `ArtifactSkeleton` component with 5 layout-matched variants
- `[ ]` Wire `isLoading` in `page.tsx` to `tool.call` / `tool.result` events (once voice is wired)
- `[x]` For now: expose `isLoading` toggle in footer dev tabs for manual testing
- `[x]` Ensure skeleton dimensions exactly match live content (no layout shift)

---

### 3. Chat History Artifact — "chat" Tab

**Status:** `[x]` Done
**New file:** `web/components/artifacts/chat-history-view.tsx`
**Modify:** [`artifact-stage.tsx`](file:///d:/articulate-tour-guide/web/components/artifacts/artifact-stage.tsx), [`page.tsx`](file:///d:/articulate-tour-guide/web/app/page.tsx)

**UX contract:**
- Clicking Mr. Triangle when card is **closed** → opens card **defaulted to "chat" tab**.
- Clicking Mr. Triangle when card is **already open** → closes it (current behavior, keep).
- Tab bar in the footer gets a new "Chat" entry.

**What the Chat view shows:**
1. **Visitor partial transcript** (right-aligned, italic, gray bubble) — updates in real-time as visitor speaks. Always replace the partial, never append.
2. **Visitor final transcript** (right-aligned, full opacity, timestamp).
3. **Mr. Triangle thinking state** (left-aligned, AICSS thinking dots) — shown while `agentStatus === "thinking"`.
4. **Mr. Triangle response** (left-aligned bubble, Mr. T avatar icon) — text streams in word-by-word from `transcript.agent.delta`.
5. **Tool call badge** (inline pill between messages) — e.g. `🗺 Map: Gallery 37` or `🔍 Zoom: Cypress`. Tells visitor why the screen just changed.
6. Auto-scrolls to bottom on new content. Smooth scroll, not instant jump.

**Libraries & Components:**
- **shadcn chat components** ([`chat-bubble.tsx`](file:///d:/articulate-tour-guide/web/components/ui/chat-bubble.tsx), [`chat-message-list.tsx`](file:///d:/articulate-tour-guide/web/components/ui/chat-message-list.tsx)) — Standard accessible chat bubbles (`sent`/`received`), avatars, timestamps, and auto-scrolling message list.
- [beautifului.dev — Thinking](https://www.beautifului.dev/#thinking-state) ([`ThinkingState.tsx`](file:///d:/articulate-tour-guide/web/components/beautiful-ui/ThinkingState.tsx)) — Museum archives consulting trace with Hugeicons.
- [beautifului.dev — Streaming Text](https://www.beautifului.dev/#streaming-text) ([`StreamingText.tsx`](file:///d:/articulate-tour-guide/web/components/beautiful-ui/StreamingText.tsx)) — Spoken transcript streaming with inline artifact triggers (opens corresponding artifact on the visual stage) and replay/copy audio controls.
- [beautifului.dev — Tool Chips](https://www.beautifului.dev/#tool-chips) ([`ToolChips.tsx`](file:///d:/articulate-tour-guide/web/components/beautiful-ui/ToolChips.tsx)) — Displays the visual tool call the agent made in chat mode with an interactive "View Artifact" button to display it.

**State shape:**
```typescript
type ChatMessage =
  | { id: string; role: "visitor"; text: string; isPartial?: boolean; timestamp: Date }
  | { id: string; role: "agent"; text: string; isStreaming?: boolean; timestamp: Date; artifactTokens?: StreamingToken[] }
  | { id: string; role: "tool"; toolName: string; label: string; timestamp: Date; artifactType?: ArtifactTarget; params?: Record<string, any>; detail?: string };
```

**Checklist:**
- `[x]` Add `"chat"` to `ArtifactType` union in `artifact-stage.tsx`
- `[x]` Add `chatMessages: ChatMessage[]` state + setter to `page.tsx`
- `[x]` Update `handleToggleExpanded` to default to `"chat"` when opening
- `[x]` Implement standard **shadcn chat** primitives (`ChatBubble`, `ChatMessageList`, `ChatBubbleAvatar`, `ChatBubbleMessage`, etc.)
- `[x]` Remove voice follow-ups from `StreamingText` and connect inline artifact links to stage switching
- `[x]` Display agent artifact calls in chat mode with "View Artifact" stage navigation in `ToolChips`
- `[x]` Sync `ChatSkeleton` in `artifact-skeleton.tsx` to match shadcn chat geometry
- `[x]` Wire to pre-scripted demo messages with interactive artifact triggers for testing without live voice
- `[ ]` Wire to real `transcript.user.delta`, `transcript.agent.delta`, `tool.call` events when voice is live
- `[x]` Add "Chat" tab to footer `TabsList`

---

### 4. Quote / Letter Pull Artifact

**Status:** `[ ]`
**New file:** `web/components/artifacts/quote-view.tsx`
**Modify:** `web/lib/demo-tour-data.ts`

**Voice triggers:**
- "What did Van Gogh write about this?"
- "Did he say anything about the stars?"
- "What did he tell Theo?"

**Layout — two zones:**
- **Left (60%)**: Letter fragment. Parchment background (`#f5f0e8`), serif italic font (EB Garamond or Playfair Display from Google Fonts), generous line-height. Quote text renders word-by-word with AICSS Streaming Text animation as if being read aloud.
- **Right (40%)**: Attribution card — letter number, recipient, date, location, small sepia-toned thumbnail of the letter page.

**Letter data to add to `demo-tour-data.ts`:**
```typescript
export const VANGOGH_LETTERS = [
  {
    id: "letter-782",
    recipient: "Theo van Gogh",
    date: "June 1889",
    location: "Saint-Rémy-de-Provence",
    excerpt: "This morning I saw the countryside from my window a long time before sunrise, with nothing but the morning star, which looked very big.",
    context: "Written at Saint-Paul-de-Mausole asylum, shortly after completing The Starry Night.",
    letterRef: "Letter 782 (Van Gogh Museum Archive)",
  },
  {
    id: "letter-cypress",
    recipient: "Theo van Gogh",
    date: "June 25, 1889",
    location: "Saint-Rémy-de-Provence",
    excerpt: "The cypresses are always occupying my thoughts. I should like to make something of them like the canvases of the sunflowers.",
    context: "Written weeks before The Starry Night — revealing his obsession with the cypress as a subject.",
    letterRef: "Letter 783 (Van Gogh Museum Archive)",
  },
];
```

**Checklist:**
- `[ ]` Add `"quote"` to `ArtifactType` union
- `[ ]` Add `VANGOGH_LETTERS` data to `demo-tour-data.ts`
- `[ ]` Build `QuoteView` component with parchment left + attribution right
- `[ ]` Import EB Garamond or Playfair Display via Google Fonts
- `[ ]` Add streaming word-by-word text animation (~40ms per word)
- `[ ]` Add `activeLetterId` prop (default: `"letter-782"`)
- `[ ]` Register `show_quote` tool in `TOUR_TOOLS` for future voice wiring
- `[ ]` Add "Quote" tab to footer dev tabs

---

## 🔲 BACKLOG — Good Ideas, Not Yet Discussed in Detail

### 5. Interactive Experience — Technique / Brushstroke View

**Status:** `[ ]` — Deferred. Add if time allows post-core-features.

**What we agreed:**
- The visitor should be able to *experience* the impasto — the physical reality of how The Starry Night was made.
- It must feel interactive, not passive.
- Voice-triggered: "Show me the brushwork" / "How did he apply the paint?"

**Interaction types explored (pick one when ready):**
- **Paint-to-Reveal** — Canvas `destination-out` mask, visitor scratches away a dark layer to uncover the painting
- **Torch/Spotlight** — CSS radial-gradient follows cursor, painting revealed in a moving circle of light
- **Fluid Ripple** — SVG `feTurbulence` or WebGL displacement on pointer position, sky literally undulates
- **Drag-to-Compare Curtain** — Upgrade to the existing comparison view, `clip-path` scrubber between sketch and oil
- **Paint-Along** — Blank canvas, visitor draws their own Van Gogh sky using `p5.brush.js` impasto simulation

**When ready:**
- `[ ]` Pick one interaction type from the list above
- `[ ]` Add `"brushstroke"` to `ArtifactType` union
- `[ ]` Build `BrushstrokeView` component
- `[ ]` Register `show_brushstroke` tool in `TOUR_TOOLS`

---

### 6. Voice → `setActiveArtifact` Wiring

All artifacts exist but no tool call drives them yet. `AgentClient` + `useVisualSync` hook from the architecture guide need implementing and connecting to `page.tsx`.

**Checklist:**
- `[ ]` Implement `AgentClient` WebSocket class (`lib/assemblyai/AgentClient.ts`)
- `[ ]` Implement `useVisualSync` hook (`hooks/useVisualSync.ts`)
- `[ ]` Connect `tool.call` → `setActiveArtifact`, `setActiveMapRoute`, `setActiveHotspotId`
- `[ ]` Connect `transcript.user.delta` → `chatMessages` partial visitor bubble
- `[ ]` Connect `transcript.agent.delta` → `chatMessages` streaming agent bubble
- `[ ]` Connect `reply.started` / `reply.done` → `agentStatus`

---

### 7. Live Caption Strip

A narrow `aria-live` strip at the bottom of the stage showing the current agent caption in real time. Mentioned in the architecture guide as `LiveTranscript` — not yet built.

---

### 8. Influence Ripple Artifact (P2 / post-hackathon)

When visitor asks "Who was influenced by this?" — show Starry Night's cultural fingerprint: Munch's The Scream, Kandinsky, Don McLean's Vincent (1971). A visual mood board / influence timeline.

---

## 📦 Library Decision Summary

| Library | Use Case | Decision | Tier |
|---|---|---|---|
| AICSS — Streaming Text | Agent word-by-word reveal in Chat view | ✅ Use it | Free |
| AICSS — Thinking State | Thinking dots in Chat | ✅ Use it | Free |
| AICSS — Thinking + Reasoning | Tool call badge pill in Chat | ✅ Use it | Free |
| AICSS — Audio Waves | Replace status dots with live waveform | Consider | Pro |
| libraries.dev — Border Beam | Highlight active artifact card edge on transition | Consider | Pro |
| libraries.dev — Gooey / Metal | Brushstroke Option B paint texture | Consider | Pro |
| libraries.dev — Image Reveal | Artifact reveal animation on tool.call | Consider | Pro |
| interior.dev | Spring physics on artifact expand/collapse | Consider | Free |
| CSS keyframes | Artifact cross-fade transition | ✅ Use it | Built-in |

---

## 🎯 Recommended Sprint Order

| # | Feature | Est. Time | Why Now |
|---|---|---|---|
| 1 | Transition animation | 2-3 hrs | Pure CSS, immediate improvement, zero risk |
| 2 | Skeleton state | 2-3 hrs | Structural foundation before voice wiring |
| 3 | Chat history view | 4-6 hrs | Highest demo impact, unlocks Mr. T tap behavior |
| 4 | Quote / Letter Pull | 3-4 hrs | Emotionally powerful, fast to build |
| 5 | Voice wiring | Ongoing | Connects everything together |
| — | Interactive experience | If time allows | Backlog — 5 options noted |
