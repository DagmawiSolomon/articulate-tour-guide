"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";

export const Menu = BaseMenu.Root;
export const MenuTrigger = BaseMenu.Trigger;
export const MenuPortal = BaseMenu.Portal;
export const MenuGroup = BaseMenu.Group;

export function MenuPositioner({
  className = "",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof BaseMenu.Positioner>) {
  return (
    <BaseMenu.Positioner
      sideOffset={sideOffset}
      className={`z-50 outline-none ${className}`}
      {...props}
    />
  );
}

export function MenuPopup({
  className = "",
  children,
  ...props
}: React.ComponentProps<typeof BaseMenu.Popup>) {
  return (
    <BaseMenu.Popup
      className={`min-w-[180px] rounded-xl border border-border-subtle bg-raised p-1 shadow-md ring-1 ring-border-subtlest transition-all duration-150 outline-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 ${className}`}
      {...props}
    >
      {children}
    </BaseMenu.Popup>
  );
}

export function MenuItem({
  className = "",
  destructive = false,
  ...props
}: React.ComponentProps<typeof BaseMenu.Item> & { destructive?: boolean }) {
  return (
    <BaseMenu.Item
      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium font-sans cursor-pointer outline-none transition-colors select-none ${
        destructive
          ? "text-red-600 hover:bg-red-50 focus:bg-red-50"
          : "text-primary hover:bg-soft focus:bg-soft"
      } data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed ${className}`}
      {...props}
    />
  );
}

export function MenuGroupLabel({
  className = "",
  ...props
}: React.ComponentProps<typeof BaseMenu.GroupLabel>) {
  return (
    <BaseMenu.GroupLabel
      className={`px-2.5 py-1 text-[11px] font-medium text-tertiary uppercase tracking-wider ${className}`}
      {...props}
    />
  );
}

export function MenuSeparator({
  className = "",
  ...props
}: React.ComponentProps<typeof BaseMenu.Separator>) {
  return (
    <BaseMenu.Separator
      className={`my-1 h-px bg-border-subtlest ${className}`}
      {...props}
    />
  );
}
