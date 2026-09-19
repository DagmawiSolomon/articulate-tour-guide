"use client";

import * as React from "react";
import { ArtworkInfoCard } from "./artwork-info-card";
import { GalleryMapView } from "./gallery-map-view";
import { ComparisonView } from "./comparison-view";
import { TimelineView } from "./timeline-view";
import { DetailHotspotsView } from "./detail-hotspots-view";
import { ArtifactSkeleton } from "./artifact-skeleton";

export type ArtifactType = "info" | "map" | "comparison" | "timeline" | "hotspots";

interface ArtifactStageProps {
  artifactType: ArtifactType;
  mapRouteId?: "restrooms" | "gauguin" | "elevator";
  hotspotId?: "cypress" | "star" | "steeple";
  /** When true renders a layout-matched skeleton in place of the real artifact.
   *  Flip to true on tool.call, back to false on tool.result. */
  isLoading?: boolean;
}

export function ArtifactStage({
  artifactType,
  mapRouteId = "restrooms",
  hotspotId = "cypress",
  isLoading = false,
}: ArtifactStageProps) {
  return (
    <div className="w-full h-full overflow-hidden">
      {/*
        key={artifactType} forces React to unmount + remount this div every
        time the artifact changes, which restarts the CSS animation on mount.
        No JS animation library needed — pure CSS @keyframes artifactIn.
      */}
      <div key={artifactType} className="artifact-animate-in w-full h-full">
        {isLoading ? (
          <ArtifactSkeleton artifactType={artifactType} />
        ) : (
          <>
            {artifactType === "info" && <ArtworkInfoCard />}
            {artifactType === "map" && <GalleryMapView activeRouteId={mapRouteId} />}
            {artifactType === "comparison" && <ComparisonView />}
            {artifactType === "timeline" && <TimelineView />}
            {artifactType === "hotspots" && <DetailHotspotsView activeHotspotId={hotspotId} />}
          </>
        )}
      </div>
    </div>
  );
}

