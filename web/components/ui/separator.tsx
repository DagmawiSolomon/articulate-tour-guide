"use client";

import * as React from "react";
import { Separator as BaseSeparator } from "@base-ui/react/separator";

export interface SeparatorProps
  extends React.ComponentProps<typeof BaseSeparator> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({
  orientation = "horizontal",
  className = "",
  ...props
}: SeparatorProps) {
  const orientationClasses =
    orientation === "vertical"
      ? "h-full w-px bg-border-subtlest"
      : "h-px w-full bg-border-subtlest";

  return (
    <BaseSeparator
      orientation={orientation}
      className={`shrink-0 ${orientationClasses} ${className}`}
      {...props}
    />
  );
}
