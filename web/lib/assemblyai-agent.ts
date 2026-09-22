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
        console.log("[Agent] Session ready full config:", msg);
        callbacks.onReady?.(msg.session_id as string);
        break;
      }

      case "transcript.user.delta": {
        // Cumulative partial — render latest, don't concatenate
        callbacks.onTranscriptPartial?.(msg.text as string);
        break;
      }

      case "transcript.user": {
        console.log("[Agent] User transcript final:", msg.text);
        callbacks.onTranscriptFinal?.(msg.text as string);
        break;
      }

      case "reply.started": {
        lastEvent = "reply.started";
        callbacks.onAgentSpeakingStart?.();
        break;
      }

      case "reply.audio": {
        const base64 = msg.audio || msg.data || msg.audio_data;
        if (!base64) {
          console.warn("reply.audio missing base64 data:", msg);
        } else {
          callbacks.onAgentAudio?.(base64 as string);
        }
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
        console.log("[Agent] Tool call received:", msg);
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

  let audioCtx: AudioContext | null = null;
  let micSource: MediaStreamAudioSourceNode | null = null;
  let processor: ScriptProcessorNode | null = null;

  function startAudio(stream: MediaStream) {
    if (audioCtx) return; // already streaming

    // Voice Agent API defaults to PCM 24kHz mono
    audioCtx = new AudioContext({ sampleRate: 24000 });
    micSource = audioCtx.createMediaStreamSource(stream);
    
    // 2048 samples = ~85ms chunks at 24kHz
    processor = audioCtx.createScriptProcessor(2048, 1, 1);

    processor.onaudioprocess = (e) => {
      if (!isConnected || ws.readyState !== WebSocket.OPEN) return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Resample to 24000 Hz if the browser ignored our sampleRate request
      const targetRate = 24000;
      const sourceRate = audioCtx!.sampleRate;
      let resampled = inputData;
      
      if (sourceRate !== targetRate) {
        const ratio = sourceRate / targetRate;
        const newLength = Math.round(inputData.length / ratio);
        resampled = new Float32Array(newLength);
        for (let i = 0; i < newLength; i++) {
          resampled[i] = inputData[Math.floor(i * ratio)];
        }
      }
      
      // Convert Float32 to Int16
      const int16 = new Int16Array(resampled.length);
      for (let i = 0; i < resampled.length; i++) {
        const s = Math.max(-1, Math.min(1, resampled[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      
      // Encode Int16Array to base64
      const bytes = new Uint8Array(int16.buffer);
      // Fast conversion for small buffers
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      
      ws.send(JSON.stringify({ type: "input.audio", audio: base64 }));
    };

    // To prevent the mic from looping to the speakers, we connect to a zero-gain node
    // Note: ScriptProcessor must be connected to destination to fire onaudioprocess in some browsers
    const silentGain = audioCtx.createGain();
    silentGain.gain.value = 0;
    
    micSource.connect(processor);
    processor.connect(silentGain);
    silentGain.connect(audioCtx.destination);
  }

  function stopAudio() {
    if (processor) {
      processor.disconnect();
      processor = null;
    }
    if (micSource) {
      micSource.disconnect();
      micSource = null;
    }
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
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
