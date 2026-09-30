"use client";

import * as React from "react";
import Image from "next/image";
import { ARTWORK_DATA } from "@/lib/demo-tour-data";
import { Separator } from "@/components/ui/separator";
import { HugeIcon } from "@/components/ui/hugeicon";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { playTactileTap } from "@/lib/sounds";

export interface ArtworkMetadataField {
  label: string;
  value: string;
}

export type GalleryState = "unexplored" | "exploring" | "completed";

export interface ArtworkInfoCardProps {
  title?: string;
  imageSrc?: string;
  summary?: string;
  metadata?: ArtworkMetadataField[];
  galleryState?: GalleryState;
  showTourActions?: boolean;
  onReturnToMap?: () => void;
  onStartTour?: () => void;
  onViewArtworkFullscreen?: () => void;
  onEndGalleryTour?: () => void;
}

const DEFAULT_METADATA: ArtworkMetadataField[] = [
  { label: "Artist", value: ARTWORK_DATA.artist },
  { label: "Date", value: ARTWORK_DATA.year },
];

export function ArtworkInfoCard({
  title = ARTWORK_DATA.title,
  imageSrc = ARTWORK_DATA.imageSrc,
  summary = ARTWORK_DATA.summary,
  metadata,
  galleryState,
  showTourActions = true,
  onReturnToMap,
  onStartTour,
  onViewArtworkFullscreen,
  onEndGalleryTour,
}: ArtworkInfoCardProps) {
  const activeMetadata = metadata && metadata.length > 0 ? metadata : DEFAULT_METADATA;
  const state: GalleryState = galleryState ?? (showTourActions ? "unexplored" : "exploring");

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-visible">
      <div className="relative w-full max-w-[850px] flex items-start gap-3 sm:gap-4">
        {onReturnToMap && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playTactileTap();
              onReturnToMap();
            }}
            aria-label="Go back to map"
            title="Go back to map"
            className="shrink-0 flex size-9 sm:size-10 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-xs transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring cursor-pointer mt-1 sm:mt-2"
          >
            <HugeIcon icon={ArrowLeft02Icon} size={18} strokeWidth={2} />
          </button>
        )}

        <div className="relative flex-1 min-w-0 max-w-[780px] rounded-2xl border border-border/70 shadow-xs overflow-hidden flex flex-col lg:flex-row items-center justify-center bg-card">
        {/* Left side: Artwork Image (clicking opens full-screen view) */}
        <div
          className={`relative overflow-hidden w-full lg:w-1/2 h-[320px] sm:h-[360px] lg:h-[380px] border-b lg:border-b-0 lg:border-r border-border/50 bg-muted/20 group ${
            onViewArtworkFullscreen ? "cursor-pointer" : ""
          }`}
          onClick={onViewArtworkFullscreen}
          title={onViewArtworkFullscreen ? "View full-screen artwork" : undefined}
        >
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 390px"
            priority
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />

          {/* Full-screen button when touring */}
          {state === "exploring" && onViewArtworkFullscreen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playTactileTap();
                onViewArtworkFullscreen();
              }}
              aria-label="View full-screen"
              title="View full-screen"
              className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
          )}
        </div>

        {/* Right side: Curatorial Text Content & Actions */}
        <div className="w-full lg:w-1/2 h-auto p-4 sm:p-6 lg:p-7 flex flex-col justify-center overflow-hidden">
          <div className="w-full shrink-0">
            {/* Header: Title */}
            <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.1px] text-foreground leading-snug">
              {title}
            </h2>

            {/* Curatorial Summary */}
            <p className="mt-2 text-xs sm:text-[12.5px] leading-[1.65] text-secondary-text tracking-[-0.1px] font-normal">
              {summary}
            </p>

            <Separator className="my-3.5 bg-border/50" />

            {/* Author (Artist) & Metadata */}
            <div className="space-y-2">
              {activeMetadata.map((item) => (
                <div
                  key={item.label}
                  className="flex items-baseline justify-between border-b border-border/40 pb-1.5 last:border-0 last:pb-0 text-xs"
                >
                  <span className="text-secondary-text shrink-0">
                    {item.label}
                  </span>
                  <span className="font-semibold text-foreground tracking-[-0.1px] text-right ml-4 break-words">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Action buttons based on gallery state */}
            <div className="mt-5">
              <Separator className="mb-4 bg-border/60" />
              <div className="flex flex-wrap items-center gap-2.5">
                {state === "unexplored" && (
                  <>
                    {onStartTour && (
                      <button
                        type="button"
                        onClick={() => {
                          playTactileTap();
                          onStartTour();
                        }}
                        className="inline-flex min-h-9 items-center justify-center rounded-full px-5 py-2 text-xs font-medium text-white cursor-pointer transition-all active:scale-[0.96] border-0 shadow-xs"
                        style={{ background: "var(--ink)", color: "#fff" }}
                      >
                        Explore this artwork
                      </button>
                    )}
                    {onReturnToMap && (
                      <button
                        type="button"
                        onClick={() => {
                          playTactileTap();
                          onReturnToMap();
                        }}
                        className="inline-flex min-h-9 items-center justify-center rounded-full px-4 py-2 text-xs font-medium cursor-pointer transition-colors hover:bg-zinc-200 border-0"
                        style={{ background: "#f4f4f5", color: "#1f1e1b" }}
                      >
                        Go to map
                      </button>
                    )}
                  </>
                )}

                {state === "exploring" && (
                  <>
                    {onEndGalleryTour && (
                      <button
                        type="button"
                        onClick={() => {
                          playTactileTap();
                          onEndGalleryTour();
                        }}
                        className="inline-flex min-h-9 items-center justify-center rounded-full px-5 py-2 text-xs font-medium text-white cursor-pointer transition-all active:scale-[0.96] border-0 shadow-xs"
                        style={{ background: "var(--ink)", color: "#fff" }}
                      >
                        End gallery tour
                      </button>
                    )}
                    {onViewArtworkFullscreen && (
                      <button
                        type="button"
                        onClick={() => {
                          playTactileTap();
                          onViewArtworkFullscreen();
                        }}
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-medium cursor-pointer transition-all hover:bg-zinc-200 active:scale-[0.96] border-0"
                        style={{ background: "#f4f4f5", color: "#1f1e1b" }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                        Full screen view
                      </button>
                    )}
                  </>
                )}

                {state === "completed" && (
                  <>
                    {onStartTour && (
                      <button
                        type="button"
                        onClick={() => {
                          playTactileTap();
                          onStartTour();
                        }}
                        className="inline-flex min-h-9 items-center justify-center rounded-full px-5 py-2 text-xs font-medium text-white cursor-pointer transition-all active:scale-[0.96] border-0 shadow-xs"
                        style={{ background: "var(--ink)", color: "#fff" }}
                      >
                        Revisit
                      </button>
                    )}
                    {onReturnToMap && (
                      <button
                        type="button"
                        onClick={() => {
                          playTactileTap();
                          onReturnToMap();
                        }}
                        className="inline-flex min-h-9 items-center justify-center rounded-full px-4 py-2 text-xs font-medium cursor-pointer transition-colors hover:bg-zinc-200 border-0"
                        style={{ background: "#f4f4f5", color: "#1f1e1b" }}
                      >
                        Go to map
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
