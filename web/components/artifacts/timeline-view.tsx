"use client";

import * as React from "react";
import Image from "next/image";
import { TIMELINE_MILESTONES, TimelineMilestone } from "@/lib/demo-tour-data";
import { playTactileTap } from "@/lib/sounds";

export function TimelineView() {
  const [selectedId, setSelectedId] = React.useState<string>("saint-remy");
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

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

  const handleSelectMilestone = (id: string) => {
    playTactileTap();
    setSelectedId(id);
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none flex items-center justify-center">
      {/* Horizontal Alternating Timeline Track — Perfectly Centered Vertically */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        className="w-full h-full overflow-x-auto overflow-y-hidden scroll-smooth flex items-center py-2 cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="relative w-full min-w-[1100px] flex items-center justify-between px-12">
          {/* Continuous Center Axis Line — mathematically at 50% vertical center */}
          <div
            className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-[1.5px] bg-border pointer-events-none z-0"
            aria-hidden="true"
          />

          {/* Timeline Milestones */}
          {TIMELINE_MILESTONES.map((milestone, index) => {
            const isSelected = milestone.id === selectedId;
            const isHovered = milestone.id === hoveredId;
            const isTop = index % 2 === 0;

            return (
              <div
                key={milestone.id}
                onClick={() => handleSelectMilestone(milestone.id)}
                onMouseEnter={() => setHoveredId(milestone.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative z-10 w-[200px] flex flex-col items-center justify-center cursor-pointer group"
              >
                {/* TOP HALF — Symmetrical 148px height */}
                <div className="h-[148px] w-full flex flex-col justify-end items-center pb-2 relative">
                  {isTop ? (
                    <div className="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-1">
                      {/* Circular Artwork Vignette with Offset Disc */}
                      <div className="relative">
                        <div
                          className={`absolute -top-1 -right-1 w-full h-full rounded-full transition-all duration-300 -z-10 ${
                            isSelected
                              ? "bg-muted-foreground/15 scale-105"
                              : isHovered
                              ? "bg-muted scale-105"
                              : "bg-soft"
                          }`}
                        />
                        <div
                          className={`relative w-20 h-20 rounded-full overflow-hidden border-2 bg-muted/30 transition-all duration-300 shadow-xs ${
                            isSelected
                              ? "border-foreground"
                              : isHovered
                              ? "border-foreground/60"
                              : "border-border/80"
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

                      {/* Year & Location info */}
                      <div className="text-center mt-2 px-1">
                        <div
                          className={`font-mono text-xs font-bold leading-none transition-colors duration-200 ${
                            isSelected || isHovered
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {milestone.year}
                        </div>
                        <div className="text-xs font-semibold text-foreground line-clamp-1 mt-0.5">
                          {milestone.location}
                        </div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">
                          {milestone.artworkTitle || milestone.title}
                        </div>
                      </div>

                      {/* Dashed Stem Connector to Axis Line */}
                      <div className="w-[1.5px] h-3.5 border-l-2 border-dashed border-border mt-1" />
                    </div>
                  ) : null}
                </div>

                {/* CENTER AXIS NODE: Solid circle, enlarges on select, no glow */}
                <div className="h-[28px] w-full flex items-center justify-center relative">
                  <div
                    className={`rounded-full transition-all duration-200 ${
                      isSelected
                        ? "w-4 h-4 bg-foreground"
                        : isHovered
                        ? "w-3.5 h-3.5 bg-foreground/80"
                        : "w-2.5 h-2.5 bg-border group-hover:scale-125"
                    }`}
                  />
                </div>

                {/* BOTTOM HALF — Symmetrical 148px height */}
                <div className="h-[148px] w-full flex flex-col justify-start items-center pt-2 relative">
                  {!isTop ? (
                    <div className="flex flex-col items-center transition-transform duration-300 group-hover:translate-y-1">
                      {/* Dashed Stem Connector from Axis Line */}
                      <div className="w-[1.5px] h-3.5 border-l-2 border-dashed border-border mb-1" />

                      {/* Year & Location info */}
                      <div className="text-center mb-2 px-1">
                        <div
                          className={`font-mono text-xs font-bold leading-none transition-colors duration-200 ${
                            isSelected || isHovered
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {milestone.year}
                        </div>
                        <div className="text-xs font-semibold text-foreground line-clamp-1 mt-0.5">
                          {milestone.location}
                        </div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">
                          {milestone.artworkTitle || milestone.title}
                        </div>
                      </div>

                      {/* Circular Artwork Vignette with Offset Disc */}
                      <div className="relative">
                        <div
                          className={`absolute -bottom-1 -right-1 w-full h-full rounded-full transition-all duration-300 -z-10 ${
                            isSelected
                              ? "bg-muted-foreground/15 scale-105"
                              : isHovered
                              ? "bg-muted scale-105"
                              : "bg-soft"
                          }`}
                        />
                        <div
                          className={`relative w-20 h-20 rounded-full overflow-hidden border-2 bg-muted/30 transition-all duration-300 shadow-xs ${
                            isSelected
                              ? "border-foreground"
                              : isHovered
                              ? "border-foreground/60"
                              : "border-border/80"
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
    </div>
  );
}
