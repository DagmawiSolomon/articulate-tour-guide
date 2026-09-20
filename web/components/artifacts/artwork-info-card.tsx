"use client";

import * as React from "react";
import Image from "next/image";
import { ARTWORK_DATA } from "@/lib/demo-tour-data";
import { Separator } from "@/components/ui/separator";
import { HugeIcon } from "@/components/ui/hugeicon";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { playTactileTap } from "@/lib/sounds";

export interface ArtworkMetadataField {
  label: string;
  value: string;
}

export interface ArtworkInfoCardProps {
  title?: string;
  imageSrc?: string;
  summary?: string;
  metadata?: ArtworkMetadataField[];
}

const DEFAULT_METADATA: ArtworkMetadataField[] = [
  { label: "Artist", value: ARTWORK_DATA.artist },
  { label: "Date", value: ARTWORK_DATA.year },
  { label: "Medium", value: ARTWORK_DATA.medium },
  { label: "Dimensions", value: ARTWORK_DATA.dimensions },
];

export function ArtworkInfoCard({
  title = ARTWORK_DATA.title,
  imageSrc = ARTWORK_DATA.imageSrc,
  summary = ARTWORK_DATA.summary,
  metadata = DEFAULT_METADATA,
}: ArtworkInfoCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Keyboard navigation: Escape key exits expanded image view
  React.useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playTactileTap();
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  const toggleExpand = () => {
    playTactileTap();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div
        className={`relative flex flex-col lg:flex-row items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isExpanded
            ? "w-full h-full max-w-4xl border-none shadow-none"
            : "w-full max-w-[780px] rounded-2xl border border-border/70 shadow-xs overflow-hidden"
        }`}
      >
        {/* Left side: Artwork Image (equal 50% size with border when collapsed, grows to full stage borderless when expanded) */}
        <div
          className={`relative overflow-hidden group transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isExpanded
              ? "w-full h-[90%] lg:h-full rounded-2xl border-none bg-transparent"
              : "w-full lg:w-1/2 h-[320px] sm:h-[360px] lg:h-[380px] border-b lg:border-b-0 lg:border-r border-border/50 bg-muted/20 cursor-pointer"
          }`}
          onClick={!isExpanded ? toggleExpand : undefined}
          title={!isExpanded ? "Click to expand image" : undefined}
        >
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 100vw"
            priority
            className={`transition-all duration-500 ${
              isExpanded ? "object-contain" : "object-cover"
            }`}
          />

          {/* Clean Expand / Collapse Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
            className={`absolute z-20 size-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/10 shadow-sm active:scale-95 ${
              isExpanded ? "top-3 right-3" : "bottom-3 right-3 opacity-70 group-hover:opacity-100"
            }`}
            aria-label={isExpanded ? "Collapse image" : "Expand image"}
            title={isExpanded ? "Collapse image (Esc)" : "Expand image"}
          >
            {isExpanded ? (
              <HugeIcon icon={Cancel01Icon} size={14} />
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            )}
          </button>
        </div>

        {/* Right side: Text Content (equal 50% size, collapses when expanded) */}
        <div
          className={`flex flex-col justify-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isExpanded
              ? "w-0 h-0 lg:h-auto opacity-0 p-0 pointer-events-none"
              : "w-full lg:w-1/2 h-auto opacity-100 p-4 sm:p-6 lg:p-7"
          }`}
        >
          <div className="w-full shrink-0">
            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.1px] text-foreground leading-snug">
              {title}
            </h2>

            {/* Dynamic Key-Value Pairs without uppercase, keeping previous scheme */}
            <div className="mt-3.5 space-y-2">
              {metadata.map((item) => (
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

            <Separator className="my-3.5 bg-border/50" />

            {/* Curatorial Summary: elegant secondary narrative contrast */}
            <p className="text-xs sm:text-[12.5px] leading-[1.65] text-secondary-text tracking-[-0.1px] font-normal">
              {summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
