"use client";

import * as React from "react";
import Image from "next/image";
import { EPOCH_COMPARISONS, type CuratedComparisonPair } from "@/lib/turning-points-data";
import { COMPARISON_DATA } from "@/lib/demo-tour-data";

export interface ComparisonViewProps {
  pairId?: "comparison-perspective" | "comparison-cubism" | string;
}

export function ComparisonView({ pairId = "comparison-perspective" }: ComparisonViewProps) {
  const curatedPair: CuratedComparisonPair | undefined = EPOCH_COMPARISONS[pairId];

  // If curated Turning Points comparison pair exists
  if (curatedPair) {
    return (
      <div className="w-full h-full flex flex-col justify-center overflow-hidden p-2 sm:p-4">
        {/* Top curatorial thesis header */}
        <div className="mb-3 px-2 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Epoch Clash &middot; {curatedPair.title}
            </span>
            <h3 className="text-xs font-semibold text-foreground tracking-tight">
              {curatedPair.subtitle}
            </h3>
          </div>
          <span className="text-[11px] text-muted-foreground hidden sm:block italic font-serif max-w-sm truncate text-right">
            {curatedPair.curatorialTakeaway}
          </span>
        </div>

        <div className="flex flex-col md:flex-row w-full gap-4 overflow-hidden">
          {/* Left Artwork */}
          <div className="flex flex-col w-full md:w-1/2 group">
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted/20 rounded-2xl border border-border/60 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={curatedPair.leftArtwork.imageSrc}
                alt={curatedPair.leftArtwork.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-col gap-1 p-3 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] uppercase tracking-wider text-muted-foreground font-mono">
                  {curatedPair.leftArtwork.year} &middot; {curatedPair.leftArtwork.school}
                </span>
              </div>
              <div className="font-semibold text-[13px] text-foreground leading-none">
                {curatedPair.leftArtwork.title}
              </div>
              <div className="text-[11px] text-muted-foreground font-serif italic">
                {curatedPair.leftArtwork.artist}
              </div>
              <ul className="mt-1 space-y-0.5 text-[10.5px] text-muted-foreground">
                {curatedPair.leftArtwork.traits.slice(0, 2).map((t, i) => (
                  <li key={i} className="truncate">&bull; {t}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Artwork */}
          <div className="flex flex-col w-full md:w-1/2 group">
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted/20 rounded-2xl border border-border/60 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={curatedPair.rightArtwork.imageSrc}
                alt={curatedPair.rightArtwork.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-col gap-1 p-3 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] uppercase tracking-wider text-muted-foreground font-mono">
                  {curatedPair.rightArtwork.year} &middot; {curatedPair.rightArtwork.school}
                </span>
              </div>
              <div className="font-semibold text-[13px] text-foreground leading-none">
                {curatedPair.rightArtwork.title}
              </div>
              <div className="text-[11px] text-muted-foreground font-serif italic">
                {curatedPair.rightArtwork.artist}
              </div>
              <ul className="mt-1 space-y-0.5 text-[10.5px] text-muted-foreground">
                {curatedPair.rightArtwork.traits.slice(0, 2).map((t, i) => (
                  <li key={i} className="truncate">&bull; {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to classic comparison data
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
