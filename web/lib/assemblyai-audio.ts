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

  const SAMPLE_RATE = 24000;

  function getContext(): AudioContext {
    if (!ctx || ctx.state === "closed") {
      ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
      nextStartTime = 0;
    }
    return ctx;
  }

  /**
   * Decode a base64-encoded PCM chunk and schedule it for playback.
   * Chunks are queued so they play back-to-back without gaps.
   */
  function playChunk(base64: string) {
    const audioCtx = getContext();

    // Decode base64 → Uint8Array
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // PCM 16-bit signed int (little-endian) → Float32
    const pcm16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768;
    }

    // Create AudioBuffer and schedule it
    const buffer = audioCtx.createBuffer(1, float32.length, SAMPLE_RATE);
    buffer.copyToChannel(float32, 0);

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    const startAt = Math.max(now, nextStartTime);
    source.start(startAt);
    nextStartTime = startAt + buffer.duration;
  }

  /**
   * Stop playback immediately and clear the queue.
   * Call this on barge-in (when user interrupts the agent).
   */
  function flush() {
    if (ctx) {
      ctx.close();
      ctx = null;
      nextStartTime = 0;
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

  return { playChunk, flush, resume };
}

export type AudioPlayer = ReturnType<typeof createAudioPlayer>;
