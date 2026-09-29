"use client";

import * as React from "react";
import Image from "next/image";
import { Cancel01Icon, Pen01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { HugeIcon } from "@/components/ui/hugeicon";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { ReactNode } from "react";
import type { ExhibitArtworkInfo } from "./exhibit-floor-map-view";
import { getArtworkHotspots, type ArtworkHotspot } from "@/lib/artwork-hotspots";
import { playTactileTap } from "@/lib/sounds";

export interface ArtworkSelection {
  centerXPercent: number;
  centerYPercent: number;
  widthPercent: number;
  heightPercent: number;
  path: Array<{ xPercent: number; yPercent: number }>;
}

interface ImmersiveArtworkViewProps {
  artwork?: ExhibitArtworkInfo | null;
  avatar: ReactNode;
  controls: ReactNode;
  onBackToDetails: () => void;
  onAskAboutSelection: (selection: ArtworkSelection) => void;
  activeHotspotId?: string | null;
  onSelectHotspot?: (id: string | null) => void;
  onUiContextChange?: (change: string, interruptSpeech?: boolean) => void;
}

type Size = { width: number; height: number };
type Point = { x: number; y: number };
type ImageBounds = { left: number; top: number; width: number; height: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const DEFAULT_INITIAL_ZOOM = 1.35;

export function ImmersiveArtworkView({
  artwork,
  avatar,
  controls,
  onBackToDetails,
  onAskAboutSelection,
  activeHotspotId,
  onSelectHotspot,
  onUiContextChange,
}: ImmersiveArtworkViewProps) {
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const draftPathRef = React.useRef<Point[]>([]);
  const activePointerIdRef = React.useRef<number | null>(null);
  const [canvasSize, setCanvasSize] = React.useState<Size>({ width: 0, height: 0 });
  const [imageSize, setImageSize] = React.useState<Size>({ width: 1, height: 1 });
  const [zoom, setZoom] = React.useState(DEFAULT_INITIAL_ZOOM);
  const [zoomOrigin, setZoomOrigin] = React.useState<Point>({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [draftPath, setDraftPath] = React.useState<Point[]>([]);
  const [selection, setSelection] = React.useState<ArtworkSelection | null>(null);
  const [selectionPath, setSelectionPath] = React.useState<Point[]>([]);
  const [isPanning, setIsPanning] = React.useState(false);
  const panOriginRef = React.useRef<Point>({ x: 0, y: 0 });
  const zoomOriginStartRef = React.useRef<Point>({ x: 0, y: 0 });

  const [zoomedHotspotId, setZoomedHotspotId] = React.useState<string | null>(activeHotspotId ?? null);
  const [isCardOpen, setIsCardOpen] = React.useState(Boolean(activeHotspotId));

  const hotspots = React.useMemo(() => {
    return artwork?.id ? getArtworkHotspots(artwork.id) : [];
  }, [artwork?.id]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateSize = () => setCanvasSize({ width: canvas.clientWidth, height: canvas.clientHeight });
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    setZoom(DEFAULT_INITIAL_ZOOM);
    setZoomOrigin({ x: 0, y: 0 });
    setImageSize({ width: 1, height: 1 });
    setSelection(null);
    setSelectionPath([]);
    setDraftPath([]);
    setIsDrawing(false);
    setIsPanning(false);
    setZoomedHotspotId(null);
    setIsCardOpen(false);
  }, [artwork?.id]);

  const imageBounds = React.useMemo<ImageBounds>(() => {
    const scale = Math.min(canvasSize.width / imageSize.width, canvasSize.height / imageSize.height);
    const width = imageSize.width * scale;
    const height = imageSize.height * scale;
    return { left: (canvasSize.width - width) / 2, top: (canvasSize.height - height) / 2, width, height };
  }, [canvasSize, imageSize]);

  const zoomBy = React.useCallback((amount: number) => {
    onUiContextChange?.("zoomed the artwork", false);
    setZoomOrigin({ x: canvasSize.width / 2, y: canvasSize.height / 2 });
    setZoom((current) => Math.min(3.5, Math.max(1, Number((current + amount).toFixed(2)))));
  }, [canvasSize, onUiContextChange]);

  const getLayerPoint = React.useCallback((clientX: number, clientY: number): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const origin = (zoomOrigin.x === 0 && zoomOrigin.y === 0)
      ? { x: canvasSize.width / 2, y: canvasSize.height / 2 }
      : zoomOrigin;
    return {
      x: (clientX - rect.left - origin.x) / zoom + origin.x,
      y: (clientY - rect.top - origin.y) / zoom + origin.y,
    };
  }, [canvasSize, zoom, zoomOrigin]);

  const handleSelectHotspot = React.useCallback((id: string) => {
    playTactileTap();
    if (zoomedHotspotId === id) {
      setZoomedHotspotId(null);
      setIsCardOpen(false);
      setZoom(DEFAULT_INITIAL_ZOOM);
      setZoomOrigin({ x: 0, y: 0 });
      onSelectHotspot?.(null);
    } else {
      const target = hotspots.find((h) => h.id.toLowerCase() === id.toLowerCase());
      if (target && imageBounds.width > 0) {
        setZoomedHotspotId(target.id);
        setIsCardOpen(true);
        const targetX = imageBounds.left + (target.xPercent / 100) * imageBounds.width;
        const targetY = imageBounds.top + (target.yPercent / 100) * imageBounds.height;
        setZoomOrigin({ x: targetX, y: targetY });
        setZoom(target.zoomScale || 2.4);
        onSelectHotspot?.(target.id);
      }
    }
  }, [zoomedHotspotId, hotspots, imageBounds, onSelectHotspot]);

  // Sync external activeHotspotId prop (e.g. from Alba show_hotspots tool call)
  React.useEffect(() => {
    if (activeHotspotId && imageBounds.width > 0 && hotspots.length > 0) {
      const target = hotspots.find((h) => h.id.toLowerCase() === activeHotspotId.toLowerCase());
      if (target) {
        setZoomedHotspotId(target.id);
        setIsCardOpen(true);
        const targetX = imageBounds.left + (target.xPercent / 100) * imageBounds.width;
        const targetY = imageBounds.top + (target.yPercent / 100) * imageBounds.height;
        setZoomOrigin({ x: targetX, y: targetY });
        setZoom(target.zoomScale || 2.4);
      }
    } else if (!activeHotspotId) {
      setZoomedHotspotId(null);
      setIsCardOpen(false);
      setZoom(DEFAULT_INITIAL_ZOOM);
      setZoomOrigin({ x: 0, y: 0 });
    }
  }, [activeHotspotId, hotspots, imageBounds]);

  React.useEffect(() => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const finishStroke = (points: Point[]) => {
      if (points.length < 3) return;
      onUiContextChange?.("circled a detail in " + (artwork?.title || "the artwork"), false);
      const xs = points.map((point) => point.x);
      const ys = points.map((point) => point.y);
      const left = Math.min(...xs);
      const top = Math.min(...ys);
      const width = Math.max(Math.max(...xs) - left, 24);
      const height = Math.max(Math.max(...ys) - top, 24);
      setSelectionPath(points);
      setSelection({
        centerXPercent: clamp(((left + width / 2 - imageBounds.left) / imageBounds.width) * 100, 0, 100),
        centerYPercent: clamp(((top + height / 2 - imageBounds.top) / imageBounds.height) * 100, 0, 100),
        widthPercent: clamp((width / imageBounds.width) * 100, 1, 100),
        heightPercent: clamp((height / imageBounds.height) * 100, 1, 100),
        path: points.map((point) => ({
          xPercent: clamp(((point.x - imageBounds.left) / imageBounds.width) * 100, 0, 100),
          yPercent: clamp(((point.y - imageBounds.top) / imageBounds.height) * 100, 0, 100),
        })),
      });
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !imageBounds.width || !imageBounds.height) return;
      if (event.target instanceof Element && event.target.closest(".immersive-artwork-tools, .immersive-artwork-selection-trigger")) return;
      event.preventDefault();
      activePointerIdRef.current = event.pointerId;
      try { canvas.setPointerCapture(event.pointerId); } catch { /* Window listeners also track movement. */ }
      const point = getLayerPoint(event.clientX, event.clientY);
      draftPathRef.current = [point];
      setDraftPath([point]);
      setSelection(null);
      setSelectionPath([]);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (activePointerIdRef.current !== event.pointerId) return;
      const point = getLayerPoint(event.clientX, event.clientY);
      const previous = draftPathRef.current[draftPathRef.current.length - 1];
      if (previous && Math.hypot(point.x - previous.x, point.y - previous.y) < 2) return;
      const nextPath = [...draftPathRef.current, point];
      draftPathRef.current = nextPath;
      setDraftPath(nextPath);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (activePointerIdRef.current !== event.pointerId) return;
      const point = getLayerPoint(event.clientX, event.clientY);
      const previous = draftPathRef.current[draftPathRef.current.length - 1];
      const points = previous && Math.hypot(point.x - previous.x, point.y - previous.y) >= 2
        ? [...draftPathRef.current, point]
        : draftPathRef.current;
      activePointerIdRef.current = null;
      draftPathRef.current = [];
      setDraftPath([]);
      finishStroke(points);
      setIsDrawing(false);
    };

    const onPointerCancel = (event: PointerEvent) => {
      if (activePointerIdRef.current !== event.pointerId) return;
      activePointerIdRef.current = null;
      draftPathRef.current = [];
      setDraftPath([]);
      setIsDrawing(false);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      activePointerIdRef.current = null;
    };
  }, [getLayerPoint, imageBounds, isDrawing, onUiContextChange, artwork?.title]);

  // Pan-to-move: drag the canvas to scroll around when zoomed in and not in drawing mode
  React.useEffect(() => {
    if (isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || zoom <= 1) return;
      if (event.target instanceof Element && event.target.closest(".immersive-artwork-tools, .immersive-artwork-selection-trigger, .immersive-artwork-ask, .immersive-artwork-hotspot-marker, .immersive-artwork-hotspot-card")) return;
      event.preventDefault();
      activePointerIdRef.current = event.pointerId;
      try { canvas.setPointerCapture(event.pointerId); } catch { /* ok */ }
      panOriginRef.current = { x: event.clientX, y: event.clientY };
      zoomOriginStartRef.current = { ...zoomOrigin };
      setIsPanning(true);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (activePointerIdRef.current !== event.pointerId) return;
      const dx = event.clientX - panOriginRef.current.x;
      const dy = event.clientY - panOriginRef.current.y;
      const effectiveStart = (zoomOriginStartRef.current.x === 0 && zoomOriginStartRef.current.y === 0)
        ? { x: canvasSize.width / 2, y: canvasSize.height / 2 }
        : zoomOriginStartRef.current;
      setZoomOrigin({
        x: effectiveStart.x + dx,
        y: effectiveStart.y + dy,
      });
    };

    const onPointerUp = (event: PointerEvent) => {
      if (activePointerIdRef.current !== event.pointerId) return;
      activePointerIdRef.current = null;
      setIsPanning(false);
      onUiContextChange?.("panned the artwork", false);
    };

    const onPointerCancel = (event: PointerEvent) => {
      if (activePointerIdRef.current !== event.pointerId) return;
      activePointerIdRef.current = null;
      setIsPanning(false);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [canvasSize, isDrawing, zoom, zoomOrigin, onUiContextChange]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isDrawing) {
          onUiContextChange?.("cancelled the detail selection", false);
          setIsDrawing(false);
          setDraftPath([]);
        } else if (selection) {
          onUiContextChange?.("cleared the detail selection", false);
          setSelection(null);
          setSelectionPath([]);
          setDraftPath([]);
        } else if (isCardOpen) {
          onUiContextChange?.("dismissed the artwork detail card", false);
          setIsCardOpen(false);
        } else if (zoomedHotspotId) {
          setZoomedHotspotId(null);
          setZoom(DEFAULT_INITIAL_ZOOM);
          setZoomOrigin({ x: 0, y: 0 });
          onSelectHotspot?.(null);
        } else {
          onBackToDetails();
        }
      } else if (event.key === "+" || event.key === "=") {
        zoomBy(0.25);
      } else if (event.key === "-") {
        zoomBy(-0.25);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawing, onBackToDetails, selection, zoomBy, onUiContextChange, isCardOpen, zoomedHotspotId]);

  if (!artwork) return null;

  const origin = (zoomOrigin.x === 0 && zoomOrigin.y === 0)
    ? `${canvasSize.width / 2}px ${canvasSize.height / 2}px`
    : `${zoomOrigin.x}px ${zoomOrigin.y}px`;
  const visiblePath = isDrawing ? draftPath : selectionPath;
  const renderedPath = !isDrawing && visiblePath.length > 2 ? [...visiblePath, visiblePath[0]] : visiblePath;

  return (
    <section className="immersive-artwork-view fixed inset-0 z-[40] h-[100dvh] w-screen overflow-hidden" aria-label={`Viewing ${artwork.title}`}>
      <button
        type="button"
        onClick={onBackToDetails}
        className="immersive-artwork-close"
        aria-label="Close artwork view"
        title="Back to artwork card"
      >
        <HugeIcon icon={Cancel01Icon} size={18} strokeWidth={2} />
      </button>

      <div ref={canvasRef} className={`immersive-artwork-canvas${isDrawing ? " is-drawing" : isPanning ? " is-panning" : ""}`}>
        <div className="immersive-artwork-image-layer" style={{ transform: `scale(${zoom})`, transformOrigin: origin }}>
          <Image
            src={artwork.imageSrc}
            alt={artwork.title}
            fill
            priority
            sizes="100vw"
            className="immersive-artwork-image"
            onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
          />
          {renderedPath.length > 1 && (
            <svg className="immersive-artwork-selection-mark" viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`} preserveAspectRatio="none" aria-hidden="true">
              <polyline points={renderedPath.map(({ x, y }) => `${x},${y}`).join(" ")} />
            </svg>
          )}
          {selection && (
            <HoverCard>
              <HoverCardTrigger
                delay={120}
                closeDelay={260}
                aria-label="Open Ask Alba for the circled detail"
                onPointerDown={(event) => {
                  if (event.pointerType === "touch") event.currentTarget.focus();
                }}
                className="immersive-artwork-selection-trigger"
                style={{
                  left: imageBounds.left + imageBounds.width * selection.centerXPercent / 100,
                  top: imageBounds.top + imageBounds.height * selection.centerYPercent / 100,
                  width: Math.max(48, imageBounds.width * selection.widthPercent / 100),
                  height: Math.max(48, imageBounds.height * selection.heightPercent / 100),
                }}
              />
              <HoverCardContent side="right" align="center" className="w-fit border-0 bg-transparent p-0 shadow-none">
                <button type="button" className="immersive-artwork-ask inline-flex items-center justify-center gap-2" onClick={() => onAskAboutSelection(selection)}>
                  <HugeiconsIcon icon={SparklesIcon} size={15} className="immersive-artwork-ask-icon" />
                  Ask Alba
                </button>
              </HoverCardContent>
            </HoverCard>
          )}

          {/* Hotspot Markers Layer — only displayed when the show_hotspots tool is triggered */}
          {!isDrawing && Boolean(zoomedHotspotId) && imageBounds.width > 0 && hotspots.filter((h) => h.id === zoomedHotspotId).map((hotspot) => {
            const isSelected = true;
            const isCardVisible = isCardOpen;
            const markerX = imageBounds.left + (hotspot.xPercent / 100) * imageBounds.width;
            const markerY = imageBounds.top + (hotspot.yPercent / 100) * imageBounds.height;

            return (
              <div
                key={hotspot.id}
                className="absolute z-30 opacity-100 transition-opacity duration-300 immersive-artwork-hotspot-marker"
                style={{
                  left: `${markerX}px`,
                  top: `${markerY}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Clean solid white dot marker */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectHotspot(hotspot.id);
                  }}
                  aria-label={isSelected ? `Zoom out from ${hotspot.name}` : `Zoom in on ${hotspot.name}`}
                  title={isSelected ? "Click to zoom out" : "Click to zoom in"}
                  style={{
                    transform: `scale(${Math.max(0.65, 1 / zoom)})`,
                  }}
                  className={`relative size-4 sm:size-5 rounded-full bg-white transition-transform duration-200 cursor-pointer shadow-md ${
                    isSelected
                      ? "scale-150 ring-2 ring-white/80 ring-offset-1 ring-offset-black/40"
                      : "hover:scale-125 opacity-90 hover:opacity-100 ring-1 ring-black/20"
                  }`}
                />

                {/* Quadrant-Aware Curatorial Popover Card */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    transform: `scale(${1 / zoom})`,
                    transformOrigin: hotspot.xPercent > 50 ? "right center" : "left center",
                  }}
                  className={`absolute z-40 w-60 sm:w-72 rounded-2xl border border-border bg-card/95 p-3.5 shadow-xl backdrop-blur-md transition-all duration-200 immersive-artwork-hotspot-card before:absolute before:inset-y-0 before:w-4 ${
                    hotspot.xPercent > 50 ? "before:-right-4" : "before:-left-4"
                  } ${
                    isCardVisible
                      ? "pointer-events-auto opacity-100 translate-y-0"
                      : "pointer-events-none opacity-0 translate-y-1"
                  } ${
                    hotspot.xPercent > 50 ? "right-full mr-3" : "left-full ml-3"
                  } ${
                    hotspot.yPercent > 50 ? "bottom-0" : "top-0"
                  }`}
                >
                  {/* Header with Title and optional X button */}
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[13px] font-semibold text-foreground leading-snug">
                      {hotspot.name}
                    </h4>
                    {isSelected && isCardOpen && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playTactileTap();
                          onUiContextChange?.("dismissed the artwork detail card", false);
                          setIsCardOpen(false);
                        }}
                        className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 shrink-0 rounded-md transition-colors"
                        title="Close insight"
                        aria-label="Close insight"
                      >
                        <HugeIcon icon={Cancel01Icon} size={13} />
                      </button>
                    )}
                  </div>

                  <p className="mt-1 text-[11.5px] text-muted-foreground leading-relaxed">
                    {hotspot.insight}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="immersive-artwork-tools" role="group" aria-label="Artwork tools">
          <button
            type="button"
            className={`immersive-artwork-icon-button immersive-artwork-pen${isDrawing ? " is-active" : ""}`}
            aria-label={isDrawing ? "Cancel drawing" : "Circle a detail"}
            aria-pressed={isDrawing}
            title={isDrawing ? "Cancel drawing" : "Circle a detail"}
            onClick={() => { onUiContextChange?.("started or cleared a detail selection", false); setIsDrawing((active) => !active); setDraftPath([]); setSelection(null); setSelectionPath([]); }}
          >
            <HugeiconsIcon icon={Pen01Icon} size={19} strokeWidth={1.8} />
          </button>
          <div className="immersive-artwork-tool-divider" aria-hidden="true" />
          <button type="button" className="immersive-artwork-icon-button" onClick={() => zoomBy(0.25)} disabled={zoom >= 3.5} aria-label="Zoom in" title="Zoom in">+</button>
          <button type="button" className="immersive-artwork-icon-button" onClick={() => zoomBy(-0.25)} disabled={zoom <= 1} aria-label="Zoom out" title="Zoom out">−</button>
        </div>
      </div>
      <div className="immersive-artwork-shade" aria-hidden="true" />
      <div className="immersive-artwork-avatar">{avatar}</div>
      <div className="immersive-artwork-controls">{controls}</div>
    </section>
  );
}
