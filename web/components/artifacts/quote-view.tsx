"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  VolumeHighIcon,
  Copy01Icon,
  Tick02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { VANGOGH_LETTERS, type VanGoghLetter } from "@/lib/demo-tour-data";

interface QuoteViewProps {
  activeLetterId?: "letter-782" | "letter-cypress" | "letter-stars";
  onLetterChange?: (id: "letter-782" | "letter-cypress" | "letter-stars") => void;
}

export function QuoteView({
  activeLetterId = "letter-782",
  onLetterChange,
}: QuoteViewProps) {
  const [selectedId, setSelectedId] = React.useState<"letter-782" | "letter-cypress" | "letter-stars">(activeLetterId);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setSelectedId(activeLetterId);
  }, [activeLetterId]);

  const letter: VanGoghLetter = VANGOGH_LETTERS[selectedId] || VANGOGH_LETTERS["letter-782"];

  const handleSelect = (id: "letter-782" | "letter-cypress" | "letter-stars") => {
    setSelectedId(id);
    onLetterChange?.(id);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${letter.excerpt}\n— Vincent van Gogh to ${letter.recipient}, ${letter.date} (${letter.letterRef})`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-between gap-5 overflow-hidden">
      {/* Top Bar: Letter Selector Tabs */}
      <div className="flex items-center justify-between gap-2 shrink-0 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-muted text-foreground">
            <HugeiconsIcon icon={SparklesIcon} size={13} />
          </span>
          <span className="text-xs font-semibold tracking-tight text-foreground">
            Van Gogh Letters Archive
          </span>
          <span className="hidden sm:inline-flex rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-border/60">
            Primary Source
          </span>
        </div>

        {/* Letter Selector Pills */}
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-full border border-border/40">
          {(["letter-782", "letter-cypress", "letter-stars"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => handleSelect(id)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                selectedId === id
                  ? "bg-card text-foreground shadow-2xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {id === "letter-782" ? "Morning Star" : id === "letter-cypress" ? "Cypresses" : "Dreaming"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Zone Stage */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 items-stretch">
        {/* Left Zone (7 cols): Archival Letter Fragment with Parchment Aesthetics */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl bg-[#faf7f2] dark:bg-[#191816] border border-[#e8e2d5] dark:border-border/60 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          {/* Subtle Decorative Archival Seal */}
          <div className="absolute top-4 right-5 select-none pointer-events-none opacity-25 dark:opacity-10 text-[64px] font-serif leading-none text-muted-foreground">
            &ldquo;
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Saint-Rémy-de-Provence · Original Dispatch
              </span>
            </div>

            {/* Serif Excerpt */}
            <blockquote className="font-serif text-lg sm:text-xl md:text-2xl italic leading-relaxed text-foreground tracking-normal">
              {letter.excerpt}
            </blockquote>
          </div>

          {/* Letter Footer Controls */}
          <div className="pt-4 border-t border-[#ede7db] dark:border-border/40 flex items-center justify-between text-xs text-muted-foreground relative z-10 mt-4">
            <span className="font-serif italic text-xs sm:text-sm">
              — Vincent to {letter.recipient}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopy}
                title="Copy citation"
                className="inline-flex size-7 items-center justify-center rounded-md bg-card/80 hover:bg-card border border-border/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    <HugeiconsIcon icon={Tick02Icon} size={13} />
                  </span>
                ) : (
                  <HugeiconsIcon icon={Copy01Icon} size={13} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Zone (5 cols): Context & Attribution Card */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-card border border-border p-5 shadow-xs space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-foreground bg-muted px-2 py-0.5 rounded border border-border/60">
                {letter.letterRef.split("(")[0].trim()}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {letter.date}
              </span>
            </div>

            {/* Recipient info */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                Recipient
              </span>
              <p className="text-sm font-medium text-foreground">
                {letter.recipient}
              </p>
              <p className="text-xs text-muted-foreground">
                {letter.location}
              </p>
            </div>

            <div className="h-px w-full bg-border/60" />

            {/* Historical Context */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                Curatorial Insight
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {letter.context}
              </p>
            </div>
          </div>

          {/* Archival Provenance Citation */}
          <div className="pt-3 border-t border-border/60">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Van Gogh Museum Archive</span>
              <span className="font-mono text-[10px]">Amsterdam</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
