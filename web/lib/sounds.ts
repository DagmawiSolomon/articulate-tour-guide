import { bind as cuelumeBind, play, setEnabled, setVolume, type SoundName } from "cuelume";

/**
 * Initialize cuelume delegated interaction listeners and master volume.
 * Call once on application mount in client.
 */
export function initSounds(): void {
  if (typeof window === "undefined") return;
  try {
    cuelumeBind();
    setVolume(0.35); // Subtle, non-intrusive volume balanced for docent desk
    const enabled = isSoundEnabled();
    setEnabled(enabled);
  } catch (err) {
    console.warn("Failed to initialize cuelume sound engine:", err);
  }
}

/**
 * Check if sound effects are enabled in user preferences.
 */
export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("articulate_sound_effects");
  return stored !== "false";
}

/**
 * Persist and update cuelume playback enabled state.
 */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("articulate_sound_effects", enabled ? "true" : "false");
  try {
    setEnabled(enabled);
  } catch (err) {
    console.warn("Failed to set cuelume enabled state:", err);
  }
}

// Semantic sound helpers mapped to cuelume's synthesized recipes
export const playCallStart = () => play("ready", { volume: 0.4 });
export const playCallEnd = () => play("droplet", { volume: 0.35 });
export const playMute = () => play("toggle", { volume: 0.35 });
export const playUnmute = () => play("toggle", { volume: 0.35 });
export const playStageOpen = () => play("arrival", { volume: 0.45 });
export const playStageClose = () => play("release", { volume: 0.35 });
export const playSettingsOpen = () => play("bloom", { volume: 0.4 });
export const playSettingsClose = () => play("droplet", { volume: 0.35 });
export const playTactileTap = () => play("tick", { volume: 0.3 });
export const playSuccess = () => play("success", { volume: 0.4 });
export const playToggle = () => play("toggle", { volume: 0.35 });
export const playThinking = () => play("loading", { volume: 0.3 });
export const playSpeaking = () => play("ready", { volume: 0.35 });

export { play, type SoundName };
