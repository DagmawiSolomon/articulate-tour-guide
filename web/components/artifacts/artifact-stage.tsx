"use client";

import * as React from "react";
import { ArtworkInfoCard } from "./artwork-info-card";
import { GalleryMapView } from "./gallery-map-view";
import { ExhibitFloorMapView, type ExhibitArtworkInfo, type ExhibitNavigationState } from "./exhibit-floor-map-view";
import type { MapViewport } from "@/components/ui/map";
import { ComparisonView } from "./comparison-view";
import { TimelineView } from "./timeline-view";
import { DetailHotspotsView } from "./detail-hotspots-view";
import { ArtifactSkeleton } from "./artifact-skeleton";
import { ChatHistoryView, type ChatMessage } from "./chat-history-view";
import { QuoteView } from "./quote-view";
import { SummaryView } from "./summary-view";

export type ArtifactType = "info" | "map" | "comparison" | "timeline" | "hotspots" | "chat" | "quote" | "summary";
export type { ChatMessage };

interface ArtifactStageProps {
  artifactType: ArtifactType;
  originMapRouteId?: string;
  mapRouteId?: "restrooms" | "gauguin" | "elevator" | "garden" | "store" | string;
  mapDisplay?: "navigation" | "exhibition";
  selectedArtwork?: ExhibitArtworkInfo | null;
  onSelectArtwork?: (artwork: ExhibitArtworkInfo) => void;
  mapNavigation?: ExhibitNavigationState;
  onMapNavigationChange?: (state: ExhibitNavigationState) => void;
  mapViewport?: MapViewport;
  onMapViewportChange?: (viewport: MapViewport) => void;
  hotspotId?: "cypress" | "star" | "steeple" | "vortex" | "moon" | string;
  letterId?: "letter-782" | "letter-cypress" | "letter-stars";
  /** When true renders a layout-matched skeleton in place of the real artifact.
   *  Flip to true on tool.call, back to false on tool.result. */
  isLoading?: boolean;
  /** Chat messages to display in the chat artifact. */
  chatMessages?: ChatMessage[];
  /** When true shows the thinking indicator in chat. */
  isChatThinking?: boolean;
  /** Summary data for the tour end summary. */
  summaryData?: any;
  /** Callback to switch or open an artifact */
  onSelectArtifact?: (type: ArtifactType, params?: Record<string, any>) => void;
}

export function ArtifactStage({
  artifactType,
  originMapRouteId,
  mapRouteId = "restrooms",
  mapDisplay = "navigation",
  selectedArtwork,
  onSelectArtwork,
  mapNavigation,
  onMapNavigationChange,
  mapViewport,
  onMapViewportChange,
  hotspotId,
  letterId = "letter-782",
  isLoading = false,
  chatMessages = [],
  isChatThinking = false,
  summaryData = null,
  onSelectArtifact,
}: ArtifactStageProps) {
  return (
    <div className="relative w-full h-full overflow-hidden">
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
            {artifactType === "info" && <ArtworkInfoCard {...(selectedArtwork ?? {})} onReturnToMap={selectedArtwork && mapDisplay === "exhibition" ? () => onSelectArtifact?.("map") : undefined} />}
            {artifactType === "map" && (mapDisplay === "exhibition" ? <ExhibitFloorMapView onSelectArtwork={onSelectArtwork} navigationState={mapNavigation} onNavigationStateChange={onMapNavigationChange} initialViewport={mapViewport} onViewportChange={onMapViewportChange} /> : <GalleryMapView originRouteId={originMapRouteId} activeRouteId={mapRouteId} />)}
            {artifactType === "comparison" && <ComparisonView />}
            {artifactType === "timeline" && <TimelineView />}
            {artifactType === "hotspots" && <DetailHotspotsView activeHotspotId={hotspotId} />}
            {artifactType === "quote" && <QuoteView activeLetterId={letterId} />}
            {artifactType === "summary" && <SummaryView data={summaryData} />}
            {artifactType === "chat" && (
              <ChatHistoryView
                messages={chatMessages}
                isThinking={isChatThinking}
                onSelectArtifact={onSelectArtifact as any}
              />
            )}
          </>
        )}
      </div>

    </div>
  );
}