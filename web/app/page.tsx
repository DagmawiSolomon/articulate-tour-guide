"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from "@/components/ui/popover";
import { HugeIcon } from "@/components/ui/hugeicon";
import {
  MicOff01Icon,
  Mic01Icon,
  Cancel01Icon,
  CallEnd01Icon,
  Call02Icon,
} from "@hugeicons/core-free-icons";
import { ArticulateAvatar } from "@/components/avatar/articulate-avatar";
import {
  type ExpressionId,
} from "@/components/avatar/avatar-expressions";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isCallActive, setIsCallActive] = React.useState(false);
  const [activeExpressionId, setActiveExpressionId] = React.useState<ExpressionId>("neutral");
  const [isMuted, setIsMuted] = React.useState(false);

  // Fixed card geometry.
  const tuning = {
    cornerMargin: 0,
    cradleGap: 6,
    shoulderRadius: 14,
    closeSize: 34,
  };

  // Automatically cycle through key tour guide states when call is active
  React.useEffect(() => {
    if (!isCallActive) {
      setActiveExpressionId("neutral");
      return;
    }

    const cycleStates: ExpressionId[] = [
      "listening",
      "thinking",
      "speaking",
      "excited",
      "curious",
      "interested",
      "shy",
    ];

    setActiveExpressionId("listening");

    const stateInterval = setInterval(() => {
      setActiveExpressionId((prev) => {
        const idx = cycleStates.indexOf(prev);
        const nextIdx = idx === -1 ? 0 : (idx + 1) % cycleStates.length;
        return cycleStates[nextIdx];
      });
    }, 3400);

    return () => clearInterval(stateInterval);
  }, [isCallActive]);

  const handleStartCall = () => {
    setIsCallActive(true);

  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setActiveExpressionId("neutral");
  };

  const isListening = activeExpressionId === "listening";

  // A rounded corner cutout houses the avatar without changing the card bounds.
  const avatarNotchPath = "M 104 0.5 C 95 0.5 88 7.5 88 16.5 L 88 58 C 88 68 80 76 70 76 L 18.5 76 C 8.5 76 0.5 84 0.5 94";
  const avatarNotchMask = `${avatarNotchPath} L -4 94 L -4 -4 L 104 -4 Z`;
  // Dynamic top-right inverted border radius (outer edge of circle matches top and right borders)
  const btnRadius = tuning.closeSize / 2;
  const cornerMargin = tuning.cornerMargin;
  const cradleRadius = btnRadius + tuning.cradleGap;
  const shoulderR = tuning.shoulderRadius;

  const cornerS = Math.max(Math.ceil(btnRadius + cornerMargin + cradleRadius + shoulderR + 24), 80);
  const xRight = cornerS - 0.5;
  const yTop = 0.5;

  // Center of the circle: placed so outer edge aligns with card borders
  const cx = xRight - btnRadius - cornerMargin;
  const cy = yTop + btnRadius + cornerMargin;

  // Shoulder circle tangent to top border (yTop) and externally tangent to cradle circle
  const dy = cy - (yTop + shoulderR);
  const distCenters = cradleRadius + shoulderR;
  const dx = Math.sqrt(Math.max(0, distCenters * distCenters - dy * dy));

  const s1x = cx - dx;
  const s2y = cy + dx;

  // Tangent points between shoulder arcs and concentric cradle arc
  const ratio = shoulderR / distCenters;
  const t1x = s1x + ratio * dx;
  const t1y = (yTop + shoulderR) + ratio * dy;

  const t2x = (xRight - shoulderR) - ratio * dy;
  const t2y = s2y - ratio * dx;

  const cornerNotchPath = `M ${s1x} ${yTop} A ${shoulderR} ${shoulderR} 0 0 1 ${t1x} ${t1y} A ${cradleRadius} ${cradleRadius} 0 0 0 ${t2x} ${t2y} A ${shoulderR} ${shoulderR} 0 0 1 ${xRight} ${s2y}`;
  const cornerNotchMask = `${cornerNotchPath} L ${cornerS + 4} ${s2y} L ${cornerS + 4} -4 L ${s1x} -4 Z`;

  const micControl = (
    <Popover>
      <PopoverTrigger render={<Button type="button" aria-label="Microphone settings" title="Microphone settings" className="size-10 rounded-full bg-primary text-white p-0" />}>
        <HugeIcon icon={isMuted ? MicOff01Icon : Mic01Icon} size={18} color="#ffffff" className="text-white" />

      </PopoverTrigger>
      <PopoverContent side="top" sideOffset={12} className="w-60 rounded-2xl border border-border bg-card p-4 gap-3">
        <PopoverTitle className="text-sm font-medium">Microphone settings</PopoverTitle>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-secondary-text">{isMuted ? "Microphone muted" : "Microphone on"}</span>
          <Button type="button" variant="outline" size="sm" aria-pressed={isMuted} onClick={() => setIsMuted((value) => !value)} className="rounded-full text-xs">
            {isMuted ? "Unmute" : "Mute"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
  const callControl = (
    <Button type="button" variant="outline" onClick={isCallActive ? handleEndCall : handleStartCall} aria-label={isCallActive ? "End call" : "Start call"} title={isCallActive ? "End call" : "Start call"} className="size-10 rounded-full bg-card p-0">
      <HugeIcon icon={isCallActive ? CallEnd01Icon : Call02Icon} size={18} />

    </Button>
  );
  const callGroup = (
    <div className="flex h-[52px] w-[120px] items-center justify-center gap-2.5 rounded-full border border-border bg-card px-2 shadow-xs" role="group" aria-label="Call controls">
      {micControl}
      <span className="h-5 w-px shrink-0 bg-border" aria-hidden="true" />
      {callControl}
    </div>
  );
  // Monotonic shoulders meet the capsule at its widest points, avoiding a lower bulge.
  const dockPath = "M 0 63.5 C 12 63.5 14 53.5 14 37.5 A 32 32 0 0 1 46 5.5 H 114 A 32 32 0 0 1 146 37.5 C 146 53.5 148 63.5 160 63.5";
  return (
    <div className="h-dvh min-h-[480px] w-full bg-background grid grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden select-none relative">
      <Header />
      <main className="min-h-0 w-full max-w-6xl mx-auto px-6 py-6 relative flex items-center justify-center">
        <div className="guide-stage relative w-full h-full max-h-[600px]" data-expanded={isExpanded}>
          <div className="guide-card-layer absolute inset-0" inert={!isExpanded} aria-hidden={!isExpanded}>
            <div className="guide-card w-full h-full rounded-2xl border border-border bg-card shadow-xs relative flex items-center justify-center">

              <div
                className="absolute -top-px -right-px pointer-events-none z-10 flex items-start justify-end"
                style={{
                  width: cornerS,
                  height: cornerS,
                }}
              >
                <svg
                  viewBox={`0 0 ${cornerS} ${cornerS}`}
                  style={{ width: cornerS, height: cornerS }}
                  className="overflow-visible"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Mask card background & corner borders */}
                  <path
                    d={cornerNotchMask}
                    className="fill-background"
                  />
                  {/* Seamless C1-continuous hairline reverse fillet border */}
                  <path
                    d={cornerNotchPath}
                    className="stroke-border"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Close Button: Circle with X icon inside, outer edges flush with top and right borders */}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                title="Close artifact stage"
                aria-label="Close artifact stage"
                style={{
                  top: tuning.cornerMargin - 1,
                  right: tuning.cornerMargin - 1,
                  width: tuning.closeSize,
                  height: tuning.closeSize,
                }}
                className="absolute rounded-full bg-card hover:bg-muted text-secondary-text hover:text-foreground border border-border flex items-center justify-center transition-all cursor-pointer z-20 shadow-xs active:scale-95"
              >
                <HugeIcon icon={Cancel01Icon} size={15} />
              </button>

              <div className="absolute -top-px -left-px pointer-events-none z-10" aria-hidden="true">
                <svg viewBox="0 0 105 95" width="105" height="95" fill="none" className="overflow-visible">
                  <path d={avatarNotchMask} className="fill-background" />
                  <path d={avatarNotchPath} className="stroke-border" strokeWidth="1" />
                </svg>
              </div>
              <div className="w-full h-full px-6 pt-28 pb-20 md:px-8" />
              <div className="absolute -bottom-px left-1/2 -translate-x-1/2 z-20 h-16 w-40">
                <svg viewBox="0 0 160 64" width="160" height="64" fill="none" aria-hidden="true" className="pointer-events-none overflow-visible">
                  <path d={`${dockPath} L 160 68 L 0 68 Z`} className="fill-background" />
                  <path d={dockPath} className="stroke-border" strokeWidth="1" />
                </svg>
                <div className="absolute bottom-[0.5px] left-1/2 -translate-x-1/2">{callGroup}</div>
              </div>
            </div>
          </div>
          {/* One persistent avatar travels between the two positions. */}
          <button
            type="button"
            className="guide-avatar absolute z-20 border-0 bg-transparent p-0 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            onClick={() => setIsExpanded((value) => !value)}
            aria-label={isExpanded ? "Close card" : "Open card"}
            aria-expanded={isExpanded}
          >
            <ArticulateAvatar expressionId={activeExpressionId} size={360} isListening={isListening} className="relative flex items-center justify-center" />
          </button>

          <div className="guide-start-controls" inert={isExpanded} aria-hidden={isExpanded} role="group" aria-label="Call controls">
            {callGroup}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
