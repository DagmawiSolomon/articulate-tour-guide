# 🏛️ Articulate Tour Guide — MVP Product Requirements Document (PRD)

> **Document Version**: `v1.0.0`  
> **Status**: Approved for Development  
> **Target Event**: AssemblyAI Voice Agent Hackathon (September 2026)  
> **Primary Objective**: Build, validate, and demo a production-grade, multimodal AI museum docent with sub-600ms latency and synchronized visual stage manipulation.

---

## 1. Executive Summary & Vision

**Articulate Tour Guide** transforms passive museum audio tours into active, two-way conversational discovery. Powered by AssemblyAI’s Voice Agent API over a single persistent WebSocket, visitors converse naturally with an adaptive AI docent on their own smartphones (zero app download). As the agent speaks, it autonomously dispatches JSON tool calls that synchronously project floorplans, infrared underdrawings, high-res scans, and detail callouts onto the **Synchronized Visual Stage**.

### The Core Hackathon Thesis
Win top honors by proving three things to the judges:
1. **Deep Application of Technology**: Native exploitation of AssemblyAI’s Voice Agent API (Universal-3 Pro STT, semantic turn detection, keyterm boosting, real-time barge-in interruption).
2. **Breakthrough Multimodal UX**: Voice guides the narrative, visuals ground the cognitive proof (<600ms latency).
3. **Airtight Commercial Viability**: $1.50 tour inference cost, 70–81% gross margins, and a 2.7-month museum payback period replacing legacy $500 hardware wands.

---

## 2. Core Concerns, Edge Cases & Technical Guardrails

Before scoping features, we establish non-negotiable architectural guardrails based on our pre-mortem audit:

| Critical Concern | Root Cause | Engineering Guardrail (Must Enforce) |
| :--- | :--- | :--- |
| **Scope Trap (9 Artifacts at Once)** | Attempting all 9 artifacts in week 1 leads to 9 mediocre components. | **P0/P1/P2 Phasing**: Focus MVP exclusively on the **Top 4 "Showstopper" Artifacts** (Map, Photo, Pentimento Slider, Detail Zoom). |
| **Acoustic Feedback Loop** | Judge tests on laptop speakers without headphones; mic hears TTS and enters infinite self-interruption loop. | Enforce browser AEC (`echoCancellation: true, noiseSuppression: true, autoGainControl: true`) + half-duplex audio gating during TTS playback. |
| **iOS Safari Audio Lockdown** | Mobile Safari blocks Web Audio context unless unlocked synchronously by user interaction. | Initialize and `.resume()` `AudioContext` and prime mic permission synchronously on the initial **"Start Tour"** tap. |
| **Spatial Hallucination** | LLMs hallucinate `{x, y}` bounding boxes when asked to point at details on a painting. | **Zero-Hallucination Policy**: Pre-calculate bounding boxes in `artifacts.json`. The LLM only passes semantic keys (`detail_id: "goldfinch"`). |
| **Asset Latency Stalls** | High-res images take 1.5s to load, lagging behind instant TTS audio. | **Optimistic Hydration**: Render layout bounds and blur-up skeleton ≤50ms after `tool.call`, well before full asset bytes finish. |
| **Cold-Start Demo Death** | Free-tier backend takes 45s to spin up; judges bounce immediately. | Deploy ephemeral token route on Vercel/Netlify Edge Functions (<100ms cold start) with public guest access (no login required). |

---

