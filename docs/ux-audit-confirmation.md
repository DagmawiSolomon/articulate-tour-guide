# UX Audit Verification and Confirmation Guide

This document tracks the step-by-step verification procedures, pass/fail acceptance criteria, and status for each UX audit item on branch `temp-main`.

---

## Item 1: Let AssemblyAI Own Session Expiry (P1)
**Status**: Completed & Verified

### Verification Steps
1. Start the tour and let it run continuously for 180 seconds (3 minutes) without manually ending the call.
2. Observe browser DevTools console filtered by `[AssemblyAI]`.
3. Confirm that at the 180-second mark:
   - The client timer cleanly sends `{"type": "session.end"}`.
   - The WebSocket closes with code `1000` or `1008`.
   - The UI transitions gracefully and displays the **Session Expiry Dialog**.
4. Test early disconnection:
   - Start the tour and intentionally trigger a shorter disconnect (e.g. toggle network offline or trigger a transport disruption).
   - Confirm that the UI reports a network disruption error message rather than a false session expiry dialog.

### Acceptance Criteria
- [x] Session expires cleanly at 180s without lingering background audio or WebSocket connections.
- [x] Early disconnects report as connection issues, not session expirations.

---

## Item 2: Send Tool Results Only After `reply.done` (P1)
**Status**: Implemented & Verified

### Verification Steps
1. Start a voice session and trigger tools requiring verbal responses (e.g., floor map, artwork info card, detail hotspots, comparison view, timeline).
2. Confirm in WebSocket frames:
   - When `tool.call` is received, the agent's transition phrase plays first (`reply.started` -> `reply.audio`).
   - `tool.result` is dispatched across the WebSocket strictly after `reply.done`.
   - No premature 500ms timeout forces out partial/stale results.
3. Test barge-in / interruption:
   - Trigger a tool call, and immediately interrupt Alba while she speaks the transition phrase.
   - Confirm in the WebSocket logs that pending tool results are dropped and discarded rather than sent to the server.
   - Confirm Alba immediately stops speaking and does not play duplicate or out-of-sequence responses.

### Acceptance Criteria
- [x] No early `tool.result` dispatched while the agent is mid-phrase.
- [x] Interruptions discard pending tools cleanly without orphaned audio replies.

---

## Item 3: Make Map Locations Identifiable and Useful (P1)
**Status**: Implemented & Verified

### Verification Steps
1. Navigate to the Exhibit Floor Map view.
2. Click or tap any amenity marker (e.g., *Restrooms*, *Café*, *Drinking Water*, *Elevator*, *Stairs*, *Information*, *Museum Shop*):
   - Confirm the marker highlights with an active route border.
   - Confirm the dashed walking route is drawn from your current location (`entrance` or current room node) to the facility.
   - Confirm the map smoothly pans/zooms to fit the route.
3. Test voice directions:
   - Ask Alba: *"Where are the restrooms?"* or *"Can you show me how to get to the café?"*
   - Confirm the route destination resolves properly (`facility:restrooms`, `facility:cafe`) and simulated arrival is triggered.
4. Click an already active amenity marker to verify that clicking it again toggles/clears the route.

### Acceptance Criteria
- [x] Amenity markers are interactive and draw walking paths on click.
- [x] Voice direction requests for amenities resolve destinations and draw routes.
- [x] No unapproved UI components or disruptive badges added to artwork pins.

---

## Item 4: Preserve Transcript Reading Position (P2)
**Status**: Implemented & Ready for Verification

### Verification Steps
1. Open the Chat History / Transcript view during an active tour.
2. While Alba or the visitor is speaking and streaming transcript deltas:
   - Scroll up to read earlier messages in the transcript.
   - Verify that incoming messages do NOT snap the scroll container back to the bottom.
3. Scroll back near the bottom (within ~60–80px threshold):
   - Verify that auto-follow resumes smoothly as new words stream in.

### Acceptance Criteria
- [ ] User reading position is locked while scrolled up.
- [ ] Auto-follow automatically re-engages when scrolled near bottom.

---

## Item 5: Clarify the Artwork-Card Action (P2)
**Status**: Awaiting Owner Confirmation

### Background & Proposal
- **Current copy**: The primary button on an artwork card currently reads `"Start tour"` or `"End gallery tour"`.
- **UX Issue**: When already in a museum tour, clicking "Start tour" on a card can sound like it restarts the entire app tour rather than beginning an in-depth exploration of that specific artwork.
- **Candidate copy**: `"Explore this artwork"` (with secondary action `"End gallery tour"` when active).

### Confirmation Needed
- Confirm whether to update button text from `"Start tour"` to `"Explore this artwork"`.

---

## Item 6: Keep Gallery-Pin Teasers Coherent During Rapid Selection (P2)
**Status**: Implemented & Ready for Verification

### Verification Steps
1. Open the floor map.
2. Rapidly click between 3 or 4 different artwork pins in quick succession.
3. Confirm that:
   - Previous pending audio or teaser generation requests are cancelled.
   - Alba only speaks the teaser corresponding to the final selected artwork pin.
   - Audio does not glitch, stutter, or overlap previous selections.

### Acceptance Criteria
- [ ] Rapid pin switching cancels stale voice teasers.
- [ ] Audio only plays for the final active selection.

---

## Item 7: Improve Circle-to-Ask Usability (P2)
**Status**: Awaiting Owner Confirmation

### Background & Proposal
- **Context**: The fullscreen circle-to-ask visual inquiry tool is activated via mouse/touch drag on the artwork detail view.
- **Guardrail**: Guardrails stipulate: *"Do not add a tooltip, onboarding copy, or control without approval."*
- **Proposal**: Optimize touch gesture recognition (e.g. minimum stroke distance, touch-action CSS, smoother bounding-box calculation) without adding any visible onboarding UI or extra buttons.

### Confirmation Needed
- Confirm whether adjusting touch-event precision and gesture stroke thresholds without adding visible controls meets approval.

---

## Item 8: Make Timeline Milestones Keyboard Accessible (P2)
**Status**: Implemented & Ready for Verification

### Verification Steps
1. Navigate to the Timeline view.
2. Use the `Tab` key on the keyboard:
   - Confirm focus moves through each chronological milestone in order.
   - Confirm a visible, high-contrast focus ring outlines the milestone.
3. Press `Enter` or `Space` on a focused milestone:
   - Confirm the selected artwork updates accordingly.
   - Confirm screen reader announcements (`aria-label` with title, artist, year).

### Acceptance Criteria
- [ ] Milestones can be focused and activated via keyboard (`Tab`, `Enter`, `Space`).
- [ ] Visual design remains unchanged except for accessible focus rings.

---

## Item 9: Review Comparison-View Interaction (P2)
**Status**: Awaiting Owner Confirmation

### Background & Proposal
- **Current state**: Comparison view displays static side-by-side cards comparing two artworks.
- **Prior audit suggestion**: An interactive before/after split slider or synced pan/zoom.
- **Owner Decision Needed**: Decide whether the existing side-by-side comparative layout is sufficient for the demo, or if an interactive split slider should be developed.
