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

export function ArtifactSkeleton({ artifactType }: ArtifactSkeletonProps) {
  return (
    <div className="artifact-animate-in w-full h-full" aria-label="Loading artifact" aria-busy="true">
      {artifactType === "info" && <InfoSkeleton />}
      {artifactType === "map" && <MapSkeleton />}
      {artifactType === "comparison" && <ComparisonSkeleton />}
      {artifactType === "timeline" && <TimelineSkeleton />}
      {artifactType === "hotspots" && <HotspotsSkeleton />}
    </div>
  );
}