## 3. Scope & Feature Prioritization Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             MVP PRIORITY TIERS                              │
├────────────────────────┬──────────────────────────┬─────────────────────────┤
│    P0: Must-Have       │     P1: Should-Have      │     P2: Post-Hackathon  │
│    (Core MVP Demo)     │   (Second-Wave Polish)   │       (V2 Expansion)    │
├────────────────────────┼──────────────────────────┼─────────────────────────┤
│ • AssemblyAI Voice WS  │ • Artifact 3: Blueprint  │ • Artifact 8: Infographic│
│ • Artifact 1: Floorplan│ • Artifact 5: Timeline   │ • Artifact 9: Footage   │
│ • Artifact 2: Photo    │ • Artifact 6: Document   │ • Curatorial Studio CMS │
│ • Artifact 4: Pentimento│ • Dynamic Gallery Update │ • Multi-Language Auto   │
│ • Artifact 7: Detail   │ • Visitor Pin State Lock │ • Tessitura Ticketing   │
│ • Expressive Companion │ • Cuelume Procedural Cues│ • Physical Kiosk Mode   │
│ • Live Transcript Bar  │                          │                         │
│ • Zero-Auth Guest Token│                          │                         │
│ • Audience Depth Toggle│                          │                         │
│   (Base UI Tabs)       │                          │                         │
│ • 2-Tier RAG & Tone    │                          │                         │
│   Adaptation           │                          │                         │
└────────────────────────┴──────────────────────────┴─────────────────────────┘
```

---

## 4. P0 Functional Specifications (The Core MVP)

### 4.1 Module 1: Conversational Voice Pipeline (AssemblyAI)
* **WebSocket Connection**: Direct client-to-AssemblyAI WebSocket using temporary bearer tokens vended by `/api/token`.
* **Turn Detection Configuration**:
  ```json
  {
    "mode": "balanced",
    "min_silence": 600,
    "max_silence": 1500,
    "interrupt_response": true,
    "voice_focus": "far-field"
  }
  ```
* **Vocabulary Boosting**: Injected `keyterms_prompt` (50+ Renaissance art terms: *sfumato, chiaroscuro, Botticelli, Uffizi, pentimento, Medici*) and domain-specific `transcription_prompt`.
* **Barge-In (Interruption)**: Instant clearing of Web Audio playback buffers when visitor speaks mid-narration.
* **Knowledge & RAG**: 
  - *Tier 1 (In-Context Core)*: 0ms latency pre-loaded exhibition manifest in LLM prompt.
  - *Tier 2 (Tool-Calling RAG)*: `query_archives` tool for deep archival questions.
* **Adaptive Persona**: Explicit audience depth toggle (Highlights / Deep Dive / Family) combined with real-time prompt tone-mirroring.

### 4.2 Module 2: The Synchronized Visual Stage (Top 4 Artifacts)

#### Artifact 1: Interactive Exhibition Floorplan (`ExhibitionMap.tsx`)
* **Visual**: Vector SVG floorplan of the Florence Uffizi Gallery (Room 1: Entrance, Room 2: Botticelli, Room 3: Leonardo Studio).
* **Behavior**: Active room pulses with a luminous beacon ring (`#00D4FF`).
* **Tool Call**: `show_floorplan(active_room_id, waypoint_to?)`.

#### Artifact 2: Archival High-Resolution Artwork Viewer (`ArchivalViewer.tsx`)
* **Visual**: Museum-grade artwork display with modernist accession placard (Artist, Title, Medium, Provenance).
* **Behavior**: Progressive blur-up reveal on entry; drag-to-pan and wheel-zoom controls.
* **Tool Call**: `show_artwork(artwork_id, initial_zoom?)`.

#### Artifact 4: Infrared / X-Ray Pentimento Slider (`OverlaySlider.tsx`)
* **Visual**: Split comparison between visible light oil painting and underlying infrared underdrawing (e.g., Leonardo's *Annunciation* or Botticelli's *Venus*).
* **Behavior**:
  - **Auto-Sweep Intro**: Sweeps from 0% to 50% over 500ms on tool invocation to demonstrate the reveal.
  - **Tactile Drag**: Visitor can drag the vertical divider smoothly across the canvas (`clip-path: inset()`).
* **Tool Call**: `show_underdrawing(artwork_id, spectral_mode: "infrared" | "xray")`.

#### Artifact 7: Detail Callout with Dynamic Leader Lines (`DetailCallout.tsx`)
* **Visual**: Master artwork scales to 55%; a circular magnified crop focuses on the focal detail.
* **Behavior**: Luminous reticle on the artwork connects to the callout card via an animated SVG Bezier leader line.
* **Tool Call**: `show_detail_callout(artwork_id, detail_id, callout_text)`.

