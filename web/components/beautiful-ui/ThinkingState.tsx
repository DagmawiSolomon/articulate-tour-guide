"use client";

import * as React from "react";

/* ─────────────────────────────────────────────────────────
 * THINKING STATE — BUI #02 expandable voice agent trace
 *
 * Exact implementation of the BeautifulUI Thinking primitive:
 * • Sparkle icon with shimmer label while working
 * • Animated vertical timeline connector line
 * • Step rows with spinning / tick icons
 * • Smooth grid-template-rows expand/collapse
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
  { active: string; done: string; rows: ThinkingRow[] }
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

// Tick check icon
function TickIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

// Spinner icon
function SpinnerIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
      style={{ animation: "spin 1.1s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
    </svg>
  );
}

// Sparkle icon matching BUI
function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--ink-2)">
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
    </svg>
  );
}

// Chevron
function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="var(--ink-3)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      className="transition-transform duration-300"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

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
      className={`flex w-full max-w-full flex-col ${className}`}
    >
      {/* BUI-exact header button: icon · shimmer label · chevron */}
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setManualExpanded((cur) => !(cur ?? autoExpanded))}
        className="-mx-1.5 flex w-fit items-center gap-2 rounded-control px-1.5 py-1 transition-colors duration-100 hover:bg-hover-2"
      >
        {icon ? (
          <span className="flex shrink-0" style={{ color: "var(--ink-2)" }}>{icon}</span>
        ) : (
          <SparkleIcon />
        )}

        <span role="status" className="contents">
          {working ? (
            <span
              className="bg-clip-text text-[13px] font-medium whitespace-nowrap text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--ink-3) 35%, var(--ink) 50%, var(--ink-3) 65%)",
                backgroundSize: "200% 100%",
                animation: "shimmer-text 1.4s linear infinite",
              }}
            >
              {v.active}
            </span>
          ) : (
            <span
              className="text-[13px] font-medium whitespace-nowrap"
              style={{
                color: "var(--ink-3)",
                animation: "fade-in 200ms ease both",
              }}
            >
              {v.done}
            </span>
          )}
        </span>

        <ChevronDown open={expanded} />
      </button>

      {/* BUI-exact expandable trace: animated height + vertical timeline line */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-400"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
          opacity: expanded ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="relative mt-1 ml-[5px] pl-4">
            {/* Animated vertical connector line */}
            <span
              aria-hidden="true"
              className="absolute left-[3px] w-px"
              style={{
                top: -8,
                height: expanded ? lineHeight + 8 : 0,
                background: "var(--line)",
                transition: "height 500ms cubic-bezier(0.23,1,0.32,1)",
              }}
            />
            <div ref={traceRef} className="flex flex-col gap-1 py-1">
              {v.rows.slice(0, visible).map((row, i) => {
                const isStepDone = i < visible - 1 || !working;
                return (
                  <div
                    key={row.primary}
                    className="flex min-h-6 w-full items-center gap-2 rounded-md px-1 py-0.5 text-left"
                  >
                    {isStepDone ? (
                      <span className="shrink-0 inline-flex items-center" style={{ color: "var(--ink-3)" }}>
                        <TickIcon />
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center" style={{ color: "var(--ink)" }}>
                        <SpinnerIcon />
                      </span>
                    )}

                    <span
                      className={`min-w-0 flex-1 text-[12.5px] ${
                        variant === "Reasoning"
                          ? "whitespace-normal leading-relaxed"
                          : "truncate font-medium"
                      }`}
                      style={{ color: isStepDone ? "var(--ink-3)" : "var(--ink)" }}
                    >
                      {row.primary}
                    </span>

                    {row.secondary && (
                      <span
                        className={`shrink-0 text-[10px] ${row.mono ? "font-mono" : ""}`}
                        style={{ color: "var(--ink-3)" }}
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
