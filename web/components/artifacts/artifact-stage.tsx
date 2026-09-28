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
import { TURNING_POINTS_ARTWORKS } from "@/lib/turning-points-data";
import { getArtworkHotspots } from "@/lib/artwork-hotspots";

export type ArtifactType =
  | "info"
  | "map"
  | "comparison"
  | "timeline"
  | "hotspots"
  | "chat"
  | "artwork-view";

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
  artworkId?: string;
  comparisonPairId?: string;
  letterId?: "letter-782" | "letter-cypress" | "letter-stars";
  /** When true renders a layout-matched skeleton in place of the real artifact.
   *  Flip to true on tool.call, back to false on tool.result. */
  isLoading?: boolean;
  /** Chat messages to display in the chat artifact. */
  chatMessages?: ChatMessage[];
  /** When true shows the thinking indicator in chat. */
  isChatThinking?: boolean;
  /** Callback to switch or open an artifact */
  onSelectArtifact?: (type: ArtifactType, params?: Record<string, any>) => void;
  showTourActions?: boolean;
  onStartTour?: () => void;
  onViewArtworkFullscreen?: () => void;
  onResetTour?: () => void;
  onEndGalleryTour?: () => void;
  activeTourArtworkId?: string | null;
  completedArtworkIds?: string[];
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
  artworkId,
  comparisonPairId = "comparison-perspective",
  letterId = "letter-782",
  isLoading = false,
  chatMessages = [],
  isChatThinking = false,
  showTourActions = true,
  onSelectArtifact,
  onStartTour,
  onViewArtworkFullscreen,
  onResetTour,
  onEndGalleryTour,
  activeTourArtworkId,
  completedArtworkIds,
}: ArtifactStageProps) {
  // If an artworkId is provided, get its specific hotspot and image info
  const targetArtwork = artworkId ? TURNING_POINTS_ARTWORKS[artworkId] : null;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/*
        key={artifactType} forces React to unmount + remount this div every
        time the artifact changes, which restarts the CSS animation on mount.
        No JS animation library needed — pure CSS @keyframes artifactIn.
      */}
      <div key={artifactType} className="artifact-animate-in w-full h-full">
        {isLoading ? (
          <ArtifactSkeleton
            artifactType={artifactType}
            showTourActions={showTourActions}
          />
        ) : (
          <>
            {artifactType === "info" && (
              <ArtworkInfoCard
                {...(selectedArtwork ?? (targetArtwork ? {
                  title: targetArtwork.title,
                  imageSrc: targetArtwork.imageSrc,
                  summary: targetArtwork.summary,
                  metadata: [
                    { label: "Artist", value: targetArtwork.artist },
                    { label: "Date", value: targetArtwork.year },
                  ],
                } : {}))}
                showTourActions={showTourActions}
                onViewArtworkFullscreen={onViewArtworkFullscreen}
                onEndGalleryTour={onEndGalleryTour}
                onReturnToMap={onSelectArtifact ? () => onSelectArtifact("map") : undefined}
                onStartTour={onStartTour ?? (onSelectArtifact ? () => onSelectArtifact("chat") : undefined)}
              />
            )}
            {artifactType === "map" && (
              mapDisplay === "exhibition" ? (
                <ExhibitFloorMapView
                  onSelectArtwork={onSelectArtwork}
                  navigationState={mapNavigation}
                  onNavigationStateChange={onMapNavigationChange}
                  initialViewport={mapViewport}
                  onViewportChange={onMapViewportChange}
                  activeTourArtworkId={activeTourArtworkId}
                  completedArtworkIds={completedArtworkIds}
                />
              ) : (
                <GalleryMapView originRouteId={originMapRouteId} activeRouteId={mapRouteId} />
              )
            )}
            {artifactType === "timeline" && (
              <TimelineView
                activeArtworkId={targetArtwork?.id || artworkId}
                onSelectMilestone={onSelectArtwork ? (id) => {
                  const art = TURNING_POINTS_ARTWORKS[id];
                  if (art) {
                    onSelectArtwork({
                      id: art.id,
                      title: art.title,
                      imageSrc: art.imageSrc,
                      summary: art.summary,
                      metadata: [
                        { label: "Artist", value: art.artist },
                        { label: "Date", value: art.year },
                      ],
                    });
                  }
                } : undefined}
              />
            )}
            {artifactType === "hotspots" && (
              <DetailHotspotsView
                activeHotspotId={hotspotId}
                imageSrc={targetArtwork?.imageSrc}
                imageAlt={targetArtwork?.title}
                hotspots={getArtworkHotspots(targetArtwork?.id || artworkId || "")}
              />
            )}
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