"use client";

import * as React from "react";
import * as MapLibreGL from "maplibre-gl";
import type { MarkerOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { createPortal } from "react-dom";
import { cn } from "cn";
import { HugeIcon } from "@/components/ui/hugeicon";
import {
  PlusSignIcon,
  MinusSignIcon,
  Compass01Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";

// Configure MapLibre GL v6 Web Worker URL for Next.js bundling compatibility
if (typeof window !== "undefined") {
  MapLibreGL.setWorkerUrl("/maplibre-gl-worker.mjs");
}

// Blank style with transparent background — perfect for indoor floorplan overlays
// Clean museum parchment style — perfect for indoor architectural floorplans
export const blankMapStyle: MapLibreGL.StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#f8f7f2" },
    },
  ],
};

type MapContextValue = {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
};

const MapContext = React.createContext<MapContextValue | null>(null);

export function useMap() {
  const context = React.useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}

export type MapViewport = {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
};

export type MapProps = {
  children?: React.ReactNode;
  className?: string;
  style?: MapLibreGL.StyleSpecification | string;
  initialCenter?: [number, number];
  initialZoom?: number;
  initialPitch?: number;
  initialBearing?: number;
  minZoom?: number;
  maxBounds?: [number, number, number, number];
  onViewportChange?: (viewport: MapViewport) => void;
  onMapReady?: (map: MapLibreGL.Map) => void;
};

export const Map = React.forwardRef<MapLibreGL.Map, MapProps>(function Map(
  {
    children,
    className,
    style = blankMapStyle,
    initialCenter = [0, 0],
    initialZoom = 15,
    initialPitch = 0,
    initialBearing = 0,
    minZoom = 12,
    maxBounds,
    onViewportChange,
    onMapReady,
  },
  ref
) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = React.useState<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useImperativeHandle(ref, () => mapInstance!, [mapInstance]);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: style,
      center: initialCenter,
      zoom: initialZoom,
      pitch: initialPitch,
      bearing: initialBearing,
      maxPitch: 65,
      minZoom,
      maxZoom: 18,
      attributionControl: false,
    });

    if (maxBounds) {
      map.setMaxBounds(maxBounds);
    }

    const loadHandler = () => {
      setIsLoaded(true);
      onMapReady?.(map);
    };

    const moveHandler = () => {
      if (onViewportChange) {
        const center = map.getCenter();
        onViewportChange({
          center: [center.lng, center.lat],
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch(),
        });
      }
    };

    map.on("load", loadHandler);
    map.on("move", moveHandler);
    setMapInstance(map);

    return () => {
      map.off("load", loadHandler);
      map.off("move", moveHandler);
      map.remove();
      setIsLoaded(false);
      setMapInstance(null);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MapContext.Provider value={{ map: mapInstance, isLoaded }}>
      <div ref={containerRef} className={cn("relative w-full h-full select-none overflow-hidden", className)}>
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/60 backdrop-blur-xs z-20">
            <div className="flex gap-1.5 items-center">
              <span className="size-2 rounded-full bg-foreground/50 animate-pulse" />
              <span className="size-2 rounded-full bg-foreground/50 animate-pulse [animation-delay:150ms]" />
              <span className="size-2 rounded-full bg-foreground/50 animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        )}
        {isLoaded && children}
      </div>
    </MapContext.Provider>
  );
});

/* ── Markers ────────────────────────────────────────── */

export interface MapMarkerProps extends Omit<MarkerOptions, "element"> {
  longitude: number;
  latitude: number;
  children?: React.ReactNode;
  onClick?: (e: MouseEvent) => void;
}

