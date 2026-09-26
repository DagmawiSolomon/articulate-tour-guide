"use client";

import * as React from "react";
import dynamic from "next/dynamic";

const ImageDithering = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => mod.ImageDithering),
  { ssr: false }
);

interface PaperImageDitherProps {
  imageSrc: string;
  className?: string;
  size?: number;
  colorSteps?: number;
  type?: "8x8" | "4x4" | "2x2";
  fit?: "cover" | "contain" | "none";
}

export function PaperImageDither({
  imageSrc,
  className = "",
  size = 2,
  colorSteps = 5,
  type = "8x8",
  fit = "contain",
}: PaperImageDitherProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const mountedRef = React.useRef(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      Promise.resolve().then(() => setMounted(true));
    }

    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setDimensions({ width: Math.round(clientWidth), height: Math.round(clientHeight) });
        }
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        lineHeight: 0,     /* kill inline whitespace */
        fontSize: 0,       /* belt-and-braces for inline gaps */
      }}
    >
      {mounted && dimensions.width > 0 && dimensions.height > 0 ? (
        <ImageDithering
          width={dimensions.width}
          height={dimensions.height}
          image={imageSrc}
          colorBack="#000000"
          colorFront="#ffffff"
          colorHighlight="#ffffff"
          originalColors
          inverted={false}
          type={type}
          size={size}
          colorSteps={colorSteps}
          fit={fit}
          style={{ display: "block", width: "100%", height: "100%" }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt=""
          aria-hidden="true"
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </div>
  );
}
