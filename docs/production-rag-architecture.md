# Production Architecture: RAG & Citations with AssemblyAI Voice Agent

This document captures the architectural context for moving from the hardcoded UI demo to a real production Retrieval-Augmented Generation (RAG) system using the AssemblyAI Voice Agent API.

## 1. RAG via Tool Calling

The AssemblyAI Voice Agent doesn't have a built-in vector database. Instead, you hook it into your backend using the **Tool Calling** pattern:

1. **Definition**: When configuring the agent (`session.update`), you define a tool (e.g., `search_archives`).
2. **Trigger**: When a user asks an obscure question (e.g., "What paint did Van Gogh use?"), the agent pauses and sends a `tool.call` event over the WebSocket to your app.
3. **Execution**: Your app intercepts this, runs a vector search (RAG) against your database (e.g., Pinecone), and sends back a `tool.result` event over the WebSocket with the retrieved facts.
4. **Synthesis**: The agent instantly reads the facts and smoothly weaves them into a spoken response.

> **Pro Tip:** Use `execution_mode: "interactive"` on your tool definition. This makes the agent say natural filler phrases like *"Let me check the archives for you..."* while your vector search runs in the background. For longer tasks (>10s), use `execution_mode: "hold"` to keep the agent silent.

---

## 2. Handling Citations & UI Sync in Production

Voice Agents stream raw audio and text. They do not natively output structured `citations` arrays. Furthermore, you **do not want the text-to-speech (TTS) engine to accidentally read citation brackets out loud** (e.g., saying *"oil on canvas bracket one bracket"*).

Production systems handle UI elements like citations in one of three ways:

### A. Out-of-Band Data (The Most Common & Robust Way)
Instead of injecting citations into the agent's spoken transcript, tie the citations directly to the **Tool Call**:
* When your RAG tool returns data, include the metadata in your backend: `{"result": "Painted in 1889...", "sources": [{"id": 1, "url": "..."}]}`.
* Your frontend intercepts this tool execution and immediately renders a "Sources Consulted" UI block for that conversation turn. 
* **Benefit:** The agent speaks naturally without needing to manage `[1]` tags in its speech, and the UI displays the sources reliably based purely on the tool data.

### B. Hidden Delimiters + SSML (The Inline Way)
If you *must* have inline citations embedded within the text (like Wikipedia), use XML tags:
* **Prompt:** Instruct the agent: *"Append citations using XML tags: `<cite>1</cite>`"*
* **TTS Config:** The TTS engine must be configured (via SSML) to completely ignore anything inside `<cite>` tags so it never speaks them out loud.
* **Frontend:** Your React app runs a regex over the incoming streaming text, stripping out `<cite>1</cite>` and replacing it with a clickable `<InlineCitations />` React component.

### C. Dedicated Orchestration Servers (Enterprise)
For complex systems, the browser does not connect directly to the Voice Agent API. 
* The browser connects to a middle-tier Node.js/Python server, which then connects to AssemblyAI. 
* The middle-tier server orchestrates the RAG pipeline and sends custom JSON WebSocket messages (e.g., `{"type": "ui_update", "action": "show_citations", "data": [...]}`) down to the frontend. 
* **Benefit:** This completely separates the UI state from the raw voice transcript stream.

---

## 3. Context on Today's Fixes
* **AudioWorklet Upgrade:** We migrated from the deprecated `ScriptProcessorNode` to `AudioWorkletNode` in `assemblyai-agent.ts` to improve performance and remove console warnings.
* **NaN Streaming Bug:** We fixed a bug where `undefined + undefined` resulted in `NaN` crashing the React component. The `transcript.agent.delta` payload occasionally drops the `text` field, which we now safely fallback to an empty string `""`.
* **Streaming UI (Blinking Cursor):** We updated the `AgentSection` in `chat-history-view.tsx` to respect the `isStreaming` flag, providing a blinking cursor while the agent is actively talking.
