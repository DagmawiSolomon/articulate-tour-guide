"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MicOff01Icon,
  Mic01Icon,
  Cancel01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { ArticulateAvatar } from "@/components/avatar/articulate-avatar";
import {
  EXPRESSIONS_CATALOG,
  type ExpressionId,
} from "@/components/avatar/avatar-expressions";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isCallActive, setIsCallActive] = React.useState(false);
  const [activeExpressionId, setActiveExpressionId] = React.useState<ExpressionId>("neutral");
  const [isMuted, setIsMuted] = React.useState(false);

  // Interactive tuning controls for positioning, curvature, and cutout geometry
  const [tuning, setTuning] = React.useState({
    avatarSize: 116,
    avatarOverlap: 54,
    notchWidth: 164,
    notchDepth: 50,
    cornerMargin: 0,
    cradleGap: 6,
    shoulderRadius: 14,
    closeSize: 34,
  });
  const [showTuning, setShowTuning] = React.useState(true);

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
    setIsMuted(false);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setActiveExpressionId("neutral");
  };

  const activeExpression =
    EXPRESSIONS_CATALOG.find((e) => e.id === activeExpressionId) ??
    EXPRESSIONS_CATALOG[0];

  const isListening = activeExpressionId === "listening";
  const isThinking = activeExpressionId === "thinking";
  const isSpeaking = activeExpressionId === "speaking";

  // Dynamic bottom notch calculation based on live tuning controls
  const notchW = tuning.notchWidth;
  const notchD = tuning.notchDepth;
  const notchH = notchD + 6;
  const baselineY = notchH - 0.5;
  const apexY = baselineY - notchD;
  const centerX = notchW / 2;
  const shoulderX = centerX - (notchW * 0.16);
  const shoulderY = apexY + (notchD * 0.6);
  const cp1X = notchW * 0.16;
  const cp2X = notchW * 0.27;
  const cp2Y = baselineY - (notchD * 0.15);

  const bottomNotchPath = `M 0 ${baselineY} C ${cp1X} ${baselineY}, ${cp2X} ${cp2Y}, ${shoulderX} ${shoulderY} C ${shoulderX + 12} ${shoulderY - 12}, ${centerX - 9} ${apexY}, ${centerX} ${apexY} C ${centerX + 9} ${apexY}, ${notchW - shoulderX - 12} ${shoulderY - 12}, ${notchW - shoulderX} ${shoulderY} C ${notchW - cp2X} ${cp2Y}, ${notchW - cp1X} ${baselineY}, ${notchW} ${baselineY}`;
  const bottomNotchMask = `${bottomNotchPath} L ${notchW} ${notchH + 4} L 0 ${notchH + 4} Z`;

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

  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-between overflow-hidden select-none relative">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 relative flex items-center justify-center">
        {/* Center Guide View: Avatar in center, Speak button / Call controls below */}
        {!isExpanded ? (
          <div className="flex flex-col items-center justify-center gap-4 z-20">
            {/* Mr. Triangle Avatar: Geometry stays 100% constant across every emotion */}
            <ArticulateAvatar
              expressionId={activeExpressionId}
              size={280}
              onClick={() => setIsExpanded(true)}
              isListening={isListening}
            />

            {/* Control bar */}
            <div className="flex items-center justify-center transition-all pt-1">
              {!isCallActive ? (
                <button
                  type="button"
                  onClick={handleStartCall}
                  className="h-11 px-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 font-medium text-xs tracking-[-0.1px] transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <HugeiconsIcon icon={Mic01Icon} size={16} color="#ffffff" className="text-white" />
                  <span>Speak</span>
                </button>
              ) : (
                <div className="h-13 px-2 bg-card rounded-full border border-border/80 shadow-xs flex items-center gap-2.5 transition-all">
                  {/* Left: Mic Toggle Button (Circle) */}
                  <button
                    type="button"
                    onClick={() => setIsMuted((prev) => !prev)}
                    title={isMuted ? "Unmute microphone" : "Mute microphone"}
                    aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                    className={`size-10 rounded-full flex items-center justify-center transition-colors cursor-pointer active:scale-95 ${
                      isMuted
                        ? "bg-[#fde8e8] text-[#e02424] hover:bg-[#fbd5d5]"
                        : "bg-subtle text-secondary-text hover:bg-soft hover:text-foreground"
                    }`}
                  >
                    <HugeiconsIcon icon={isMuted ? MicOff01Icon : Mic01Icon} size={18} />
                  </button>

                  <div className="w-px h-5 bg-border/80" />

                  {/* Right: Circle with X icon inside it to end */}
                  <button
                    type="button"
                    onClick={handleEndCall}
                    title="End call"
                    aria-label="End call"
                    className="size-10 rounded-full bg-[#fde8e8] text-[#e02424] hover:bg-[#fbd5d5] flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Expanded Mode: Unified Group (Card + Mr. Triangle) perfectly centered */
          <div className="w-full max-w-5xl flex flex-col items-center justify-center z-20 my-auto">
            {/* 1. Large Area for the Artifact - Crisp Rectangular Sharpness Preserved */}
            <div className="w-full h-[480px] md:h-[540px] max-h-[66vh] min-h-[360px] rounded-2xl border border-border bg-card shadow-xs relative flex items-center justify-center">
              {/* Inverted Border Radius Cradle on Top-Right Corner */}
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
                <HugeiconsIcon icon={Cancel01Icon} size={15} />
              </button>

              {/* Large Artifact Display Canvas (clean, unobstructed) */}
              <div className="w-full h-full p-6 md:p-8 flex items-center justify-center" />

              {/* Cutout Notch matching Mr. Triangle's shape: ultra-smooth continuous bezier curve with seamless border continuation */}
              <div
                className="absolute -bottom-px left-1/2 -translate-x-1/2 pointer-events-none z-10 flex items-end justify-center"
                style={{ width: notchW, height: notchH }}
              >
                <svg
                  viewBox={`0 0 ${notchW} ${notchH}`}
                  style={{ width: notchW, height: notchH }}
                  className="overflow-visible"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Fill with background token to mask card background & bottom border */}
                  <path
                    d={bottomNotchMask}
                    className="fill-background"
                  />
                  {/* Ultra-smooth continuous hairline border contour wrapping around Mr. Triangle */}
                  <path
                    d={bottomNotchPath}
                    className="stroke-border"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* 2. The Blob at the Bottom (Dock removed, pure guide companion) */}
            <div
              className="flex flex-col items-center justify-center z-20"
              style={{ marginTop: -tuning.avatarOverlap }}
            >
              {/* The Blob nestled into the card cutout */}
              <div
                onClick={() => setIsExpanded(false)}
                title="Click to center guide"
                className="cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0"
              >
                <ArticulateAvatar
                  expressionId={activeExpressionId}
                  size={tuning.avatarSize}
                  isListening={isListening}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Interactive Controls for Positioning & Curvature */}
      {isExpanded && (
        <div className="fixed bottom-5 right-6 z-50 flex flex-col items-end gap-2 select-none">
          {showTuning && (
            <div className="w-76 p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-md flex flex-col gap-3 text-xs text-foreground animate-in fade-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/70">
                <span className="font-semibold tracking-[-0.1px] text-xs">Position & Curvature Controls</span>
                <button
                  type="button"
                  onClick={() => setTuning({
                    avatarSize: 116,
                    avatarOverlap: 54,
                    notchWidth: 164,
                    notchDepth: 50,
                    cornerMargin: 0,
                    cradleGap: 6,
                    shoulderRadius: 14,
                    closeSize: 34,
                  })}
                  className="text-[11px] text-secondary-text hover:text-foreground underline cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* Sliders */}
              <div className="flex flex-col gap-2.5">
                {/* Avatar Overlap / Housing */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] text-secondary-text">
                    <span>Avatar Housing (Overlap)</span>
                    <span className="font-mono text-foreground">{tuning.avatarOverlap}px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    value={tuning.avatarOverlap}
                    onChange={(e) => setTuning((p) => ({ ...p, avatarOverlap: Number(e.target.value) }))}
                    className="accent-primary w-full h-1.5 bg-subtle rounded-lg cursor-pointer"
                  />
                </div>

                {/* Avatar Size */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] text-secondary-text">
                    <span>Avatar Size</span>
                    <span className="font-mono text-foreground">{tuning.avatarSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="150"
                    value={tuning.avatarSize}
                    onChange={(e) => setTuning((p) => ({ ...p, avatarSize: Number(e.target.value) }))}
                    className="accent-primary w-full h-1.5 bg-subtle rounded-lg cursor-pointer"
                  />
                </div>

                {/* Notch Width */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] text-secondary-text">
                    <span>Notch Curvature Width</span>
                    <span className="font-mono text-foreground">{tuning.notchWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="220"
                    value={tuning.notchWidth}
                    onChange={(e) => setTuning((p) => ({ ...p, notchWidth: Number(e.target.value) }))}
                    className="accent-primary w-full h-1.5 bg-subtle rounded-lg cursor-pointer"
                  />
                </div>

                {/* Notch Depth */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] text-secondary-text">
                    <span>Notch Curvature Depth</span>
                    <span className="font-mono text-foreground">{tuning.notchDepth}px</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="75"
                    value={tuning.notchDepth}
                    onChange={(e) => setTuning((p) => ({ ...p, notchDepth: Number(e.target.value) }))}
                    className="accent-primary w-full h-1.5 bg-subtle rounded-lg cursor-pointer"
                  />
                </div>

                {/* Cradle Gap / Breathing Room */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] text-secondary-text">
                    <span>Cradle Gap (Concentric Arc)</span>
                    <span className="font-mono text-foreground">{tuning.cradleGap}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="16"
                    value={tuning.cradleGap}
                    onChange={(e) => setTuning((p) => ({ ...p, cradleGap: Number(e.target.value) }))}
                    className="accent-primary w-full h-1.5 bg-subtle rounded-lg cursor-pointer"
                  />
                </div>

                {/* Shoulder Fillet Radius */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] text-secondary-text">
                    <span>Shoulder Fillet Radius</span>
                    <span className="font-mono text-foreground">{tuning.shoulderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="22"
                    value={tuning.shoulderRadius}
                    onChange={(e) => setTuning((p) => ({ ...p, shoulderRadius: Number(e.target.value) }))}
                    className="accent-primary w-full h-1.5 bg-subtle rounded-lg cursor-pointer"
                  />
                </div>

                {/* Circle Border Offset (0 = perfectly flush with borders) */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] text-secondary-text">
                    <span>Circle Border Offset</span>
                    <span className="font-mono text-foreground">
                      {tuning.cornerMargin === 0 ? "0px (flush)" : `${tuning.cornerMargin}px`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-4"
                    max="14"
                    value={tuning.cornerMargin}
                    onChange={(e) => setTuning((p) => ({ ...p, cornerMargin: Number(e.target.value) }))}
                    className="accent-primary w-full h-1.5 bg-subtle rounded-lg cursor-pointer"
                  />
                </div>

                {/* Close Button Size */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] text-secondary-text">
                    <span>Circle Size (Radius: {tuning.closeSize / 2}px)</span>
                    <span className="font-mono text-foreground">{tuning.closeSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="26"
                    max="42"
                    value={tuning.closeSize}
                    onChange={(e) => setTuning((p) => ({ ...p, closeSize: Number(e.target.value) }))}
                    className="accent-primary w-full h-1.5 bg-subtle rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => setShowTuning((v) => !v)}
            title={showTuning ? "Hide tuning controls" : "Show tuning controls"}
            className="size-9 rounded-full bg-card/95 backdrop-blur-md border border-border shadow-xs hover:bg-muted text-secondary-text hover:text-foreground flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <HugeiconsIcon icon={Settings02Icon} size={16} />
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}
