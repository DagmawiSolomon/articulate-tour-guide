"use client";

import * as React from "react";

interface UseOutputAudioLevelOptions {
  decay?: number;
  attack?: number;
  sensitivity?: number;
}

export function useOutputAudioLevel(
  getLevel: () => number,
  enabled: boolean = true,
  options: UseOutputAudioLevelOptions = {}
): number {
  const [audioLevel, setAudioLevel] = React.useState(0);
  const { decay = 0.82, attack = 0.5, sensitivity = 5.0 } = options;

  React.useEffect(() => {
    if (!enabled) {
      setAudioLevel(0);
      return;
    }

    let animationFrame = 0;
    let smoothedLevel = 0;
    let lastDispatchTime = 0;
    const updateLevel = (time: number) => {
      const rms = getLevel();
      const rawLevel = Math.min(1, Math.max(0, rms - 0.012) * sensitivity);
      smoothedLevel = rawLevel > smoothedLevel
        ? smoothedLevel + (rawLevel - smoothedLevel) * attack
        : smoothedLevel * decay;
      if (smoothedLevel < 0.008) smoothedLevel = 0;

      if (time - lastDispatchTime > 16) {
        lastDispatchTime = time;
        setAudioLevel(smoothedLevel);
      }
      animationFrame = requestAnimationFrame(updateLevel);
    };

    animationFrame = requestAnimationFrame(updateLevel);
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [getLevel, enabled, attack, decay, sensitivity]);

  return audioLevel;
}
