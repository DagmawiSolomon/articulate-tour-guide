"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { HugeIcon } from "@/components/ui/hugeicon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MicOff01Icon,
  Mic01Icon,
  Cancel01Icon,
  CallEnd01Icon,
  CallPaused02Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { ArticulateAvatar } from "@/components/avatar/articulate-avatar";
import {
  type ExpressionId,
} from "@/components/avatar/avatar-expressions";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  initSounds,
  playCallStart,
  playCallEnd,
  playMute,
  playUnmute,
  playStageOpen,
  playStageClose,
  playTactileTap,
  playToggle,
} from "@/lib/sounds";

type AgentStatus = "listening" | "thinking" | "speaking";

const LISTENING_EMOTIONS: ExpressionId[] = [
  "listening",
  "interested",
  "curious",
  "happy",
  "shy",
];

const THINKING_EMOTIONS: ExpressionId[] = [
  "thinking",
  "focused",
  "confused",
];

export default function Home() {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isTourActive, setIsTourActive] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = React.useState(false);
  const [activeExpressionId, setActiveExpressionId] = React.useState<ExpressionId>("neutral");
  const [agentStatus, setAgentStatus] = React.useState<AgentStatus>("listening");
  const [isMuted, setIsMuted] = React.useState(true);

  // Fixed card geometry.
  const tuning = {
    cornerMargin: 0,
    cradleGap: 6,
    shoulderRadius: 14,
    closeSize: 34,
  };

  // Auto-progress conversational states and cycle emotions according to active agentStatus
  React.useEffect(() => {
    if (!isTourActive) {
      setAgentStatus("listening");
      setActiveExpressionId("neutral");
      return;
    }

    if (isPaused) {
      setActiveExpressionId("neutral");
      return;
    }

    if (isMuted) {
      setActiveExpressionId("muted");
      return;
    }

    let emotionIdx = 0;
    let emotionInterval: NodeJS.Timeout | null = null;

    if (agentStatus === "speaking") {
      setActiveExpressionId("speaking");
    } else if (agentStatus === "thinking") {
      setActiveExpressionId("thinking");
      emotionInterval = setInterval(() => {
        emotionIdx = (emotionIdx + 1) % THINKING_EMOTIONS.length;
        setActiveExpressionId(THINKING_EMOTIONS[emotionIdx]);
      }, 2400);
    } else if (agentStatus === "listening") {
      setActiveExpressionId("listening");
      emotionInterval = setInterval(() => {
        emotionIdx = (emotionIdx + 1) % LISTENING_EMOTIONS.length;
        setActiveExpressionId(LISTENING_EMOTIONS[emotionIdx]);
      }, 2400);
    }

    // Conversational flow progression
    const flowDuration = agentStatus === "listening" ? 8000 : agentStatus === "thinking" ? 4000 : 6000;
    const flowTimer = setTimeout(() => {
      setAgentStatus((prev) =>
        prev === "listening" ? "thinking" : prev === "thinking" ? "speaking" : "listening"
      );
    }, flowDuration);

    return () => {
      if (emotionInterval) clearInterval(emotionInterval);
      clearTimeout(flowTimer);
    };
  }, [isTourActive, agentStatus, isMuted, isPaused]);

  const mediaStreamRef = React.useRef<MediaStream | null>(null);

  const stopMic = React.useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }
    setIsMuted(true);
  }, []);

  const startMic = React.useCallback(async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        stream.getAudioTracks().forEach((track) => {
          track.enabled = true;
        });
        setIsMuted(false);
        return stream;
      }
    } catch (err) {
      console.warn("Microphone access error or denied:", err);
      setIsMuted(true);
    }
    return null;
  }, []);

  const toggleMic = React.useCallback(async () => {
    if (isMuted) {
      playUnmute();
      await startMic();
    } else {
      playMute();
      stopMic();
    }
  }, [isMuted, startMic, stopMic]);

  React.useEffect(() => {
    initSounds();
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStartTour = async () => {
    playCallStart();
    setIsTourActive(true);
    setIsPaused(false);
    setAgentStatus("listening");
    setActiveExpressionId("listening");
    await startMic();
  };

  const handleConfirmEndTour = () => {
    playCallEnd();
    setIsEndDialogOpen(false);
    setIsTourActive(false);
    setIsPaused(false);
    setIsExpanded(false);
    setActiveExpressionId("neutral");
    stopMic();
  };

  const togglePause = React.useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
      if (next) {
        playToggle();
        setActiveExpressionId("neutral");
      } else {
        playCallStart();
        setActiveExpressionId("listening");
      }
      return next;
    });
  }, []);

  const isListening = isTourActive && !isMuted && !isPaused && activeExpressionId === "listening";

  // A rounded corner cutout houses the avatar without changing the card bounds.
  const avatarNotchPath = "M 104 0.5 C 95 0.5 88 7.5 88 16.5 L 88 58 C 88 68 80 76 70 76 L 18.5 76 C 8.5 76 0.5 84 0.5 94";
  const avatarNotchMask = `${avatarNotchPath} L -4 94 L -4 -4 L 104 -4 Z`;
  // Dynamic top-right inverted border radius (outer edge of circle matches top and right borders)
  const btnRadius = tuning.closeSize / 2;
  const cornerMargin = tuning.cornerMargin;
  const cradleRadius = btnRadius + tuning.cradleGap;
  const shoulderR = tuning.shoulderRadius;

  const cornerS = Math.max(Math.ceil(btnRadius + cornerMargin + cradleRadius + shoulderR + 24), 80);
  const xRight = cornerS - 0.5;
  const yTop = 0.5;

  // Center of the circle: placed so outer edge aligns with card borders
  const cx = xRight - btnRadius - cornerMargin;
  const cy = yTop + btnRadius + cornerMargin;

  // Shoulder circle tangent to top border (yTop) and externally tangent to cradle circle
  const dy = cy - (yTop + shoulderR);
  const distCenters = cradleRadius + shoulderR;
  const dx = Math.sqrt(Math.max(0, distCenters * distCenters - dy * dy));

  const s1x = cx - dx;
  const s2y = cy + dx;

  // Tangent points between shoulder arcs and concentric cradle arc
  const ratio = shoulderR / distCenters;
  const t1x = s1x + ratio * (cx - s1x);
  const t1y = (yTop + shoulderR) + ratio * (cy - (yTop + shoulderR));
  const t2x = (xRight - shoulderR) + ratio * (cx - (xRight - shoulderR));
  const t2y = s2y - ratio * dx;

  const cornerNotchPath = `M ${s1x} ${yTop} A ${shoulderR} ${shoulderR} 0 0 1 ${t1x} ${t1y} A ${cradleRadius} ${cradleRadius} 0 0 0 ${t2x} ${t2y} A ${shoulderR} ${shoulderR} 0 0 1 ${xRight} ${s2y}`;
  const cornerNotchMask = `${cornerNotchPath} L ${cornerS + 4} ${s2y} L ${cornerS + 4} -4 L ${s1x} -4 Z`;

  const micControl = (
    <Button
      type="button"
      onClick={toggleMic}
      aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
      title={isMuted ? "Unmute microphone" : "Mute microphone"}
      variant="outline"
      className={`size-9 rounded-full p-0 border border-border cursor-pointer transition-all active:scale-95 flex items-center justify-center ${
        isMuted
          ? "bg-muted text-secondary-text hover:bg-soft hover:text-foreground"
          : "bg-card hover:bg-muted text-foreground"
      }`}
    >
      <HugeIcon icon={isMuted ? MicOff01Icon : Mic01Icon} size={16} />
    </Button>
  );

  const pauseControl = (
    <Button
      type="button"
      onClick={togglePause}
      aria-label={isPaused ? "Resume tour" : "Pause tour"}
      title={isPaused ? "Resume tour" : "Pause tour"}
      variant="outline"
      className={`size-9 rounded-full p-0 border border-border cursor-pointer transition-all active:scale-95 flex items-center justify-center ${
        isPaused
          ? "bg-muted text-foreground hover:bg-soft"
          : "bg-card hover:bg-muted text-secondary-text hover:text-foreground"
      }`}
    >
      <HugeIcon icon={isPaused ? PlayIcon : CallPaused02Icon} size={16} />
    </Button>
  );

  const endControl = (
    <Button
      type="button"
      onClick={() => {
        playTactileTap();
        setIsEndDialogOpen(true);
      }}
      aria-label="End tour"
      title="End tour"
      className="h-9 px-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer transition-all active:scale-95 shadow-xs"
    >
      <HugeIcon
        icon={CallEnd01Icon}
        size={15}
        color="#ffffff"
        className="text-white shrink-0"
      />
      <span>End</span>
    </Button>
  );

  const handleToggleExpanded = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (next) {
        playStageOpen();
      } else {
        playStageClose();
      }
      return next;
    });
  };

  const isEffectivelyMuted = isTourActive && isMuted;
  const statusLabel = isPaused
    ? "Paused"
    : isEffectivelyMuted
    ? "Muted"
    : agentStatus;
  const areDotsActive = isTourActive && !isMuted && !isPaused;

  const statusIndicator = (
    <button
      type="button"
      onClick={() => {
        playTactileTap();
        if (isPaused) {
          togglePause();
          return;
        }
        setAgentStatus((prev) =>
          prev === "listening" ? "thinking" : prev === "thinking" ? "speaking" : "listening"
        );
      }}
      className="h-7 px-2 flex items-center gap-1.5 text-xs font-medium text-[#72706b] hover:text-[#1f1e1b] transition-colors cursor-pointer select-none bg-transparent border-0 tracking-[-0.1px]"
      title={isPaused ? "Click to resume tour" : "Click to advance conversational status"}
    >
      <span className="capitalize font-medium text-[#72706b]">
        {statusLabel}
      </span>
      <span className="inline-flex items-center gap-1 ml-0.5">
        <span className={`size-1.5 rounded-full bg-[#72706b] ${areDotsActive ? "animate-bounce [animation-delay:-0.3s]" : "opacity-60"}`} />
        <span className={`size-1.5 rounded-full bg-[#72706b] ${areDotsActive ? "animate-bounce [animation-delay:-0.15s]" : "opacity-60"}`} />
        <span className={`size-1.5 rounded-full bg-[#72706b] ${areDotsActive ? "animate-bounce" : "opacity-60"}`} />
      </span>
    </button>
  );

  // Call group preserves exact 184px container width, fitted inside 224px cradle notch
  const callGroup = (
    <div
      className="flex h-[52px] w-[184px] items-center justify-center gap-1.5 rounded-full border border-border bg-card px-2 shadow-xs"
      role="group"
      aria-label="Tour controls"
    >
      {micControl}
      <span className="h-5 w-px shrink-0 bg-border" aria-hidden="true" />
      {pauseControl}
      {endControl}
    </div>
  );

  // Monotonic shoulders meet the capsule at its widest points, avoiding a lower bulge.
  const dockPath = "M 0 63.5 C 12 63.5 14 53.5 14 37.5 A 32 32 0 0 1 46 5.5 H 178 A 32 32 0 0 1 210 37.5 C 210 53.5 212 63.5 224 63.5";

  return (
    <div className="h-dvh min-h-[480px] w-full bg-background flex overflow-hidden select-none relative">
      <div className="flex-1 min-w-0 h-full grid grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden relative">
        <Header />
        <main className="min-h-0 h-full w-full max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-6 relative flex items-stretch justify-center">

          {!isTourActive ? (
            /* Full-page "Start tour" landing card */
            <button
              type="button"
              onClick={handleStartTour}
              aria-label="Start tour"
              className="w-full h-full max-h-[660px] 2xl:max-h-[740px] rounded-2xl border border-border bg-card shadow-xs overflow-hidden cursor-pointer group transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.006] active:scale-[0.994] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring flex flex-col"
            >
              {/* ── Image mosaic: top 55% ─────────────────────── */}
              <div className="relative flex-1 min-h-0 w-full overflow-hidden">
                {/* Three-panel masonry: left wide + right column stacked */}
                <div className="absolute inset-0 flex gap-0.5">
                  {/* Left: gallery hall – wider panel */}
                  <div className="relative flex-[2] overflow-hidden">
                    <img
                      src="/museum-gallery.jpg"
                      alt="Museum gallery corridor"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20" />
                  </div>
                  {/* Right column: two stacked panels */}
                  <div className="flex-1 flex flex-col gap-0.5">
                    <div className="relative flex-1 overflow-hidden">
                      <img
                        src="/museum-bust.jpg"
                        alt="Roman marble bust"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15" />
                    </div>
                    <div className="relative flex-1 overflow-hidden">
                      <img
                        src="/museum-artifact.jpg"
                        alt="Museum artifact"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Text content: bottom portion ──────────────── */}
              <div className="shrink-0 flex flex-col items-center justify-center text-center px-8 py-7 gap-4 border-t border-border">
                {/* Title + description */}
                <div className="space-y-1.5">
                  <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.1px] text-foreground">
                    Start tour
                  </h1>
                  <p className="text-sm text-secondary-text tracking-[-0.1px] max-w-xs mx-auto leading-relaxed">
                    Begin your voice-guided journey with Mr. Triangle, your AI docent for this exhibition.
                  </p>
                </div>

                {/* CTA */}
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-medium tracking-[-0.1px] shadow-xs group-hover:bg-primary/90 transition-all">
                  <HugeIcon icon={PlayIcon} size={14} color="#ffffff" className="text-white shrink-0" />
                  <span>Begin tour</span>
                </div>
              </div>
            </button>
          ) : (
            /* Active Tour Stage */
            <div className="guide-stage relative w-full h-full max-h-[660px] 2xl:max-h-[740px]" data-expanded={isExpanded}>
              <div className="guide-card-layer absolute inset-0" inert={!isExpanded} aria-hidden={!isExpanded}>
                <div className="guide-card w-full h-full rounded-2xl border border-border bg-card shadow-xs relative flex items-center justify-center overflow-visible">

                  <div
                    className="absolute -top-px -right-px pointer-events-none z-10 flex items-start justify-end"
                    style={{
                      width: cornerS,
                      height: cornerS,
                    }}
                  >
                    <svg
                      viewBox={`0 0 ${cornerS} ${cornerS}`}
                      style={{ width: cornerS, height: cornerS }}
                      className="overflow-visible"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Mask card background & corner borders */}
                      <path
                        d={cornerNotchMask}
                        className="fill-background"
                      />
                      {/* Seamless C1-continuous hairline reverse fillet border */}
                      <path
                        d={cornerNotchPath}
                        className="stroke-border"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Close Button: Circle with X icon inside, outer edges flush with top and right borders */}
                  <button
                    type="button"
                    onClick={() => {
                      playStageClose();
                      setIsExpanded(false);
                    }}
                    title="Close artifact stage"
                    aria-label="Close artifact stage"
                    style={{
                      top: tuning.cornerMargin - 1,
                      right: tuning.cornerMargin - 1,
                      width: tuning.closeSize,
                      height: tuning.closeSize,
                    }}
                    className="absolute rounded-full bg-card hover:bg-muted text-secondary-text hover:text-foreground border border-border flex items-center justify-center transition-all cursor-pointer z-20 shadow-xs active:scale-95"
                  >
                    <HugeIcon icon={Cancel01Icon} size={15} />
                  </button>

                  {/* Top-Left Avatar Notch: Houses Mr. T at top-left */}
                  <div className="absolute -top-px -left-px pointer-events-none z-10" aria-hidden="true">
                    <svg viewBox="0 0 105 95" width="105" height="95" fill="none" className="overflow-visible">
                      <path d={avatarNotchMask} className="fill-background" />
                      <path d={avatarNotchPath} className="stroke-border" strokeWidth="1" />
                    </svg>
                  </div>

                  <div className="w-full h-full px-6 md:px-8 pt-28 pb-20" />

                  {/* Bottom Pill Cradle Notch: Frames the dock */}
                  <div className="absolute -bottom-px left-1/2 -translate-x-1/2 z-20 h-16 w-[224px] pointer-events-none" aria-hidden="true">
                    <svg viewBox="0 0 224 64" width="224" height="64" fill="none" className="overflow-visible">
                      <path d={`${dockPath} L 224 68 L 0 68 Z`} className="fill-background" />
                      <path d={dockPath} className="stroke-border" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
              </div>
              {/* One persistent avatar travels between the two positions. */}
              <button
                type="button"
                className="guide-avatar absolute z-20 border-0 bg-transparent p-0 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                onClick={handleToggleExpanded}
                aria-label={isExpanded ? "Close card" : "Open card"}
                aria-expanded={isExpanded}
              >
                <ArticulateAvatar
                  expressionId={activeExpressionId}
                  size={480}
                  isListening={isListening}
                  isMuted={isTourActive && isMuted}
                  className="relative flex items-center justify-center"
                />
              </button>

              {/* Status Indicator: Positioned directly below Mr. T with padding */}
              <div
                className="guide-status"
                inert={isExpanded}
                aria-hidden={isExpanded}
              >
                {statusIndicator}
              </div>

              {/* Persistent Media Dock: Exact same position at bottom whether uncollapsed or collapsed */}
              <div className="guide-dock" role="group" aria-label="Tour controls">
                {callGroup}
              </div>

            </div>
          )}
        </main>
        <Footer />
      </div>

      {/* Confirmation Dialog: End Tour */}
      <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl p-6 bg-card border border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-[-0.1px] text-foreground">
              End tour?
            </DialogTitle>
            <DialogDescription className="text-sm text-secondary-text tracking-[-0.1px] mt-1.5 leading-relaxed">
              Are you sure you want to end your tour? This will disconnect your conversation session with Mr. Triangle.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                playTactileTap();
                setIsEndDialogOpen(false);
              }}
              className="h-9 px-4 rounded-full text-xs font-medium tracking-[-0.1px] cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmEndTour}
              className="h-9 px-4 rounded-full text-xs font-medium tracking-[-0.1px] bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
            >
              End tour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
