"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { ArticulateAvatar } from "@/components/avatar/articulate-avatar";
import {
  EXPRESSIONS_CATALOG,
  type ExpressionId,
} from "@/components/avatar/avatar-expressions";

export default function Home() {
  const [isTopLeft, setIsTopLeft] = React.useState(false);
  const [activeExpressionId, setActiveExpressionId] = React.useState<ExpressionId>("listening");

  // Automatically cycle through key tour guide states
  React.useEffect(() => {
    const cycleStates: ExpressionId[] = [
      "listening",
      "thinking",
      "speaking",
      "excited",
      "curious",
      "interested",
      "shy",
    ];

    const stateInterval = setInterval(() => {
      setActiveExpressionId((prev) => {
        const idx = cycleStates.indexOf(prev);
        const nextIdx = idx === -1 ? 0 : (idx + 1) % cycleStates.length;
        return cycleStates[nextIdx];
      });
    }, 3400);

    return () => clearInterval(stateInterval);
  }, []);

  const activeExpression =
    EXPRESSIONS_CATALOG.find((e) => e.id === activeExpressionId) ??
    EXPRESSIONS_CATALOG[0];

  const isListening = activeExpressionId === "listening";
  const isThinking = activeExpressionId === "thinking";
  const isSpeaking = activeExpressionId === "speaking";

  return (
    <main className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden select-none relative">
      {/* Group Container */}
      <div className="relative w-full max-w-4xl min-h-[440px] flex items-center justify-center">
        {/* Mr. Triangle Avatar: Geometry stays 100% constant across every emotion */}
        <ArticulateAvatar
          expressionId={activeExpressionId}
          size={220}
          isDocked={isTopLeft}
          onClick={() => setIsTopLeft((prev) => !prev)}
          isListening={isListening}
        />

        {/* Text & indicator below blob when in center mode */}
        {!isTopLeft && (
          <div className="absolute top-[calc(50%+126px)] left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none transition-all duration-300 z-10">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground tracking-[-0.1px] bg-card/85 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-border shadow-xs">
              {isListening && <span>Listening...</span>}

              {isThinking && (
                <>
                  <HugeiconsIcon
                    icon={SparklesIcon}
                    size={14}
                    className="text-secondary-text animate-spin [animation-duration:4s]"
                  />
                  <span>Thinking...</span>
                </>
              )}

              {isSpeaking && (
                <>
                  <div className="flex items-center gap-[2.5px] h-3.5 px-0.5">
                    <span className="w-[2.5px] h-full bg-primary rounded-full animate-[speaking-bar_0.7s_ease-in-out_infinite_alternate]" />
                    <span className="w-[2.5px] h-full bg-primary rounded-full animate-[speaking-bar_1.05s_ease-in-out_infinite_alternate_0.2s]" />
                    <span className="w-[2.5px] h-full bg-primary rounded-full animate-[speaking-bar_0.6s_ease-in-out_infinite_alternate_0.4s]" />
                    <span className="w-[2.5px] h-full bg-primary rounded-full animate-[speaking-bar_0.9s_ease-in-out_infinite_alternate_0.15s]" />
                  </div>
                  <span>Speaking...</span>
                </>
              )}

              {!isListening && !isThinking && !isSpeaking && (
                <>
                  <span className="text-secondary-text">Expression:</span>
                  <span className="font-semibold text-foreground">{activeExpression.label}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Empty Cards in the Group: Reveal in top-left mode, hide in center mode */}
        <div
          className={`w-full flex flex-col gap-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isTopLeft
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-6 pointer-events-none"
          }`}
        >
          {/* Top Row: Empty card reserving room for top-left avatar */}
          <div className="flex items-center pl-[78px] h-[68px]">
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
      </div>
    </main>
  );
}