### 4.3 Module 3: Ambient Companion Docent (`DocentAvatar.tsx`)
* **Visual**: Lightweight geometric SVG character (`blobatar`) anchored in the bottom corner.
* **States**:
  - `idle`: Gentle breathing, natural eye saccades.
  - `listening`: Gaze locks forward, shape tilts curiously.
  - `thinking`: Eyes look upward-left, subtle aura shimmer.
  - `speaking`: Warm docent expression, rhythmic cadence pulse.

### 4.4 Module 4: Live Transcript & Interaction Strip
* **Streaming Text**: Subtitle strip rendering partial and final transcripts with word-level streaming.
* **Tool Execution Pill**: Micro-badge displaying active tool invocations (e.g., `⚡ Tool: Revealing Infrared Scan`).
* **Controls**:
  - Prominent Mute/Unmute Mic button, Interrupt button, and Reset Session button with Hugeicons.
  - Base UI Audience Depth Switcher (`Highlights` | `Deep Dive` | `Family & Kids`).

---

## 5. Non-Functional Requirements & Performance Budgets

| Metric | Target Budget | Verification Method |
| :--- | :--- | :--- |
| **End-to-End Voice Latency** | < 800ms (Audio input → TTS playback) | Network tab + audio timestamp logging |
| **Visual Stage Transition** | < 150ms skeleton / < 400ms asset | Performance profiler composite audit |
| **Initial Bundle Size** | < 350KB gzipped | Next.js bundle analyzer |
| **Frame Rate** | 60 FPS continuous during drag/pan | Chrome DevTools FPS meter |
| **Device Compatibility** | iOS 16+ (Safari), Android 12+ (Chrome), Desktop Chrome/Safari/Edge | Real-device cross-browser testing |

---

## 6. Curated Demo Scenario (The 180-Second Winning Flow)

To ensure an unbeatable hackathon submission video, the MVP dataset focuses on the **Uffizi Renaissance Wing**:

1. **Stop 1: Arrival & Orientation (0:00–0:40)**
   * Visitor clicks "Start Tour" (AudioContext unlocked).
   * Agent welcomes visitor, triggers `show_floorplan(active_room_id: "room_2_botticelli")`.
   * Map displays Room 2 with a pulsing cyan beacon.
2. **Stop 2: The Masterpiece & The Secret Underdrawing (0:40–1:20)**
   * Visitor asks: *"What makes the Birth of Venus so revolutionary?"*
   * Agent explains the tempera technique and dispatches `show_artwork(artwork_id: "birth_of_venus")`.
   * Agent says: *"Conservators made a startling discovery beneath the paint surface..."* and dispatches `show_underdrawing(artwork_id: "birth_of_venus", spectral_mode: "infrared")`.
   * The split slider auto-reveals the charcoal pentimento sketch in real time.
3. **Stop 3: Barge-In Interruption & Detail Inspection (1:20–1:50)**
   * While the agent is speaking, the visitor interrupts: *"Wait, what is that flower in the corner?"*
   * Agent pauses TTS immediately, acknowledges the question without lagging, and dispatches `show_detail_callout(artwork_id: "birth_of_venus", detail_id: "rose_petals", callout_text: "Myrtle roses representing divine love")`.
   * The artwork scales back and an animated bezier leader line points directly to the rose.
4. **Stop 4: Technology & Commercial Close (1:50–3:00)**
   * Brief presentation of AssemblyAI Voice Agent API integration, 2.7-month museum payback model, and zero-install BYOD architecture.

---

## 7. Version History & Evolution

| Version | Date | Status | Changes |
| :--- | :--- | :--- | :--- |
| **`v1.0.0`** | September 2026 | **Active** | Initial MVP PRD defining P0 core features (Voice Agent WS + Top 4 Artifacts + Blobatar + Uffizi demo dataset). |
| `v2.0.0` | Planned | Backlog | Artifacts 3, 5, 6, 8, 9; Curatorial CMS import; multi-museum database routing. |
