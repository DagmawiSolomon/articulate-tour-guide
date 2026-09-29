# Alba Script Audit Report

Read-only inventory of the local source on branch `fix/alba-voice-guidance`, prepared 2026-09-29. Source references are relative to `web/`. Exact quotation marks, capitalization, and wording below are copied from source where presented as quoted text. Template values in `{braces}` are runtime substitutions. This report does not verify the deployed AssemblyAI agent; `web/scripts/setup-agent.mjs` can update/create an agent when executed, but it was only read, never run.

## Contents

1. [Base AssemblyAI agent configuration](#base-assemblyai-agent-configuration)
2. [Scenario inventory](#scenario-inventory)
3. [Vision researcher prompt](#vision-researcher-prompt)
4. [Tour summary prompt](#tour-summary-prompt)
5. [Tool definitions](#tool-definitions)
6. [Gaps and verification limits](#gaps-and-verification-limits)
7. [Prompt review report](#prompt-review-report)

## 1. Base AssemblyAI agent configuration

Source: `web/scripts/setup-agent.mjs:37-82`.

**Agent name:** `Alba Tour Guide — Turning Points in Art History`

**System prompt (verbatim):**

> You are Alba, an articulate, perceptive museum tour guide leading a real-time tour of the special exhibition: "Turning Points in Art History — An Imagined Gallery of Masterpieces That Changed the World".
> Speak naturally, warmly, and concisely (1 to 2 sentences per response unless the visitor explicitly asks for an in-depth breakdown).
> You are multilingual and code-switch fluently if the visitor addresses you in Spanish, French, German, or Italian.
>
> CONVERSATIONAL POISE & TRANSITIONS:
> - NEVER say 'I got ahead of myself', 'Excuse me', 'Sorry about that', or make meta-apologies about conversational timing.
> - When the visitor selects a gallery pin, interrupts, or asks a question, transition immediately and directly into the art history with poise and confidence, without commenting on conversational flow.
> - NEVER suggest, prompt, or recommend that the visitor revisit or go back to a completed artwork. The visitor decides where to go next — your role is to guide wherever they choose, not to direct them back.
>
> EXHIBITION WINGS & MASTERPIECES:
> 1. Wing 1 (The Perspective Leap): Masaccio, "The Holy Trinity" (1427, Florence) — Single-point linear perspective, Brunelleschi's mathematical grid, and memento mori.
> 2. Wing 2 (The Theatre of Shadow): Caravaggio, "The Calling of Saint Matthew" (1600, Rome) — Tenebrism, street-level tavern realism, and divine raking light.
> 3. Wing 3 (The Sky of Pure Feeling): Vincent van Gogh, "The Starry Night" (1889, Saint-Rémy) — Emotional expressionism, cypress, celestial vortex, and Venus.
> 4. Wing 4 (The Shattered Mirror): Pablo Picasso, "Les Demoiselles d'Avignon" (1907, Paris) — Annihilation of perspective, Iberian/African ritual masks, and multiple simultaneous angles.
> 5. Wing 5 (Beyond the Frame): Marcel Duchamp ("Fountain", 1917) and Jackson Pollock ("Autumn Rhythm", 1950) — The dematerialization of the object into pure concept and physical bodily gesture.
>
> INTERACTIVE ARTIFACT TOOLS:
> - When the visitor asks for directions, a walking route, or how to get from point A to point B (e.g. 'How do I get to Caravaggio?', 'Where are the restrooms and how do I walk there?'), call 'show_map' with 'routeId' ('rotunda', 'perspective', 'shadow', 'feeling', 'cubism', 'concept', 'restrooms') and 'showPath': true.
> - When the visitor wants to see the layout, asks where they are, or asks to view the map (without asking for walking directions), call 'show_map' with 'routeId' and 'showPath': false. NEVER show a path line unless directions or travel from A to B are explicitly requested.
> - When examining an artwork or discussing its visual elements AFTER a tour stop has started, call 'show_info' with 'artworkId' ('masaccio-holy-trinity', 'caravaggio-calling-st-matthew', 'van-gogh-starry-night', 'picasso-demoiselles', 'pollock-autumn-rhythm', 'duchamp-fountain'). When the visitor is merely previewing a pin on the map before clicking Start Tour, do NOT call any tools.
> - When the visitor asks about microscopic brushwork, symbols, or details, call 'show_hotspots' with the 'artworkId' ('masaccio-holy-trinity', 'caravaggio-calling-st-matthew', 'van-gogh-starry-night', 'picasso-demoiselles', 'pollock-autumn-rhythm', 'duchamp-fountain') and specific 'hotspotId' (e.g. 'vortex', 'cypress', 'star', 'steeple').
> - When comparing eras (e.g. Medieval flat icons vs. Renaissance depth, or Neoclassical nude vs. Cubist fracture), call 'show_comparison' with 'pairId' ('comparison-perspective' or 'comparison-cubism').
> - Call 'show_timeline' with 'activeEraId' ('1427', '1600', '1889', '1907', '1950') when the visitor asks about it OR when your response naturally involves historical chronology, artistic progression across centuries, or placing an artwork in its historical context (e.g. 'what came before this?', 'how did this change art?', discussing the arc from 1427 through to 1950). Do NOT call show_timeline purely as a transition filler when ending a gallery stop or moving between artworks with no chronological context.
> - ARCHIVAL RAG: When a visitor asks about historical facts, conservation findings, x-rays, police records, or artist letters (e.g. "Did Caravaggio sketch?", "What did Vasari say?", "What did Van Gogh write in his letters?", "Why did Picasso repaint it?"), ALWAYS call 'consult_archives' with their query. You will be provided with primary source quotes and verified citations to incorporate into your answer.
> - VOCAL CONFIRMATION: When the visitor says 'let's go with this first', 'start here', or confirms starting the tour with the current artwork, confirm warmly and give a vivid 1 to 2 sentence breakdown of why it is our first revolutionary milestone.
> - SAFE WORD / QUIET READING: When the visitor states 'I prefer to read', 'be quiet', or tells you to stop speaking, treat this as a safe word to stop speaking immediately. Call 'set_quiet_mode' with 'quiet': true, acknowledge in at most 3 words (e.g. 'Enjoy reading.'), and do NOT generate any further spoken explanations while they read. When they ask a new question later, resume normally.

**Greeting (verbatim):** `Welcome to Turning Points in Art History! I'm Alba, your tour guide. Where would you like to start our tour today? Take a look at the floor plan on your screen to pick our first stop.`

**Voice:** `voice_id: "alba"`.

**Input configuration:** PCM audio; far-field focus; focus threshold `0.8`; language codes `en`, `es`, `fr`, `de`, `it`; VAD threshold `0.5`; minimum silence `800 ms`; maximum silence `2500 ms`; response interruption enabled; interruption delay `120 ms`. Keyterms include the five artists and artwork titles, art-history terms, Vasari, Rotunda, and Memento Mori. Exact array is in `web/scripts/setup-agent.mjs:66-83`.

## 2. Scenario inventory

### Greeting and first-turn muted reminder

- **Trigger / source:** Agent configured greeting, `web/scripts/setup-agent.mjs:63`; session lifecycle in `web/app/page.tsx:660-705`.
- **Exact greeting:** See above.
- **Condition:** On agent session greeting. When the first greeting finishes, if still muted and the visitor has not interacted, client asks for a concise reminder.
- **Exact reminder instruction** (`page.tsx:902-904`): `Notice that the visitor's microphone is currently muted. In one concise, friendly sentence, remind them that their microphone is muted and they can tap the mic button whenever they want to speak or ask questions.`
- **Quiet mode:** No explicit quiet-mode check in this reminder condition.

### Gallery pin teaser / gallery already visited

- **Trigger / source:** Visitor selects a map artwork pin during an active tour, `web/app/page.tsx:1610-1680`.
- **Unexplored stop exact instruction:** `The visitor clicked on ${targetArtwork.title} (${targetArtwork.year}) by ${targetArtwork.artist} on the floor map. In one friendly, brief sentence, give a warm teaser of why this masterpiece is exciting, and invite them to tap 'Start tour' or ask any questions to begin here. Speak with poise and no apologies. CRITICAL: Do NOT call any tools. Do not call show_info, show_map, or any other tool. Speak ONLY the single-sentence spoken teaser.`
- **Already completed exact instruction:** `The visitor tapped on ${targetArtwork.title} (${targetArtwork.year}) by ${targetArtwork.artist} — a gallery they have already visited. In one warm sentence, acknowledge what made this stop memorable and offer to answer any lingering questions. Do NOT suggest revisiting.`
- **Conditions:** Only for a not-currently-exploring stop while the tour is active; completed vs unexplored selects the instruction. Quiet mode records a transcript entry and suppresses the spoken reply. A click on the current exploring stop does not interrupt narration.

### Start tour / visitor confirms starting

- **Trigger / source:** Start-tour UI or vocal confirmation, `web/app/page.tsx:425-485`, `756-786`.
- **Exact instruction:** `The visitor confirmed: "Let's go with this first!" to start their tour with ${targetArtwork.title} (${targetArtwork.year}) by ${targetArtwork.artist}. Welcome them enthusiastically to this opening stop of the exhibition and give a vivid, engaging 2-sentence curatorial breakdown of why this masterpiece is our first revolutionary milestone. Speak with poise and dive straight into the artwork without any apologies. CRITICAL: Do NOT call show_info, show_map, or any tools. Speak ONLY the spoken breakdown.`
- **Condition:** Same instruction is used for the selected/active artwork, with runtime title/date/artist substitution. UI invocation changes stage/artifact; no quiet-mode guard appears at this handler.

### Circle question / visual answer / visual failure

- **Trigger / source:** `web/app/page.tsx:536-647`; visual-analysis server prompt in `web/app/api/visual-question/route.ts:70-76`.
- **Handoff text:** The visitor transcript entry is `Tell me about the area I circled in ${artwork.title}.` The client sends the image selection and question to `/api/visual-question`.
- **Success instruction (verbatim):**

```text
CRITICAL: Do NOT call show_hotspots, show_info, show_map, or consult_archives. Speak your answer directly to the visitor as Alba now.

The visitor circled a detail in "${artwork.title}" by ${artwork.artist} and asked: "${visitorQuestion}".
Curatorial visual analysis: "${cleanAnalysis}".

Explain in 2-3 warm, conversational sentences what they circled and its artistic significance. Speak directly aloud without apologies or meta-commentary.
```

- **Failure instruction (verbatim):** `The visitor circled a detail in "${artwork.title}" and asked about it, but the visual analysis failed. In one warm sentence, apologize briefly that you could not inspect that detail right now, and invite them to ask about something else in the painting.`
- **Conditions:** It interrupts current speech and waits for the vision API. If the agent is connected it requests an agent reply; otherwise it adds the analysis to transcript and may use browser speech synthesis. Failure while disconnected records a tool error but does not speak the failure instruction. Quiet mode suppresses browser synthesis; connected reply audio is also suppressed by the audio callback while quiet.

### Hotspot / map / info / comparison / timeline / archive tool calls

- **Trigger / source:** Agent tool calls handled in `web/app/page.tsx:946-1227`; available tool guidance is in the system prompt and [Tool definitions](#tool-definitions).
- **Hotspot success result:** `{ success: true, activeHotspot: { id: hotspotId, name: matchedHotspot.name }, artwork: artwork.title }`.
- **Hotspot unmatched result:** `{ success: false, message: "No saved placement matches that detail.", availableHotspots: [{ id, name }, ...] }`. If a recent circle analysis is available, result instead includes `{ success: true, detail, analysis, instruction: "Synthesize this curatorial analysis into 2 warm, natural sentences and speak them directly to the visitor as Alba." }`.
- **Map success result:** `{ success: true, destination: routeId }`. A route line is based on `showPath`; the local handler does not send a spoken phrase.
- **Info success result:** `{ success: true, artwork: artwork.title }`. It sets the info artifact except when fullscreen is already active; no spoken phrase is scripted by the handler.
- **Comparison success result:** `{ success: true, pair: pairId }`.
- **Timeline success result:** `{ success: true, activeArtworkId: resolvedArtworkId }`; if a tour stop is active it returns `{ success: true, skipped: "visitor is actively exploring an artwork" }`.
- **Archive success result:** Provides `success`, `source`, `title`, `year`, `archiveRef`, `finding`, and `excerpt`. Failure is `{ success: false, message: "No specific archival document found for this query in current records." }`.
- **Quiet/resume tool:** `set_quiet_mode` sets client state and returns `{ success: true, mode: "quiet_reading" }` or `{ success: true, mode: "spoken_guide" }`. Client transcript labels are `Quiet Reading Mode Enabled` / `Spoken Audio Guide Enabled`; detail strings are `Alba will remain quiet while you read.` / `Spoken guidance resumed.` The agent prompt asks Alba to acknowledge quiet in at most 3 words; there is no explicit resume-acknowledgment sentence in the setup prompt.
- **Interaction caveat:** These tool results are structured messages to the agent, not themselves visitor-facing scripted utterances. Alba generates any natural-language narration in response to them.

### Ending a gallery / ending the session / expiry

- **Gallery end:** `web/app/page.tsx:487-534`; voice-tool aliases `end_gallery_tour` and `finish_gallery` handled at `page.tsx:953-956`. Exact instruction: `The visitor has ended their tour of the ${currentArtwork.title} (${currentArtwork.year}) gallery and returned to the exhibition floor map. In 1 to 2 warm, engaging sentences as Alba, acknowledge concluding our time with ${currentArtwork.title}, and ask them which gallery, milestone, or artwork they would like to explore next on the floor map.`
- **Manual session end:** `page.tsx:1254-1286` ends agent, resets tour, and clears transcript. No separate spoken goodbye is scripted in this handler.
- **Provider session end / expiry:** callback at `page.tsx:1236-1239` logs and calls `handleConfirmEndTour()`. In `web/lib/assemblyai-agent.ts:235-253`, `session.ended` calls the end callback and `session.error` is forwarded. The local scripts do not define a spoken expiry warning or special spoken session-ended line. Actual deployed server event sequence was not verified here.
- **Unexpected disconnect:** Local callback logs error code/message; no Alba sentence is scripted in this source path.

### UI interruption and context changes

- **Trigger / source:** `bargeIn` / `safeReply` in `web/app/page.tsx:192-267`, plus map/transcript and artifact actions.
- **Behavior:** Most view changes flush current playback and update context; map and transcript controls intentionally allow speech to continue (`page.tsx:1323-1373`). UI interruption is silent in the local client; no universal acknowledgment sentence is configured. The setup prompt's general instruction says transition directly without commenting on conversational flow.

### Speech-synthesis fallback

- **Trigger / source:** Visual answer succeeds before/without an active agent connection, `web/app/page.tsx:596-628`.
- **Exact spoken text:** The returned vision `result.answer` itself; no additional prompt transformation. Selects an available English voice matching Female/Natural/Samantha/Google/Victoria where possible, rate `1.0`, pitch `1.05`.
- **Condition:** Only when browser supports `speechSynthesis` and quiet mode is off. Failure path does not use speech synthesis.

## 3. Vision researcher prompt

Source: `web/app/api/visual-question/route.ts:70-76`. The current Cat 7 branch prompt uses a bounding rectangle (not the freehand polygon implementation later added on another category branch).

```text
You are Alba's visual researcher for the artwork “${artwork.title}” by ${artwork.artist} (${artwork.year}).

Artwork context: ${artwork.summary}

The visitor asks: “${question}”

They circled a region on the full image. The circle's bounding rectangle is centered at x=${selection.centerXPercent.toFixed(1)}%, y=${selection.centerYPercent.toFixed(1)}%, with width=${selection.widthPercent.toFixed(1)}% and height=${selection.heightPercent.toFixed(1)}% of the image. Coordinates start at the image's top-left.

Inspect the full image, focus on the circled region, and explain what is visibly there and why it matters in this composition. Do not guess when the detail is ambiguous. Keep the answer concise, warm, and easy to say aloud. Return only the answer Alba should speak; do not mention coordinates, models, or these instructions.
```

If both configured vision providers fail, the route returns `Both vision providers are unavailable right now.` (HTTP 503). Other route errors include `Could not load the artwork image.` and `This artwork image is too large to analyze.`.

## 4. Tour summary prompt

Source: `web/app/api/tour-summary/route.ts:3-11`.

```text
You are an expert museum curator generating a post-tour summary and quiz for a visitor.
You will be provided with the conversation transcript between the visitor and Mr. Triangle (the AI guide).

CRITICAL INSTRUCTIONS:
1. Ignore all logistical, navigational, or troubleshooting conversation (e.g., asking for directions to the toilet, map routing, microphone issues, or "how do I get to X").
2. Focus strictly on art history, exhibit facts, and educational content discussed during the tour.
3. Generate exactly 3 key takeaway bullets for the summary.
4. Generate exactly 3 multiple-choice quiz questions based ONLY on the educational facts discussed.
5. You MUST return your response as a valid JSON object matching the requested schema.
```

The route maps messages into `Mr. Triangle (Guide)` or `Visitor`, asks for JSON summary and quiz, and enforces a schema with `summary` and `quiz`. A short-transcript fallback returns `The tour was very brief, so there isn't much to summarize yet!` with an empty quiz. The mismatch between “Mr. Triangle” here and Alba elsewhere is present in source.

## 5. Tool definitions

Source: `web/scripts/setup-agent.mjs:84-208`. All are AssemblyAI function tools using `execution_mode: "interactive"`.

| Name | Description and arguments |
|---|---|
| `show_map` | Display the gallery floor plan and optionally plotted walking routes between pavilions (Grand Rotunda, Perspective, Shadow, Feeling, Cubism, Concept, Restrooms). `routeId`: string enum `rotunda`, `perspective`, `shadow`, `feeling`, `cubism`, `concept`, `restrooms`. `showPath`: boolean; true only for explicit walking directions, false for map/layout/current-location requests. Required: `routeId`. |
| `show_hotspots` | Call to zoom into detailed iconography and hotspots of the current or specified masterpiece. `artworkId`: string enum of six active artwork IDs. `hotspotId`: string; examples `cypress`, `vortex`, `star`, `steeple`. No required list in schema. |
| `show_info` | Display the artwork or pavilion curatorial overview card. `artworkId`: string enum of six active artwork IDs. |
| `show_comparison` | Open the side-by-side comparative canvas contrasting two epoch styles. `pairId`: required string enum `comparison-perspective` or `comparison-cubism`. |
| `show_timeline` | Display the chronological timeline of revolutionary artistic turning points. `activeEraId`: string; description lists `1427`, `1600`, `1889`, `1907`, `1950`. |
| `consult_archives` | Consult primary-source curatorial archives. `query`: required string; `category`: optional enum `all`, `primary_letters`, `historical_biography`, `conservation_technical`, `police_blotter`. |
| `set_quiet_mode` | Activate/deactivate quiet reading mode. `quiet`: required boolean; true for silence, false to resume. |

**Important source mismatch:** Runtime also handles `end_gallery_tour` / `finish_gallery`, but these tool definitions are absent from this setup payload. `show_artwork_info` is accepted as an alias in the runtime but is also absent from this setup payload.

## 6. Gaps and verification limits

- This is the local source inventory on the Category 7 branch, not proof of the prompt/voice/greeting currently stored on AssemblyAI. The app uses a stored agent ID; deployed configuration was not fetched or inspected.
- `setup-agent.mjs` contains a PUT path for updating an existing remote agent and a POST path for creating one. It was not executed; no `.env.local` values or credentials were read into this report.
- `end_gallery_tour` / `finish_gallery` are runtime aliases without definitions in the setup payload. The app may rely on a separately configured agent definition.
- The vision researcher and tour summary prompts use different guide names (`Alba` vs `Mr. Triangle`).
- The current local base prompt asks for a quiet-mode acknowledgment but has no fixed exact spoken line; no resume line is specified. The UI interruption handling has no acknowledgment line, consistent with the silent-after-UI-interruption decision.
- The local quiet/resume regexes on this branch cover English phrases only; the multilingual changes are on a separate Category 8 branch.
- No live listening, deployed-agent comparison, script execution, application run, build, or test was performed.

## 7. Prompt review report

Two review-only proposal documents exist on their respective category branches:

- `research/proposed-agent-persona-guidance.md` on `fix/alba-voice-guidance`: proposes consistent Alba voice, pacing, curiosity, responses to confusion and emotional reactions, respectful handling of sensitive subjects, uncertainty/correction standards, and the approved silent behavior after UI interruptions. It does not change the base prompt or agent.
- `research/proposed-agent-hotspot-guidance.md` on `fix/hotspot-coverage`: proposes occasional natural detail observations, calling `show_hotspots` only for supported saved placements, discussing the detail without naming the tool, and gracefully handling unsupported placements.

These proposals still need your review before anyone applies them to `web/scripts/setup-agent.mjs` or the deployed agent. No deployment authorization was inferred from the request for this report.
