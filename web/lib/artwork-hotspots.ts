import artworkHotspotData from "./artwork-hotspots.json";

export interface ArtworkHotspot {
  id: string;
  name: string;
  tag: string;
  xPercent: number;
  yPercent: number;
  zoomScale: number;
  zoomOrigin: string;
  insight: string;
}

const hotspotsByArtwork = artworkHotspotData as Record<string, ArtworkHotspot[]>;

export function getArtworkHotspots(artworkId: string): ArtworkHotspot[] {
  return hotspotsByArtwork[artworkId] ?? [];
}