# 🎙️ Articulate Tour Guide — Concept & Product Spec

> **"A voice-first, interactive AI tour guide that turns passive museum audio tracks into living, two-way conversations. You converse naturally with an expert docent that answers questions in real time and dynamically surfaces relevant maps, archival photos, and artifact details as it speaks."**

---

## 🏛️ Core Value Proposition & Selling Points

The main selling point is **active, multimodal conversational discovery** rather than passive listening:

1. **🗣️ True Two-Way Dialogue (Primary Selling Point)**:
   - Traditional audio guides are static monologues you listen to with a keypad number.
   - Articulate Tour Guide is a live conversational partner powered by AssemblyAI: ask spontaneous questions ("Who actually painted the background?", "Why is the hand positioned like that?"), interrupt naturally, and explore tangents without rigid scripts.
2. **🗺️ Synchronized Visual Direction (Primary Selling Point)**:
   - The agent acts as a live visual director for your visit.
   - As it narrates, it automatically coordinates with the display to project architectural blueprints, comparative artworks, high-resolution close-ups, and spatial maps at the precise moment they are referenced.
3. **🧠 Adaptive Depth & Curiosity Loops**:
   - Seamlessly dials depth up or down based on visitor engagement — from fast highlights for casual visitors, to rich historical anecdotes for curious travelers, to accessible storytelling for families.

### 🎭 The Role of the Expressive Face (Companion Cue, Not the Main Attraction)
- **Subtle & Ambient**: The avatar is **not** the central attraction or gimmick — the museum's artifacts, history, and the visitor's curiosity are the real focus.
- **Conversational Grounding**: It serves as a polished, unobtrusive visual cue that grounds the conversation:
  - Clear conversational states: active listening, thoughtful processing, and speaking.
  - Subtle micro-expressions: sparks of enthusiasm when revealing a breakthrough detail, or a thoughtful pause when considering a nuanced historical inquiry.
  - Designed to complement the artifacts, not compete with them.

---

## 🏛️ The Problem vs. Solution

| Traditional Museum Audio Guides | Articulate Tour Guide |
| :--- | :--- |
| **One-way broadcast**: Pre-recorded script played via keypad number. | **Two-way conversation**: Ask anything, anytime; interrupt naturally. |
| **Disconnected visuals**: Glance at static numbers or look down at text walls. | **Synchronized visual stage**: Dynamic maps, archival overlays, and zoom-ins appear as spoken. |
| **Rigid & non-responsive**: Cannot explain unfamiliar words or answer follow-ups. | **Deeply contextual**: Remembers what you saw 3 rooms ago and draws connections. |
| **Impersonal**: One-size-fits-all monotone delivery. | **Adaptive**: Matches the visitor's curiosity, age, and interests. |

---

## ✨ System Architecture & Key Modules

```
                           +----------------------------+
                           |       Visitor Speech       |
                           +--------------+-------------+
                                          |
                                          v
                        +----------------------------------+
                        |  AssemblyAI Realtime STT / VAD   |
                        +-----------------+----------------+
                                          |
                                          v
                        +----------------------------------+
                        |   Agent Brain (LLM Orchestrator) |
                        |   - Exhibition Knowledge Base    |
                        |   - Tool Dispatcher & Memory     |
                        +-------+------------------+-------+
                                |                  |
       +------------------------+                  +------------------------+
       |                                                                    |
       v                                                                    v
+-------------------------------+                  +--------------------------------+
|       Spoken Interaction      |                  |   Synchronized Visual Stage    |
| - Low-latency Voice Output    |                  | - Dynamic Exhibition Floorplan |
| - Ambient Companion Face      |                  | - High-Res Archival Imagery    |
|   (Subtle cues: listen/speak) |                  | - Interactive Comparative View |
+-------------------------------+                  +--------------------------------+
```

### Module 1: Voice & Dialogue Engine (AssemblyAI)
- Ultra-low latency streaming speech-to-text.
- Fast interruption handling so conversations feel human.
- Structured tool calling to trigger visual events while speaking.

