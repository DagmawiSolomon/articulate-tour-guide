"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";

export const Popover = BasePopover.Root;
export const PopoverTrigger = BasePopover.Trigger;
export const PopoverPortal = BasePopover.Portal;
export const PopoverClose = BasePopover.Close;

export function PopoverPositioner({
  className = "",
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof BasePopover.Positioner>) {
  return (
    <BasePopover.Positioner
      sideOffset={sideOffset}
      className={`z-50 outline-none ${className}`}
      {...props}
    />
  );
}

export function PopoverPopup({
  className = "",
  children,
  ...props
}: React.ComponentProps<typeof BasePopover.Popup>) {
  return (
    <BasePopover.Popup
      className={`w-72 rounded-2xl border border-border-subtle bg-raised p-4 shadow-lg ring-1 ring-border-subtlest transition-all duration-150 outline-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 ${className}`}
      {...props}
    >
      {children}
    </BasePopover.Popup>
  );
}

export function PopoverArrow({
  className = "",
  ...props
}: React.ComponentProps<typeof BasePopover.Arrow>) {
  return (
    <BasePopover.Arrow
      className={`fill-raised stroke-border-subtle ${className}`}
      {...props}
    />
  );
}
