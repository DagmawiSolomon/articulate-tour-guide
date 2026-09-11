"use client";

import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

export interface SwitchProps
  extends React.ComponentProps<typeof BaseSwitch.Root> {
  sizeVariant?: "sm" | "md";
}

export function Switch({
  sizeVariant = "md",
  className = "",
  ...props
}: SwitchProps) {
  const rootSizes = {
    sm: "h-4 w-7",
    md: "h-5 w-9",
  };

  const thumbSizes = {
    sm: "size-3 data-[checked]:translate-x-3",
    md: "size-3.5 data-[checked]:translate-x-4",
  };

  return (
    <BaseSwitch.Root
      className={`relative inline-flex shrink-0 cursor-pointer items-center rounded-full bg-soft p-0.5 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-primary data-[checked]:bg-primary ${rootSizes[sizeVariant]} ${className}`}
      {...props}
    >
      <BaseSwitch.Thumb
        className={`pointer-events-none block rounded-full bg-raised shadow-xs transition-transform duration-150 ${thumbSizes[sizeVariant]}`}
      />
    </BaseSwitch.Root>
  );
}
