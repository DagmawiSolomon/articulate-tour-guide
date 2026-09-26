/**
 * assemblyai-audio.ts
 *
 * Plays streamed base64-encoded PCM audio chunks from the Voice Agent API.
 *
 * The Voice Agent sends audio/pcm at 24kHz, 16-bit signed int, mono,
 * base64-encoded. We decode each chunk and queue it into the Web Audio API
 * for gapless playback.
 *
 * On barge-in (user interrupts the agent), call flush() to stop playback
 * immediately and clear the buffer.
 */

export function createAudioPlayer() {
  let ctx: AudioContext | null = null;
  let nextStartTime = 0;
  const activeSources = new Set<AudioBufferSourceNode>();
  let completionTimer: NodeJS.Timeout | null = null;
  let currentGeneration = 0;

  const SAMPLE_RATE = 24000;

  function getContext(): AudioContext {
    if (!ctx || ctx.state === "closed") {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AudioCtxClass();
      nextStartTime = 0;
    }
    return ctx;
  }

  /**
   * Decode a base64-encoded PCM chunk and schedule it for playback.
   * Chunks are queued so they play back-to-back without gaps.
   */
  function playChunk(base64: string) {
    if (!base64 || typeof base64 !== "string") {
      return;
    }

    const chunkGeneration = currentGeneration;
    const audioCtx = getContext();

    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    // Decode base64 → Uint8Array
    // AssemblyAI may use URL-safe base64 or include newlines/prefixes.
    let cleanBase64 = base64
      .replace(/^data:.*,/, "")
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .replace(/\s/g, "");

    // Add missing padding if needed
    const padLen = cleanBase64.length % 4;
    if (padLen > 0) {
      cleanBase64 += "=".repeat(4 - padLen);
    }

    let binary = "";
    try {
      binary = atob(cleanBase64);
    } catch {
      return;
    }

    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Ensure even byte length for 16-bit PCM
    const evenLength = bytes.length - (bytes.length % 2);
    if (evenLength <= 0) return;

    // PCM 16-bit signed int (little-endian) → Float32
    const pcm16 = new Int16Array(bytes.buffer, bytes.byteOffset, evenLength / 2);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768;
    }

    // If flushed while decoding, drop immediately
    if (chunkGeneration !== currentGeneration) {
      return;
    }

    // Create AudioBuffer and schedule it (resampled automatically to hardware rate)
    const buffer = audioCtx.createBuffer(1, float32.length, SAMPLE_RATE);
    buffer.copyToChannel(float32, 0);

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);

    activeSources.add(source);
    source.onended = () => {
      activeSources.delete(source);
    };

    const now = audioCtx.currentTime;
    const startAt = Math.max(now, nextStartTime);
    source.start(startAt);
    nextStartTime = startAt + buffer.duration;
  }

  /**
   * Schedule a callback when all queued audio buffers have finished playing through the speakers.
   */
  function onPlaybackComplete(callback: () => void) {
    if (completionTimer) {
      clearTimeout(completionTimer);
      completionTimer = null;
    }

    if (!ctx || ctx.state === "closed" || activeSources.size === 0 || ctx.currentTime >= nextStartTime) {
      callback();
      return;
    }

    const remainingMs = Math.max(0, (nextStartTime - ctx.currentTime) * 1000);
    const scheduledGeneration = currentGeneration;

    completionTimer = setTimeout(() => {
      completionTimer = null;
      if (scheduledGeneration === currentGeneration) {
        callback();
      }
    }, remainingMs);
  }

  /**
   * Stop playback immediately and clear all scheduled buffers.
   * Preserves AudioContext so subsequent playback retains user-gesture authorization.
   */
  function flush() {
    currentGeneration++;
    if (completionTimer) {
      clearTimeout(completionTimer);
      completionTimer = null;
    }

    for (const source of activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {}
    }
    activeSources.clear();
    nextStartTime = 0;
  }

  /**
   * Permanently closes the AudioContext on session end/unmount.
   */
  function close() {
    flush();
    if (ctx && ctx.state !== "closed") {
      try {
        ctx.close();
      } catch {}
      ctx = null;
    }
  }

  /**
   * Resume the AudioContext if the browser suspended it.
   * Call this inside a user gesture (e.g. mic button tap).
   */
  async function resume() {
    const audioCtx = getContext();
    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }
  }

  return {
    playChunk,
    flush,
    close,
    resume,
    onPlaybackComplete,
    get isPlaying() {
      return Boolean(
        ctx &&
          ctx.state === "running" &&
          (activeSources.size > 0 || ctx.currentTime < nextStartTime)
      );
    },
    get remainingSeconds() {
      if (!ctx || ctx.state === "closed") return 0;
      return Math.max(0, nextStartTime - ctx.currentTime);
    },
  };
}

export type AudioPlayer = ReturnType<typeof createAudioPlayer>;
