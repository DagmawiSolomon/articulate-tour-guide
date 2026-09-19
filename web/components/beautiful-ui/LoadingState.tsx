"use client";

import * as React from "react";

/* ─────────────────────────────────────────────────────────
 * LOADING STATE — BUI #01 pixel-grid loader
 *
 * 3×3 grid of pixels with staggered pixel-on keyframe
 * animation, a shimmer text label, and an elapsed timer.
 * Direct implementation of the BeautifulUI Loading State
 * primitive, adapted to Articulate's token set.
 * ───────────────────────────────────────────────────────── */

const PIXEL_DELAYS = [90, 180, 270, 0, 90, 180, 90, 180, 270];

function useElapsedTime(active: boolean) {
  const [elapsed, setElapsed] = React.useState(0);
  const startRef = React.useRef<number | null>(null);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!active) {
      setElapsed(0);
      startRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    startRef.current = performance.now();
    const tick = () => {
      setElapsed(
        startRef.current ? (performance.now() - startRef.current) / 1000 : 0
      );
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  return elapsed;
}

export interface LoadingStateProps {
  label?: string;
  active?: boolean;
  className?: string;
}

export default function LoadingState({
  label = "Loading",
  active = true,
  className = "",
}: LoadingStateProps) {
  const elapsed = useElapsedTime(active);

  return (
    <div role="status" className={`flex w-fit items-center gap-2.5 ${className}`}>
      {/* 3×3 pixel grid */}
      <span
        aria-hidden="true"
        className="grid shrink-0 grid-cols-[repeat(3,4px)] gap-[1.5px]"
      >
        {PIXEL_DELAYS.map((delay, i) => (
          <span
            key={i}
            className="size-[4px] rounded-[1px] bg-ink"
            style={{
              opacity: 0.15,
              animation: `pixel-on 650ms ease-in-out ${delay}ms infinite`,
            }}
          />
        ))}
      </span>

      {/* Shimmer label */}
      <span
        className="bg-clip-text text-[13px] font-medium text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--ink-3) 35%, var(--ink) 50%, var(--ink-3) 65%)",
          backgroundSize: "200% 100%",
          animation: "shimmer-text 1.4s linear infinite",
        }}
      >
        {label}
      </span>

      {/* Elapsed timer */}
      <span className="font-mono text-[12px] text-ink-3 tabular-nums">
        {elapsed.toFixed(1)}s
      </span>
    </div>
  );
}
