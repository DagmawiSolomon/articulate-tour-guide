"use client";

import * as React from "react";
import Image from "next/image";
import { COMPARISON_DATA } from "@/lib/demo-tour-data";

export function ComparisonView() {
  return (
    <div className="w-full h-full flex flex-col justify-center overflow-hidden">
      <div className="flex flex-col md:flex-row w-full gap-4 overflow-hidden">
        {/* Study Image */}
        <div className="flex flex-col w-full md:w-1/2 group">
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted/20 rounded-2xl">
            <Image
              src={COMPARISON_DATA.study.imageSrc}
              alt={COMPARISON_DATA.study.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>
          <div className="flex flex-col gap-1 p-3 pb-4">
            <div className="text-[11.5px] uppercase tracking-wider text-muted-foreground font-mono">
              {COMPARISON_DATA.study.date}
            </div>
            <div className="font-semibold text-[13px] text-foreground leading-none">
              {COMPARISON_DATA.study.title}
            </div>
          </div>
        </div>

        {/* Artwork Image */}
        <div className="flex flex-col w-full md:w-1/2 group">
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted/20 rounded-2xl">
            <Image
              src={COMPARISON_DATA.artwork.imageSrc}
              alt={COMPARISON_DATA.artwork.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>
          <div className="flex flex-col gap-1 p-3 pb-4">
            <div className="text-[11.5px] uppercase tracking-wider text-muted-foreground font-mono">
              {COMPARISON_DATA.artwork.date}
            </div>
            <div className="font-semibold text-[13px] text-foreground leading-none">
              {COMPARISON_DATA.artwork.title}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
