"use client";

import * as React from "react";
import {
  ChatMessageList,
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
} from "@/components/ui/chat";
import ThinkingState from "@/components/beautiful-ui/ThinkingState";
import StreamingText, { type StreamingToken } from "@/components/beautiful-ui/StreamingText";
import ToolChips, { type ToolStep } from "@/components/beautiful-ui/ToolChips";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mic01Icon } from "@hugeicons/core-free-icons";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ArtifactTarget = "info" | "map" | "comparison" | "timeline" | "hotspots";

export type ChatMessage =
  | { id: string; role: "visitor"; text: string; isPartial?: boolean; timestamp: Date }
  | {
      id: string;
      role: "agent";
      text: string;
      isStreaming?: boolean;
      timestamp: Date;
      artifactTokens?: StreamingToken[];
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
  /** When true renders the ThinkingState trace from the voice docent */
  isThinking?: boolean;
  /** Callback to switch or open the artifact in the visual stage */
  onSelectArtifact?: (type: string, params?: Record<string, any>) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Tiny triangle glyph mirroring Mr. Triangle's identity
function MrTGlyph() {
  return (
    <svg width="11" height="10" viewBox="0 0 10 9" fill="none" aria-hidden="true">
      <path d="M5 1L9 8H1L5 1Z" fill="white" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatHistoryView({
  messages,
  isThinking = false,
  onSelectArtifact,
}: ChatHistoryViewProps) {
  const bottomAnchorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  if (messages.length === 0 && !isThinking) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-4 py-8">
        <span className="flex size-10 items-center justify-center rounded-full bg-foreground text-background shadow-xs">
          <MrTGlyph />
        </span>
        <div className="max-w-xs space-y-1">
          <h4 className="text-xs font-semibold text-foreground">Live Tour Transcription</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Spoken inquiries and Mr. Triangle&apos;s audio insights will transcribe here in real time.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/70 border border-border px-3 py-1 text-[11px] text-muted-foreground">
          <HugeiconsIcon icon={Mic01Icon} size={12} className="text-accent-foreground" />
          <span>Speak naturally to begin</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <ChatMessageList smoothScroll className="flex-1 px-3 sm:px-4 py-3 gap-3.5">
        {messages.map((msg) => {
          if (msg.role === "visitor") {
            return (
              <ChatBubble key={msg.id} variant="sent">
                <div className="flex flex-col items-end max-w-[85%] sm:max-w-[78%]">
                  <ChatBubbleMessage
                    variant="sent"
                    className={
                      msg.isPartial
                        ? "bg-muted text-muted-foreground italic border border-border font-normal"
                        : "bg-foreground text-background font-normal"
                    }
                  >
                    {msg.text}
                    {msg.isPartial && (
                      <span className="inline-flex gap-0.5 ml-1.5 translate-y-[1px]" aria-hidden="true">
                        <span className="size-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
                        <span className="size-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
                        <span className="size-1 rounded-full bg-muted-foreground animate-bounce" />
                      </span>
                    )}
                  </ChatBubbleMessage>
                  {!msg.isPartial && (
                    <ChatBubbleTimestamp>{formatTime(msg.timestamp)}</ChatBubbleTimestamp>
                  )}
                </div>
              </ChatBubble>
            );
          }

          if (msg.role === "agent") {
            // If explicit artifact tokens were provided, use them; otherwise auto-detect key museum keywords
            let tokens: StreamingToken[];
            if (msg.artifactTokens && msg.artifactTokens.length > 0) {
              tokens = msg.artifactTokens;
            } else {
              const words = msg.text.split(" ").filter(Boolean);
              tokens = words.map((w) => {
                const clean = w.toLowerCase().replace(/[^a-z0-9]/g, "");
                if (clean === "cypress" || clean === "cypresses") {
                  return {
                    text: w,
                    artifactTarget: {
                      type: "hotspots" as const,
                      label: "Cypress Hotspot",
                      params: { hotspotId: "cypress" },
                    },
                  };
                }
                if (clean === "1889") {
                  return {
                    text: w,
                    artifactTarget: {
                      type: "timeline" as const,
                      label: "1889 Timeline",
                    },
                  };
                }
                return { text: w };
              });
            }

            return (
              <ChatBubble key={msg.id} variant="received">
                <ChatBubbleAvatar className="bg-foreground text-background">
                  <MrTGlyph />
                </ChatBubbleAvatar>
                <div className="flex flex-col items-start flex-1 min-w-0 max-w-[92%] sm:max-w-[85%]">
                  <ChatBubbleMessage variant="received" className="w-full">
                    <StreamingText
                      content={tokens.length > 0 ? tokens : [{ text: msg.text }]}
                      loop={false}
                      fill={true}
                      onSelectArtifact={onSelectArtifact}
                    />
                  </ChatBubbleMessage>
                  <ChatBubbleTimestamp>{formatTime(msg.timestamp)}</ChatBubbleTimestamp>
                </div>
              </ChatBubble>
            );
          }

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
              detail: msg.detail ?? (
                msg.artifactType === "hotspots"
                  ? "Detail inspection focused on canvas"
                  : msg.artifactType === "map"
                  ? "Wayfinding route plotted to Room 4"
                  : "Visual stage updated"
              ),
            };

            return (
              <div key={msg.id} className="w-full flex justify-center py-0.5">
                <ToolChips
                  labels={{ header: `Agent Called Tool: ${msg.toolName}` }}
                  steps={[step]}
                  onSelectArtifact={onSelectArtifact}
                />
              </div>
            );
          }

          return null;
        })}

        {isThinking && (
          <ChatBubble variant="received">
            <ChatBubbleAvatar className="bg-foreground text-background">
              <MrTGlyph />
            </ChatBubbleAvatar>
            <div className="flex flex-col items-start flex-1 min-w-0 max-w-[92%] sm:max-w-[85%]">
              <ChatBubbleMessage variant="received" className="w-full py-2">
                <ThinkingState
                  variant="Steps"
                  active="Consulting Museum Archives…"
                  done="Verified in 1889 Archives"
                />
              </ChatBubbleMessage>
            </div>
          </ChatBubble>
        )}

        <div ref={bottomAnchorRef} />
      </ChatMessageList>
    </div>
  );
}
