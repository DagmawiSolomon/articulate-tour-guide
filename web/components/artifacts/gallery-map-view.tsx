"use client";

import * as React from "react";
import type * as MapLibreGL from "maplibre-gl";
import { MAP_ROUTES, MapRoute } from "@/lib/demo-tour-data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Map, MapMarker, MapControls } from "@/components/ui/map";
import { HugeIcon } from "@/components/ui/hugeicon";
import { Compass01Icon } from "@hugeicons/core-free-icons";

interface GalleryMapViewProps {
  activeRouteId?: "restrooms" | "gauguin" | "elevator";
}

const GALLERY_PINS = [
  { id: "g34", label: "Gallery 34", artist: "Manet / Degas", coords: [-0.018, 0.0025] as [number, number] },
  { id: "g35", label: "Gallery 35", artist: "Monet", coords: [-0.0098, 0.0025] as [number, number] },
  { id: "g36", label: "Gallery 36", artist: "Van Gogh", coords: [-0.003, 0.003] as [number, number], current: true },
  { id: "g37", label: "Gallery 37", artist: "Paul Gauguin", routeId: "gauguin" as const, coords: [0.0095, 0.0025] as [number, number] },
  { id: "g38", label: "Gallery 38", artist: "Cézanne", coords: [0.018, 0.0025] as [number, number] },
];