export function MapMarker({ longitude, latitude, children, onClick, color = "#1f1e1b", ...options }: MapMarkerProps) {
  const { map } = useMap();
  const [container] = React.useState<HTMLDivElement | null>(() => {
    if (typeof document !== "undefined" && children) {
      return document.createElement("div");
    }
    return null;
  });

  const markerRef = React.useRef<MapLibreGL.Marker | null>(null);

  React.useEffect(() => {
    if (!map) return;

    // If custom children are provided, use container element; otherwise, render the library's built-in marker
    const marker = new MapLibreGL.Marker({
      ...options,
      color,
      ...(container ? { element: container } : {}),
    }).setLngLat([longitude, latitude]);

    marker.addTo(map);
    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [map, container, color]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!container || !onClick) return;
    const handleClick = (e: MouseEvent) => {
      onClick(e);
    };
    container.addEventListener("click", handleClick);
    return () => {
      container.removeEventListener("click", handleClick);
    };
  }, [container, onClick]);

  React.useEffect(() => {
    markerRef.current?.setLngLat([longitude, latitude]);
  }, [longitude, latitude]);

  if (!container || !children) return null;

  return createPortal(children, container);
}

/* ── Library's Standard User Location Indicator ──────── */

export interface MapUserLocationProps {
  longitude: number;
  latitude: number;
}

export function MapUserLocation({ longitude, latitude }: MapUserLocationProps) {
  const { map } = useMap();
  const markerRef = React.useRef<MapLibreGL.Marker | null>(null);

  React.useEffect(() => {
    if (!map) return;

    // Use MapLibre's built-in official user location indicator element
    const el = document.createElement("div");
    el.className = "maplibregl-user-location-dot";

    const marker = new MapLibreGL.Marker({
      element: el,
    }).setLngLat([longitude, latitude]);

    marker.addTo(map);
    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [map]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    markerRef.current?.setLngLat([longitude, latitude]);
  }, [longitude, latitude]);

  return null;
}

/* ── Map Floating Controls ───────────────────────────── */

export function MapControls({ className }: { className?: string }) {
  const { map } = useMap();
  const [is3D, setIs3D] = React.useState(false);

  const handleZoomIn = () => map?.zoomIn({ duration: 300 });
  const handleZoomOut = () => map?.zoomOut({ duration: 300 });
  
  const handleResetBearing = () => {
    map?.easeTo({ bearing: 0, pitch: 0, duration: 400 });
    setIs3D(false);
  };

  const handleToggle3D = () => {
    if (!map) return;
    const nextPitch = is3D ? 0 : 45;
    map.easeTo({ pitch: nextPitch, duration: 500 });
    setIs3D(!is3D);
  };

  return (
    <div
      className={cn(
        "absolute right-3 bottom-3 z-10 flex flex-col items-center gap-1.5 rounded-lg border border-border/60 bg-card/85 p-1 backdrop-blur-md shadow-md",
        className
      )}
    >
      <button
        type="button"
        onClick={handleZoomIn}
        title="Zoom In"
        aria-label="Zoom In"
        className="size-7 rounded-md flex items-center justify-center text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
      >
        <HugeIcon icon={PlusSignIcon} size={15} strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={handleZoomOut}
        title="Zoom Out"
        aria-label="Zoom Out"
        className="size-7 rounded-md flex items-center justify-center text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
      >
        <HugeIcon icon={MinusSignIcon} size={15} strokeWidth={2} />
      </button>

      <div className="w-4 h-px bg-border/60 my-0.5" />

      <button
        type="button"
        onClick={handleToggle3D}
        title={is3D ? "Switch to 2D Top-Down" : "Switch to 3D Isometric Tilt"}
        aria-label="Toggle 3D View"
        className={cn(
          "size-7 rounded-md flex items-center justify-center transition-colors cursor-pointer",
          is3D
            ? "bg-foreground text-background"
            : "text-foreground hover:bg-muted/70"
        )}
      >
        <HugeIcon icon={Layers01Icon} size={14} strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={handleResetBearing}
        title="Reset North & Alignment"
        aria-label="Reset North"
        className="size-7 rounded-md flex items-center justify-center text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
      >
        <HugeIcon icon={Compass01Icon} size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
