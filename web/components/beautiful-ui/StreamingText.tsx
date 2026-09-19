"use client";

import * as React from "react";

/* ─────────────────────────────────────────────────────────
 * STREAMING TEXT — BUI #03 real-time transcript
 *
 * Streams words token by token with a blinking cursor,
 * inline clickable artifact triggers styled as BUI chips,
 * and a post-completion action row (copy, replay, like).
 * Direct implementation of the BeautifulUI Streaming Text
 * primitive adapted to Articulate tokens.
 * ───────────────────────────────────────────────────────── */

const WORD_MS = 50;

export type StreamingToken = {
  text: string;
  artifactTarget?: {
    type: "info" | "map" | "comparison" | "timeline" | "hotspots";
    label: string;
    params?: Record<string, any>;
  };
};

// BUI-exact icon components using inline SVG (icons from BUI source)
function CopyIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TickIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function ReplayIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
    </svg>
  );
}

function ThumbUpIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88z" />
    </svg>
  );
}

function ArrowRightIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function SparkIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
    </svg>
  );
}

// BUI-exact icon action button
function ActionBtn({
  onClick,
  label,
  children,
  active,
}: {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-6 items-center justify-center rounded-[6px] transition-colors duration-100 hover:bg-hover-2"
      style={{ color: active ? "var(--ink)" : "var(--ink-3)" }}
    >
      {children}
    </button>
  );
}

interface StreamingTextProps {
  content?: StreamingToken[];
  loop?: boolean;
  onDone?: () => void;
  onReplayAudio?: () => void;
  onSelectArtifact?: (type: string, params?: Record<string, any>) => void;
  className?: string;
}

export default function StreamingText({
  content = [],
  loop = false,
  onDone,
  onReplayAudio,
  onSelectArtifact,
  className = "",
}: StreamingTextProps) {
  const [count, setCount] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const done = count >= content.length;

  React.useEffect(() => {
    if (content.length === 0) return;
    if (done && !loop) {
      onDone?.();
      return;
    }
    const t = setTimeout(
      () => setCount((c) => (c >= content.length ? (loop ? 0 : c) : c + 1)),
      WORD_MS
    );
    return () => clearTimeout(t);
  }, [count, done, loop, content.length, onDone]);

  const fullText = React.useMemo(
    () => content.map((c) => c.text).filter(Boolean).join(" "),
    [content]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div className={`w-full max-w-full flex flex-col gap-2 ${className}`}>
      {/* BUI-exact streaming transcript with blinking caret */}
      <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink)" }}>
        {content.slice(0, count).map((token, i) =>
          token.artifactTarget ? (
            // BUI-style inline artifact chip
            <button
              key={i}
              type="button"
              onClick={() =>
                onSelectArtifact?.(
                  token.artifactTarget!.type,
                  token.artifactTarget!.params
                )
              }
              className="mx-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium align-baseline cursor-pointer transition-colors duration-100"
              style={{
                background: "var(--field)",
                color: "var(--ink-2)",
                border: "1px solid var(--line)",
              }}
            >
              <span style={{ color: "var(--ink-2)" }}>
                <SparkIcon size={10} />
              </span>
              <span>{token.artifactTarget.label}</span>
              <span style={{ color: "var(--ink-3)" }}>
                <ArrowRightIcon size={10} />
              </span>
            </button>
          ) : (
            <span key={i} className="inline">
              {token.text}{" "}
            </span>
          )
        )}
        {/* BUI-exact blinking caret */}
        {!done && (
          <span
            className="ml-0.5 inline-block h-3 w-0.5 translate-y-0.5 rounded-full"
            style={{
              background: "var(--ink)",
              animation: "fade-in 150ms ease-out both",
            }}
            aria-hidden="true"
          />
        )}
      </p>

      {/* BUI-exact post-completion action row */}
      <div
        className="flex items-center gap-0.5 transition-opacity duration-400"
        style={{ opacity: done ? 1 : 0, pointerEvents: done ? "auto" : "none" }}
      >
        <ActionBtn onClick={handleCopy} label="Copy transcript">
          {copied ? (
            <span style={{ color: "var(--green)" }}>
              <TickIcon size={15} />
            </span>
          ) : (
            <CopyIcon size={15} />
          )}
        </ActionBtn>

        <ActionBtn onClick={onReplayAudio} label="Replay audio">
          <ReplayIcon size={15} />
        </ActionBtn>

        <ActionBtn label="Helpful">
          <ThumbUpIcon size={15} />
        </ActionBtn>
      </div>
    </div>
  );
}
