"use client";

import * as React from "react";
import { type ArtifactType } from "./artifact-stage";

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



/* ── Info ──────────────────────────────────────────────── */
function InfoSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="relative w-full max-w-[780px] rounded-2xl border border-border/70 shadow-xs flex flex-col lg:flex-row overflow-hidden">
        {/* Left side: Image shimmer (equal 50% size, matching border) */}
        <div className="w-full lg:w-1/2 h-[320px] sm:h-[360px] lg:h-[380px] border-b lg:border-b-0 lg:border-r border-border/50 overflow-hidden bg-muted/20 shrink-0">
          <Shimmer className="w-full h-full rounded-none" />
        </div>

        {/* Right side: Text Content shimmer (equal 50% size, matching border) */}
        <div className="w-full lg:w-1/2 h-auto p-4 sm:p-6 lg:p-7 flex flex-col justify-center space-y-3">
          {/* Title */}
          <Shimmer className="h-6 sm:h-7 w-3/4" />

          {/* Summary lines */}
          <div className="space-y-1.5 pt-0.5">
            <Shimmer className="h-2.5 w-full" />
            <Shimmer className="h-2.5 w-5/6" />
            <Shimmer className="h-2.5 w-4/6" />
          </div>

          <Shimmer className="h-px w-full rounded-none my-1" />

          {/* Key-Value Pairs */}
          <div className="space-y-2 pt-0.5">
            <div className="flex justify-between items-center pb-1 border-b border-border/30">
              <Shimmer className="h-3 w-14" />
              <Shimmer className="h-3 w-28" />
            </div>
            <div className="flex justify-between items-center pb-1 border-b border-border/30">
              <Shimmer className="h-3 w-12" />
              <Shimmer className="h-3 w-20" />
            </div>
            <div className="flex justify-between items-center pb-1 border-b border-border/30">
              <Shimmer className="h-3 w-16" />
              <Shimmer className="h-3 w-24" />
            </div>
            <div className="flex justify-between items-center">
              <Shimmer className="h-3 w-20" />
              <Shimmer className="h-3 w-32" />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-5">
            <Shimmer className="h-px w-full rounded-none mb-4" />
            <div className="flex items-center gap-2.5">
              <Shimmer className="h-9 w-24 rounded-full" />
              <Shimmer className="h-9 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Map ──────────────────────────────────────────────── */
