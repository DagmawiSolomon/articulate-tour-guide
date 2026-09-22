/**
 * assemblyai-agent.ts
 *
 * Browser-side Voice Agent WebSocket wrapper.
 *
 * Connects to wss://agents.assemblyai.com/v1/ws using a temporary token
 * fetched server-side from /api/agent-token. The stored agent (configured
 * on AssemblyAI's platform with system_prompt, voice=alba, and tools) is
 * bound by agent_id on connect.
 *
 * Key gotchas from the AssemblyAI skill:
 * - Auth: Bearer token as ?token= query param (not Authorization header from browser)
 * - Audio: base64-encoded PCM, ~50ms chunks, 24kHz mono
 * - tool.call uses "arguments" field (not "args")
 * - Send session.end (not just close) to stop billing immediately
 * - transcript.user.delta is CUMULATIVE — render latest, don't concatenate
 * - Send tool.result only when reply.done is the latest event received
 * - On barge-in: reply.done fires with status="interrupted" → discard pending tools
 */

export type AgentToolCall = {
  callId: string;
  name: string;
  arguments: Record<string, unknown>;
};

export type VoiceAgentCallbacks = {
  /** Cumulative partial transcript for the current visitor turn */
  onTranscriptPartial?: (text: string) => void;
  /** Final visitor transcript for the turn */
  onTranscriptFinal?: (text: string) => void;
  /** Agent started speaking (reply.started) */
  onAgentSpeakingStart?: () => void;
  /** Agent finished speaking or was interrupted (reply.done) */
  onAgentSpeakingEnd?: (interrupted: boolean) => void;
  /** Raw base64 PCM audio chunk from the agent */
  onAgentAudio?: (base64: string) => void;
  /** Agent wants to call a tool — respond with sendToolResult() */
  onToolCall?: (tool: AgentToolCall) => void;
  /** Session is ready (after session.ready) */
  onReady?: (sessionId: string) => void;
  /** Session ended cleanly */
  onEnded?: () => void;
  /** An error occurred */
  onError?: (code: string, message: string) => void;
};

export type VoiceAgent = {
  /** Start streaming mic audio to the agent */
  startAudio: (stream: MediaStream) => void;
  /** Stop sending audio (keep WS open) */
  stopAudio: () => void;
  /** Send the result of a tool call back to the agent */
  sendToolResult: (callId: string, result: unknown, isError?: boolean) => void;
  /** End the session cleanly — stops billing immediately */
  end: () => void;
  /** Whether the WebSocket is currently open */
  readonly connected: boolean;
};

/**
 * Creates and connects a Voice Agent session.
 *
 * Fetches a temp token from /api/agent-token, opens the WebSocket,
 * sends session.update with the stored agent_id, then starts the
 * event loop.
 */
