"use client";

import * as React from "react";
import Image from "next/image";
import { ARTWORK_DATA } from "@/lib/demo-tour-data";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function ArtworkInfoCard() {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  return (
    <div className="flex flex-col lg:flex-row w-full h-full max-w-4xl mx-auto overflow-hidden p-0 items-center justify-center">
      
      {/* Left side: Image */}
      <div 
        className={`relative shrink-0 rounded-2xl overflow-hidden bg-transparent group transition-all duration-[700ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isFullscreen 
            ? "w-full h-[90%] lg:h-full" 
            : "w-full lg:w-1/2 h-[280px] sm:h-[320px] lg:h-[400px] bg-muted/20"
        }`}
      >
        <Image
          src={ARTWORK_DATA.imageSrc}
          alt={ARTWORK_DATA.title}
          fill
          sizes="(max-width: 1024px) 100vw, 100vw"
          priority
          className={`relative z-20 transition-all duration-[700ms] ${
            isFullscreen ? "object-contain" : "object-cover"
          }`}
        />
        {isFullscreen ? (
          <button 
            onClick={() => setIsFullscreen(false)} 
            className="absolute top-4 right-4 z-30 p-1 text-foreground opacity-60 hover:opacity-100 transition-opacity cursor-pointer drop-shadow-sm"
            aria-label="Exit fullscreen"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <button 
            onClick={() => setIsFullscreen(true)} 
            className="absolute bottom-4 right-4 z-30 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-50 group-hover:opacity-100 transition-opacity backdrop-blur-md cursor-pointer border border-white/10"
            aria-label="View fullscreen"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Right side: Content */}
      <div 
        className={`flex flex-col overflow-hidden justify-center transition-all duration-[700ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isFullscreen 
            ? "w-0 h-0 lg:h-auto opacity-0 pl-0 mt-0" 
            : "w-full lg:w-1/2 h-auto opacity-100 pl-0 lg:pl-10 mt-6 lg:mt-0"
        }`}
      >
        <div className="w-full lg:w-[400px] shrink-0 overflow-y-auto py-2">
          <CardHeader className="px-0">
            <CardAction>
              <Badge variant="secondary">{ARTWORK_DATA.year}</Badge>
            </CardAction>
            <CardTitle className="text-xl pr-16">{ARTWORK_DATA.title}</CardTitle>
            <CardDescription>
              {ARTWORK_DATA.artist}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm pb-6 px-0">
            <div className="space-y-1.5">
              <div className="flex justify-between py-1 border-b border-border/50 text-xs">
                <span className="text-muted-foreground">Medium</span>
                <span className="font-medium text-foreground text-right">{ARTWORK_DATA.medium}</span>
              </div>
              <div className="flex justify-between py-1 text-xs">
                <span className="text-muted-foreground">Dimensions</span>
                <span className="font-medium text-foreground text-right">{ARTWORK_DATA.dimensions}</span>
              </div>
            </div>

            <Separator />

            <p className="text-xs leading-relaxed text-muted-foreground">
              {ARTWORK_DATA.summary}
            </p>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