function MapSkeleton() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#fafafa]">
      <div
        className="absolute inset-0 bg-center bg-contain bg-no-repeat"
        style={{ backgroundImage: "url('/museum-floorplan-base.png')" }}
        aria-hidden="true"
      />
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 rounded-lg border border-border/60 bg-card/85 p-1">
        <Shimmer className="size-7 rounded-md" />
        <Shimmer className="size-7 rounded-md" />
      </div>
    </div>
  );
}/* ── Comparison ───────────────────────────────────────── */
function ComparisonSkeleton() {
  return (
    <div className="w-full h-full flex flex-col justify-center overflow-hidden">
      <div className="flex flex-col md:flex-row w-full gap-4 overflow-hidden">
        
        <div className="flex flex-col w-full md:w-1/2">
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl">
            <Shimmer className="w-full h-full rounded-2xl" />
          </div>
          <div className="flex flex-col gap-1.5 p-3 pb-4">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-4 w-3/4" />
          </div>
        </div>
        
        <div className="flex flex-col w-full md:w-1/2">
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl">
            <Shimmer className="w-full h-full rounded-2xl" />
          </div>
          <div className="flex flex-col gap-1.5 p-3 pb-4">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-4 w-3/4" />
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Timeline ─────────────────────────────────────────── */
function TimelineSkeleton() {
  return (
    <div className="relative w-full h-full overflow-hidden select-none flex items-center justify-center">
      {/* Horizontal Alternating Timeline Track — Perfectly Centered Vertically */}
      <div className="w-full h-full overflow-hidden flex items-center py-2">
        <div className="relative w-full min-w-[1100px] flex items-center justify-between px-12">
          {/* Continuous Center Axis Line */}
          <div
            className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-[1.5px] bg-border pointer-events-none z-0"
            aria-hidden="true"
          />

          {/* 5 Milestone Skeletons */}
          {[0, 1, 2, 3, 4].map((i) => {
            const isTop = i % 2 === 0;
            return (
              <div
                key={i}
                className="relative z-10 w-[200px] flex flex-col items-center justify-center"
              >
                {/* TOP HALF — Symmetrical 148px */}
                <div className="h-[148px] w-full flex flex-col justify-end items-center pb-2 relative">
                  {isTop ? (
                    <div className="flex flex-col items-center">
                      <Shimmer className="w-20 h-20 rounded-full" />
                      <div className="flex flex-col items-center gap-1 mt-2">
                        <Shimmer className="h-3 w-10" />
                        <Shimmer className="h-3 w-20" />
                        <Shimmer className="h-2.5 w-24" />
                      </div>
                      <div className="w-[1.5px] h-3.5 border-l-2 border-dashed border-border mt-1" />
                    </div>
                  ) : null}
                </div>

                {/* CENTER AXIS NODE: Solid circle matching TimelineView */}
                <div className="h-[28px] w-full flex items-center justify-center relative">
                  <div
                    className={`rounded-full ${
                      i === 3 ? "w-4 h-4 bg-foreground" : "w-2.5 h-2.5 bg-border"
                    }`}
                  />
                </div>

                {/* BOTTOM HALF — Symmetrical 148px */}
                <div className="h-[148px] w-full flex flex-col justify-start items-center pt-2 relative">
                  {!isTop ? (
                    <div className="flex flex-col items-center">
                      <div className="w-[1.5px] h-3.5 border-l-2 border-dashed border-border mb-1" />
                      <div className="flex flex-col items-center gap-1 mb-2">
                        <Shimmer className="h-3 w-10" />
                        <Shimmer className="h-3 w-20" />
                        <Shimmer className="h-2.5 w-24" />
                      </div>
                      <Shimmer className="w-20 h-20 rounded-full" />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Hotspots ─────────────────────────────────────────── */
function HotspotsSkeleton() {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border/60 bg-muted/20 shadow-xs select-none">
      <Shimmer className="w-full h-full rounded-none" />

      {/* Shimmer pin circles matching hotspot positions */}
      <div className="absolute z-20 size-3.5 sm:size-4 -translate-x-1/2 -translate-y-1/2" style={{ left: "24%", top: "55%" }}>
        <Shimmer className="w-full h-full rounded-full" />
      </div>
      <div className="absolute z-20 size-3.5 sm:size-4 -translate-x-1/2 -translate-y-1/2" style={{ left: "63%", top: "44%" }}>
        <Shimmer className="w-full h-full rounded-full" />
      </div>
      <div className="absolute z-20 size-3.5 sm:size-4 -translate-x-1/2 -translate-y-1/2" style={{ left: "52%", top: "74%" }}>
        <Shimmer className="w-full h-full rounded-full" />
      </div>
      <div className="absolute z-20 size-3.5 sm:size-4 -translate-x-1/2 -translate-y-1/2" style={{ left: "46%", top: "28%" }}>
        <Shimmer className="w-full h-full rounded-full" />
      </div>
      <div className="absolute z-20 size-3.5 sm:size-4 -translate-x-1/2 -translate-y-1/2" style={{ left: "86%", top: "18%" }}>
        <Shimmer className="w-full h-full rounded-full" />
      </div>
    </div>
  );
}

/* ── Chat — matches ChatHistoryView geometry exactly ─── */
function ChatSkeleton() {
  return (
    <div
      className="relative flex h-full w-full lg:max-w-3xl xl:max-w-4xl mx-auto flex-col overflow-hidden"
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

/* ── Summary ──────────────────────────────────────────── */
function SummarySkeleton() {
  return (
    <div className="w-full h-full flex flex-col p-6 sm:p-8 overflow-hidden">
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <Shimmer className="h-4 w-28" />
          <Shimmer className="h-8 w-64 mt-2" />
          <Shimmer className="h-4 w-full max-w-md mt-1" />
        </div>

        {/* Bullets */}
        <div className="flex flex-col gap-3">
          <Shimmer className="h-16 w-full rounded-xl" />
          <Shimmer className="h-16 w-full rounded-xl" />
          <Shimmer className="h-16 w-full rounded-xl" />
        </div>

        <Shimmer className="h-px w-full rounded-none my-2" />

        {/* Quiz */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Shimmer className="h-6 w-48" />
            <Shimmer className="h-4 w-24" />
          </div>
          <div className="p-6 rounded-[16px] border border-border bg-card/50 flex flex-col gap-5">
            <Shimmer className="h-5 w-full" />
            <Shimmer className="h-5 w-3/4 mb-2" />
            
            <div className="flex flex-col gap-2.5">
              <Shimmer className="h-12 w-full rounded-xl" />
              <Shimmer className="h-12 w-full rounded-xl" />
              <Shimmer className="h-12 w-full rounded-xl" />
            </div>
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
      {artifactType === "summary"    && <SummarySkeleton />}
    </div>
  );
}