export async function createVoiceAgent(
  callbacks: VoiceAgentCallbacks
): Promise<VoiceAgent> {
  // 1. Fetch temp token + agent ID from our server
  const tokenRes = await fetch("/api/agent-token");
  if (!tokenRes.ok) {
    const { error } = await tokenRes.json().catch(() => ({ error: "unknown" }));
    throw new Error(`Failed to get agent token: ${error}`);
  }
  const { token, agentId } = await tokenRes.json();

  // 2. Open WebSocket with token as query param
  const wsUrl = `wss://agents.assemblyai.com/v1/ws?token=${encodeURIComponent(token)}`;
  const ws = new WebSocket(wsUrl);

  let isConnected = false;
  let mediaRecorder: MediaRecorder | null = null;
  let lastEvent: string | null = null;
  const pendingTools: Array<{ callId: string; result: unknown; isError: boolean }> = [];

  // Helper: flush pending tool results when reply.done is the latest event
  function flushPendingTools() {
    if (lastEvent !== "reply.done" || pendingTools.length === 0) return;
    for (const t of pendingTools) {
      ws.send(
        JSON.stringify({
          type: "tool.result",
          call_id: t.callId,
          result: JSON.stringify(t.result),
          is_error: t.isError,
        })
      );
    }
    pendingTools.length = 0;
  }

  ws.onopen = () => {
    isConnected = true;
    // 3. Bind stored agent — all config (prompt, voice=alba, tools) lives server-side
    ws.send(
      JSON.stringify({
        type: "session.update",
        session: { agent_id: agentId },
      })
    );
  };

  ws.onmessage = (event) => {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(event.data as string);
    } catch {
      return;
    }

    const type = msg.type as string;

    switch (type) {
      case "session.ready": {
        callbacks.onReady?.(msg.session_id as string);
        break;
      }

      case "transcript.user.delta": {
        // Cumulative partial — render latest, don't concatenate
        callbacks.onTranscriptPartial?.(msg.text as string);
        break;
      }

      case "transcript.user": {
        callbacks.onTranscriptFinal?.(msg.text as string);
        break;
      }

      case "reply.started": {
        lastEvent = "reply.started";
        callbacks.onAgentSpeakingStart?.();
        break;
      }

      case "reply.audio": {
        callbacks.onAgentAudio?.(msg.audio as string);
        break;
      }

      case "reply.done": {
        lastEvent = "reply.done";
        const interrupted = (msg.status as string) === "interrupted";
        if (interrupted) {
          // Barge-in — discard pending tool results for the interrupted reply
          pendingTools.length = 0;
        } else {
          flushPendingTools();
        }
        callbacks.onAgentSpeakingEnd?.(interrupted);
        break;
      }

      case "tool.call": {
        // arguments (not args) per April 2026 rename
        const tool: AgentToolCall = {
          callId: msg.call_id as string,
          name: msg.name as string,
          arguments: (msg.arguments ?? {}) as Record<string, unknown>,
        };
        callbacks.onToolCall?.(tool);
        break;
      }

      case "input.speech.started": {
        lastEvent = "input.speech.started";
        break;
      }

      case "session.ended": {
        isConnected = false;
        callbacks.onEnded?.();
        break;
      }

      case "session.error": {
        callbacks.onError?.(msg.code as string, msg.message as string);
        break;
      }
    }
  };

  ws.onerror = () => {
    // Pre-handshake failures (UNAUTHORIZED etc.) surface as close 1006
    // — no session.error payload arrives in this case
    callbacks.onError?.("connection_error", "WebSocket connection failed");
  };

  ws.onclose = (event) => {
    isConnected = false;
    if (!event.wasClean) {
      // Network drop — session preserved for 30s, could session.resume here
      callbacks.onError?.("disconnected", `Connection closed unexpectedly (${event.code})`);
    }
  };

  // --- Public API ---

  function startAudio(stream: MediaStream) {
    if (mediaRecorder) return; // already streaming

    // getUserMedia with echo cancellation (recommended for browser voice agents)
    // Audio: PCM 24kHz mono — use MediaRecorder with audio/pcm if supported,
    // otherwise timesliced webm chunks are fine for the base64 path
    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm",
      audioBitsPerSecond: 128000,
    });

    recorder.ondataavailable = async (e) => {
      if (!isConnected || e.data.size === 0) return;
      const buf = await e.data.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      ws.send(JSON.stringify({ type: "input.audio", audio: base64 }));
    };

    // ~50ms chunks — recommended by AssemblyAI docs
    recorder.start(50);
    mediaRecorder = recorder;
  }

  function stopAudio() {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder = null;
    }
  }

  function sendToolResult(callId: string, result: unknown, isError = false) {
    pendingTools.push({ callId, result, isError });
    flushPendingTools();
  }

  function end() {
    stopAudio();
    if (ws.readyState === WebSocket.OPEN) {
      // session.end stops billing immediately (vs just closing the socket
      // which keeps the session alive for 30s and continues billing)
      ws.send(JSON.stringify({ type: "session.end" }));
    }
  }

  return {
    startAudio,
    stopAudio,
    sendToolResult,
    end,
    get connected() {
      return isConnected;
    },
  };
}
