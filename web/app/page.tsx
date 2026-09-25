"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { HugeIcon } from "@/components/ui/hugeicon";
import { HugeiconsIcon } from "@hugeicons/react";
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
  CallDisabled02Icon,
  PauseIcon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { ArticulateAvatar } from "@/components/avatar/articulate-avatar";
import {
  type ExpressionId,
} from "@/components/avatar/avatar-expressions";
import { SettingsDialog } from "@/components/layout/settings-dialog";
import { Footer } from "@/components/layout/footer";
import { ArtifactStage, type ArtifactType, type ChatMessage } from "@/components/artifacts/artifact-stage";
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
import type { VoiceAgent } from "@/lib/assemblyai-agent";
import type { AudioPlayer } from "@/lib/assemblyai-audio";
import { BayerDitherBackground } from "@/components/ui/bayer-dither-background";

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
  const [visitorName, setVisitorName] = React.useState("Visitor");
  const [isPaused, setIsPaused] = React.useState(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = React.useState(false);
  const [isExhibitInfoOpen, setIsExhibitInfoOpen] = React.useState(false);
  const [activeExpressionId, setActiveExpressionId] = React.useState<ExpressionId>("neutral");
  const [agentStatus, setAgentStatus] = React.useState<AgentStatus>("listening");
  const [isMuted, setIsMuted] = React.useState(true);
  const [activeArtifact, setActiveArtifact] = React.useState<ArtifactType>("info");
  const [originMapRoute, setOriginMapRoute] = React.useState<string>("entrance");
  const [activeMapRoute, setActiveMapRoute] = React.useState<string>("entrance");
  const [activeHotspotId, setActiveHotspotId] = React.useState<"cypress" | "star" | "steeple" | "vortex" | "moon" | undefined>(undefined);
  // Dev toggle: simulates the isLoading state triggered by tool.call / tool.result.
  // Will be wired to real events once voice is connected.
  const [isArtifactLoading, setIsArtifactLoading] = React.useState(false);
  // Chat history state â€” messages accumulate as the tour progresses.
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [isChatThinking, setIsChatThinking] = React.useState(false);
  const [summaryData, setSummaryData] = React.useState<any>(null);
  // Partial visitor transcript ID â€” updated in place as partials arrive
  const partialMsgIdRef = React.useRef<string>("visitor-partial");
  const partialAgentMsgIdRef = React.useRef<string>("agent-partial");
  // Voice Agent + audio player refs
  const agentRef = React.useRef<VoiceAgent | null>(null);
  const audioPlayerRef = React.useRef<AudioPlayer | null>(null);

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

    // agentStatus is now driven by real Voice Agent events (reply.started / reply.done)
    // â€” no fake progression timer needed.
    return () => {
      if (emotionInterval) clearInterval(emotionInterval);
    };
  }, [isTourActive, agentStatus, isMuted, isPaused]);

  const mediaStreamRef = React.useRef<MediaStream | null>(null);

  const stopMic = React.useCallback(() => {
    // Stop sending audio to the agent (keep WS open)
    agentRef.current?.stopAudio();
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
        // Echo cancellation on, noiseSuppression off (Voice Agent API handles
        // server-side noise suppression â€” stacking client-side adds artifacts)
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: true },
        });
        mediaStreamRef.current = stream;
        stream.getAudioTracks().forEach((track) => {
          track.enabled = true;
        });
        // Resume AudioContext (must be inside a user gesture)
        await audioPlayerRef.current?.resume();
        // Start streaming audio to the agent
        agentRef.current?.startAudio(stream);
        setIsMuted(false);
        return stream;
      }
    } catch (err) {
      console.warn("Microphone access error or denied:", err);
      setIsMuted(true);
      if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        alert("Microphone access was denied. Please allow microphone access in your browser settings to speak with the guide.");
      } else {
        alert("Could not access the microphone. Please check your system settings.");
      }
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
      agentRef.current?.end();
      audioPlayerRef.current?.flush();
    };
  }, []);

  const handleStartTour = () => {
    playCallStart();
    setIsTourActive(true);
    setIsExpanded(true);
    setActiveArtifact("map");
    setIsPaused(false);
    setIsMuted(true);
    setAgentStatus("listening");
    setActiveExpressionId("listening");
    setChatMessages([]);
    setIsChatThinking(false);
    setOriginMapRoute("entrance");
    setActiveMapRoute("entrance");
  };

  const handleConfirmEndTour = async () => {
    playCallEnd();
    setIsEndDialogOpen(false);
    
    // Stop mic and agent session cleanly immediately
    stopMic();
    agentRef.current?.end();
    agentRef.current = null;
    audioPlayerRef.current?.flush();
    audioPlayerRef.current = null;

    // Reset back to pre-tour state
    setIsTourActive(false);
    setIsPaused(false);
    setIsExpanded(false);
    setActiveArtifact("info");
    setActiveExpressionId("neutral");
    setChatMessages([]);
    setIsChatThinking(false);
    setSummaryData(null);
    setOriginMapRoute("entrance");
    setActiveMapRoute("entrance");
  };

  const togglePause = React.useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
      if (next) {
        playToggle();
        setActiveExpressionId("neutral");
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getAudioTracks().forEach((track) => {
            track.enabled = false;
          });
        }
      } else {
        playCallStart();
        setActiveExpressionId("listening");
        if (mediaStreamRef.current && !isMuted) {
          mediaStreamRef.current.getAudioTracks().forEach((track) => {
            track.enabled = true;
          });
        }
      }
      return next;
    });
  }, [isMuted]);

  const isListening = isTourActive && !isMuted && !isPaused && activeExpressionId === "listening";


  // Bottom cradle notch with a comfortable 10px margin framing the dock
  const bottomDockNotchPath =
    "M 0 44.5 C 16 44.5 24 38 28 28 C 32 16 40 6.5 54 6.5 H 202 C 216 6.5 224 16 228 28 C 232 38 240 44.5 256 44.5";

  // Original top-right inverted border radius (outer edge of circle matches top and right borders)
  const btnRadius = tuning.closeSize / 2;
  const cornerMargin = tuning.cornerMargin;
  const cradleRadius = btnRadius + tuning.cradleGap;
  const shoulderR = tuning.shoulderRadius;

  const cornerS = Math.max(Math.ceil(btnRadius + cornerMargin + cradleRadius + shoulderR + 24), 80);
  const xRight = cornerS - 0.5;
  const yTop = 0.5;

  const cx = xRight - btnRadius - cornerMargin;
  const cy = yTop + btnRadius + cornerMargin;

  const dy = cy - (yTop + shoulderR);
  const distCenters = cradleRadius + shoulderR;
  const dx = Math.sqrt(Math.max(0, distCenters * distCenters - dy * dy));

  const s1x = cx - dx;
  const s2y = cy + dx;

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
      disabled
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
      className="call-group-pause-btn size-9 rounded-full p-0 flex items-center justify-center cursor-pointer transition-all active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-none shrink-0"
    >
      <HugeIcon
        icon={isPaused ? PlayIcon : PauseIcon}
        size={15}
        color="#ffffff"
        className="text-white shrink-0"
      />
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
      className="call-group-end-btn size-9 rounded-full p-0 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0 border-0 shadow-none"
    >
      <HugeIcon
        icon={CallDisabled02Icon}
        size={16}
        color="#ffffff"
        className="text-white shrink-0"
      />
    </Button>
  );

  const handleToggleExpanded = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (next) {
        playStageOpen();
        // Default to chat tab when opening the card
        setActiveArtifact("map");
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

  // Call group: horizontal dock at bottom with settings & mic on the left, divider, and pause & end on the right
  const callGroup = (
    <div
      className="call-group-container flex h-[52px] w-[192px] items-center justify-center gap-1.5 rounded-full border border-border bg-card px-2 shadow-xs transition-all duration-300"
      role="group"
      aria-label="Tour controls"
    >
      <SettingsDialog />
      {micControl}
      <span className="call-group-divider h-5 w-px shrink-0 bg-border mx-0.5" aria-hidden="true" />
      {pauseControl}
      {endControl}
    </div>
  );

  // Concentric cradle notch with balanced 10px margin around the 192x52px dock capsule
  const dockPath =
    "M 0 67.5 C 13 67.5 16 56 16 41.5 A 36 36 0 0 1 52 5.5 H 192 A 36 36 0 0 1 228 41.5 C 228 56 231 67.5 244 67.5";

  return (
    <div className={`relative h-dvh min-h-[480px] w-full flex overflow-hidden ${!isTourActive ? "bg-white" : "bg-background"}`}>
      <div className="relative z-[2] flex-1 min-w-0 h-full grid grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
        <main
          className={
            !isTourActive
              ? "min-h-0 h-full w-full relative flex items-stretch overflow-y-auto"
              : "min-h-0 h-full w-full max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 pt-5 pb-6 sm:pt-6 sm:pb-8 relative flex items-center justify-center overflow-visible"
          }
        >
          {!isTourActive ? (
            /* ── Start Tour Landing ── */
            <div className="flex h-full w-full flex-col items-center bg-white font-sans">
              <div
                className="relative w-full shrink-0 overflow-hidden bg-[#172d3c]"
                style={{ height: "min(63.75vh, calc(100% - 12rem))", minHeight: "16rem" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/hero-collage-picked.png"
                  alt="A grainy cut-paper collage of two distinct painted portraits and a still life"
                  className="block h-full w-full object-cover object-center"
                />
              </div>

              <section className="flex w-full flex-1 items-center bg-white">
                <div className="mx-auto grid w-full max-w-6xl h-full grid-cols-1 items-center gap-8 px-6 py-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12">
                  <h1 className="max-w-[34rem] font-outfit text-3xl font-normal leading-[1.06] tracking-[-0.025em] text-[#171717] sm:text-4xl lg:text-5xl">
                    <span className="block">Turning Points</span>
                    <span className="block">in Art History</span>
                  </h1>

                  <div className="ml-auto flex w-fit max-w-[31rem] flex-col items-stretch gap-4 font-sans md:justify-self-end">
                    <p className="w-full text-left text-base leading-relaxed font-normal" style={{ color: "#1f1e1b", opacity: 1 }}>
                      <span className="block">An imagined gallery of art that shaped history,</span>
                      <span className="block">from ancient icons to modern masterpieces.</span>
                    </p>
                    <div className="flex w-fit flex-wrap items-center justify-start gap-2.5 self-start">
                      <button
                        type="button"
                        onClick={handleStartTour}
                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-5 font-sans text-sm font-medium cursor-pointer transition-all active:scale-[0.96]"
                        style={{ background: "var(--ink)", color: "#fff" }}
                      >
                        Start tour
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14m-6-6l6 6-6 6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsExhibitInfoOpen(true)}
                        className="inline-flex h-10 shrink-0 items-center justify-center rounded-full px-5 font-sans text-sm font-medium cursor-pointer transition-colors hover:bg-zinc-200"
                        style={{ background: "#f4f4f5", color: "#1f1e1b" }}
                      >
                        About the exhibit
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            /* Active Tour Stage */
            <div className="guide-stage relative w-full h-full max-h-[min(90vh,860px)] 2xl:max-h-[940px]" data-expanded={isExpanded}>
              <div className={`guide-card-layer absolute inset-0 ${activeArtifact !== 'summary' ? 'md:left-24' : ''}`} inert={!isExpanded} aria-hidden={!isExpanded}>
                <div className="guide-card w-full h-full rounded-2xl border border-border bg-card shadow-xs relative flex items-center justify-center overflow-visible">

                  {/* Top-Right Original Inverted Corner Notch: Houses the close button (kept exactly as requested) */}
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
                      <path d={cornerNotchMask} className="fill-background" />
                      <path
                        d={cornerNotchPath}
                        className="stroke-border"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Original Close Button in top-right notch */}
                  <button
                    type="button"
                    onClick={() => {
                      playStageClose();
                      if (activeArtifact === "summary") {
                        window.location.reload();
                      } else {
                        setIsExpanded(false);
                      }
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

                  {/* Artifact Stage - clean canvas utilizing the entire newly formed card as working area */}
                  <div
                    className={`w-full h-full overflow-hidden ${
                      activeArtifact === "map" || activeArtifact === "summary"
                        ? "p-0 rounded-2xl"
                        : "pt-14 pb-16 px-3 md:p-5 md:pb-16 md:pr-14"
                    }`}
                  >
                    <ArtifactStage
                      artifactType={activeArtifact}
                      mapDisplay="exhibition"
                      mapRouteId={activeMapRoute}
                      originMapRouteId={originMapRoute}
                      hotspotId={activeHotspotId}
                      isLoading={isArtifactLoading}
                      chatMessages={chatMessages}
                      isChatThinking={isChatThinking}
                      summaryData={summaryData}
                      onSelectArtifact={(type, params) => {
                        setActiveArtifact(type);
                        if (params?.routeId) setActiveMapRoute(params.routeId as any);
                        if (params?.hotspotId) setActiveHotspotId(params.hotspotId as any);
                        playTactileTap();
                      }}
                    />
                  </div>

                  {/* Bottom Pill Cradle Notch: Frames the dock with balanced 10px margin */}
                  {activeArtifact !== "summary" && (
                    <div
                      className="absolute -bottom-px left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                      style={{ width: 244, height: 68 }}
                      aria-hidden="true"
                    >
                      <svg
                        viewBox="0 0 244 68"
                        width="244"
                        height="68"
                        fill="none"
                        className="overflow-visible"
                      >
                        <path d={`${dockPath} L 244 72 L 0 72 Z`} className="fill-background" />
                        <path d={dockPath} className="stroke-border" strokeWidth="1" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              {/* One persistent avatar travels between the two positions. */}
              {activeArtifact !== "summary" && (
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
              )}

              {/* Status Indicator: Positioned directly below Mr. T with padding */}
              {activeArtifact !== "summary" && (
                <div
                  className="guide-status"
                  inert={isExpanded}
                  aria-hidden={isExpanded}
                >
                  {statusIndicator}
                </div>
              )}

              {/* Persistent Media Dock: Exact same position at bottom whether uncollapsed or collapsed */}
              {activeArtifact !== "summary" && (
                <div className="guide-dock" role="group" aria-label="Tour controls">
                  {callGroup}
                </div>
              )}

            </div>
          )}
        </main>
        {/* Footer with brand logo and clean fallback view switcher positioned outside the main stage view */}
        <footer className="relative z-[4] w-full max-w-6xl mx-auto px-6 py-3 flex items-center justify-between text-xs text-secondary-text select-none">
          <div>
            Made by{" "}
            <span className="font-semibold text-foreground tracking-[-0.1px]">
              Dagmawi Solomon
            </span>
          </div>

          <div>
            Powered by{" "}
            <a
              href="https://www.assemblyai.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-zinc-600 hover:text-black underline underline-offset-3 decoration-current/80 transition-colors"
            >
              assemblyai
            </a>
          </div>
        </footer>
      </div>

      <Dialog open={isExhibitInfoOpen} onOpenChange={setIsExhibitInfoOpen}>
        <DialogContent showCloseButton={false} className="grid max-h-[calc(100dvh-2rem)] w-full grid-cols-1 gap-0 overflow-y-auto rounded-none border-0 bg-white p-0 sm:h-[460px] sm:max-w-[760px] sm:grid-cols-[0.72fr_1fr] sm:overflow-hidden">
          <button
            type="button"
            aria-label="Close about exhibit"
            title="Close"
            onClick={() => setIsExhibitInfoOpen(false)}
            className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-white text-[#1f1e1b] shadow-md transition-colors hover:bg-[#e5e7eb] hover:text-[#1f1e1b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f1e1b]"
          >
            <HugeIcon icon={Cancel01Icon} size={16} />
          </button>          <div className="flex min-h-[360px] flex-col justify-between p-7 sm:min-h-0 sm:p-8">
            <div className="flex flex-col items-start gap-6">
              <DialogHeader>
                <DialogTitle className="max-w-[15rem] font-outfit text-3xl font-normal leading-tight tracking-normal">
                  Turning Points in Art History
                </DialogTitle>
              </DialogHeader>
              <button
                type="button"
                onClick={() => {
                  setIsExhibitInfoOpen(false);
                  void handleStartTour();
                }}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-5 font-sans text-sm font-medium cursor-pointer transition-all active:scale-[0.96]"
                style={{ background: "var(--ink)", color: "#fff" }}
              >
                Start tour
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14m-6-6l6 6-6 6" />
                </svg>
              </button>
            </div>
            <DialogDescription className="mt-10 max-w-[17rem] font-sans text-sm leading-relaxed text-[#3f3f46]">
              Journey through an imagined collection of history’s most influential artworks, from ancient icons to modern masterpieces, and discover the ideas that changed art along the way.
            </DialogDescription>
          </div>
          <div className="relative min-h-64 sm:min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/about-oil-painting.png"
              alt="An oil still life of wildflowers in an ochre vase"
              className="h-64 w-full object-cover object-center sm:h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
      {/* Confirmation Dialog: End Tour */}
      <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>End tour?</DialogTitle>
            <DialogDescription>
              Are you sure you want to end your tour? This will disconnect your conversation session with Mr. Triangle.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                playTactileTap();
                setIsEndDialogOpen(false);
              }}
              className="rounded-lg h-9 px-4 text-sm font-medium bg-card hover:bg-subtle border border-border text-foreground cursor-pointer shadow-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleConfirmEndTour}
              className="rounded-lg h-9 px-4 text-sm font-medium cursor-pointer"
            >
              End tour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
