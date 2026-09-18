"use client";

import * as React from "react";
import Image from "next/image";
import { COMPARISON_DATA } from "@/lib/demo-tour-data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function ComparisonView() {
  return (
    <div className="w-full h-full flex flex-col gap-5 overflow-y-auto pr-1">
      {/* Side by Side Dual Frame */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Study */}
        <div className="flex flex-col gap-2">
          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-border bg-muted/20 shadow-xs">
            <Image
              src={COMPARISON_DATA.study.imageSrc}
              alt={COMPARISON_DATA.study.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="px-1">
            <div className="text-xs font-semibold text-foreground">
              {COMPARISON_DATA.study.title}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {COMPARISON_DATA.study.date} · {COMPARISON_DATA.study.medium}
            </div>
          </div>
        </div>

        {/* Right: Finished Canvas */}
        <div className="flex flex-col gap-2">
          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-border bg-muted/20 shadow-xs">
            <Image
              src={COMPARISON_DATA.artwork.imageSrc}
              alt={COMPARISON_DATA.artwork.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="px-1">
            <div className="text-xs font-semibold text-foreground">
              {COMPARISON_DATA.artwork.title}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {COMPARISON_DATA.artwork.date} · {COMPARISON_DATA.artwork.medium}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Curatorial Differences Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {COMPARISON_DATA.diffs.map((diff, index) => (
          <Card key={diff.id} className="border-border bg-card shadow-xs">
            <CardHeader className="p-3 pb-1.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                Observation 0{index + 1}
              </div>
              <CardTitle className="text-xs font-semibold text-foreground">
                {diff.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {diff.diff}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