export function GalleryMapView({ activeRouteId: initialRouteId = "restrooms" }: GalleryMapViewProps) {
  const [selectedRouteId, setSelectedRouteId] = React.useState<"restrooms" | "gauguin" | "elevator" | null>(null);
  const currentRouteId = selectedRouteId ?? initialRouteId;
  const route: MapRoute = MAP_ROUTES[currentRouteId] || MAP_ROUTES.restrooms;

  const mapInstanceRef = React.useRef<MapLibreGL.Map | null>(null);
  const [mapLoaded, setMapLoaded] = React.useState(false);

  // Setup museum floorplan image overlay and GeoJSON route line
  const handleMapReady = React.useCallback((map: MapLibreGL.Map) => {
    mapInstanceRef.current = map;

    // Add Museum Floorplan SVG as an image overlay source
    if (!map.getSource("museum-floorplan")) {
      map.addSource("museum-floorplan", {
        type: "image",
        url: "/museum-floorplan.svg",
        coordinates: [
          [-0.025, 0.020], // top-left
          [0.025, 0.020],  // top-right
          [0.025, -0.020], // bottom-right
          [-0.025, -0.020], // bottom-left
        ],
      });

      map.addLayer({
        id: "museum-floorplan-layer",
        type: "raster",
        source: "museum-floorplan",
        paint: {
          "raster-opacity": 0.98,
          "raster-fade-duration": 200,
        },
      });
    }

    // Add GeoJSON route line source
    if (!map.getSource("route-source") && route.geoPath) {
      map.addSource("route-source", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: route.geoPath,
          },
          properties: {},
        },
      });

      map.addLayer({
        id: "route-glow-layer",
        type: "line",
        source: "route-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#20b8cd",
          "line-width": 7,
          "line-opacity": 0.25,
        },
      });

      map.addLayer({
        id: "route-line-layer",
        type: "line",
        source: "route-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#20b8cd",
          "line-width": 3,
          "line-dasharray": [2, 1.5],
        },
      });
    }

    setMapLoaded(true);
  }, [route.geoPath]);

  // Update route polyline when selected route changes
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !route.geoPath) return;

    const source = map.getSource("route-source") as MapLibreGL.GeoJSONSource | undefined;
    if (source) {
      source.setData({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: route.geoPath,
        },
        properties: {},
      });
    }

    // Subtle pan/fly toward destination
    if (route.geoTarget) {
      map.easeTo({
        center: [
          (route.geoTarget[0] + -0.003) / 2,
          (route.geoTarget[1] + 0.003) / 2,
        ],
        duration: 600,
      });
    }
  }, [currentRouteId, mapLoaded, route.geoPath, route.geoTarget]);

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center overflow-y-auto pr-1">
      {/* Interactive MapLibre / mapcn Vector Stage */}
      <div className="lg:col-span-7 h-full flex flex-col items-center justify-center">
        <div className="relative w-full h-[340px] sm:h-[380px] lg:h-full max-h-[480px] 2xl:max-h-[540px] rounded-xl overflow-hidden border border-border bg-[#090a0c] shadow-xs">
          <Map
            initialCenter={[-0.003, 0.001]}
            initialZoom={14.8}
            initialPitch={0}
            onMapReady={handleMapReady}
            className="w-full h-full"
          >
            {/* Museum Gallery Labels / Pins */}
            {GALLERY_PINS.map((pin) => (
              <MapMarker
                key={pin.id}
                longitude={pin.coords[0]}
                latitude={pin.coords[1]}
                onClick={() => {
                  if (pin.routeId) setSelectedRouteId(pin.routeId);
                }}
              >
                {pin.current ? (
                  /* "You Are Here" Beacon at Gallery 36 */
                  <div className="relative flex flex-col items-center group cursor-pointer -translate-y-1/2">
                    <span className="relative flex size-5 items-center justify-center">
                      <span className="animate-ping absolute inline-flex size-full rounded-full bg-cyan-400 opacity-60" />
                      <span className="relative inline-flex rounded-full size-2.5 bg-cyan-400 ring-2 ring-background shadow-xs" />
                    </span>
                    <span className="mt-1 px-1.5 py-0.5 rounded-sm bg-card/90 border border-cyan-500/40 text-[9px] font-mono font-medium text-cyan-300 backdrop-blur-xs whitespace-nowrap shadow-xs pointer-events-none">
                      You are here
                    </span>
                  </div>
                ) : (
                  /* Subtle interactive gallery marker */
                  <div className="group relative flex flex-col items-center cursor-pointer -translate-y-1/2">
                    <div className="size-2 rounded-full bg-muted-foreground/50 border border-background transition-transform group-hover:scale-125" />
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 px-1.5 py-0.5 rounded-sm bg-card/95 border border-border text-[9px] text-foreground font-sans whitespace-nowrap shadow-md pointer-events-none">
                      {pin.label} · {pin.artist}
                    </div>
                  </div>
                )}
              </MapMarker>
            ))}

            {/* Target Destination Marker */}
            {route.geoTarget && (
              <MapMarker longitude={route.geoTarget[0]} latitude={route.geoTarget[1]}>
                <div className="relative flex flex-col items-center cursor-pointer -translate-y-1/2">
                  <div className="size-5 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-[10px] ring-4 ring-foreground/20 shadow-md">
                    ✓
                  </div>
                  <span className="mt-1 px-1.5 py-0.5 rounded-sm bg-card/90 border border-border text-[9px] font-sans font-medium text-foreground backdrop-blur-xs whitespace-nowrap shadow-xs">
                    {route.label}
                  </span>
                </div>
              </MapMarker>
            )}

            {/* Built-in Floating Navigation Controls (Hugeicons) */}
            <MapControls />
          </Map>
        </div>
      </div>

      {/* Route & Guidance Details */}
      <div className="lg:col-span-5 flex flex-col justify-center">
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 uppercase tracking-wide">
                <HugeIcon icon={Compass01Icon} size={12} strokeWidth={2} />
                Live Wayfinding
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {route.distance} ({route.walkingTime})
              </span>
            </div>

            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
              {route.targetRoom}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Starting from Gallery 36 (The Starry Night)
            </CardDescription>

            {/* Quick destination route switcher pills for testing / demo */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {(["restrooms", "gauguin", "elevator"] as const).map((routeId) => (
                <button
                  key={routeId}
                  type="button"
                  onClick={() => setSelectedRouteId(routeId)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                    currentRouteId === routeId
                      ? "bg-foreground text-background border-foreground font-semibold"
                      : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {MAP_ROUTES[routeId]?.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <ol className="space-y-2 text-xs text-muted-foreground">
              {route.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="shrink-0 size-4 rounded-full bg-muted border border-border flex items-center justify-center font-mono text-[10px] text-foreground font-medium mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
