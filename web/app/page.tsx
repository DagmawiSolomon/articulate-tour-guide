"use client";

import * as React from "react";
import Image from "next/image";
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
  MessageSquareIcon,
  MapIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { ArticulateAvatar } from "@/components/avatar/articulate-avatar";
import {
  type ExpressionId,
} from "@/components/avatar/avatar-expressions";
import { Footer } from "@/components/layout/footer";
import { ArtifactStage, type ArtifactType, type ChatMessage } from "@/components/artifacts/artifact-stage";
import { ImmersiveArtworkView } from "@/components/artifacts/immersive-artwork-view";
import type { ExhibitArtworkInfo, ExhibitNavigationState } from "@/components/artifacts/exhibit-floor-map-view";
import type { MapViewport } from "@/components/ui/map";
import { searchCuratorialArchives } from "@/lib/archive-retrieval";
import { TURNING_POINTS_ARTWORKS, TURNING_POINTS_WINGS } from "@/lib/turning-points-data";
import { getArtworkHotspots } from "@/lib/artwork-hotspots";
import type { ArtworkSelection } from "@/components/artifacts/immersive-artwork-view";

const WING_ROUTE_MAP: Record<string, string> = {
  "wing-perspective": "perspective",
  "wing-shadow": "shadow",
  "wing-feeling": "feeling",
  "wing-cubism": "cubism",
  "wing-concept": "concept",
};

function resolveArtworkId(idOrQuery?: string): string {
  if (!idOrQuery) return "masaccio-holy-trinity";
  if (TURNING_POINTS_ARTWORKS[idOrQuery]) return idOrQuery;
  const q = idOrQuery.toLowerCase().trim();
  if (q.includes("fountain") || q.includes("duchamp") || q.includes("urinal") || q.includes("mutt")) {
    return "duchamp-fountain";
  }
  if (q.includes("masaccio") || q.includes("trinity")) {
    return "masaccio-holy-trinity";
  }
  if (q.includes("caravaggio") || q.includes("matthew")) {
    return "caravaggio-calling-st-matthew";
  }
  if (q.includes("gogh") || q.includes("starry")) {
    return "van-gogh-starry-night";
  }
  if (q.includes("picasso") || q.includes("demoiselles") || q.includes("avignon")) {
    return "picasso-demoiselles";
  }
  if (q.includes("pollock") || q.includes("autumn") || q.includes("rhythm")) {
    return "pollock-autumn-rhythm";
  }
  return idOrQuery;
}
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
import { createVoiceAgent, type VoiceAgent, type VoiceAgentCallbacks } from "@/lib/assemblyai-agent";
import { createAudioPlayer, type AudioPlayer } from "@/lib/assemblyai-audio";
import { BayerDitherBackground } from "@/components/ui/bayer-dither-background";
import { useMicAudioLevel } from "@/hooks/use-mic-audio-level";

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

const SPEAKING_EMOTIONS: ExpressionId[] = [
  "speaking",
  "happy",
  "speaking",
  "excited",
  "interested",
];

/** Idle expression cycle when mic is off — patient ➜ glance ➜ drowsy ➜ curious ➜ repeat */
const MUTED_EMOTIONS: ExpressionId[] = [
  "muted",
  "muted",
  "muted-glance",
  "muted",
  "muted-drowsy",
  "muted",
  "muted-glance",
  "muted",
];

