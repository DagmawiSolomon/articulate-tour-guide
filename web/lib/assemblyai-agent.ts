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
  onAgentTranscriptPartial?: (text: string) => void;
  onAgentTranscriptFinal?: (text: string) => void;
  /** Agent started speaking (reply.started) */
  onAgentSpeakingStart?: () => void;
  /** Agent finished speaking or was interrupted (reply.done) */
  onAgentSpeakingEnd?: (interrupted: boolean) => void;
  /** Visitor started speaking (input.speech.started) */
  onUserSpeakingStart?: () => void;
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
  /** Ask the agent to generate a reply right now, optionally with one-shot instructions */
  triggerReply: (instructions?: string) => void;
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
  callbacks: VoiceAgentCallbacks,
  options?: { isMuted?: boolean }
): Promise<VoiceAgent> {
  const isMuted = options?.isMuted ?? true;
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
  let toolFlushTimer: NodeJS.Timeout | null = null;
  const pendingTools: Array<{ callId: string; result: unknown; isError: boolean }> = [];

  // Helper: flush pending tool results when reply.done is the latest event or forced
  function flushPendingTools(force = false) {
    if ((!force && lastEvent !== "reply.done") || pendingTools.length === 0) return;
    if (!isConnected || ws.readyState !== WebSocket.OPEN) return;
    if (toolFlushTimer) {
      clearTimeout(toolFlushTimer);
      toolFlushTimer = null;
    }
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
        callbacks.onTranscriptFinal?.((msg.text as string) || "");
        break;
      }

      case "transcript.agent.delta": {
        if (msg.text === undefined && msg.delta === undefined) {
          console.log("[Agent] transcript.agent.delta missing text/delta:", msg);
        }
        callbacks.onAgentTranscriptPartial?.((msg.text as string) || (msg.delta as string) || "");
        break;
      }

      case "transcript.agent": {
        console.log("[Agent] Agent transcript final:", msg.text);
        callbacks.onAgentTranscriptFinal?.((msg.text as string) || "");
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
        if (toolFlushTimer) {
          clearTimeout(toolFlushTimer);
          toolFlushTimer = null;
        }
        const interrupted = (msg.status as string) === "interrupted";
        if (interrupted) {
          // Barge-in: formally acknowledge any pending tools as interrupted so server turn state resolves cleanly
          if (isConnected && ws.readyState === WebSocket.OPEN) {
            for (const t of pendingTools) {
              ws.send(
                JSON.stringify({
                  type: "tool.result",
                  call_id: t.callId,
                  result: JSON.stringify({ success: false, status: "interrupted" }),
                  is_error: true,
                })
              );
            }
          }
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
        callbacks.onUserSpeakingStart?.();
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
    const wasActive = isConnected;
    isConnected = false;
    if (wasActive) {
      callbacks.onEnded?.();
    }
    if (!event.wasClean) {
      // Network drop — session preserved for 30s, could session.resume here
      callbacks.onError?.("disconnected", `Connection closed unexpectedly (${event.code})`);
    }
  };

  // --- Public API ---

  let audioCtx: AudioContext | null = null;
  let micSource: MediaStreamAudioSourceNode | null = null;
  let processor: AudioWorkletNode | null = null;
  let dummySink: MediaStreamAudioDestinationNode | null = null;
  let workletUrl: string | null = null;

  const workletCode = `
class PcmProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0];
      for (let i = 0; i < channelData.length; i++) {
        this.buffer[this.bufferIndex++] = channelData[i];
        if (this.bufferIndex >= this.bufferSize) {
          this.port.postMessage(this.buffer);
          this.buffer = new Float32Array(this.bufferSize);
          this.bufferIndex = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor('pcm-processor', PcmProcessor);
  `;

  async function startAudio(stream: MediaStream) {
    if (audioCtx) return; // already streaming

    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtxClass();
    audioCtx = ctx;

    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn("Could not resume mic AudioContext:", err);
      }
    }

    micSource = ctx.createMediaStreamSource(stream);
    
    if (!workletUrl) {
      const blob = new Blob([workletCode], { type: 'application/javascript' });
      workletUrl = URL.createObjectURL(blob);
    }
    
    try {
      await ctx.audioWorklet.addModule(workletUrl);
    } catch (err) {
      console.warn("Failed to load AudioWorklet, falling back...", err);
      return;
    }
    
    // Safety guard: if stopAudio() or end() was called while awaiting addModule
    if (!audioCtx || audioCtx !== ctx || ctx.state === "closed") {
      return;
    }

    processor = new AudioWorkletNode(ctx, 'pcm-processor');

    processor.port.onmessage = (e) => {
      if (!isConnected || ws.readyState !== WebSocket.OPEN) return;
      if (!audioCtx || audioCtx.state === "closed") return;
      
      const inputData = e.data as Float32Array;
      
      // Resample to 24000 Hz if the browser ignored our sampleRate request
      const targetRate = 24000;
      const sourceRate = audioCtx.sampleRate;
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

    micSource.connect(processor);
    // Connect to a virtual null sink to clock the worklet without outputting to physical speakers
    dummySink = ctx.createMediaStreamDestination();
    processor.connect(dummySink);
  }

  function stopAudio() {
    if (processor) {
      processor.disconnect();
      processor = null;
    }
    if (dummySink) {
      dummySink.disconnect?.();
      dummySink = null;
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
    // If agent is NOT actively speaking a transition phrase, dispatch immediately (prevents deadlocks)
    if (lastEvent !== "reply.started") {
      if (isConnected && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "tool.result",
            call_id: callId,
            result: JSON.stringify(result),
            is_error: isError,
          })
        );
      }
      return;
    }

    // Otherwise, agent is actively mid-phrase; queue until reply.done with 500ms safety timeout
    pendingTools.push({ callId, result, isError });
    if (toolFlushTimer) clearTimeout(toolFlushTimer);
    toolFlushTimer = setTimeout(() => {
      flushPendingTools(true);
    }, 500);
  }

  function triggerReply(instructions?: string) {
    if (isConnected && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "reply.create",
          ...(instructions ? { instructions } : {}),
        })
      );
    }
  }

  function end() {
    if (toolFlushTimer) {
      clearTimeout(toolFlushTimer);
      toolFlushTimer = null;
    }
    stopAudio();
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;
    if (ws.readyState === WebSocket.OPEN) {
      // session.end stops billing immediately (vs just closing the socket
      // which keeps the session alive for 30s and continues billing)
      try {
        ws.send(JSON.stringify({ type: "session.end" }));
        ws.close(1000, "Tour agent session ended cleanly");
      } catch {}
    } else {
      try {
        ws.close();
      } catch {}
    }
    isConnected = false;
  }

  return {
    startAudio,
    stopAudio,
    sendToolResult,
    triggerReply,
    end,
    get connected() {
      return isConnected;
    },
  };
}
