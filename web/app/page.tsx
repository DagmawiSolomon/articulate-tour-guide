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
import { createVoiceAgent, type VoiceAgent } from "@/lib/assemblyai-agent";
import { createAudioPlayer, type AudioPlayer } from "@/lib/assemblyai-audio";

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
  const [activeMapRoute, setActiveMapRoute] = React.useState<"restrooms" | "gauguin" | "elevator" | "garden" | "store" | string>("restrooms");
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

  const handleStartTour = async () => {
    playCallStart();
    setIsTourActive(true);
    setIsExpanded(true);
    setActiveArtifact("chat");
    setIsPaused(false);
    setAgentStatus("listening");
    setActiveExpressionId("listening");
    setChatMessages([]);
    setIsChatThinking(false);

    // Initialise the audio player (once per tour)
    audioPlayerRef.current = createAudioPlayer();
    await audioPlayerRef.current.resume();

    // Connect the Voice Agent
    try {
      const agent = await createVoiceAgent({
        onReady: (sessionId) => {
          console.log("[Agent] Session ready:", sessionId);
        },

        onTranscriptPartial: (text) => {
          const id = partialMsgIdRef.current;
          setChatMessages((prev) => {
            const without = prev.filter((m) => m.id !== id);
            return [...without, { id, role: "visitor", text, isPartial: true, timestamp: new Date() }];
          });
          setAgentStatus("listening");
        },

        onTranscriptFinal: (text) => {
          const id = partialMsgIdRef.current;
          setChatMessages((prev) => {
            const without = prev.filter((m) => m.id !== id);
            return [...without, { id: `visitor-${Date.now()}`, role: "visitor", text, timestamp: new Date() }];
          });
          // Agent is now processing â€” show thinking state
          setAgentStatus("thinking");
        },

        onAgentSpeakingStart: () => {
          setAgentStatus("speaking");
        },

        onAgentSpeakingEnd: (interrupted) => {
          setAgentStatus("listening");
          if (interrupted) {
            // User barged in â€” flush audio buffer immediately
            audioPlayerRef.current?.flush();
          }
        },

        onAgentAudio: (base64) => {
          audioPlayerRef.current?.playChunk(base64);
        },

        onToolCall: (tool) => {
          const params = tool.arguments as Record<string, string>;
          setIsArtifactLoading(true);

          // Brief loading pulse then switch artifact
          setTimeout(() => {
            setIsArtifactLoading(false);
            switch (tool.name) {
              case "show_hotspots":
                setActiveArtifact("hotspots");
                if (params.hotspotId) {
                  setActiveHotspotId(params.hotspotId as "cypress" | "star" | "steeple" | "vortex" | "moon");
                }
                break;
              case "show_map":
                setActiveArtifact("map");
                if (params.routeId) setActiveMapRoute(params.routeId);
                break;
              case "show_timeline":
                setActiveArtifact("timeline");
                break;
              case "show_comparison":
                setActiveArtifact("comparison");
                break;
              case "show_info":
              default:
                setActiveArtifact("info");
                break;
            }
            // Add tool call bubble to chat
            setChatMessages((prev) => [
              ...prev,
              {
                id: `tool-${Date.now()}`,
                role: "tool",
                toolName: tool.name,
                label: params.label ?? tool.name.replace("show_", ""),
                artifactType: tool.name.replace("show_", "") as any,
                params,
                detail: "",
                timestamp: new Date(),
              },
            ]);
            // Return the result to unblock the agent
            agent.sendToolResult(tool.callId, { success: true });
          }, 400);
        },

        onEnded: () => {
          console.log("[Agent] Session ended");
          handleConfirmEndTour();
        },

        onError: (code, message) => {
          console.error(`[Agent] Error ${code}:`, message);
          if (code === "connection_error" || code === "disconnected") {
            alert(`Voice Agent disconnected: ${message}`);
            handleConfirmEndTour();
          }
        },
      });

      agentRef.current = agent;

      // Automatically unmute/start mic if not manually muted
      if (!isMuted) {
        await startMic();
      }
    } catch (err) {
      console.error("[Agent] Failed to connect:", err);
      alert("Failed to connect to Voice Agent. Please check your API key and network connection.");
      handleConfirmEndTour();
    }

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

    // Transition to summary state
    setIsPaused(false);
    setIsExpanded(true); // Must be expanded to see summary
    setActiveArtifact("summary");
    setActiveExpressionId("neutral");
    setIsChatThinking(false);
    
    setIsArtifactLoading(true);

    try {
      const res = await fetch("/api/tour-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatMessages })
      });
      if (res.ok) {
        const data = await res.json();
        setSummaryData(data);
      } else {
        console.error("Failed to fetch summary", await res.text());
        setSummaryData({ summary: ["Your tour summary could not be generated at this time."], quiz: [] });
      }
    } catch (err) {
      console.error(err);
      setSummaryData({ summary: ["Your tour summary could not be generated at this time."], quiz: [] });
    } finally {
      setIsArtifactLoading(false);
    }
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
    <div className="h-dvh min-h-[480px] w-full bg-background flex overflow-hidden relative">
      <div className="flex-1 min-w-0 h-full grid grid-rows-[minmax(0,1fr)_auto] overflow-hidden relative">
        <main
          className={
            !isTourActive
              ? "min-h-0 h-full w-full relative flex items-stretch overflow-y-auto"
              : "min-h-0 h-full w-full max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 pt-5 pb-6 sm:pt-6 sm:pb-8 relative flex items-center justify-center overflow-visible"
          }
        >
          {!isTourActive ? (
            /* â”€â”€ BUI Agent Screen-inspired landing hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
            <div className="w-full h-full flex items-center justify-center p-6">
              <div
                className="relative w-full max-w-[420px] overflow-hidden rounded-[20px]"
                style={{
                  background: "var(--surface)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px var(--line)",
                }}
              >
                {/* BUI pixel-grid decorative header band */}
                <div
                  className="relative overflow-hidden px-7 pt-8 pb-6"
                  style={{ background: "var(--canvas)" }}
                >
                  {/* Subtle dot-grid texture */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, var(--line) 1px, transparent 1px)",
                      backgroundSize: "18px 18px",
                      opacity: 0.45,
                    }}
                  />
                  {/* Shimmer gradient overlay */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at 50% 0%, var(--canvas) 0%, transparent 70%)",
                    }}
                  />

                  {/* Logo */}
                  <div className="relative z-10 mb-5">
                    <span
                      className="font-medium select-none leading-none"
                      style={{
                        fontFamily: "'Afacad Flux', sans-serif",
                        fontSize: "15pt",
                        letterSpacing: "-0.03em",
                        color: "var(--ink)",
                      }}
                    >
                      articulate.
                    </span>
                  </div>

                  {/* BUI-style shimmer heading */}
                  <h1
                    className="relative z-10 text-[22px] font-semibold leading-snug tracking-[-0.025em]"
                    style={{ color: "var(--ink)" }}
                  >
                    Your AI museum guide
                    <br />
                    <span style={{ color: "var(--ink-3)" }}>is ready to begin.</span>
                  </h1>

                  <p
                    className="relative z-10 mt-2 text-[13px] leading-relaxed"
                    style={{ color: "var(--ink-2)" }}
                  >
                    Ask questions about any artwork. Mr. Triangle will explain,
                    navigate, and guide you through the exhibition.
                  </p>

                  {/* BUI feature chips */}
                  <div className="relative z-10 mt-4 flex flex-wrap gap-1.5">
                    {[
                      "Voice-guided",
                      "Real-time transcription",
                      "Interactive artifacts",
                    ].map((chip) => (
                      <span
                        key={chip}
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-medium"
                        style={{
                          background: "var(--field)",
                          color: "var(--ink-2)",
                          border: "1px solid var(--line)",
                        }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card footer with CTA */}
                <div
                  className="px-7 py-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3"
                  style={{ borderTop: "1px solid var(--line)" }}
                >
                  <p
                    className="text-[11.5px] leading-relaxed hidden sm:block"
                    style={{ color: "var(--ink-3)" }}
                  >
                    Microphone access required for voice interaction.
                  </p>

                  <div className="flex flex-1 sm:flex-none items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={handleStartTour}
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-4 h-9 text-[13px] font-medium cursor-pointer transition-all active:scale-[0.96]"
                      style={{
                        background: "var(--ink)",
                        color: "#fff",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                      }}
                    >
                      Start tour
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14m-6-6l6 6-6 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
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
                      mapRouteId={activeMapRoute}
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
        <footer className="w-full max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between text-xs text-secondary-text z-30 select-none">
          <div className="flex items-center gap-3">
            <span
              className="font-medium text-foreground select-none leading-none tracking-[-0.03em]"
              style={{
                fontFamily: "'Afacad Flux', sans-serif",
                fontSize: "15pt",
              }}
            >
              articulate tour guide.
            </span>
          </div>

          {isTourActive && (
            <div className="flex items-center gap-2">
              {/* Dev toggle: simulates skeleton loading state */}
              {activeArtifact !== "summary" && (
                <Button
                  size="sm"
                  variant={isArtifactLoading ? "default" : "outline"}
                className="h-6 px-2.5 text-[11px] rounded-full cursor-pointer font-mono"
                onClick={() => setIsArtifactLoading((v) => !v)}
                title="Toggle skeleton loading state (dev)"
              >
                {isArtifactLoading ? "â ³ loading" : "skeleton"}
              </Button>
              )}
              {activeArtifact !== "summary" && (
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
              )}

              {activeArtifact === "map" && (
                <div className="flex items-center gap-1 pl-1">
                  <Button
                    size="sm"
                    variant={activeMapRoute === "restrooms" ? "secondary" : "ghost"}
                    className="h-5 px-2 text-[11px] rounded-full cursor-pointer"
                    onClick={() => {
                      playTactileTap();
                      setActiveMapRoute("restrooms");
                    }}
                  >
                    Restrooms
                  </Button>
                  <Button
                    size="sm"
                    variant={activeMapRoute === "gauguin" ? "secondary" : "ghost"}
                    className="h-5 px-2 text-[11px] rounded-full cursor-pointer"
                    onClick={() => {
                      playTactileTap();
                      setActiveMapRoute("gauguin");
                    }}
                  >
                    1 West
                  </Button>
                  <Button
                    size="sm"
                    variant={activeMapRoute === "elevator" ? "secondary" : "ghost"}
                    className="h-5 px-2 text-[11px] rounded-full cursor-pointer"
                    onClick={() => {
                      playTactileTap();
                      setActiveMapRoute("elevator");
                    }}
                  >
                    Elevator
                  </Button>
                  <Button
                    size="sm"
                    variant={activeMapRoute === "garden" ? "secondary" : "ghost"}
                    className="h-5 px-2 text-[11px] rounded-full cursor-pointer"
                    onClick={() => {
                      playTactileTap();
                      setActiveMapRoute("garden");
                    }}
                  >
                    Garden
                  </Button>
                  <Button
                    size="sm"
                    variant={activeMapRoute === "store" ? "secondary" : "ghost"}
                    className="h-5 px-2 text-[11px] rounded-full cursor-pointer"
                    onClick={() => {
                      playTactileTap();
                      setActiveMapRoute("store");
                    }}
                  >
                    Store
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
