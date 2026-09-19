"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  VolumeHighIcon,
  Copy01Icon,
  Tick02Icon,
  SparklesIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

/* ─────────────────────────────────────────────────────────
 * STREAMING TEXT — Real-time audio docent transcript
 *
 * Streams spoken words dynamically with inline clickable
 * artifact triggers that open the corresponding view on
 * the visual stage.
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

interface StreamingTextProps {
  content?: StreamingToken[];
  loop?: boolean;
  fill?: boolean;
  onDone?: () => void;
  onReplayAudio?: () => void;
  onSelectArtifact?: (type: string, params?: Record<string, any>) => void;
  className?: string;
}

export default function StreamingText({
  content = [],
  loop = false,
  fill = true,
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

  const fullText = React.useMemo(() => {
    return content.map((c) => c.text).filter(Boolean).join(" ");
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div className={`w-full max-w-full flex flex-col gap-2 ${className}`}>
      {/* Transcript Text Stream */}
      <p className="text-xs sm:text-[13px] leading-relaxed text-foreground">
        {content.slice(0, count).map((token, i) =>
          token.artifactTarget ? (
            <button
              key={i}
              type="button"
              onClick={() =>
                onSelectArtifact?.(
                  token.artifactTarget!.type,
                  token.artifactTarget!.params
                )
              }
              className="mx-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-muted hover:bg-muted/80 border border-border text-[11px] font-medium text-foreground hover:text-primary transition-colors align-baseline cursor-pointer shadow-2xs"
            >
              <HugeiconsIcon icon={SparklesIcon} size={11} className="text-accent-foreground" />
              <span>{token.artifactTarget.label}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={10} className="text-muted-foreground" />
            </button>
          ) : (
            <span key={i} className="inline">
              {token.text}{" "}
            </span>
          )
        )}
        {!done && (
          <span
            className="inline-block h-3.5 w-0.5 translate-y-[2px] bg-foreground animate-pulse ml-0.5"
            aria-hidden="true"
          />
        )}
      </p>

      {/* Voice Action Controls Row (shown once transcript finishes) */}
      <div
        className="flex items-center gap-1 pt-1 transition-opacity duration-300"
        style={{ opacity: done ? 1 : 0, pointerEvents: done ? "auto" : "none" }}
      >
        {/* Replay voice audio */}
        <button
          type="button"
          onClick={onReplayAudio}
          aria-label="Replay audio"
          title="Replay audio transcription"
          className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <HugeiconsIcon icon={VolumeHighIcon} size={14} />
        </button>

        {/* Copy transcript */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy transcript"
          title="Copy transcript"
          className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          {copied ? (
            <span className="text-emerald-600 dark:text-emerald-400">
              <HugeiconsIcon icon={Tick02Icon} size={14} />
            </span>
          ) : (
            <HugeiconsIcon icon={Copy01Icon} size={14} />
          )}
        </button>
      </div>
    </div>
  );
}
