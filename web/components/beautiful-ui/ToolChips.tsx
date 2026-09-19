"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Compass01Icon,
  Search01Icon,
  SparklesIcon,
  ArrowRight01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";

/* ─────────────────────────────────────────────────────────
 * TOOL CHIPS — Visual Stage Tool Invocations
 *
 * In chat mode, visitors can clearly see the artifact tool call
 * the agent made, and click it to open/display that artifact.
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
  labels?: {
    header?: string;
  };
  onSelectArtifact?: (type: string, params?: Record<string, any>) => void;
  className?: string;
}

export default function ToolChips({
  steps = DEFAULT_STEPS,
  labels,
  onSelectArtifact,
  className = "",
}: ToolChipsProps) {
  const [open, setOpen] = React.useState(true);

  const getIcon = (type?: string) => {
    switch (type) {
      case "map":
        return <HugeiconsIcon icon={Compass01Icon} size={14} />;
      case "zoom":
        return <HugeiconsIcon icon={Search01Icon} size={14} />;
      default:
        return <HugeiconsIcon icon={SparklesIcon} size={14} />;
    }
  };

  const headerLabel = labels?.header ?? `Agent called visual artifact`;

  return (
    <div className={`w-full max-w-full sm:max-w-md py-1.5 ${className}`}>
      {/* Tool Call Header Toggle */}
      <div className="flex items-center justify-between mb-1 px-1">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span
            className="transition-transform duration-200 inline-flex items-center"
            style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
          >
            <HugeiconsIcon icon={ArrowDown01Icon} size={12} />
          </span>
          <span className="font-mono text-[11px] font-medium tracking-tight text-muted-foreground">
            {headerLabel}
          </span>
        </button>

        <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground/80 bg-muted px-1.5 py-0.5 rounded">
          Tool Call
        </span>
      </div>

      {/* Tool Calls List */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-300"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
        }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1.5">
            {steps.map((step) => {
              const target = step.artifactType || (
                step.chip.includes("map") ? "map" :
                step.chip.includes("hotspot") ? "hotspots" :
                step.chip.includes("comparison") ? "comparison" :
                step.chip.includes("timeline") ? "timeline" : "info"
              );

              return (
                <div
                  key={step.chip + step.label}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-card border border-border/80 p-2.5 shadow-xs hover:border-border transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground shrink-0 shadow-2xs">
                      {getIcon(step.icon)}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground text-xs truncate">
                          {step.label}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded border border-border/40">
                          {step.chip}
                        </span>
                      </div>
                      {step.detail && (
                        <span className="text-[11px] text-muted-foreground truncate">
                          {step.detail}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Open Artifact Button */}
                  <button
                    type="button"
                    onClick={() => onSelectArtifact?.(target, step.params)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-muted hover:bg-muted/80 border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:text-primary transition-colors cursor-pointer shrink-0 self-end sm:self-center shadow-2xs"
                  >
                    <span>View Artifact</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="text-muted-foreground" />
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
