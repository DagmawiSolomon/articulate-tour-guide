"use client";

import * as React from "react";
import Image from "next/image";
import { DETAIL_HOTSPOTS, type DetailHotspot, ARTWORK_DATA } from "@/lib/demo-tour-data";
import { HugeIcon } from "@/components/ui/hugeicon";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { playTactileTap } from "@/lib/sounds";

interface DetailHotspotsViewProps {
  activeHotspotId?: DetailHotspot["id"] | string;
  onSelectHotspot?: (id: DetailHotspot["id"]) => void;
  imageSrc?: string;
  imageAlt?: string;
  hotspots?: DetailHotspot[];
}

export function DetailHotspotsView({
  activeHotspotId,
  onSelectHotspot,
  imageSrc = ARTWORK_DATA.imageSrc,
  imageAlt = ARTWORK_DATA.title,
  hotspots = DETAIL_HOTSPOTS,
}: DetailHotspotsViewProps) {
  // Starts completely unselected so the entire unzoomed image is displayed by default
  const [zoomedId, setZoomedId] = React.useState<DetailHotspot["id"] | null>(null);
  const [isCardOpen, setIsCardOpen] = React.useState<boolean>(false);
  const [hoveredId, setHoveredId] = React.useState<DetailHotspot["id"] | null>(null);

  // Dynamic natural aspect ratio detected on image load — works for ANY image
  const [naturalRatio, setNaturalRatio] = React.useState<number>(1280 / 1014);

  // Measure stage container size to calculate exact hotspot projection on object-cover
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = React.useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  React.useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setContainerSize({ width: clientWidth, height: clientHeight });
        }
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Keyboard navigation: Escape key closes popup card first, or zooms out if card is already closed
  React.useEffect(() => {
    if (!zoomedId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playTactileTap();
        if (isCardOpen) {
          setIsCardOpen(false);
        } else {
          setZoomedId(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomedId, isCardOpen]);

  // Maps normalized image coordinates (0-100%) to screen container percentages for object-cover
  const getHotspotScreenPos = React.useCallback(
    (xPercent: number, yPercent: number) => {
      if (containerSize.width === 0 || containerSize.height === 0) {
        return { leftPercent: xPercent, topPercent: yPercent };
      }

      const containerRatio = containerSize.width / containerSize.height;

      if (containerRatio >= naturalRatio) {
        // Container is wider than the image: width fills, vertical height overflows and is centered
        const renderedH = containerSize.width / naturalRatio;
        const offsetY = (containerSize.height - renderedH) / 2;
        const pixelY = offsetY + (yPercent / 100) * renderedH;
        const topPercent = (pixelY / containerSize.height) * 100;
        return { leftPercent: xPercent, topPercent };
      } else {
        // Container is taller/narrower than the image: height fills, horizontal width overflows and is centered
        const renderedW = containerSize.height * naturalRatio;
        const offsetX = (containerSize.width - renderedW) / 2;
        const pixelX = offsetX + (xPercent / 100) * renderedW;
        const leftPercent = (pixelX / containerSize.width) * 100;
        return { leftPercent, topPercent: yPercent };
      }
    },
    [containerSize, naturalRatio]
  );

  // Synchronize when activeHotspotId changes externally (e.g. from docent tool calls)
  React.useEffect(() => {
    if (activeHotspotId && hotspots.some((h) => h.id === activeHotspotId)) {
      setZoomedId(activeHotspotId as DetailHotspot["id"]);
      setIsCardOpen(true);
    }
  }, [activeHotspotId, hotspots]);

  const selectedHotspot: DetailHotspot | undefined =
    hotspots.find((h) => h.id === zoomedId);

  const selectedHotspotPos = selectedHotspot
    ? getHotspotScreenPos(selectedHotspot.xPercent, selectedHotspot.yPercent)
    : null;

  const handleSelect = (id: DetailHotspot["id"]) => {
    playTactileTap();
    if (zoomedId === id) {
      if (!isCardOpen) {
        // If already zoomed into this detail but card was closed, reopen card without zooming out
        setIsCardOpen(true);
      } else {
        // If card was open and pin clicked again, zoom out
        setZoomedId(null);
        setIsCardOpen(false);
      }
    } else {
      setZoomedId(id);
      setIsCardOpen(true);
      onSelectHotspot?.(id);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If zoomed in and user clicks the canvas background, zoom back out
    if (zoomedId !== null && (e.target as HTMLElement).tagName !== "BUTTON") {
      playTactileTap();
      setZoomedId(null);
      setIsCardOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleCanvasClick}
      className="relative w-full h-full rounded-2xl overflow-hidden border border-border/60 bg-muted/20 shadow-xs select-none cursor-default"
    >
      {/* Zoomable Image Layer — covers 100% of stage canvas, eliminates white space */}
      <div
        className="w-full h-full relative transition-transform duration-700 ease-out"
        style={{
          transform: selectedHotspot
            ? `scale(${selectedHotspot.zoomScale})`
            : "scale(1)",
          transformOrigin: selectedHotspotPos
            ? `${selectedHotspotPos.leftPercent}% ${selectedHotspotPos.topPercent}%`
            : "50% 50%",
        }}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 100vw"
          className="object-cover"
          priority
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              setNaturalRatio(img.naturalWidth / img.naturalHeight);
            }
          }}
        />
      </div>

      {/* Hotspot Markers Layer */}
      {hotspots.map((hotspot) => {
        const isSelected = zoomedId === hotspot.id;
        const isHovered = hoveredId === hotspot.id;
        const isCardVisible =
          (isSelected && isCardOpen) || (zoomedId === null && isHovered);
        const isAnySelected = zoomedId !== null;
        const screenPos = getHotspotScreenPos(hotspot.xPercent, hotspot.yPercent);

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
              left: `${screenPos.leftPercent}%`,
              top: `${screenPos.topPercent}%`,
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
                isCardVisible
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
                      playTactileTap();
                      setIsCardOpen(false);
                    }}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 shrink-0 rounded-md transition-colors"
                    title="Close insight"
                    aria-label="Close insight"
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
  );
}
