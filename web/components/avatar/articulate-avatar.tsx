"use client";

import * as React from "react";
import { Blobatar } from "blobatar/react";
import { type Expression } from "blobatar/expression";
import {
  EXPRESSIONS_CATALOG,
  type ExpressionId,
} from "./avatar-expressions";

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
}: ArticulateAvatarProps) {
  const currentConfig =
    EXPRESSIONS_CATALOG.find((e) => e.id === expressionId) ??
    EXPRESSIONS_CATALOG[0];

  const resolvedExpression = customExpression ?? currentConfig.expression;
  const isShy = expressionId === "shy";
  const currentSize = isDocked ? 64 : size;

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
      {/* Main Avatar Container: Triangle body stays 100% constant and identical across all emotions */}
      <div
        className={`relative rounded-full flex items-center justify-center ${
          isListening ? "avatar-listening" : ""
        } ${isMuted ? "avatar-muted" : ""}`}
        style={{ width: currentSize, height: currentSize }}
      >
        {/* Layer 1: Base Blobatar (Locked to Mr. Triangle: shape 0.99) */}
        <div className="absolute inset-0">
          <Blobatar
            name="Articulate"
            size={currentSize}
            animate="always"
            expression={resolvedExpression}
            traits={{ shape: 0.99 }}
          />
        </div>

        {/* Layer 2: Precision SVG Overlay for Tip Blush */}
        <svg
          viewBox="0 0 100 100"
          width={currentSize}
          height={currentSize}
          className="absolute inset-0 pointer-events-none z-10"
          aria-hidden="true"
        >
          {/* Shy Blushing: Fades in smoothly as the eyes move into the shy expression */}
          <g
            className={`transition-opacity ease-out duration-700 ${
              isShy ? "opacity-100 delay-150" : "opacity-0 pointer-events-none duration-300"
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
