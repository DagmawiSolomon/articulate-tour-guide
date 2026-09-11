"use client";

import * as React from "react";

export function Footer() {
  return (
    <footer className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-secondary-text z-30 select-none">
      {/* Left: Made by with brand name in small letter */}
      <div>
        Made by{" "}
        <span className="font-semibold text-foreground tracking-[-0.1px]">
          articulate
        </span>
      </div>

      {/* Right: Powered by with brand name in small letter, readable gray link color, always underlined */}
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
