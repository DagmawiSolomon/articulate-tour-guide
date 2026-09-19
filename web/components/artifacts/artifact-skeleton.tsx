"use client";

import * as React from "react";
import { type ArtifactType } from "./artifact-stage";

interface ArtifactSkeletonProps {
  artifactType: ArtifactType;
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

function InfoSkeleton() {
  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      <div className="lg:col-span-7 h-full flex flex-col items-center justify-center">
        <Shimmer className="w-full h-[340px] sm:h-[380px] lg:h-full max-h-[480px] 2xl:max-h-[540px] rounded-xl" />
      </div>
      <div className="lg:col-span-5 flex flex-col justify-center">
        <div className="rounded-xl border border-border bg-card shadow-xs p-4 space-y-4">
          <Shimmer className="h-5 w-3/4 rounded-md" />
          <Shimmer className="h-3 w-1/2 rounded-md" />
          <div className="space-y-2 pt-1">
            <Shimmer className="h-3 w-full rounded-md" />
            <Shimmer className="h-3 w-full rounded-md" />
          </div>
          <Shimmer className="h-px w-full rounded-none" />
          <div className="space-y-1.5">
            <Shimmer className="h-3 w-full rounded-md" />
            <Shimmer className="h-3 w-5/6 rounded-md" />
            <Shimmer className="h-3 w-4/6 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      <div className="lg:col-span-7 h-full flex flex-col items-center justify-center">
        <div className="w-full h-[340px] sm:h-[380px] lg:h-full max-h-[480px] 2xl:max-h-[540px] rounded-xl border border-border bg-card p-4 flex flex-col items-center justify-center gap-4">
          <Shimmer className="w-full h-3/4 rounded-lg" />
          <Shimmer className="h-5 w-1/2 rounded-full" />
        </div>
      </div>
      <div className="lg:col-span-5 flex flex-col justify-center">
        <div className="rounded-xl border border-border bg-card shadow-xs p-4 space-y-4">
          <Shimmer className="h-4 w-20 rounded-full" />
          <Shimmer className="h-5 w-2/3 rounded-md" />
          <div className="space-y-2">
            <Shimmer className="h-3 w-full rounded-md" />
            <Shimmer className="h-3 w-4/5 rounded-md" />
          </div>
          <Shimmer className="h-px w-full rounded-none" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Shimmer className="size-5 rounded-full shrink-0" />
              <Shimmer className="h-3 flex-1 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonSkeleton() {
  return (
    <div className="w-full h-full flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Shimmer className="aspect-[4/3] w-full rounded-xl" />
            <Shimmer className="h-3 w-1/2 rounded-md" />
            <Shimmer className="h-2.5 w-2/3 rounded-md" />
          </div>
        ))}
      </div>
      <Shimmer className="h-px w-full rounded-none" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card shadow-xs p-3 space-y-2">
            <Shimmer className="h-2.5 w-16 rounded-md" />
            <Shimmer className="h-3 w-3/4 rounded-md" />
            <div className="space-y-1 pt-1">
              <Shimmer className="h-2.5 w-full rounded-md" />
              <Shimmer className="h-2.5 w-5/6 rounded-md" />
              <Shimmer className="h-2.5 w-4/6 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="w-full h-full flex flex-col justify-between gap-6">
      <div className="space-y-2">
        <Shimmer className="h-2.5 w-28 rounded-md" />
        <Shimmer className="h-6 w-3/4 rounded-md" />
        <Shimmer className="h-3 w-full rounded-md" />
        <Shimmer className="h-3 w-5/6 rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3 flex flex-col justify-between min-h-[120px]">
            <div className="space-y-1.5">
              <Shimmer className="h-3 w-10 rounded-md" />
              <Shimmer className="h-3 w-3/4 rounded-md" />
            </div>
            <div className="space-y-1 mt-2">
              <Shimmer className="h-2.5 w-full rounded-md" />
              <Shimmer className="h-2.5 w-4/5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card shadow-xs p-4 space-y-3">
        <Shimmer className="h-3 w-32 rounded-md" />
        <Shimmer className="h-4 w-2/3 rounded-md" />
        <div className="space-y-1.5">
          <Shimmer className="h-3 w-full rounded-md" />
          <Shimmer className="h-3 w-5/6 rounded-md" />
          <Shimmer className="h-3 w-4/6 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function HotspotsSkeleton() {
  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      <div className="lg:col-span-7 h-full flex flex-col items-center justify-center">
        <div className="relative w-full h-[340px] sm:h-[380px] lg:h-full max-h-[480px] 2xl:max-h-[540px] rounded-xl overflow-hidden border border-border">
          <Shimmer className="w-full h-full rounded-none" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="size-14 rounded-full border-2 border-muted-foreground/20" />
          </div>
        </div>
      </div>
      <div className="lg:col-span-5 flex flex-col justify-center">
        <div className="rounded-xl border border-border bg-card shadow-xs p-4 space-y-4">
          <Shimmer className="h-5 w-2/3 rounded-md" />
          <Shimmer className="h-3 w-1/3 rounded-md" />
          <div className="space-y-1.5 pt-1">
            <Shimmer className="h-3 w-full rounded-md" />
            <Shimmer className="h-3 w-5/6 rounded-md" />
            <Shimmer className="h-3 w-4/6 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 px-3 sm:px-4 py-3 flex flex-col gap-3.5">
        {/* Visitor bubble skeleton */}
        <div className="flex flex-col items-end gap-1 max-w-[85%] sm:max-w-[78%] ml-auto w-full">
          <Shimmer className="h-9 w-48 sm:w-60 rounded-2xl rounded-br-xs" />
          <Shimmer className="h-2 w-10 rounded-xs pr-1" />
        </div>
        {/* Agent bubble skeleton */}
        <div className="flex items-start gap-2.5 max-w-[90%] sm:max-w-[82%] w-full">
          <Shimmer className="size-7 rounded-full shrink-0 mt-0.5" />
          <div className="flex flex-col items-start gap-1 flex-1">
            <Shimmer className="h-16 w-full rounded-2xl rounded-bl-xs border border-border/40" />
            <Shimmer className="h-2 w-10 rounded-xs pl-1" />
          </div>
        </div>
        {/* Tool call badge skeleton */}
        <div className="flex justify-center py-0.5 w-full">
          <Shimmer className="h-7 w-48 rounded-lg" />
        </div>
        {/* Second agent bubble skeleton */}
        <div className="flex items-start gap-2.5 max-w-[90%] sm:max-w-[82%] w-full">
          <Shimmer className="size-7 rounded-full shrink-0 mt-0.5" />
          <div className="flex flex-col items-start gap-1 flex-1">
            <Shimmer className="h-12 w-4/5 rounded-2xl rounded-bl-xs border border-border/40" />
            <Shimmer className="h-2 w-10 rounded-xs pl-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuoteSkeleton() {
  return (
    <div className="w-full h-full flex flex-col justify-between gap-5 overflow-hidden">
      {/* Top bar shimmer */}
      <div className="flex items-center justify-between gap-2 shrink-0 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Shimmer className="size-6 rounded-md" />
          <Shimmer className="h-4 w-40 rounded-md" />
        </div>
        <Shimmer className="h-7 w-56 rounded-full" />
      </div>

      {/* Main two-zone stage shimmer */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 items-stretch">
        {/* Left parchment card */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-border/80 p-6 sm:p-8 bg-card shadow-xs">
          <div className="space-y-4">
            <Shimmer className="h-3 w-48 rounded-md" />
            <div className="space-y-2.5 pt-2">
              <Shimmer className="h-5 w-full rounded-md" />
              <Shimmer className="h-5 w-11/12 rounded-md" />
              <Shimmer className="h-5 w-4/5 rounded-md" />
            </div>
          </div>
          <div className="pt-4 border-t border-border/40 flex items-center justify-between">
            <Shimmer className="h-3.5 w-32 rounded-md" />
            <Shimmer className="size-7 rounded-md" />
          </div>
        </div>

        {/* Right attribution card */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-card border border-border p-5 shadow-xs space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <Shimmer className="h-4 w-20 rounded" />
              <Shimmer className="h-3 w-16 rounded" />
            </div>
            <div className="space-y-1.5">
              <Shimmer className="h-2.5 w-14 rounded" />
              <Shimmer className="h-4 w-32 rounded-md" />
              <Shimmer className="h-3 w-44 rounded-md" />
            </div>
            <Shimmer className="h-px w-full rounded-none" />
            <div className="space-y-1.5">
              <Shimmer className="h-2.5 w-24 rounded" />
              <Shimmer className="h-3 w-full rounded-md" />
              <Shimmer className="h-3 w-5/6 rounded-md" />
              <Shimmer className="h-3 w-4/6 rounded-md" />
            </div>
          </div>
          <div className="pt-3 border-t border-border/60 flex justify-between">
            <Shimmer className="h-3 w-36 rounded" />
            <Shimmer className="h-3 w-14 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArtifactSkeleton({ artifactType }: ArtifactSkeletonProps) {
  return (
    <div className="artifact-animate-in w-full h-full" aria-label="Loading artifact" aria-busy="true">
      {artifactType === "info" && <InfoSkeleton />}
      {artifactType === "map" && <MapSkeleton />}
      {artifactType === "comparison" && <ComparisonSkeleton />}
      {artifactType === "timeline" && <TimelineSkeleton />}
      {artifactType === "hotspots" && <HotspotsSkeleton />}
      {artifactType === "quote" && <QuoteSkeleton />}
      {artifactType === "chat" && <ChatSkeleton />}
    </div>
  );
}
