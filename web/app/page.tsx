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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeExpressionId, setActiveExpressionId] = React.useState<ExpressionId>("neutral");
  const [agentStatus, setAgentStatus] = React.useState<AgentStatus>("listening");
  const [isMuted, setIsMuted] = React.useState(true);
  const [activeArtifact, setActiveArtifact] = React.useState<ArtifactType>("info");
  const [activeMapRoute, setActiveMapRoute] = React.useState<"restrooms" | "gauguin" | "elevator">("restrooms");
  const [activeHotspotId, setActiveHotspotId] = React.useState<"cypress" | "star" | "steeple">("cypress");
  // Dev toggle: simulates the isLoading state triggered by tool.call / tool.result.
  // Will be wired to real events once voice is connected.
  const [isArtifactLoading, setIsArtifactLoading] = React.useState(false);
  // Chat history state — messages accumulate as the tour progresses.
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [isChatThinking, setIsChatThinking] = React.useState(false);
  const demoTimersRef = React.useRef<NodeJS.Timeout[]>([]);

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
    setIsExpanded(true);
    setActiveArtifact("info");
    setIsPaused(false);
    setAgentStatus("listening");
    setActiveExpressionId("listening");
    // Reset chat and kick off the scripted demo sequence
    setChatMessages([]);
    setIsChatThinking(false);
    demoTimersRef.current.forEach(clearTimeout);
    demoTimersRef.current = [];

    // Helper to schedule a message and track the timer
    const after = (ms: number, fn: () => void) => {
      const t = setTimeout(fn, ms);
      demoTimersRef.current.push(t);
    };
    const uid = () => Math.random().toString(36).slice(2);
    const now = () => new Date();

    // ── Scripted demo conversation ──────────────────────────────────────────
    // t=1.5s  Visitor partial
    after(1500, () =>
      setChatMessages([{ id: "v-partial", role: "visitor", text: "Can you tell me about this painting?", isPartial: true, timestamp: now() }])
    );
    // t=3s    Visitor final
    after(3000, () =>
      setChatMessages([{ id: "v-1", role: "visitor", text: "Can you tell me about this painting?", timestamp: now() }])
    );
    // t=3.2s  Thinking
    after(3200, () => setIsChatThinking(true));
    // t=5.5s  Agent streams response with Beautiful UI StreamingText
    after(5500, () => {
      setIsChatThinking(false);
      const fullText = "Of course! You're looking at The Starry Night — painted by Vincent van Gogh in June 1889 from his room at the Saint-Paul-de-Mausole asylum in Saint-Rémy-de-Provence.";
      setChatMessages((prev) => [
        ...prev,
        { id: uid(), role: "agent", text: fullText, timestamp: now() },
      ]);
    });
    // t=17s   Visitor asks about the cypresses
    after(17000, () =>
      setChatMessages((prev) => [...prev, { id: "v-partial-2", role: "visitor", text: "What about those dark shapes?", isPartial: true, timestamp: now() }])
    );
    after(18500, () =>
      setChatMessages((prev) => [
        ...prev.filter((m) => m.id !== "v-partial-2"),
        { id: "v-2", role: "visitor", text: "What about those dark shapes?", timestamp: now() },
      ])
    );
    after(18700, () => setIsChatThinking(true));
    // t=20.5s Tool call badge (ToolChips with clickable artifact action)
    after(20500, () => {
      setIsChatThinking(false);
      setChatMessages((prev) => [
        ...prev,
        {
          id: "tool-1",
          role: "tool",
          toolName: "show_hotspots",
          label: "Zooming to: Cypress Flame",
          artifactType: "hotspots",
          params: { hotspotId: "cypress" },
          detail: "High-resolution inspection focused on foreground cypresses",
          timestamp: now(),
        },
      ]);
    });
    // t=21s   Agent explains cypress with Beautiful UI StreamingText
    after(21000, () => {
      const fullText = "Those are cypress trees — Van Gogh was obsessed with them. They appear almost flame-like, connecting the turbulent earth to the swirling heavens above.";
      setChatMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "agent",
          text: fullText,
          timestamp: now(),
          artifactTokens: [
            { text: "Those" }, { text: "are" },
            {
              text: "cypress trees",
              artifactTarget: {
                type: "hotspots",
                label: "Cypress Hotspot",
                params: { hotspotId: "cypress" },
              },
            },
            { text: "—" }, { text: "Van" }, { text: "Gogh" }, { text: "was" },
            { text: "obsessed" }, { text: "with" }, { text: "them." },
            { text: "They" }, { text: "appear" }, { text: "almost" },
            { text: "flame-like," }, { text: "connecting" }, { text: "the" },
            { text: "turbulent" }, { text: "earth" }, { text: "to" },
            { text: "the" }, { text: "swirling" }, { text: "heavens" },
            { text: "above." },
          ],
        },
      ]);
    });
    // t=28s   Docent syncs map location
    after(28000, () => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: "tool-2",
          role: "tool",
          toolName: "highlight_map_location",
          label: "Gallery 37: 19th Century Post-Impressionism",
          artifactType: "map",
          params: { routeId: "restrooms" },
          detail: "Position verified on Museum Level 2 Floorplan",
          timestamp: now(),
        },
      ]);
    });
    await startMic();
  };

  const handleConfirmEndTour = () => {
    playCallEnd();
    setIsEndDialogOpen(false);
    setIsTourActive(false);
    setIsPaused(false);
    setIsExpanded(false);
    setActiveArtifact("info");
    setActiveExpressionId("neutral");
    // Clear demo timers and chat
    demoTimersRef.current.forEach(clearTimeout);
    demoTimersRef.current = [];
    setChatMessages([]);
    setIsChatThinking(false);
    stopMic();
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

  // Top-left rounded corner cutout houses the avatar without changing the card bounds.
  const avatarNotchPath =
    "M 104 0.5 C 95 0.5 88 7.5 88 16.5 L 88 58 C 88 68 80 76 70 76 L 18.5 76 C 8.5 76 0.5 84 0.5 94";
  const avatarNotchMask = `${avatarNotchPath} L -4 94 L -4 -4 L 104 -4 Z`;

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
      className="call-group-pause-btn h-9 px-3.5 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer transition-all active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-none"
    >
      <HugeIcon
        icon={isPaused ? PlayIcon : PauseIcon}
        size={15}
        color="#ffffff"
        className="text-white shrink-0"
      />
      <span className="call-group-pause-label tracking-[-0.1px]">
        {isPaused ? "Resume" : "Pause"}
      </span>
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
        setActiveArtifact("chat");
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

  // Call group: horizontal on mobile / unexpanded; transitions to vertical under Mr. T on larger screens
  const callGroup = (
    <div
      className="call-group-container flex h-[52px] w-[196px] items-center justify-center gap-1.5 rounded-full border border-border bg-card px-2 shadow-xs transition-all duration-300"
      role="group"
      aria-label="Tour controls"
    >
      {micControl}
      <span className="call-group-divider h-5 w-px shrink-0 bg-border" aria-hidden="true" />
      {pauseControl}
      {endControl}
    </div>
  );

  // Monotonic shoulders meet the capsule at its widest points, avoiding a lower bulge.
  const dockPath =
    "M 0 63.5 C 12 63.5 14 53.5 14 37.5 A 32 32 0 0 1 46 5.5 H 178 A 32 32 0 0 1 210 37.5 C 210 53.5 212 63.5 224 63.5";

  // Side cradle notch: matches Mr. T's corner curvature, with depth tailored to the dock (56px)
  const sideDockPath =
    "M 0.5 0 C 0.5 10 8.5 18 18.5 18 L 38 18 C 48 18 56 26 56 36 L 56 168 C 56 178 48 186 38 186 L 18.5 186 C 8.5 186 0.5 194 0.5 204";
  const sideDockMask = `${sideDockPath} L -4 204 L -4 0 Z`;

  return (
    <div className="h-dvh min-h-[480px] w-full bg-background flex overflow-hidden select-none relative">
      <div className="flex-1 min-w-0 h-full grid grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden relative">
        <Header showSettings={isTourActive} />
        <main
          className={
            !isTourActive
              ? "min-h-0 h-full w-full relative flex items-stretch overflow-y-auto"
              : "min-h-0 h-full w-full max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-6 relative flex items-center justify-center overflow-visible"
          }
        >
          {!isTourActive ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <Card className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle>Start tour</CardTitle>
                  <CardDescription>
                    Begin your voice-guided journey with Mr. Triangle, your AI docent for this exhibition.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full cursor-pointer" onClick={handleStartTour}>
                    Start tour
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            /* Active Tour Stage */
            <div className="guide-stage relative w-full h-full max-h-[660px] 2xl:max-h-[740px]" data-expanded={isExpanded}>
              <div className="guide-card-layer absolute inset-0" inert={!isExpanded} aria-hidden={!isExpanded}>
                <div className="guide-card w-full h-full rounded-2xl border border-border bg-card shadow-xs relative flex items-center justify-center overflow-visible">

                  {/* Top-Left Avatar Notch: Houses Mr. T at top-left */}
                  <div className="absolute -top-px -left-px pointer-events-none z-10" aria-hidden="true">
                    <svg viewBox="0 0 105 95" width="105" height="95" fill="none" className="overflow-visible">
                      <path d={avatarNotchMask} className="fill-background" />
                      <path d={avatarNotchPath} className="stroke-border" strokeWidth="1" />
                    </svg>
                  </div>

                  {/* Top-Right Original Inverted Corner Notch: Houses the close button */}
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

                  {/* Artifact Stage spanning outside the notches */}
                  <div className="w-full h-full px-6 md:pl-24 md:pr-16 pt-20 md:pt-10 pb-16 md:pb-8 overflow-hidden">
                    <ArtifactStage
                      artifactType={activeArtifact}
                      mapRouteId={activeMapRoute}
                      hotspotId={activeHotspotId}
                      isLoading={isArtifactLoading}
                      chatMessages={chatMessages}
                      isChatThinking={isChatThinking}
                      onSelectArtifact={(type, params) => {
                        setActiveArtifact(type);
                        if (params?.routeId) setActiveMapRoute(params.routeId as any);
                        if (params?.hotspotId) setActiveHotspotId(params.hotspotId as any);
                        playTactileTap();
                      }}
                    />
                  </div>

                  {/* Left Side Pill Cradle Notch: Depth tailored to dock (56px) with Mr. T corner curvature */}
                  <div
                    className="absolute -left-px top-1/2 -translate-y-1/2 z-20 pointer-events-none hidden md:block"
                    style={{ width: 60, height: 204 }}
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 60 204"
                      style={{ width: 60, height: 204 }}
                      fill="none"
                      className="overflow-visible"
                    >
                      <path d={sideDockMask} className="fill-background" />
                      <path d={sideDockPath} className="stroke-border" strokeWidth="1" />
                    </svg>
                  </div>

                  {/* Bottom Pill Cradle Notch: Frames the dock on mobile */}
                  <div className="absolute -bottom-px left-1/2 -translate-x-1/2 z-20 h-16 w-[224px] pointer-events-none md:hidden" aria-hidden="true">
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
        {/* Footer with clean fallback view switcher positioned outside the main stage view */}
        <footer className="w-full max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between text-xs text-secondary-text z-30 select-none">
          <div>
            Made by{" "}
            <span className="font-semibold text-foreground tracking-[-0.1px]">
              articulate
            </span>
          </div>

          {isTourActive && (
            <div className="flex items-center gap-2">
              {/* Dev toggle: simulates skeleton loading state */}
              <Button
                size="sm"
                variant={isArtifactLoading ? "default" : "outline"}
                className="h-6 px-2.5 text-[11px] rounded-full cursor-pointer font-mono"
                onClick={() => setIsArtifactLoading((v) => !v)}
                title="Toggle skeleton loading state (dev)"
              >
                {isArtifactLoading ? "⏳ loading" : "skeleton"}
              </Button>
              <Tabs
                value={activeArtifact}
                onValueChange={(val) => {
                  if (val) {
                    playToggle();
                    setActiveArtifact(val as ArtifactType);
                    if (!isExpanded) setIsExpanded(true);
                  }
                }}
              >
                <TabsList className="h-7 bg-muted/60 p-0.5 rounded-full gap-0.5">
                  <TabsTrigger value="chat" className="text-xs px-2.5 h-6 rounded-full font-medium">
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="info" className="text-xs px-2.5 h-6 rounded-full font-medium">
                    Info
                  </TabsTrigger>
                  <TabsTrigger value="map" className="text-xs px-2.5 h-6 rounded-full font-medium">
                    Map
                  </TabsTrigger>
                  <TabsTrigger value="comparison" className="text-xs px-2.5 h-6 rounded-full font-medium">
                    Comparison
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="text-xs px-2.5 h-6 rounded-full font-medium">
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="hotspots" className="text-xs px-2.5 h-6 rounded-full font-medium">
                    Hotspots
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {activeArtifact === "map" && (
                <div className="flex items-center gap-1 pl-1">
                  <Button
                    size="sm"
                    variant={activeMapRoute === "restrooms" ? "secondary" : "ghost"}
                    className="h-5 px-2 text-[11px] rounded-full cursor-pointer"
                    onClick={() => setActiveMapRoute("restrooms")}
                  >
                    Restrooms
                  </Button>
                  <Button
                    size="sm"
                    variant={activeMapRoute === "gauguin" ? "secondary" : "ghost"}
                    className="h-5 px-2 text-[11px] rounded-full cursor-pointer"
                    onClick={() => setActiveMapRoute("gauguin")}
                  >
                    Gallery 37
                  </Button>
                  <Button
                    size="sm"
                    variant={activeMapRoute === "elevator" ? "secondary" : "ghost"}
                    className="h-5 px-2 text-[11px] rounded-full cursor-pointer"
                    onClick={() => setActiveMapRoute("elevator")}
                  >
                    Elevator
                  </Button>
                </div>
              )}

              {activeArtifact === "hotspots" && (
                <div className="flex items-center gap-1 pl-1">
                  <Button
                    size="sm"
                    variant={activeHotspotId === "cypress" ? "secondary" : "ghost"}
                    className="h-5 px-2 text-[11px] rounded-full cursor-pointer"
                    onClick={() => setActiveHotspotId("cypress")}
                  >
                    Cypress
                  </Button>
                  <Button
                    size="sm"
                    variant={activeHotspotId === "star" ? "secondary" : "ghost"}
                    className="h-5 px-2 text-[11px] rounded-full cursor-pointer"
                    onClick={() => setActiveHotspotId("star")}
                  >
                    Morning Star
                  </Button>
                  <Button
                    size="sm"
                    variant={activeHotspotId === "steeple" ? "secondary" : "ghost"}
                    className="h-5 px-2 text-[11px] rounded-full cursor-pointer"
                    onClick={() => setActiveHotspotId("steeple")}
                  >
                    Steeple
                  </Button>
                </div>
              )}
            </div>
          )}

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
