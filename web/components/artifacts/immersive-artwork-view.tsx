"use client";

import * as React from "react";
import Image from "next/image";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/hugeicon";
import type { ReactNode } from "react";
import type { ExhibitArtworkInfo } from "./exhibit-floor-map-view";
import type { DetailHotspot } from "@/lib/demo-tour-data";

interface ImmersiveArtworkViewProps {
  artwork?: ExhibitArtworkInfo | null;
  hotspots?: DetailHotspot[];
  avatar: ReactNode;
  controls: ReactNode;
  onBackToDetails: () => void;
  onAskAboutDetail: (hotspot: DetailHotspot) => void;
}

type Size = { width: number; height: number };
type Point = { x: number; y: number };

export function ImmersiveArtworkView({ artwork, hotspots = [], avatar, controls, onBackToDetails, onAskAboutDetail }: ImmersiveArtworkViewProps) {
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = React.useState<Size>({ width: 0, height: 0 });
  const [imageSize, setImageSize] = React.useState<Size>({ width: 1, height: 1 });
  const [zoom, setZoom] = React.useState(1);
  const [zoomOrigin, setZoomOrigin] = React.useState<Point>({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [selectedHotspot, setSelectedHotspot] = React.useState<DetailHotspot | null>(null);

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
    setZoom(1);
    setSelectedHotspot(null);
    setIsSelecting(false);
  }, [artwork?.id]);

  const getImagePoint = React.useCallback((hotspot: DetailHotspot): Point => {
    const scale = Math.min(canvasSize.width / imageSize.width, canvasSize.height / imageSize.height);
    const renderedWidth = imageSize.width * scale;
    const renderedHeight = imageSize.height * scale;
    const left = (canvasSize.width - renderedWidth) / 2;
    const top = (canvasSize.height - renderedHeight) / 2;
    return {
      x: left + (hotspot.xPercent / 100) * renderedWidth,
      y: top + (hotspot.yPercent / 100) * renderedHeight,
    };
  }, [canvasSize, imageSize]);

  const zoomBy = (amount: number) => {
    setZoom((current) => Math.min(3, Math.max(1, Number((current + amount).toFixed(2)))));
  };

  const handleHotspotSelect = (hotspot: DetailHotspot) => {
    const point = getImagePoint(hotspot);
    setSelectedHotspot(hotspot);
    setZoomOrigin(point);
    setZoom(Math.max(1.8, Math.min(2.5, hotspot.zoomScale)));
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selectedHotspot) {
          setSelectedHotspot(null);
          setZoom(1);
        } else {
          onBackToDetails();
        }
      } else if (event.key === "+" || event.key === "=") {
        setZoom((current) => Math.min(3, Number((current + 0.25).toFixed(2))));
      } else if (event.key === "-") {
        setZoom((current) => Math.max(1, Number((current - 0.25).toFixed(2))));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvasSize, onBackToDetails, selectedHotspot]);

  if (!artwork) return null;

  const selectedPoint = selectedHotspot ? getImagePoint(selectedHotspot) : null;
  const origin = zoom === 1 ? `${canvasSize.width / 2}px ${canvasSize.height / 2}px` : `${zoomOrigin.x}px ${zoomOrigin.y}px`;

  return (
    <section className="immersive-artwork-view fixed inset-0 z-[40] h-[100dvh] w-screen overflow-hidden" aria-label={`Viewing ${artwork.title}`}>
      <button type="button" onClick={onBackToDetails} className="immersive-artwork-close" aria-label="Close artwork view">
        <HugeIcon icon={Cancel01Icon} size={18} strokeWidth={2} />
      </button>

      <div ref={canvasRef} className="immersive-artwork-canvas">
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

          {isSelecting && hotspots.map((hotspot) => {
            const point = getImagePoint(hotspot);
            const isSelected = selectedHotspot?.id === hotspot.id;
            return (
              <button
                key={hotspot.id}
                type="button"
                className={`immersive-artwork-hotspot${isSelected ? " is-selected" : ""}`}
                style={{ left: point.x, top: point.y }}
                onClick={() => handleHotspotSelect(hotspot)}
                aria-label={`Select ${hotspot.name}`}
                title={hotspot.name}
              >
                <span />
              </button>
            );
          })}
        </div>

        {isSelecting && !selectedHotspot && (
          <p className="immersive-artwork-hint">Select a highlighted detail to ask Alba</p>
        )}

        {selectedHotspot && selectedPoint && (
          <div className="immersive-artwork-detail" role="group" aria-label={`Selected detail: ${selectedHotspot.name}`}>
            <button type="button" className="immersive-artwork-detail-close" onClick={() => { setSelectedHotspot(null); setZoom(1); }} aria-label="Clear selected detail">
              <HugeIcon icon={Cancel01Icon} size={14} />
            </button>
            <p className="text-xs font-semibold text-[#1f1e1b]">{selectedHotspot.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-[#65635d]">{selectedHotspot.insight}</p>
            <button type="button" className="immersive-artwork-ask" onClick={() => onAskAboutDetail(selectedHotspot)}>Ask Alba about this</button>
          </div>
        )}
      </div>

      <div className="immersive-artwork-tools">
        <button type="button" onClick={() => { setIsSelecting((active) => !active); setSelectedHotspot(null); }} aria-pressed={isSelecting} className={`immersive-artwork-select${isSelecting ? " is-active" : ""}`}>
          {isSelecting ? "Cancel selection" : "Select a detail"}
        </button>
        <div className="immersive-artwork-zoom" role="group" aria-label="Artwork zoom controls">
          <button type="button" onClick={() => zoomBy(0.25)} disabled={zoom >= 3} aria-label="Zoom in">+</button>
          <span aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => zoomBy(-0.25)} disabled={zoom <= 1} aria-label="Zoom out">−</button>
          <button type="button" onClick={() => { setZoom(1); setSelectedHotspot(null); }} disabled={zoom === 1} aria-label="Reset zoom">↺</button>
        </div>
      </div>

      <div className="immersive-artwork-shade" aria-hidden="true" />
      <div className="immersive-artwork-avatar">{avatar}</div>
      <div className="immersive-artwork-controls">{controls}</div>
    </section>
  );
}