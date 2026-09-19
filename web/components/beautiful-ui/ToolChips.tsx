"use client";

import * as React from "react";

/* ─────────────────────────────────────────────────────────
 * TOOL CHIPS — BUI #05 Visual Stage Tool Invocations
 *
 * Compact expandable section showing "N tool calls"
 * with individual chip rows per tool call. Visitors
 * can click "View Artifact" to open the corresponding
 * artifact panel in the stage.
 * ───────────────────────────────────────────────────────── */

export type ToolStep = {
  icon?: "map" | "zoom" | "archive" | "compare";
  label: string;
  chip: string;
  artifactType?: "info" | "map" | "comparison" | "timeline" | "hotspots";
  params?: Record<string, any>;
  detail?: string;
};

const DEFAULT_STEPS: ToolStep[] = [
  {
    icon: "zoom",
    label: "Zooming to Cypress",
    chip: "show_hotspots",
    artifactType: "hotspots",
    params: { hotspotId: "cypress" },
    detail: "Focused on flame-shaped cypresses in foreground",
  },
];

interface ToolChipsProps {
  steps?: ToolStep[];
  labels?: { header?: string };
  onSelectArtifact?: (type: string, params?: Record<string, any>) => void;
  className?: string;
}

// BUI icon — map pin
function MapIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M12 3v18" />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      className="transition-transform duration-200"
      style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function getStepIcon(type?: string) {
  switch (type) {
    case "map":    return <MapIcon />;
    case "zoom":   return <ZoomIcon />;
    case "archive": return <ArchiveIcon />;
    default:       return <CompareIcon />;
  }
}

export default function ToolChips({
  steps = DEFAULT_STEPS,
  labels,
  onSelectArtifact,
  className = "",
}: ToolChipsProps) {
  const [open, setOpen] = React.useState(true);
  const toolCount = steps.length;
  const headerLabel =
    labels?.header ?? `${toolCount} tool call${toolCount !== 1 ? "s" : ""}`;

  return (
    <div className={`w-full max-w-full ${className}`}>
      {/* BUI-exact header toggle: chevron · "N tool calls, M messages" */}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="-mx-1.5 flex w-fit items-center gap-1.5 rounded-control px-1.5 py-1 text-[12.5px] transition-colors duration-100 hover:bg-hover-2"
        style={{ color: "var(--ink-2)" }}
      >
        <ChevronDown open={open} />
        <span className="tabular-nums">{headerLabel}</span>
      </button>

      {/* BUI-exact expandable chip list */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-300"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <div className="-mx-1 overflow-hidden px-1.5 pb-1">
          <div className="mt-1.5 flex flex-col gap-1">
            {steps.map((step) => {
              const target =
                step.artifactType ??
                (step.chip.includes("map")
                  ? "map"
                  : step.chip.includes("hotspot")
                  ? "hotspots"
                  : step.chip.includes("comparison")
                  ? "comparison"
                  : step.chip.includes("timeline")
                  ? "timeline"
                  : "info");

              return (
                <div
                  key={step.chip + step.label}
                  className="flex items-center gap-2.5 rounded-control px-2.5 py-2 transition-colors duration-100"
                  style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
                >
                  {/* Icon */}
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-md"
                    style={{
                      background: "var(--inset)",
                      border: "1px solid var(--line)",
                      color: "var(--ink)",
                    }}
                  >
                    {getStepIcon(step.icon)}
                  </span>

                  {/* Label + chip */}
                  <div className="min-w-0 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="truncate text-[13px] font-semibold"
                        style={{ color: "var(--ink)" }}
                      >
                        {step.label}
                      </span>
                      <span
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          color: "var(--ink-2)",
                          background: "var(--field)",
                          border: "1px solid var(--line-strong)",
                          flexShrink: 0,
                        }}
                      >
                        {step.chip}
                      </span>
                    </div>
                    {step.detail && (
                      <span
                        className="text-[12px] truncate pt-0.5"
                        style={{ color: "var(--ink-2)" }}
                      >
                        {step.detail}
                      </span>
                    )}
                  </div>

                  {/* View Artifact button — BUI-style rounded-full pill */}
                  <button
                    type="button"
                    onClick={() => onSelectArtifact?.(target, step.params)}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors duration-100 shrink-0 cursor-pointer hover:opacity-80"
                    style={{
                      background: "var(--field)",
                      color: "var(--ink)",
                      border: "1px solid var(--line-strong)",
                    }}
                  >
                    <span>View</span>
                    <span style={{ color: "var(--ink-3)" }}>
                      <ArrowRightIcon />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
