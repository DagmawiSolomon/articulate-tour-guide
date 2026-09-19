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
  isResolving?: boolean;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  onSelectArtifact?: (type: string, params?: Record<string, any>) => void;
  className?: string;
}

import { getArtifactConfig, MapIcon, ZoomIcon, ArchiveIcon, CompareIcon } from "@/lib/artifact-config";

function getStepIcon(type?: string) {
  switch (type) {
    case "map":    return <MapIcon />;
    case "zoom":   return <ZoomIcon />;
    case "archive": return <ArchiveIcon />;
    default:       return <CompareIcon />;
  }
}

function SpinnerIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
      style={{ animation: "spin 1.1s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
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

function ArrowUpRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  );
}

export default function ToolChips({
  steps = DEFAULT_STEPS,
  labels,
  isResolving = false,
  isExpanded = true,
  onToggle,
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
        {isResolving && <span className="flex shrink-0"><SpinnerIcon /></span>}
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

              const config = getArtifactConfig(target);

              return (
                <button
                  key={step.chip + step.label}
                  type="button"
                  onClick={() => {
                    if (target) onSelectArtifact?.(target, step.params);
                  }}
                  className="group flex w-full text-left items-center gap-2.5 rounded-control px-1 py-1 transition-colors duration-100 hover:bg-hover-2 cursor-pointer"
                >
                  {/* Icon */}
                  <span
                    className="flex shrink-0 items-center justify-center rounded-md"
                    style={{
                      width: 24,
                      height: 24,
                      background: config.bg,
                      color: config.color,
                    }}
                  >
                    {getStepIcon(step.icon)}
                  </span>

                  {/* Label */}
                  <div className="min-w-0 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="truncate text-[13px] font-semibold"
                        style={{ color: "var(--ink)" }}
                      >
                        {step.label}
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

                  {/* Action (arrow shows on hover) */}
                  <span className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pr-2" style={{ color: "var(--ink-3)" }}>
                    <ArrowUpRightIcon />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
