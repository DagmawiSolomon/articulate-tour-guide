"use client";

import * as React from "react";
import Image from "next/image";
import { DETAIL_HOTSPOTS, type DetailHotspot, ARTWORK_DATA } from "@/lib/demo-tour-data";
import { HugeIcon } from "@/components/ui/hugeicon";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

interface DetailHotspotsViewProps {
  activeHotspotId?: DetailHotspot["id"] | string;
  onSelectHotspot?: (id: DetailHotspot["id"]) => void;
}

export function DetailHotspotsView({
  activeHotspotId,
  onSelectHotspot,
}: DetailHotspotsViewProps) {
  // Starts completely unselected so the entire unzoomed image is displayed by default
  const [selectedId, setSelectedId] = React.useState<DetailHotspot["id"] | null>(null);
  const [hoveredId, setHoveredId] = React.useState<DetailHotspot["id"] | null>(null);

  // Dynamically detected aspect ratio — 100% image-size agnostic for any artwork
  const [aspectRatio, setAspectRatio] = React.useState<number>(1280 / 1014);

  // Measure stage container aspect ratio so the artwork always maximizes to 100% of available space
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerRatio, setContainerRatio] = React.useState<number>(16 / 9);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.height > 0) {
        setContainerRatio(entry.contentRect.width / entry.contentRect.height);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const isWidthConstrained = aspectRatio >= containerRatio;

  // Synchronize when activeHotspotId changes externally (e.g. from docent tool calls)
  React.useEffect(() => {
    if (activeHotspotId && DETAIL_HOTSPOTS.some((h) => h.id === activeHotspotId)) {
      setSelectedId(activeHotspotId as DetailHotspot["id"]);
    }
  }, [activeHotspotId]);

  const selectedHotspot: DetailHotspot | undefined =
    DETAIL_HOTSPOTS.find((h) => h.id === selectedId);

  const handleSelect = (id: DetailHotspot["id"]) => {
    if (selectedId === id) {
      // Toggle off / zoom back out to full uncropped image
      setSelectedId(null);
    } else {
      setSelectedId(id);
      onSelectHotspot?.(id);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If zoomed in and user clicks the canvas background, zoom back out
    if (selectedId !== null && (e.target as HTMLElement).tagName !== "BUTTON") {
      setSelectedId(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
    >
      {/* 
        Size-agnostic artwork frame:
        Expands to 100% of available stage space (either width or height depending on aspect ratio),
        guaranteeing the artwork is as large as physically possible with 100% visibility and zero cropping.
      */}
      <div
        onClick={handleCanvasClick}
        className="relative rounded-xl overflow-hidden select-none cursor-default z-10"
        style={{
          aspectRatio: `${aspectRatio}`,
          width: isWidthConstrained ? "100%" : "auto",
          height: isWidthConstrained ? "auto" : "100%",
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      >
        {/* Zoomable Image Layer — smoothly zooms to hotspot coordinates when clicked */}
        <div
          className="w-full h-full relative transition-transform duration-700 ease-out"
          style={{
            transform: selectedHotspot
              ? `scale(${selectedHotspot.zoomScale})`
              : "scale(1)",
            transformOrigin: selectedHotspot
              ? `${selectedHotspot.xPercent}% ${selectedHotspot.yPercent}%`
              : "50% 50%",
          }}
        >
          <Image
            src={ARTWORK_DATA.imageSrc}
            alt={ARTWORK_DATA.title}
            fill
            sizes="(max-width: 1024px) 100vw, 100vw"
            className="object-contain"
            priority
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                setAspectRatio(img.naturalWidth / img.naturalHeight);
              }
            }}
          />
        </div>

        {/* Hotspot Markers Layer */}
        {DETAIL_HOTSPOTS.map((hotspot) => {
          const isSelected = selectedId === hotspot.id;
          const isHovered = hoveredId === hotspot.id;
          const isHighlighted = isSelected || isHovered;
          const isAnySelected = selectedId !== null;

          return (
            <div
              key={hotspot.id}
              className={`absolute transition-opacity duration-300 ${
                isSelected
                  ? "z-30 opacity-100"
                  : isAnySelected
                  ? "z-10 opacity-0 pointer-events-none"
                  : "z-20 opacity-100"
              }`}
              style={{
                left: `${hotspot.xPercent}%`,
                top: `${hotspot.yPercent}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => setHoveredId(hotspot.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Clean solid white dot marker (no dark dot, no bubble ping) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(hotspot.id);
                }}
                aria-label={`Inspect ${hotspot.name}`}
                className={`relative size-3.5 sm:size-4 rounded-full bg-white transition-transform duration-200 cursor-pointer shadow-md ${
                  isSelected
                    ? "scale-150 ring-2 ring-white/80 ring-offset-1 ring-offset-black/40"
                    : "hover:scale-125 opacity-90 hover:opacity-100 ring-1 ring-black/20"
                }`}
              />

              {/* Quadrant-Aware Curatorial Popover Card */}
              <div
                onClick={(e) => e.stopPropagation()}
                className={`absolute z-40 w-60 sm:w-72 rounded-2xl border border-border bg-card/95 p-3.5 shadow-xl backdrop-blur-md transition-all duration-200 ${
                  isHighlighted
                    ? "pointer-events-auto opacity-100 scale-100 translate-y-0"
                    : "pointer-events-none opacity-0 scale-95 translate-y-1"
                } ${
                  hotspot.xPercent > 50 ? "right-full mr-3" : "left-full ml-3"
                } ${
                  hotspot.yPercent > 50 ? "bottom-0" : "top-0"
                }`}
              >
                {/* Header with Title and X vertically centered */}
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[13px] font-semibold text-foreground leading-snug">
                    {hotspot.name}
                  </h4>
                  {isSelected && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(null);
                      }}
                      className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 shrink-0 rounded-md transition-colors"
                      title="Close"
                      aria-label="Close detail"
                    >
                      <HugeIcon icon={Cancel01Icon} size={13} />
                    </button>
                  )}
                </div>

                <p className="mt-1 text-[11.5px] text-muted-foreground leading-relaxed">
                  {hotspot.insight}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
