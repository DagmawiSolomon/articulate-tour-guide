"use client";

import * as React from "react";

interface UseMicAudioLevelOptions {
  /** Smoothing factor for volume drop (0 to 1, default 0.8) */
  decay?: number;
  /** Attack factor for sudden voice spikes (0 to 1, default 0.45) */
  attack?: number;
  /** Sensitivity multiplier for human speech (default: 4.5) */
  sensitivity?: number;
}

/**
 * High-sensitivity microphone audio level hook.
 * Uses Web Audio API time-domain RMS analysis with auto-resume on user gestures,
 * ensuring immediate and unmistakable reactivity to conversational speech.
 */
export function useMicAudioLevel(
  stream: MediaStream | null,
  enabled: boolean = true,
  options: UseMicAudioLevelOptions = {}
): number {
  const [audioLevel, setAudioLevel] = React.useState<number>(0);
  const { decay = 0.82, attack = 0.5, sensitivity = 5.0 } = options;

  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const sourceRef = React.useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const smoothedLevelRef = React.useRef<number>(0);

  React.useEffect(() => {
    // Check if stream has live, enabled audio tracks
    const hasLiveTracks =
      stream &&
      stream.getAudioTracks().some((t) => t.readyState === "live" && t.enabled);

    if (!enabled || !stream || !hasLiveTracks) {
      smoothedLevelRef.current = 0;
      setAudioLevel(0);
      return;
    }

    let isMounted = true;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      const tryResume = () => {
        if (audioCtx.state === "suspended") {
          audioCtx.resume().catch(() => {});
        }
      };

      tryResume();
      // Listen for any user click/tap to guarantee AudioContext resumption
      window.addEventListener("click", tryResume, { once: true });
      window.addEventListener("touchstart", tryResume, { once: true });

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.2;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);

      let lastDispatchTime = 0;

      const updateLevel = (time: number) => {
        if (!isMounted) return;

        // Use time-domain data (oscilloscope waveform) to measure true sound pressure
        analyser.getByteTimeDomainData(dataArray);

        let sumSquares = 0;
        for (let i = 0; i < bufferLength; i++) {
          // Centered at 128 (silence)
          const norm = (dataArray[i] - 128) / 128;
          sumSquares += norm * norm;
        }

        const rms = Math.sqrt(sumSquares / bufferLength);

        // Noise gate at 0.012 to reject quiet room hum, then apply high sensitivity
        const speechSignal = Math.max(0, rms - 0.012);
        const rawLevel = Math.min(1, speechSignal * sensitivity);

        // Smooth envelope follower: fast attack (snaps to voice onset), organic decay
        const prev = smoothedLevelRef.current;
        let next = prev;
        if (rawLevel > prev) {
          next = prev + (rawLevel - prev) * attack;
        } else {
          next = prev * decay;
        }

        if (next < 0.008) next = 0;
        smoothedLevelRef.current = next;

        // Dispatch state updates at 60fps for buttery smooth reactivity
        if (time - lastDispatchTime > 16) {
          lastDispatchTime = time;
          setAudioLevel(next);
        }

        rafRef.current = requestAnimationFrame(updateLevel);
      };

      rafRef.current = requestAnimationFrame(updateLevel);
    } catch (err) {
      console.warn("Could not initialize mic audio analyser:", err);
    }

    return () => {
      isMounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch {}
        sourceRef.current = null;
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close().catch(() => {});
        } catch {}
        audioCtxRef.current = null;
      }
      smoothedLevelRef.current = 0;
      setAudioLevel(0);
    };
  }, [stream, enabled, attack, decay, sensitivity]);

  return audioLevel;
}
