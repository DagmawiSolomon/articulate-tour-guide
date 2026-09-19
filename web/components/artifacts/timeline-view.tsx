"use client";

import * as React from "react";
import Image from "next/image";
import { TIMELINE_MILESTONES, TimelineMilestone } from "@/lib/demo-tour-data";

export function TimelineView() {
  const [selectedId, setSelectedId] = React.useState<string>("saint-remy");
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const selectedMilestone: TimelineMilestone =
    TIMELINE_MILESTONES.find((m) => m.id === selectedId) ||
    TIMELINE_MILESTONES[3];

  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const scrollLeftStart = React.useRef(0);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current && e.deltaY !== 0) {
      scrollContainerRef.current.scrollLeft += e.deltaY * 0.9;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    scrollLeftStart.current = scrollContainerRef.current?.scrollLeft || 0;
  };

  const handleMouseLeaveOrUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 1.4;
    scrollContainerRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  return (
    <div className="w-full h-full flex flex-col justify-center gap-3 overflow-hidden select-none">
      {/* Horizontal Alternating Timeline Track */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        className="relative w-full flex-1 min-h-[300px] overflow-x-auto overflow-y-hidden scroll-smooth py-2 cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="relative h-full min-w-[1080px] flex items-center justify-between px-10">
          {/* Continuous Center Axis Line */}
          <div
            className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-[2px] bg-[#c85a32]/35 dark:bg-[#c85a32]/50 pointer-events-none z-0"
            aria-hidden="true"
          />

          {/* Timeline Milestones */}
          {TIMELINE_MILESTONES.map((milestone, index) => {
            const isSelected = milestone.id === selectedId;
            const isTop = index % 2 === 0;

            return (
              <div
                key={milestone.id}
                onClick={() => setSelectedId(milestone.id)}
                className="relative z-10 w-[190px] h-full flex flex-col items-center justify-center cursor-pointer group"
              >
                {/* TOP HALF */}
                <div className="h-[135px] w-full flex flex-col justify-end items-center pb-2">
                  {isTop ? (
                    <div className="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-1">
                      {/* Circular Artwork Vignette with Offset Accent Disc */}
                      <div className="relative">
                        <div
                          className={`absolute -top-1 -right-1 w-full h-full rounded-full transition-all duration-300 -z-10 ${
                            isSelected
                              ? "bg-[#c85a32]/35 scale-105"
                              : "bg-[#c85a32]/15 group-hover:bg-[#c85a32]/25"
                          }`}
                        />
                        <div
                          className={`relative w-20 h-20 rounded-full overflow-hidden border-2 bg-muted/30 transition-all duration-300 shadow-xs ${
                            isSelected
                              ? "border-[#c85a32] ring-2 ring-[#c85a32]/20"
                              : "border-border/80 group-hover:border-foreground/40"
                          }`}
                        >
                          {milestone.imageSrc && (
                            <Image
                              src={milestone.imageSrc}
                              alt={milestone.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          )}
                        </div>
                      </div>

                      {/* Year & Title info */}
                      <div className="text-center mt-2 px-1">
                        <div className="font-mono text-xs font-bold text-[#c85a32] dark:text-[#e06d48] leading-none">
                          {milestone.year}
                        </div>
                        <div className="text-xs font-semibold text-foreground line-clamp-1 mt-0.5">
                          {milestone.location}
                        </div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">
                          {milestone.title}
                        </div>
                      </div>

                      {/* Dashed Stem Connector to Axis Line */}
                      <div className="w-[1.5px] h-3.5 border-l-2 border-dashed border-[#c85a32]/50 mt-1" />
                    </div>
                  ) : null}
                </div>

                {/* CENTER AXIS NODE */}
                <div className="h-[28px] w-full flex items-center justify-center relative">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                      isSelected
                        ? "border-[#c85a32] bg-[#c85a32] ring-4 ring-[#c85a32]/25 scale-125"
                        : "border-[#c85a32] bg-card group-hover:scale-115 group-hover:border-[#c85a32]"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-1 h-1 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                {/* BOTTOM HALF */}
                <div className="h-[135px] w-full flex flex-col justify-start items-center pt-2">
                  {!isTop ? (
                    <div className="flex flex-col items-center transition-transform duration-300 group-hover:translate-y-1">
                      {/* Dashed Stem Connector from Axis Line */}
                      <div className="w-[1.5px] h-3.5 border-l-2 border-dashed border-[#c85a32]/50 mb-1" />

                      {/* Year & Title info */}
                      <div className="text-center mb-2 px-1">
                        <div className="font-mono text-xs font-bold text-[#c85a32] dark:text-[#e06d48] leading-none">
                          {milestone.year}
                        </div>
                        <div className="text-xs font-semibold text-foreground line-clamp-1 mt-0.5">
                          {milestone.location}
                        </div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">
                          {milestone.title}
                        </div>
                      </div>

                      {/* Circular Artwork Vignette with Offset Accent Disc */}
                      <div className="relative">
                        <div
                          className={`absolute -bottom-1 -right-1 w-full h-full rounded-full transition-all duration-300 -z-10 ${
                            isSelected
                              ? "bg-[#c85a32]/35 scale-105"
                              : "bg-[#c85a32]/15 group-hover:bg-[#c85a32]/25"
                          }`}
                        />
                        <div
                          className={`relative w-20 h-20 rounded-full overflow-hidden border-2 bg-muted/30 transition-all duration-300 shadow-xs ${
                            isSelected
                              ? "border-[#c85a32] ring-2 ring-[#c85a32]/20"
                              : "border-border/80 group-hover:border-foreground/40"
                          }`}
                        >
                          {milestone.imageSrc && (
                            <Image
                              src={milestone.imageSrc}
                              alt={milestone.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Era Curatorial Detail Panel */}
      <div className="rounded-xl border border-border bg-card p-3 shadow-xs shrink-0 transition-all">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#c85a32] dark:text-[#e06d48]">
              {selectedMilestone.year}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs font-medium text-foreground">
              {selectedMilestone.location}
            </span>
            {selectedMilestone.artworkTitle && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs italic text-muted-foreground">
                  {selectedMilestone.artworkTitle}
                </span>
              </>
            )}
          </div>
          {selectedMilestone.isCurrent && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#c85a32] dark:text-[#e06d48] bg-[#c85a32]/10 dark:bg-[#c85a32]/20 px-2 py-0.5 rounded-full border border-[#c85a32]/20">
              Current Exhibition Focus
            </span>
          )}
        </div>
        <div className="text-xs font-semibold text-foreground mb-0.5">
          {selectedMilestone.title}
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {selectedMilestone.description}
        </div>
      </div>
    </div>
  );
}

