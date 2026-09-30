"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { getExhibitRouteDestination, INITIAL_EXHIBIT_NAVIGATION, type ExhibitArtworkInfo, type ExhibitNavigationState } from "@/components/artifacts/exhibit-floor-map-view";
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

function resolveRequestedWing(text: string): (typeof TURNING_POINTS_WINGS)[number] | undefined {
  const normalizedText = text.toLowerCase().replace(/\s+/g, " ");
  const numberWords: Record<number, string[]> = {
    1: ["1", "one", "first"],
    2: ["2", "two", "second"],
    3: ["3", "three", "third"],
    4: ["4", "four", "fourth"],
    5: ["5", "five", "fifth"],
  };
  const hasVisitIntent = (prefix: string) => [
    /\b(?:i want to|i'd like to|i would like to|i wanna|i'd love to|i would love to|can you|could you|would you|can we|could we|should we|we should|let's)\s+(?:start|visit|explore|tour)\s*$/i,
    /\b(?:give|plan)\s+me\s+(?:a\s+)?tour\s+of\s*$/i,
    /\b(?:i want|i'd like|i would like)\s+(?:a\s+)?tour\s+of\s*$/i,
    /\b(?:can|could)\s+i\s+(?:get|have)\s+(?:a\s+)?tour\s+of\s*$/i,
    /\b(?:take|bring)\s+me\s+to\s*$/i,
    /\bgo\s+to\s*$/i,
    /(?:^|[.!?]\s*)(?:please\s+)?(?:start|visit|explore|tour)\s*$/i,
  ].some((pattern) => pattern.test(prefix));

  const candidates: Array<{ wing: (typeof TURNING_POINTS_WINGS)[number]; index: number }> = [];
  for (const wing of TURNING_POINTS_WINGS) {
    const forms = numberWords[wing.number].join("|");
    const numberMatch = new RegExp(
      `\\b(?:wing\\s+(?:(?:number|no\\.?)\\s*)?(?:${forms})|(?:${forms})\\s+wing)\\b`,
      "i",
    ).exec(normalizedText);
    if (numberMatch?.index !== undefined) candidates.push({ wing, index: numberMatch.index });

    const titleVariants = [wing.title.toLowerCase(), wing.title.toLowerCase().replace(/^the\s+/, "")];
    for (const title of new Set(titleVariants)) {
      const titleIndex = normalizedText.indexOf(title);
      if (titleIndex >= 0) candidates.push({ wing, index: titleIndex });
    }
  }

  candidates.sort((left, right) => left.index - right.index);
  return candidates.find(({ index }) => hasVisitIntent(normalizedText.slice(0, index)))?.wing;
}

function resolveArtworkId(idOrQuery?: string): string | null {
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
  return null;
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
import { createVoiceAgent, type VoiceAgent, type VoiceAgentCallbacks, type VoiceAgentEndReason } from "@/lib/assemblyai-agent";
import { createAudioPlayer, type AudioPlayer } from "@/lib/assemblyai-audio";
import { BayerDitherBackground } from "@/components/ui/bayer-dither-background";
import { useOutputAudioLevel } from "@/hooks/use-output-audio-level";

type AgentStatus = "listening" | "thinking" | "speaking";
type VoiceConnectionState = "idle" | "connecting" | "connected" | "failed";

type GalleryStates = Record<string, "unexplored" | "exploring" | "completed">;

type TourPageState = {
  isExpanded: boolean;
  isTourActive: boolean;
  activeArtifact: ArtifactType;
  selectedArtwork: ExhibitArtworkInfo | null;
  activeArtworkId: string;
  galleryStates: GalleryStates;
  guestLocationId: string;
  mapNavigation: ExhibitNavigationState;
  originMapRoute: string;
  activeMapRoute: string;
  chatMessages: ChatMessage[];
  isChatThinking: boolean;
};

type TourPageStatePatch = {
  [Key in keyof TourPageState]?: React.SetStateAction<TourPageState[Key]>;
};

type TourPageStateAction =
  | { type: "set"; key: keyof TourPageState; value: unknown }
  | { type: "patch"; patch: TourPageStatePatch };

const INITIAL_TOUR_PAGE_STATE: TourPageState = {
  isExpanded: false,
  isTourActive: false,
  activeArtifact: "info",
  selectedArtwork: null,
  activeArtworkId: "masaccio-holy-trinity",
  galleryStates: {},
  guestLocationId: "entrance",
  mapNavigation: INITIAL_EXHIBIT_NAVIGATION,
  originMapRoute: "entrance",
  activeMapRoute: "entrance",
  chatMessages: [],
  isChatThinking: false,
};

function resolveTourPageStateUpdate<Value>(previous: Value, update: React.SetStateAction<Value>): Value {
  return typeof update === "function"
    ? (update as (previous: Value) => Value)(previous)
    : update;
}

function tourPageStateReducer(state: TourPageState, action: TourPageStateAction): TourPageState {
  if (action.type === "set") {
    const previous = state[action.key];
    const value = typeof action.value === "function"
      ? (action.value as (previous: unknown) => unknown)(previous)
      : action.value;
    return { ...state, [action.key]: value } as TourPageState;
  }

  const nextState = { ...state };
  (Object.keys(action.patch) as Array<keyof TourPageState>).forEach((key) => {
    const update = action.patch[key];
    if (update === undefined) return;
    const previous = state[key];
    const value = typeof update === "function"
      ? (update as (previous: unknown) => unknown)(previous)
      : update;
    Object.assign(nextState, { [key]: value });
  });
  return nextState;
}

function useTourPageField<Key extends keyof TourPageState>(
  state: TourPageState,
  dispatch: React.Dispatch<TourPageStateAction>,
  key: Key,
): [TourPageState[Key], React.Dispatch<React.SetStateAction<TourPageState[Key]>>] {
  const setValue = React.useCallback((value: React.SetStateAction<TourPageState[Key]>) => {
    dispatch({ type: "set", key, value });
  }, [dispatch, key]);

  return [state[key], setValue];
}

type PendingArtifactToolResult = {
  callId: string;
  replyId?: string;
  result: unknown;
  isError?: boolean;
  visibleArtifacts: ArtifactType[];
};

const QUIET_MODE_PHRASES = [
  "prefer to read", "rather read", "want to read", "be quiet", "stop talking", "stop speaking", "stay quiet", "quiet mode", "silent mode", "silence please", "shut up", "hush",
  "prefiero leer", "quiero leer", "quisiera leer", "silencio por favor", "por favor silencio", "quedate en silencio", "callate", "deja de hablar", "no hables", "modo silencioso", "modo silencio",
  "je prefere lire", "je veux lire", "reste silencieuse", "reste silencieux", "tais toi", "arrete de parler", "mode silencieux", "mode silence", "silence s il te plait",
  "ich mochte lesen", "ich will lesen", "sei still", "bitte sei leise", "hor auf zu sprechen", "ruhe bitte", "ruhemodus", "stummmodus",
  "preferisco leggere", "voglio leggere", "per favore fai silenzio", "stai zitta", "stai zitto", "smetti di parlare", "modalita silenziosa", "modalita silenzio",
];

const RESUME_MODE_PHRASES = [
  "speak again", "talk again", "unmute alba", "resume speaking", "turn off quiet mode", "exit reading mode", "disable quiet mode",
  "habla de nuevo", "puedes hablar", "vuelve a hablar", "reanuda la guia", "continua hablando", "sal del modo silencioso", "puedes seguir",
  "parle a nouveau", "tu peux parler", "reprends la parole", "recommence a parler", "sors du mode silencieux", "reprends la visite",
  "sprich wieder", "du kannst wieder sprechen", "sprich weiter", "rede weiter", "beende den ruhemodus", "verlasse den ruhemodus",
  "parla di nuovo", "puoi parlare", "riprendi a parlare", "continua a parlare", "esci dalla modalita silenziosa", "riprendi la visita",
];

function matchesVoicePhrases(text: string, phrases: string[]) {
  const normalizedText = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return phrases.some((phrase) => normalizedText.includes(phrase));
}

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
  const [tourPageState, dispatchTourPageState] = React.useReducer(tourPageStateReducer, INITIAL_TOUR_PAGE_STATE);
  const [isExpanded] = useTourPageField(tourPageState, dispatchTourPageState, "isExpanded");
  const [isTourActive, setIsTourActive] = useTourPageField(tourPageState, dispatchTourPageState, "isTourActive");
  const [visitorName, setVisitorName] = React.useState("Visitor");
  const [isEndDialogOpen, setIsEndDialogOpen] = React.useState(false);
  const [isExhibitInfoOpen, setIsExhibitInfoOpen] = React.useState(false);
  const [activeExpressionId, setActiveExpressionId] = React.useState<ExpressionId>("neutral");
  const [agentStatus, setAgentStatus] = React.useState<AgentStatus>("listening");
  const [voiceConnection, setVoiceConnection] = React.useState<VoiceConnectionState>("idle");
  const voiceConnectionRef = React.useRef<VoiceConnectionState>("idle");
  const transitionVoiceConnection = React.useCallback((state: VoiceConnectionState) => {
    voiceConnectionRef.current = state;
    setVoiceConnection(state);
  }, []);
  const isVoiceReady = voiceConnection === "connected";
  const [connectionError, setConnectionError] = React.useState<string | null>(null);
  const [micError, setMicError] = React.useState<string | null>(null);
  const [sessionExpiryDialogOpen, setSessionExpiryDialogOpen] = React.useState(false);
  const [visualHandoffStatus, setVisualHandoffStatus] = React.useState<"idle" | "queued" | "speaking" | "failed">("idle");
  const visualHandoffStatusRef = React.useRef(visualHandoffStatus);
  visualHandoffStatusRef.current = visualHandoffStatus;
  const updateVisualHandoffStatus = React.useCallback((status: "idle" | "queued" | "speaking" | "failed") => {
    visualHandoffStatusRef.current = status;
    setVisualHandoffStatus(status);
  }, []);
  const [isMuted, setIsMuted] = React.useState(false);
  const [activeArtifact, setActiveArtifact] = useTourPageField(tourPageState, dispatchTourPageState, "activeArtifact");
  const [selectedArtwork, setSelectedArtwork] = useTourPageField(tourPageState, dispatchTourPageState, "selectedArtwork");
  const [mapNavigation, setMapNavigation] = useTourPageField(tourPageState, dispatchTourPageState, "mapNavigation");
  const mapNavigationRef = React.useRef<ExhibitNavigationState>(INITIAL_TOUR_PAGE_STATE.mapNavigation);
  mapNavigationRef.current = mapNavigation;
  const [mapViewport, setMapViewport] = React.useState<MapViewport | null>(null);
  const [originMapRoute, setOriginMapRoute] = useTourPageField(tourPageState, dispatchTourPageState, "originMapRoute");
  const [activeMapRoute, setActiveMapRoute] = useTourPageField(tourPageState, dispatchTourPageState, "activeMapRoute");
  const [activeHotspotSelection, setActiveHotspotSelection] = React.useState<{ artworkId: string; hotspotId: string } | null>(null);
  const activeHotspotId = activeHotspotSelection && activeHotspotSelection.artworkId === selectedArtwork?.id ? activeHotspotSelection.hotspotId : undefined;
  React.useEffect(() => {
    setActiveHotspotSelection((current) => current && current.artworkId !== selectedArtwork?.id ? null : current);
  }, [selectedArtwork?.id]);
  const [activeArtworkId, setActiveArtworkId] = useTourPageField(tourPageState, dispatchTourPageState, "activeArtworkId");
  const activeArtworkIdRef = React.useRef(activeArtworkId);
  activeArtworkIdRef.current = activeArtworkId;
  const [comparisonPairId, setComparisonPairId] = React.useState<string>("comparison-perspective");
  // Quiet / Reading Mode: when true, visitor prefers to read and Alba remains silent
  const [isQuietMode, setIsQuietMode] = React.useState<boolean>(false);
  const isQuietModeRef = React.useRef<boolean>(false);
  // Guest location ref mirrors reducer state for immediate tool-call decisions.
  const guestLocationRef = React.useRef<string>(INITIAL_TOUR_PAGE_STATE.guestLocationId);
  const isExpandedRef = React.useRef<boolean>(INITIAL_TOUR_PAGE_STATE.isExpanded);
  // ── Gallery State Machine ────────────────────────────────────────────────
  // Single source of truth for all artwork tour states.
  // Replaces the previous 3 pairs of state+ref (activeTourArtworkId, completedArtworkIds, startedArtworkIds).
  const [galleryStates] = useTourPageField(tourPageState, dispatchTourPageState, "galleryStates");
  const galleryStatesRef = React.useRef<GalleryStates>(INITIAL_TOUR_PAGE_STATE.galleryStates);
  // Derived refs mirror reducer gallery state for immediate callback reads.
  const activeTourArtworkIdRef = React.useRef<string | null>(null);
  const completedArtworkIdsRef = React.useRef<string[]>([]);

  const patchTourPageState = React.useCallback((patch: TourPageStatePatch) => {
    const resolvedPatch: TourPageStatePatch = { ...patch };

    if (patch.activeArtworkId !== undefined) {
      const next = resolveTourPageStateUpdate(activeArtworkIdRef.current, patch.activeArtworkId);
      activeArtworkIdRef.current = next;
      resolvedPatch.activeArtworkId = next;
    }
    if (patch.isExpanded !== undefined) {
      const next = resolveTourPageStateUpdate(isExpandedRef.current, patch.isExpanded);
      isExpandedRef.current = next;
      resolvedPatch.isExpanded = next;
    }
    if (patch.guestLocationId !== undefined) {
      const next = resolveTourPageStateUpdate(guestLocationRef.current, patch.guestLocationId);
      guestLocationRef.current = next;
      resolvedPatch.guestLocationId = next;
    }
    if (patch.galleryStates !== undefined) {
      const next = resolveTourPageStateUpdate(galleryStatesRef.current, patch.galleryStates);
      galleryStatesRef.current = next;
      activeTourArtworkIdRef.current = Object.keys(next).find((id) => next[id] === "exploring") ?? null;
      completedArtworkIdsRef.current = Object.keys(next).filter((id) => next[id] === "completed");
      resolvedPatch.galleryStates = next;
    }

    dispatchTourPageState({ type: "patch", patch: resolvedPatch });
  }, []);

  const setIsExpanded = React.useCallback((update: React.SetStateAction<boolean>) => {
    patchTourPageState({ isExpanded: update });
  }, [patchTourPageState]);


  // Auto-reset timer for the artifact loading skeleton — prevents permanently stuck skeletons.
  const loadingTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  // Debounce timer for gallery pin teasers to ensure only the final selected artwork is introduced
  const pinTeaserTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // When start tour is clicked, card collapses for fullscreen Alba explanation, then auto-uncollapses
  const shouldUncollapseAfterSpeechRef = React.useRef<boolean>(false);
  // Tracks hotspot speech lifecycle: only dismisses AFTER Alba completes the tool response explanation
  const hotspotSpeechPhaseRef = React.useRef<"idle" | "pending_reply" | "explaining" | "draining">("idle");
  const hotspotDismissTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  // Dev toggle: simulates the isLoading state triggered by tool.call / tool.result.
  // Will be wired to real events once voice is connected.
  const [isArtifactLoading, setIsArtifactLoading] = React.useState(false);
  // Chat history state — messages accumulate as the tour progresses.
  const [chatMessages, setChatMessages] = useTourPageField(tourPageState, dispatchTourPageState, "chatMessages");
  const pendingArtifactToolResultsRef = React.useRef<PendingArtifactToolResult[]>([]);
  const [isChatThinking, setIsChatThinking] = useTourPageField(tourPageState, dispatchTourPageState, "isChatThinking");
  // Partial visitor transcript ID — updated in place as partials arrive
  const partialMsgIdRef = React.useRef<string>("visitor-partial");
  const partialAgentMsgIdRef = React.useRef<string>("agent-partial");
  // Voice Agent + audio player refs
  const agentRef = React.useRef<VoiceAgent | null>(null);
  const audioPlayerRef = React.useRef<AudioPlayer | null>(null);
  const agentCallbacksRef = React.useRef<VoiceAgentCallbacks | null>(null);

  React.useEffect(() => {
    if (pendingArtifactToolResultsRef.current.length === 0) return;

    const remaining: PendingArtifactToolResult[] = [];
    for (const pending of pendingArtifactToolResultsRef.current) {
      if (!pending.visibleArtifacts.includes(activeArtifact)) {
        agentRef.current?.sendToolResult(
          pending.callId,
          { success: false, status: "artifact_not_visible" },
          true,
          pending.replyId
        );
      } else if (isExpanded && !isArtifactLoading) {
        agentRef.current?.sendToolResult(pending.callId, pending.result, pending.isError, pending.replyId);
      } else {
        remaining.push(pending);
      }
    }
    pendingArtifactToolResultsRef.current = remaining;
  }, [activeArtifact, isExpanded, isArtifactLoading, chatMessages]);

  // Greeting & reply lifecycle refs
  const visitorSpeechActiveRef = React.useRef(false);
  const greetingPhaseRef = React.useRef<"idle" | "greeting" | "done">("idle");
  const hasUserInteractedRef = React.useRef<boolean>(false);
  const isTogglingMicRef = React.useRef<boolean>(false);
  const isMutedRef = React.useRef<boolean>(false);
  const replyIndexRef = React.useRef<number>(0);
  const muteWarningSentRef = React.useRef<boolean>(false);

  // Barge-in: immediately stop playback in speakers and drop any pending/in-flight audio chunks from interrupted turn
  const ignoreAudioUntilNextReplyRef = React.useRef<boolean>(false);
  const visualAnalysisRequestRef = React.useRef(0);
  const uiContextVersionRef = React.useRef(0);
  const replyUiContextVersionRef = React.useRef(0);
  const quietUntilNextPromptRef = React.useRef(false);
  const visualQuestionPendingRef = React.useRef(false);
  const pendingVisualAnalysisRef = React.useRef<{
    artworkId: string;
    answer: string;
    timestamp: number;
  } | null>(null);

  const bargeIn = React.useCallback(() => {
    ignoreAudioUntilNextReplyRef.current = true;
    audioPlayerRef.current?.flush();
    audioPlayerRef.current?.setDucked(false);
    setAgentStatus("listening");
    shouldUncollapseAfterSpeechRef.current = false;
    if (hotspotDismissTimerRef.current) {
      clearTimeout(hotspotDismissTimerRef.current);
      hotspotDismissTimerRef.current = null;
    }
    // Only dismiss if visitor barged in during or after Alba's active explanation (never on pre-reply turn transition)
    if (hotspotSpeechPhaseRef.current === "explaining" || hotspotSpeechPhaseRef.current === "draining") {
      hotspotSpeechPhaseRef.current = "idle";
      setActiveHotspotSelection(null);
    }
  }, []);

  const syncVisitorUiContext = React.useCallback((change: string, interruptSpeech = false) => {
    uiContextVersionRef.current += 1;
    visualAnalysisRequestRef.current += 1;
    pendingVisualAnalysisRef.current = null;
    if (visualQuestionPendingRef.current) {
      visualQuestionPendingRef.current = false;
      setIsChatThinking(false);
    }
    if (interruptSpeech) {
      quietUntilNextPromptRef.current = true;
      bargeIn();
    }
    agentRef.current?.sendContext(
      "The visitor used the interface to " + change + (interruptSpeech ? ". This is context only; do not reply. Stay quiet until the visitor asks a question or triggers a new spoken response." : ". This is context only; do not initiate a new reply.")
    );
  }, [bargeIn]);

  // ── State Machine Helpers ─────────────────────────────────────────────────

  /**
   * Atomically transition the active stop and any related page state.
   */
  const startExploring = React.useCallback((artworkId: string, patch: TourPageStatePatch = {}) => {
    patchTourPageState({
      ...patch,
      galleryStates: (prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          if (next[id] === "exploring" && id !== artworkId) next[id] = "completed";
        });
        next[artworkId] = "exploring";
        return next;
      },
    });
  }, [patchTourPageState]);

  /**
   * Atomically transition a single artwork to a target state.
   * Used to mark an artwork as "completed" when ending its gallery tour.
   */
  const setArtworkGalleryState = React.useCallback((
    artworkId: string,
    toState: "unexplored" | "exploring" | "completed",
    patch: TourPageStatePatch = {},
  ) => {
    patchTourPageState({
      ...patch,
      galleryStates: (prev) => ({ ...prev, [artworkId]: toState }),
    });
  }, [patchTourPageState]);

  /**
   * Safe reply — always flushes in-flight audio before triggering a new agent reply.
   * Prevents double-reply race conditions when navigating while Alba is already speaking.
   * Use this instead of calling audioPlayerRef.current?.flush() + triggerReply() separately.
   */
  const safeReply = React.useCallback((prompt: string) => {
    const agent = agentRef.current;
    if (voiceConnectionRef.current !== "connected" || !agent) return;
    quietUntilNextPromptRef.current = false;
    ignoreAudioUntilNextReplyRef.current = true;
    audioPlayerRef.current?.flush();
    setAgentStatus("thinking");
    agent.triggerReply(prompt);
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
    if (!isVoiceReady) {
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
  }, [isVoiceReady, agentStatus, isMuted]);

  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const [micStream, setMicStream] = React.useState<MediaStream | null>(null);
  const getOutputAudioLevel = React.useCallback(() => audioPlayerRef.current?.getOutputAudioLevel() ?? 0, []);
  const audioLevel = useOutputAudioLevel(getOutputAudioLevel, isTourActive && agentStatus === "speaking");

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
        setMicError(null);
        isMutedRef.current = false;
        setIsMuted(false);
        return stream;
      }
    } catch (err) {
      console.warn("Microphone access error or denied:", err);
      setMicError("Microphone access was denied. Allow microphone access and retry.");
      isMutedRef.current = true;
      setIsMuted(true);
    }
    return null;
  }, []);

  const toggleMic = React.useCallback(async () => {
    if (!isVoiceReady || isTogglingMicRef.current) return;
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
  }, [isVoiceReady, isMuted, agentStatus, startMic, stopMic]);

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

  const handleStartTourWithArtwork = React.useCallback((overrideArtworkId?: string, requestedWingTitle?: string) => {
    // Keep the current behavior for visitor-triggered endings; tool calls use their continuation.
    hasUserInteractedRef.current = true;
    muteWarningSentRef.current = true;
    greetingPhaseRef.current = "done";

    const rawId = overrideArtworkId || selectedArtwork?.id || activeArtworkId || "masaccio-holy-trinity";
    const resolvedId = resolveArtworkId(rawId);
    if (!resolvedId) return;
    const targetArtwork = TURNING_POINTS_ARTWORKS[resolvedId];
    const artPlaceId = `art:${targetArtwork.id}`;
    syncVisitorUiContext("started the tour at " + targetArtwork.title, true);

    const artworkSelection: ExhibitArtworkInfo = {
      id: targetArtwork.id,
      title: targetArtwork.title,
      imageSrc: targetArtwork.imageSrc,
      summary: targetArtwork.summary,
      metadata: [
        { label: "Artist", value: targetArtwork.artist },
        { label: "Date", value: targetArtwork.year },
      ],
    };
    const artworkPatch: TourPageStatePatch = {
      mapNavigation: (prev) => ({
        ...prev,
        currentLocationId: artPlaceId,
        routeOriginId: artPlaceId,
        destinationId: "",
        currentNodeId: null,
      }),
      guestLocationId: artPlaceId,
      activeArtworkId: targetArtwork.id,
      selectedArtwork: artworkSelection,
      activeArtifact: "artwork-view",
      isExpanded: true,
    };
    if (targetArtwork.wingId && WING_ROUTE_MAP[targetArtwork.wingId]) {
      artworkPatch.activeMapRoute = WING_ROUTE_MAP[targetArtwork.wingId];
    }

    // Start the stop and update its related page state in one reducer transition.
    startExploring(targetArtwork.id, artworkPatch);

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
      `The visitor requested ${requestedWingTitle ? `a tour of ${requestedWingTitle}, beginning with` : "this artwork as their tour stop:"} ${targetArtwork.title} (${targetArtwork.year}) by ${targetArtwork.artist}. Begin the tour directly at this selected stop and give a vivid, engaging 2-sentence curatorial introduction to the artwork. Do not call it the first or opening stop unless the visitor specifically asked for the first stop. Speak with poise and dive straight into the artwork without any apologies. CRITICAL: Do NOT call show_info, show_map, or any tools. Speak ONLY the spoken introduction.`
    );
  }, [selectedArtwork, activeArtworkId, safeReply, startExploring, syncVisitorUiContext]);

  const handleEndGalleryTour = React.useCallback((speakAfterEnd = true) => {
    // Keep the current behavior for visitor-triggered endings; tool calls use their continuation.
    hasUserInteractedRef.current = true;
    greetingPhaseRef.current = "done";

    // Resolve the currently exploring artwork via the ref (closure-safe, always current)
    const rawId = activeTourArtworkIdRef.current || activeArtworkId || selectedArtwork?.id || "masaccio-holy-trinity";
    const resolvedId = resolveArtworkId(rawId);
    if (!resolvedId) return;
    const currentArtwork = TURNING_POINTS_ARTWORKS[resolvedId];
    const artPlaceId = `art:${currentArtwork.id}`;
    syncVisitorUiContext("ended the tour of " + currentArtwork.title + " and returned to the floor map", true);

    // Complete the stop and return to the floor map in one reducer transition.
    setArtworkGalleryState(currentArtwork.id, "completed", {
      mapNavigation: (prev) => ({
        ...prev,
        currentLocationId: artPlaceId,
        routeOriginId: artPlaceId,
        destinationId: "",
        currentNodeId: null,
      }),
      guestLocationId: artPlaceId,
      activeArtifact: "map",
      isExpanded: true,
    });
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

    // Tool-triggered endings continue through the tool result; only the visitor control needs a manual reply.
    if (speakAfterEnd) {
      setIsChatThinking(true);
      safeReply(
        `The visitor has ended their tour of the ${currentArtwork.title} (${currentArtwork.year}) gallery and returned to the exhibition floor map. In 1 to 2 warm, engaging sentences as Alba, acknowledge concluding our time with ${currentArtwork.title}, and ask them which gallery, milestone, or artwork they would like to explore next on the floor map.`
      );
    }
  }, [selectedArtwork, activeArtworkId, safeReply, setArtworkGalleryState, syncVisitorUiContext]);

  const handleAskAboutSelection = React.useCallback(async (selection: ArtworkSelection) => {
    syncVisitorUiContext("asked Alba about a circled artwork detail", true);
    const requestId = ++visualAnalysisRequestRef.current;
    updateVisualHandoffStatus("queued");
    const artworkId = resolveArtworkId(selectedArtwork?.id || activeArtworkId);
    if (!artworkId) return;
    const artwork = TURNING_POINTS_ARTWORKS[artworkId];
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
    visualQuestionPendingRef.current = true;
    setAgentStatus("thinking");

    try {
      const response = await fetch("/api/visual-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworkId, selection, question: visitorQuestion }),
      });
      const result = await response.json();
      if (requestId !== visualAnalysisRequestRef.current) return;
      visualQuestionPendingRef.current = false;
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
      setAgentStatus("thinking");

      const connectedAgent = agentRef.current;
      if (voiceConnectionRef.current === "connected" && connectedAgent) {
        quietUntilNextPromptRef.current = false;
        updateVisualHandoffStatus("queued");
        connectedAgent.triggerReply(reply);
      } else {
        setIsChatThinking(false);
        setAgentStatus("listening");
        updateVisualHandoffStatus("idle");
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
      }
    } catch (error) {
      if (requestId !== visualAnalysisRequestRef.current) return;
      visualQuestionPendingRef.current = false;
      updateVisualHandoffStatus("queued");
      console.error("Artwork visual question failed:", error);
      const reply = `The visitor circled a detail in "${artwork.title}" and asked about it, but the visual analysis failed. In one warm sentence, apologize briefly that you could not inspect that detail right now, and invite them to ask about something else in the painting.`;
      setChatMessages((previous) => [
        ...previous,
        { id: `vision-error-${Date.now()}`, role: "tool", toolName: "visual_analysis", label: "Image analysis unavailable", timestamp: new Date() },
      ]);
      audioPlayerRef.current?.flush();
      setAgentStatus("thinking");
      const connectedAgent = agentRef.current;
      if (voiceConnectionRef.current === "connected" && connectedAgent) {
        quietUntilNextPromptRef.current = false;
        connectedAgent.triggerReply(reply);
      } else {
        setIsChatThinking(false);
        setAgentStatus("listening");
        updateVisualHandoffStatus("failed");
      }
    }
  }, [selectedArtwork, activeArtworkId, syncVisitorUiContext, updateVisualHandoffStatus]);
  const handleStartTour = async () => {
    if (pinTeaserTimerRef.current) {
      clearTimeout(pinTeaserTimerRef.current);
      pinTeaserTimerRef.current = null;
    }
    if (agentRef.current) {
      console.log("[AssemblyAI] Ending previous agent instance before starting new tour...");
      agentRef.current.end();
      agentRef.current = null;
    }
    visualAnalysisRequestRef.current += 1;
    quietUntilNextPromptRef.current = false;
    if (visualHandoffStatus === "queued") { setIsChatThinking(false); updateVisualHandoffStatus("idle"); }
    setConnectionError(null);
    setMicError(null);
    setSessionExpiryDialogOpen(false);
    transitionVoiceConnection("connecting");
    playCallStart();
    // Reset related page state together before connecting.
    patchTourPageState({
      isTourActive: true,
      isExpanded: false,
      activeArtifact: "map",
      selectedArtwork: null,
      mapNavigation: INITIAL_EXHIBIT_NAVIGATION,
      originMapRoute: "entrance",
      activeMapRoute: "entrance",
      guestLocationId: "entrance",
      galleryStates: {},
      chatMessages: [],
      isChatThinking: false,
    });
    setMapViewport(null);
    setAgentStatus("listening");
    setActiveExpressionId(isMuted ? "muted" : "listening");

    // Initialize greeting lifecycle refs
    replyIndexRef.current = 0;
    muteWarningSentRef.current = false;
    greetingPhaseRef.current = "greeting";
    hasUserInteractedRef.current = false;
    isMutedRef.current = isMuted;
    isQuietModeRef.current = false;
    setIsQuietMode(false);
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
        transitionVoiceConnection("connected");
        setAgentStatus("listening");
        setConnectionError(null);
        setActiveExpressionId(isMutedRef.current ? "muted" : "listening");
        console.log("[AssemblyAI] Tour session ready:", sessionId);
        agentRef.current?.sendContext("The visitor started a tour. The floor map is open at the entrance, with no gallery selected and no route requested.");
        if (mediaStreamRef.current) {
          agentRef.current?.startAudio(mediaStreamRef.current);
        }
      },
      onUserSpeakingStart: () => {
        if (voiceConnectionRef.current !== "connected") return;
        visitorSpeechActiveRef.current = true;
        if (pinTeaserTimerRef.current) {
          clearTimeout(pinTeaserTimerRef.current);
          pinTeaserTimerRef.current = null;
          const selected = TURNING_POINTS_ARTWORKS[activeArtworkIdRef.current];
          if (selected) {
            agentRef.current?.sendContext("The visitor selected the " + selected.title + " gallery on the floor map. Keep this as context for their spoken question; do not initiate a reply just because of the selection.");
          }
        }
        quietUntilNextPromptRef.current = false;
        // Duck Alba's speech smoothly so the visitor can speak clearly without microphone echo bleed.
        // We do NOT flush or barge-in here — treating every VAD start as an interruption breaks audio on
        // breathing, ambient noise, or backchannels ("uh-huh"). The server's semantic turn detector
        // will signal a true interruption via reply.done(interrupted), which flushes audio instantly.
        audioPlayerRef.current?.setDucked(true);
        hasUserInteractedRef.current = true;
        greetingPhaseRef.current = "done";
      },
      onUserSpeakingStop: () => {
        if (voiceConnectionRef.current !== "connected") return;
        visitorSpeechActiveRef.current = false;
        audioPlayerRef.current?.setDucked(false);
      },
      onTranscriptPartial: (text) => {
        if (voiceConnectionRef.current !== "connected" || !text) return;
        hasUserInteractedRef.current = true;
        greetingPhaseRef.current = "done";

        // Immediate silence if visitor asks to read or tells Alba to be quiet
        if (matchesVoicePhrases(text, QUIET_MODE_PHRASES)) {
          if (!isQuietModeRef.current) {
            isQuietModeRef.current = true;
            setIsQuietMode(true);
            audioPlayerRef.current?.flush();
            setAgentStatus("listening");
          }
        } else {
          // Resume from safe word the moment the visitor speaks to Alba
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
        if (voiceConnectionRef.current !== "connected" || !text?.trim()) return;
        visitorSpeechActiveRef.current = false;
        audioPlayerRef.current?.setDucked(false);
        hasUserInteractedRef.current = true;
        greetingPhaseRef.current = "done";

        // Vocal confirmation: "let's go with this first", "start tour", etc. triggers the start-tour flow
        const vocalConfirmRegex = /\b(let'?s go with (this|that)|let'?s (start|begin|do this)( first)?|start (here|the tour|tour|with this)|confirm( this( gallery)?)?|yes,? let'?s (start|go)|take me to|let'?s visit)\b/i;

        // Vocal end gallery tour: "I'm done with this one", "next gallery", "end gallery tour", etc.
        const endGalleryRegex = /\b(((i'?m|we'?re)\s+(done|finished)(\s+with\s+(this|the)(\s+(gallery|painting|artwork|stop|one))?)?)|(done\s+with\s+(this|the)(\s+(gallery|painting|artwork|stop|one))?)|(all\s+done\s+here)|((end|finish|wrap\s*up)\s+(this|the)\s+(gallery|tour(\s+stop)?|artwork))|(end\s+gallery\s+tour)|(end\s+tour\s+of\s+(this|the)\s+gallery)|(next\s+gallery)|(what('?s|\s+is)\s+next(\s+gallery)?)|(where\s+(to\s+next|next|should\s+we\s+go\s+next))|(what\s+should\s+we\s+(tour|see|visit)\s+next)|(what\s+do\s+we\s+tour\s+next)|(let'?s\s+move\s+on)|(ready\s+to\s+move\s+on)|(ready\s+for\s+the\s+next\s+(one|gallery|artwork|stop))|(let'?s\s+(see|check\s+out|visit|go\s+to)\s+the\s+next\s+(one|gallery|artwork|stop))|(move\s+on\s+to\s+the\s+next))\b/i;

        const lowerText = text.toLowerCase();
        const requestedWing = resolveRequestedWing(text);
        if (requestedWing) {
          handleStartTourWithArtwork(requestedWing.anchorArtworkId, requestedWing.title);
          return;
        }
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

        if (matchesVoicePhrases(text, QUIET_MODE_PHRASES)) {
          if (!isQuietModeRef.current) {
            isQuietModeRef.current = true;
            setIsQuietMode(true);
            audioPlayerRef.current?.flush();
            setAgentStatus("listening");
          }
        } else {
          // Resume from safe word the moment the visitor speaks to Alba
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
        if (voiceConnectionRef.current !== "connected" || quietUntilNextPromptRef.current || !text) return;
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
        if (voiceConnectionRef.current !== "connected" || quietUntilNextPromptRef.current || !text?.trim()) return;
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
        if (voiceConnectionRef.current !== "connected") return;
        replyUiContextVersionRef.current = uiContextVersionRef.current;
        ignoreAudioUntilNextReplyRef.current = false;
        audioPlayerRef.current?.setDucked(false);
        if (quietUntilNextPromptRef.current) return;
        if (visualHandoffStatusRef.current === "queued") updateVisualHandoffStatus("speaking");
        setAgentStatus("speaking");
        if (hotspotSpeechPhaseRef.current === "pending_reply") {
          hotspotSpeechPhaseRef.current = "explaining";
        }
      },
      onAgentSpeakingEnd: (interrupted) => {
        if (voiceConnectionRef.current !== "connected") return;
        if (visualHandoffStatusRef.current === "queued" || visualHandoffStatusRef.current === "speaking") updateVisualHandoffStatus("idle");
        replyIndexRef.current += 1;
        const isInitialGreetingTurn = replyIndexRef.current === 1;

        if (interrupted) {
          bargeIn();
          greetingPhaseRef.current = "done";
          if (hotspotSpeechPhaseRef.current === "explaining" || hotspotSpeechPhaseRef.current === "draining") {
            hotspotSpeechPhaseRef.current = "idle";
            setActiveHotspotSelection(null);
          }
        } else {
          audioPlayerRef.current?.setDucked(false);
          if (hotspotSpeechPhaseRef.current === "explaining") {
            hotspotSpeechPhaseRef.current = "draining";
          }

          // Wait for audio player to finish draining queued audio chunks in speakers
          audioPlayerRef.current?.onPlaybackComplete(() => {
            setAgentStatus("listening");
            // Decoupled mute warning: only trigger once greeting has fully finished playing through speakers and visitor has not yet interacted
            if (isInitialGreetingTurn && greetingPhaseRef.current === "greeting") {
              if (isMutedRef.current && !hasUserInteractedRef.current && !muteWarningSentRef.current) {
                muteWarningSentRef.current = true;
                agentRef.current?.triggerReply(
                  "Notice that the visitor's microphone is currently muted. In one concise, friendly sentence, remind them that their microphone is muted and they can tap the mic button whenever they want to speak or ask questions."
                );
              }
            }
            if (hotspotSpeechPhaseRef.current === "draining") {
              hotspotSpeechPhaseRef.current = "idle";
              if (hotspotDismissTimerRef.current) clearTimeout(hotspotDismissTimerRef.current);
              // Detail explanation complete: retain detail for comfortable viewing, then gracefully clear
              hotspotDismissTimerRef.current = setTimeout(() => {
                setActiveHotspotSelection(null);
                hotspotDismissTimerRef.current = null;
              }, 4000);
            }
            if (greetingPhaseRef.current === "greeting" && !hasUserInteractedRef.current) {
              greetingPhaseRef.current = "done";
              if (!isExpandedRef.current) {
                patchTourPageState({ isExpanded: true, activeArtifact: "map" });
                playStageOpen();
              }
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
        if (voiceConnectionRef.current !== "connected" || isQuietModeRef.current || quietUntilNextPromptRef.current || ignoreAudioUntilNextReplyRef.current) return;
        audioPlayerRef.current?.playChunk(base64);
      },
      onToolCall: (tool) => {
        if (voiceConnectionRef.current !== "connected") {
          setIsArtifactLoading(false);
          return;
        }
        if (replyUiContextVersionRef.current !== uiContextVersionRef.current || quietUntilNextPromptRef.current) {
          quietUntilNextPromptRef.current = true;
          bargeIn();
          agentRef.current?.sendToolResult(tool.callId, { success: false, status: "stale_context" }, true, tool.replyId);
          return;
        }
        const showToolFailure = (message: string, artifactType: "info" | "hotspots", extra: Record<string, unknown> = {}) => {
          setIsArtifactLoading(false);
          setActiveArtifact("chat");
          setIsExpanded(true);
          setChatMessages((previous) => [
            ...previous,
            {
              id: "tool-error-" + Date.now(),
              role: "tool",
              toolName: tool.name,
              label: "Could not display requested content",
              artifactType,
              detail: message,
              timestamp: new Date(),
            },
          ]);
          pendingArtifactToolResultsRef.current.push({
            callId: tool.callId,
            replyId: tool.replyId,
            result: { success: false, message, ...extra },
            isError: true,
            visibleArtifacts: ["chat"],
          });
        };
        console.log("[AssemblyAI] Executing tool call:", tool.name, tool.arguments);
        // Only trigger artifact loading skeleton for actual content changes, NOT if previewing an info card
        if (tool.name !== "show_info" && tool.name !== "show_artwork_info") {
          startLoading();
        }

        if (tool.name === "end_gallery_tour" || tool.name === "finish_gallery") {
          setIsArtifactLoading(false);
          handleEndGalleryTour(false);
          agentRef.current?.sendToolResult(tool.callId, { success: true }, false, tool.replyId);
        } else if (tool.name === "show_map") {
          const routeId = (tool.arguments.routeId as string) || "rotunda";
          const showPath = Boolean(tool.arguments.showPath);
          const destId = getExhibitRouteDestination(routeId) || "";
          // Keep map presentation, route, and simulated arrival together.
          const mapPatch: TourPageStatePatch = {
            activeArtifact: "map",
            activeMapRoute: routeId,
            isExpanded: true,
          };
          if (showPath && destId) {
            mapPatch.mapNavigation = (previous) => ({
              ...previous,
              routeOriginId: previous.currentLocationId,
              destinationId: destId,
              currentLocationId: destId,
              currentNodeId: null,
            });
            mapPatch.guestLocationId = destId;
          } else {
            mapPatch.mapNavigation = (prev) => ({
              ...prev,
              destinationId: "",
              currentNodeId: null,
            });
          }
          patchTourPageState(mapPatch);

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
          pendingArtifactToolResultsRef.current.push({ callId: tool.callId, replyId: tool.replyId, result: { success: true, destination: routeId }, visibleArtifacts: ["map"] });
        } else if (tool.name === "show_hotspots") {
          const rawId = (tool.arguments.artworkId as string) || activeArtworkIdRef.current || "masaccio-holy-trinity";
          const artId = resolveArtworkId(rawId);
          if (!artId || !TURNING_POINTS_ARTWORKS[artId]) {
            showToolFailure("No artwork matches " + rawId + ".", "hotspots");
            return;
          }
          const artwork = TURNING_POINTS_ARTWORKS[artId];
          const availableHotspots = getArtworkHotspots(artwork.id);
          const requestedHotspot = String(tool.arguments.hotspotId || tool.arguments.detailId || tool.arguments.detail || "").trim().toLowerCase();
          const matchedHotspot = availableHotspots.find((item) => item.id.toLowerCase() === requestedHotspot || item.name.toLowerCase() === requestedHotspot);

          // If the agent invoked show_hotspots for a custom user-circled detail, return the curatorial visual analysis!
          const recentVision = pendingVisualAnalysisRef.current;
          const isRecentVisionMatch = recentVision && recentVision.artworkId === artwork.id && (Date.now() - recentVision.timestamp < 60000);

          if (!matchedHotspot && isRecentVisionMatch) {
            setIsArtifactLoading(false);
            agentRef.current?.sendToolResult(tool.callId, {
              success: true,
              detail: requestedHotspot || "circled_area",
              analysis: recentVision.answer,
              instruction: "Synthesize this curatorial analysis into 2 warm, natural sentences and speak them directly to the visitor as Alba.",
            }, false, tool.replyId);
            pendingVisualAnalysisRef.current = null;
            return;
          }

          if (!matchedHotspot) {
            showToolFailure("No saved placement matches " + requestedHotspot + ".", "hotspots", { availableHotspots: availableHotspots.map(({ id, name }) => ({ id, name })) });
            return;
          }
          const hotspotId = matchedHotspot.id;
          const artPlaceId = `art:${artwork.id}`;
          const artworkPatch: TourPageStatePatch = {
            activeArtworkId: artwork.id,
            selectedArtwork: {
              id: artwork.id,
              title: artwork.title,
              imageSrc: artwork.imageSrc,
              summary: artwork.summary,
              metadata: [
                { label: "Artist", value: artwork.artist },
                { label: "Date", value: artwork.year },
              ],
            },
            activeArtifact: "artwork-view",
            isExpanded: true,
            guestLocationId: artPlaceId,
            mapNavigation: (previous) => ({ ...previous, currentLocationId: artPlaceId }),
          };
          if (artwork.wingId && WING_ROUTE_MAP[artwork.wingId]) {
            artworkPatch.activeMapRoute = WING_ROUTE_MAP[artwork.wingId];
          }
          patchTourPageState(artworkPatch);

          // Display the hotspots on the fullscreen artwork presentation!
          if (hotspotDismissTimerRef.current) {
            clearTimeout(hotspotDismissTimerRef.current);
            hotspotDismissTimerRef.current = null;
          }
          setActiveHotspotSelection({ artworkId: artwork.id, hotspotId });
          hotspotSpeechPhaseRef.current = "pending_reply";
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
          pendingArtifactToolResultsRef.current.push({ callId: tool.callId, replyId: tool.replyId, result: { success: true, activeHotspot: { id: hotspotId, name: matchedHotspot.name }, artwork: artwork.title }, visibleArtifacts: ["artwork-view"] });
        } else if (tool.name === "show_info" || tool.name === "show_artwork_info") {
          const rawId = (tool.arguments.artworkId as string) || activeArtworkIdRef.current || "masaccio-holy-trinity";
          const artId = resolveArtworkId(rawId);
          if (!artId || !TURNING_POINTS_ARTWORKS[artId]) {
            showToolFailure("No artwork matches " + rawId + ".", "info");
            return;
          }
          const artwork = TURNING_POINTS_ARTWORKS[artId];
          const isTourInSession = isTourActive;
          // If a tour is in session, always route to fullscreen artwork view instead of an info card.
          const artworkPatch: TourPageStatePatch = {
            activeArtworkId: artwork.id,
            activeArtifact: isTourInSession ? "artwork-view" : ((prev) => (prev === "artwork-view" ? prev : "info")),
            selectedArtwork: {
              id: artwork.id,
              title: artwork.title,
              imageSrc: artwork.imageSrc,
              summary: artwork.summary,
              metadata: [
                { label: "Artist", value: artwork.artist },
                { label: "Date", value: artwork.year },
              ],
            },
            isExpanded: true,
          };
          // Update guest location without drawing a path route line
          const artPlaceId = `art:${artwork.id}`;
          artworkPatch.guestLocationId = artPlaceId;
          artworkPatch.mapNavigation = (previous) => ({ ...previous, currentLocationId: artPlaceId });
          // Gallery state (exploring/completed/unexplored) is owned exclusively by the state machine.
          // show_info NEVER modifies it — this prevents a completed artwork from being incorrectly
          // re-flagged as "exploring" when the agent calls show_info to re-display the card.
          if (artwork.wingId && WING_ROUTE_MAP[artwork.wingId]) {
            artworkPatch.activeMapRoute = WING_ROUTE_MAP[artwork.wingId];
          }
          patchTourPageState(artworkPatch);
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
          pendingArtifactToolResultsRef.current.push({ callId: tool.callId, replyId: tool.replyId, result: { success: true, artwork: artwork.title }, visibleArtifacts: isTourInSession ? ["artwork-view"] : ["info", "artwork-view"] });
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
          }, false, tool.replyId);
        } else if (tool.name === "show_comparison") {
          const pairId = (tool.arguments.pairId as string) || "comparison-perspective";
          setComparisonPairId(pairId);
          setActiveArtifact("comparison");
          setIsExpanded(true);
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
          pendingArtifactToolResultsRef.current.push({ callId: tool.callId, replyId: tool.replyId, result: { success: true, pair: pairId }, visibleArtifacts: ["comparison"] });
        } else if (tool.name === "show_timeline") {
          // Guard: don't hijack the screen while the visitor is actively exploring an artwork.
          // The agent can mention historical context in speech; the timeline view is only shown
          // when not mid-exploration, preventing jarring mid-tour screen switches.
          if (activeTourArtworkIdRef.current) {
            setIsArtifactLoading(false);
            agentRef.current?.sendToolResult(tool.callId, { success: true, skipped: "visitor is actively exploring an artwork" }, false, tool.replyId);
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
            setIsExpanded(true);
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
            pendingArtifactToolResultsRef.current.push({ callId: tool.callId, replyId: tool.replyId, result: { success: true, activeArtworkId: resolvedArtworkId }, visibleArtifacts: ["timeline"] });
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
            }, false, tool.replyId);
          } else {
            agentRef.current?.sendToolResult(tool.callId, {
              success: false,
              message: "No specific archival document found for this query in current records.",
            }, false, tool.replyId);
          }
        } else {
          agentRef.current?.sendToolResult(tool.callId, { success: true }, false, tool.replyId);
        }

        // startLoading() already set a self-cancelling timer — no manual cleanup needed here.
        // Any early-return paths above that set setIsArtifactLoading(false) are also safe
        // because startLoading()'s pending timer will simply fire as a no-op.
      },
      onError: (code, message) => {
        console.warn("[AssemblyAI] Agent error:", code, message);
        transitionVoiceConnection("failed");
        setAgentStatus("listening");
        setIsChatThinking(false);
        setActiveExpressionId("neutral");
        setConnectionError(message || "Alba could not connect. Check your connection and retry.");
      },
      onEnded: (reason) => {
        console.log("[AssemblyAI] onEnded triggered in UI:", reason);
        handleUnexpectedSessionEnd(reason);
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
      transitionVoiceConnection("failed");
      setAgentStatus("listening");
      setIsChatThinking(false);
      setActiveExpressionId("neutral");
      setConnectionError(err instanceof Error ? err.message : "Alba could not connect. Check your connection and retry.");
    }
  };

  const handleUnexpectedSessionEnd = (reason: VoiceAgentEndReason) => {
    console.log("[AssemblyAI] handleUnexpectedSessionEnd:", reason);
    if (pinTeaserTimerRef.current) {
      clearTimeout(pinTeaserTimerRef.current);
      pinTeaserTimerRef.current = null;
    }
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    if (hotspotDismissTimerRef.current) {
      clearTimeout(hotspotDismissTimerRef.current);
      hotspotDismissTimerRef.current = null;
    }
    // Stop all audio output and in-flight audio buffers immediately
    audioPlayerRef.current?.flush();
    audioPlayerRef.current?.close();
    audioPlayerRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    visualAnalysisRequestRef.current += 1;
    visualQuestionPendingRef.current = false;
    pendingVisualAnalysisRef.current = null;
    pendingArtifactToolResultsRef.current = [];
    setActiveHotspotSelection(null);

    transitionVoiceConnection("failed");
    setIsChatThinking(false);
    updateVisualHandoffStatus("idle");
    setAgentStatus("listening");
    setActiveExpressionId("neutral");
    stopMic();
    agentRef.current?.end();
    agentRef.current = null;
    const isExpired = reason.type === "expired";
    setConnectionError(isExpired ? "This voice session reached its 180-second limit. You can continue exploring or start a new session." : reason.type === "disconnected" ? "Alba's connection was interrupted. Your tour remains open; retry to talk with her again." : reason.message || "Alba's voice session ended. Your tour remains open.");
    if (isExpired) setSessionExpiryDialogOpen(true);
  };

  React.useEffect(() => {
    const handleOffline = () => {
      if (voiceConnectionRef.current === "connected" || voiceConnectionRef.current === "connecting") {
        agentRef.current?.end();
        agentRef.current = null;
        handleUnexpectedSessionEnd({
          type: "disconnected",
          code: 1006,
          message: "Network connection lost. Your tour remains open; check your connection to speak with Alba again.",
        });
      }
    };
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetryConnection = async () => {
    setConnectionError(null);
    transitionVoiceConnection("connecting");
    try {
      agentRef.current?.end();
      agentRef.current = null;
      if (!audioPlayerRef.current) audioPlayerRef.current = createAudioPlayer();
      const agent = await createVoiceAgent(agentCallbacksRef.current ?? {}, { isMuted: isMutedRef.current });
      agentRef.current = agent;
      if (!isMutedRef.current && mediaStreamRef.current) agent.startAudio(mediaStreamRef.current);
    } catch (err) {
      transitionVoiceConnection("failed");
      setIsChatThinking(false);
      setConnectionError(err instanceof Error ? err.message : "Alba could not connect. Check your connection and retry.");
    }
  };

  const handleConfirmEndTour = async () => {
    if (pinTeaserTimerRef.current) {
      clearTimeout(pinTeaserTimerRef.current);
      pinTeaserTimerRef.current = null;
    }
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    if (hotspotDismissTimerRef.current) {
      clearTimeout(hotspotDismissTimerRef.current);
      hotspotDismissTimerRef.current = null;
    }
    visualAnalysisRequestRef.current += 1;
    visualQuestionPendingRef.current = false;
    pendingVisualAnalysisRef.current = null;
    pendingArtifactToolResultsRef.current = [];
    updateVisualHandoffStatus("idle");
    setActiveHotspotSelection(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    uiContextVersionRef.current += 1;
    quietUntilNextPromptRef.current = true;
    bargeIn();
    transitionVoiceConnection("idle");
    setConnectionError(null);
    setMicError(null);
    setSessionExpiryDialogOpen(false);
    playCallEnd();
    setIsEndDialogOpen(false);

    stopMic();
    agentRef.current?.end();
    agentRef.current = null;
    audioPlayerRef.current?.flush();
    audioPlayerRef.current?.close();
    audioPlayerRef.current = null;

    greetingPhaseRef.current = "idle";
    hasUserInteractedRef.current = false;
    replyIndexRef.current = 0;
    muteWarningSentRef.current = false;
    isQuietModeRef.current = false;
    setIsQuietMode(false);
    patchTourPageState({
      guestLocationId: "entrance",
      galleryStates: {},
      mapNavigation: INITIAL_EXHIBIT_NAVIGATION,
      isTourActive: false,
      isExpanded: false,
      activeArtifact: "info",
      chatMessages: [],
      isChatThinking: false,
      originMapRoute: "entrance",
      activeMapRoute: "entrance",
    });
    shouldUncollapseAfterSpeechRef.current = false;
    setActiveExpressionId("neutral");
  };

  // Derived from the gallery state machine for rendering (map ring colors, card buttons, showTourActions)
  const activeTourArtworkId = Object.keys(galleryStates).find((k) => galleryStates[k] === "exploring") ?? null;
  const completedArtworkIds = Object.keys(galleryStates).filter((k) => galleryStates[k] === "completed");

  const isListening = isVoiceReady && !isMuted && activeExpressionId === "listening";

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
          patchTourPageState({ isExpanded: false });
          playStageClose();
        } else {
          patchTourPageState({
            activeArtifact: "map",
            ...(isExpanded ? {} : { isExpanded: true }),
          });
          if (!isExpanded) playStageOpen();
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
          patchTourPageState({ isExpanded: false });
          playStageClose();
        } else {
          patchTourPageState({
            activeArtifact: "chat",
            ...(isExpanded ? {} : { isExpanded: true }),
          });
          if (!isExpanded) playStageOpen();
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
      disabled={!isVoiceReady}
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
    const next = !isExpandedRef.current;
    patchTourPageState(next
      ? { isExpanded: true, activeArtifact: "map" }
      : { isExpanded: false });
    if (next) playStageOpen();
    else playStageClose();
  };

  const isEffectivelyMuted = isVoiceReady && isMuted;
  const statusLabel = voiceConnection === "connecting" ? "Connecting..." : voiceConnection === "failed" ? "Unable to connect" : !isVoiceReady ? "Idle" : isQuietMode ? "Quiet" : isEffectivelyMuted ? "Muted" : agentStatus;

  const statusIndicator = (
    <div
      className="h-7 px-2 flex items-center gap-1.5 text-xs font-medium text-[#72706b] select-none tracking-[-0.1px]"
    >
      <span className="capitalize font-medium text-[#72706b]">
        {statusLabel}
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
                      onMapNavigationChange={(navigation) => {
                        agentRef.current?.sendContext("The visitor changed the floor-map route from " + navigation.routeOriginId + " to " + navigation.destinationId + ". Keep this as context only and continue the current narration.");
                        setMapNavigation(navigation);
                      }}
                      mapViewport={mapViewport ?? undefined}
                      onMapViewportChange={(viewport) => {
                        setMapViewport(viewport);
                      }}
                      comparisonPairId={comparisonPairId}
                      artworkId={activeArtworkId}
                      showTourActions={(galleryStates[activeArtworkId] ?? "unexplored") === "unexplored"}
                      activeTourArtworkId={activeTourArtworkId}
                      completedArtworkIds={completedArtworkIds}
                      onStartTour={() => handleStartTourWithArtwork()}
                      onViewArtworkFullscreen={() => {
                        syncVisitorUiContext("opened the artwork in fullscreen", false);
                        setActiveArtifact("artwork-view");
                      }}
                      onEndGalleryTour={handleEndGalleryTour}
                      onSelectArtwork={(artwork) => {
                        visualAnalysisRequestRef.current += 1;
                        hasUserInteractedRef.current = true;
                        muteWarningSentRef.current = true;
                        greetingPhaseRef.current = "done";
                        const rawId = artwork.id || activeArtworkId || "masaccio-holy-trinity";
                        const resolvedId = resolveArtworkId(rawId);
                        if (!resolvedId || !TURNING_POINTS_ARTWORKS[resolvedId]) return;
                        const targetArtwork = TURNING_POINTS_ARTWORKS[resolvedId];
                        if (isTourActive) {
                          // Invalidate results from work started before this selection.
                          uiContextVersionRef.current += 1;
                          visualAnalysisRequestRef.current += 1;
                          pendingVisualAnalysisRef.current = null;
                          if (visualQuestionPendingRef.current) {
                            visualQuestionPendingRef.current = false;
                            setIsChatThinking(false);
                          }
                          if (visitorSpeechActiveRef.current) {
                            agentRef.current?.sendContext("The visitor selected " + targetArtwork.title + " (" + targetArtwork.year + ") by " + targetArtwork.artist + " while speaking. Keep this artwork as context for their current question.");
                          } else {
                            // Stop current local speech immediately for rapid gallery switching
                            bargeIn();
                          }
                        }

                        // Keep gallery selection and its card view in one state transition without plotting a route.
                        const artworkPatch: TourPageStatePatch = {
                          mapNavigation: (prev) => ({
                            ...prev,
                            destinationId: "",
                            currentNodeId: null,
                          }),
                          activeArtworkId: targetArtwork.id,
                          selectedArtwork: {
                            id: targetArtwork.id,
                            title: targetArtwork.title,
                            imageSrc: targetArtwork.imageSrc,
                            summary: targetArtwork.summary,
                            metadata: [
                              { label: "Artist", value: targetArtwork.artist },
                              { label: "Date", value: targetArtwork.year },
                            ],
                          },
                          activeArtifact: "info",
                          isExpanded: true,
                        };
                        if (targetArtwork.wingId && WING_ROUTE_MAP[targetArtwork.wingId]) {
                          artworkPatch.activeMapRoute = WING_ROUTE_MAP[targetArtwork.wingId];
                        }
                        patchTourPageState(artworkPatch);
                        playTactileTap();
                        // Use the state machine's ref for an accurate snapshot (not the closure-captured derived value)
                        const artworkState = galleryStatesRef.current[targetArtwork.id] ?? "unexplored";

                        if (pinTeaserTimerRef.current) {
                          clearTimeout(pinTeaserTimerRef.current);
                          pinTeaserTimerRef.current = null;
                        }

                        if (isTourActive && !visitorSpeechActiveRef.current) {
                          // Stop playing any active teaser audio immediately when switching pins
                          audioPlayerRef.current?.flush();

                          const promptText = artworkState === "completed"
                            ? `The visitor selected ${targetArtwork.title} (${targetArtwork.year}) by ${targetArtwork.artist} on the gallery map. In one brief, warm sentence, give a teaser about what makes this artwork memorable and invite a question. Do NOT suggest revisiting.`
                            : artworkState === "exploring"
                            ? `The visitor selected the gallery pin for the artwork Alba is currently introducing: ${targetArtwork.title} (${targetArtwork.year}) by ${targetArtwork.artist}. In one brief, warm sentence, give a fresh teaser about an interesting aspect of this artwork and invite a question. Do NOT suggest starting the tour again.`
                            : `The visitor selected ${targetArtwork.title} (${targetArtwork.year}) by ${targetArtwork.artist} on the floor map. In one friendly, brief sentence, give a warm teaser of why this masterpiece is exciting, and invite them to tap 'Explore this artwork' or ask questions to begin here. Speak with poise and no apologies.`;
                          const safePromptText = `${promptText} CRITICAL: Do NOT call any tools. Do not call show_info, show_map, or any other tool. Speak ONLY the single-sentence spoken teaser.`;

                          // Debounce teaser dispatch so rapid pin switching only plays Alba's teaser for the final selection
                          pinTeaserTimerRef.current = setTimeout(() => {
                            pinTeaserTimerRef.current = null;
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
                              safeReply(safePromptText);
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
                          }, 120);
                        }
                      }}
                      mapRouteId={activeMapRoute}
                      originMapRouteId={originMapRoute}
                      hotspotId={activeHotspotId ?? undefined}
                      isLoading={isArtifactLoading}
                      chatMessages={chatMessages}
                      isChatThinking={isChatThinking || visualHandoffStatus === "queued"}
                      onSelectArtifact={(type, params) => {
                        hasUserInteractedRef.current = true;
                        syncVisitorUiContext(
                          "opened the " + type + " view" + (params?.routeId ? " for route " + params.routeId : "") + (params?.hotspotId ? " at detail " + params.hotspotId : ""),
                          type !== "map" && type !== "chat" && type !== "info" || Boolean(params?.routeId || params?.hotspotId)
                        );
                        const artifactPatch: TourPageStatePatch = { activeArtifact: type };
                        if (params?.routeId) artifactPatch.activeMapRoute = params.routeId as string;
                        patchTourPageState(artifactPatch);
                        if (params?.hotspotId) {
                          const resolvedArtworkId = typeof params.artworkId === "string" ? resolveArtworkId(params.artworkId) : null;
                          setActiveHotspotSelection({
                            artworkId: resolvedArtworkId || selectedArtwork?.id || activeArtworkId,
                            hotspotId: String(params.hotspotId),
                          });
                        }
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
                  expressionId={isVoiceReady ? activeExpressionId : "neutral"}
                  size={480}
                  isListening={isListening}
                  isMuted={isVoiceReady && isMuted}
                  isConnecting={voiceConnection === "connecting" || voiceConnection === "failed"}
                  isSpeaking={isVoiceReady && agentStatus === "speaking"}
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

              {isTourActive && (connectionError || micError) && (
                <div className="fixed top-4 left-1/2 z-30 w-[min(32rem,calc(100%-2rem))] -translate-x-1/2">
                  <Alert>
                    <HugeIcon icon={InformationCircleIcon} size={16} />
                    <AlertTitle>{voiceConnection === "failed" ? "Voice session unavailable" : "Microphone unavailable"}</AlertTitle>
                    <AlertDescription>
                      {voiceConnection === "failed"
                        ? "Unable to connect to Alba. Please refresh the page to retry, or ask museum staff for assistance."
                        : "Microphone access is unavailable. Please enable microphone permissions in your browser settings to speak with Alba."}
                    </AlertDescription>
                    <AlertAction>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Dismiss alert"
                        onClick={() => {
                          setConnectionError(null);
                          setMicError(null);
                        }}
                      >
                        <HugeIcon icon={Cancel01Icon} size={14} />
                      </Button>
                    </AlertAction>
                  </Alert>
                </div>
              )}

              {/* Persistent Media Dock: Exact same position at bottom whether uncollapsed or collapsed */}
              <div className="guide-dock" role="group" aria-label="Tour controls">
                {callGroup}
              </div>

            </div>
          )}
        </main>
        {/* Footer with brand logo and clean fallback view switcher positioned outside the main stage view */}
        <Footer />
      </div>

      {isTourActive && activeArtifact === "artwork-view" && (
        <ImmersiveArtworkView
          artwork={selectedArtwork}
          onAskAboutSelection={handleAskAboutSelection}
          avatar={<ArticulateAvatar expressionId={isVoiceReady ? activeExpressionId : "neutral"} size={112} isListening={isListening} isMuted={isVoiceReady && isMuted} isConnecting={voiceConnection === "connecting" || voiceConnection === "failed"} isSpeaking={isVoiceReady && agentStatus === "speaking"} audioLevel={audioLevel} shape={0.11} />}
          controls={callGroup}
          onBackToDetails={() => {
            visualAnalysisRequestRef.current += 1;
            syncVisitorUiContext("returned from the fullscreen artwork to its detail card", false);
            setActiveHotspotSelection(null);
            setActiveArtifact("info");
          }}
          activeHotspotId={activeHotspotId}
          onSelectHotspot={(hotspotId) => {
            syncVisitorUiContext(hotspotId ? "opened artwork detail " + hotspotId : "closed artwork detail " + activeHotspotId, true);
            setActiveHotspotSelection(
              hotspotId && selectedArtwork?.id ? { artworkId: selectedArtwork.id, hotspotId } : null
            );
          }}
          onUiContextChange={syncVisitorUiContext}
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
      {/* Confirmation Dialog: End Tour / Session Expiry */}
      <Dialog
        open={isEndDialogOpen || sessionExpiryDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (sessionExpiryDialogOpen) {
              setSessionExpiryDialogOpen(false);
              void handleConfirmEndTour();
            } else {
              setIsEndDialogOpen(false);
            }
          } else {
            setIsEndDialogOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {sessionExpiryDialogOpen ? "Thank you for exploring with Alba!" : "End tour?"}
            </DialogTitle>
            <DialogDescription>
              {sessionExpiryDialogOpen
                ? "Your 3-minute preview session has concluded. Thank you for taking the time to tour the exhibition with us! We hope you enjoyed the experience."
                : "Are you sure you want to end your tour? This will disconnect your conversation session with Alba."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {sessionExpiryDialogOpen ? (
              <Button
                type="button"
                onClick={() => {
                  setSessionExpiryDialogOpen(false);
                  void handleConfirmEndTour();
                }}
              >
                Back to Home
              </Button>
            ) : <>
              <Button type="button" variant="outline" onClick={() => { playTactileTap(); setIsEndDialogOpen(false); }} className="rounded-lg h-9 px-4 text-sm font-medium bg-card hover:bg-subtle border border-border text-foreground cursor-pointer shadow-none">Cancel</Button>
              <Button type="button" variant="default" onClick={handleConfirmEndTour} className="rounded-lg h-9 px-4 text-sm font-medium cursor-pointer">End tour</Button>
            </>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}