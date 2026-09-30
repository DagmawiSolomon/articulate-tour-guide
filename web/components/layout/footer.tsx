"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "relative z-[4] mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 text-xs text-secondary-text select-none sm:px-6",
        className
      )}
    >
      {/* Left: Made by with author name */}
      <div>
        Made by{" "}
        <span className="font-semibold text-foreground tracking-[-0.1px]">
          Dagmawi Solomon
        </span>
      </div>

      {/* Right: Powered by with brand name */}
      <div>
        Powered by{" "}
        <a
          href="https://www.assemblyai.com"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-zinc-600 hover:text-black underline underline-offset-3 decoration-current/80 transition-colors"
        >
          assemblyai
        </a>
      </div>
    </footer>
  );
}
