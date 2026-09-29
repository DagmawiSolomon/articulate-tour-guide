# UX Audit Fixes and Acceptance

Branch reviewed: temp-main  
Current main: 9145b63 (not updated by this integration)  
Audit baseline: research/articulate-todo.md and docs/multimodal-voice-ui-audit.md

Work through this list one item at a time. After each implementation, pause for owner testing before starting the next item. Keep changes limited to the agreed fix. Do not start the app, dev server, or build; the owner tests in the running app.

## Guardrails

- Keep the AssemblyAI server token cap at 180 seconds. Do not enforce expiry with a client-side timer.
- Preserve the read-only transcript, no on-screen quiet/resume control, no hotspot-confidence indicator, and review-only agent prompt proposals.
- Do not add visible UI or change the design language without approval.
- Do not mark a runtime, deployed-agent, touch, language, or accessibility check complete until the owner reports the result.
- No application code has been changed for this fix queue yet.

## Ordered fixes

### 1. Let AssemblyAI own session expiry — P1
Status: Complete (Accepted by owner on 2026-09-29).

The page starts a browser timer at 180 seconds, ends the agent locally, and shows the expiry dialog. This can make client-side timing look like proof that the provider cap worked. Remove the local timer and session-age heuristic, keep max_session_duration_seconds=180 in the token request, and show expiry only when the Voice Agent reports expiry.

Owner acceptance:
- [x] Let a session reach 180 seconds; confirm the provider closes it and the expiry dialog appears. (Verified)
- [x] Cause a shorter disconnect; confirm it is reported as a disconnect rather than expiry. (Verified)

### 2. Send tool results only after reply.done — P1
Status: Open.

The Voice Agent wrapper sends results immediately unless the last event was reply.started, and a 500 ms timer can force queued results out before reply.done. Queue results until the documented completion event and remove early sends.

Owner acceptance:
- Try map, artwork info, hotspot, comparison, and timeline tool calls.
- Interrupt while a tool is pending; confirm there is no duplicate, stale, or missing response.

### 3. Make map locations identifiable and useful — P1
Status: Open; confirm visible treatment and routing behavior before implementation.

Artwork pins show thumbnails and nearby room names but not the artwork title. Amenity markers display labels and accessibility names but are not interactive.

Owner acceptance:
- Identify artworks from the map without opening each pin.
- Request directions to an amenity and confirm the route and simulated-arrival behavior.
- Keep additions within the existing map design.

### 4. Preserve transcript reading position — P2
Status: Open.

The transcript jumps to the bottom on every update, including while the visitor is reading older messages. Auto-follow only while the visitor is already near the bottom.

Owner acceptance:
- Scroll up while Alba speaks; confirm the view stays in place.
- Return to the bottom; confirm auto-follow resumes.

### 5. Clarify the artwork-card action — P2
Status: Open; wording needs owner review.

“Start tour” on an artwork card starts that artwork’s explanation and can sound like it starts the full tour. Candidate wording: “Explore this artwork.”

Owner acceptance:
- Confirm the label clearly describes the action before the wording is changed.

### 6. Keep gallery-pin teasers coherent during rapid selection — P2
Status: Open.

Keep the approved brief teaser behavior while ensuring fast pin changes do not leave Alba speaking about a previous selection.

Owner acceptance:
- Select several pins quickly; confirm the final teaser matches the final selected artwork and audio does not repeatedly restart.

### 7. Improve circle-to-ask usability — P2
Status: Open; any visible guidance requires owner approval.

The fullscreen circle tool is subtle, and touch drawing precision needs review.

Owner acceptance:
- Locate and use the tool with mouse, keyboard, and touch.
- Try adjacent details and different zoom levels.
- Do not add a tooltip, onboarding copy, or control without approval.

### 8. Make timeline milestones keyboard accessible — P2
Status: Open.

Milestones use click handlers on non-semantic elements. Make milestone selection available to keyboard and screen-reader users without changing the visual design.

Owner acceptance:
- Tab to a milestone, select it with the keyboard, and confirm the selected artwork changes.

### 9. Review comparison-view interaction — P2
Status: Open; product direction needs review.

The comparison view remains static side-by-side cards. The prior UX audit suggested an interactive slider and visual grounding for Alba’s narration.

Owner acceptance:
- Decide whether static comparison is sufficient for the demo before adding controls or highlighting.

## Separate runtime checks

- The /api/agent-token route exists in the reviewed checkout. The earlier 404 was not explained by checked-in code; verify the running server is serving temp-main before investigating code changes. Do not call the endpoint separately because it mints a single-use token.
- Confirm the tour intro stays in fullscreen and each voice-triggered artifact appears in both expanded and collapsed states.
- Test consecutive direction requests, circled questions at different zoom levels, hotspot placement, and touch panning.
- Verify live expiry behavior, deployed AssemblyAI prompt/voice, the five supported languages, and avatar motion from Alba’s output audio.
- The merged code makes the avatar gray while connecting or failed; confirm this in the running app.

## Change log

- 2026-09-29: Implemented and accepted Item 1 (provider-owned session expiry without client-side timers or heuristics).
- 2026-09-29: Recorded the audit findings and ordered owner-acceptance checklist. No code fixes are recorded as complete.