"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MicOff01Icon,
  Mic01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { ArticulateAvatar } from "@/components/avatar/articulate-avatar";
import {
  EXPRESSIONS_CATALOG,
  type ExpressionId,
} from "@/components/avatar/avatar-expressions";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  const [isTopLeft, setIsTopLeft] = React.useState(false);
  const [isCallActive, setIsCallActive] = React.useState(false);
  const [activeExpressionId, setActiveExpressionId] = React.useState<ExpressionId>("neutral");
  const [isMuted, setIsMuted] = React.useState(false);

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

  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-between overflow-hidden select-none relative">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 relative flex items-center justify-center">
        {/* Main Stage: Avatar, Status Text, and Media Control Dock centered directly in the screen */}
        <div
          className={`flex flex-col items-center justify-center gap-4 z-20 transition-opacity duration-300 ${
            isTopLeft ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
          }`}
        >
          {/* Mr. Triangle Avatar: Geometry stays 100% constant across every emotion */}
          <ArticulateAvatar
            expressionId={activeExpressionId}
            size={280}
            onClick={() => setIsTopLeft(true)}
            isListening={isListening}
          />

          {/* Text indicator & Control bar */}
          <div className="flex flex-col items-center gap-3 w-full max-w-[340px] px-2">
            {/* Status Text (clean, no pill) */}
            <div className="h-5 flex items-center justify-center whitespace-nowrap pointer-events-none">
              {(isListening || isThinking || isSpeaking) && (
                <div className="flex items-center gap-2 text-sm font-medium text-secondary-text tracking-[-0.1px] transition-all">
                  {isListening && <span>Listening...</span>}
                  {isThinking && <span>Thinking...</span>}

                  {isSpeaking && (
                    <>
                      <div className="flex items-center gap-[2.5px] h-3.5 px-0.5">
                        <span className="w-[2.5px] h-full bg-secondary-text rounded-full animate-[speaking-bar_0.7s_ease-in-out_infinite_alternate]" />
                        <span className="w-[2.5px] h-full bg-secondary-text rounded-full animate-[speaking-bar_1.05s_ease-in-out_infinite_alternate_0.2s]" />
                        <span className="w-[2.5px] h-full bg-secondary-text rounded-full animate-[speaking-bar_0.6s_ease-in-out_infinite_alternate_0.4s]" />
                        <span className="w-[2.5px] h-full bg-secondary-text rounded-full animate-[speaking-bar_0.9s_ease-in-out_infinite_alternate_0.15s]" />
                      </div>
                      <span>Speaking...</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Media Control Dock (centered) */}
            <div className="flex items-center justify-center transition-all">
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
        </div>

        {/* Empty Cards in the Group: Reveal in top-left mode, hide in center mode */}
        {isTopLeft && (
          <div className="absolute inset-0 max-w-4xl mx-auto p-6 md:p-10 flex flex-col justify-center gap-4 z-30 bg-background/95 backdrop-blur-xs">
            {/* Top Row: Empty card reserving room for top-left avatar */}
            <div className="flex items-center gap-3.5 h-[68px]">
              <div className="size-[68px] shrink-0 flex items-center justify-center">
                <ArticulateAvatar
                  expressionId={activeExpressionId}
                  size={220}
                  isDocked={true}
                  onClick={() => setIsTopLeft(false)}
                  isListening={isListening}
                />
              </div>
              <Card className="flex-1 h-full rounded-2xl border border-border bg-card shadow-xs" />
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="h-52 md:col-span-2 rounded-2xl border border-border bg-card shadow-xs" />
              <Card className="h-52 rounded-2xl border border-border bg-card shadow-xs" />
              <Card className="h-36 rounded-2xl border border-border bg-card shadow-xs" />
              <Card className="h-36 md:col-span-2 rounded-2xl border border-border bg-card shadow-xs" />
            </div>
          </div>
        )}
      </main>

    <Footer />
  </div>
);
}
