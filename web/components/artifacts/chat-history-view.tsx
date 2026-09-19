"use client";

import * as React from "react";
import { InlineCitations, type CiteRef } from "../beautiful-ui/InlineCitations";
import ThinkingState from "../beautiful-ui/ThinkingState";
import ToolChips, { type ToolStep } from "../beautiful-ui/ToolChips";

export type { CiteRef };

// ─── Types ────────────────────────────────────────────────────────────────────

export type ArtifactTarget = "info" | "map" | "comparison" | "timeline" | "hotspots";

export type ArtifactTokenPart = {
  text: string;
  artifactTarget?: {
    type: ArtifactTarget;
    label: string;
    params?: Record<string, any>;
  };
};

export type ChatMessage =
  | { id: string; role: "visitor"; text: string; isPartial?: boolean; timestamp: Date }
  | {
      id: string;
      role: "agent";
      text: string;
      isStreaming?: boolean;
      timestamp: Date;
      speakerName?: string;
      topic?: string;
      label?: string;
      sub?: string;
      time?: string;
      resolving?: boolean;
      citations?: CiteRef[];
      /** Optional token array for streaming artifact chips inline */
      artifactTokens?: ArtifactTokenPart[];
    }
  | {
      id: string;
      role: "tool";
      toolName: string;
      label: string;
      timestamp: Date;
      artifactType?: ArtifactTarget;
      params?: Record<string, any>;
      detail?: string;
    };

interface ChatHistoryViewProps {
  messages: ChatMessage[];
  /** When true renders the resolving state trace from the docent */
  isThinking?: boolean;
  /** Callback to switch or open the artifact in the visual stage */
  onSelectArtifact?: (type: string, params?: Record<string, any>) => void;
}

