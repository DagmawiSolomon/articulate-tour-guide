"use client";

import Image from "next/image";
import { ARTWORK_DATA } from "@/lib/demo-tour-data";

export interface ArtworkMetadataField {
  label: string;
  value: string;
}

export interface ArtworkInfoCardProps {
  title?: string;
  imageSrc?: string;
  summary?: string;
  metadata?: ArtworkMetadataField[];
  onReturnToMap?: () => void;
}

export function ArtworkInfoCard({
  title = ARTWORK_DATA.title,
  imageSrc = ARTWORK_DATA.imageSrc,
  summary = ARTWORK_DATA.summary,
  onReturnToMap,
}: ArtworkInfoCardProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center p-2 sm:p-4">
      {onReturnToMap && (
        <button
          type="button"
          onClick={onReturnToMap}
          aria-label="Go back to map"
          title="Go back to map"
          className="absolute left-3 top-3 z-20 grid size-10 place-items-center rounded-full border border-black/10 bg-[#f4f4f2] text-[#20211f] shadow-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
            <path d="M9 12h11" />
          </svg>
        </button>
      )}

      <section
        className="relative aspect-square overflow-hidden rounded-sm bg-[#e8e9e7] shadow-xs"
        style={{
          width: "min(34rem, calc(100vw - 48px), 70vh)",
          height: "min(34rem, calc(100vw - 48px), 70vh)",
        }}
        aria-label={title}
      >
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 90vw, 544px"
          priority
          className="object-cover"
        />

        <div className="absolute left-[15%] top-[30%] z-10 flex min-h-[40%] w-[70%] flex-col items-start gap-3.5 bg-[#f4f4f2]/95 p-3.5 shadow-sm backdrop-blur-sm sm:gap-4 sm:p-4">
          <h2 className="font-serif text-xl font-medium leading-[1.08] tracking-[-0.02em] text-[#20211f] sm:text-[1.4rem]">
            {title}
          </h2>

          <p className="text-xs leading-relaxed text-[#343633] sm:text-[13px]">
            {summary}
          </p>

          {onReturnToMap && (
            <div className="mt-auto flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex min-h-9 items-center justify-center rounded-full bg-[#20211f] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#343633] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6]"
              >
                Start tour
              </button>
              <button
                type="button"
                onClick={onReturnToMap}
                className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#20211f]/20 bg-transparent px-4 py-2 text-xs font-medium text-[#20211f] transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6]"
              >
                Go to map
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
