"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SparklesIcon,
  ArrowDown01Icon,
  Tick02Icon,
  Loading03Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

/* ─────────────────────────────────────────────────────────
 * THINKING STATE — Expandable voice agent trace
 *
 * Provides real-time visibility into the docent's reasoning
 * and historical archive queries with responsive typography
 * and Hugeicons.
 * ───────────────────────────────────────────────────────── */

const STAGES = [600, 800, 1400, 2000, 1200];

function useSequence(steps: number[]) {
  const [stage, setStage] = React.useState(0);
  React.useEffect(() => {
    if (stage >= steps.length - 1) return;
    const t = setTimeout(() => setStage((s) => s + 1), steps[stage]);
    return () => clearTimeout(t);
  }, [stage, steps]);
  return stage;
}

export type ThinkingRow = {
  primary: string;
  secondary?: string;
  mono?: boolean;
  href?: string;
};

const VARIANTS: Record<
  string,
  { active: string; done: string; rows: ThinkingRow[]; query?: string }
> = {
  Steps: {
    active: "Consulting Museum Archives…",
    done: "Verified in 1889 Archives",
    rows: [
      { primary: "Accessing Saint-Rémy asylum records (1889)" },
      { primary: "Cross-referencing Letter 782 to Theo" },
      { primary: "Analyzing cypress motif & swirling brushwork" },
      { primary: "Synchronizing visual stage to canvas view" },
    ],
  },
  Reasoning: {
    active: "Synthesizing Docent Insights…",
    done: "Context synthesized",
    rows: [
      { primary: "Visitor inquired about foreground landscape elements." },
      { primary: "Identified cypress flame motif connecting earth with the cosmos." },
    ],
  },
};

interface ThinkingStateProps {
  variant?: "Steps" | "Reasoning";
  onSettled?: () => void;
  rows?: ThinkingRow[];
  active?: string;
  done?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function ThinkingState({
  variant = "Steps",
  onSettled,
  rows,
  active,
  done,
  icon,
  className = "",
}: ThinkingStateProps) {
  const stage = useSequence(STAGES);
  const [manualExpanded, setManualExpanded] = React.useState<boolean | null>(null);
  const base = VARIANTS[variant] ?? VARIANTS.Steps;
  const v = {
    ...base,
    rows: rows ?? base.rows,
    active: active ?? base.active,
    done: done ?? base.done,
  };
  const autoExpanded = stage >= 1 && stage < 4;
  const expanded = manualExpanded ?? autoExpanded;
  const working = stage < 3;
  const visible = stage < 2 ? 0 : stage === 2 ? Math.min(2, v.rows.length) : v.rows.length;
  const traceRef = React.useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    if (traceRef.current) setLineHeight(traceRef.current.offsetHeight);
  }, [visible, expanded, variant, stage]);

  const settledRef = React.useRef(false);
  React.useEffect(() => {
    if (working || settledRef.current) return;
    settledRef.current = true;
    onSettled?.();
  }, [working, onSettled]);

  return (
    <div
      key={variant}
      className={`flex w-full max-w-full flex-col transition-all duration-300 ${className}`}
    >
      {/* Header Bar */}
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setManualExpanded((current) => !(current ?? autoExpanded))}
        className="-mx-1 flex w-fit items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-muted/70 text-left"
      >
        {icon ? (
          <span className="flex shrink-0 text-muted-foreground">{icon}</span>
        ) : (
          <span className={`flex shrink-0 transition-colors ${working ? "text-accent-foreground" : "text-muted-foreground"}`}>
            <HugeiconsIcon icon={SparklesIcon} size={15} />
          </span>
        )}

        <span role="status" className="contents">
          {working ? (
            <span
              className="bg-clip-text text-xs sm:text-[13px] font-medium whitespace-nowrap text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--color-ink-3) 35%, var(--color-ink) 50%, var(--color-ink-3) 65%)",
                backgroundSize: "200% 100%",
                animation: "shimmer-text 1.4s linear infinite",
              }}
            >
              {v.active}
            </span>
          ) : (
            <span className="text-xs sm:text-[13px] font-medium whitespace-nowrap text-muted-foreground animate-in fade-in duration-300">
              {v.done}
            </span>
          )}
        </span>

        <span
          className="text-muted-foreground transition-transform duration-300 inline-flex items-center"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
        >
          <HugeiconsIcon icon={ArrowDown01Icon} size={13} />
        </span>
      </button>

      {/* Expandable Trace */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-300"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
          opacity: expanded ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="relative mt-1 ml-1.5 pl-3.5 border-l border-border/80">
            <div ref={traceRef} className="flex flex-col gap-1 py-1">
              {v.rows.slice(0, visible).map((row, i) => {
                const isStepDone = i < visible - 1 || !working;
                return (
                  <div
                    key={row.primary}
                    className="flex min-h-6 w-full items-center gap-2 rounded-md px-1 py-0.5 text-left text-xs"
                  >
                    {isStepDone ? (
                      <span className="text-muted-foreground shrink-0 inline-flex items-center">
                        <HugeiconsIcon icon={Tick02Icon} size={13} />
                      </span>
                    ) : (
                      <span className="text-foreground shrink-0 inline-flex items-center animate-spin">
                        <HugeiconsIcon icon={Loading03Icon} size={13} />
                      </span>
                    )}

                    <span
                      className={`min-w-0 flex-1 truncate text-xs ${
                        variant === "Reasoning"
                          ? "whitespace-normal leading-relaxed text-muted-foreground"
                          : "font-medium text-foreground"
                      }`}
                    >
                      {row.primary}
                    </span>

                    {row.secondary && (
                      <span
                        className={`shrink-0 text-[10px] text-muted-foreground ${
                          row.mono ? "font-mono" : ""
                        }`}
                      >
                        {row.secondary}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
