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
    }
  | {
      id: string;
      role: "reasoning";
      variant?: string;
      active?: string;
      done?: string;
      rows?: { primary: string; secondary?: string; mono?: boolean }[];
      timestamp: Date;
    };

interface ChatHistoryViewProps {
  messages: ChatMessage[];
  /** When true renders the resolving state trace from the docent */
  isThinking?: boolean;
  /** Callback to switch or open the artifact in the visual stage */
  onSelectArtifact?: (type: string, params?: Record<string, any>) => void;
}

// ─── Default Exhibition Messages ──────────────────────────────────────────────

// Removed mock data

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Inline artifact chip (BUI streaming text chip style, used in agent messages)
import { getArtifactConfig } from "@/lib/artifact-config";

function ArtifactChip({
  label,
  type,
  onClick,
}: {
  label: string;
  type: string;
  onClick: () => void;
}) {
  const config = getArtifactConfig(type);

  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-0.5 inline-flex items-center gap-1.5 rounded-md pr-2 pl-0.5 py-0.5 text-[11.5px] font-medium align-baseline cursor-pointer transition-colors duration-100 hover:bg-hover-2"
      style={{
        background: "var(--surface)",
        color: "var(--ink)",
        border: "1px solid var(--line-strong)",
      }}
    >
      {/* Nested Icon Box */}
      <span
        className="flex shrink-0 items-center justify-center rounded-sm"
        style={{ width: 18, height: 18, background: config.bg, border: `1px solid ${config.border}` }}
      >
        {React.cloneElement(config.icon as React.ReactElement<React.HTMLAttributes<HTMLElement>>, { style: { color: config.color } })}
      </span>
      <span>{label}</span>
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
      {/* Agent message header: docent identity and time inline */}
      <div className="flex items-center gap-1.5 text-[12px] leading-none px-1 pb-1">
        <span className="font-semibold" style={{ color: "var(--ink)" }}>
          {speakerName || "Mr. Triangle"}
        </span>
        <span className="text-[10px]" style={{ color: "var(--ink-3)" }}>
          {time}
        </span>
      </div>

      {/* Body: inline citations or artifact tokens or plain prose */}
      {artifactTokens && artifactTokens.length > 0 ? (
        <p className="text-[13px] leading-relaxed m-0" style={{ color: "var(--ink)" }}>
          {artifactTokens.map((t, i) =>
            t.artifactTarget ? (
              <ArtifactChip
                key={i}
                label={t.artifactTarget.label}
                type={t.artifactTarget.type}
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
  const activeMessages = messages;

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const groupedMessages = React.useMemo(() => {
    const groups: (ChatMessage | { type: "tool_group"; id: string; tools: any[] })[] = [];
    for (let i = 0; i < activeMessages.length; i++) {
      const msg = activeMessages[i];
      if (msg.role === "tool") {
        const tools: Extract<ChatMessage, { role: "tool" }>[] = [msg];
        while (i + 1 < activeMessages.length && activeMessages[i + 1].role === "tool") {
          tools.push(activeMessages[i + 1] as Extract<ChatMessage, { role: "tool" }>);
          i++;
        }
        groups.push({ type: "tool_group", id: tools[0].id, tools });
      } else {
        groups.push(msg);
      }
    }
    return groups;
  }, [activeMessages]);

  if (activeMessages.length === 0 && !isThinking) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 pb-20">
        <p className="text-[14px] font-medium" style={{ color: "var(--ink-3)" }}>
          No transcripts
        </p>
      </div>
    );
  }

  return (
    /* BUI Chat container */
    <div
      className="relative flex h-full w-full lg:max-w-3xl xl:max-w-4xl mx-auto flex-col overflow-hidden select-text"
    >
      {/* Scrollable conversation thread */}
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pt-3 pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {groupedMessages.map((item) => {
          // ── Tool call group ──────────────────────────────────────────────
          if ("type" in item && item.type === "tool_group") {
            const steps: ToolStep[] = item.tools.map((m) => ({
              icon: (m.toolName.includes("map")
                ? "map"
                : m.toolName.includes("hotspot")
                ? "zoom"
                : m.toolName.includes("timeline")
                ? "archive"
                : "compare") as "map" | "zoom" | "archive" | "compare",
              label: m.label,
              chip: m.toolName,
              artifactType: m.artifactType,
              params: m.params,
              detail: m.detail ?? (m.artifactType === "hotspots"
                  ? "Detail inspection focused on canvas"
                  : m.artifactType === "map"
                  ? "Wayfinding route plotted to Room 4"
                  : "Visual stage updated"),
            }));
            const isResolving = item.tools.some((m) => m.resolving);
            return (
              <div key={item.id} className="w-full py-0.5">
                <ToolChips
                  labels={{ header: `${item.tools.length} Artifact Action${item.tools.length === 1 ? '' : 's'}` }}
                  steps={steps}
                  isResolving={isResolving}
                  onSelectArtifact={onSelectArtifact}
                />
              </div>
            );
          }

          const msg = item as ChatMessage;

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
                  {msg.isPartial ? (
                    <span
                      className="inline-flex gap-0.5 translate-y-[1px] px-1 py-1"
                      aria-hidden="true"
                    >
                      <span className="size-1 rounded-full bg-ink-3 animate-bounce [animation-delay:-0.3s]" />
                      <span className="size-1 rounded-full bg-ink-3 animate-bounce [animation-delay:-0.15s]" />
                      <span className="size-1 rounded-full bg-ink-3 animate-bounce" />
                    </span>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            );
          }

          // ── Reasoning trace (ThinkingState) ─────────────────────────────
          if (msg.role === "reasoning") {
            return (
              <div key={msg.id} className="w-full py-1">
                <ThinkingState
                  variant={msg.variant as any}
                  active={msg.active}
                  done={msg.done}
                  rows={msg.rows}
                  // We can use resolving to simulate whether it's still working
                />
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

      {/* Bottom scroll fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-8"
        style={{
          background:
            "linear-gradient(to top, var(--card) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