### Module 2: Synchronized Visual Stage (The Visual Hero)
- **Exhibition Map & Wayfinding**: Pinpoints where the visitor is standing and highlights the discussed artifact on a venue layout.
- **Archival Deep Dives**: Surfaces historical photography, architectural sketches, restoration scans, or infrared paint analysis.
- **Visual Callouts**: Directs visitor attention ("Notice the small inscription in the lower-left corner...").

#### 🖼️ Visual Artifact Type Inventory

| Type | Trigger Example | Implementation Note |
| :--- | :--- | :--- |
| **Exhibition Floorplan Map** | *"You are currently in Gallery 4..."* | MapLibre GL + Mapcn blocks with animated waypoint pins |
| **Archival / High-Res Artwork Photo** | *"Here is the full painting in detail..."* | Libraries.dev cinematic image reveal |
| **Architectural Blueprint / Cross-Section** | *"The chapel was originally designed with a lower ceiling..."* | Progressive scan reveal on a line-drawing layer |
| **Infrared / X-Ray Underdrawing Overlay** | *"Beneath the surface, infrared analysis reveals..."* | Slider or CSS fade transition between normal and IR layers |
| **Timeline Scrubber** | *"This cathedral was modified four times between 1200 and 1900..."* | Horizontal era-marker timeline; image updates on scrub |
| **Primary Source Document** | *"Here is the original commission letter signed by de' Medici..."* | Aged parchment render; agent highlights key passage with zoom |
| **Detail Callout / Zoom Annotation** | *"Notice the tiny owl hidden in the lower-left corner..."* | Animated crop zoom with a glowing ring on the focal detail |
| **Historical Context Infographic** | *"Florence had a population of 60,000 at the time..."* | Minimal data visual — population map, date comparison bar |
| **Archive Footage Clip** | *"Here is rare 1920s footage of the gallery before the flood..."* | Short looping video clip surfaced as a media card on the stage |

### Module 3: Ambient Companion Face (Supporting Element)
- Non-intrusive UI element indicating:
  - *Listening*: Gentle visual focus, waiting for user input.
  - *Thinking*: Subtle contemplation cues.
  - *Speaking*: Natural articulation and expressive micro-reactions.

---

## 📋 Hackathon Feature Checklist & Milestones

- [ ] **Phase 1: Real-Time Conversational Voice Core**
  - [ ] AssemblyAI streaming STT integration with low latency
  - [ ] Audio capture, VAD, and seamless interruption handling
  - [ ] Contextual tour knowledge base (sample exhibition: e.g., Renaissance Gallery / Ancient Civilizations)
- [ ] **Phase 2: Synchronized Multimodal Stage (Maps & Imagery)**
  - [ ] Tool calling schema (`display_artifact_media`, `highlight_map_location`, `show_comparison`)
  - [ ] Interactive exhibition map component
  - [ ] High-resolution media viewer synced to speech timestamps
- [ ] **Phase 3: Ambient Companion & Interface Polish**
  - [ ] Clean, museum-grade kiosk/mobile layout
  - [ ] Subtle, ambient companion face component (supporting visual cues)
  - [ ] Audience depth toggle (Quick Tour, Deep Dive, Family Mode)
- [ ] **Phase 4: Deliverables & Submission**
  - [ ] Public GitHub repository with clean setup
  - [ ] Live hosted demo URL
  - [ ] Video demonstration highlighting natural dialogue and live visual synchronization
  - [ ] Presentation slide deck

---

## 💡 Ideation & Research Log

- *Key Insight*: The screen should celebrate the **exhibition and artifacts**, not dominate the space with a giant 3D avatar. The avatar is a companion guide in the corner, while the stage presents rich media that enhances physical viewing.
- *Voice Nuance*: The agent should speak in vivid, engaging, docent-like descriptions rather than reading encyclopedia entries.
