"use client";

import * as React from "react";
import Image from "next/image";
import { DETAIL_HOTSPOTS, DetailHotspot, ARTWORK_DATA } from "@/lib/demo-tour-data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface DetailHotspotsViewProps {
  activeHotspotId?: "cypress" | "star" | "steeple";
}

export function DetailHotspotsView({
  activeHotspotId = "cypress",
}: DetailHotspotsViewProps) {
  const hotspot: DetailHotspot =
    DETAIL_HOTSPOTS.find((h) => h.id === activeHotspotId) ||
    DETAIL_HOTSPOTS[0];

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center overflow-y-auto pr-1">
      {/* Zoomable Canvas Stage */}
      <div className="lg:col-span-7 h-full flex flex-col items-center justify-center">
        <div className="relative w-full h-[340px] sm:h-[380px] lg:h-full max-h-[480px] 2xl:max-h-[540px] rounded-xl overflow-hidden border border-border bg-black shadow-xs">
          {/* Zoomed artwork container */}
          <div
            className="w-full h-full relative transition-transform duration-700 ease-out"
            style={{
              transform: `scale(${hotspot.zoomScale})`,
              transformOrigin: hotspot.zoomOrigin,
            }}
          >
            <Image
              src={ARTWORK_DATA.imageSrc}
              alt={ARTWORK_DATA.title}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />

            {/* Target Reticle Ring around the active hotspot */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${hotspot.xPercent}%`,
                top: `${hotspot.yPercent}%`,
              }}
            >
              <div className="size-14 rounded-full border-2 border-white/90 shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Detail Curatorial Card */}
      <div className="lg:col-span-5 flex flex-col justify-center">
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
              {hotspot.name}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {hotspot.tag}
            </CardDescription>
          </CardHeader>

          <CardContent className="text-sm">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {hotspot.insight}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
