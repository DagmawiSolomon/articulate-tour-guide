"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { HugeIcon } from "@/components/ui/hugeicon";
import ArrowDown01Icon from "@hugeicons/core-free-icons/ArrowDown01Icon";
import Tick02Icon from "@hugeicons/core-free-icons/Tick02Icon";

export const Select = BaseSelect.Root;
export const SelectValue = BaseSelect.Value;
export const SelectPortal = BaseSelect.Portal;
export const SelectItemText = BaseSelect.ItemText;
export const SelectGroup = BaseSelect.Group;

export function SelectTrigger({
  className = "",
  children,
  ...props
}: React.ComponentProps<typeof BaseSelect.Trigger>) {
  return (
    <BaseSelect.Trigger
      className={`inline-flex items-center justify-between gap-2 rounded-full border border-border-subtle bg-subtle px-3 h-8 text-xs font-medium text-primary hover:bg-soft transition-colors cursor-pointer outline-none focus:ring-1 focus:ring-primary ${className}`}
      {...props}
    >
      {children}
      <BaseSelect.Icon className="flex items-center text-secondary">
        <HugeIcon icon={ArrowDown01Icon} size={14} />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export function SelectPositioner({
  className = "",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof BaseSelect.Positioner>) {
  return (
    <BaseSelect.Positioner
      sideOffset={sideOffset}
      className={`z-50 outline-none ${className}`}
      {...props}
    />
  );
}

export function SelectPopup({
  className = "",
  children,
  ...props
}: React.ComponentProps<typeof BaseSelect.Popup>) {
  return (
    <BaseSelect.Popup
      className={`min-w-[160px] rounded-xl border border-border-subtle bg-raised p-1 shadow-md ring-1 ring-border-subtlest transition-all duration-150 outline-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 ${className}`}
      {...props}
    >
      <BaseSelect.List className="outline-none space-y-0.5">
        {children}
      </BaseSelect.List>
    </BaseSelect.Popup>
  );
}

export function SelectItem({
  className = "",
  children,
  ...props
}: React.ComponentProps<typeof BaseSelect.Item>) {
  return (
    <BaseSelect.Item
      className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium font-sans cursor-pointer outline-none transition-colors select-none text-primary hover:bg-soft focus:bg-soft data-[highlighted]:bg-soft ${className}`}
      {...props}
    >
      <span className="flex items-center gap-2">{children}</span>
      <BaseSelect.ItemIndicator className="flex items-center text-primary">
        <HugeIcon icon={Tick02Icon} size={14} />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

export function SelectGroupLabel({
  className = "",
  ...props
}: React.ComponentProps<typeof BaseSelect.GroupLabel>) {
  return (
    <BaseSelect.GroupLabel
      className={`px-2.5 py-1 text-[11px] font-medium text-tertiary uppercase tracking-wider ${className}`}
      {...props}
    />
  );
}

export function SelectSeparator({
  className = "",
  ...props
}: React.ComponentProps<typeof BaseSelect.Separator>) {
  return (
    <BaseSelect.Separator
      className={`my-1 h-px bg-border-subtlest ${className}`}
      {...props}
    />
  );
}
