"use client";

import * as React from "react";
import { TIMELINE_MILESTONES, TimelineMilestone } from "@/lib/demo-tour-data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export function TimelineView() {
  const [selectedId, setSelectedId] = React.useState<string>("saint-remy");

  const selectedMilestone: TimelineMilestone =
    TIMELINE_MILESTONES.find((m) => m.id === selectedId) ||
    TIMELINE_MILESTONES[3];

  return (
    <div className="w-full h-full flex flex-col justify-between gap-6 overflow-y-auto pr-1">
      {/* Header Info */}
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Chronological Context
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          Five Years of Radical Metamorphosis (1885–1890)
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          In just half a decade, Vincent van Gogh transitioned from peasant realism in the Low Countries to pioneering emotional expressionism.
        </p>
      </div>

      {/* Horizontal Milestone Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {TIMELINE_MILESTONES.map((milestone) => {
          const isSelected = milestone.id === selectedId;
          const isCurrentEra = milestone.isCurrent;

          return (
            <button
              key={milestone.id}
              type="button"
              onClick={() => setSelectedId(milestone.id)}
              className={`text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between min-h-[120px] ${
                isSelected
                  ? "border-foreground bg-muted/40 shadow-xs"
                  : "border-border bg-card hover:bg-muted/20"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-semibold text-foreground">
                    {milestone.year}
                  </span>
                  {isCurrentEra && (
                    <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground border border-border px-1 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-xs font-medium text-foreground">
                  {milestone.location}
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground line-clamp-2 mt-2">
                {milestone.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Era Detail Card */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">
              {selectedMilestone.year} · {selectedMilestone.location}
            </span>
            {selectedMilestone.isCurrent && (
              <span className="text-[10px] font-medium text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                Exhibition Focus Period
              </span>
            )}
          </div>
          <CardTitle className="text-base font-semibold text-foreground">
            {selectedMilestone.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs leading-relaxed text-muted-foreground">
            {selectedMilestone.description}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
