"use client";

import * as React from "react";

interface BayerDitherBackgroundProps {
  imageSrc: string;
  className?: string;
  /** Color quantization levels per RGB channel (higher = smoother colors with visible dither) */
  levels?: number;
  /** Pixel block size for the dither grid (1 = crisp native resolution, 2 = retro grain) */
  pixelSize?: number;
  /** Intensity of the dither spread */
  spread?: number;
}

// 8x8 Bayer ordered dithering matrix
const BAYER_8X8 = [
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
];

export function BayerDitherBackground({
  imageSrc,
  className = "",
  levels = 28,
  pixelSize = 1,
  spread = 0.95,
}: BayerDitherBackgroundProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // Match canvas resolution to the image natural dimensions
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      canvas.width = width;
      canvas.height = height;

      // Draw original image onto canvas
      ctx.drawImage(img, 0, 0, width, height);

      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      const step = 255 / (levels - 1);

      // Apply Bayer 8x8 ordered dither preserving original RGB color channels
      for (let y = 0; y < height; y++) {
        const bayerY = (y % 8) * 8;
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const bayerVal = BAYER_8X8[bayerY + (x % 8)];
          // Shift threshold from -0.5 to 0.5
          const threshold = (bayerVal / 64 - 0.5) * spread;
          const offset = threshold * step;

          // R
          data[idx] = Math.min(255, Math.max(0, Math.round((data[idx] + offset) / step) * step));
          // G
          data[idx + 1] = Math.min(255, Math.max(0, Math.round((data[idx + 1] + offset) / step) * step));
          // B
          data[idx + 2] = Math.min(255, Math.max(0, Math.round((data[idx + 2] + offset) / step) * step));
          // Alpha remains untouched
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setIsLoaded(true);
    };
  }, [imageSrc, levels, pixelSize, spread]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Crisp fallback while canvas computes */}
      <img
        src={imageSrc}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />
      {/* Bayer Dithered Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          imageRendering: pixelSize > 1 ? "pixelated" : "auto",
        }}
      />
    </div>
  );
}
