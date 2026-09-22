"use client";

import * as React from "react";
import { ArtworkInfoCard } from "./artwork-info-card";
import { GalleryMapView } from "./gallery-map-view";
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
  mapRouteId?: "restrooms" | "gauguin" | "elevator" | "garden" | "store" | string;
  hotspotId?: "cypress" | "star" | "steeple" | "vortex" | "moon" | string;
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
}

export function ArtifactStage({
  artifactType,
  mapRouteId = "restrooms",
  hotspotId,
  letterId = "letter-782",
  isLoading = false,
  chatMessages = [],
  isChatThinking = false,
  onSelectArtifact,
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
            {artifactType === "quote" && <QuoteView activeLetterId={letterId} />}
            {artifactType === "summary" && <SummaryView />}
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

