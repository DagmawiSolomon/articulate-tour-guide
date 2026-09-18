"use client";

import * as React from "react";
import { ArtworkInfoCard } from "./artwork-info-card";
import { GalleryMapView } from "./gallery-map-view";
import { ComparisonView } from "./comparison-view";
import { TimelineView } from "./timeline-view";
import { DetailHotspotsView } from "./detail-hotspots-view";

export type ArtifactType = "info" | "map" | "comparison" | "timeline" | "hotspots";

interface ArtifactStageProps {
  artifactType: ArtifactType;
  mapRouteId?: "restrooms" | "gauguin" | "elevator";
  hotspotId?: "cypress" | "star" | "steeple";
}

export function ArtifactStage({
  artifactType,
  mapRouteId = "restrooms",
  hotspotId = "cypress",
}: ArtifactStageProps) {
  return (
    <div className="w-full h-full">
      {artifactType === "info" && <ArtworkInfoCard />}
      {artifactType === "map" && <GalleryMapView activeRouteId={mapRouteId} />}
      {artifactType === "comparison" && <ComparisonView />}
      {artifactType === "timeline" && <TimelineView />}
      {artifactType === "hotspots" && <DetailHotspotsView activeHotspotId={hotspotId} />}
    </div>
  );
}
