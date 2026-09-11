"use client";

import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";

export const Tooltip = BaseTooltip.Root;
export const TooltipTrigger = BaseTooltip.Trigger;
export const TooltipPortal = BaseTooltip.Portal;
export const TooltipProvider = BaseTooltip.Provider;

export function TooltipPositioner({
  className = "",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof BaseTooltip.Positioner>) {
  return (
    <BaseTooltip.Positioner
      sideOffset={sideOffset}
      className={`z-50 outline-none ${className}`}
      {...props}
    />
  );
}

export function TooltipPopup({
  className = "",
  children,
  ...props
}: React.ComponentProps<typeof BaseTooltip.Popup>) {
  return (
    <BaseTooltip.Popup
      className={`rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-inverse shadow-md transition-all duration-150 select-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 ${className}`}
      {...props}
    >
      {children}
    </BaseTooltip.Popup>
  );
}

export function TooltipArrow({
  className = "",
  ...props
}: React.ComponentProps<typeof BaseTooltip.Arrow>) {
  return (
    <BaseTooltip.Arrow
      className={`fill-primary ${className}`}
      {...props}
    />
  );
}