export default function Home() {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isTourActive, setIsTourActive] = React.useState(false);
  const [visitorName, setVisitorName] = React.useState("Visitor");
  const [isEndDialogOpen, setIsEndDialogOpen] = React.useState(false);
  const [isExhibitInfoOpen, setIsExhibitInfoOpen] = React.useState(false);
  const [activeExpressionId, setActiveExpressionId] = React.useState<ExpressionId>("neutral");
  const [agentStatus, setAgentStatus] = React.useState<AgentStatus>("listening");
  const [isMuted, setIsMuted] = React.useState(false);
  const [activeArtifact, setActiveArtifact] = React.useState<ArtifactType>("info");
  const [selectedArtwork, setSelectedArtwork] = React.useState<ExhibitArtworkInfo | null>(null);
  const [mapNavigation, setMapNavigation] = React.useState<ExhibitNavigationState>({ startId: "entrance", destinationId: "", currentNodeId: null });
  const [mapViewport, setMapViewport] = React.useState<MapViewport | null>(null);
  const [originMapRoute, setOriginMapRoute] = React.useState<string>("entrance");
  const [activeMapRoute, setActiveMapRoute] = React.useState<string>("entrance");
  const [activeHotspotId, setActiveHotspotId] = React.useState<string | undefined>(undefined);
  const [activeArtworkId, setActiveArtworkId] = React.useState<string>("masaccio-holy-trinity");
  const [comparisonPairId, setComparisonPairId] = React.useState<string>("comparison-perspective");
  // Quiet / Reading Mode: when true, visitor prefers to read and Alba remains silent
  const [isQuietMode, setIsQuietMode] = React.useState<boolean>(false);
  const isQuietModeRef = React.useRef<boolean>(false);
  // Guest location tracking: begins at entrance and updates as galleries/artworks are visited
  const [guestLocationId, setGuestLocationId] = React.useState<string>("entrance");
  const guestLocationRef = React.useRef<string>("entrance");
  // ── Gallery State Machine ────────────────────────────────────────────────
  // Single source of truth for all artwork tour states.
  // Replaces the previous 3 pairs of state+ref (activeTourArtworkId, completedArtworkIds, startedArtworkIds).
  const [galleryStates, setGalleryStates] = React.useState<Record<string, "unexplored" | "exploring" | "completed">>({});
  const galleryStatesRef = React.useRef<Record<string, "unexplored" | "exploring" | "completed">>({}); 
  // Cache refs kept in sync inside the setGalleryStates updater — safe to read inside callbacks.
  const activeTourArtworkIdRef = React.useRef<string | null>(null);
  const completedArtworkIdsRef = React.useRef<string[]>([]);
  // Auto-reset timer for the artifact loading skeleton — prevents permanently stuck skeletons.
  const loadingTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  // When start tour is clicked, card collapses for fullscreen Alba explanation, then auto-uncollapses
  const shouldUncollapseAfterSpeechRef = React.useRef<boolean>(false);
  // Dev toggle: simulates the isLoading state triggered by tool.call / tool.result.
  // Will be wired to real events once voice is connected.
  const [isArtifactLoading, setIsArtifactLoading] = React.useState(false);
  // Chat history state — messages accumulate as the tour progresses.
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [isChatThinking, setIsChatThinking] = React.useState(false);
  // Partial visitor transcript ID — updated in place as partials arrive
  const partialMsgIdRef = React.useRef<string>("visitor-partial");
  const partialAgentMsgIdRef = React.useRef<string>("agent-partial");
  // Voice Agent + audio player refs
  const agentRef = React.useRef<VoiceAgent | null>(null);
  const audioPlayerRef = React.useRef<AudioPlayer | null>(null);
  const agentCallbacksRef = React.useRef<VoiceAgentCallbacks | null>(null);

  // Greeting & reply lifecycle refs
  const greetingPhaseRef = React.useRef<"idle" | "greeting" | "done">("idle");
  const hasUserInteractedRef = React.useRef<boolean>(false);
  const isTogglingMicRef = React.useRef<boolean>(false);
  const isMutedRef = React.useRef<boolean>(false);
  const replyIndexRef = React.useRef<number>(0);
  const muteWarningSentRef = React.useRef<boolean>(false);

  // Barge-in: immediately stop playback in speakers and drop any pending/in-flight audio chunks from interrupted turn
  const ignoreAudioUntilNextReplyRef = React.useRef<boolean>(false);
  const pendingVisualAnalysisRef = React.useRef<{
    artworkId: string;
    answer: string;
    timestamp: number;
  } | null>(null);

  const bargeIn = React.useCallback(() => {
    ignoreAudioUntilNextReplyRef.current = true;
    audioPlayerRef.current?.flush();
    setAgentStatus("listening");
    shouldUncollapseAfterSpeechRef.current = false;
  }, []);

  // ── State Machine Helpers ─────────────────────────────────────────────────

  /**
   * Atomically transition: any currently "exploring" artwork → "completed",
   * then set the target artwork to "exploring". This is the only way a tour starts.
   * Keeps all cache refs in sync inside the updater (closure-safe).
   */
  const startExploring = React.useCallback((artworkId: string) => {
    setGalleryStates((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        if (next[id] === "exploring" && id !== artworkId) next[id] = "completed";
      });
      next[artworkId] = "exploring";
      galleryStatesRef.current = next;
      activeTourArtworkIdRef.current = artworkId;
      completedArtworkIdsRef.current = Object.keys(next).filter((k) => next[k] === "completed");
      return next;
    });
  }, []);

  /**
   * Atomically transition a single artwork to a target state.
   * Used to mark an artwork as "completed" when ending its gallery tour.
   */
  const setArtworkGalleryState = React.useCallback((
    artworkId: string,
    toState: "unexplored" | "exploring" | "completed",
  ) => {
    setGalleryStates((prev) => {
      const next = { ...prev, [artworkId]: toState };
      galleryStatesRef.current = next;
      activeTourArtworkIdRef.current = Object.keys(next).find((k) => next[k] === "exploring") ?? null;
      completedArtworkIdsRef.current = Object.keys(next).filter((k) => next[k] === "completed");
      return next;
    });
  }, []);

  /** Reset all gallery states (used on full tour end). */
  const resetGalleryStates = React.useCallback(() => {
    setGalleryStates({});
    galleryStatesRef.current = {};
    activeTourArtworkIdRef.current = null;
    completedArtworkIdsRef.current = [];
  }, []);

  /**
   * Safe reply — always flushes in-flight audio before triggering a new agent reply.
   * Prevents double-reply race conditions when navigating while Alba is already speaking.
   * Use this instead of calling audioPlayerRef.current?.flush() + triggerReply() separately.
   */
  const safeReply = React.useCallback((prompt: string) => {
    ignoreAudioUntilNextReplyRef.current = true;
    audioPlayerRef.current?.flush();
    setAgentStatus("thinking");
    agentRef.current?.triggerReply(prompt);
  }, []);

  /**
   * Start artifact loading with a guaranteed auto-reset.
   * Cancels any previous timer so interrupted tool calls never leave the skeleton stuck.
   */
  const startLoading = React.useCallback(() => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    setIsArtifactLoading(true);
    loadingTimerRef.current = setTimeout(() => {
      setIsArtifactLoading(false);
      loadingTimerRef.current = null;
    }, 500);
  }, []);

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

    if (isMuted) {
      setActiveExpressionId("muted");
      let mutedIdx = 0;
      const mutedInterval = setInterval(() => {
        mutedIdx = (mutedIdx + 1) % MUTED_EMOTIONS.length;
        setActiveExpressionId(MUTED_EMOTIONS[mutedIdx]);
      }, 3500); // slower cadence — idle, languid waiting
      return () => clearInterval(mutedInterval);
    }

    let emotionIdx = 0;
    let emotionInterval: NodeJS.Timeout | null = null;

    if (agentStatus === "speaking") {
      setActiveExpressionId("speaking");
      emotionInterval = setInterval(() => {
        emotionIdx = (emotionIdx + 1) % SPEAKING_EMOTIONS.length;
        setActiveExpressionId(SPEAKING_EMOTIONS[emotionIdx]);
      }, 2000);
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
  }, [isTourActive, agentStatus, isMuted]);

  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const [micStream, setMicStream] = React.useState<MediaStream | null>(null);
  const audioLevel = useMicAudioLevel(micStream, isTourActive && !isMuted);

  const stopMic = React.useCallback(() => {
    isMutedRef.current = true;
    // Stop sending audio to the agent (keep WS open)
    agentRef.current?.stopAudio();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }
    setMicStream(null);
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
        // server-side noise suppression — stacking client-side adds artifacts)
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
        setMicStream(stream);
        isMutedRef.current = false;
        setIsMuted(false);
        return stream;
      }
    } catch (err) {
      console.warn("Microphone access error or denied:", err);
      isMutedRef.current = true;
      setIsMuted(true);
    }
    return null;
  }, []);

  const toggleMic = React.useCallback(async () => {
    if (isTogglingMicRef.current) return;
    isTogglingMicRef.current = true;

    try {
      if (isMuted) {
        playUnmute();
        isMutedRef.current = false;
        // If the agent was speaking the separate mute reminder, flush it immediately on unmute
        if (muteWarningSentRef.current && agentStatus === "speaking") {
          audioPlayerRef.current?.flush();
          setAgentStatus("listening");
        }
        const stream = await startMic();
        if (stream && agentRef.current) {
          agentRef.current.startAudio(stream);
        }
      } else {
        playMute();
        isMutedRef.current = true;
        stopMic();
      }
    } finally {
      isTogglingMicRef.current = false;
    }
  }, [isMuted, agentStatus, startMic, stopMic]);

  React.useEffect(() => {
    initSounds();
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      agentRef.current?.end();
      audioPlayerRef.current?.close();
    };
  }, []);

  const handleStartTourWithArtwork = React.useCallback((overrideArtworkId?: string) => {
    // No explicit bargeIn() here — safeReply() at the end flushes audio before speaking.
    hasUserInteractedRef.current = true;
    muteWarningSentRef.current = true;
    greetingPhaseRef.current = "done";

    const rawId = overrideArtworkId || selectedArtwork?.id || activeArtworkId || "masaccio-holy-trinity";
    const resolvedId = resolveArtworkId(rawId);
    const targetArtwork = TURNING_POINTS_ARTWORKS[resolvedId] || TURNING_POINTS_ARTWORKS["masaccio-holy-trinity"];
    const artPlaceId = `art:${targetArtwork.id}`;

    // 1. Update guest location without drawing a route line
    setMapNavigation((prev) => ({
      ...prev,
      startId: artPlaceId,
      destinationId: "",
      currentNodeId: null,
    }));
    guestLocationRef.current = artPlaceId;
    setGuestLocationId(artPlaceId);

    // 2. Atomically: any currently "exploring" artwork → "completed", target → "exploring".
    //    This is the ONLY place this transition happens — single source of truth.
    startExploring(targetArtwork.id);

    setActiveArtworkId(targetArtwork.id);
    setSelectedArtwork({
      id: targetArtwork.id,
      title: targetArtwork.title,
      imageSrc: targetArtwork.imageSrc,
      summary: targetArtwork.summary,
      metadata: [
        { label: "Artist", value: targetArtwork.artist },
        { label: "Date", value: targetArtwork.year },
      ],
    });

    if (targetArtwork.wingId && WING_ROUTE_MAP[targetArtwork.wingId]) {
      setActiveMapRoute(WING_ROUTE_MAP[targetArtwork.wingId]);
    }

    setActiveArtifact("artwork-view");
    setIsExpanded(true);

    // 3. Post visitor confirmation to transcript
    setChatMessages((prev) => [
      ...prev,
      {
        id: `visitor-confirm-${Date.now()}`,
        role: "visitor",
        text: `Let's go with this: ${targetArtwork.title}`,
        isPartial: false,
        timestamp: new Date(),
      },
    ]);

    // 4. Safe reply — always flushes in-flight audio before triggering a new agent reply
    safeReply(
      `The visitor confirmed: "Let's go with this first!" to start their tour with ${targetArtwork.title} (${targetArtwork.year}) by ${targetArtwork.artist}. Welcome them enthusiastically to this opening stop of the exhibition and give a vivid, engaging 2-sentence curatorial breakdown of why this masterpiece is our first revolutionary milestone. Speak with poise and dive straight into the artwork without any apologies.`
    );
  }, [selectedArtwork, activeArtworkId, safeReply, startExploring]);

  const handleEndGalleryTour = React.useCallback(() => {
    // No explicit bargeIn() here — safeReply() at the end flushes audio before speaking.
    hasUserInteractedRef.current = true;
    greetingPhaseRef.current = "done";

    // Resolve the currently exploring artwork via the ref (closure-safe, always current)
    const rawId = activeTourArtworkIdRef.current || activeArtworkId || selectedArtwork?.id || "masaccio-holy-trinity";
    const resolvedId = resolveArtworkId(rawId);
    const currentArtwork = TURNING_POINTS_ARTWORKS[resolvedId] || TURNING_POINTS_ARTWORKS["masaccio-holy-trinity"];
    const artPlaceId = `art:${currentArtwork.id}`;

    // 1. Atomically: mark this artwork as completed and clear the active tour pointer.
    //    setArtworkGalleryState handles all ref sync internally.
    setArtworkGalleryState(currentArtwork.id, "completed");

    // 2. Set guest location without drawing paths
    setMapNavigation((prev) => ({
      ...prev,
      startId: artPlaceId,
      destinationId: "",
      currentNodeId: null,
    }));
    guestLocationRef.current = artPlaceId;
    setGuestLocationId(artPlaceId);

    // 3. Return to floor map so visitor can choose next stop
    setActiveArtifact("map");
    setIsExpanded(true);
    playTactileTap();

    // 4. Post visitor transcript
    setChatMessages((prev) => [
      ...prev,
      {
        id: `visitor-end-gallery-${Date.now()}`,
        role: "visitor",
        text: `Concluded tour of ${currentArtwork.title}. Where should we go next?`,
        isPartial: false,
        timestamp: new Date(),
      },
    ]);

    // 5. Safe reply — always flushes in-flight audio before speaking
    setIsChatThinking(true);
    safeReply(
      `The visitor has ended their tour of the ${currentArtwork.title} (${currentArtwork.year}) gallery and returned to the exhibition floor map. In 1 to 2 warm, engaging sentences as Alba, acknowledge concluding our time with ${currentArtwork.title}, and ask them which gallery, milestone, or artwork they would like to explore next on the floor map.`
    );
  }, [selectedArtwork, activeArtworkId, safeReply, setArtworkGalleryState]);

  const handleAskAboutSelection = React.useCallback(async (selection: ArtworkSelection) => {
    const artworkId = resolveArtworkId(selectedArtwork?.id || activeArtworkId);
    const artwork = TURNING_POINTS_ARTWORKS[artworkId] || TURNING_POINTS_ARTWORKS["masaccio-holy-trinity"];
    const visitorQuestion = `Tell me about the area I circled in ${artwork.title}.`;

    bargeIn();
    hasUserInteractedRef.current = true;
    greetingPhaseRef.current = "done";
    muteWarningSentRef.current = true;
    setChatMessages((previous) => [
      ...previous,
      { id: `visitor-detail-${Date.now()}`, role: "visitor", text: visitorQuestion, isPartial: false, timestamp: new Date() },
    ]);
    setIsChatThinking(true);
    setAgentStatus("thinking");

    try {
      const response = await fetch("/api/visual-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworkId, selection, question: visitorQuestion }),
      });
      const result = await response.json();
      if (!response.ok || typeof result.answer !== "string") {
        throw new Error(result.error || "I couldn't inspect that detail just now.");
      }

      // Store visual analysis so any subsequent tool calls (e.g. show_hotspots) can incorporate it
      pendingVisualAnalysisRef.current = {
        artworkId: artwork.id,
        answer: result.answer,
        timestamp: Date.now(),
      };

      // Sanitize multi-line/nested quotes for AssemblyAI Voice Agent reply.create
      const cleanAnalysis = result.answer.replace(/\s+/g, " ").replace(/"/g, "'").trim();
      const reply = `CRITICAL: Do NOT call show_hotspots, show_info, show_map, or consult_archives. Speak your answer directly to the visitor as Alba now.

The visitor circled a detail in "${artwork.title}" by ${artwork.artist} and asked: "${visitorQuestion}".
Curatorial visual analysis: "${cleanAnalysis}".

Explain in 2-3 warm, conversational sentences what they circled and its artistic significance. Speak directly aloud without apologies or meta-commentary.`;

      setChatMessages((previous) => [
        ...previous,
        {
          id: `vision-detail-${Date.now()}`,
          role: "tool",
          toolName: "visual_analysis",
          label: `Looked closely at ${artwork.title}`,
          params: { provider: result.provider },
          detail: result.answer,
          timestamp: new Date(),
        },
      ]);

      audioPlayerRef.current?.flush();
      ignoreAudioUntilNextReplyRef.current = false;
      setAgentStatus("thinking");

      if (agentRef.current?.connected) {
        agentRef.current.triggerReply(reply);
      } else {
        setIsChatThinking(false);
        setAgentStatus("listening");
        setChatMessages((previous) => [
          ...previous,
          {
            id: `agent-vision-${Date.now()}`,
            role: "agent",
            text: result.answer,
            isStreaming: false,
            speakerName: "Alba Tour Guide",
            timestamp: new Date(),
          },
        ]);

        // Browser speech synthesis fallback if Voice Agent WS session has not started yet
        if (typeof window !== "undefined" && "speechSynthesis" in window && !isQuietModeRef.current) {
          try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(result.answer);
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Female") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Google") || v.name.includes("Victoria")));
            if (preferredVoice) utterance.voice = preferredVoice;
            utterance.rate = 1.0;
            utterance.pitch = 1.05;
            setAgentStatus("speaking");
            utterance.onend = () => setAgentStatus("listening");
            utterance.onerror = () => setAgentStatus("listening");
            window.speechSynthesis.speak(utterance);
          } catch {}
        }
      }
    } catch (error) {
      console.error("Artwork visual question failed:", error);
      const reply = `The visitor circled a detail in "${artwork.title}" and asked about it, but the visual analysis failed. In one warm sentence, apologize briefly that you could not inspect that detail right now, and invite them to ask about something else in the painting.`;
      setChatMessages((previous) => [
        ...previous,
        { id: `vision-error-${Date.now()}`, role: "tool", toolName: "visual_analysis", label: "Image analysis unavailable", timestamp: new Date() },
      ]);
      audioPlayerRef.current?.flush();
      ignoreAudioUntilNextReplyRef.current = false;
      setAgentStatus("thinking");
      if (agentRef.current?.connected) {
        agentRef.current.triggerReply(reply);
      } else {
        setIsChatThinking(false);
        setAgentStatus("listening");
      }
    }
  }, [selectedArtwork, activeArtworkId, bargeIn]);
  const handleStartTour = async () => {
    playCallStart();
    setIsTourActive(true);
    // Alba starts large in the center! Stage expands only after greeting or manual action
    setIsExpanded(false);
    setActiveArtifact("map");
    setSelectedArtwork(null);
    setMapNavigation({ startId: "entrance", destinationId: "", currentNodeId: null });
    setMapViewport(null);
    setAgentStatus("listening");
    setActiveExpressionId(isMuted ? "muted" : "listening");
    setChatMessages([]);
    setIsChatThinking(false);
    setOriginMapRoute("entrance");
    setActiveMapRoute("entrance");

    // Initialize greeting lifecycle refs
    replyIndexRef.current = 0;
    muteWarningSentRef.current = false;
    greetingPhaseRef.current = "greeting";
    hasUserInteractedRef.current = false;
    isMutedRef.current = isMuted;
    isQuietModeRef.current = false;
    setIsQuietMode(false);
    guestLocationRef.current = "entrance";
    setGuestLocationId("entrance");
    // Reset all gallery states atomically
    resetGalleryStates();
    shouldUncollapseAfterSpeechRef.current = false;

    // 1. Initialize audio player for voice responses
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = createAudioPlayer();
    }
    await audioPlayerRef.current.resume();

    // 2. Respect user microphone setting:
    // If user is unmuted, start microphone before connecting agent
    let activeMuted = isMuted;
    if (!isMuted) {
      const stream = await startMic();
      if (!stream) {
        // If mic permission failed/denied, fallback to muted
        activeMuted = true;
      }
    }
    isMutedRef.current = activeMuted;

    // 3. Connect Voice Agent session
    const callbacks: VoiceAgentCallbacks = {
      onReady: (sessionId) => {
        console.log("[AssemblyAI] Tour session ready:", sessionId);
        if (mediaStreamRef.current) {
          agentRef.current?.startAudio(mediaStreamRef.current);
        }
      },
      onUserSpeakingStart: () => {
        bargeIn();
        hasUserInteractedRef.current = true;
        greetingPhaseRef.current = "done";
      },
      onTranscriptPartial: (text) => {
        if (!text) return;
        hasUserInteractedRef.current = true;
        greetingPhaseRef.current = "done";

        // Immediate silence if visitor asks to read or tells Alba to be quiet
        const quietRegex = /\b(prefer to read|rather read|want to read|be quiet|stop talking|stop speaking|stay quiet|quiet mode|silent mode|silence please|shut up|hush)\b/i;
        const resumeRegex = /\b(speak again|talk again|unmute alba|resume speaking|turn off quiet mode|exit reading mode|disable quiet mode)\b/i;
        if (quietRegex.test(text)) {
          if (!isQuietModeRef.current) {
            isQuietModeRef.current = true;
            setIsQuietMode(true);
            audioPlayerRef.current?.flush();
            setAgentStatus("listening");
          }
        } else if (resumeRegex.test(text)) {
          if (isQuietModeRef.current) {
            isQuietModeRef.current = false;
            setIsQuietMode(false);
          }
        }

        setChatMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === partialMsgIdRef.current);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = {
              id: partialMsgIdRef.current,
              role: "visitor",
              text,
              isPartial: true,
              timestamp: new Date(),
            };
            return updated;
          }
          return [
            ...prev,
            {
              id: partialMsgIdRef.current,
              role: "visitor",
              text,
              isPartial: true,
              timestamp: new Date(),
            },
          ];
        });
      },
      onTranscriptFinal: (text) => {
        if (!text?.trim()) return;
        hasUserInteractedRef.current = true;
        greetingPhaseRef.current = "done";

        // Vocal confirmation: "let's go with this first", "start tour", etc. triggers the start-tour flow
        const vocalConfirmRegex = /\b(let'?s go with (this|that)|let'?s (start|begin|do this)( first)?|start (here|the tour|tour|with this)|confirm( this( gallery)?)?|yes,? let'?s (start|go)|take me to|let'?s visit)\b/i;

        // Vocal end gallery tour: "I'm done with this one", "next gallery", "end gallery tour", etc.
        const endGalleryRegex = /\b(((i'?m|we'?re)\s+(done|finished)(\s+with\s+(this|the)(\s+(gallery|painting|artwork|stop|one))?)?)|(done\s+with\s+(this|the)(\s+(gallery|painting|artwork|stop|one))?)|(all\s+done\s+here)|((end|finish|wrap\s*up)\s+(this|the)\s+(gallery|tour(\s+stop)?|artwork))|(end\s+gallery\s+tour)|(end\s+tour\s+of\s+(this|the)\s+gallery)|(next\s+gallery)|(what('?s|\s+is)\s+next(\s+gallery)?)|(where\s+(to\s+next|next|should\s+we\s+go\s+next))|(what\s+should\s+we\s+(tour|see|visit)\s+next)|(what\s+do\s+we\s+tour\s+next)|(let'?s\s+move\s+on)|(ready\s+to\s+move\s+on)|(ready\s+for\s+the\s+next\s+(one|gallery|artwork|stop))|(let'?s\s+(see|check\s+out|visit|go\s+to)\s+the\s+next\s+(one|gallery|artwork|stop))|(move\s+on\s+to\s+the\s+next))\b/i;

        const lowerText = text.toLowerCase();
        let matchedArtId: string | undefined = undefined;
        if (lowerText.includes("fountain") || lowerText.includes("duchamp") || lowerText.includes("urinal")) {
          matchedArtId = "duchamp-fountain";
        } else if (lowerText.includes("masaccio") || lowerText.includes("trinity")) {
          matchedArtId = "masaccio-holy-trinity";
        } else if (lowerText.includes("caravaggio") || lowerText.includes("matthew")) {
          matchedArtId = "caravaggio-calling-st-matthew";
        } else if (lowerText.includes("van gogh") || lowerText.includes("starry")) {
          matchedArtId = "van-gogh-starry-night";
        } else if (lowerText.includes("picasso") || lowerText.includes("demoiselles") || lowerText.includes("avignon")) {
          matchedArtId = "picasso-demoiselles";
        } else if (lowerText.includes("pollock") || lowerText.includes("autumn rhythm")) {
          matchedArtId = "pollock-autumn-rhythm";
        }

        if (vocalConfirmRegex.test(text) || (matchedArtId && /\b(start|begin|go|visit|tour)\b/i.test(text))) {
          handleStartTourWithArtwork(matchedArtId);
          return;
        }

        if (endGalleryRegex.test(text)) {
          handleEndGalleryTour();
          return;
        }

        const quietRegex = /\b(prefer to read|rather read|want to read|be quiet|stop talking|stop speaking|stay quiet|quiet mode|silent mode|silence please|shut up|hush)\b/i;
        const resumeRegex = /\b(speak again|talk again|unmute alba|resume speaking|turn off quiet mode|exit reading mode|disable quiet mode)\b/i;
        if (quietRegex.test(text)) {
          if (!isQuietModeRef.current) {
            isQuietModeRef.current = true;
            setIsQuietMode(true);
            audioPlayerRef.current?.flush();
            setAgentStatus("listening");
          }
        } else if (resumeRegex.test(text)) {
          if (isQuietModeRef.current) {
            isQuietModeRef.current = false;
            setIsQuietMode(false);
          }
        }
        setChatMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== partialMsgIdRef.current);
          return [
            ...filtered,
            {
              id: `visitor-${Date.now()}`,
              role: "visitor",
              text,
              isPartial: false,
              timestamp: new Date(),
            },
          ];
        });
        partialMsgIdRef.current = `visitor-partial-${Date.now()}`;
        setIsChatThinking(true);
        setAgentStatus("thinking");
      },
      onAgentTranscriptPartial: (text) => {
        if (!text) return;
        setIsChatThinking(false);
        setAgentStatus("speaking");

        setChatMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === partialAgentMsgIdRef.current);
          if (idx >= 0) {
            const updated = [...prev];
            const existing = updated[idx];
            if (existing.role === "agent") {
              updated[idx] = {
                ...existing,
                text,
                isStreaming: true,
              };
            }
            return updated;
          }
          return [
            ...prev,
            {
              id: partialAgentMsgIdRef.current,
              role: "agent",
              text,
              isStreaming: true,
              speakerName: "Alba Tour Guide",
              timestamp: new Date(),
            },
          ];
        });
      },
      onAgentTranscriptFinal: (text) => {
        if (!text?.trim()) return;
        setIsChatThinking(false);
        setChatMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== partialAgentMsgIdRef.current);
          return [
            ...filtered,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              text,
              isStreaming: false,
              speakerName: "Alba Tour Guide",
              timestamp: new Date(),
            },
          ];
        });
        partialAgentMsgIdRef.current = `agent-partial-${Date.now()}`;
      },
      onAgentSpeakingStart: () => {
        ignoreAudioUntilNextReplyRef.current = false;
        setAgentStatus("speaking");
      },
      onAgentSpeakingEnd: (interrupted) => {
        replyIndexRef.current += 1;
        const isInitialGreetingTurn = replyIndexRef.current === 1;

        if (interrupted) {
          bargeIn();
          greetingPhaseRef.current = "done";
        } else {
          // Decoupled mute warning: if base greeting just finished transmitting and visitor is still muted
          if (isInitialGreetingTurn && greetingPhaseRef.current === "greeting") {
            if (isMutedRef.current && !hasUserInteractedRef.current && !muteWarningSentRef.current) {
              muteWarningSentRef.current = true;
              agentRef.current?.triggerReply(
                "Notice that the visitor's microphone is currently muted. In one concise, friendly sentence, remind them that their microphone is muted and they can tap the mic button whenever they want to speak or ask questions."
              );
            }
          }

          // Wait for audio player to finish draining queued audio chunks in speakers
          audioPlayerRef.current?.onPlaybackComplete(() => {
            setAgentStatus("listening");
            if (greetingPhaseRef.current === "greeting" && !hasUserInteractedRef.current) {
              greetingPhaseRef.current = "done";
              setIsExpanded((prev) => {
                if (!prev) {
                  setActiveArtifact("map");
                  playStageOpen();
                  return true;
                }
                return prev;
              });
            }

            // If card was collapsed for Alba's explanation, uncollapse it automatically when done!
            if (shouldUncollapseAfterSpeechRef.current) {
              shouldUncollapseAfterSpeechRef.current = false;
              setIsExpanded(true);
              playStageOpen();
            }
          });
        }
      },
      onAgentAudio: (base64) => {
        // If quiet reading mode is enabled or turn was interrupted by barge-in, suppress audio playback completely
        if (isQuietModeRef.current || ignoreAudioUntilNextReplyRef.current) return;
        audioPlayerRef.current?.playChunk(base64);
      },
      onToolCall: (tool) => {
        console.log("[AssemblyAI] Executing tool call:", tool.name, tool.arguments);
        // Only trigger artifact loading skeleton for actual content changes, NOT if previewing an info card
        if (tool.name !== "show_info" && tool.name !== "show_artwork_info") {
          startLoading();
        }

        if (tool.name === "end_gallery_tour" || tool.name === "finish_gallery") {
          setIsArtifactLoading(false);
          handleEndGalleryTour();
          agentRef.current?.sendToolResult(tool.callId, { success: true });
        } else if (tool.name === "show_map") {
          const routeId = (tool.arguments.routeId as string) || "rotunda";
          const showPath = Boolean(tool.arguments.showPath);
          setActiveArtifact("map");
          setActiveMapRoute(routeId);

          const routeDestinationMap: Record<string, string> = {
            perspective: "art:masaccio-holy-trinity",
            shadow: "art:caravaggio-calling-st-matthew",
            feeling: "art:van-gogh-starry-night",
            cubism: "art:picasso-demoiselles",
            concept: "art:pollock-autumn-rhythm",
            rotunda: "art:duchamp-fountain",
            restrooms: "facility:restrooms",
          };
          const destId = routeDestinationMap[routeId] || "";
          // ONLY plot a walking route path if the user explicitly requested directions from A to B (showPath: true)
          if (showPath && destId) {
            setMapNavigation({
              startId: guestLocationRef.current,
              destinationId: destId,
              currentNodeId: null,
            });
            guestLocationRef.current = destId;
            setGuestLocationId(destId);
          } else {
            // Otherwise just show the floor plan without drawing any path line
            setMapNavigation((prev) => ({
              ...prev,
              destinationId: "",
              currentNodeId: null,
            }));
          }

          setChatMessages((prev) => [
            ...prev,
            {
              id: `tool-${Date.now()}`,
              role: "tool",
              toolName: "show_map",
              label: `Gallery Floor Plan: ${routeId}`,
              artifactType: "map",
              params: tool.arguments,
              timestamp: new Date(),
            },
          ]);
          agentRef.current?.sendToolResult(tool.callId, { success: true, destination: routeId });
        } else if (tool.name === "show_hotspots") {
          const rawId = (tool.arguments.artworkId as string) || activeArtworkId || "masaccio-holy-trinity";
          const artId = resolveArtworkId(rawId);
          const artwork = TURNING_POINTS_ARTWORKS[artId] || TURNING_POINTS_ARTWORKS["masaccio-holy-trinity"];
          const availableHotspots = getArtworkHotspots(artwork.id);
          const requestedHotspot = String(tool.arguments.hotspotId || tool.arguments.detailId || tool.arguments.detail || "").trim().toLowerCase();
          const matchedHotspot = availableHotspots.find((item) => item.id.toLowerCase() === requestedHotspot || item.name.toLowerCase() === requestedHotspot);

          // If the agent invoked show_hotspots for a custom user-circled detail, return the curatorial visual analysis!
          const recentVision = pendingVisualAnalysisRef.current;
          const isRecentVisionMatch = recentVision && (Date.now() - recentVision.timestamp < 60000);

          if (!matchedHotspot && isRecentVisionMatch) {
            setIsArtifactLoading(false);
            agentRef.current?.sendToolResult(tool.callId, {
              success: true,
              detail: requestedHotspot || "circled_area",
              analysis: recentVision.answer,
              instruction: "Synthesize this curatorial analysis into 2 warm, natural sentences and speak them directly to the visitor as Alba.",
            });
            pendingVisualAnalysisRef.current = null;
            return;
          }

          if (!matchedHotspot) {
            setIsArtifactLoading(false);
            agentRef.current?.sendToolResult(tool.callId, { success: false, message: "No saved placement matches that detail.", availableHotspots: availableHotspots.map(({ id, name }) => ({ id, name })) }, true);
            return;
          }
          const hotspotId = matchedHotspot.id;
          const artPlaceId = `art:${artwork.id}`;
          setActiveArtworkId(artwork.id);
          setSelectedArtwork({
            id: artwork.id,
            title: artwork.title,
            imageSrc: artwork.imageSrc,
            summary: artwork.summary,
            metadata: [
              { label: "Artist", value: artwork.artist },
              { label: "Date", value: artwork.year },
            ],
          });
          // Display the hotspots on the fullscreen artwork presentation!
          setActiveArtifact("artwork-view");
          setActiveHotspotId(hotspotId);
          setIsExpanded(true);
          // Track guest location without triggering an unrequested path route line
          guestLocationRef.current = artPlaceId;
          setGuestLocationId(artPlaceId);
          if (artwork.wingId && WING_ROUTE_MAP[artwork.wingId]) {
            setActiveMapRoute(WING_ROUTE_MAP[artwork.wingId]);
          }
          setChatMessages((prev) => [
            ...prev,
            {
              id: `tool-${Date.now()}`,
              role: "tool",
              toolName: "show_hotspots",
              label: `Detail: ${matchedHotspot.name} (${artwork.title})`,
              artifactType: "artwork-view",
              params: tool.arguments,
              timestamp: new Date(),
            },
          ]);
          agentRef.current?.sendToolResult(tool.callId, { success: true, activeHotspot: { id: hotspotId, name: matchedHotspot.name }, artwork: artwork.title });
        } else if (tool.name === "show_info" || tool.name === "show_artwork_info") {
          const rawId = (tool.arguments.artworkId as string) || activeArtworkId || "masaccio-holy-trinity";
          const artId = resolveArtworkId(rawId);
          const artwork = TURNING_POINTS_ARTWORKS[artId] || TURNING_POINTS_ARTWORKS["masaccio-holy-trinity"];
          setActiveArtworkId(artwork.id);
          setActiveArtifact("info");
          setSelectedArtwork({
            id: artwork.id,
            title: artwork.title,
            imageSrc: artwork.imageSrc,
            summary: artwork.summary,
            metadata: [
              { label: "Artist", value: artwork.artist },
              { label: "Date", value: artwork.year },
            ],
          });
          // Update guest location without drawing a path route line
          const artPlaceId = `art:${artwork.id}`;
          guestLocationRef.current = artPlaceId;
          setGuestLocationId(artPlaceId);
          // Gallery state (exploring/completed/unexplored) is owned exclusively by the state machine.
          // show_info NEVER modifies it — this prevents a completed artwork from being incorrectly
          // re-flagged as "exploring" when the agent calls show_info to re-display the card.
          if (artwork.wingId && WING_ROUTE_MAP[artwork.wingId]) {
            setActiveMapRoute(WING_ROUTE_MAP[artwork.wingId]);
          }
          setIsExpanded(true);
          setChatMessages((prev) => [
            ...prev,
            {
              id: `tool-${Date.now()}`,
              role: "tool",
              toolName: "show_info",
              label: `Artwork: ${artwork.title}`,
              artifactType: "info",
              params: tool.arguments,
              timestamp: new Date(),
            },
          ]);
          agentRef.current?.sendToolResult(tool.callId, { success: true, artwork: artwork.title });
        } else if (tool.name === "set_quiet_mode") {
          const quiet = Boolean(tool.arguments.quiet);
          isQuietModeRef.current = quiet;
          setIsQuietMode(quiet);
          if (quiet) {
            audioPlayerRef.current?.flush();
            setAgentStatus("listening");
          }
          setChatMessages((prev) => [
            ...prev,
            {
              id: `tool-${Date.now()}`,
              role: "tool",
              toolName: "set_quiet_mode",
              label: quiet ? "Quiet Reading Mode Enabled" : "Spoken Audio Guide Enabled",
              artifactType: "info",
              detail: quiet ? "Alba will remain quiet while you read." : "Spoken guidance resumed.",
              params: tool.arguments,
              timestamp: new Date(),
            },
          ]);
          agentRef.current?.sendToolResult(tool.callId, {
            success: true,
            mode: quiet ? "quiet_reading" : "spoken_guide",
          });
        } else if (tool.name === "show_comparison") {
          const pairId = (tool.arguments.pairId as string) || "comparison-perspective";
          setComparisonPairId(pairId);
          setActiveArtifact("comparison");
          setChatMessages((prev) => [
            ...prev,
            {
              id: `tool-${Date.now()}`,
              role: "tool",
              toolName: "show_comparison",
              label: `Epoch Comparison: ${pairId === "comparison-cubism" ? "Academic Nude vs. Cubist Fracture" : "Medieval Icon vs. Renaissance Depth"}`,
              artifactType: "comparison",
              params: tool.arguments,
              timestamp: new Date(),
            },
          ]);
          agentRef.current?.sendToolResult(tool.callId, { success: true, pair: pairId });
        } else if (tool.name === "show_timeline") {
          // Guard: don't hijack the screen while the visitor is actively exploring an artwork.
          // The agent can mention historical context in speech; the timeline view is only shown
          // when not mid-exploration, preventing jarring mid-tour screen switches.
          if (activeTourArtworkIdRef.current) {
            setIsArtifactLoading(false);
            agentRef.current?.sendToolResult(tool.callId, { success: true, skipped: "visitor is actively exploring an artwork" });
          } else {
            const eraId = (tool.arguments.activeEraId as string) || (tool.arguments.eraId as string) || (tool.arguments.artworkId as string);
            const eraToArtworkMap: Record<string, string> = {
              "1427": "masaccio-holy-trinity",
              "1600": "caravaggio-calling-st-matthew",
              "1889": "van-gogh-starry-night",
              "1907": "picasso-demoiselles",
              "1950": "pollock-autumn-rhythm",
            };
            const resolvedArtworkId = eraToArtworkMap[eraId] || (TURNING_POINTS_ARTWORKS[eraId] ? eraId : undefined);
            if (resolvedArtworkId) {
              setActiveArtworkId(resolvedArtworkId);
            }
            setActiveArtifact("timeline");
            setChatMessages((prev) => [
              ...prev,
              {
                id: `tool-${Date.now()}`,
                role: "tool",
                toolName: "show_timeline",
                label: "Timeline of Artistic Turning Points",
                artifactType: "timeline",
                params: tool.arguments,
                timestamp: new Date(),
              },
            ]);
            agentRef.current?.sendToolResult(tool.callId, { success: true, activeArtworkId: resolvedArtworkId });
          }
        } else if (tool.name === "consult_archives") {
          const query = (tool.arguments.query as string) || "";
          const category = tool.arguments.category as string | undefined;
          const result = searchCuratorialArchives(query, category);
          if (result) {
            setChatMessages((prev) => [
              ...prev,
              {
                id: `tool-${Date.now()}`,
                role: "tool",
                toolName: "consult_archives",
                label: `Archival Source: ${result.authorOrInstitution} (${result.year})`,
                artifactType: "info",
                detail: `"${result.excerpt}" — Finding: ${result.finding}`,
                params: tool.arguments,
                timestamp: new Date(),
              },
            ]);
            agentRef.current?.sendToolResult(tool.callId, {
              success: true,
              source: result.authorOrInstitution,
              title: result.title,
              year: result.year,
              archiveRef: result.archiveRef,
              finding: result.finding,
              excerpt: result.excerpt,
            });
          } else {
            agentRef.current?.sendToolResult(tool.callId, {
              success: false,
              message: "No specific archival document found for this query in current records.",
            });
          }
        } else {
          agentRef.current?.sendToolResult(tool.callId, { success: true });
        }

        // startLoading() already set a self-cancelling timer — no manual cleanup needed here.
        // Any early-return paths above that set setIsArtifactLoading(false) are also safe
        // because startLoading()'s pending timer will simply fire as a no-op.
      },
      onError: (code, message) => {
        console.warn("[AssemblyAI] Agent error:", code, message);
      },
      onEnded: () => {
        console.log("[AssemblyAI] Voice agent session ended.");
        void handleConfirmEndTour();
      },
    };

    agentCallbacksRef.current = callbacks;
    try {
      const agent = await createVoiceAgent(callbacks, { isMuted: activeMuted });
      agentRef.current = agent;
      if (!activeMuted && mediaStreamRef.current) {
        agent.startAudio(mediaStreamRef.current);
      }
    } catch (err) {
      console.warn("[AssemblyAI] Agent connection skipped or failed:", err);
    }
  };

  const handleConfirmEndTour = async () => {
    playCallEnd();
    setIsEndDialogOpen(false);

    stopMic();
    agentRef.current?.end();
    agentRef.current = null;
    audioPlayerRef.current?.close();
    audioPlayerRef.current = null;

    greetingPhaseRef.current = "idle";
    hasUserInteractedRef.current = false;
    replyIndexRef.current = 0;
    muteWarningSentRef.current = false;
    isQuietModeRef.current = false;
    setIsQuietMode(false);
    guestLocationRef.current = "entrance";
    setGuestLocationId("entrance");
    // Reset all gallery states atomically
    resetGalleryStates();
    shouldUncollapseAfterSpeechRef.current = false;
    setMapNavigation({ startId: "entrance", destinationId: "", currentNodeId: null });

    // Reset back to pre-tour state
    setIsTourActive(false);
    setIsExpanded(false);
    setActiveArtifact("info");
    setActiveExpressionId("neutral");
    setChatMessages([]);
    setIsChatThinking(false);
    setOriginMapRoute("entrance");
    setActiveMapRoute("entrance");
  };

  // Derived from the gallery state machine for rendering (map ring colors, card buttons, showTourActions)
  const activeTourArtworkId = Object.keys(galleryStates).find((k) => galleryStates[k] === "exploring") ?? null;
  const completedArtworkIds = Object.keys(galleryStates).filter((k) => galleryStates[k] === "completed");

  const isListening = isTourActive && !isMuted && activeExpressionId === "listening";

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

  const mapControl = (
    <button
      type="button"
      onClick={() => {
        playTactileTap();
        // Do NOT call bargeIn() here so narration continues while viewing the map
        hasUserInteractedRef.current = true;
        if (isExpanded && activeArtifact === "map") {
          setIsExpanded(false);
          playStageClose();
        } else {
          setActiveArtifact("map");
          if (!isExpanded) {
            setIsExpanded(true);
            playStageOpen();
          }
        }
      }}
      aria-label={isExpanded && activeArtifact === "map" ? "Close map" : "Open map"}
      title={isExpanded && activeArtifact === "map" ? "Close map" : "Open map"}
      className="call-group-map-btn size-9 rounded-full border border-border/80 bg-card hover:bg-muted text-foreground flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0 shadow-xs"
    >
      <HugeiconsIcon icon={MapIcon} size={16} />
    </button>
  );

  const chatControl = (
    <button
      type="button"
      onClick={() => {
        playTactileTap();
        // Do NOT call bargeIn() here so narration continues while reading transcriptions
        hasUserInteractedRef.current = true;
        if (isExpanded && activeArtifact === "chat") {
          setIsExpanded(false);
          playStageClose();
        } else {
          setActiveArtifact("chat");
          if (!isExpanded) {
            setIsExpanded(true);
            playStageOpen();
          }
        }
      }}
      aria-label={isExpanded && activeArtifact === "chat" ? "Close transcript" : "Open transcript"}
      title={isExpanded && activeArtifact === "chat" ? "Close transcript" : "Open transcript"}
      className="call-group-chat-btn size-9 rounded-full border border-border/80 bg-card hover:bg-muted text-foreground flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0 shadow-xs"
    >
      <HugeiconsIcon icon={MessageSquareIcon} size={16} />
    </button>
  );

  const micControl = (
    <button
      type="button"
      onClick={toggleMic}
      aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
      title={isMuted ? "Unmute microphone" : "Mute microphone"}
      className="call-group-mic-btn size-9 rounded-full border border-border/80 bg-card hover:bg-muted text-foreground flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0 shadow-xs"
    >
      <HugeIcon icon={isMuted ? MicOff01Icon : Mic01Icon} size={16} />
    </button>
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
    // Toggling stage expansion should not cut off narration
    hasUserInteractedRef.current = true;
    shouldUncollapseAfterSpeechRef.current = false;
    setIsExpanded((prev) => {
      const next = !prev;
      if (next) {
        playStageOpen();
        setActiveArtifact("map");
      } else {
        playStageClose();
      }
      return next;
    });
  };

  const isEffectivelyMuted = isTourActive && isMuted;
  const statusLabel = isQuietMode
    ? "Quiet"
    : isEffectivelyMuted
      ? "Muted"
      : agentStatus;
  const areDotsActive = isTourActive && !isMuted && !isQuietMode;

  const statusIndicator = (
    <div
      className="h-7 px-2 flex items-center gap-1.5 text-xs font-medium text-[#72706b] select-none tracking-[-0.1px]"
    >
      <span className="capitalize font-medium text-[#72706b]">
        {statusLabel}
      </span>
      <span className="inline-flex items-center gap-1 ml-0.5">
        <span className={`size-1.5 rounded-full bg-[#72706b] ${areDotsActive ? "animate-bounce [animation-delay:-0.3s]" : "opacity-60"}`} />
        <span className={`size-1.5 rounded-full bg-[#72706b] ${areDotsActive ? "animate-bounce [animation-delay:-0.15s]" : "opacity-60"}`} />
        <span className={`size-1.5 rounded-full bg-[#72706b] ${areDotsActive ? "animate-bounce" : "opacity-60"}`} />
      </span>
    </div>
  );

  // Call group: horizontal dock at bottom with artifact controls on the left, divider, and mic & end controls on the right
  const callGroup = (
    <div
      className="call-group-container flex h-[52px] w-[196px] items-center justify-between rounded-full border border-border bg-[#fafafa] px-2 shadow-xs transition-all duration-300"
      role="group"
      aria-label="Tour controls"
    >
      <div className="flex items-center gap-1.5">
        {mapControl}
        {chatControl}
      </div>
      <hr className="call-group-divider h-4 w-px border-0 bg-border shrink-0 my-auto" aria-hidden="true" />
      <div className="flex items-center gap-1.5">
        {micControl}
        {endControl}
      </div>
    </div>
  );

  // Concentric cradle notch with balanced 10px margin around the 196x52px dock capsule
  const dockPath =
    "M 0 67.5 C 13 67.5 16 56 16 41.5 A 36 36 0 0 1 52 5.5 H 196 A 36 36 0 0 1 232 41.5 C 232 56 235 67.5 248 67.5";

  return (
    <div className="relative h-dvh min-h-[480px] w-full flex overflow-hidden bg-white">
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
            <div className="flex min-h-full w-full flex-col items-center bg-white font-sans">
              <div
                className="landing-hero-image relative w-full shrink-0 overflow-hidden bg-zinc-100"
              >
                <Image
                  src="/hero-collage-picked.png"
                  alt="A grainy cut-paper collage of two distinct painted portraits and a still life"
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>

              <section className="flex w-full flex-1 items-center bg-white">
                <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-6 px-5 py-6 sm:gap-8 sm:px-6 sm:py-8 md:h-full md:grid-cols-[minmax(0,1fr)_auto] md:gap-12">
                  <h1 className="max-w-[34rem] font-outfit text-3xl font-normal leading-[1.06] tracking-[-0.025em] text-[#171717] sm:text-4xl lg:text-5xl">
                    <span className="block">Turning Points</span>
                    <span className="block">in Art History</span>
                  </h1>

                  <div className="flex w-full max-w-[31rem] flex-col items-start gap-3 font-sans md:ml-auto md:w-fit md:items-stretch md:gap-4 md:justify-self-end">
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
              <div className={`guide-card-layer absolute inset-0 ${activeArtifact === 'artwork-view' ? 'md:-left-24' : 'md:left-24'}`} inert={!isExpanded} aria-hidden={!isExpanded}>
                <div className="guide-card relative flex h-full w-full items-center justify-center overflow-visible rounded-2xl border border-[#e5e7e6] bg-[#fafafa] shadow-xs">

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
                    className="absolute rounded-full bg-[#fafafa] hover:bg-muted text-secondary-text hover:text-foreground border border-border flex items-center justify-center transition-all cursor-pointer z-20 shadow-xs active:scale-95"
                  >
                    <HugeIcon icon={Cancel01Icon} size={15} />
                  </button>

                  {/* Artifact Stage - clean canvas utilizing the entire newly formed card as working area */}
                  <div
                    className={`w-full h-full overflow-hidden ${activeArtifact === "map" || activeArtifact === "artwork-view"
                        ? "p-0 rounded-2xl"
                        : "pt-14 pb-16 px-3 md:p-5 md:pb-16 md:pr-14"
                      }`}
                  >
                    <ArtifactStage
                      artifactType={activeArtifact}
                      mapDisplay="exhibition"
                      selectedArtwork={selectedArtwork}
                      mapNavigation={mapNavigation}
                      onMapNavigationChange={setMapNavigation}
                      mapViewport={mapViewport ?? undefined}
                      onMapViewportChange={setMapViewport}
                      comparisonPairId={comparisonPairId}
                      artworkId={activeArtworkId}
                      showTourActions={(galleryStates[activeArtworkId] ?? "unexplored") === "unexplored"}
                      activeTourArtworkId={activeTourArtworkId}
                      completedArtworkIds={completedArtworkIds}
                      onStartTour={() => handleStartTourWithArtwork()}
                      onViewArtworkFullscreen={() => setActiveArtifact("artwork-view")}
                      onEndGalleryTour={handleEndGalleryTour}
                      onSelectArtwork={(artwork) => {
                        hasUserInteractedRef.current = true;
                        const rawId = artwork.id || activeArtworkId || "masaccio-holy-trinity";
                        const resolvedId = resolveArtworkId(rawId);
                        const targetArtwork = TURNING_POINTS_ARTWORKS[resolvedId] || TURNING_POINTS_ARTWORKS["masaccio-holy-trinity"];
                        const isSameGallery = targetArtwork.id === activeArtworkId;

                        // Ensure no route line is plotted when simply viewing/selecting a gallery
                        setMapNavigation((prev) => ({
                          ...prev,
                          destinationId: "",
                          currentNodeId: null,
                        }));

                        setActiveArtworkId(targetArtwork.id);
                        setSelectedArtwork({
                          id: targetArtwork.id,
                          title: targetArtwork.title,
                          imageSrc: targetArtwork.imageSrc,
                          summary: targetArtwork.summary,
                          metadata: [
                            { label: "Artist", value: targetArtwork.artist },
                            { label: "Date", value: targetArtwork.year },
                          ],
                        });
                        if (targetArtwork.wingId && WING_ROUTE_MAP[targetArtwork.wingId]) {
                          setActiveMapRoute(WING_ROUTE_MAP[targetArtwork.wingId]);
                        }

                        setActiveArtifact("info");
                        setIsExpanded(true);
                        playTactileTap();

                        // Use the state machine's ref for an accurate snapshot (not the closure-captured derived value)
                        const isCurrentlyExploring = galleryStatesRef.current[targetArtwork.id] === "exploring";

                        if (!isCurrentlyExploring && isTourActive) {
                          muteWarningSentRef.current = true;
                          greetingPhaseRef.current = "done";

                          const artworkState = galleryStatesRef.current[targetArtwork.id] ?? "unexplored";
                          // For completed artworks: acknowledge the visit WITHOUT suggesting revisiting
                          // (the Revisit button exists for user-initiated action only)
                          const promptText = artworkState === "completed"
                            ? `The visitor tapped on ${targetArtwork.title} (${targetArtwork.year}) by ${targetArtwork.artist} — a gallery they have already visited. In one warm sentence, acknowledge what made this stop memorable and offer to answer any lingering questions. Do NOT suggest revisiting.`
                            : `The visitor clicked on ${targetArtwork.title} (${targetArtwork.year}) by ${targetArtwork.artist} on the floor map. In one friendly, brief sentence, give a warm teaser of why this masterpiece is exciting, and invite them to tap 'Start tour' or ask any questions to begin here. Speak with poise and no apologies. CRITICAL: Do NOT call any tools. Do not call show_info, show_map, or any other tool. Speak ONLY the single-sentence spoken teaser.`;

                          if (!isQuietModeRef.current) {
                            setChatMessages((prev) => [
                              ...prev,
                              {
                                id: `visitor-nav-${Date.now()}`,
                                role: "visitor",
                                text: `[Previewing ${targetArtwork.title} on gallery map]`,
                                isPartial: false,
                                timestamp: new Date(),
                              },
                            ]);
                            // safeReply always flushes in-flight audio first — prevents the double-reply
                            // race condition when the user taps a pin while Alba is already speaking
                            safeReply(promptText);
                          } else {
                            setChatMessages((prev) => [
                              ...prev,
                              {
                                id: `visitor-nav-${Date.now()}`,
                                role: "visitor",
                                text: `[Viewing ${targetArtwork.title} in Quiet Reading Mode]`,
                                isPartial: false,
                                timestamp: new Date(),
                              },
                            ]);
                          }
                        }
                        // If currently exploring: narration continues smoothly without interruption!
                      }}
                      mapRouteId={activeMapRoute}
                      originMapRouteId={originMapRoute}
                      hotspotId={activeHotspotId}
                      isLoading={isArtifactLoading}
                      chatMessages={chatMessages}
                      isChatThinking={isChatThinking}
                      onSelectArtifact={(type, params) => {
                        hasUserInteractedRef.current = true;
                        // Going to maps, transcriptions, or returning to current info does NOT stop narration
                        if (type !== "map" && type !== "chat" && type !== "info") {
                          bargeIn();
                        }
                        setActiveArtifact(type);
                        if (params?.routeId) setActiveMapRoute(params.routeId as any);
                        if (params?.hotspotId) setActiveHotspotId(params.hotspotId as any);
                        playTactileTap();
                      }}
                    />
                  </div>

                  {/* Bottom Pill Cradle Notch: Frames the dock with balanced 10px margin */}
                  <div
                    className="absolute -bottom-px left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                    style={{ width: 248, height: 68 }}
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 248 68"
                      width="248"
                      height="68"
                      fill="none"
                      className="overflow-visible"
                    >
                      <path d={`${dockPath} L 248 72 L 0 72 Z`} className="fill-background" />
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
                  isSpeaking={agentStatus === "speaking"}
                  audioLevel={audioLevel}
                  shape={0.11}
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
        {/* Footer with brand logo and clean fallback view switcher positioned outside the main stage view */}
        <footer className="relative z-[4] mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 text-xs text-secondary-text select-none sm:px-6">
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

      {isTourActive && activeArtifact === "artwork-view" && (
        <ImmersiveArtworkView
          artwork={selectedArtwork}
          onAskAboutSelection={handleAskAboutSelection}
          avatar={<ArticulateAvatar expressionId={activeExpressionId} size={112} isListening={isListening} isMuted={isMuted} isSpeaking={agentStatus === "speaking"} audioLevel={audioLevel} shape={0.11} />}
          controls={callGroup}
          onBackToDetails={() => {
            setActiveHotspotId(null);
            setActiveArtifact("info");
          }}
          activeHotspotId={activeHotspotId}
          onSelectHotspot={setActiveHotspotId}
        />
      )}
      <Dialog open={isExhibitInfoOpen} onOpenChange={setIsExhibitInfoOpen}>
        <DialogContent showCloseButton={false} className="grid max-h-[calc(100dvh-2rem)] w-full grid-cols-1 gap-0 overflow-y-auto rounded-none border-0 bg-white p-0 sm:h-[480px] sm:max-w-[800px] sm:grid-cols-2 sm:overflow-hidden">
          <button
            type="button"
            aria-label="Close about exhibit"
            title="Close"
            onClick={() => setIsExhibitInfoOpen(false)}
            className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-[#fafafa] text-[#1f1e1b] shadow-md transition-colors hover:bg-[#e5e7eb] hover:text-[#1f1e1b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f1e1b]"
          >
            <HugeIcon icon={Cancel01Icon} size={16} />
          </button>
          <div className="flex min-h-[360px] flex-col justify-between p-7 sm:min-h-0 sm:p-8">
            <div className="flex flex-col items-start gap-4">
              <DialogHeader className="w-full">
                <DialogTitle className="w-full font-outfit text-3xl sm:text-4xl font-normal leading-[1.08] tracking-normal text-[#1f1e1b]">
                  <span className="block sm:whitespace-nowrap">Turning Points in Art</span>
                  <span className="block">History</span>
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col items-start gap-4 pt-1">
                <DialogDescription className="max-w-[19.5rem] font-sans text-sm leading-relaxed text-[#3f3f46]">
                  An intelligent voice tour guide reimagining the museum experience, turning gallery visits into an interactive, real-time conversation.
                </DialogDescription>
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
            </div>

            <div className="pt-4 flex items-center gap-1.5 text-xs text-secondary-text">
              <HugeIcon icon={InformationCircleIcon} size={14} className="shrink-0 text-secondary-text" />
              <span>Microphone access required for voice conversation.</span>
            </div>
          </div>
          <div className="relative min-h-64 sm:min-h-0">
            <Image
              src="/about-oil-painting.png"
              alt="An oil still life of wildflowers in an ochre vase"
              fill
              sizes="(max-width: 640px) 100vw, 400px"
              className="object-cover object-center"
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
              Are you sure you want to end your tour? This will disconnect your conversation session with Alba.
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