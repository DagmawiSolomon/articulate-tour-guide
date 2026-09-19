"use client";

import * as React from "react";
import { type ArtifactType } from "./artifact-stage";
import LoadingState from "../beautiful-ui/LoadingState";

/* ─────────────────────────────────────────────────────────
 * ARTIFACT SKELETON
 *
 * Layout-matched loading skeletons for every artifact type.
 * The shimmer blocks mirror the grid / flex geometry of the
 * live artifact so there is no layout shift when real content
 * loads in. See AGENTS.md Skeleton Sync rule.
 *
 * Now uses the BUI #01 LoadingState pixel-grid loader
 * as the centrepiece indicator in each skeleton.
 * ───────────────────────────────────────────────────────── */

interface ArtifactSkeletonProps {
  artifactType: ArtifactType;
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-lg ${className ?? ""}`}
      style={{
        background: "var(--inset)",
        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }}
      aria-hidden="true"
    />
  );
}

// Centred BUI LoadingState overlay for image/map zones
function LoadingOverlay({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <LoadingState label={label} active showTimer={false} />
    </div>
  );
}

/* ── Info ──────────────────────────────────────────────── */
function InfoSkeleton() {
  return (
    <div
      className="flex flex-col lg:flex-row w-full h-full max-w-4xl mx-auto overflow-hidden p-0 gap-6 lg:gap-10 shadow-none border-none bg-transparent items-center justify-center"
    >
      {/* Image zone */}
      <div className="relative w-full lg:w-1/2 h-[280px] sm:h-[320px] lg:h-[400px] shrink-0 rounded-2xl overflow-hidden" style={{ background: "var(--inset)" }}>
        <LoadingOverlay label="Loading artwork" />
      </div>

      {/* Info card zone */}
      <div className="flex flex-col w-full lg:w-1/2 overflow-y-auto py-2 justify-center">
        <div className="space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2 flex-1">
              <Shimmer className="h-6 w-3/4" />
              <Shimmer className="h-4 w-1/2" />
            </div>
            <Shimmer className="h-6 w-16 rounded-full shrink-0" />
          </div>
          
          <div className="space-y-2 pt-2">
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-full" />
          </div>

          <Shimmer className="h-px w-full rounded-none my-2" />

          <div className="space-y-2">
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-5/6" />
            <Shimmer className="h-3 w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Map ──────────────────────────────────────────────── */
function MapSkeleton() {
  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      <div className="lg:col-span-7 h-full flex flex-col items-center justify-center">
        <div
          className="relative w-full h-[340px] sm:h-[380px] lg:h-full max-h-[480px] 2xl:max-h-[540px] rounded-xl overflow-hidden flex flex-col items-center justify-center gap-4 p-4"
          style={{ border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--shadow-card)" }}
        >
          <Shimmer className="w-full h-3/4 rounded-lg" />
          <Shimmer className="h-5 w-1/2 rounded-full" />
        </div>
      </div>
      <div className="lg:col-span-5 flex flex-col justify-center">
        <div
          className="rounded-xl p-4 space-y-4"
          style={{ border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--shadow-card)" }}
        >
          <Shimmer className="h-4 w-20 rounded-full" />
          <Shimmer className="h-5 w-2/3" />
          <div className="space-y-2">
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-4/5" />
          </div>
          <Shimmer className="h-px w-full rounded-none" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Shimmer className="size-5 rounded-full shrink-0" />
              <Shimmer className="h-3 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Comparison ───────────────────────────────────────── */
function ComparisonSkeleton() {
  return (
    <div className="w-full h-full flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Shimmer className="aspect-[4/3] w-full rounded-xl" />
            <Shimmer className="h-3 w-1/2" />
            <Shimmer className="h-2.5 w-2/3" />
          </div>
        ))}
      </div>
      <Shimmer className="h-px w-full rounded-none" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl p-3 space-y-2"
            style={{ border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--shadow-card)" }}
          >
            <Shimmer className="h-2.5 w-16" />
            <Shimmer className="h-3 w-3/4" />
            <div className="space-y-1 pt-1">
              <Shimmer className="h-2.5 w-full" />
              <Shimmer className="h-2.5 w-5/6" />
              <Shimmer className="h-2.5 w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Timeline ─────────────────────────────────────────── */
function TimelineSkeleton() {
  return (
    <div className="w-full h-full flex flex-col justify-between gap-6">
      <div className="space-y-2">
        <Shimmer className="h-2.5 w-28" />
        <Shimmer className="h-6 w-3/4" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-5/6" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg p-3 flex flex-col justify-between min-h-[120px]"
            style={{ border: "1px solid var(--line)", background: "var(--surface)" }}
          >
            <div className="space-y-1.5">
              <Shimmer className="h-3 w-10" />
              <Shimmer className="h-3 w-3/4" />
            </div>
            <div className="space-y-1 mt-2">
              <Shimmer className="h-2.5 w-full" />
              <Shimmer className="h-2.5 w-4/5" />
            </div>
          </div>
        ))}
      </div>
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--shadow-card)" }}
      >
        <Shimmer className="h-3 w-32" />
        <Shimmer className="h-4 w-2/3" />
        <div className="space-y-1.5">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-5/6" />
          <Shimmer className="h-3 w-4/6" />
        </div>
      </div>
    </div>
  );
}

/* ── Hotspots ─────────────────────────────────────────── */
function HotspotsSkeleton() {
  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      <div className="lg:col-span-7 h-full flex flex-col items-center justify-center">
        <div
          className="relative w-full h-[340px] sm:h-[380px] lg:h-full max-h-[480px] 2xl:max-h-[540px] rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--line)", background: "var(--inset)" }}
        >
          <Shimmer className="w-full h-full rounded-none" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="size-14 rounded-full border-2"
              style={{ borderColor: "var(--line-strong)" }}
            />
          </div>
        </div>
      </div>
      <div className="lg:col-span-5 flex flex-col justify-center">
        <div
          className="rounded-xl p-4 space-y-4"
          style={{ border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--shadow-card)" }}
        >
          <Shimmer className="h-5 w-2/3" />
          <Shimmer className="h-3 w-1/3" />
          <div className="space-y-1.5 pt-1">
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-5/6" />
            <Shimmer className="h-3 w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Chat — matches ChatHistoryView geometry exactly ─── */
function ChatSkeleton() {
  return (
    <div
      className="flex h-full w-full flex-col self-start overflow-hidden rounded-[14px]"
      style={{ background: "var(--surface)", boxShadow: "var(--shadow-card)" }}
    >
      {/* Conversation thread — mirrors ChatHistoryView gap-3 px-3 pt-3 pb-2 */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-3 pt-3 pb-2">
        {/* Visitor bubble with "You" header */}
        <div className="flex flex-col items-end gap-1 pl-12">
          <div className="flex items-center gap-1.5 px-1 pb-0.5">
            <Shimmer className="h-3 w-8 rounded" />
            <Shimmer className="h-3.5 w-6 rounded" />
          </div>
          <Shimmer className="h-7 w-48 sm:w-60 rounded-xl" />
        </div>

        {/* Agent message — unboxed prose with metadata header */}
        <div className="flex w-full flex-col gap-1.5">
          <div className="flex items-center gap-1.5 px-1 pb-1">
            <Shimmer className="h-3.5 w-20 rounded" />
            <Shimmer className="h-3 w-10 rounded" />
          </div>
          <Shimmer className="h-4 w-full rounded" />
          <Shimmer className="h-4 w-4/5 rounded" />
        </div>

        {/* Tool chip skeleton */}
        <div className="w-full py-0.5">
          <Shimmer className="h-12 w-full rounded-xl" />
        </div>

        {/* Agent message 2 */}
        <div className="flex w-full flex-col gap-1.5">
          <div className="flex items-center gap-1.5 px-1 pb-1">
            <Shimmer className="h-3.5 w-20 rounded" />
            <Shimmer className="h-3 w-10 rounded" />
            <Shimmer className="h-4 w-16 rounded-full" />
          </div>
          <Shimmer className="h-4 w-5/6 rounded" />
          <Shimmer className="h-4 w-2/3 rounded" />
        </div>
      </div>
    </div>
  );
}

/* ── Quote ────────────────────────────────────────────── */
function QuoteSkeleton() {
  return (
    <div className="w-full h-full flex flex-col justify-between gap-5 overflow-hidden">
      {/* Top bar */}
      <div
        className="flex items-center justify-between gap-2 shrink-0 pb-3"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <div className="flex items-center gap-2">
          <Shimmer className="size-6 rounded-md" />
          <Shimmer className="h-4 w-40 rounded-md" />
        </div>
        <Shimmer className="h-7 w-56 rounded-full" />
      </div>

      {/* Two-zone stage */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 items-stretch">
        {/* Left parchment */}
        <div
          className="lg:col-span-7 flex flex-col justify-between rounded-2xl p-6 sm:p-8"
          style={{ border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="space-y-4">
            <Shimmer className="h-3 w-48" />
            <div className="space-y-2.5 pt-2">
              <Shimmer className="h-5 w-full" />
              <Shimmer className="h-5 w-11/12" />
              <Shimmer className="h-5 w-4/5" />
            </div>
          </div>
          <div
            className="pt-4 flex items-center justify-between"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            <Shimmer className="h-3.5 w-32" />
            <Shimmer className="size-7 rounded-md" />
          </div>
        </div>

        {/* Right attribution */}
        <div
          className="lg:col-span-5 flex flex-col justify-between rounded-2xl p-5 space-y-4"
          style={{ border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <Shimmer className="h-4 w-20 rounded" />
              <Shimmer className="h-3 w-16 rounded" />
            </div>
            <div className="space-y-1.5">
              <Shimmer className="h-2.5 w-14 rounded" />
              <Shimmer className="h-4 w-32" />
              <Shimmer className="h-3 w-44" />
            </div>
            <Shimmer className="h-px w-full rounded-none" />
            <div className="space-y-1.5">
              <Shimmer className="h-2.5 w-24 rounded" />
              <Shimmer className="h-3 w-full" />
              <Shimmer className="h-3 w-5/6" />
              <Shimmer className="h-3 w-4/6" />
            </div>
          </div>
          <div
            className="pt-3 flex justify-between"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            <Shimmer className="h-3 w-36 rounded" />
            <Shimmer className="h-3 w-14 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Export ───────────────────────────────────────────── */

export function ArtifactSkeleton({ artifactType }: ArtifactSkeletonProps) {
  return (
    <div className="artifact-animate-in w-full h-full" aria-label="Loading artifact" aria-busy="true">
      {artifactType === "info"       && <InfoSkeleton />}
      {artifactType === "map"        && <MapSkeleton />}
      {artifactType === "comparison" && <ComparisonSkeleton />}
      {artifactType === "timeline"   && <TimelineSkeleton />}
      {artifactType === "hotspots"   && <HotspotsSkeleton />}
      {artifactType === "quote"      && <QuoteSkeleton />}
      {artifactType === "chat"       && <ChatSkeleton />}
    </div>
  );
}
