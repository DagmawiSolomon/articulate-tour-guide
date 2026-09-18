# 🏛️ Articulate Tour Guide — Exhibition Demo Tour Plan

> **Exhibition**: *"The Restless Canvas: Van Gogh at Saint-Rémy & Auvers"*  
> **Location**: Musée d'Orsay, Paris — Level 5 Post-Impressionism Pavilion (Gallery 36)  
> **Featured Masterpiece**: *The Starry Night / Self-Portrait (1889)* by Vincent van Gogh  
> **AI Docent**: Mr. Triangle (Powered by AssemblyAI Real-Time Voice Intelligence)

---

## 🎯 Demo Purpose & Core Thesis

As outlined in [`IDEA.md`](file:///d:/articulate-tour-guide/IDEA.md), traditional museum audio guides are rigid, one-way monologues keyed to numbers on a wall.

This demo tour proves the **Articulate Tour Guide** thesis:
1. **Zero-Button, Pure Voice-Driven UI**: The visitor simply speaks. There are no cluttered tabs, filter pills, or navigation buttons. The visual stage acts as Mr. Triangle's dynamic projection board that responds seamlessly to conversational intent.
2. **Context-Aware Visual Stage**: As Mr. Triangle speaks, the stage automatically projects the exact visual artifact referenced—floor plans with live routes, archival sketches, style comparisons, timelines, or zoomable detail rings.
3. **Ambient Companion Presence**: Mr. Triangle stays nestled in the card notch, providing clear conversational feedback (listening, thinking, speaking) without obstructing the art.

---

## 🗂️ The 5 Synchronized Artifact Modalities (Voice-Orchestrated)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     SYNCHRONIZED VISUAL STAGE (VOICE DRIVEN)                    │
│                                                                                 │
│   (No manual tabs or buttons — stage transitions follow visitor conversation)   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   1. Info Card       → Curatorial metadata, dimensions, provenance, thesis      │
│   2. Gallery Map     → Musée d'Orsay Level 5 wayfinding (toilets, exhibits)     │
│   3. Side-by-Side    → Letter 782 preparatory sketch vs. Finished oil painting │
│   4. Timeline        → Van Gogh's 5 phases: Nuenen → Paris → Arles → Auvers     │
│   5. Detail Hotspots → Zoomable symbol analysis: Cypress, Venus, Dutch steeple  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### Artifact 1: Curatorial Info Card
* **Primary Role**: Ground the visitor in the physical and historical reality of the canvas.
* **Voice Trigger Examples**:
  * *"Tell me about this painting."*
  * *"Who painted this and when?"*
  * *"What is the background of this piece?"*
* **Metadata Schema**:
  * **Title**: *The Starry Night (La Nuit étoilée)*
  * **Artist**: Vincent van Gogh (Dutch, 1853–1890)
  * **Date**: June 1889
  * **Location Created**: Monastery of Saint-Paul-de-Mausole, Saint-Rémy-de-Provence, France
  * **Medium**: Oil on canvas
  * **Dimensions**: 73.7 cm × 92.1 cm (29.0 in × 36.3 in)
  * **Accession / Provenance**: Acquired through the Lillie P. Bliss Bequest (1941)
  * **Curatorial Summary**: Painted during Van Gogh's convalescence at the Saint-Rémy asylum, this masterpiece represents an unprecedented departure from pure observation into emotional and psychological expressionism, using dynamic impasto spirals to express cosmic vitalism.

---

### Artifact 2: Interactive Gallery Map (Voice-Guided Wayfinding)
* **Primary Role**: Seamless spatial navigation for museum exhibits and visitor amenities without touching a screen.
* **Voice Trigger Examples**:
  * *"Where is the nearest toilet / restroom?"*
  * *"Where should I walk next?"*
  * *"How do I get to Gauguin's room?"*
  * *"Where are the elevators?"*
* **Spatial Wayfinding System**:
  * **Level**: Level 5 (Upper Level — Impressionist & Post-Impressionist Masterpieces)
  * **Active Room**: Gallery 36 (*Van Gogh & Gauguin: Dialogue at the Asylum*)
  * **Visitor Beacon**: Pulsing beacon in Gallery 36 center ("You are here")
  * **Amenity & Exhibit Routing**:
    * **Restrooms**: Level 5 South Corridor (45m · 1 min walk) — animated path draws south out of Gallery 36 through the archway.
    * **Next Exhibit (Gauguin)**: Gallery 37 — animated path draws east through the adjoining portal.
    * **Elevators**: West rotunda bank.
* **Visual Presentation**: Crisp vector SVG floorplan with animated glowing route line (`stroke-dashoffset` path drawing) and clear destination banner showing walk distance and step instructions.

---

### Artifact 3: Side-by-Side Study Comparison
* **Primary Role**: Reveal the artistic process by juxtaposing preliminary studies against the final canvas.
* **Voice Trigger Examples**:
  * *"Did he sketch this before painting it?"*
  * *"Show me the preparatory study."*
  * *"How did his idea change from the sketch?"*
* **Comparison Elements**:
  * **Left Pane**: *Pen, ink, and reed study from Letter 782 to brother Theo (June 1889)*
    * Linear structural hatching, perspective grid lines, muted monochromatic ink.
  * **Right Pane**: *The Finished Masterpiece in Oil (June 1889)*
    * Heavy physical impasto, contrasting ultramarine and zinc yellows, rhythmic swirling sky.
* **Key Visual Diff Callouts**:
  1. **Sky Dynamics**: The letter sketch shows concentric bands; the oil canvas transforms into undulating oceanic waves.
  2. **Cypress Scale**: The cypress was enlarged by 30% in the final canvas to anchor the vertical axis.
  3. **Town Settlement**: The village buildings were tightened and given idealized Dutch gables.

---

### Artifact 4: Chronological Era Timeline
* **Primary Role**: Historical context showing how rapidly Van Gogh's style transformed in 5 years.
* **Voice Trigger Examples**:
  * *"Where was he in his life when he made this?"*
  * *"How did his style evolve?"*
  * *"What was his career timeline?"*
* **Timeline Milestones**:
  1. **1885 — Nuenen**: Peasant realism, somber earthy umbers, heavy impasto (*The Potato Eaters*).
  2. **1886–1887 — Paris**: Encounter with Pissarro, Monet, and Seurat; adoption of bright light and pointillism.
  3. **1888 — Arles**: Brilliant Southern French sunshine, flat Japanese woodblock color fields (*The Yellow House*, *Bedroom in Arles*).
  4. **1889 — Saint-Rémy (Current)**: Rhythmic swirling strokes, cosmic nighttime paintings, emotional catharsis (*The Starry Night*).
  5. **1890 — Auvers-sur-Oise**: Extreme agitation, turbulent horizons, final 70 canvases (*Wheatfield with Crows*).
* **Visual Presentation**: Dynamic horizontal era progression that highlights the active Saint-Rémy period with historical milestone cards.

---

### Artifact 5: Detail Hotspots & Symbolic Analysis
* **Primary Role**: Direct the visitor's eye to specific parts of the canvas with optical zoom and glowing reticle rings.
* **Voice Trigger Examples**:
  * *"What does that dark tree on the left mean?"*
  * *"Why is there a huge bright star in the sky?"*
  * *"Tell me about the village church."*
* **Hotspot Targets & Optical Zoom**:
  * **Hotspot A — The Cypress Tree (Foreground Left)**:
    * *Action*: Canvas smoothly zooms and spotlights the dark flame-like cypress.
    * *Insight*: Traditional Mediterranean symbol of mourning and cemeteries. Van Gogh treats it as an obelisk uniting the physical earth with the infinite cosmos.
  * **Hotspot B — The Morning Star / Venus (Center Right)**:
    * *Action*: Canvas smoothly zooms to the radiant white-yellow celestial orb.
    * *Insight*: Van Gogh wrote to Theo: *"This morning I saw the countryside from my window a long time before sunrise, with nothing but the morning star, which looked very big."* Modern astronomical retrospectives confirm Venus was at maximum brilliance in June 1889.
  * **Hotspot C — The Idealized Church Steeple (Village Center)**:
    * *Action*: Canvas zooms to the slender architectural steeple rising above the village rooftops.
    * *Insight*: French churches in Provence do not have steeples of this form; Van Gogh painted this from nostalgia for his homeland village in Brabant, Netherlands.

---

## 🎬 Step-by-Step Demo Script & Voice Choreography

| Step | Visitor Spoken Query | Mr. Triangle Voice Response | Visual Stage Reaction (Zero Buttons) | Companion Avatar State |
| :---: | :--- | :--- | :--- | :--- |
| **01** | Visitor taps **"Start tour"** | *"Welcome to Gallery 36 at the Musée d'Orsay. Standing before you is Vincent van Gogh's masterwork from the summer of 1889."* | **Artifact 1: Info Card** appears automatically with painting metadata and curatorial intro | **Speaking** $\rightarrow$ **Listening** |
| **02** | *"Why does the sky look like a whirlpool?"* | *"That vortex wasn't mere fantasy. In his asylum room at Saint-Rémy, Van Gogh wrote of feeling the raw life-force of nature. Look at how he planned the motion in his letter to Theo..."* | **Artifact 3: Side-by-Side Comparison** slides in comparing Letter 782 ink sketch against the oil canvas | **Thinking** $\rightarrow$ **Speaking** |
| **03** | *"What is that dark tree on the left?"* | *"That is a cypress. In France, the cypress was the tree of grief and mourning. Look closely at how the impasto twists like a dark flame reaching into the sky."* | **Artifact 5: Detail Hotspots** zooms into the cypress with a glowing reticle ring and brushstroke analysis | **Speaking** $\rightarrow$ **Listening** |
| **04** | *"Where was he in his career when he painted this?"* | *"He was near the very end of his creative whirlwind. In just five years, his entire palette transformed from dark earth tones to cosmic light."* | **Artifact 4: Timeline** unfolds showing the 5 phases, highlighting 1889 Saint-Rémy | **Thinking** $\rightarrow$ **Speaking** |
| **05** | *"Where is the nearest toilet?"* | *"The nearest restrooms are just outside this gallery down the south corridor. I've mapped the path for you on your screen."* | **Artifact 2: Gallery Map** opens; animated route draws from Gallery 36 to the Level 5 restrooms | **Speaking** $\rightarrow$ **Listening** |
| **06** | *"And how do I get to Gauguin next?"* | *"Gauguin is right next door in Gallery 37. Head through the east archway—it's only a twenty-second walk."* | **Artifact 2: Gallery Map** updates path to draw directly into Gallery 37 | **Speaking** $\rightarrow$ **Listening** |
| **07** | Visitor says *"End tour"* (or taps call end) | *"Thank you for exploring with me. Have a wonderful rest of your visit at the Musée d'Orsay."* | Tour concludes, returns to Start card | Smoothly returns to idle state |

---

## 💻 Technical Implementation Plan

### 1. Data Store (`web/lib/demo-tour-data.ts`)
A clean, typed data file housing the complete exhibition content:
* `artworkDetails`: Title, artist, date, medium, dimensions, provenance, curatorial quote.
* `galleryMapData`: SVG room nodes, visitor coordinates, and path vectors for:
  * `gallery-36-to-restroom` (Level 5 South corridor)
  * `gallery-36-to-gallery-37` (East archway into Gauguin)
  * `gallery-36-to-elevator` (West rotunda)
* `comparisonData`: High-res study image URL, final oil image URL, and diff callouts.
* `timelineMilestones`: 5 chronological phases with years, locations, descriptions, and thumbnails.
* `hotspotPins`: Normalized `{ x, y }` coordinates, zoom factor (`scale: 2.2`), reticle focus target, and insights.

### 2. Voice-Driven Stage Controller
* `voice-stage-controller.tsx` (or inside `web/app/page.tsx`):
  * Listens to speech recognition transcripts or voice agent tool calls.
  * Maps natural language intents to stage artifact switches:
    * `intent: "show_overview"` $\rightarrow$ Artifact 1: Info Card
    * `intent: "show_comparison"` $\rightarrow$ Artifact 3: Comparison View
    * `intent: "zoom_detail"` (with target `cypress` \| `star` \| `steeple`) $\rightarrow$ Artifact 5: Detail Hotspots
    * `intent: "show_timeline"` $\rightarrow$ Artifact 4: Timeline View
    * `intent: "navigate"` (with target `restroom` \| `gauguin` \| `elevator`) $\rightarrow$ Artifact 2: Gallery Map with animated route
* **Zero clutter**: No manual tab bar or filter buttons on the screen—the stage transitions purely in sync with speech.

### 3. Audio & Voice Cue Integration
* Uses `cuelume` sound triggers:
  * `playStageOpen()`: When transitioning from collapsed avatar to artifact stage.
  * `playToggle()`: When switching between artifact tabs.
  * `playTactileTap()`: When selecting an era node or clicking a detail pin.
* Uses AssemblyAI streaming STT for natural visitor queries.

---

## ✅ Presentation Checklist for Live Demo

- [ ] Clear room audio or directional microphone connected.
- [ ] AssemblyAI API key loaded in settings (or fallback sample queries pre-configured).
- [ ] Smooth 60fps animations across all 5 artifact tab transitions.
- [ ] Mr. Triangle's facial expressions remain responsive in the top-left notch during artifact exploration.
- [ ] End tour confirmation dialog cleans up microphone hardware instantly.
