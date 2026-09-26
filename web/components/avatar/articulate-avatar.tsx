"use client";

import * as React from "react";
import { Blobatar } from "blobatar/react";
import { type Expression } from "blobatar/expression";
import {
  EXPRESSIONS_CATALOG,
  type ExpressionId,
} from "./avatar-expressions";

export interface HatPlacement {
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
}

export interface ArticulateAvatarProps {
  /** Current active conversational expression */
  expressionId: ExpressionId;
  /** Custom Blobatar expression object (if overriding catalog) */
  customExpression?: Expression;
  /** Pixel size when in full display mode (default: 220) */
  size?: number;
  /** Whether the avatar is docked to the top-left card view */
  isDocked?: boolean;
  /** Click handler (e.g. to toggle docking view) */
  onClick?: () => void;
  /** Whether conversational state is currently listening (triggers eye flutter blink) */
  isListening?: boolean;
  /** Whether the microphone is muted (triggers subtle attentive head tilt) */
  isMuted?: boolean;
  /** Custom class names for the outer wrapper */
  className?: string;
  /** Optional blob shape trait override (default: 0.11 for round) */
  shape?: number;
  /** Optional blob seed name (default: "Articulate") */
  seedName?: string;
  /** Whether the avatar wears the docent bucket hat (default: true) */
  hasHat?: boolean;
  /** Custom placement offset, scale, and rotation for the hat */
  hatPlacement?: HatPlacement;
}

export function DocentBucketHat({ className }: { className?: string }) {
  return (
    <g className={className}>
      {/* Bucket hat crown */}
      <path
        d="M38 18 Q70 6 102 18 L108 55 Q70 66 32 55 Z"
        fill="#D8C2A5"
      />

      {/* Crown lower band */}
      <path
        d="M32 47 Q70 58 108 47 L110 61 Q70 73 30 61 Z"
        fill="#C9AF91"
      />

      {/* Wide bucket brim */}
      <path
        d="M30 57 Q70 67 110 57 Q127 61 130 70 Q70 91 10 70 Q13 61 30 57 Z"
        fill="#D8C2A5"
      />

      {/* Subtle brim detail */}
      <path
        d="M13 69 Q70 87 127 69"
        fill="none"
        stroke="#B99E7F"
        strokeWidth={2}
      />
    </g>
  );
}

export function ArticulateAvatar({
  expressionId,
  customExpression,
  size = 220,
  isDocked = false,
  onClick,
  isListening = false,
  isMuted = false,
  className,
  shape = 0.11,
  seedName = "Articulate",
  hasHat = true,
  hatPlacement,
}: ArticulateAvatarProps) {
  const currentConfig =
    EXPRESSIONS_CATALOG.find((e) => e.id === expressionId) ??
    EXPRESSIONS_CATALOG[0];

  const resolvedExpression = customExpression ?? currentConfig.expression;
  const isShy = expressionId === "shy";
  const currentSize = isDocked ? 64 : size;

  const {
    x: hatX = 3.5,
    y: hatY = -17,
    scale: hatScale = 0.65,
    rotate: hatRotate = -2,
  } = hatPlacement ?? {};

  return (
    <div
      onClick={onClick}
      title={isDocked ? "Click to switch to center view" : "Click to switch to cards view"}
      className={
        className ??
        `cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 flex items-center justify-center hover:scale-105 active:scale-95 relative ${
          isDocked ? "size-16 shrink-0" : ""
        }`
      }
    >
      {/* Main Avatar Container */}
      <div
        className={`relative rounded-full flex items-center justify-center ${
          isListening ? "avatar-listening" : ""
        } ${isMuted ? "avatar-muted" : ""}`}
        style={{ width: currentSize, height: currentSize }}
      >
        {/* Layer 1: Base Blobatar */}
        <div className="absolute inset-0">
          <Blobatar
            name={seedName}
            size={currentSize}
            animate="always"
            expression={resolvedExpression}
            traits={{ shape }}
          />
        </div>

        {/* Layer 2: Precision SVG Overlay for Docent Bucket Hat & Blush */}
        <svg
          viewBox="0 0 100 100"
          width={currentSize}
          height={currentSize}
          className="absolute inset-0 pointer-events-none z-10 overflow-visible"
          aria-hidden="true"
        >
          {/* Docent Bucket Hat positioned over round head */}
          {hasHat && (
            <g
              transform={`translate(${hatX}, ${hatY}) scale(${hatScale}) rotate(${hatRotate}, 70, 50)`}
            >
              <DocentBucketHat />
            </g>
          )}

          {/* Shy Blushing: Fades in smoothly as the eyes move into the shy expression */}
          <g
            className={`transition-opacity ease-out duration-700 ${
              isShy && shape >= 0.98 ? "opacity-100 delay-150" : "opacity-0 pointer-events-none duration-300"
            }`}
          >
            <defs>
              <linearGradient id="blush-shy-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                {/* Lighter, softer pastel pink towards the tip */}
                <stop offset="12%" stopColor="#ffa6be" stopOpacity="0.65" />
                <stop offset="25%" stopColor="#ffb8cb" stopOpacity="0.45" />
                <stop offset="38%" stopColor="#ffd1dd" stopOpacity="0.2" />
                {/* Fading down to super light at 2/3 of the guy */}
                <stop offset="52%" stopColor="#ffeef4" stopOpacity="0" />
                <stop offset="100%" stopColor="#ffeef4" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              d="M41.08 25.86Q48.92 12.02 57.11 25.66L75.21 55.84Q83.4 69.48 67.38 69.68L31.93 70.12Q15.91 70.32 23.75 56.48L41.08 25.86Z"
              fill="url(#blush-shy-gradient)"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
