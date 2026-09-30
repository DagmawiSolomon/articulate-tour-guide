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
  /** Reply whose function call produced this tool request. */
  replyId?: string;
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
  /** Visitor stopped speaking (input.speech.stopped) */
  onUserSpeakingStop?: () => void;
  /** Raw base64 PCM audio chunk from the agent */
  onAgentAudio?: (base64: string) => void;
  /** Agent wants to call a tool — respond with sendToolResult() */
  onToolCall?: (tool: AgentToolCall) => void;
  /** Session is ready (after session.ready) */
  onReady?: (sessionId: string) => void;
  /** Session ended cleanly */
  onEnded?: (reason: VoiceAgentEndReason) => void;
  /** An error occurred */
  onError?: (code: string, message: string) => void;
};

export type VoiceAgentEndReason =
  | { type: "ended"; code?: string; message?: string }
  | { type: "expired"; code?: string; message?: string }
  | { type: "disconnected"; code?: number; message: string }
  | { type: "failed"; code?: string; message: string };

export type VoiceAgent = {
  /** Start streaming mic audio to the agent */
  startAudio: (stream: MediaStream) => void;
  /** Stop sending audio (keep WS open) */
  stopAudio: () => void;
  /** Send the result of a tool call back to the agent */
  sendToolResult: (callId: string, result: unknown, isError?: boolean, replyId?: string) => void;
  /** Add non-spoken context to the conversation without requesting a reply */
  sendContext: (content: string) => void;
  /** Ask the agent to generate a reply right now, optionally with one-shot instructions */
  triggerReply: (instructions?: string) => void;
  /** End the session cleanly — stops billing immediately */
  end: () => void;
  /** Whether the WebSocket is currently open */
  readonly connected: boolean;
  readonly ready: boolean;
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
  const tokenRes = await fetch("/api/agent-token", { cache: "no-store" });
  if (!tokenRes.ok) {
    const { error } = await tokenRes.json().catch(() => ({ error: "unknown" }));
    throw new Error(`Failed to get agent token: ${error}`);
  }
  const tokenData = await tokenRes.json();
  const token = tokenData.token;
  const agentId = tokenData.agentId;
  const maxSessionDurationSeconds = Number(tokenData.maxSessionDurationSeconds) || 180;

  // 2. Open WebSocket with token as query param
  const wsUrl = `wss://agents.assemblyai.com/v1/ws?token=${encodeURIComponent(token)}`;
  const ws = new WebSocket(wsUrl);

  let isConnected = false;
  let sessionStartTime: number | null = null;
  let maxDurationTimer: ReturnType<typeof setTimeout> | null = null;
  let sessionEndReason: VoiceAgentEndReason | null = null;
  let endedNotified = false;
  let manuallyEnded = false;
  let mediaRecorder: MediaRecorder | null = null;
  let lastEvent: string | null = null;
  let lastCompletedReplyId: string | null = null;
  let lastCompletedReplyInterrupted = false;
  let activeReplyId: string | null = null;
  let awaitingReplyStart = false;
  let queuedReplyInstructions: string | null = null;
  let queuedReplySpeechEpoch = 0;
  let userSpeechEpoch = 0;
  let userSpeechActive = false;
  const pendingTools: Array<{ callId: string; replyId?: string; result: unknown; isError: boolean }> = [];
  const pendingToolCallReplies = new Map<string, string>();

  function hasOutstandingToolCalls(replyId: string | null) {
    return Boolean(replyId && Array.from(pendingToolCallReplies.values()).includes(replyId));
  }

  function sendReplyNow(instructions?: string) {
    if (!isConnected || ws.readyState !== WebSocket.OPEN) return;
    awaitingReplyStart = true;
    ws.send(JSON.stringify({
      type: "reply.create",
      ...(instructions ? { instructions } : {}),
    }));
  }

  // Flush only results belonging to the exact completed reply.
  function flushPendingTools() {
    if (lastEvent !== "reply.done" || lastCompletedReplyInterrupted || pendingTools.length === 0) return;
    if (!isConnected || ws.readyState !== WebSocket.OPEN) return;
    const readyTools = pendingTools.filter((tool) => !tool.replyId || tool.replyId === lastCompletedReplyId);
    pendingTools.length = 0;
    for (const t of readyTools) {
      ws.send(
        JSON.stringify({
          type: "tool.result",
          call_id: t.callId,
          result: JSON.stringify(t.result),
          is_error: t.isError,
        })
      );
      pendingToolCallReplies.delete(t.callId);
      awaitingReplyStart = true;
    }
    pendingTools.length = 0;
  }

  ws.onopen = () => {
    isConnected = true;
    console.log("[AssemblyAI] WebSocket opened. Binding agent ID:", agentId);
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
    // A newer event means a delayed tool result can no longer be sent for the
    // previously completed reply. Retire any calls that were still waiting.
    if (lastEvent === "reply.done" && type !== "reply.done" && lastCompletedReplyId) {
      for (const [callId, replyId] of pendingToolCallReplies) {
        if (replyId === lastCompletedReplyId) pendingToolCallReplies.delete(callId);
      }
    }
    // Tool results are valid only while reply.done is the latest server event.
    lastEvent = type;

    switch (type) {
      case "session.ready": {
        sessionStartTime = Date.now();
        console.log("[AssemblyAI] Session ready:", {
          sessionId: msg.session_id,
          maxDurationSeconds: maxSessionDurationSeconds,
          readyAt: new Date(sessionStartTime).toISOString(),
        });

        // Client-side duration timer: per official AssemblyAI Voice Agent documentation,
        // client-side timer enforcement is required to finalize and end sessions when
        // max_session_duration_seconds is hit:
        // "There is no 'closing soon' warning event before the session ends, so if
        // you need to finalize gracefully... run a client-side timer using the value you passed here."
        if (maxSessionDurationSeconds > 0) {
          if (maxDurationTimer) clearTimeout(maxDurationTimer);
          maxDurationTimer = setTimeout(() => {
            if (!isConnected || endedNotified || manuallyEnded) return;
            console.warn(`[AssemblyAI] Session reached duration cap (${maxSessionDurationSeconds}s). Ending session.`);
            sessionEndReason = {
              type: "expired",
              code: "session_expired",
              message: `Session reached the ${maxSessionDurationSeconds}-second duration limit.`,
            };
            try {
              ws.send(JSON.stringify({ type: "session.end" }));
            } catch {
              // ignore
            }
            if (!endedNotified) {
              endedNotified = true;
              callbacks.onEnded?.(sessionEndReason);
            }
            try {
              ws.close(1000, "Max duration reached");
            } catch {
              // ignore
            }
          }, maxSessionDurationSeconds * 1000);
        }

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
        // A newer spoken request supersedes a queued UI teaser or navigation reply.
        queuedReplyInstructions = null;
        userSpeechActive = false;
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
        activeReplyId = typeof msg.reply_id === "string" ? msg.reply_id : null;
        awaitingReplyStart = false;
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
        const completedReplyId = typeof msg.reply_id === "string" ? msg.reply_id : activeReplyId;
        const interrupted = (msg.status as string) === "interrupted";
        lastCompletedReplyId = completedReplyId;
        lastCompletedReplyInterrupted = interrupted;
        if (!completedReplyId || activeReplyId === completedReplyId) activeReplyId = null;
        awaitingReplyStart = false;
        if (interrupted) {
          // Barge-in: discard results belonging to the reply that was interrupted.
          for (let i = pendingTools.length - 1; i >= 0; i--) {
            if (!completedReplyId || pendingTools[i].replyId === completedReplyId) pendingTools.splice(i, 1);
          }
          for (const [callId, replyId] of pendingToolCallReplies) {
            if (!completedReplyId || replyId === completedReplyId) pendingToolCallReplies.delete(callId);
          }
        } else {
          flushPendingTools();
        }
        callbacks.onAgentSpeakingEnd?.(interrupted);
        if (interrupted && queuedReplyInstructions !== null && queuedReplySpeechEpoch < userSpeechEpoch) {
          // A UI request made before the visitor started speaking is stale. Keep a
          // newer UI action queued if it came from handling that spoken turn.
          queuedReplyInstructions = null;
        }
        if (!interrupted && queuedReplyInstructions !== null && !awaitingReplyStart && !hasOutstandingToolCalls(completedReplyId)) {
          const nextInstructions = queuedReplyInstructions;
          queuedReplyInstructions = null;
          sendReplyNow(nextInstructions || undefined);
        }
        break;
      }

      case "tool.call": {
        console.log("[Agent] Tool call received:", msg);
        // arguments (not args) per April 2026 rename
        const callId = msg.call_id as string;
        if (activeReplyId) pendingToolCallReplies.set(callId, activeReplyId);
        const tool: AgentToolCall = {
          callId,
          replyId: activeReplyId ?? undefined,
          name: msg.name as string,
          arguments: (msg.arguments ?? {}) as Record<string, unknown>,
        };
        callbacks.onToolCall?.(tool);
        break;
      }

      case "input.speech.started": {
        userSpeechEpoch += 1;
        userSpeechActive = true;
        queuedReplyInstructions = null;
        callbacks.onUserSpeakingStart?.();
        break;
      }

      case "input.speech.stopped": {
        userSpeechActive = false;
        callbacks.onUserSpeakingStop?.();
        break;
      }

      case "session.ended": {
        isConnected = false;
        if (maxDurationTimer) {
          clearTimeout(maxDurationTimer);
          maxDurationTimer = null;
        }
        const code = typeof msg.code === "string" ? msg.code : undefined;
        const message = typeof msg.message === "string" ? msg.message : undefined;
        const detail = String(code ?? "") + " " + String(message ?? "");
        const duration = typeof msg.session_duration_seconds === "number" ? msg.session_duration_seconds : null;
        const audioDuration = typeof msg.audio_duration_seconds === "number" ? msg.audio_duration_seconds : null;
        console.log("[AssemblyAI] session.ended received:", {
          duration,
          audioDuration,
          code,
          message,
          elapsedSeconds: sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : null,
        });
        const reachedDurationLimit = duration !== null && duration >= (maxSessionDurationSeconds || 180);
        const previousExpiry = sessionEndReason?.type === "expired" ? sessionEndReason : null;
        const isExpired = previousExpiry !== null || reachedDurationLimit || /expir|duration|time.?limit|maximum.*session|session.*maximum/i.test(detail);
        sessionEndReason = isExpired
          ? previousExpiry ?? { type: "expired", code, message: message || `Session duration limit (${duration ?? 180}s) reached.` }
          : { type: "ended", code, message };
        if (!endedNotified) {
          endedNotified = true;
          callbacks.onEnded?.(sessionEndReason);
        }
        break;
      }

      case "session.error": {
        const code = typeof msg.code === "string" ? msg.code : "agent_error";
        const message = typeof msg.message === "string" ? msg.message : "Voice session failed.";
        console.warn("[AssemblyAI] session.error received:", { code, message });
        const isExpired = code.toLowerCase() === "session_expired" || /duration|expir/i.test(code);
        sessionEndReason = isExpired ? { type: "expired", code, message } : { type: "failed", code, message };
        if (isExpired && !endedNotified) {
          if (maxDurationTimer) {
            clearTimeout(maxDurationTimer);
            maxDurationTimer = null;
          }
          endedNotified = true;
          callbacks.onEnded?.(sessionEndReason);
        } else if (!isExpired) {
          callbacks.onError?.(code, message);
        }
        break;
      }
    }
  };

  ws.onerror = () => {
    if (sessionEndReason?.type === "expired") return;
    // Pre-handshake failures (UNAUTHORIZED etc.) surface as close 1006
    // — no session.error payload arrives in this case
    sessionEndReason = { type: "failed", code: "connection_error", message: "WebSocket connection failed" };
    callbacks.onError?.("connection_error", "WebSocket connection failed");
  };

  ws.onclose = (event) => {
    if (maxDurationTimer) {
      clearTimeout(maxDurationTimer);
      maxDurationTimer = null;
    }
    const wasActive = isConnected;
    isConnected = false;
    const elapsedSeconds = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : null;
    console.log("[AssemblyAI] WebSocket closed:", {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
      elapsedSeconds,
      sessionEndReason,
    });

    // Check if provider closed with 1008 (session cap policy violation) or reason text
    const isCloseExpired =
      sessionEndReason?.type === "expired" ||
      event.code === 1008 ||
      /expir|duration|time.?limit|maximum/i.test(event.reason || "");

    if (isCloseExpired && !sessionEndReason) {
      sessionEndReason = {
        type: "expired",
        code: String(event.code),
        message: event.reason || `Session duration limit reached (${event.code}).`,
      };
    }

    if (!manuallyEnded && !endedNotified && (wasActive || !event.wasClean || isCloseExpired)) {
      endedNotified = true;
      callbacks.onEnded?.(sessionEndReason ?? (event.wasClean
        ? { type: "ended", code: String(event.code), message: event.reason || "Session ended." }
        : { type: "disconnected", code: event.code, message: event.reason || "Connection closed unexpectedly (" + event.code + ")" }));
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

  function sendToolResult(callId: string, result: unknown, isError = false, replyId?: string) {
    const originatingReplyId = replyId ?? pendingToolCallReplies.get(callId);
    if (originatingReplyId) {
      if (lastCompletedReplyId === originatingReplyId) {
        if (lastEvent !== "reply.done" || lastCompletedReplyInterrupted) return;
      } else if (activeReplyId !== originatingReplyId) {
        return;
      }
    }
    pendingTools.push({ callId, replyId: originatingReplyId, result, isError });
    flushPendingTools();
  }

  function triggerReply(instructions?: string) {
    if (!isConnected || ws.readyState !== WebSocket.OPEN) {
      console.warn("[Agent] triggerReply ignored - WS not ready. isConnected:", isConnected, "readyState:", ws?.readyState);
      return;
    }
    if (userSpeechActive) {
      // If the visitor is actively speaking into the mic, queue the UI instruction
      // so the agent responds after the visitor finishes.
      queuedReplyInstructions = instructions ?? "";
      queuedReplySpeechEpoch = userSpeechEpoch;
      return;
    }
    console.log("[Agent] triggerReply sending reply.create immediately. Length:", instructions?.length);
    sendReplyNow(instructions);
  }

  function sendContext(content: string) {
    if (!content.trim() || !isConnected || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "conversation.message", role: "system", content }));
  }

  function end() {
    manuallyEnded = true;
    if (maxDurationTimer) {
      clearTimeout(maxDurationTimer);
      maxDurationTimer = null;
    }
    pendingTools.length = 0;
    pendingToolCallReplies.clear();
    queuedReplyInstructions = null;
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
    sendContext,
    triggerReply,
    end,
    get connected() {
      return isConnected;
    },
    get ready() {
      return isConnected && ws.readyState === WebSocket.OPEN;
    },
  };
}