// ─── Default Exhibition Messages ──────────────────────────────────────────────

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: "m-init-1",
    role: "visitor",
    text: "Can you tell me about this painting?",
    timestamp: new Date(),
  },
  {
    id: "m-init-2",
    role: "agent",
    text: "Of course! You're looking at The Starry Night[1] — painted by Vincent van Gogh in June 1889 from his room at the Saint-Paul-de-Mausole asylum in Saint-Rémy-de-Provence[2].",
    speakerName: "Mr. Triangle",
    timestamp: new Date(),
    citations: [
      {
        n: 1,
        label: "Van Gogh Museum Letters: Letter 782 to Theo",
        host: "vangoghletters.org",
        url: "https://vangoghletters.org/vg/letters/let782/letter.html",
      },
      {
        n: 2,
        label: "MoMA Collection: The Starry Night",
        host: "moma.org",
        url: "https://www.moma.org/collection/works/79802",
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Inline artifact chip (BUI streaming text chip style, used in agent messages)
function ArtifactChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium align-baseline cursor-pointer transition-colors duration-100"
      style={{
        background: "var(--field)",
        color: "var(--ink-2)",
        border: "1px solid var(--line)",
      }}
    >
      {/* Sparkle */}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"
        style={{ color: "var(--ink-2)", flexShrink: 0 }}>
        <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
      </svg>
      <span>{label}</span>
      {/* Arrow */}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        style={{ color: "var(--ink-3)", flexShrink: 0 }}>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}

// ─── Agent Message Section (BUI streaming text pattern) ───────────────────────

function MrTGlyph() {
  return (
    <svg width="9" height="8" viewBox="0 0 10 9" fill="currentColor" aria-hidden="true">
      <path d="M5 1L9 8H1L5 1Z" />
    </svg>
  );
}

function AgentSection({
  speakerName = "Mr. Triangle",
  topic,
  time,
  body,
  resolving,
  citations,
  artifactTokens,
  onSelectArtifact,
}: {
  speakerName?: string;
  topic?: string;
  time: string;
  body: string;
  resolving?: boolean;
  citations?: CiteRef[];
  artifactTokens?: ArtifactTokenPart[];
  onSelectArtifact?: (type: string, params?: Record<string, any>) => void;
}) {
  const hasCitations = (citations && citations.length > 0) || /\[\d+\]/.test(body);

  return (
    <div
      className="flex w-full flex-col gap-1.5"
      style={{
        opacity: resolving ? 0.55 : 1,
        filter: resolving ? "blur(0.5px)" : "blur(0)",
        transform: resolving ? "scale(0.985)" : "scale(1)",
        transformOrigin: "top left",
        transition:
          "opacity 400ms, filter 400ms, transform 400ms cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      {/* Agent message header: docent identity and time/topic inline */}
      <div className="flex items-center gap-1.5 text-[12px] leading-none px-1 pb-1">
        <span className="font-semibold" style={{ color: "var(--ink)" }}>
          {speakerName || "Mr. Triangle"}
        </span>
        <span className="text-[10px]" style={{ color: "var(--ink-3)" }}>
          {time}
        </span>
        {topic && (
          <span
            className="ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              background: "var(--field)",
              color: "var(--ink-2)",
              border: "1px solid var(--line)",
            }}
          >
            {topic}
          </span>
        )}
      </div>

      {/* Body: inline citations or artifact tokens or plain prose */}
      {artifactTokens && artifactTokens.length > 0 ? (
        <p className="text-[13px] leading-relaxed m-0" style={{ color: "var(--ink)" }}>
          {artifactTokens.map((t, i) =>
            t.artifactTarget ? (
              <ArtifactChip
                key={i}
                label={t.artifactTarget.label}
                onClick={() =>
                  onSelectArtifact?.(t.artifactTarget!.type, t.artifactTarget!.params)
                }
              />
            ) : (
              <span key={i}>{t.text} </span>
            )
          )}
        </p>
      ) : hasCitations ? (
        <InlineCitations text={body} refs={citations} />
      ) : (
        <p className="text-[13px] leading-relaxed m-0" style={{ color: "var(--ink)" }}>
          {body}
        </p>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatHistoryView({
  messages,
  isThinking = false,
  onSelectArtifact,
}: ChatHistoryViewProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const activeMessages = messages.length > 0 ? messages : DEFAULT_MESSAGES;

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  return (
    /* BUI Chat container: bg-canvas, rounded-[14px], shadow-card */
    <div
      className="flex h-full w-full flex-col self-start overflow-hidden rounded-[14px] select-text"
      style={{ background: "var(--surface)", boxShadow: "var(--shadow-card)" }}
    >
      {/* Scrollable conversation thread */}
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pt-3 pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {activeMessages.map((msg) => {
          // ── Visitor bubble ──────────────────────────────────────────────
          if (msg.role === "visitor") {
            const timeString = msg.timestamp
              ? msg.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
              : "Now";
            return (
              <div key={msg.id} className="flex flex-col items-end gap-1 pl-12">
                <div className="flex items-center gap-1.5 text-[12px] leading-none px-1 pb-0.5">
                  <span className="text-[10px]" style={{ color: "var(--ink-3)" }}>
                    {timeString}
                  </span>
                  <span className="font-semibold" style={{ color: "var(--ink)" }}>
                    You
                  </span>
                </div>
                <div
                  className="rounded-xl px-3 py-1.5 text-[13px] leading-[1.4]"
                  style={{
                    background: "var(--field)",
                    color: "var(--ink)",
                    animation: "fade-up 250ms cubic-bezier(0.23,1,0.32,1) both",
                  }}
                >
                  {msg.text}
                  {msg.isPartial && (
                    <span
                      className="inline-flex gap-0.5 ml-1.5 translate-y-[1px]"
                      aria-hidden="true"
                    >
                      <span className="size-1 rounded-full bg-ink-3 animate-bounce [animation-delay:-0.3s]" />
                      <span className="size-1 rounded-full bg-ink-3 animate-bounce [animation-delay:-0.15s]" />
                      <span className="size-1 rounded-full bg-ink-3 animate-bounce" />
                    </span>
                  )}
                </div>
              </div>
            );
          }

          // ── Agent message ───────────────────────────────────────────────
          if (msg.role === "agent") {
            const time = msg.time && !msg.time.includes("1889")
              ? msg.time
              : msg.timestamp
              ? formatTime(msg.timestamp)
              : formatTime(new Date());
            const topic = msg.topic ?? (msg.label && msg.label !== "The Starry Night" ? msg.label : undefined);
            const speaker = msg.speakerName ?? "Mr. Triangle";

            return (
              <AgentSection
                key={msg.id}
                speakerName={speaker}
                topic={topic}
                time={time}
                body={msg.text}
                resolving={msg.resolving}
                citations={msg.citations}
                artifactTokens={(msg as any).artifactTokens}
                onSelectArtifact={onSelectArtifact}
              />
            );
          }

          // ── Tool call chip ──────────────────────────────────────────────
          if (msg.role === "tool") {
            const step: ToolStep = {
              icon: msg.toolName.includes("map")
                ? "map"
                : msg.toolName.includes("hotspot")
                ? "zoom"
                : msg.toolName.includes("timeline")
                ? "archive"
                : "compare",
              label: msg.label,
              chip: msg.toolName,
              artifactType: msg.artifactType,
              params: msg.params,
              detail:
                msg.detail ??
                (msg.artifactType === "hotspots"
                  ? "Detail inspection focused on canvas"
                  : msg.artifactType === "map"
                  ? "Wayfinding route plotted to Room 4"
                  : "Visual stage updated"),
            };

            return (
              <div key={msg.id} className="w-full py-0.5">
                <ToolChips
                  labels={{ header: `${msg.toolName}` }}
                  steps={[step]}
                  onSelectArtifact={onSelectArtifact}
                />
              </div>
            );
          }

          return null;
        })}

        {/* BUI Thinking State — shown while agent is resolving */}
        {isThinking && (
          <div className="w-full py-1">
            <ThinkingState
              variant="Steps"
              active="Consulting Museum Archives…"
              done="Verified in 1889 Archives"
            />
          </div>
        )}
      </div>

      {/* BUI-style bottom scroll fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 rounded-b-[14px]"
        style={{
          background:
            "linear-gradient(to top, var(--surface) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
