"use client";

import * as React from "react";
import type * as MapLibreGL from "maplibre-gl";
import { MAP_ROUTES, MapRoute, getDynamicRoute } from "@/lib/demo-tour-data";
import { Map, MapMarker, MapControls } from "@/components/ui/map";
import { HugeIcon } from "@/components/ui/hugeicon";
import { WomanIcon } from "@hugeicons/core-free-icons";

interface GalleryMapViewProps {
  originRouteId?: string;
  activeRouteId?: "restrooms" | "gauguin" | "elevator" | "garden" | "store" | string;
}

export function GalleryMapView({ originRouteId = "gallery36", activeRouteId = "restrooms" }: GalleryMapViewProps) {
  const route: MapRoute = MAP_ROUTES[activeRouteId] || MAP_ROUTES.restrooms;
  const dynamicGeoPath = getDynamicRoute(originRouteId, activeRouteId);

  const mapInstanceRef = React.useRef<MapLibreGL.Map | null>(null);
  const [mapLoaded, setMapLoaded] = React.useState(false);


  // Helper to ensure route GeoJSON source and layers exist and are placed on top of raster
  const ensureRouteLayers = React.useCallback((map: MapLibreGL.Map, initialCoords: [number, number][]) => {
    if (!map.getSource("route-source")) {
      map.addSource("route-source", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: initialCoords,
          },
          properties: {},
        },
      });

      // Path casing (dark blue outer edge for Mapbox Navigation style)
      map.addLayer({
        id: "route-glow-layer",
        type: "line",
        source: "route-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#1d4ed8",
          "line-width": 8,
          "line-opacity": 1,
        },
      });

      // Solid blue navigation line
      map.addLayer({
        id: "route-line-layer",
        type: "line",
        source: "route-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3b82f6",
          "line-width": 4,
        },
      });
    }

    // Always bring route layers to the front over the raster floor plan
    if (map.getLayer("route-glow-layer")) map.moveLayer("route-glow-layer");
    if (map.getLayer("route-line-layer")) map.moveLayer("route-line-layer");
  }, []);

  // Setup MoMA Floor 1 rasterized SVG overlay and GeoJSON wayfinding route
  const handleMapReady = React.useCallback((map: MapLibreGL.Map) => {
    mapInstanceRef.current = map;
    if (typeof window !== "undefined") {
      (window as any).__map = map;
    }

    // Load /moma-floorplan.svg, rasterize onto canvas for WebGL texture support
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1840;
      canvas.height = 900;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 1840, 900);
      const dataUrl = canvas.toDataURL("image/png");

      if (!map.getSource("moma-floorplan-img")) {
        map.addSource("moma-floorplan-img", {
          type: "image",
          url: dataUrl,
          coordinates: [
            [-0.016, 0.0078],  // top-left
            [0.016, 0.0078],   // top-right
            [0.016, -0.0078],  // bottom-right
            [-0.016, -0.0078], // bottom-left
          ],
        });

        // Insert the raster floor plan UNDER the route layers
        const firstRouteLayer = map.getLayer("route-glow-layer") ? "route-glow-layer" : undefined;

        map.addLayer({
          id: "moma-floorplan-raster",
          type: "raster",
          source: "moma-floorplan-img",
          paint: {
            "raster-opacity": 1,
            "raster-fade-duration": 0,
          },
        }, firstRouteLayer);

        // Guarantee route layers stay on top
        if (map.getLayer("route-glow-layer")) map.moveLayer("route-glow-layer");
        if (map.getLayer("route-line-layer")) map.moveLayer("route-line-layer");
      }
    };
    img.src = "/moma-floorplan.svg";

    if (dynamicGeoPath) {
      ensureRouteLayers(map, dynamicGeoPath);
    }

    setMapLoaded(true);
  }, [ensureRouteLayers, dynamicGeoPath]);

// Helper to calculate partial LineString coordinates along a polyline at a given distance
function getSubPath(path: [number, number][], targetDist: number): [number, number][] {
  if (path.length < 2) return path;
  if (targetDist <= 0) {
    const p0 = path[0];
    const p1 = path[1];
    return [p0, [p0[0] + (p1[0] - p0[0]) * 0.001, p0[1] + (p1[1] - p0[1]) * 0.001]];
  }

  const sub: [number, number][] = [path[0]];
  let walked = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);

    if (walked + len >= targetDist) {
      const frac = len > 0 ? (targetDist - walked) / len : 0;
      sub.push([
        p1[0] + frac * (p2[0] - p1[0]),
        p1[1] + frac * (p2[1] - p1[1]),
      ]);
      return sub;
    } else {
      sub.push(p2);
      walked += len;
    }
  }

  return path;
}

// Update route polyline, camera, and progressive line drawing animation
React.useEffect(() => {
    const map = mapInstanceRef.current;
    const path = dynamicGeoPath;
    if (!map || !mapLoaded || !path || path.length < 2) return;

    ensureRouteLayers(map, path);

    const source = map.getSource("route-source") as MapLibreGL.GeoJSONSource | undefined;
    if (!source) return;

    // Re-center camera on the start node so it's always in the middle of the panel
    // Slight delay so the line animation starts first, then camera eases in
    const cameraTimer = setTimeout(() => {
      map.easeTo({
        center: path[0] as [number, number],
        zoom: 14.6,
        duration: 700,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });
    }, 150);

    // Precalculate corridor segment lengths
    let totalLength = 0;
    for (let i = 0; i < path.length - 1; i++) {
      totalLength += Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]);
    }

    if (totalLength === 0) return;

    // Phase 1: Progressive line reveal
    let startTime: number | null = null;
    let animFrameId: number;
    const duration = 1200; // 1.2 seconds to draw

    const animateLine = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // smooth easeOut cubic
      const eased = 1 - Math.pow(1 - progress, 3); 
      const subCoords = getSubPath(path, eased * totalLength);
      
      source.setData({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: subCoords,
        },
        properties: {},
      });

      if (progress < 1) {
        animFrameId = requestAnimationFrame(animateLine);
      }
    };

    animFrameId = requestAnimationFrame(animateLine);

    return () => {
      clearTimeout(cameraTimer);
      cancelAnimationFrame(animFrameId);
    };
  }, [ensureRouteLayers, mapLoaded, dynamicGeoPath]);

  // Floorplan image bounds: [-0.016, -0.0078] → [0.016, 0.0078]
  // Add a tiny buffer so the edge rooms don't get clipped at the panel edges
  const FLOORPLAN_BOUNDS: [number, number, number, number] = [-0.017, -0.009, 0.017, 0.009];

  return (
    <div className="w-full h-full relative select-none rounded-2xl overflow-hidden">
      <Map
        initialCenter={[-0.0028, -0.0066]}
        initialZoom={14.6}
        initialPitch={0}
        minZoom={14.4}
        maxBounds={FLOORPLAN_BOUNDS}
        onMapReady={handleMapReady}
        className="w-full h-full"
      >
        {/* User Location Indicator */}
        {dynamicGeoPath && dynamicGeoPath.length > 0 && (
          <MapMarker longitude={dynamicGeoPath[0][0]} latitude={dynamicGeoPath[0][1]}>
            <div className="size-3.5 rounded-full bg-blue-500 border-[2.5px] border-white shadow-sm" />
          </MapMarker>
        )}


        {/* Built-in Floating Navigation Controls from mapcn */}
        <MapControls className="right-4 bottom-4 md:right-5 md:bottom-5" />
      </Map>
    </div>
  );
}



